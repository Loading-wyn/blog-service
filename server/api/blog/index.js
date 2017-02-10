import { Router } from 'express';
import {
  authorized,
  unauthorized,
  needAdmin,
  authAPI,
} from './auth';
import articleAPI from './article';
import supervisorAPI from './supervisor';

function pushUpdate(req, res, next) {
  res.set('X-Blog-Version', process.env.FL_FLODUCER_VERSION);
  next();
}

const api = Router();
api.use(pushUpdate);
api.use(authorized);
api.use(unauthorized);
api.use(authAPI);
api.use('/articles', needAdmin, articleAPI);
api.use('/supervisor', needAdmin, supervisorAPI);

export default api;
