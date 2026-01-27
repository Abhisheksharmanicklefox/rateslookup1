const { HTTP_STATUS, ERROR_TYPES } = require('../config/constants');

/**
 * 404 Not Found middleware
 * Handles requests to non-existent routes
 */
const notFoundHandler = (req, res, next) => {
  const error = {
    success: false,
    error: {
      type: ERROR_TYPES.NOT_FOUND_ERROR,
      message: `Route ${req.method} ${req.originalUrl} not found`,
      timestamp: new Date().toISOString(),
      requestId: req.id || 'unknown'
    }
  };

  // Log the 404 for monitoring
  console.warn('🔍 404 Not Found:', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  res.status(HTTP_STATUS.NOT_FOUND).json(error);
};

module.exports = notFoundHandler;