import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import morgan from 'morgan';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import 'dotenv/config';

import globalRouter from './routers/globalRouter';
import userRouter from './routers/userRouter';
import cafeRouter from './routers/cafeRouter';
import './db';
import { sessionMiddleware } from './middlewares/sessionMiddleware';

const app = express();
const PORT = 4000;
const COOKIE_EXPIRY_TIME = 1000 * 60 * 60 * 24 * 7;

app.set('view engine', 'pug');
app.set('views', path.resolve(__dirname, 'views'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.COOKIE_SECRET,
    resave: true,
    saveUninitialized: true,
    store: MongoStore.create({ mongoUrl: process.env.DB_URL }),
    cookie: {
      maxAge: COOKIE_EXPIRY_TIME,
    },
  })
);
app.use(morgan('dev'));
app.use(sessionMiddleware);
app.use('/', globalRouter);
app.use('/users', userRouter);
app.use('/cafes', cafeRouter);

app.listen(PORT, () => console.log('✅ Server connect success.'));
