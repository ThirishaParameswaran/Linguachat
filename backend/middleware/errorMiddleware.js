import logger from '../utils/logger.js';
import { sendError } from '../utils/responseHandler.js';

/**
 * Centralized Express Error Handling Middleware
 */
export const errorHandler = (err, req, res, next) => {
  logger.error(`Error processing request ${req.method} ${req.url}:`, err);

  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  const message = err.message || 'Server Internal Error';
  const errorCode = err.code || 'SERVER_ERROR';

  return sendError(res, message, errorCode, statusCode);
};

/**
 * 404 Route Not Found Middleware
 */
export const notFoundHandler = (req, res, next) => {
  return sendError(res, `Route not found: ${req.originalUrl}`, 'NOT_FOUND', 404);
};
