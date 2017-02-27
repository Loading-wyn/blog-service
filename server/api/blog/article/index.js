import { Router } from 'express';
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
    fields: 'comments',
  }).exec().then(article => {
    const {
      comments,
    } = article;
    res.json({
      status: 0,
      comment: comments[comments.length - 1],
    });
  }).catch(errorResponse(req, res));
});

api.get('/:articleId/comments/:commentId', (req, res) => {
  const {
    articleId,
    commentId,
  } = req.params;
  Article.findOne({
    _id: articleId,
    'comments._id': commentId,
  }, {
    'new': true,
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
    content,
  } = body;
  const query = {
    _id: articleId,
    'comments._id': commentId,
  };
  if (group !== 'superadmin') {
    query['comments.author'] = username;
  }
  Article.findOneAndUpdate(query, {
    'comments.$.content': content,
  }, {
    fields: { 'comments.$': 1 },
  }).exec().then(article => {
    if (!article) {
      const errData = JSON.stringify({
        status: -10,
      });
      throw new Error(`[[${errData}]] NO SUCH ARTICLE`);
    }
    const comment = article.comments[0];
    res.json({
      status: 0,
      comment,
    });
  }).catch(errorResponse(req, res));
});

api.post('/:articleId/comments/:commentId/action/delete', (req, res) => {
  const {
    commentId,
    articleId,
  } = req.params;
  const {
    user,
  } = req;
  const {
    username,
    group,
  } = user;
  const update = {
    $pull: { comments: { _id: commentId } },
  };
  if (group !== 'superadmin') {
    update['$pull'].comments.author = username;
  }
  Article.findOneAndUpdate({
    _id: articleId,
    'comments._id': commentId,
  }, update, {
    fields: { 'comments.$': 1 },
  }).exec().then(article => {
    if (!article) {
      const errData = JSON.stringify({
        status: -10,
      });
      throw new Error(`[[${errData}]] NO SUCH ARTICLE`);
    }
    const comment = article.comments[0];
    res.json({
      status: 0,
      comment,
    });
  }).catch(errorResponse(req, res));
});
export default api;
