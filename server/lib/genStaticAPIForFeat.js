
import 'isomorphic-fetch';
import moment from 'moment';
import hifetch from 'hifetch';
import * as oss from './oss';
import resourceMeta from './resourceMeta';

const STATIC_URL = 'https://s.flipchina.cn';
const HOMEFEATURED_DB_URL = `${STATIC_URL}/db/homefeatured`;
const PHOTO_FEAT_DB_URL = `${HOMEFEATURED_DB_URL}/photofeat`;
const WORLD_FEAT_DB_URL = `${HOMEFEATURED_DB_URL}/worldfeat`;
const MAG_FEAT_DB_URL = `${HOMEFEATURED_DB_URL}/magfeat`;
const DATE_FORMAT_BY_DAY = 'YYYY-MM-DD';
// const DATE_FORMAT_BY_WEEK = 'GGGG-[week]W';
const SHARE_URL_ROOT = 'https://sapp.flipchina.cn/homefeatured-share/index.html';

export default function (originOpt) {
  const now = moment();
  const opt = Object.assign({
    photoFeatDate: now.format(DATE_FORMAT_BY_DAY),
    worldFeatDate: now.format(DATE_FORMAT_BY_DAY),
    // worldFeatDate: now.subtract(2, 'days').format(DATE_FORMAT_BY_DAY),
  }, originOpt);
  return Promise.all([
    fetchDB(PHOTO_FEAT_DB_URL, opt.photoFeatDate, DATE_FORMAT_BY_DAY),
    fetchDB(WORLD_FEAT_DB_URL, opt.worldFeatDate, DATE_FORMAT_BY_DAY),
    fetchDB(MAG_FEAT_DB_URL),
  ]).then(json => {
    const photoFeatData = json[0];
    const worldFeatData = json[1];
    const magFeatData = json[2];
    const photoFeatDataString = moment(photoFeatData.date)
      .format(DATE_FORMAT_BY_DAY);
    const newPhotoFeatData = {
      type: 'dailyImage',
      sectionID: 'default_dailyimage',
      featuredID: `homefeatured-${photoFeatDataString}`,
      dateID: photoFeatDataString,
      feedTitle: photoFeatData.feedTitle,
      date: photoFeatData.dateDesc,
      title: photoFeatData.title || photoFeatData.coverTitle,
      shareTitle: photoFeatData.shareTitle,
      shareURL: `${SHARE_URL_ROOT}?featType=photoFeat&featIssue=${photoFeatDataString}`,
      annotation: photoFeatData.annotation,
      footer: photoFeatData.footer,
    };
    newPhotoFeatData.items = order(photoFeatData.items).map(item => {
      return {
        id: item.id,
        image: item.image,
        title: item.extraTitle,
        attribution: item.extraMeta,
      };
    });
    const newPhotoFeatCoverData = {
      id: 'default_dailyimage',
      type: 'dailyImage',
      sectionID: 'default_dailyimage',
      feedTitle: photoFeatData.feedTitle,
      dateCreated: moment(photoFeatData.date).hour(
        photoFeatData.isPrior ? 9 : 6
      ).unix(),
      dateID: photoFeatDataString,
      image: photoFeatData.cover.image,
      title: photoFeatData.coverTitle,
      imageCount: photoFeatData.items.length,
    };
    const worldFeatDataString = moment(worldFeatData.date)
      .format(DATE_FORMAT_BY_DAY);
    const newWorldFeatData = {
      type: 'worldHot',
      sectionID: 'default_worldhot',
      featuredID: `homefeatured-${worldFeatDataString}`,
      dateID: worldFeatDataString,
      shareTitle: worldFeatData.shareTitle,
      shareURL: `${SHARE_URL_ROOT}?featType=worldFeat&featIssue=${worldFeatDataString}`,
      feedTitle: worldFeatData.feedTitle,
      header: worldFeatData.header,
      footer: worldFeatData.footer,
    };
    newWorldFeatData.items = order(worldFeatData.items).map(item => {
      return {
        id: item.id,
        image: item.inlineImage,
        readCount: item.time,
        title: item.extraTitle,
        annotation: item.extraAnnotation,
        sourceURL: item.sourceURL,
        sourceMagazineURL: item.sourceMagazineURL,
        rssText: item.rssText,
        service: item.service,
        remoteServiceItemID: item.remoteServiceItemID,
        originalTitle: item.title,
        originalAuthorName: item.extraSectionAuthor
          || item.sourceDomain || item.authorDisplayName,
      };
    });
    const newWorldFeatCoverData = {
      id: 'default_worldhot',
      type: 'worldHot',
      sectionID: 'default_worldhot',
      feedTitle: worldFeatData.feedTitle,
      dateCreated: moment(worldFeatData.date).hour(
        worldFeatData.isPrior ? 10 : 7
      ).unix(),
      // dateCreated: moment(worldFeatData.date).day(3).hour(10).unix(),
      dateID: worldFeatDataString,
      image: worldFeatData.cover.image,
      dateline: worldFeatData.dateDesc,
      title: worldFeatData.coverTitle,
      coverlines: [
        worldFeatData.coverline1,
        worldFeatData.coverline2,
        worldFeatData.coverline3,
        worldFeatData.coverline4,
        worldFeatData.coverline5,
      ].filter(coverline => coverline),
    };
    const socialId = (/^[^\-]+\-([^:]+:[^:]+:[^\-]+)/.exec(
      magFeatData.items[0].section.socialId
    ) || [])[1];
    const magSectionId = socialId ? `/magazine/${socialId}` : '';
    const newMagFeatData = {
      id: 'default_magazinerecommendation',
      type: 'magazineRecommendation',
      sectionID: 'default_magazinerecommendation',
      feedTitle: magFeatData.feedTitle,
      dateCreated: moment().hour(
        magFeatData.isPrior ? 8 : 5
      ).unix(),
      image: magFeatData.cover.image,
      magazineSectionID: magSectionId
        ? `flipboard/curator${encodeURIComponent(magSectionId)}`
        : '',
      magazineTitle: magFeatData.items[0].title,
      magazineAuthorDisplayName: magFeatData.items[0].authorDisplayName,
      magazineAuthorImage: magFeatData.items[0].authorImage,
      magazineDescription: magFeatData.annotation,
    };
    const sources = [
      photoFeatDataString,
      worldFeatDataString,
    ];
    const apiSuffix = opt.preview ? '-preview' : '';
    return Promise.all([
      upload(`api/homefeatured/dailyImage${apiSuffix}.json`,
        resourceMeta(newPhotoFeatData), sources),
      upload(`api/homefeatured/worldHot${apiSuffix}.json`,
        resourceMeta(newWorldFeatData), sources),
      upload(`api/homefeatured/home${apiSuffix}.json`, resourceMeta({
        type: 'home',
        sectionID: 'default_home',
        items: [
          newPhotoFeatCoverData,
          newWorldFeatCoverData,
          newMagFeatData,
        ],
      }), sources),
    ]);
  });
}

function fetchDB(dbUrl, initDateString, dateFormat) {
  const db = dateString => {
    return dateString
      ? `${dbUrl}/data-${dateString}.json`
      : `${dbUrl}/data.json`;
  };
  let currentDateString = initDateString;
  const findLastest = () => {
    const dbString = db(currentDateString);
    return hifetch({
      url: dbString,
    }).send().then(json => {
      logger.info(`Successful update: (${dbString})`);
      return json;
    }).catch(json => {
      if (json.httpStatus === 404) {
        if (!currentDateString) {
          throw new Error();
        }
        const lastest = moment(currentDateString, dateFormat);
        if (dateFormat === DATE_FORMAT_BY_DAY) {
          lastest.subtract(1, 'days');
        } else {
          lastest.subtract(1, 'weeks');
        }
        currentDateString = lastest.format(dateFormat);
        return findLastest();
      }
      logger.error(`Failed update: (${dbString}) ${json.message}`);
      return null;
    });
  };
  return findLastest();
}

function upload(apiUrl, data, sources) {
  // const isPreview = /\-preview/.test(apiUrl);
  return new Promise((resolve, reject) => {
    oss.putObject({
      key: apiUrl,
      data: JSON.stringify(data),
      // maxAge: isPreview ? 1 : (60 * 60),
      maxAge: 60,
      success: res => {
        res.api = apiUrl;
        res.sources = sources;
        resolve(res);
      },
      error: res => {
        res.api = apiUrl;
        res.sources = sources;
        reject(res);
      },
    });
  });
}

function order(items) {
  const topItems = {};
  const orderedItems = [];
  items.forEach(item => {
    if (item.extraOrder) {
      topItems[item.extraOrder] = item;
    } else {
      orderedItems.push(item);
    }
  });
  Object.keys(topItems)
    .sort((a, b) => a - b)
    .forEach(order => {
      orderedItems.unshift(topItems[order]);
    });
  return orderedItems;
}
