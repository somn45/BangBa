import express from 'express';

import { uploadProfile } from '../middlewares/multer';
import { home, search, searchMap } from '../controllers/cafeController';
import {
  getJoin,
  postJoin,
  getLogin,
  postLogin,
  logout,
} from '../controllers/userController';
import {
  protectMiddleware,
  guestPublicMiddleware,
} from '../middlewares/protectMiddleware';

const globalRouter = express.Router();

globalRouter.get('/', home);
globalRouter
  .route('/join')
  .get(getJoin)
  .post(uploadProfile.single('avatar'), guestPublicMiddleware, postJoin);
globalRouter
  .route('/login')
  .get(guestPublicMiddleware, getLogin)
  .post(postLogin);
globalRouter.get('/search', search);
globalRouter.get('/logout', protectMiddleware, logout);
globalRouter.get('/search/map', searchMap);

export default globalRouter;
