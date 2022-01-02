import express from 'express';

import { profile, signout } from '../controllers/userController';
const userRouter = express.Router();

userRouter.get('/:userId([a-z0-9]{24})', profile);
userRouter.get('/:userId([a-z0-9]{24}/signout)', signout);

export default userRouter;
