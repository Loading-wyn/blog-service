// import { expect } from 'chai';
import request from 'supertest';
import app from '../../../../server';
import fs from 'fs';

describe('/api/floducer/homefeatured', function () {

  let mock;
  this.timeout(7000);

  before(function () {
    mock = JSON.parse(fs.readFileSync('./server/api/floducer/homefeatured/mock/data.json', 'utf8'));
  });

  it('/actions/save', function (done) {
    request(app)
      .post('/api/floducer/homefeatured/actions/save')
      .query({
        type: 'photofeat',
        date: '2016-06-10',
      }).set('Accept', 'application/json')
      .set('Authorization', `Bearer ${process.env.FL_FLODUCER_TEST_ADMIN_TOKEN}`)
      .send(mock)
      .expect('Content-Type', /json/)
      .expect(201, (err, res) => {
        if (err) {
          return done(err);
        }
        const body = res.body;
        if (body.status < 0) {
          return done(new Error(body.message));
        }
        const loc = res.get('Location');
        if (!loc) {
          return done(new Error(`Wrong Location header: ${loc}`));
        }
        return done();
      });
  });

});
