import request from 'supertest';
import app from '../../../../server';
import articleData from '../../../data/article.js';
import connectServices from '../../../lib/connectServices';

const adminJwtToken = process.env.FL_FLODUCER_TEST_ADMIN_TOKEN;
const jwtToken = process.env.FL_FLODUCER_TEST_TOKEN;
const tempUserData = {
  username: `${process.env.FL_FLODUCER_TEST_USER}${Date.now()}`,
  password: 'B33eE+An',
};

let fashionArticleId, commentId, tempjwtToken;
describe('blog article', () => {
  before(done => {
    Promise.all(connectServices).then(() => {
      return new Promise((resolve, reject) => {
        request(app)
          .post('/api/blog/signup')
          .set('Accept', 'application/json')
          .send(tempUserData)
          .expect('Content-Type', /json/)
          .expect(200, (err) => {
            if (err) {
              reject(err);
            }
            resolve();
          });
      });
    }).then(() => {
      return Promise.all([
        new Promise((resolve, reject) => {
          request(app)
          .post('/api/blog/supervisor/articles/actions/publish')
          .set('Accept', 'application/json')
          .set('Authorization', `Bearer ${adminJwtToken}`)
          .send(articleData())
          .expect('Content-Type', /json/)
          .expect(200, (err, res) => {
            if (err) {
              return reject(err);
            }
            const {
              body,
            } = res;
            const {
              id,
            } = body;
            if (body.status) {
              return reject(new Error(body.message));
            }
            if (!id) {
              return reject(new Error('NO MATCH'));
            }
            fashionArticleId = id;
            return resolve();
          });
        }),
        new Promise((resolve, reject) => {
          request(app)
          .post('/api/blog/signin')
          .set('Accept', 'application/json')
          .send(tempUserData)
          .expect('Content-Type', /json/)
          .expect(200, (err, res) => {
            if (err) {
              reject(err);
            }
            const body = res.body;
            if (body.status) {
              return done(new Error(body.message));
            }
            if (!body.token) {
              return done(new Error('NO TOKEN'));
            }
            tempjwtToken = body.token;
            return resolve();
          });
        }),
      ]);
    }).then(() => {
      return new Promise((resolve, reject) => {
        request(app)
          .post(`/api/blog/articles/${fashionArticleId}/comments/action/publish`)
          .set('Accept', 'application/json')
          .set('Authorization', `Bearer ${jwtToken}`)
          .send({ content: 'test comment' })
          .expect('Content-Type', /json/)
          .expect(200, (err, res) => {
            if (err) {
              return reject(err);
            }
            const {
              body,
            } = res;
            if (body.status) {
              return reject(new Error(body.message));
            }
            const {
              comment,
            } = body;
            commentId = comment._id;
            logger.info(22222, commentId);
            if (comment.content !== 'test comment') {
              return reject(new Error('NO MATCH'));
            }
            return resolve();
          });
      });
    }).then(() => {
      done();
    }).catch(done);
  });

  it('/api/blog/articles/list', done => {
    request(app)
      .get('/api/blog/articles/list')
      .query({
        limit: 10,
        skip: 0,
        keywords: ['fashion', 'test'],
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, (err, res) => {
        if (err) {
          return done(err);
        }
        const {
          body,
        } = res;
        if (body.status) {
          return done(new Error(body.message));
        }
        const {
          articles,
        } = body;
        if (articles.length < 1) {
          return done(new Error('NO MATCH'));
        }
        return done();
      });
  });

  it('/api/blog/articles/:articleId', done => {
    request(app)
      .get(`/api/blog/articles/${fashionArticleId}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, (err, res) => {
        if (err) {
          return done(err);
        }
        const {
          body,
        } = res;
        if (body.status) {
          return done(new Error(body.message));
        }
        const {
          article,
        } = body;
        if (article.content !== 'good content') {
          return done(new Error('NO MATCH'));
        }
        return done();
      });
  });

  it('/api/blog/articles/:articleId/comments', done => {
    request(app)
      .get(`/api/blog/articles/${fashionArticleId}/comments`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, (err, res) => {
        if (err) {
          return done(err);
        }
        const {
          body,
        } = res;
        if (body.status) {
          return done(new Error(body.message));
        }
        const {
          comments,
        } = body;
        if (comments.length < 1) {
          return done(new Error('NO MATCH'));
        }
        return done();
      });
  });

  it('/api/blog/articles/:articleId/comments/:commentId', done => {
    request(app)
      .get(`/api/blog/articles/${fashionArticleId}/comments/${commentId}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, (err, res) => {
        if (err) {
          return done(err);
        }
        const {
          body,
        } = res;
        if (body.status) {
          return done(new Error(body.message));
        }
        const {
          comment,
        } = body;
        if (comment.content !== 'test comment') {
          return done(new Error('NO MATCH'));
        }
        return done();
      });
  });

  it('/api/blog/articles/:articleId/comments/:commentId/action/update', done => {
    request(app)
      .post(`/api/blog/articles/${fashionArticleId}/comments/${commentId}/action/update`)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({
        content: 'new comment content',
      })
      .expect('Content-Type', /json/)
      .expect(200, (err, res) => {
        if (err) {
          return done(err);
        }
        const {
          body,
        } = res;
        if (body.status) {
          return done(new Error(body.message));
        }
        const {
          comment,
        } = body;
        if (comment._id !== commentId) {
          return done(new Error('NO MATCH'));
        }
        return done();
      });
  });

  it('/api/blog/articles/:articleId/comments/:commentId/action/update - admin', done => {
    request(app)
      .post(`/api/blog/articles/${fashionArticleId}/comments/${commentId}/action/update`)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${adminJwtToken}`)
      .send({
        content: 'new comment content 1',
      })
      .expect('Content-Type', /json/)
      .expect(200, (err, res) => {
        if (err) {
          return done(err);
        }
        const {
          body,
        } = res;
        if (body.status) {
          return done(new Error(body.message));
        }
        const {
          comment,
        } = body;
        if (comment._id !== commentId) {
          return done(new Error('NO MATCH'));
        }
        return done();
      });
  });

  it('/api/blog/articles/:articleId/comments/:commentId/action/update - wrong user', done => {
    request(app)
      .post(`/api/blog/articles/${fashionArticleId}/comments/${commentId}/action/update`)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${tempjwtToken}`)
      .send({
        content: 'new comment content',
      })
      .expect('{"status":-10,"message":" NO SUCH ARTICLE"}', done);
  });

  it('/api/blog/articles/:articleId/comments/:commentId/action/delete', done => {
    request(app)
      .post(`/api/blog/articles/${fashionArticleId}/comments/${commentId}/action/delete`)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({
        content: 'new comment content',
      })
      .expect('Content-Type', /json/)
      .expect(200, (err, res) => {
        if (err) {
          return done(err);
        }
        const {
          body,
        } = res;
        if (body.status) {
          return done(new Error(body.message));
        }
        const {
          comment,
        } = body;
        if (comment._id !== commentId) {
          return done(new Error('NO MATCH'));
        }
        return done();
      });
  });
});
