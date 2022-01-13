import express from 'express';

import {
  profile,
  signout,
  getEdit,
  postEdit,
  getChangePassword,
  postChangePassword,
} from '../controllers/userController';
import { uploadProfile } from '../middlewares/multer';

const userRouter = express.Router();

userRouter.get('/:userId([a-z0-9]{24})', profile);
userRouter
  .route('/:userId([a-z0-9]{24})/edit')
  .get(getEdit)
  .post(uploadProfile.single('avatar'), postEdit);
userRouter
  .route('/:userId([a-z0-9]{24})/change-password')
  .get(getChangePassword)
  .post(postChangePassword);
userRouter.get('/:userId([a-z0-9]{24}/signout)', signout);

export default userRouter;
