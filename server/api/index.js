import { Router } from 'express';
import blogAPI from './blog';

const api = Router();

api.use('/blog', blogAPI);

export default api;
