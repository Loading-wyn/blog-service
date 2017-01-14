
import { Router } from 'express';
import errorResponse from '../../../lib/errorResponse';
import * as oss from '../../../lib/oss';
import genStaticAPIForFeat from '../../../lib/genStaticAPIForFeat';
import * as cnProxy from '../../../lib/cnproxy';
import resourceMeta from '../../../lib/resourceMeta';

const api = Router();

api.post('/actions/save', (req, res) => {
  const errorHandler = errorResponse(req, res);
  const {
    type,
    date,
  } = req.query;
  if (!type) {
    errorHandler({
      status: -2,
      message: 'NEED TYPE',
      isExpected: true,
    });
    return;
  }
  const dbFile = date
    ? `db/homefeatured/${type}/data-${date}.json`
    : `db/homefeatured/${type}/data.json`;
  oss.putObject({
    key: dbFile,
    data: JSON.stringify(resourceMeta(req.body)),
    maxAge: 1,
    error: errorHandler,
    success(response) {
      res.location(`${process.env.FL_OSS_CDN_ROOT}/${dbFile}`);
      res.status(201).json(response);
    },
  });
});

api.post('/actions/publish', (req, res) => {
  const errorHandler = errorResponse(req, res);
  const opt = Object.assign({}, req.body);
  genStaticAPIForFeat(opt).then(values => {
    const errors = values.filter(res => res.status);
    if (errors.length) {
      errorHandler({
        status: -1,
        message: errors.map(res => res.message),
        apis: errors.map(res => res.api),
        sources: errors[0].sources,
      });
    } else {
      res.json({
        status: 0,
        sources: values[0].sources,
      });
    }
  }).catch(errorHandler);
});

api.get('/sections/:id', (req, res) => {
  const errorHandler = errorResponse(req, res);
  const {
    limit = 30,
    pageKey,
  } = req.query;
  const params = {
    sections: req.params.id,
    wantsMetadata: true,
    quickLoadWait: 4,
    quickLoadMinItems: 10,
    usessid: true,
    limit,
  };
  if (pageKey) {
    params.pageKey = pageKey;
  }
  const options = {
    req,
    user: req.user,
    path: 'getSection',
    params,
  };
  cnProxy.get(options).then(data => {
    return res.json(data);
  }).catch(err => {
    err.status = -1;
    err.isExpected = true;
    errorHandler(err);
  });
});

export default api;
