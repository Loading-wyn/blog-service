/* eslint max-nested-callbacks: 0 */

// import { expect } from 'chai';
import request from 'supertest';
import app from '../../../../server';
import connectServices from '../../../lib/connectServices';
import sheetData from '../../../data/sheet';

const jwtToken = process.env.FL_FLODUCER_TEST_ADMIN_TOKEN;

const userData = {
  username: `${process.env.FL_FLODUCER_TEST_USER}${Date.now()}`,
  password: 'B33eE+An',
};

describe('floducer supervisor', function () {

  before(function (done) {
    let tempjwtToken;
    Promise.all(connectServices).then(() => {
      return new Promise((resolve, reject) => {
        request(app)
          .post('/api/floducer/signup')
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
          .post('/api/floducer/signin')
          .set('Accept', 'application/json')
          .send(userData)
          .expect('Content-Type', /json/)
          .expect(200, (err, res) => {
            if (err) {
              reject(err);
            }
            tempjwtToken = res.body.token;
            resolve();
          });
      });
    }).then(() => {
      return Promise.all([
        new Promise((resolve, reject) => {
          request(app)
            .post('/api/floducer/publisher/contract/actions/sign')
            .set('Accept', 'application/json')
            .set('Authorization', `Bearer ${tempjwtToken}`)
            .expect('Content-Type', /json/)
            .expect(200, (err) => {
              if (err) {
                reject(err);
              }
              resolve();
            });
        }),
        new Promise((resolve, reject) => {
          request(app)
            .post('/api/floducer/publisher/sheet/actions/update')
            .set('Accept', 'application/json')
            .set('Authorization', `Bearer ${tempjwtToken}`)
            .send(sheetData())
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

  it('/api/floducer/supervisor/publishers', function (done) {
    request(app)
      .get('/api/floducer/supervisor/publishers')
      .query({
        filter: ['contractSignedAt_1', 'sheetUpdatedAt_1', 'group_publisher'],
        sort: 'createdAt_-1',
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
        if (!users[0].magazines[0]) {
          return done(new Error('NO MAGAZINE'));
        }
        return done();
      });
  });

  it('/api/floducer/supervisor/magazines', function (done) {
    request(app)
      .get('/api/floducer/supervisor/magazines')
      .query({
        category: 'news',
        filter: ['rssSource_1'],
        sort: 'createdAt_-1',
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
          magazines,
        } = body;
        // logger.info(111111, magazines.length, magazines)
        if (magazines.length < 1) {
          return done(new Error('NO MATCH'));
        }
        if (!magazines[0].owner.username) {
          return done(new Error('NO OWNER'));
        }
        return done();
      });
  });

  it('/api/floducer/supervisor/publishers/:pid/actions/approve', function (done) {
    const startTime = Date.now();
    const pid = userData.username;
    request(app)
      .post(`/api/floducer/supervisor/publishers/${pid}/actions/approve`)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect('Content-Type', /json/)
      .expect(200, (err, res) => {
        if (err) {
          return done(err);
        }
        const body = res.body;
        if (body.status) {
          return done(new Error(body.message));
        }
        const {
          sheetApprovedAt,
          sheetRefusedAt,
          sheetRefusedReason,
        } = body;
        const actionTime = new Date(sheetApprovedAt);
        if (actionTime.getTime() < startTime) {
          return done(new Error('WRONG sheetApprovedAt'));
        }
        if (new Date(sheetRefusedAt).getTime()
            || sheetRefusedReason) {
          return done(new Error('WRONG sheetRefusedAt OR sheetRefusedReason'));
        }
        return done();
      });
  });

  it('/api/floducer/supervisor/publishers/:pid/actions/refuse', function (done) {
    const startTime = Date.now();
    const pid = userData.username;
    request(app)
      .post(`/api/floducer/supervisor/publishers/${pid}/actions/refuse`)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({
        reason: 'Haha!',
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
        const {
          sheetApprovedAt,
          sheetRefusedAt,
          sheetRefusedReason,
        } = body;
        const actionTime = new Date(sheetRefusedAt);
        if (actionTime.getTime() < startTime) {
          return done(new Error('WRONG sheetRefusedAt'));
        }
        if (new Date(sheetApprovedAt).getTime()) {
          return done(new Error('WRONG sheetApprovedAt'));
        }
        if (sheetRefusedReason !== 'Haha!') {
          return done(new Error('WRONG sheetRefusedReason'));
        }
        return done();
      });
  });

  it('/api/floducer/supervisor/publishers/:pid/actions/publish', function (done) {
    const startTime = Date.now();
    const pid = userData.username;
    request(app)
      .post(`/api/floducer/supervisor/publishers/${pid}/actions/publish`)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect('Content-Type', /json/)
      .expect(200, (err, res) => {
        if (err) {
          return done(err);
        }
        const body = res.body;
        if (body.status) {
          return done(new Error(body.message));
        }
        const {
          publishedAt,
        } = body;
        const actionTime = new Date(publishedAt);
        if (actionTime.getTime() < startTime) {
          return done(new Error('WRONG publishedAt'));
        }
        return done();
      });
  });

  it('/api/floducer/supervisor/publishers/:pid/actions/edit', function (done) {
    const pid = userData.username;
    request(app)
      .post(`/api/floducer/supervisor/publishers/${pid}/actions/edit`)
      .query({
        group: 'curator',
      })
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect('Content-Type', /json/)
      .expect(200, (err, res) => {
        if (err) {
          return done(err);
        }
        const body = res.body;
        if (body.status) {
          return done(new Error(body.message));
        }
        const {
          group,
        } = body;
        if (group !== 'curator') {
          return done(new Error('WRONG group'));
        }
        return done();
      });
  });

});
