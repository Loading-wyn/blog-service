
// import { expect } from 'chai';
import request from 'supertest';
import app from '../../../server';

describe('/api/homefeatured', function () {

  this.timeout(7000);

  it('/sections/:sectionId/actions/count-likes', function (done) {
    // {
    //   success: true,
    //   message: '',
    //   items: {
    //     'itemId-1': {
    //       likeCount: 100,
    //       liked: false,
    //     },
    //     'itemId-1': {
    //       likeCount: 2,
    //       liked: true,
    //     },
    //   }
    // }
    request(app)
      .get('/api/homefeatured/sectionIdForTest/likeCount')
      .query({
        uid: 'uidForTest',
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, (err, res) => {
        if (err) {
          return done(err);
        }
        const body = res.body;
        if (!body.success) {
          return done(new Error(body.message));
        }
        if (typeof body.items !== 'object') {
          return done(new Error('Wrong items'));
        }
        let itemCount = 0;
        for (const itemId in body.items) {
          itemCount++;
          const item = body.items[itemId];
          if (typeof item !== 'object') {
            return done(new Error('Wrong item'));
          }
          if (!(item.likeCount >= 0)) {
            return done(new Error('Wrong item.likeCount'));
          }
          if (typeof item.liked !== 'boolean') {
            return done(new Error('Wrong item.liked'));
          }
        }
        const itemForTestLike = body.items['itemIdForTestLike'];
        if (itemForTestLike && itemCount < 2) {
          return done(new Error('items count should be 2'));
        }
        if (itemForTestLike && itemForTestLike.liked !== true) {
          return done(new Error('itemIdForTestLike should be liked'));
        }
        return done();
      });
  });

  it('/items/:itemId/actions/like', function (done) {
    // {
    //   success: true,
    //   message: '',
    //   likeCount: 100,
    //   liked: false,
    // }
    request(app)
      .post('/api/homefeatured/items/itemIdForTestLike/actions/like')
      .send({
        uid: 'uidForTest',
        sectionId: 'sectionIdForTest',
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, (err, res) => {
        if (err) {
          return done(err);
        }
        const body = res.body;
        if (!body.success) {
          return done(new Error(body.message));
        }
        if (!(body.likeCount > 0)) {
          return done(new Error('Wrong likeCount'));
        }
        if (body.liked !== true) {
          return done(new Error('"liked" should be true'));
        }
        return done();
      });
  });

  it('/items/:itemId/actions/unlike', function (done) {
    request(app)
      .post('/api/homefeatured/items/itemIdForTestUnlike/actions/unlike')
      .send({
        uid: 'uidForTest',
        sectionId: 'sectionIdForTest',
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, (err, res) => {
        if (err) {
          return done(err);
        }
        const body = res.body;
        if (!body.success) {
          return done(new Error(body.message));
        }
        if (!(body.likeCount >= 0)) {
          return done(new Error('Wrong likeCount'));
        }
        if (body.liked !== false) {
          return done(new Error('"liked" should be false'));
        }
        return done();
      });
  });

  it('likeStatus - like', function (done) {
    // {
    //   success: true,
    //   message: '',
    //   likeCount: 100,
    //   liked: false,
    // }
    request(app)
      .post('/api/homefeatured/itemIdForTestLike/likeStatus')
      .send({
        uid: 'uidForTest',
        sectionId: 'sectionIdForTest',
        action: 'like',
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, (err, res) => {
        if (err) {
          return done(err);
        }
        const body = res.body;
        if (!body.success) {
          return done(new Error(body.message));
        }
        if (!(body.likeCount > 0)) {
          return done(new Error('Wrong likeCount'));
        }
        if (body.liked !== true) {
          return done(new Error('"liked" should be true'));
        }
        return done();
      });
  });

  it('likeStatus - unlike', function (done) {
    request(app)
      .post('/api/homefeatured/itemIdForTestUnlike/likeStatus')
      .send({
        uid: 'uidForTest',
        sectionId: 'sectionIdForTest',
        action: 'unlike',
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, (err, res) => {
        if (err) {
          return done(err);
        }
        const body = res.body;
        if (!body.success) {
          return done(new Error(body.message));
        }
        if (!(body.likeCount >= 0)) {
          return done(new Error('Wrong likeCount'));
        }
        if (body.liked !== false) {
          return done(new Error('"liked" should be false'));
        }
        return done();
      });
  });

});
