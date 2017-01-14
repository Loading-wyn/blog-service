import ALY from 'aliyun-sdk';
import path from 'path';
import mime from 'mime-types';

export function putObject(opt) {
  const contentType = opt.contentType
    || mime.lookup(path.extname(opt.key));
  new ALY.OSS({
    accessKeyId: opt.accessKeyId
      || process.env.FL_OSS_ID,
    secretAccessKey: opt.secretAccessKey
      || process.env.FL_OSS_SECRET,
    endpoint: opt.endpoint
      || process.env.FL_OSS_ENDPOINT,
    apiVersion: opt.apiVersion
      || '2013-10-15',
  }).putObject({
    Bucket: opt.bucket || 'flipboard-cn-static',
    Key: opt.key,
    Body: opt.data,
    AccessControlAllowOrigin: '',
    ContentType: contentType,
    CacheControl: opt.maxAge ? `max-age=${opt.maxAge}, public` : 'no-cache',
    ContentEncoding: opt.contentEncoding || '',
    Expires: null,
  }, function (err) {
    if (err) {
      opt.error({
        status: -1,
        message: err.message,
      });
      return;
    }
    opt.success({
      status: 0,
    });
  });
}
