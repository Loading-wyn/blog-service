
import { Router } from 'express';
import 'isomorphic-fetch';
import * as oss from '../../../lib/oss';
import errorResponse from '../../../lib/errorResponse';
import hifetch from 'hifetch';

const UPDATEFEED_API = 'https://fbchina.flipboard.com/v1/users/updateFeed/158915470';
const UPDATEFEED_CHINA_API = 'https://fbchina.flipchina.cn/v1/users/updateFeed/995523951';
const defaultUpdateFeedQuery = {
  udid: 'fd8bac858155fa42d6759e9b27c77fbc87b0e8cf-simulator-9.3',
  tuuid: 'EE335FEC-3D8F-4D80-8F14-274F06795BBB',
  userid: '158915470',
  ver: '3.2.16.7',
  device: 'iphone-9.3',
  model: 'x86_64',
  lang: 'zh-Hans-CN',
  locale: 'zh_CN',
  locale_cg: 'zh_CN',
  variant: 'china',
  flipster: '1',
  limitAdTracking: '0',
  advertisingID: '1E2FF83B-89F8-4F23-AEBA-C8C5C4962FA6',
};
const defaultChinaUpdateFeedQuery = {
  udid: 'a0c9a90bdefc7a7eae4975b307069a5c5ca05e32-simulator-9.3',
  tuuid: '49188907-87BF-4A85-86FD-790605E37E9F',
  userid: '995523951',
  ver: '3.2.16',
  device: 'iphone-9.3',
  model: 'x86_64',
  lang: 'zh-Hans-CN',
  locale: 'zh_CN',
  locale_cg: 'zh_CN',
  variant: 'china',
  flipster: '1',
  limitAdTracking: '0',
  advertisingID: 'A64E0A35-9A29-43E7-8AD1-462BBD059FE8',
};
const flipmagTemplate = process.env.NODE_ENV !== 'production'
    && process.env.DEV_ENV_FL_NEW_FLIPRSS_TEMPLATE
  || process.env.FL_NEW_FLIPRSS_TEMPLATE;

const api = Router();

api.get('/actions/update-feed', (req, res) => {
  const {
    remoteId,
    limit,
    enableChinaAPI,
  } = req.query;
  hifetch({
    url: enableChinaAPI === 'true'
      ? UPDATEFEED_CHINA_API : UPDATEFEED_API,
    query: {
      limit,
      sections: remoteId,
      ...(
        enableChinaAPI === 'true'
          ? defaultChinaUpdateFeedQuery : defaultUpdateFeedQuery
      ),
    },
    parser(response) {
      return response.text().then(streamJSON => {
        const text = streamJSON.split(/\}\s*\{/).join('}, {');
        return JSON.parse(`[${text}]`);
      });
    },
  }).send().then(json => {
    res.json({
      status: 0,
      feed: json,
    });
  }).catch(errorResponse(req, res));
});

api.post('/actions/view-detail', (req, res) => {
  const {
    sourceURL,
  } = req.body;
  const placeholders = Object.keys(req.body);
  hifetch({
    url: flipmagTemplate,
    parser(response) {
      return response.text();
    },
  }).send().then(template => {
    let html = template;
    placeholders.forEach(key => {
      html = html.replace(new RegExp(`\\{${key}\\}`, 'g'), req.body[key]);
    });
    const pageName = encodeURIComponent(sourceURL);
    const pageUrlName = encodeURIComponent(pageName);
    const objectKey = `webpages/flipmag-viewer/${pageName}.html`;
    oss.putObject({
      key: objectKey,
      data: html,
      maxAge: 1,
      error: errorResponse(req, res),
      success() {
        res.json({
          status: 0,
          url: `https://s.flipchina.cn/webpages/flipmag-viewer/${pageUrlName}.html`,
        });
      },
    });
  }).catch(errorResponse(req, res));
});

export default api;
