
import { Router } from 'express';
import {
  authorized,
  unauthorized,
  needAdmin,
  authAPI,
} from './auth';
import uploadImagesAPI from './uploadImages';
import publisherAPI from './publisher';
import supervisorAPI from './supervisor';
import homefeaturedAPI from './homefeatured';
import flipmagViewerAPI from './flipmagViewer';
import slidesAPI from './slides';

function pushUpdate(req, res, next) {
  res.set('X-Floducer-Version', process.env.FL_FLODUCER_VERSION);
  next();
}

const api = Router();
api.use(pushUpdate);
api.use(authorized);
api.use(unauthorized);
api.use(authAPI);
api.use(uploadImagesAPI);
api.use('/publisher', publisherAPI);
api.use('/supervisor', needAdmin, supervisorAPI);
api.use('/homefeatured', needAdmin, homefeaturedAPI);
api.use('/flipmag-viewer', needAdmin, flipmagViewerAPI);
api.use('/slides', needAdmin, slidesAPI);

export default api;
