// Application Status Constants
const APPLICATION_STATUS = {
  DRAFT: 'draft',
  IN_PROGRESS: 'in_progress',
  SUBMITTED: 'submitted',
  UNDER_REVIEW: 'under_review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled'
};

// Application Progress Step Constants
const PROGRESS_STEPS = {
  PERSONAL_INFO: 'personal_info',
  PROPERTY_INFO: 'property_info',
  FINANCIAL_INFO: 'financial_info',
  EMPLOYMENT_INFO: 'employment_info',
  ADDITIONAL_INFO: 'additional_info',
  DOCUMENTS: 'documents',
  REVIEW: 'review',
  SUBMISSION: 'submission'
};

// OTP Status Constants
const OTP_STATUS = {
  PENDING: 'pending',
  VERIFIED: 'verified',
  EXPIRED: 'expired',
  FAILED: 'failed'
};

// Rate Offer Status Constants
const RATE_OFFER_STATUS = {
  ACTIVE: 'active',
  EXPIRED: 'expired',
  ACCEPTED: 'accepted',
  DECLINED: 'declined'
};

// Callback Request Status Constants
const CALLBACK_STATUS = {
  PENDING: 'pending',
  SCHEDULED: 'scheduled',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

// Lead Capture Source Constants
const LEAD_SOURCES = {
  WEBSITE: 'website',
  LANDING_PAGE: 'landing_page',
  SOCIAL_MEDIA: 'social_media',
  REFERRAL: 'referral',
  ADVERTISEMENT: 'advertisement',
  ORGANIC_SEARCH: 'organic_search',
  PAID_SEARCH: 'paid_search',
  EMAIL_CAMPAIGN: 'email_campaign',
  OTHER: 'other'
};

// Rate Exploration Status Constants
const EXPLORATION_STATUS = {
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  ABANDONED: 'abandoned'
};

// Tool Field Types Constants
const TOOL_FIELD_TYPES = {
  TEXT: 'text',
  NUMBER: 'number',
  EMAIL: 'email',
  PHONE: 'phone',
  SELECT: 'select',
  MULTISELECT: 'multiselect',
  CHECKBOX: 'checkbox',
  RADIO: 'radio',
  DATE: 'date',
  CURRENCY: 'currency',
  PERCENTAGE: 'percentage',
  TEXTAREA: 'textarea'
};

// Tool Run Status Constants
const TOOL_RUN_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed'
};

// Property Types Constants
const PROPERTY_TYPES = {
  SINGLE_FAMILY: 'single_family',
  CONDO: 'condo',
  TOWNHOUSE: 'townhouse',
  MULTI_FAMILY: 'multi_family',
  MANUFACTURED: 'manufactured',
  LAND: 'land',
  COMMERCIAL: 'commercial'
};

// Loan Types Constants
const LOAN_TYPES = {
  CONVENTIONAL: 'conventional',
  FHA: 'fha',
  VA: 'va',
  USDA: 'usda',
  JUMBO: 'jumbo',
  HELOC: 'heloc',
  HOME_EQUITY: 'home_equity',
  REFINANCE: 'refinance'
};

// Employment Types Constants
const EMPLOYMENT_TYPES = {
  FULL_TIME: 'full_time',
  PART_TIME: 'part_time',
  SELF_EMPLOYED: 'self_employed',
  CONTRACT: 'contract',
  RETIRED: 'retired',
  UNEMPLOYED: 'unemployed',
  STUDENT: 'student',
  OTHER: 'other'
};

// Credit Score Ranges Constants
const CREDIT_SCORE_RANGES = {
  EXCELLENT: { min: 800, max: 850, label: 'Excellent (800-850)' },
  VERY_GOOD: { min: 740, max: 799, label: 'Very Good (740-799)' },
  GOOD: { min: 670, max: 739, label: 'Good (670-739)' },
  FAIR: { min: 580, max: 669, label: 'Fair (580-669)' },
  POOR: { min: 300, max: 579, label: 'Poor (300-579)' }
};

// HTTP Status Codes
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
};

// Error Types
const ERROR_TYPES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  NOT_FOUND_ERROR: 'NOT_FOUND_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  RATE_LIMIT_ERROR: 'RATE_LIMIT_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  BUSINESS_LOGIC_ERROR: 'BUSINESS_LOGIC_ERROR'
};

// Validation Rules
const VALIDATION_RULES = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^\+?[\d\s\-\(\)]{10,}$/,
  ZIP_CODE_REGEX: /^\d{5}(-\d{4})?$/,
  SSN_REGEX: /^\d{3}-?\d{2}-?\d{4}$/,
  MIN_PASSWORD_LENGTH: 8,
  MAX_TEXT_LENGTH: 255,
  MAX_TEXTAREA_LENGTH: 2000,
  MIN_LOAN_AMOUNT: 50000,
  MAX_LOAN_AMOUNT: 10000000,
  MIN_CREDIT_SCORE: 300,
  MAX_CREDIT_SCORE: 850
};

// Rate Calculation Constants
const RATE_CONSTANTS = {
  BASE_RATE: 3.5,
  CREDIT_SCORE_ADJUSTMENTS: {
    [CREDIT_SCORE_RANGES.EXCELLENT.label]: -0.25,
    [CREDIT_SCORE_RANGES.VERY_GOOD.label]: -0.125,
    [CREDIT_SCORE_RANGES.GOOD.label]: 0,
    [CREDIT_SCORE_RANGES.FAIR.label]: 0.25,
    [CREDIT_SCORE_RANGES.POOR.label]: 0.75
  },
  LOAN_TYPE_ADJUSTMENTS: {
    [LOAN_TYPES.CONVENTIONAL]: 0,
    [LOAN_TYPES.FHA]: 0.125,
    [LOAN_TYPES.VA]: -0.125,
    [LOAN_TYPES.USDA]: 0,
    [LOAN_TYPES.JUMBO]: 0.25,
    [LOAN_TYPES.REFINANCE]: 0.125
  },
  LTV_ADJUSTMENTS: {
    80: 0,      // <= 80% LTV
    85: 0.125,  // 80-85% LTV
    90: 0.25,   // 85-90% LTV
    95: 0.375,  // 90-95% LTV
    100: 0.5    // 95-100% LTV
  }
};

// Cache TTL (Time To Live) in seconds
const CACHE_TTL = {
  RATES: 300,        // 5 minutes
  TOOLS: 3600,       // 1 hour
  FAQS: 7200,        // 2 hours
  TESTIMONIALS: 3600, // 1 hour
  MYTHS: 3600        // 1 hour
};

// Pagination Constants
const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100
};

module.exports = {
  APPLICATION_STATUS,
  PROGRESS_STEPS,
  OTP_STATUS,
  RATE_OFFER_STATUS,
  CALLBACK_STATUS,
  LEAD_SOURCES,
  EXPLORATION_STATUS,
  TOOL_FIELD_TYPES,
  TOOL_RUN_STATUS,
  PROPERTY_TYPES,
  LOAN_TYPES,
  EMPLOYMENT_TYPES,
  CREDIT_SCORE_RANGES,
  HTTP_STATUS,
  ERROR_TYPES,
  VALIDATION_RULES,
  RATE_CONSTANTS,
  CACHE_TTL,
  PAGINATION
};