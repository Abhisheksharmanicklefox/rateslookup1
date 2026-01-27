const { body, param, query } = require('express-validator');
const { LEAD_SOURCES } = require('../../config/constants');

/**
 * Validation rules for lead capture operations
 */

/**
 * Validation for creating a lead
 */
const validateCreateLead = [
  body('first_name')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('First name must be between 1 and 100 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('First name can only contain letters, spaces, hyphens, and apostrophes'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage('Email must be less than 255 characters'),

  body('phone')
    .optional()
    .trim()
    .isMobilePhone('any', { strictMode: false })
    .withMessage('Invalid phone number format'),

  body('source')
    .optional()
    .isIn(Object.values(LEAD_SOURCES))
    .withMessage(`Source must be one of: ${Object.values(LEAD_SOURCES).join(', ')}`),

  body('utm_source')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('UTM source must be less than 255 characters'),

  body('utm_medium')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('UTM medium must be less than 255 characters'),

  body('utm_campaign')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('UTM campaign must be less than 255 characters'),

  body('utm_content')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('UTM content must be less than 255 characters'),

  body('utm_term')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('UTM term must be less than 255 characters'),

  body('referrer_url')
    .optional()
    .trim()
    .isURL({ require_protocol: true })
    .withMessage('Referrer URL must be a valid URL')
    .isLength({ max: 2000 })
    .withMessage('Referrer URL must be less than 2000 characters')
];

/**
 * Validation for lead ID parameter
 */
const validateLeadId = [
  param('id')
    .isUUID()
    .withMessage('Invalid lead ID format')
];

/**
 * Validation for email parameter
 */
const validateEmailParam = [
  param('email')
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail()
];

/**
 * Validation for getting leads with filters
 */
const validateGetLeads = [
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

  query('source')
    .optional()
    .isIn(Object.values(LEAD_SOURCES))
    .withMessage(`Source must be one of: ${Object.values(LEAD_SOURCES).join(', ')}`),

  query('converted')
    .optional()
    .isBoolean()
    .withMessage('Converted must be a boolean value')
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

/**
 * Validation for marking lead as converted
 */
const validateMarkAsConverted = [
  param('id')
    .isUUID()
    .withMessage('Invalid lead ID format'),

  body('applicationId')
    .notEmpty()
    .withMessage('Application ID is required')
    .isUUID()
    .withMessage('Invalid application ID format')
];

/**
 * Validation for lead statistics
 */
const validateLeadStatistics = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date')
    .toDate(),

  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date')
    .toDate()
];

/**
 * Validation for bulk create leads
 */
const validateBulkCreateLeads = [
  body('leads')
    .isArray({ min: 1, max: 100 })
    .withMessage('Leads must be an array with 1-100 items'),

  body('leads.*.first_name')
    .trim()
    .notEmpty()
    .withMessage('First name is required for all leads')
    .isLength({ min: 1, max: 100 })
    .withMessage('First name must be between 1 and 100 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('First name can only contain letters, spaces, hyphens, and apostrophes'),

  body('leads.*.email')
    .trim()
    .notEmpty()
    .withMessage('Email is required for all leads')
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage('Email must be less than 255 characters'),

  body('leads.*.phone')
    .optional()
    .trim()
    .isMobilePhone('any', { strictMode: false })
    .withMessage('Invalid phone number format'),

  body('leads.*.source')
    .optional()
    .isIn(Object.values(LEAD_SOURCES))
    .withMessage(`Source must be one of: ${Object.values(LEAD_SOURCES).join(', ')}`)
];

/**
 * Custom validation to check date range
 */
const validateDateRange = (req, res, next) => {
  const { startDate, endDate } = req.query;
  
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start > end) {
      return res.status(400).json({
        success: false,
        error: {
          type: 'VALIDATION_ERROR',
          message: 'Start date must be before end date',
          details: [
            {
              field: 'dateRange',
              message: 'Start date must be before end date'
            }
          ]
        }
      });
    }
  }
  
  next();
};

module.exports = {
  validateCreateLead,
  validateLeadId,
  validateEmailParam,
  validateGetLeads,
  validateMarkAsConverted,
  validateLeadStatistics,
  validateBulkCreateLeads,
  validateDateRange
};