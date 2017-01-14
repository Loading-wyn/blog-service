
import mongoose from 'mongoose';
import isURL from 'validator/lib/isURL';
import {
  RE_SPECIAL_CHAR,
} from '../../lib/validators';

const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const magazineSchema = new Schema({
  owner: {
    type: ObjectId,
    ref: 'FloducerUser',
  },
  magName: {
    type: String,
    unique: true,
    required: true,
  },
  magDesc: {
    type: String,
    'default': '',
  },
  category: {
    type: String,
    'enum': [
      'tech',
      'digital',
      'fashion',
      'news',
      'auto',
      'consume',
    ],
    required: true,
  },
  keywords: {
    type: [{
      type: String,
      validate: {
        validator(value) {
          return !RE_SPECIAL_CHAR.test(value);
        },
        message: '{VALUE} is not a valid keyword!',
      },
    }],
    'default': [],
  },
  rssSource: {
    type: String,
    'default': '',
    validate: {
      validator(value) {
        if (value === '') {
          return true;
        }
        return isURL(value);
      },
      message: '{VALUE} is not a valid url!',
    },
  },
  wechatSource: {
    type: String,
    'default': '',
  },
  assetTier1: {
    type: [{
      type: String,
      validate: {
        validator: isURL,
        message: '{VALUE} is not a valid image url!',
      },
    }],
    'default': [],
  },
}, {
  autoIndex: true,
  emitIndexErrors: true,
  timestamps: true,
  toObject: {
    virtuals: true,
  },
  toJSON: {
    versionKey: false,
    getters: true,
    transform: (doc, json) => {
      json.keywords = doc.keywords.join(', ');
      json.assetTier1.forEach(function (url, i) {
        this[`assetTier1no${i + 1}`] = url;
      }, json);
      delete json.assetTier1;
      delete json._id;
      delete json.id;
    },
  },
});

const Magazine = mongoose.model('Magazine', magazineSchema);

export default Magazine;
