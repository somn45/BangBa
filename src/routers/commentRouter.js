import express from 'express';

import {
  createComment,
  modifyComment,
  deleteComment,
} from '../controllers/commentControllers';

const commentRouter = express.Router();

commentRouter.post('/cafes/:cafeId([0-9a-f]{24})', createComment);
commentRouter.patch('/cafes/:commentId([0-9a-f]{24})/update', modifyComment);
commentRouter.delete('/cafes/:commentId([0-9a-f]{24})/delete', deleteComment);

export default commentRouter;
