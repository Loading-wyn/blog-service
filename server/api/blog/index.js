import { Router } from 'express';
import {
  authorized,
  unauthorized,
//  needAdmin,
  authAPI,
} from './auth';

function pushUpdate(req, res, next) {
  res.set('X-Blog-Version', process.env.FL_FLODUCER_VERSION);
  next();
}

const api = Router();
api.use(pushUpdate);
api.use(authorized);
api.use(unauthorized);
api.use(authAPI);

export default api;
