
import { Router } from 'express';
import errorResponse from '../../../lib/errorResponse';
import * as oss from '../../../lib/oss';
import resourceMeta from '../../../lib/resourceMeta';

const api = Router();

api.post('/actions/save', (req, res) => {
  const {
    name,
  } = req.query;
  const dbFile = `db/slides/data-${name}.json`;
  oss.putObject({
    key: dbFile,
    data: JSON.stringify(resourceMeta(req.body)),
    maxAge: 1,
    error: errorResponse(req, res),
    success(response) {
      res.location(`${process.env.FL_OSS_CDN_ROOT}/${dbFile}`);
      res.status(201).json(response);
    },
  });
});

export default api;
