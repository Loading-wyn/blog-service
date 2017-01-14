
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.FL_FLODUCER_JWT_SECRET;

export const passwordGetter = password => {
  if (!password) {
    return '';
  }
  const decoded = jwt.verify(password, JWT_SECRET);
  return decoded.password;
};

export const passwordSetter = password => {
  if (!password) {
    return '';
  }
  return jwt.sign({ password }, JWT_SECRET);
};
