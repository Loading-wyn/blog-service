/**
 * transport from cnweb code
 */
import querystring from 'querystring';
import crypto from 'crypto';
import request from 'request';
import zlib from 'zlib';

const host = process.env.FL_PROXY_HOST;

function sha1(s) {
  const h = crypto.createHash('sha1');
  h.update(s);
  return h.digest('hex');
}

function getDefaultParams() {
  return {
    device: 'iphone', // pass iphone to let flap return sourceMagazineURL
    ver: process.env.FL_PROXY_VER,
    lang: 'zh-Hans',
    locale: 'zh-Hans_CN',
    usessid: true,
    variant: 'china',
    iswebapp: true,
    userid: 0,
    tuuid: 0,
    udid: 0,
  };
}

function routeKey(path, params) {
  if (path.indexOf('getSection') > 0 && params.sections) {
    return sha1(params.sections);
  }
  return sha1([path, querystring.stringify(params)].join('?'));
}

function getParams(options) {
  const {
    req,
    user,
  } = options;
  const defaultParams = getDefaultParams(req, user);
  const params = Object.assign({}, defaultParams, options.params);
  if (options.path[0] !== '/') {
    options.path = `/${options.path}`;
  }
  if (options.path === '/getSection') {
    options.path += '/0';
  }
  const rk = routeKey(options.path, params);
  if ((!params.udid || Number(params.udid) === 0)
      && Number(params.userid) === 0) {
    params.udid = rk;
    params.nosession = true;
  }
  return [params, rk];
}

function requestProxy(method = 'GET', options) {
  return new Promise(function (resolve, reject) {
    const params = getParams(options)[0];
    const requestUrl = `${host}${options.path}?${querystring.stringify(params)}`;
    const requestOptions = {
      url: requestUrl,
      method,
      json: true,
      encoding: null,
      // Set extra headers
      headers: {
        Connection: 'keep-alive',
        'Accept-Encoding': 'gzip,deflate',
      },
      // Use ForeverAgent for better shared connection pooling
      forever: true,
      // Increase the amount of outstanding connections we can support
      // this defaults to 5 (!!)
      agentOptions: { maxSockets: 1000 },
    };
    logger.info(`Request CNProxy: ${requestOptions.url}`);
    request(requestOptions, function (err, res, originBody) {
      if (err) {
        reject(err);
        return;
      }
      let body = originBody;
      if (res.statusCode !== 200) {
        if (typeof body === 'object') {
          body = JSON.stringify(body);
        }
        reject({
          statusCode: res.statusCode,
          body,
        });
        return;
      } else if (body && body.success === false) {
        reject({
          statusCode: res.statusCode,
          body,
        });
        return;
      }
      const success = function () {
        if (typeof body === 'string') {
          body = body.replace(/\s+$/, '');
          body = `[${body.replace(/\n/g, ',')}]`;
          const items = JSON.parse(body);
          body = items.length > 1 ? items : items[0];
        }
        return resolve(body);
      };
      if (res.headers['content-encoding'] === 'gzip') {
        zlib.gunzip(body, function (err, buffer) {
          if (err) {
            err.statusCode = 500;
            reject(err);
            return;
          }
          try {
            body = JSON.parse(buffer.toString());
          } catch (e) {
            body = buffer.toString();
          }
          success();
        });
      } else {
        success();
      }
    });
  });
}

export function get(options) {
  return requestProxy('GET', options);
}
