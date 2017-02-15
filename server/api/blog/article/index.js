import { Router } from 'express';
import User from '../../../model/BlogUser';
import Article from '../../../model/Article';
import errorResponse from '../../../lib/errorResponse';

const api = Router();

api.get('/list', (req, res) => {
  const {
    keywords,
    limit,
    skip,
  } = req.query;
  Article.find({
    keywords: {
      $in: keywords,
    },
  })
    .skip(parseInt(skip, 10))
    .limit(parseInt(limit, 10))
    .exec().then(articles => {
      res.json({
        status: 0,
        articles: articles.map(article => {
          const data = article.toJSON();
          return data;
        }),
      });
    }).catch(errorResponse(req, res));
});

api.get('/:articleId', (req, res) => {
  const {
    articleId,
  } = req.params;
  Article.findById(articleId)
  .exec()
  .then(article => {
    delete article.comments;
    res.json({
      status: 0,
      article,
    });
  }).catch(errorResponse(req, res));
});

api.get('/:articleId/comments', (req, res) => {
  const {
    articleId,
  } = req.params;
  Article.findById(articleId, {
    comments: 1,
  }).exec().then(article => {
    res.json({
      status: 0,
      comments: article.comments,
    });
  }).catch(errorResponse(req, res));
});

api.post('/:articleId/comments/action/publish', (req, res) => {
  const {
    articleId,
  } = req.params;
  const {
    user,
  } = req;
  const {
    content,
  } = req.body;
  Article.findByIdAndUpdate(articleId, {
    $push: {
      comments: {
        author: user.username,
        content,
      },
    },
  }, {
    'new': true,
  }).exec().then(article => {
    res.json({
      status: 0,
      comments: article.comments,
    });
  }).catch(errorResponse(req, res));
});

api.get('/:articleId/comment/:commentId', (req, res) => {
  const {
    articleId,
    commentId,
  } = req.params;
  User.findOne({
    _id: articleId,
    'comments.id': commentId,
  }, {
    'comments.$': 1,
  }).exec().then(article => {
    res.json({
      status: 0,
      comment: article.comments[0],
    });
  }).catch(errorResponse(req, res));
});

api.post('/:articleId/comments/:commentId/action/update', (req, res) => {
  const {
    commentId,
    articleId,
  } = req.params;
  const {
    user,
    body,
  } = req;
  const {
    username,
    group,
  } = user;
  const {
    username: target,
  } = body;
  if (group === 'superadmin' || target === username) {
    User.findOneAndUpdate({
      _id: articleId,
      'comments._id': commentId,
      'comments.author': username,
    }, {
      'comments.$': 1,
    }).exec().then(article => {
      const comment = article.comments[0];
      res.json({
        status: 0,
        comment,
      });
    }).catch(errorResponse(req, res));
  } else {
    res.status(403).send('permission denied');
  }
});

export default api;
