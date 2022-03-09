import express from 'express';
import {
  checkRecommendedUser,
  increaseRecommendation,
  decreaseRecommendation,
  addWatchList,
} from '../controllers/apiController';

const apiRouter = express.Router();

apiRouter.get('/:cafeId([0-9a-z]{24})/recommend', checkRecommendedUser);
apiRouter.post(
  '/:cafeId([0-9a-z]{24})/recommend/increase',
  increaseRecommendation
);
apiRouter.post(
  '/:cafeId([0-9a-z]{24})/recommend/decrease',
  decreaseRecommendation
);
apiRouter.post('/addWatchList', addWatchList);

export default apiRouter;
