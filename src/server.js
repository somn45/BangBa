import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import morgan from 'morgan';
import session from 'express-session';
import MongoStore from 'connect-mongo';

import DB_URL from './db';
import globalRouter from './routers/globalRouter';
import userRouter from './routers/userRouter';
import cafeRouter from './routers/cafeRouter';
import commentRouter from './routers/commentRouter';
import apiRouter from './routers/apiRouter';
import { sessionMiddleware } from './middlewares/sessionMiddleware';

const COOKIE_EXPIRY_TIME = 1000 * 60 * 60 * 24 * 7;

const app = express();

app.set('view engine', 'pug');
app.set('views', path.resolve(process.cwd(), 'src', 'views'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  session({
    secret: process.env.COOKIE_SECRET,
    resave: true,
    saveUninitialized: true,
    store: MongoStore.create({ mongoUrl: DB_URL }),
    cookie: {
      maxAge: COOKIE_EXPIRY_TIME,
    },
  })
);
app.use(morgan('dev'));
app.use(sessionMiddleware);
app.use('/assets', express.static('assets'));
app.use('/uploads', express.static('uploads'));
app.use('/dist', express.static('dist'));
app.use('/', globalRouter);
app.use('/users', userRouter);
app.use('/cafes', cafeRouter);
app.use('/comments', commentRouter);
app.use('/api', apiRouter);

export default app;
