
import { Router } from 'express';
import jwtMiddleware from 'express-jwt';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from '../../../model/FloducerUser';
import errorResponse from '../../../lib/errorResponse';

const JWT_SECRET = process.env.FL_FLODUCER_JWT_SECRET;
const SALT_ROUNDS = 10;
const ADMIN_GROUP = JSON.parse(process.env.FL_FLODUCER_ADMIN_GROUP || '[]');
const userInfo = user => {
  const group = ADMIN_GROUP.includes(user.username)
    && 'superadmin' || user.group;
  const isAdmin = group === 'curator' || group === 'superadmin';
  return {
    username: user.username,
    group,
    isAdmin,
  };
};

export const authorized = jwtMiddleware({
  secret: JWT_SECRET,
}).unless({
  path: [
    '/api/floducer/signup',
    '/api/floducer/signin',
  ],
});

export function unauthorized(err, req, res, next) {
  if (err.name === 'UnauthorizedError') {
    res.status(401).send('invalid token...');
  } else {
    next(err);
  }
}

export function needAdmin(req, res, next) {
  if (!req.user.isAdmin) {
    res.status(403).send('need admin');
  } else {
    next();
  }
}

export const authAPI = Router();

authAPI.post('/signup', (req, res) => {
  const {
    username,
    password,
  } = req.body;
  req.checkBody('username', 'Invalid username').notEmpty().isUsername();
  req.checkBody('password', 'Invalid password').notEmpty().isPassword();
  const errors = req.validationErrors();
  if (errors) {
    return res.json({
      status: -2,
      message: 'Invalid username or password',
    });
  }
  return bcrypt.hash(password, SALT_ROUNDS, (err, hash) => {
    if (err) {
      return res.json({
        status: -3,
        message: 'PW HASH ERROR',
      });
    }
    return User.findOne({
      username,
    }).exec().then(user => {
      if (user) {
        return {};
      }
      return new User({
        username,
        password: hash,
      }).save();
    }).then(({
      username,
    }) => {
      if (!username) {
        const errData = JSON.stringify({
          status: -1,
          isExpected: true,
        });
        throw new Error(`[[${errData}]] USERNAME ALREADY EXIST: ${username}`);
      }
      logger.info(`Successful create user: ${username}`);
      res.json({
        status: 0,
      });
    }).catch(errorResponse(req, res));
  });
});

authAPI.post('/signin', (req, res) => {
  const {
    username,
    password,
  } = req.body;
  User.findOne({
    username,
  }).exec().then(user => {
    if (!user) {
      const errData = JSON.stringify({
        status: -2,
        isExpected: true,
      });
      throw new Error(`[[${errData}]] WRONG USERNAME: ${username}`);
    }
    bcrypt.compare(password, user.password, (err, isEqual) => {
      if (err || !isEqual) {
        res.json({
          status: -1,
          message: 'WRONG PASSWORD',
        });
        return;
      }
      let info, token;
      try {
        info = userInfo(user);
        token = jwt.sign({
          ...info,
        }, JWT_SECRET);
      } catch (ex) {
        errorResponse(req, res)(ex);
        return;
      }
      res.json({
        status: 0,
        token,
        ...info,
      });
    });
  }).catch(errorResponse(req, res));
});

authAPI.get('/info', (req, res) => {
  res.json({
    ...userInfo(req.user),
  });
});
