
import mongoose from 'mongoose';
import {
  RE_SPECIAL_CHAR,
} from '../../lib/validators';

const Schema = mongoose.Schema;

const ArticleSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  summary: {
    type: String,
    'default': '',
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  comments: {
    type: [{
      author: {
        type: String,
        required: true,
      },
      createdAt: {
        type: Date,
        'default': new Date(0),
      },
      content: {
        type: String,
        required: true,
      },
    }],
    'default': [],
    index: true,
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
    index: true,
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
  },
});

const Article = mongoose.model('Article', ArticleSchema);

export default Article;
