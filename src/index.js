import express from 'express';
import path from 'path';

import globalRouter from './routers/globalRouter';
import userRouter from './routers/userRouter';
import cafeRouter from './routers/cafeRouter';
import './db';

const app = express();
const PORT = 4000;

app.set('view engine', 'pug');
app.set('views', path.resolve(__dirname, 'views'));

app.use('/', globalRouter);
app.use('/users', userRouter);
app.use('/cafes', cafeRouter);

app.listen(PORT, () => console.log('✅ Server connect success.'));
