import express from 'express';

import {
  getRegister,
  postRegister,
  detail,
  getEdit,
  postEdit,
  deleteCafe,
} from '../controllers/cafeController';

const cafeRouter = express.Router();

cafeRouter.route('/register').get(getRegister).post(postRegister);
cafeRouter.get('/:cafeId([a-z0-9]{24})', detail);
cafeRouter.route('/:cafeId([a-z0-9]{24})/edit').get(getEdit).post(postEdit);
cafeRouter.get('/:cafeId([a-z0-9]{24})/delete', deleteCafe);

export default cafeRouter;
