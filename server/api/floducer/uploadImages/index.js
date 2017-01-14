
import { Router } from 'express';
import multer from 'multer';
import uuid from 'uuid';
import errorResponse from '../../../lib/errorResponse';
import * as oss from '../../../lib/oss';

const tm = Date.now();
const oneYear = 60 * 60 * 24 * 365;
const upload = multer({
  storage: multer.memoryStorage(),
});
const api = Router();

api.post('/upload-images', upload.array('files'), (req, res) => {
  const {
    path = 'default',
  } = req.body;
  Promise.all(req.files.map((file, order) => new Promise((resolve) => {
    const fileKey = `assets/upload/floducer/${path}/${tm}-${uuid.v4()}`;
    oss.putObject({
      key: fileKey,
      data: file.buffer,
      maxAge: oneYear,
      contentType: file.mimetype,
      contentEncoding: file.encoding,
      error({ message }) {
        resolve({
          order,
          message,
        });
      },
      success() {
        resolve({
          order,
          url: `${process.env.FL_OSS_UPLOAD_IMAGES_ROOT}/${fileKey}`,
        });
      },
    });
  }))).then(results => {
    res.json({
      status: 0,
      results,
    });
  }).catch(errorResponse(req, res));
});

export default api;
