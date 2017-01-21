
/* eslint max-nested-callbacks: 0 */

// import { expect } from 'chai';
import request from 'supertest';
import app from '../../../../server';
import connectServices from '../../../lib/connectServices';

describe('blog auth', function () {

  const USERNAME = `user4test${Date.now()}`;
  const PASSWORD = 'B33eE+An';

  before(function (done) {
    Promise.all(connectServices).then(() => {
      done();
    });
  });

  it('/api/blog/signup', function (done) {
    request(app)
      .post('/api/blog/signup')
      .set('Accept', 'application/json')
      .send({
        username: USERNAME,
        password: PASSWORD,
      })
      .expect('Content-Type', /json/)
      .expect(200, (err, res) => {
        if (err) {
          return done(err);
        }
        const body = res.body;
        if (body.status) {
          return done(new Error(body.message));
        }
        return done();
      });
  });

  describe('after sign up...', function () {

    let token;

    it('/api/blog/signup - username exist', function (done) {
      request(app)
        .post('/api/blog/signup')
        .set('Accept', 'application/json')
        .send({
          username: USERNAME,
          password: 'B33eE+An2',
        })
        .expect('Content-Type', /json/)
        .expect(200, (err, res) => {
          if (err) {
            return done(err);
          }
          const body = res.body;
          if (body.status !== -1) {
            return done(new Error('NO USER EXIST ERROR'));
          }
          return done();
        });
    });

    it('/api/blog/signin', function (done) {
      request(app)
        .post('/api/blog/signin')
        .set('Accept', 'application/json')
        .send({
          username: USERNAME,
          password: PASSWORD,
        })
        .expect('Content-Type', /json/)
        .expect(200, (err, res) => {
          if (err) {
            return done(err);
          }
          const body = res.body;
          if (body.status) {
            return done(new Error(body.message));
          }
          if (!body.token) {
            return done(new Error('NO TOKEN'));
          }
          token = body.token;
          return done();
        });
    });

    it('/api/blog/signin - Wrong username', function (done) {
      request(app)
        .post('/api/blog/signin')
        .set('Accept', 'application/json')
        .send({
          username: 'user4test00000',
          password: PASSWORD,
        })
        .expect('Content-Type', /json/)
        .expect(200, (err, res) => {
          if (err) {
            return done(err);
          }
          const body = res.body;
          if (body.status !== -2) {
            return done(new Error('NO WRONG USERNAME ERROR'));
          }
          return done();
        });
    });

    it('/api/blog/signin - Wrong password', function (done) {
      request(app)
        .post('/api/blog/signin')
        .set('Accept', 'application/json')
        .send({
          username: USERNAME,
          password: 'B33eE+An3',
        })
        .expect('Content-Type', /json/)
        .expect(200, (err, res) => {
          if (err) {
            return done(err);
          }
          const body = res.body;
          if (body.status !== -1) {
            return done(new Error('NO WRONG PASSWORD ERROR'));
          }
          return done();
        });
    });

    describe('after sign in...', function () {

      it('/api/blog/info', function (done) {
        request(app)
          .get('/api/blog/info')
          .set('Accept', 'application/json')
          .set('Authorization', `Bearer ${token}`)
          .expect(200, (err, res) => {
            if (err) {
              return done(err);
            }
            const body = res.body;
            if (body.username !== USERNAME) {
              return done(new Error('WRONG USERNAME'));
            }
            return done();
          });
      });

      it('/api/blog/info - Unauthorized', function (done) {
        request(app)
          .get('/api/blog/info')
          .set('Accept', 'application/json')
          .set('Authorization', 'Bearer fdsafsdafwefewf')
          .expect(401, done);
      });
    });
  });
});
