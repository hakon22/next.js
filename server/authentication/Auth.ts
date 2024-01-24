/* eslint-disable import/no-anonymous-default-export */
/* eslint-disable consistent-return */
/* eslint-disable class-methods-use-this */
/* eslint-disable camelcase */
import bcrypt from 'bcryptjs';
import { Op } from 'sequelize';
import { Request, Response } from 'express';
import passGen from 'generate-password';
import { jwtDecode } from 'jwt-decode';
import { codeGen } from '../activation/Activation.js';
import Users, { PassportRequest } from '../db/tables/Users.js';
import { sendMailActivationAccount, sendMailRecoveryPass, sendMailGoogleAuth } from '../mail/sendMail.js';
import { generateAccessToken, generateRefreshToken } from './tokensGen.js';

const adminEmail = ['hakon1@mail.ru'];

type DecodeToken = {
  email: string;
  given_name: string;
  family_name: string;
};

class Auth {
  async signup(req: Request, res: Response) {
    try {
      const {
        username, phone, password, email,
      } = req.body;
      const candidates = await Users.findAll({ where: { [Op.or]: [{ email }, { phone }] } });
      if (candidates.length > 0) {
        const errorsFields = candidates.reduce((acc: ('email' | 'phone')[], candidate) => {
          if (candidate.email === email) {
            acc.push('email');
          }
          if (candidate.phone === phone) {
            acc.push('phone');
          }
          return acc;
        }, []);
        return res.json({ code: 2, errorsFields });
      }
      const role = adminEmail.includes(email) ? 'admin' : 'member';
      const hashPassword = bcrypt.hashSync(password, 10);
      const code_activation = codeGen();
      const user = await Users.create({
        username,
        phone,
        password: hashPassword,
        role,
        email,
        code_activation,
        addresses: {
          addressList: [],
          currentAddress: -1,
        },
        orders: [],
      });
      const { id } = user;
      await sendMailActivationAccount(id, username, email, code_activation);
      setTimeout(async () => {
        const account = await Users.findOne({
          attributes: ['code_activation'],
          where: { id },
        });
        if (account?.code_activation) {
          await Users.destroy({ where: { id } });
        }
      }, 86400000);
      res.json({ code: 1, id });
    } catch (e) {
      console.log(e);
      res.sendStatus(500);
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { phone, password } = req.body;
      const user = await Users.findOne({ where: { phone } });
      if (!user) {
        return res.json({ code: 4 });
      }
      const isValidPassword = bcrypt.compareSync(password, user.password);
      if (!isValidPassword) {
        return res.json({ code: 3 });
      }
      if (user.code_activation) {
        return res.json({ code: 2 });
      }
      const token = generateAccessToken(user.id ?? 0, user.email);
      const refreshToken = generateRefreshToken(user.id ?? 0, user.email);
      const {
        id, username, email, role, addresses, orders,
      } = user;
      if (!user.refresh_token) {
        await Users.update({ refresh_token: [refreshToken] }, { where: { email } });
      } else if (user.refresh_token.length < 4) {
        user.refresh_token.push(refreshToken);
        await Users.update({ refresh_token: user.refresh_token }, { where: { email } });
      } else {
        await Users.update({ refresh_token: [refreshToken] }, { where: { email } });
      }
      res.status(200).send({
        code: 1,
        user: {
          token, refreshToken, username, role, id, email, phone, addresses, orders,
        },
      });
    } catch (e) {
      console.log(e);
      res.sendStatus(500);
    }
  }

  async updateTokens(req: Request, res: Response) {
    try {
      const {
        dataValues: {
          id, username, refresh_token, email, phone, role, addresses, orders,
        }, token, refreshToken,
      } = req.user as PassportRequest;
      const oldRefreshToken = req.get('Authorization')?.split(' ')[1];
      const availabilityRefresh = refresh_token?.find((key: string) => key === oldRefreshToken);
      if (availabilityRefresh) {
        const newRefreshTokens = refresh_token?.filter((key: string) => key !== oldRefreshToken);
        newRefreshTokens?.push(refreshToken);
        await Users.update({ refresh_token: newRefreshTokens }, { where: { id } });
      } else {
        throw new Error('Ошибка доступа');
      }
      res.status(200).send({
        code: 1,
        user: {
          id, username, token, refreshToken, email, role, phone, addresses, orders,
        },
      });
    } catch (e) {
      console.log(e);
      res.sendStatus(401);
    }
  }

  async logout(req: Request, res: Response) {
    try {
      const { id, refreshToken } = req.body;
      const user = await Users.findOne({
        attributes: ['refresh_token'],
        where: { id },
      });
      if (user) {
        if (user.refresh_token) {
          const refreshTokens = user.refresh_token.filter((token) => token !== refreshToken);
          const newRefreshTokens = refreshTokens.length > 0 ? refreshTokens : null;
          await Users.update({ refresh_token: newRefreshTokens }, { where: { id } });
          res.status(200).json({ status: 'Tokens has been deleted' });
        } else {
          throw new Error();
        }
      }
    } catch (e) {
      console.log(e);
      res.sendStatus(500);
    }
  }

  async recoveryPassword(req: Request, res: Response) {
    try {
      const values = req.body;
      const user = await Users.findOne({
        attributes: ['username', 'email'],
        where: { email: values.email },
      });
      if (!user) {
        return res.status(200).json({ code: 2 });
      }
      const { username, email } = user;
      const password = passGen.generate({
        length: 7,
        numbers: true,
      });
      const hashPassword = bcrypt.hashSync(password, 10);
      await Users.update({ password: hashPassword }, { where: { email } });
      await sendMailRecoveryPass(username, email, password);
      res.status(200).json({ code: 1 });
    } catch (e) {
      console.log(e);
      res.sendStatus(500);
    }
  }

  async googleAuth(req: Request, res: Response) {
    try {
      const googleToken = req.headers.authorization;
      const decodeToken: DecodeToken = jwtDecode(googleToken ?? '');
      const { email, given_name, family_name } = decodeToken;
      const candidate = await Users.findOne({ where: { email } });
      if (candidate && candidate.refresh_token) {
        const token = generateAccessToken(candidate.id ?? 0, email);
        const refreshToken = generateRefreshToken(candidate.id ?? 0, email);
        if (candidate.refresh_token.length < 4) {
          candidate.refresh_token.push(refreshToken);
          await Users.update({ refresh_token: candidate.refresh_token }, { where: { email } });
        } else {
          await Users.update({ refresh_token: [refreshToken] }, { where: { email } });
        }
        const {
          id, username, phone, role, addresses, orders,
        } = candidate;
        res.status(200).send({
          code: 1,
          user: {
            token, refreshToken, username, role, id, email, phone, addresses, orders,
          },
        });
      } else {
        const role = adminEmail.includes(email) ? 'admin' : 'member';
        const password = passGen.generate({
          length: 7,
          numbers: true,
        });
        const hashPassword = bcrypt.hashSync(password, 10);
        const user = await Users.create({
          username: `${given_name} ${family_name}`,
          phone: email,
          password: hashPassword,
          role,
          email,
          addresses: {
            addressList: [],
            currentAddress: -1,
          },
          orders: [],
        });
        const {
          id, username, phone, addresses, orders,
        } = user;
        const token = generateAccessToken(id ?? 0, email);
        const refreshToken = generateRefreshToken(id ?? 0, email);
        await Users.update({ refresh_token: [refreshToken] }, { where: { email } });
        await sendMailGoogleAuth(username, email, password);
        res.status(200).send({
          code: 1,
          user: {
            token, refreshToken, username, role, id, email, phone, addresses, orders,
          },
        });
      }
    } catch (e) {
      console.log(e);
      res.sendStatus(500);
    }
  }
}

export default new Auth();
