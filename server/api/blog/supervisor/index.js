import { Router } from 'express';
import User from '../../../model/BlogUser';
import Article from '../../../model/Article';
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

api.get('/users/:username/actions/delete', (req, res) => {
  const {
    username,
  } = req.params;
  User.findOneAndRemove({
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

// api.post('/users/:username/actions/edit', (req, res) => {
//   const {
//     username,
//   } = req.params;
//   const {
//     group,
//   } = req.body;
//   User.findOneAndUpdate({
//     username,
//   }, {
//     group,
//   }).exec().then(user => {
//     const {
//       group,
//     } = user;
//     res.json({
//       status: 0,
//       username,
//       group,
//     });
//   }).catch(errorResponse(req, res));
// });

api.post('/articles/actions/publish', (req, res) => {
  const {
    title,
    summary,
    content,
    keywords,
  } = req.body;
  new Article({
    title,
    summary,
    content,
    keywords,
  }).save().then((article) => {
    res.json({
      status: 0,
      id: article.id,
    }).catch(errorResponse(req, res));
  });
});

api.post('/articles/:articleId/actions/delete', (req, res) => {
  const {
    articleId,
  } = req.params;
  Article.findOneAndRemove({
    id: articleId,
  }).exec().then(article => {
    const {
      id,
    } = article;
    res.json({
      status: 0,
      id,
    });
  }).catch(errorResponse(req, res));
});

api.post('/articles/:articleId/actions/edit', (req, res) => {
  const {
    articleId,
  } = req.params;
  const {
    title,
    content,
    summary,
    keywords,
  } = req.body;
  Article.findOneAndUpdate({
    id: articleId,
  }, {
    title,
    content,
    summary,
    keywords,
  }).exec().then(article => {
    const {
      id,
    } = article;
    res.json({
      status: 0,
      id,
    });
  }).catch(errorResponse(req, res));
});

export default api;
