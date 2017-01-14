
import mongoose from 'mongoose';
import qs from 'qs';
import logger from './logger';

mongoose.Promise = global.Promise;

const node1Host = process.env.FL_MONGO_NODE1_HOST;
const node1Port = process.env.FL_MONGO_NODE1_PORT;
const node2Host = process.env.FL_MONGO_NODE2_HOST;
const node2Port = process.env.FL_MONGO_NODE2_PORT;
const dbname = process.env.FL_MONGO_DB;
const replset = process.env.FL_MONGO_REPLSET;

const nodes = [`${node1Host}:${node1Port}`];
if (node2Host) {
  nodes.push(`${node2Host}:${node2Port}`);
}
const opt = {};
if (replset) {
  opt.replicaSet = replset;
}
let optString = qs.stringify(opt);
if (optString) {
  optString = `?${optString}`;
}
const uri = `mongodb://${nodes.join(',')}/${dbname}${optString}`;
logger.info(`connecting mongodb: ${uri}`);

const connectionThenable = mongoose.connect(uri, {
  user: process.env.FL_MONGO_USERNAME,
  pass: process.env.FL_MONGO_PASSWORD,
});

export default connectionThenable;
