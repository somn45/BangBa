import express from 'express';
import awsUpload from '../aws/multerS3';

import {
  getRegister,
  postRegister,
  detail,
  getEdit,
  postEdit,
  deleteCafe,
} from '../controllers/cafeController';
import { uploadCafeBg } from '../middlewares/multer';
import {
  protectMiddleware,
  ownerProtectMiddleware,
} from '../middlewares/protectMiddleware';

const cafeRouter = express.Router();

cafeRouter
  .route('/register')
  .get(protectMiddleware, getRegister)
  .post(awsUpload.single('background'), postRegister);
cafeRouter.get('/:cafeId([a-z0-9]{24})', detail);
cafeRouter
  .route('/:cafeId([a-z0-9]{24})/edit')
  .get(protectMiddleware, ownerProtectMiddleware, getEdit)
  .post(awsUpload.single('background'), postEdit);
cafeRouter.get(
  '/:cafeId([a-z0-9]{24})/delete',
  protectMiddleware,
  ownerProtectMiddleware,
  deleteCafe
);

export default cafeRouter;
