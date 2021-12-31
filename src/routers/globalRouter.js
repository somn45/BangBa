import express from 'express';

import { home } from '../controllers/cafeController';

const globalRouter = express.Router();

globalRouter.get('/', home);

export default globalRouter;
