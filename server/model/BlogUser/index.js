
import mongoose from 'mongoose';
import isURL from 'validator/lib/isURL';
import {
  isUsername,
  isPassword,
} from '../../lib/validators';

const Schema = mongoose.Schema;
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
      'visitor',
      'superadmin',
    ],
    'default': 'visitor',
  },
  avatar: {
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
});

const User = mongoose.model('BlogUser', userSchema);

export default User;
