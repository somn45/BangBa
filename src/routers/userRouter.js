import express from 'express';

import {
  profile,
  signout,
  getEdit,
  postEdit,
  getChangePassword,
  postChangePassword,
} from '../controllers/userController';

const userRouter = express.Router();

userRouter.get('/:userId([a-z0-9]{24})', profile);
userRouter.route('/:userId([a-z0-9]{24})/edit').get(getEdit).post(postEdit);
userRouter
  .route('/:userId([a-z0-9]{24})/change-password')
  .get(getChangePassword)
  .post(postChangePassword);
userRouter.get('/:userId([a-z0-9]{24}/signout)', signout);

export default userRouter;
