/* eslint-disable import/prefer-default-export */
/* eslint-disable import/no-cycle */
import 'dotenv/config';
import passport from 'passport';
import express from 'express';
import next from 'next';
import fileUpload from 'express-fileupload';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import tokenChecker from './authentication/tokenChecker.js';
import refreshTokenChecker from './authentication/refreshTokenChecker.js';
import { connectToDb } from './db/connect.js';
import router from './api.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const port = process.env.PORT || 3001;
const dev = process.env.NODE_ENV !== 'production';

const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();
  tokenChecker(passport);
  refreshTokenChecker(passport);

  server.use(express.json());
  server.use(cors());
  server.use(passport.initialize());
  server.use(fileUpload());
  server.use(router);
  server.all('*', (req, res) => handle(req, res));

  server.listen(port, () => console.log(`Server is online on port: ${port}`));
});

export const uploadFilesPath = join(__dirname, '..', 'src', 'images', 'market');
export const removeFilesPath = join(__dirname, '..', '.next', 'static', 'media');

connectToDb();
