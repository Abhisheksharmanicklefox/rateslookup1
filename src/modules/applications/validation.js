const { body, param, query } = require('express-validator');
const { APPLICATION_STATUS, LOAN_TYPES, PROPERTY_TYPES, EMPLOYMENT_TYPES, PROGRESS_STEPS } = require('../../config/constants');

/**
 * Validation for creating an application
 */
const validateCreateApplication = [
  body('first_name')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('First name must be between 1 and 100 characters'),

  body('last_name')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Last name must be between 1 and 100 characters'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),

  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .isMobilePhone('any', { strictMode: false })
    .withMessage('Invalid phone number format'),

  body('loan_amount')
    .optional()
    .isFloat({ min: 50000, max: 10000000 })
    .withMessage('Loan amount must be between $50,000 and $10,000,000'),

  body('property_value')
    .optional()
    .isFloat({ min: 50000, max: 20000000 })
    .withMessage('Property value must be between $50,000 and $20,000,000'),

  body('loan_type')
    .optional()
    .isIn(Object.values(LOAN_TYPES))
    .withMessage(`Loan type must be one of: ${Object.values(LOAN_TYPES).join(', ')}`),

  body('property_type')
    .optional()
    .isIn(Object.values(PROPERTY_TYPES))
    .withMessage(`Property type must be one of: ${Object.values(PROPERTY_TYPES).join(', ')}`),

  body('employment_type')
    .optional()
    .isIn(Object.values(EMPLOYMENT_TYPES))
    .withMessage(`Employment type must be one of: ${Object.values(EMPLOYMENT_TYPES).join(', ')}`),

  body('annual_income')
    .optional()
    .isFloat({ min: 0, max: 10000000 })
    .withMessage('Annual income must be between $0 and $10,000,000'),

  body('down_payment')
    .optional()
    .isFloat({ min: 0, max: 5000000 })
    .withMessage('Down payment must be between $0 and $5,000,000')
];

/**
 * Validation for updating an application
 */
const validateUpdateApplication = [
  param('id')
    .isUUID()
    .withMessage('Invalid application ID format'),

  body('first_name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('First name must be between 1 and 100 characters'),

  body('last_name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Last name must be between 1 and 100 characters'),

  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),

  body('phone')
    .optional()
    .trim()
    .isMobilePhone('any', { strictMode: false })
    .withMessage('Invalid phone number format'),

  body('loan_amount')
    .optional()
    .isFloat({ min: 50000, max: 10000000 })
    .withMessage('Loan amount must be between $50,000 and $10,000,000'),

  body('property_value')
    .optional()
    .isFloat({ min: 50000, max: 20000000 })
    .withMessage('Property value must be between $50,000 and $20,000,000'),

  body('loan_type')
    .optional()
    .isIn(Object.values(LOAN_TYPES))
    .withMessage(`Loan type must be one of: ${Object.values(LOAN_TYPES).join(', ')}`),

  body('property_type')
    .optional()
    .isIn(Object.values(PROPERTY_TYPES))
    .withMessage(`Property type must be one of: ${Object.values(PROPERTY_TYPES).join(', ')}`),

  body('employment_type')
    .optional()
    .isIn(Object.values(EMPLOYMENT_TYPES))
    .withMessage(`Employment type must be one of: ${Object.values(EMPLOYMENT_TYPES).join(', ')}`),

  body('current_step')
    .optional()
    .isIn(Object.values(PROGRESS_STEPS))
    .withMessage(`Current step must be one of: ${Object.values(PROGRESS_STEPS).join(', ')}`),

  body('annual_income')
    .optional()
    .isFloat({ min: 0, max: 10000000 })
    .withMessage('Annual income must be between $0 and $10,000,000'),

  body('down_payment')
    .optional()
    .isFloat({ min: 0, max: 5000000 })
    .withMessage('Down payment must be between $0 and $5,000,000')
];

/**
 * Validation for application ID parameter
 */
const validateApplicationId = [
  param('id')
    .isUUID()
    .withMessage('Invalid application ID format')
];

/**
 * Validation for getting applications with filters
 */
const validateGetApplications = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer')
    .toInt(),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
    .toInt(),

  query('status')
    .optional()
    .isIn(Object.values(APPLICATION_STATUS))
    .withMessage(`Status must be one of: ${Object.values(APPLICATION_STATUS).join(', ')}`),

  query('loan_type')
    .optional()
    .isIn(Object.values(LOAN_TYPES))
    .withMessage(`Loan type must be one of: ${Object.values(LOAN_TYPES).join(', ')}`),

  query('abandoned')
    .optional()
    .isBoolean()
    .withMessage('Abandoned must be a boolean value')
    .toBoolean(),

  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date')
    .toDate(),

  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date')
    .toDate(),

  query('search')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search term must be between 1 and 100 characters')
];

module.exports = {
  validateCreateApplication,
  validateUpdateApplication,
  validateApplicationId,
  validateGetApplications
};