
import mongoose from './mongoose';
import redis from './redis';

const connectServices = [];
connectServices.push(mongoose);
connectServices.push(redis);

export default connectServices;
