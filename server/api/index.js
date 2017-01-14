import { Router } from 'express';
import floducerAPI from './floducer';
import homefeaturedAPI from './homefeatured';

const api = Router();

api.use('/floducer', floducerAPI);
api.use('/homefeatured', homefeaturedAPI);

export default api;
