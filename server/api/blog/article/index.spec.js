import request from 'supertest';
import app from '../../../../server';
import articleData from '../../../data/article.js';
import connectServices from '../../../lib/connectServices';

const adminJwtToken = process.env.FL_FLODUCER_TEST_ADMIN_TOKEN;
const jwtToken = process.env.FL_FLODUCER_TEST_TOKEN;

let fashionArticleId;
describe('blog article', () => {
  before(done => {
    Promise.all(connectServices).then(() => {
      return Promise.all([
        new Promise((resolve, reject) => {
          request(app)
          .post('/api/blog/supervisor/articles/actions/publish')
          .set('Accept', 'application/json')
          .set('Authorization', `Bearer ${adminJwtToken}`)
          .send(articleData('fashion'))
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
            fashionArticleId = id;
            return resolve();
          });
        }),
      ]);
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

  it('/api/blog/articles/:articleId/comments/action/publish', done => {
    request(app)
      .post(`/api/blog/articles/${fashionArticleId}/comments/action/publish`)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({ content: 'test comment' })
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
        if (comments[0].content !== 'test comment') {
          return done(new Error('NO MATCH'));
        }
        return done();
      });
  });
});
