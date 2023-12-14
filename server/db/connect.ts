import { Sequelize } from 'sequelize';

export const db = process.env.DB === 'LOCAL' ? new Sequelize(process.env.DB_LOCAL ?? '') : new Sequelize(process.env.DB_HOST ?? '');

export const connectToDb = async () => {
  try {
    await db.authenticate();
    await db.sync({ alter: true });
    console.log('Соединение с БД было успешно установлено');
  } catch (e) {
    console.log('Невозможно выполнить подключение к БД: ', e);
  }
};
