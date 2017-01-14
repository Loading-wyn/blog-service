
import { Router } from 'express';
import User from '../../../model/FloducerUser';
import Magazine from '../../../model/Magazine';
import errorResponse from '../../../lib/errorResponse';
import {
  RE_COMMA_SEPARATOR,
} from '../../../lib/validators';
import {
  passwordSetter,
} from '../../../lib/modelUtils';

const api = Router();

const extractUsername = (req, res, next) => {
  let {
    username,
  } = req.query;
  const {
    isAdmin,
  } = req.user;
  if (!isAdmin || !username) {
    username = req.user.username;
  }
  if (!username) {
    res.status(403).send('no auth');
  } else {
    req.username = username;
    next();
  }
};

api.get('/access', extractUsername, (req, res) => {
  const {
    username,
  } = req;
  // logger.info(111, username)
  User.findOne({
    username,
  }).populate('magazines').exec().then(user => {
    if (!user) {
      const errData = JSON.stringify({
        status: -10,
        isExpected: true,
      });
      throw new Error(`[[${errData}]] NO SUCH USER: ${username}`);
    }
    // logger.info(222, user.toObject())
    const userData = user.toJSON();
    // logger.info(333, userData)
    userData.sheet = Object.assign(userData.sheet, userData.magazines[0]);
    delete userData.magazines;
    delete userData.defaultMagazineId;
    delete userData.createdAt;
    delete userData.updatedAt;
    delete userData.sheet.createdAt;
    delete userData.sheet.updatedAt;
    delete userData.sheet.owner;
    delete userData.sheet.appPassword;
    // logger.info(444, userData)
    res.json({
      status: 0,
      username,
      data: userData,
    });
  }).catch(errorResponse(req, res));
});

api.post('/contract/actions/sign', extractUsername, (req, res) => {
  const {
    username,
  } = req;
  User.findOneAndUpdate({
    username,
  }, {
    contractSignedAt: Date.now(),
  }, {
    'new': true,
  }).exec().then(user => {
    res.json({
      status: 0,
      username,
      contractSignedAt: user.contractSignedAt,
    });
  }).catch(errorResponse(req, res));
});

api.post('/sheet/actions/update', extractUsername, (req, res) => {
  const {
    username,
  } = req;
  const {
    name,
    desc,
    logo,
    phone,
    email,
    appUsername,
    appPassword,
    magName,
    magDesc,
    category,
    keywords,
    rssSource,
    wechatSource,
    assetTier1no1,
    assetTier1no2,
    assetTier1no3,
    assetTier1no4,
    assetTier1no5,
    assetTier1no6,
  } = req.body;
  // logger.info(111, username)
  User.findOne({
    username,
  }).exec().then(user => {
    if (!user) {
      const errData = JSON.stringify({
        status: -10,
        isExpected: true,
      });
      throw new Error(`[[${errData}]] NO SUCH USER: ${username}`);
    }
    // logger.info(222, user.toObject())
    const defaultMagazineId = user.defaultMagazineId;
    const defaultMagazine = {
      magName,
      magDesc,
      category,
      keywords: keywords.split(RE_COMMA_SEPARATOR),
      rssSource,
      wechatSource,
      assetTier1: [
        assetTier1no1,
        assetTier1no2,
        assetTier1no3,
        assetTier1no4,
        assetTier1no5,
        assetTier1no6,
      ],
    };
    return Promise.resolve(
      defaultMagazineId && Magazine.findByIdAndUpdate(
        defaultMagazineId,
        defaultMagazine,
        { 'new': true },
      ).exec()
    ).then(magazine => {
      if (!magazine) {
        return new Magazine(Object.assign({
          owner: user._id,
        }, defaultMagazine)).save();
      }
      return magazine;
    }).then(magazine => {
      // logger.info(333, magazine.toObject())
      return {
        user,
        defaultMagazineId: magazine._id,
      };
    });
  }).then(({
    user,
    defaultMagazineId,
  }) => {
    // logger.info(444, user.toObject())
    return User.findByIdAndUpdate(user._id, {
      sheetUpdatedAt: Date.now(),
      sheetApprovedAt: new Date(0),
      sheetRefusedAt: new Date(0),
      'magazines.0': defaultMagazineId,
      sheet: {
        name,
        desc,
        logo,
        phone,
        email,
        appUsername,
        appPassword: passwordSetter(appPassword),
      },
    }, {
      'new': true,
    }).exec();
  }).then(user => {
    // logger.info(555, user.toObject())
    const {
      contractSignedAt,
      sheetUpdatedAt,
      sheetApprovedAt,
      sheetRefusedAt,
      sheetRefusedReason,
      publishedAt,
    } = user;
    res.json({
      status: 0,
      username,
      data: {
        contractSignedAt,
        sheetUpdatedAt,
        sheetApprovedAt,
        sheetRefusedAt,
        sheetRefusedReason,
        publishedAt,
      },
    });
  }).catch(errorResponse(req, res));
});

export default api;
