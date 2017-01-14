
import { Router } from 'express';
import User from '../../../model/FloducerUser';
import Magazine from '../../../model/Magazine';
import errorResponse from '../../../lib/errorResponse';

const ZERO_DATE = new Date(0);
const userKeys = {
  createdAt: 'date',
  contractSignedAt: 'date',
  sheetUpdatedAt: 'date',
  sheetApprovedAt: 'date',
  sheetRefusedAt: 'date',
  publishedAt: 'date',
  group: 'enum',
};
const magazineKeys = {
  createdAt: 'date',
  updatedAt: 'date',
  rssSource: 'string',
  wechatSource: 'string',
};

const queryConfig = ({
  filter = [],
  sort = '',
  selectorKeys,
  sortKeys,
}) => {
  const querySelector = {};
  (Array.isArray(filter) ? filter : [filter]).forEach((
    filter = '',
  ) => {
    const [
      filterKey,
      filterStatus,
    ] = filter.split('_');
    const selectorType = selectorKeys[filterKey];
    if (!selectorType) {
      return;
    }
    const status = selectorType === 'enum'
      && filterStatus
      || parseFloat(filterStatus);
    if (!status) {
      return;
    }
    if (selectorType === 'date') {
      querySelector[filterKey] = {
        [status > 0 ? '$gt' : '$eq']: ZERO_DATE,
      };
    } else if (selectorType === 'string') {
      querySelector[filterKey] = status > 0 ? {
        $regex: /^\S/,
      } : {
        $or: {
          $eq: '',
          $exists: false,
        },
      };
    } else if (selectorType === 'enum') {
      if (status && status !== '0') {
        querySelector[filterKey] = {
          $eq: status,
        };
      }
    }
  });
  const sortSelector = {};
  const [
    sortKey,
    sortStatus,
  ] = sort.split('_');
  if (sortKeys[sortKey]) {
    const status = parseFloat(sortStatus);
    sortSelector[sortKey] = status === 1 && 1
      || status === -1 && -1;
  }
  return {
    querySelector,
    sortSelector,
  };
};

const api = Router();

api.get('/publishers', (req, res) => {
  const {
    filter,
    sort,
    limit,
    skip,
  } = req.query;
  const {
    querySelector,
    sortSelector,
  } = queryConfig({
    filter,
    sort,
    selectorKeys: userKeys,
    sortKeys: userKeys,
  });
  User.find(querySelector)
    .sort(sortSelector)
    .skip(parseInt(skip, 10))
    .limit(parseInt(limit, 10))
    .populate('magazines')
    .exec().then(users => {
      res.json({
        status: 0,
        users: users.map(user => {
          const data = user.toJSON();
          delete data.defaultMagazineId;
          return data;
        }),
      });
    }).catch(errorResponse(req, res));
});

api.get('/magazines', (req, res) => {
  const {
    category,
    filter,
    sort,
    limit,
    skip,
  } = req.query;
  const {
    querySelector,
    sortSelector,
  } = queryConfig({
    filter,
    sort,
    selectorKeys: magazineKeys,
    sortKeys: magazineKeys,
  });
  if (category) {
    querySelector.category = category;
  }
  Magazine.find(querySelector)
    .sort(sortSelector)
    .skip(parseInt(skip, 10))
    .limit(parseInt(limit, 10))
    .populate('owner')
    .exec().then(magazines => {
      res.json({
        status: 0,
        magazines: magazines.map(magazine => {
          const data = magazine.toJSON();
          delete magazine.owner.magazines;
          delete magazine.owner.defaultMagazineId;
          return data;
        }),
      });
    }).catch(errorResponse(req, res));
});

api.post('/publishers/:username/actions/approve', (req, res) => {
  const {
    username,
  } = req.params;
  const objectId = (/^id:(.+)/.exec(username) || [])[1];
  User.findOneAndUpdate(objectId ? {
    id: username,
  } : {
    username,
  }, {
    sheetApprovedAt: Date.now(),
    sheetRefusedAt: new Date(0),
    sheetRefusedReason: '',
  }, {
    'new': true,
  }).exec().then(user => {
    const {
      sheetApprovedAt,
      sheetRefusedAt,
      sheetRefusedReason,
    } = user;
    res.json({
      status: 0,
      username,
      sheetApprovedAt,
      sheetRefusedAt,
      sheetRefusedReason,
    });
  }).catch(errorResponse(req, res));
});

api.post('/publishers/:username/actions/refuse', (req, res) => {
  const {
    username,
  } = req.params;
  const {
    reason,
  } = req.body;
  const objectId = (/^id:(.+)/.exec(username) || [])[1];
  User.findOneAndUpdate(objectId ? {
    id: username,
  } : {
    username,
  }, {
    sheetApprovedAt: new Date(0),
    sheetRefusedAt: Date.now(),
    sheetRefusedReason: reason,
  }, {
    'new': true,
  }).exec().then(user => {
    const {
      sheetApprovedAt,
      sheetRefusedAt,
      sheetRefusedReason,
    } = user;
    res.json({
      status: 0,
      username,
      sheetApprovedAt,
      sheetRefusedAt,
      sheetRefusedReason,
    });
  }).catch(errorResponse(req, res));
});

api.post('/publishers/:username/actions/publish', (req, res) => {
  const {
    username,
  } = req.params;
  const objectId = (/^id:(.+)/.exec(username) || [])[1];
  User.findOneAndUpdate(objectId ? {
    id: username,
  } : {
    username,
  }, {
    publishedAt: Date.now(),
  }, {
    'new': true,
  }).exec().then(user => {
    const {
      publishedAt,
    } = user;
    res.json({
      status: 0,
      username,
      publishedAt,
    });
  }).catch(errorResponse(req, res));
});

api.post('/publishers/:username/actions/edit', (req, res) => {
  const {
    username,
  } = req.params;
  const {
    group,
  } = req.query;
  const objectId = (/^id:(.+)/.exec(username) || [])[1];
  User.findOneAndUpdate(objectId ? {
    id: username,
  } : {
    username,
  }, {
    group,
  }, {
    'new': true,
  }).exec().then(user => {
    const {
      group,
    } = user;
    res.json({
      status: 0,
      username,
      group,
    });
  }).catch(errorResponse(req, res));
});

export default api;
