/* eslint max-nested-callbacks: 0 */

// import { expect } from 'chai';
import request from 'supertest';
import app from '../../../../server';
import connectServices from '../../../lib/connectServices';
import sheetDataFactory from '../../../data/sheet';

const userData = {
  username: `${process.env.FL_FLODUCER_TEST_USER}${Date.now()}`,
  password: 'B33eE+An',
};

const sheetData = sheetDataFactory();

describe('floducer publisher', function () {

  let jwtToken;

  before(function (done) {
    Promise.all(connectServices).then(() => {
      request(app)
        .post('/api/floducer/signup')
        .set('Accept', 'application/json')
        .send(userData)
        .expect('Content-Type', /json/)
        .expect(200, (err) => {
          if (err) {
            done(err);
          }
          request(app)
            .post('/api/floducer/signin')
            .set('Accept', 'application/json')
            .send(userData)
            .expect('Content-Type', /json/)
            .expect(200, (err, res) => {
              if (err) {
                done(err);
              }
              jwtToken = res.body.token;
              done();
            });
        });
    });
  });

  it('/api/floducer/publisher/contract/actions/sign', function (done) {
    const startTime = Date.now();
    request(app)
      .post('/api/floducer/publisher/contract/actions/sign')
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
          contractSignedAt,
        } = body;
        const signTime = new Date(contractSignedAt);
        if (signTime.getTime() < startTime) {
          return done(new Error('WRONG contractSignedAt'));
        }
        return done();
      });
  });

  it('/api/floducer/publisher/sheet/actions/update', function (done) {
    const startTime = Date.now();
    request(app)
      .post('/api/floducer/publisher/sheet/actions/update')
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send(sheetData)
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
          contractSignedAt,
          sheetUpdatedAt,
          sheetApprovedAt,
          sheetRefusedAt,
        } = body.data;
        const signTime = new Date(contractSignedAt);
        const updateTime = new Date(sheetUpdatedAt);
        if (updateTime.getTime() < startTime
            || updateTime.getTime() < signTime.getTime()) {
          return done(new Error('WRONG sheetUpdatedAt'));
        }
        if (new Date(sheetApprovedAt).getTime()
            || new Date(sheetRefusedAt).getTime()) {
          return done(new Error('WRONG sheetApprovedAt OR sheetRefusedAt'));
        }
        return done();
      });
  });

  describe('floducer publisher (sheet updated)', function () {

    it('/api/floducer/publisher/access', function (done) {
      request(app)
        .get('/api/floducer/publisher/access')
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
            sheet,
          } = body.data;
          for (const key in sheet) {
            if (sheet[key] !== sheetData[key]) {
              return done(new Error(`WRONG SHEET KEY: ${key}`));
            }
          }
          for (const key in sheetData) {
            if (sheet[key] !== sheetData[key]) {
              return done(new Error(`WRONG SHEET KEY: ${key}`));
            }
          }
          return done();
        });
    });

  });

});
