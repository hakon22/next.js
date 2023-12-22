/* eslint-disable max-len */
/* eslint-disable import/no-anonymous-default-export */
/* eslint-disable consistent-return */
/* eslint-disable class-methods-use-this */
/* eslint-disable camelcase */
import { getDigitalCode } from 'node-verification-code';
import { Request, Response } from 'express';
import Users from '../db/tables/Users.js';
import { sendMailActivationAccount } from '../mail/sendMail.js';
import { generateRefreshToken } from '../authentication/tokensGen.js';

export const codeGen = () => getDigitalCode(4).toString();

class Activation {
  async needsActivation(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = await Users.findOne({
        attributes: ['email', 'code_activation'],
        where: { id },
      });
      if (user) {
        if (user.code_activation) {
          const { email } = user;
          return res.status(200).send(email);
        }
      }
      res.status(200).send(false);
    } catch (e) {
      console.log(e);
      res.sendStatus(500);
    }
  }

  async activation(req: Request, res: Response) {
    try {
      const { id, code } = req.body;
      const user = await Users.findOne({
        attributes: ['email', 'code_activation'],
        where: { id },
      });
      if (user?.code_activation) {
        const { email } = user;
        if (user.code_activation === code) {
          const refreshToken = generateRefreshToken(id, email);
          await Users.update({ refresh_token: [refreshToken], code_activation: null }, { where: { id } });
          res.status(200).send({ code: 1, refreshToken });
        } else {
          res.status(200).send({ code: 2 });
        }
      } else {
        res.status(200).send(false);
      }
    } catch (e) {
      console.log(e);
      res.sendStatus(500);
    }
  }

  async repeatEmail(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = await Users.findOne({
        attributes: ['username', 'email', 'code_activation'],
        where: { id },
      });
      if (user?.code_activation) {
        const { username, email } = user;
        const newCode = codeGen();
        await Users.update({ code_activation: newCode }, { where: { id } });
        await sendMailActivationAccount(Number(id), username, email, newCode);
        res.status(200).send(true);
      } else {
        res.status(200).send(false);
      }
    } catch (e) {
      console.log(e);
      res.sendStatus(500);
    }
  }

  async changeEmail(req: Request, res: Response) {
    try {
      const { id, email } = req.body;
      const users = await Users.findAll({
        attributes: ['id', 'username', 'email', 'code_activation'],
      });
      const user = users.find((account) => account.id === Number(id));
      if (user?.code_activation) {
        const emails = users.map((account) => account.email);
        if (!emails.includes(email)) {
          const newCode = codeGen();
          const { username } = user;
          await Users.update({ email, code_activation: newCode }, { where: { id } });
          await sendMailActivationAccount(id, username, email, newCode);
          res.status(200).send({ code: 1 });
        } else {
          res.status(200).send({ code: 2 });
        }
      } else {
        res.status(200).send(false);
      }
    } catch (e) {
      console.log(e);
      res.sendStatus(500);
    }
  }
}

export default new Activation();
