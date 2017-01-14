/* eslint max-nested-callbacks: 0 */

// import { expect } from 'chai';
import request from 'supertest';
import app from '../../../../server';
import connectServices from '../../../lib/connectServices';

describe('floducer auth', function () {

  const USERNAME = `user4test${Date.now()}`;
  const PASSWORD = 'B33eE+An';

  before(function (done) {
    Promise.all(connectServices).then(() => {
      done();
    });
  });

  it('/api/floducer/signup', function (done) {
    request(app)
      .post('/api/floducer/signup')
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

    it('/api/floducer/signup - username exist', function (done) {
      request(app)
        .post('/api/floducer/signup')
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

    it('/api/floducer/signin', function (done) {
      request(app)
        .post('/api/floducer/signin')
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

    it('/api/floducer/signin - Wrong username', function (done) {
      request(app)
        .post('/api/floducer/signin')
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

    it('/api/floducer/signin - Wrong password', function (done) {
      request(app)
        .post('/api/floducer/signin')
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

      it('/api/floducer/info', function (done) {
        request(app)
          .get('/api/floducer/info')
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

      it('/api/floducer/info - Unauthorized', function (done) {
        request(app)
          .get('/api/floducer/info')
          .set('Accept', 'application/json')
          .set('Authorization', 'Bearer fdsafsdafwefewf')
          .expect(401, done);
      });

    });

  });

});
