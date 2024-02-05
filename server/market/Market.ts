/* eslint-disable import/no-anonymous-default-export */
/* eslint-disable max-len */
/* eslint-disable consistent-return */
/* eslint-disable class-methods-use-this */
/* eslint-disable camelcase */
/* eslint-disable import/no-cycle */
import { Request, Response } from 'express';
import path from 'path';
import { Op } from 'sequelize';
import { unlink } from 'fs';
import sharp from 'sharp';
import redis from '../db/redis.js';
import type { PassportRequest } from '../db/tables/Users.js';
import { uploadFilesPath } from '../server.js';
import Items_Table from '../db/tables/Items.js';

const isAdmin = (role: string) => role === 'admin';

const removeFile = (pathName: string, fileName: string) => unlink(path.resolve(pathName, fileName), (e) => {
  if (e) {
    throw e;
  }
});

class Market {
  async getAll(req: Request, res: Response) {
    try {
      const cacheData = await redis.get('market');
      if (cacheData) {
        const items = JSON.parse(cacheData);
        res.json({ code: 1, items });
      } else {
        const items = await Items_Table.findAll();
        await redis.set('market', JSON.stringify(items), { EX: 60, NX: true });
        res.json({ code: 1, items });
      }
    } catch (e) {
      console.log(e);
      res.sendStatus(401);
    }
  }

  async upload(req: Request, res: Response) {
    try {
      const { dataValues: { role } } = req.user as PassportRequest;
      if (isAdmin(role)) {
        if (!req.files) {
          return res.status(500);
        }
        if (!Array.isArray(req.files.image)) {
          const {
            foodValues, category, name, ...rest
          } = req.body;

          const isItemExists = await Items_Table.findOne({ where: { name } });
          if (isItemExists) {
            return res.send({ code: 2 });
          }

          const { image } = req.files;
          const imageName = `${Date.now()}-${image.name.replace(/[^\w\s.]/g, '').replaceAll(' ', '')}`;
          await sharp(image.data).png({ compressionLevel: 9, quality: 70 }).toFile(path.resolve(uploadFilesPath, imageName));

          const item = await Items_Table.create({
            image: imageName,
            category: JSON.parse(category),
            foodValues: JSON.parse(foodValues),
            name,
            ...rest,
          });
          res.send({ code: 1, item });
        }
      } else {
        res.status(401);
      }
    } catch (e) {
      console.log(e);
      res.sendStatus(500);
    }
  }

  async edit(req: Request, res: Response) {
    try {
      const { dataValues: { role } } = req.user as PassportRequest;
      if (isAdmin(role)) {
        const {
          id, name, foodValues, category, ...rest
        } = req.body;
        const item = await Items_Table.findAll({ where: { [Op.or]: [{ id }, { name }] } });
        if (item.length > 1) {
          return res.send({ code: 2 });
        }
        if (!req.files) {
          await Items_Table.update(
            {
              name,
              category: JSON.parse(category),
              foodValues: JSON.parse(foodValues),
              ...rest,
            },
            { where: { id } },
          );
          return res.send({
            code: 1,
            item: {
              ...req.body,
              category: JSON.parse(category),
              foodValues: JSON.parse(foodValues),
            },
          });
        }
        if (!Array.isArray(req.files.image)) {
          const { image } = req.files;
          const imageName = `${Date.now()}-${image.name.replace(/[^\w\s.]/g, '').replaceAll(' ', '')}`;
          await sharp(image.data).png({ compressionLevel: 9, quality: 70 }).toFile(path.resolve(uploadFilesPath, imageName));

          removeFile(uploadFilesPath, item[0].image);

          await Items_Table.update(
            {
              image: imageName,
              name,
              category: JSON.parse(category),
              foodValues: JSON.parse(foodValues),
              ...rest,
            },
            { where: { id } },
          );
          res.send({
            code: 1,
            item: {
              ...req.body,
              image: imageName,
              category: JSON.parse(category),
              foodValues: JSON.parse(foodValues),
            },
          });
        }
      } else {
        res.status(401);
      }
    } catch (e) {
      console.log(e);
      res.sendStatus(500);
    }
  }

  async remove(req: Request, res: Response) {
    try {
      const { dataValues: { role } } = req.user as PassportRequest;
      if (isAdmin(role)) {
        const id = Number(req.query.id);
        const item = await Items_Table.findOne({ where: { id } });
        if (item) {
          removeFile(uploadFilesPath, item.image);

          await Items_Table.destroy({ where: { id } });
          return res.send({ code: 1 });
        }
        res.send({ code: 2 });
      } else {
        res.status(401);
      }
    } catch (e) {
      console.log(e);
      res.sendStatus(500);
    }
  }
}

export default new Market();
