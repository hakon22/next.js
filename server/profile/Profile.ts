/* eslint-disable import/no-anonymous-default-export */
/* eslint-disable consistent-return */
/* eslint-disable class-methods-use-this */
/* eslint-disable camelcase */
import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { codeGen } from '../activation/Activation.js';
import { sendMailChangeEmail } from '../mail/sendMail.js';
import Users, { PassportRequest } from '../db/tables/Users.js';

type ChangeDataValues = {
  username?: string;
  email?: string;
  phone?: string;
  password?: string;
  oldPassword?: string;
};

type ConfirmEmailValues = {
  code?: number;
} & ChangeDataValues;

class Profile {
  async confirmEmail(req: Request, res: Response) {
    try {
      const {
        dataValues: {
          id, username, password, change_email_code,
        },
      } = req.user as PassportRequest;
      const values: ConfirmEmailValues = req.body;
      const {
        email, code, phone, oldPassword,
      } = values;
      if (code) {
        if (Number(code) === change_email_code) {
          await Users.update({ change_email_code: undefined }, { where: { id } });
          return res.send({ code: 1 });
        }
        return res.send({ code: 2 });
      }
      if (email) {
        if (oldPassword) {
          const isValidPassword = bcrypt.compareSync(oldPassword, password);
          if (!isValidPassword) {
            return res.json({ code: 3 }); // старый пароль не совпадает
          }
        }
        const users = await Users.findAll({ where: { [Op.or]: [{ email: email || '' }, { phone: phone || '' }] } });
        if (users.length > 0) {
          const errorsFields = users.reduce((acc: ('email' | 'phone')[], user) => {
            if (user.email === email) {
              acc.push('email');
            }
            if (user.phone === phone) {
              acc.push('phone');
            }
            return acc;
          }, []);
          return res.json({ code: 4, errorsFields }); // есть существующие пользователи
        }
        const newCode = codeGen();
        await Users.update({ change_email_code: newCode }, { where: { id } });
        await sendMailChangeEmail(username, email, newCode);
        return res.json({ code: 5 });
      }
    } catch (e) {
      console.log(e);
      res.sendStatus(500);
    }
  }

  async changeData(req: Request, res: Response) {
    try {
      const { dataValues: { id, password } } = req.user as PassportRequest;
      const values: ChangeDataValues = req.body;
      const { email, phone, oldPassword } = values;
      if (oldPassword) {
        const isValidPassword = bcrypt.compareSync(oldPassword, password);
        if (!isValidPassword) {
          return res.json({ code: 3 }); // старый пароль не совпадает
        }
      }
      if (email || phone) {
        const users = await Users.findAll({ where: { [Op.or]: [{ email: email || '' }, { phone: phone || '' }] } });
        if (users.length > 0) {
          const errorsFields = users.reduce((acc: ('email' | 'phone')[], user) => {
            if (user.email === email) {
              acc.push('email');
            }
            if (user.phone === phone) {
              acc.push('phone');
            }
            return acc;
          }, []);
          return res.json({ code: 2, errorsFields }); // есть существующие пользователи
        }
      }
      const initialObject: ChangeDataValues = {};
      // пересобираем объект с данными для дальнейшего обновления
      const newDataValues = Object.entries(values).reduce((acc, [key, value]) => {
        if (key === 'oldPassword') {
          return acc;
        }
        if (key === 'password') {
          const hashPassword = bcrypt.hashSync(value, 10);
          return { ...acc, password: hashPassword };
        }
        return { ...acc, [key]: value };
      }, initialObject);

      await Users.update(newDataValues, { where: { id } });
      res.json({ code: 1, newDataValues });
    } catch (e) {
      console.log(e);
      res.sendStatus(500);
    }
  }

  async addAddress(req: Request, res: Response) {
    try {
      const { dataValues: { id, addresses } } = req.user as PassportRequest;
      const currentAddress = addresses.addressList.push(req.body);
      addresses.currentAddress = currentAddress;
      await Users.update({ addresses }, { where: { id } });
      res.json({ code: 1 });
    } catch (e) {
      console.log(e);
      res.sendStatus(500);
    }
  }

  async removeAddress(req: Request, res: Response) {
    try {
      const { dataValues: { id, addresses } } = req.user as PassportRequest;
      const { index } = req.body;
      addresses.addressList = addresses.addressList.filter((address, idx) => idx !== index);
      if (addresses.currentAddress === (index + 1)) {
        addresses.currentAddress = addresses.addressList.length;
      }
      await Users.update({ addresses }, { where: { id } });
      res.json({ code: 1, addresses });
    } catch (e) {
      console.log(e);
      res.sendStatus(500);
    }
  }

  async updateAddress(req: Request, res: Response) {
    try {
      const { dataValues: { id, addresses } } = req.user as PassportRequest;
      const { oldObject, newObject } = req.body;
      const addressList = addresses.addressList.map((address) => {
        if (JSON.stringify(address) === JSON.stringify(oldObject)) {
          return { ...address, ...newObject };
        }
        return address;
      });
      const currentAddress = addressList.length;
      await Users.update({ addresses: { addressList, currentAddress } }, { where: { id } });
      res.json({ code: 1 });
    } catch (e) {
      console.log(e);
      res.sendStatus(500);
    }
  }

  async selectAddress(req: Request, res: Response) {
    try {
      const { dataValues: { id, addresses } } = req.user as PassportRequest;
      const { index } = req.body;
      addresses.currentAddress = index;
      await Users.update({ addresses }, { where: { id } });
      res.json({ code: 1, currentAddress: index });
    } catch (e) {
      console.log(e);
      res.sendStatus(500);
    }
  }
}

export default new Profile();
