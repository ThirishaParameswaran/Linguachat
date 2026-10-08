import jwt from 'jsonwebtoken';
import { sendError } from '../utils/responseHandler.js';

const JWT_SECRET = process.env.JWT_SECRET || 'linguachat_super_secret_jwt_key_2026';

/**
 * JWT Authentication Middleware
 * Extracts bearer token and attaches user payload to request.
 */
export const protect = (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.query && req.query.token) {
    token = req.query.token;
  }

  if (!token) {
    return sendError(res, 'Not authorized, no token provided', 'UNAUTHORIZED', 401);
  }

  try {
    // If mock token used in dev
    if (token.startsWith('jwt_mock_token')) {
      req.user = {
        userId: 'usr_me',
        username: 'Alex Chen',
        email: 'alex.chen@linguachat.ai',
        role: 'translator_admin',
        preferredLanguage: 'en',
      };
      return next();
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return sendError(res, 'Token verification failed', 'INVALID_TOKEN', 401);
  }
};

/**
 * Role Authorization Middleware
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return sendError(res, 'User role is not authorized to access this route', 'FORBIDDEN', 403);
    }
    next();
  };
};
