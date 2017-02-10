
// import { expect } from 'chai';
import request from 'supertest';
import app from '../../../../server';
import connectServices from '../../../lib/connectServices';

const jwtToken = process.env.FL_FLODUCER_TEST_ADMIN_TOKEN;

const userData = {
  username: `${process.env.FL_FLODUCER_TEST_USER}${Date.now()}`,
  password: 'B33eE+An',
};

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
      return new Promise((resolve, reject) => {
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
      });
    }).then(() => {
      done();
    }).catch(done);
  });

  it('/api/blog/users', function (done) {
    request(app)
      .get('/api/floducer/supervisor/publishers')
      .query({
        limit: 3,
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
        // logger.info(111111, users.length, users)
        if (users.length < 1) {
          return done(new Error('NO MATCH'));
        }
        return done();
      });
  });

  it('/api/blog/supervisor/users/:username/action/delete', function (done) {
    request(app)
      .get('/api/blog/supervisor/users/${userData.username}/action/delete')
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
        // logger.info(111111, magazines.length, magazines)
        if (username !== userData.username) {
          return done(new Error('NO MATCH'));
        }
        return done();
      });
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
