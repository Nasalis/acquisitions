import logger from '#config/logger.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-prod';
const JWT_EXPIRES_IN = '30min';

export const jwtToken = {
  sign: payload => {
    try {
      return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    } catch (error) {
      logger.error('Failed to authenticate token', error);
      throw new Error('Failed to sign JWT');
    }
  },
  verify: token => {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      logger.error('Failed to authenticate token', error);
      throw new Error('Failed to verify JWT');
    }
  },
};
