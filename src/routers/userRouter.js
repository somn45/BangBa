import express from 'express';

import { profile, signout, getEdit, postEdit } from '../controllers/userController';

const userRouter = express.Router();

userRouter.get('/:userId([a-z0-9]{24})', profile);
userRouter.route('/:userId([a-z0-9]{24})/edit').get(getEdit).post(postEdit);
userRouter.get('/:userId([a-z0-9]{24}/signout)', signout);

export default userRouter;
