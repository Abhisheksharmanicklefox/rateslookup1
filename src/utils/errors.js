const { ERROR_TYPES } = require('../config/constants');

/**
 * Base custom error class
 */
class AppError extends Error {
  constructor(message, type = ERROR_TYPES.INTERNAL_SERVER_ERROR, details = null) {
    super(message);
    this.name = this.constructor.name;
    this.type = type;
    this.details = details;
    this.timestamp = new Date().toISOString();
    
    // Capture stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation error class
 */
class ValidationError extends AppError {
  constructor(message, details = []) {
    super(message, ERROR_TYPES.VALIDATION_ERROR, details);
  }
}

/**
 * Not found error class
 */
class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, ERROR_TYPES.NOT_FOUND_ERROR);
  }
}

/**
 * Database error class
 */
class DatabaseError extends AppError {
  constructor(message, originalError = null) {
    super(message, ERROR_TYPES.DATABASE_ERROR);
    this.originalError = originalError;
  }
}

/**
 * Authentication error class
 */
class AuthenticationError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, ERROR_TYPES.AUTHENTICATION_ERROR);
  }
}

/**
 * Authorization error class
 */
class AuthorizationError extends AppError {
  constructor(message = 'Access denied') {
    super(message, ERROR_TYPES.AUTHORIZATION_ERROR);
  }
}

/**
 * Rate limit error class
 */
class RateLimitError extends AppError {
  constructor(message = 'Rate limit exceeded', retryAfter = null) {
    super(message, ERROR_TYPES.RATE_LIMIT_ERROR);
    this.retryAfter = retryAfter;
  }
}

/**
 * External service error class
 */
class ExternalServiceError extends AppError {
  constructor(message = 'External service error', service = null) {
    super(message, ERROR_TYPES.EXTERNAL_SERVICE_ERROR);
    this.service = service;
  }
}

/**
 * Business logic error class
 */
class BusinessLogicError extends AppError {
  constructor(message, details = []) {
    super(message, ERROR_TYPES.BUSINESS_LOGIC_ERROR, details);
  }
}

/**
 * Create a validation error with field details
 * @param {string} message - Error message
 * @param {Array} fieldErrors - Array of field error objects
 * @returns {ValidationError}
 */
const createValidationError = (message, fieldErrors = []) => {
  const details = fieldErrors.map(error => ({
    field: error.field,
    message: error.message,
    value: error.value,
    code: error.code
  }));
  
  return new ValidationError(message, details);
};

/**
 * Create a not found error for a specific resource
 * @param {string} resource - Resource name
 * @param {string} identifier - Resource identifier
 * @returns {NotFoundError}
 */
const createNotFoundError = (resource, identifier = null) => {
  const message = identifier 
    ? `${resource} with identifier '${identifier}' not found`
    : `${resource} not found`;
  
  return new NotFoundError(message);
};

/**
 * Create a database error from a PostgreSQL error
 * @param {Error} pgError - PostgreSQL error object
 * @returns {DatabaseError}
 */
const createDatabaseError = (pgError) => {
  let message = 'Database operation failed';
  
  // Handle specific PostgreSQL error codes
  switch (pgError.code) {
    case '23505': // Unique violation
      message = 'Resource already exists';
      break;
    case '23503': // Foreign key violation
      message = 'Referenced resource does not exist';
      break;
    case '23502': // Not null violation
      message = 'Required field is missing';
      break;
    case '22P02': // Invalid input syntax
      message = 'Invalid input format';
      break;
    case '42P01': // Undefined table
      message = 'Database table not found';
      break;
    case '42703': // Undefined column
      message = 'Database column not found';
      break;
    default:
      message = process.env.NODE_ENV === 'development' 
        ? pgError.message 
        : 'Database operation failed';
  }
  
  return new DatabaseError(message, pgError);
};

/**
 * Create a business logic error for OTP validation
 * @param {string} reason - Reason for OTP failure
 * @returns {BusinessLogicError}
 */
const createOTPError = (reason) => {
  const messages = {
    expired: 'OTP has expired. Please request a new one.',
    invalid: 'Invalid OTP. Please check and try again.',
    max_attempts: 'Maximum OTP attempts exceeded. Please request a new one.',
    not_found: 'OTP not found. Please request a new one.',
    already_verified: 'OTP has already been verified.'
  };
  
  const message = messages[reason] || 'OTP verification failed';
  return new BusinessLogicError(message, [{ code: reason, message }]);
};

/**
 * Create a business logic error for rate offers
 * @param {string} reason - Reason for rate offer error
 * @returns {BusinessLogicError}
 */
const createRateOfferError = (reason) => {
  const messages = {
    expired: 'Rate offer has expired',
    already_accepted: 'Rate offer has already been accepted',
    already_declined: 'Rate offer has already been declined',
    insufficient_data: 'Insufficient application data to generate rate offers'
  };
  
  const message = messages[reason] || 'Rate offer operation failed';
  return new BusinessLogicError(message, [{ code: reason, message }]);
};

/**
 * Wrap async functions to catch errors and pass to next middleware
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Wrapped function
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Handle database connection errors
 * @param {Error} error - Database connection error
 * @returns {DatabaseError}
 */
const handleConnectionError = (error) => {
  console.error('Database connection error:', error);
  
  if (error.code === 'ECONNREFUSED') {
    return new DatabaseError('Database connection refused. Please check if the database is running.');
  }
  
  if (error.code === 'ENOTFOUND') {
    return new DatabaseError('Database host not found. Please check the database configuration.');
  }
  
  if (error.code === '28P01') {
    return new DatabaseError('Database authentication failed. Please check credentials.');
  }
  
  return new DatabaseError('Database connection failed', error);
};

module.exports = {
  AppError,
  ValidationError,
  NotFoundError,
  DatabaseError,
  AuthenticationError,
  AuthorizationError,
  RateLimitError,
  ExternalServiceError,
  BusinessLogicError,
  createValidationError,
  createNotFoundError,
  createDatabaseError,
  createOTPError,
  createRateOfferError,
  asyncHandler,
  handleConnectionError
};