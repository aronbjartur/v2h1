//mögulega óþarfi að hafa þetta skjal

import express from 'express';
import { router } from './routes/routes.js';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const app = express();

app.use(express.urlencoded({ extended: true }));

const viewsPath = dirname(fileURLToPath(import.meta.url));
console.log(viewsPath);
app.set('views', viewsPath);
app.set('view engine', 'ejs');

app.use(express.static(join(viewsPath, './views')));

app.use('/', router);

const hostname = '127.0.0.1';
const port = 3000;

app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
