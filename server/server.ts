/* eslint-disable import/prefer-default-export */
/* eslint-disable import/no-cycle */
import 'dotenv/config';
import passport from 'passport';
import express, { Application, Request, Response } from 'express';
import fileUpload from 'express-fileupload';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import tokenChecker from './authentication/tokenChecker.js';
import refreshTokenChecker from './authentication/refreshTokenChecker.js';
import { connectToDb } from './db/connect.js';
import router from './api.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const app: Application = express();
const port = process.env.PORT || 3001;

const buildPath = process.env.DB === 'LOCAL'
  ? join(__dirname, '..', '..', 'frontend', 'public')
  : join(__dirname, '..', 'frontend');

export const uploadFilesPath = process.env.DB === 'LOCAL'
  ? join(__dirname, '..', '..', 'frontend', 'src', 'images', 'market')
  : join(__dirname, '..', 'frontend', 'static', 'media');

app.use(express.json());
app.use(cors());
app.use(passport.initialize());
tokenChecker(passport);
refreshTokenChecker(passport);
app.use(fileUpload());
app.use(router);

app.listen(port, () => console.log(`Server is online on port: ${port}`));

connectToDb();
