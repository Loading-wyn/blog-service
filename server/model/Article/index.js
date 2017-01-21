
import mongoose from 'mongoose';
import {
  RE_SPECIAL_CHAR,
} from '../../lib/validators';

const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const ArticleSchema = new Schema({
  article: {
    type: String,
    unique: true,
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
        type: ObjectId,
        ref: 'BlogUser',
      },
      content: {
        type: String,
        required: true,
      },
    }],
    'default': [],
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
      delete json._id;
      delete json.id;
    },
  },
});

const Article = mongoose.model('Article', ArticleSchema);

export default Article;
