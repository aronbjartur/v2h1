import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import { router as mainRouter } from './routes/transactions.js';
import { router as authRouter } from './auth/api.js';
import passport from './auth/passport.js';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';


const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Passport
app.use(passport.initialize());

const viewsPath = dirname(fileURLToPath(import.meta.url));
app.set('views', viewsPath);
app.set('view engine', 'ejs');
app.use(express.static(join(viewsPath, './views')));

app.use('/', mainRouter);
app.use('/api', authRouter);

const hostname = '127.0.0.1';
const port = 3000;
app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});