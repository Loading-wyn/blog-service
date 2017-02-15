
// import { expect } from 'chai';
import request from 'supertest';
import app from '../../../../server';
import connectServices from '../../../lib/connectServices';
import articleData from '../../../data/article.js';

const jwtToken = process.env.FL_FLODUCER_TEST_ADMIN_TOKEN;

const userData = {
  username: `${process.env.FL_FLODUCER_TEST_USER}${Date.now()}`,
  password: 'B33eE+An',
};

let testArticleId;
describe('blog supervisor', function () {

  before(function (done) {
    Promise.all(connectServices).then(() => {
      return new Promise((resolve, reject) => {
        request(app)
          .post('/api/blog/signup')
          .set('Accept', 'application/json')
          .send(userData)
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
          .set('Authorization', `Bearer ${jwtToken}`)
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
            testArticleId = id;
            return resolve();
          });
        }),
        new Promise((resolve, reject) => {
          request(app)
          .post('/api/blog/signin')
          .set('Accept', 'application/json')
          .send(userData)
          .expect('Content-Type', /json/)
          .expect(200, (err) => {
            if (err) {
              reject(err);
            }
            resolve();
          });
        }),
      ]);
    }).then(() => {
      done();
    }).catch(done);
  });

  it('/api/blog/supervisor/users', function (done) {
    request(app)
      .get('/api/blog/supervisor/users')
      .query({
        limit: 10,
        skip: 0,
      })
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${jwtToken}`)
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
          users,
        } = body;
        if (users.length < 1) {
          return done(new Error('NO MATCH'));
        }
        return done();
      });
  });

  it('/api/blog/supervisor/users/:username/actions/delete', function (done) {
    request(app)
      .get(`/api/blog/supervisor/users/${userData.username}/actions/delete`)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${jwtToken}`)
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
          username,
        } = body;
        if (username !== userData.username) {
          return done(new Error('NO MATCH'));
        }
        return done();
      });
  });

  it('api/blog/supervisor/articles/:articleId/actions/edit', done => {
    request(app)
    .post(`/api/blog/supervisor/articles/${testArticleId}/actions/edit`)
    .set('Accept', 'application/json')
    .set('Authorization', `Bearer ${jwtToken}`)
    .send({
      content: 'new good content',
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
        content,
        keywords,
      } = body;
      if (content !== 'new good content' || !keywords.includes('test')) {
        return done(new Error('NO MATCH'));
      }
      return done();
    });
  });

  it('api/blog/supervisor/articles/:articleId/actions/delete', done => {
    setTimeout(() => {
      request(app)
        .post(`/api/blog/supervisor/articles/${testArticleId}/actions/delete`)
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${jwtToken}`)
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
            content,
          } = body;
          if (content !== 'new good content') {
            return done(new Error('NO MATCH'));
          }
          return done();
        });
    }, 500);
  });
//  it('/api/blog/supervisor/users/:pid/actions/edit', function (done) {
//   const pid = userData.username;
//    request(app)
//      .post(`/api/floducer/blog/users/${pid}/actions/edit`)
//      .query({
//        group: 'superadmin',
//      })
//      .set('Accept', 'application/json')
//      .set('Authorization', `Bearer ${jwtToken}`)
//      .expect('Content-Type', /json/)
//      .expect(200, (err, res) => {
//        if (err) {
//          return done(err);
//        }
//        const body = res.body;
//        if (body.status) {
//          return done(new Error(body.message));
//        }
//        const {
//          group,
//        } = body;
//        if (group !== 'superadmin') {
//          return done(new Error('WRONG group'));
//        }
//        return done();
//      });
//  });

});
