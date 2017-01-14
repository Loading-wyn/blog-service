
import { Router } from 'express';
import redis from '../../lib/redis';

const api = Router();

function likeCount(req, res) {
  const {
    sectionId,
  } = req.params;
  const {
    uid,
  } = req.query;
  const encodedSectionId = encodeURIComponent(sectionId);
  const sectionItemsKey = `homefeautred:section:${encodedSectionId}:items`;
  const items = {};
  const data = {
    items,
  };
  redis.smembers(sectionItemsKey)
    .then(itemIds => {
      return Promise.all(itemIds.map(itemId => {
        const encodedItemId = encodeURIComponent(itemId);
        const itemLikedKey = `homefeautred:item:${encodedItemId}:liked`;
        items[itemId] = {};
        const getLikeCount = redis.scard(itemLikedKey)
          .then(likeCount => {
            items[itemId].likeCount = likeCount;
          });
        const isLiked = redis.sismember(itemLikedKey, uid)
          .then(res => {
            items[itemId].liked = res === 1;
          });
        return Promise.all([getLikeCount, isLiked]);
      }));
    })
    .then(() => {
      data.success = true;
      res.json(data);
    })
    .catch(err => {
      data.success = false;
      data.message = err.message;
      logger.error(`[REDIS ERROR] ${data.message}`);
      res.json(data);
    });
}

function likeStatus(action, req, res) {
  const {
    itemId,
  } = req.params;
  const {
    uid,
    sectionId,
  } = req.body;
  const encodedSectionId = encodeURIComponent(sectionId);
  const encodedItemId = encodeURIComponent(itemId);
  const sectionItemsKey = `homefeautred:section:${encodedSectionId}:items`;
  const itemLikedKey = `homefeautred:item:${encodedItemId}:liked`;
  const addItemToSection = redis.sadd(sectionItemsKey, itemId);
  const isLikeAction = action === 'like';
  const isUnlikeAction = action === 'unlike';
  let toggleLiked;
  if (isLikeAction) {
    toggleLiked = redis.sadd(itemLikedKey, uid);
  } else if (isUnlikeAction) {
    toggleLiked = redis.srem(itemLikedKey, uid);
  }
  const data = {};
  Promise.all([addItemToSection, toggleLiked])
    .then(results => {
      data.liked = (results[1] === 1 || results[1] === 0)
        && (isLikeAction || !isUnlikeAction);
      return redis.scard(itemLikedKey);
    })
    .then(likeCount => {
      data.likeCount = likeCount;
      data.success = true;
      res.json(data);
    })
    .catch(err => {
      data.success = false;
      data.message = err.message;
      logger.error(`[REDIS ERROR] ${data.message}`);
      res.json(data);
    });
}

// deprecated
api.get('/:sectionId/likeCount', likeCount);
api.post('/:itemId/likeStatus', (req, res) => {
  likeStatus(req.body.action, req, res);
});

api.get('/sections/:sectionId/actions/count-likes', likeCount);
api.post('/items/:itemId/actions/like', (req, res) => {
  likeStatus('like', req, res);
});
api.post('/items/:itemId/actions/unlike', (req, res) => {
  likeStatus('unlike', req, res);
});

export default api;
