import express from 'express';
import awsUpload from '../aws/multerS3';

import {
  profile,
  signout,
  getEdit,
  postEdit,
  getChangePassword,
  postChangePassword,
} from '../controllers/userController';
import {
  startKakaoLogin,
  finishKakaoLogin,
  startGoogleLogin,
  finishGoogleLogin,
  startNaverLogin,
  finishNaverLogin,
} from '../controllers/socialLoginController';
import {
  protectMiddleware,
  preventBreakInMiddleware,
} from '../middlewares/protectMiddleware';

const userRouter = express.Router();

userRouter.get('/:userId([a-z0-9]{24})', profile);
userRouter
  .route('/:userId([a-z0-9]{24})/edit')
  .get(protectMiddleware, preventBreakInMiddleware, getEdit)
  .post(awsUpload.single('avatar'), postEdit);
userRouter
  .route('/:userId([a-z0-9]{24})/change-password')
  .get(protectMiddleware, preventBreakInMiddleware, getChangePassword)
  .post(postChangePassword);
userRouter.get(
  '/:userId([a-z0-9]{24})/signout',
  protectMiddleware,
  preventBreakInMiddleware,
  signout
);
userRouter.get('/kakao/login', startKakaoLogin);
userRouter.get('/kakao/oauth', finishKakaoLogin);
userRouter.get('/google/login', startGoogleLogin);
userRouter.get('/google/oauth', finishGoogleLogin);
userRouter.get('/naver/login', startNaverLogin);
userRouter.get('/naver/oauth', finishNaverLogin);

export default userRouter;
