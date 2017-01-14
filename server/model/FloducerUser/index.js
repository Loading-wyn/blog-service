
import mongoose from 'mongoose';
import isEmail from 'validator/lib/isEmail';
import isMobilePhone from 'validator/lib/isMobilePhone';
import isURL from 'validator/lib/isURL';
import {
  RE_SPECIAL_CHAR,
  stringLengthByDoubleByte,
  isUsername,
  isPassword,
} from '../../lib/validators';
import {
  passwordGetter,
  passwordSetter,
} from '../../lib/modelUtils';

const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: isUsername,
      message: '{VALUE} is not a valid username!',
    },
  },
  password: {
    type: String,
    required: true,
    validate: {
      validator: isPassword,
      message: '{VALUE} is not a valid password!',
    },
  },
  group: {
    type: String,
    'enum': [
      'publisher',
      'curator',
      'superadmin',
      'tester',
    ],
    'default': 'publisher',
  },
  contractSignedAt: {
    type: Date,
    'default': new Date(0),
  },
  sheetUpdatedAt: {
    type: Date,
    'default': new Date(0),
  },
  sheetApprovedAt: {
    type: Date,
    'default': new Date(0),
  },
  sheetRefusedAt: {
    type: Date,
    'default': new Date(0),
  },
  sheetRefusedReason: {
    type: String,
    'default': '',
  },
  publishedAt: {
    type: Date,
    'default': new Date(0),
  },
  sheet: {
    name: {
      type: String,
      'default': '',
      validate: {
        validator(value) {
          if (value === '') {
            return true;
          }
          const length = stringLengthByDoubleByte(value);
          if (RE_SPECIAL_CHAR.test(value)
              || length < 2
              || length > 10) {
            return false;
          }
          return true;
        },
        message: '{VALUE} is not a valid name!',
      },
    },
    desc: {
      type: String,
      'default': '',
      validate: {
        validator(value) {
          if (value === '') {
            return true;
          }
          const length = stringLengthByDoubleByte(value);
          if (length > 30) {
            return false;
          }
          return true;
        },
        message: '{VALUE} is not a valid desc!',
      },
    },
    logo: {
      type: String,
      'default': '',
      validate: {
        validator(value) {
          if (value === '') {
            return true;
          }
          return isURL(value);
        },
        message: '{VALUE} is not a valid image url!',
      },
    },
    phone: {
      type: String,
      'default': '',
      validate: {
        validator(value) {
          if (value === '') {
            return true;
          }
          return isMobilePhone(value, 'zh-CN');
        },
        message: '{VALUE} is not a valid mobile phone number!',
      },
    },
    email: {
      type: String,
      'default': '',
      validate: {
        validator(value) {
          if (value === '') {
            return true;
          }
          return isEmail(value);
        },
        message: '{VALUE} is not a valid email!',
      },
    },
    appUsername: {
      type: String,
      'default': '',
    },
    appPassword: {
      type: String,
      'default': '',
      get: passwordGetter,
      set: passwordSetter,
    },
  },
  magazines: {
    type: [{
      type: ObjectId,
      ref: 'Magazine',
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
      delete json.password;
      // delete json.magazines;
      delete json._id;
      delete json.id;
    },
  },
});

userSchema.virtual('defaultMagazineId').get(function () {
  return this.magazines[0];
});

userSchema.virtual('defaultMagazineId').set(function (value) {
  this.magazines[0] = value;
});

const User = mongoose.model('FloducerUser', userSchema);

export default User;
