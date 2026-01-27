const { HTTP_STATUS, ERROR_TYPES } = require('../config/constants');

/**
 * Global error handling middleware
 * Must be the last middleware in the chain
 */
const errorHandler = (err, req, res, next) => {
  // Log error details (exclude sensitive information)
  const logError = {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  };

  console.error('🚨 Error occurred:', logError);

  // Default error response
  let statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
  let errorResponse = {
    success: false,
    error: {
      type: ERROR_TYPES.INTERNAL_SERVER_ERROR,
      message: 'An unexpected error occurred',
      timestamp: new Date().toISOString(),
      requestId: req.id || 'unknown'
    }
  };

  // Handle specific error types
  if (err.type) {
    switch (err.type) {
      case ERROR_TYPES.VALIDATION_ERROR:
        statusCode = HTTP_STATUS.BAD_REQUEST;
        errorResponse.error = {
          type: ERROR_TYPES.VALIDATION_ERROR,
          message: err.message || 'Validation failed',
          details: err.details || [],
          timestamp: new Date().toISOString(),
          requestId: req.id || 'unknown'
        };
        break;

      case ERROR_TYPES.NOT_FOUND_ERROR:
        statusCode = HTTP_STATUS.NOT_FOUND;
        errorResponse.error = {
          type: ERROR_TYPES.NOT_FOUND_ERROR,
          message: err.message || 'Resource not found',
          timestamp: new Date().toISOString(),
          requestId: req.id || 'unknown'
        };
        break;

      case ERROR_TYPES.AUTHENTICATION_ERROR:
        statusCode = HTTP_STATUS.UNAUTHORIZED;
        errorResponse.error = {
          type: ERROR_TYPES.AUTHENTICATION_ERROR,
          message: err.message || 'Authentication required',
          timestamp: new Date().toISOString(),
          requestId: req.id || 'unknown'
        };
        break;

      case ERROR_TYPES.AUTHORIZATION_ERROR:
        statusCode = HTTP_STATUS.FORBIDDEN;
        errorResponse.error = {
          type: ERROR_TYPES.AUTHORIZATION_ERROR,
          message: err.message || 'Access denied',
          timestamp: new Date().toISOString(),
          requestId: req.id || 'unknown'
        };
        break;

      case ERROR_TYPES.RATE_LIMIT_ERROR:
        statusCode = HTTP_STATUS.TOO_MANY_REQUESTS;
        errorResponse.error = {
          type: ERROR_TYPES.RATE_LIMIT_ERROR,
          message: err.message || 'Rate limit exceeded',
          retryAfter: err.retryAfter,
          timestamp: new Date().toISOString(),
          requestId: req.id || 'unknown'
        };
        break;

      case ERROR_TYPES.DATABASE_ERROR:
        statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
        errorResponse.error = {
          type: ERROR_TYPES.DATABASE_ERROR,
          message: process.env.NODE_ENV === 'development' ? err.message : 'Database operation failed',
          timestamp: new Date().toISOString(),
          requestId: req.id || 'unknown'
        };
        break;

      case ERROR_TYPES.EXTERNAL_SERVICE_ERROR:
        statusCode = HTTP_STATUS.SERVICE_UNAVAILABLE;
        errorResponse.error = {
          type: ERROR_TYPES.EXTERNAL_SERVICE_ERROR,
          message: err.message || 'External service unavailable',
          timestamp: new Date().toISOString(),
          requestId: req.id || 'unknown'
        };
        break;

      case ERROR_TYPES.BUSINESS_LOGIC_ERROR:
        statusCode = HTTP_STATUS.UNPROCESSABLE_ENTITY;
        errorResponse.error = {
          type: ERROR_TYPES.BUSINESS_LOGIC_ERROR,
          message: err.message || 'Business logic validation failed',
          details: err.details || [],
          timestamp: new Date().toISOString(),
          requestId: req.id || 'unknown'
        };
        break;

      default:
        // Keep default error response
        break;
    }
  }

  // Handle express-validator errors
  if (err.array && typeof err.array === 'function') {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    errorResponse.error = {
      type: ERROR_TYPES.VALIDATION_ERROR,
      message: 'Validation failed',
      details: err.array(),
      timestamp: new Date().toISOString(),
      requestId: req.id || 'unknown'
    };
  }

  // Handle PostgreSQL errors
  if (err.code) {
    switch (err.code) {
      case '23505': // Unique violation
        statusCode = HTTP_STATUS.CONFLICT;
        errorResponse.error = {
          type: ERROR_TYPES.DATABASE_ERROR,
          message: 'Resource already exists',
          timestamp: new Date().toISOString(),
          requestId: req.id || 'unknown'
        };
        break;

      case '23503': // Foreign key violation
        statusCode = HTTP_STATUS.BAD_REQUEST;
        errorResponse.error = {
          type: ERROR_TYPES.DATABASE_ERROR,
          message: 'Referenced resource does not exist',
          timestamp: new Date().toISOString(),
          requestId: req.id || 'unknown'
        };
        break;

      case '23502': // Not null violation
        statusCode = HTTP_STATUS.BAD_REQUEST;
        errorResponse.error = {
          type: ERROR_TYPES.VALIDATION_ERROR,
          message: 'Required field is missing',
          timestamp: new Date().toISOString(),
          requestId: req.id || 'unknown'
        };
        break;

      case '22P02': // Invalid input syntax
        statusCode = HTTP_STATUS.BAD_REQUEST;
        errorResponse.error = {
          type: ERROR_TYPES.VALIDATION_ERROR,
          message: 'Invalid input format',
          timestamp: new Date().toISOString(),
          requestId: req.id || 'unknown'
        };
        break;

      default:
        statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
        errorResponse.error = {
          type: ERROR_TYPES.DATABASE_ERROR,
          message: process.env.NODE_ENV === 'development' ? err.message : 'Database error occurred',
          timestamp: new Date().toISOString(),
          requestId: req.id || 'unknown'
        };
        break;
    }
  }

  // Add development-specific error details
  if (process.env.NODE_ENV === 'development') {
    errorResponse.error.stack = err.stack;
    errorResponse.error.details = errorResponse.error.details || err.details;
  }

  // Send error response
  res.status(statusCode).json(errorResponse);
};

module.exports = errorHandler;