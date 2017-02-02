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
  Article.findOne({
    id: articleId,
  }).exec().then(article => {
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
  Article.findOne({
    id: articleId,
  }, {
    comments: 1,
  }).exec().then(article => {
    res.json({
      status: 0,
      comments: article.comments,
    });
  }).catch(errorResponse(req, res));
});

api.post('/:articleId/comments/action/pulish', (req, res) => {
  const {
    articleId,
  } = req.params;
  const {
    username,
  } = req;
  const {
    content,
  } = req.body;
  Article.findOneAndUpdate({
    id: articleId,
  }, {
    $push: {
      comments: {
        author: username,
        content,
      },
    },
  }).exec().then(() => {
    res.json({
      status: 0,
      content,
    });
  }).catch(errorResponse(req, res));
});

api.get('/:articleId/comment/:commentId', (req, res) => {
  const {
    articleId,
    commentId,
  } = req.params;
  User.findOne({
    id: articleId,
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
    username,
  } = req;
  User.findOneAndUpdate({
    id: articleId,
    'comments.id': commentId,
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
});

export default api;
