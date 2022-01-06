import express from 'express';

import { upload } from '../middlewares/multer';
import { home } from '../controllers/cafeController';
import { getJoin, postJoin, getLogin, postLogin, logout } from '../controllers/userController';

const globalRouter = express.Router();

globalRouter.get('/', home);
globalRouter.route('/join').get(getJoin).post(upload.single('avatar'), postJoin);
globalRouter.route('/login').get(getLogin).post(postLogin);
globalRouter.get('/logout', logout);

export default globalRouter;
