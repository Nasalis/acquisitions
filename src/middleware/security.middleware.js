import arcjetInstance from '#config/arcjet.js';
import logger from '#config/logger.js';
import { slidingWindow } from '@arcjet/node';

export const securityMiddleware = async (request, response, next) => {
  try {
    const role = request.user?.role || 'guest';

    let limit;
    let message;

    switch (role) {
      case 'admin':
        limit = 20;
        message = 'Admin request limit exceeded (20 per minute). Slow down';
        break;
      case 'user':
        limit = 10;
        message = 'User request limit exceeded (10 per minute). Slow down';
        break;
      default:
        limit = 5;
        message = 'Guest request limit exceeded (5 per minute). Slow down';
    }

    const client = arcjetInstance.withRule(
      slidingWindow({
        mode: 'LIVE',
        interval: '1m',
        max: limit,
        name: `${role}-rate-limit`,
      })
    );

    const decision = await client.protect(request);

    if (decision.isDenied() && decision.reason.isBot()) {
      logger.warn('Bot request blocked', {
        ip: request.ip,
        userAgent: request.get('User-Agent'),
        path: request.path,
      });

      return response.status(403).json({
        error: 'Forbidden',
        message: 'Automated requests are not allowed',
      });
    }

    if (decision.isDenied() && decision.reason.isShield()) {
      logger.warn('Shield request denied', {
        ip: request.ip,
        userAgent: request.get('User-Agent'),
        path: request.path,
      });

      return response.status(403).json({
        error: 'Forbidden',
        message: 'Request blocked by security policy',
      });
    }

    if (decision.isDenied() && decision.reason.isRateLimit()) {
      logger.warn('Rate limit exceeded', {
        ip: request.ip,
        userAgent: request.get('User-Agent'),
        path: request.path,
      });

      return response.status(403).json({
        error: 'Forbidden',
        message: 'Too many requests',
      });
    }

    next();
  } catch (error) {
    logger.error('Arcjet middleware error:', error);
    response.status(500).json({
      error: 'Internal server error',
      message: 'Something went wrong with security middleware',
    });
  }
};
