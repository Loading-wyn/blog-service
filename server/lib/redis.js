
import Redis from 'ioredis';

const config = {
  host: process.env.FL_REDIS_HOST,
  port: process.env.FL_REDIS_PORT,
  db: 0,
};

if (process.env.FL_REDIS_PASSWORD) {
  config.password = process.env.FL_REDIS_PASSWORD;
}

const redis = new Redis(config);

redis.Redis = Redis;

export default redis;
