const { validationResult } = require('express-validator');
const { ERROR_TYPES } = require('../config/constants');

/**
 * Middleware to handle express-validator validation results
 * Should be used after validation rules in route handlers
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed');
    error.type = ERROR_TYPES.VALIDATION_ERROR;
    error.details = errors.array().map(err => ({
      field: err.path || err.param,
      message: err.msg,
      value: err.value,
      location: err.location
    }));
    
    return next(error);
  }
  
  next();
};

/**
 * Custom validation error creator
 * @param {string} message - Error message
 * @param {Array} details - Array of validation error details
 * @returns {Error} Validation error
 */
const createValidationError = (message, details = []) => {
  const error = new Error(message);
  error.type = ERROR_TYPES.VALIDATION_ERROR;
  error.details = details;
  return error;
};

/**
 * Sanitize input by removing potentially harmful characters
 * @param {string} input - Input string to sanitize
 * @returns {string} Sanitized string
 */
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/['"]/g, '') // Remove quotes that could break SQL
    .substring(0, 1000); // Limit length
};

/**
 * Middleware to sanitize request body
 */
const sanitizeBody = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    const sanitizeObject = (obj) => {
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          if (typeof obj[key] === 'string') {
            obj[key] = sanitizeInput(obj[key]);
          } else if (typeof obj[key] === 'object' && obj[key] !== null) {
            sanitizeObject(obj[key]);
          }
        }
      }
    };
    
    sanitizeObject(req.body);
  }
  
  next();
};

/**
 * Validate UUID format
 * @param {string} uuid - UUID string to validate
 * @returns {boolean} True if valid UUID
 */
const isValidUUID = (uuid) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

/**
 * Middleware to validate UUID parameters
 * @param {string} paramName - Name of the parameter to validate
 */
const validateUUIDParam = (paramName) => {
  return (req, res, next) => {
    const uuid = req.params[paramName];
    
    if (!uuid) {
      const error = createValidationError(`${paramName} parameter is required`);
      return next(error);
    }
    
    if (!isValidUUID(uuid)) {
      const error = createValidationError(`Invalid ${paramName} format`);
      return next(error);
    }
    
    next();
  };
};

/**
 * Validate pagination parameters
 */
const validatePagination = (req, res, next) => {
  const { page = 1, limit = 20 } = req.query;
  
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  
  if (isNaN(pageNum) || pageNum < 1) {
    const error = createValidationError('Page must be a positive integer');
    return next(error);
  }
  
  if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
    const error = createValidationError('Limit must be between 1 and 100');
    return next(error);
  }
  
  req.pagination = {
    page: pageNum,
    limit: limitNum,
    offset: (pageNum - 1) * limitNum
  };
  
  next();
};

module.exports = {
  handleValidationErrors,
  createValidationError,
  sanitizeInput,
  sanitizeBody,
  isValidUUID,
  validateUUIDParam,
  validatePagination
};