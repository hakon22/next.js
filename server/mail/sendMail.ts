import nodemailer from 'nodemailer';
import { upperCase, lowerCase } from '../utilities/textTransform.js';

type RecoveryPassword = (
  username: string,
  email: string,
  password: string,
) => Promise<void>;

type ChangeEmail = (
  username: string,
  email: string,
  code: number,
) => Promise<void>;

type ActivationAccount = (
  id: number | undefined,
  username: string,
  email: string,
  code: number,
) => Promise<void>;

const protocol = 'https://';
const siteName = 'portfolio.am-projects.ru/marketplace';
const activationPage = '/activation/';

const transport = nodemailer.createTransport({
  host: 'smtp.beget.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.LOGIN_MAIL,
    pass: process.env.PASS_MAIL,
  },
});

export const sendMailActivationAccount: ActivationAccount = async (id, username, email, code) => {
  if (!id) return;
  const to = lowerCase(email);
  const subject = `Код подтверждения регистрации на сайте ${siteName}`;

  await transport.sendMail({
    from: process.env.LOGIN,
    to,
    subject,
    html: `
      <h3>Уважаемый ${upperCase(username)}!</h3>
      <h4>Ранее вы регистрировались на сайте ${protocol}${siteName}.</h4>
      <p>Ваш код подтверждения: <h3><b>${code}</b></h3></p>
      <p>Вы можете ввести его здесь: <a href="${protocol}${siteName}${activationPage}${id}" target="_blank">${protocol}${siteName}${activationPage}${id}</a></p>
      <p>Данный код действует 24 часа, после истечения времени Ваша регистрация будет аннулирована.</p>
      <p>Если Вы не регистрировались на нашем сайте - просто проигнорируйте это письмо.</p>
      <p>С уважением, администрация <a href="${protocol}${siteName}" target="_blank">${siteName}</a></p>
    `,
  }, (error) => {
    if (error) {
      console.error('Ошибка при отправке:', error);
    } else {
      console.log('Сообщение отправлено!');
    }
  });
};

export const sendMailChangeEmail: ChangeEmail = async (username, email, code) => {
  const to = lowerCase(email);
  const subject = `Код подтверждения изменения почты на сайте ${siteName}`;

  await transport.sendMail({
    from: process.env.LOGIN,
    to,
    subject,
    html: `
      <h3>Уважаемый ${upperCase(username)}!</h3>
      <h4>С Вашего аккаунта был послан запрос на смену почты на сайте ${protocol}${siteName}.</h4>
      <p>Ваш код подтверждения: <h3><b>${code}</b></h3></p>
      <p>Если это были не Вы, пожалуйста, смените пароль в личном кабинете.</p>
      <p>С уважением, администрация <a href="${protocol}${siteName}" target="_blank">${siteName}</a></p>
    `,
  }, (error) => {
    if (error) {
      console.error('Ошибка при отправке:', error);
    } else {
      console.log('Сообщение отправлено!');
    }
  });
};

export const sendMailRecoveryPass: RecoveryPassword = async (username, email, password) => {
  const to = lowerCase(email);
  const subject = `Восстановление пароля на сайте ${siteName}`;

  await transport.sendMail({
    from: process.env.LOGIN,
    to,
    subject,
    html: `
      <h3>Уважаемый ${upperCase(username)}!</h3>
      <h4>Вы запросили восстановление пароля.</h4>
      <p>Если это были не Вы, пожалуйста, смените пароль в личном кабинете.</p>
      <p>Ваш новый пароль: <h3><b>${password}</b></h3></p>
      <p>С уважением, администрация <a href="${protocol}${siteName}" target="_blank">${siteName}</a></p>
    `,
  }, (error) => {
    if (error) {
      console.error('Ошибка при отправке:', error);
    } else {
      console.log('Сообщение отправлено!');
    }
  });
};
