import { Router } from 'express';
import User from '../../../model/BlogUser';
import errorResponse from '../../../lib/errorResponse';

const api = Router();

api.get('/users', (req, res) => {
  const {
    limit,
    skip,
  } = req.query;
  User.find()
    .skip(parseInt(skip, 10))
    .limit(parseInt(limit, 10))
    .exec().then(users => {
      res.json({
        status: 0,
        users: users.map(user => {
          const data = user.toJSON();
          return data;
        }),
      });
    }).catch(errorResponse(req, res));
});

api.post('/users/:username/actions/delete', (req, res) => {
  const {
    username,
  } = req.params;
  const objectId = (/^id:(.+)/.exec(username) || [])[1];
  User.findOneAndRemove(objectId ? {
    id: username,
  } : {
    username,
  }).exec().then(user => {
    const {
      username,
    } = user;
    res.json({
      status: 0,
      username,
    });
  }).catch(errorResponse(req, res));
});

api.post('/users/:username/actions/refuse', (req, res) => {
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

api.post('/users/:username/actions/edit', (req, res) => {
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
