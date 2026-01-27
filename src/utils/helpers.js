const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const { BCRYPT_ROUNDS } = require('../config/env');
const { VALIDATION_RULES, PAGINATION } = require('../config/constants');

/**
 * Generate a new UUID
 * @returns {string} UUID string
 */
const generateUUID = () => {
  return uuidv4();
};

/**
 * Generate a random OTP
 * @param {number} length - Length of OTP (default: 6)
 * @returns {string} OTP string
 */
const generateOTP = (length = 6) => {
  const digits = '0123456789';
  let otp = '';
  
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * digits.length)];
  }
  
  return otp;
};

/**
 * Hash a string using bcrypt
 * @param {string} plainText - Plain text to hash
 * @returns {Promise<string>} Hashed string
 */
const hashString = async (plainText) => {
  try {
    const salt = await bcrypt.genSalt(BCRYPT_ROUNDS);
    return await bcrypt.hash(plainText, salt);
  } catch (error) {
    throw new Error('Failed to hash string');
  }
};

/**
 * Compare plain text with hashed string
 * @param {string} plainText - Plain text
 * @param {string} hashedText - Hashed text
 * @returns {Promise<boolean>} True if match
 */
const compareHash = async (plainText, hashedText) => {
  try {
    return await bcrypt.compare(plainText, hashedText);
  } catch (error) {
    throw new Error('Failed to compare hash');
  }
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
const isValidEmail = (email) => {
  return VALIDATION_RULES.EMAIL_REGEX.test(email);
};

/**
 * Validate phone number format
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid
 */
const isValidPhone = (phone) => {
  return VALIDATION_RULES.PHONE_REGEX.test(phone);
};

/**
 * Validate ZIP code format
 * @param {string} zipCode - ZIP code to validate
 * @returns {boolean} True if valid
 */
const isValidZipCode = (zipCode) => {
  return VALIDATION_RULES.ZIP_CODE_REGEX.test(zipCode);
};

/**
 * Validate SSN format
 * @param {string} ssn - SSN to validate
 * @returns {boolean} True if valid
 */
const isValidSSN = (ssn) => {
  return VALIDATION_RULES.SSN_REGEX.test(ssn);
};

/**
 * Format phone number to standard format
 * @param {string} phone - Phone number to format
 * @returns {string} Formatted phone number
 */
const formatPhoneNumber = (phone) => {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Handle US phone numbers
  if (cleaned.length === 10) {
    return `+1${cleaned}`;
  } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+${cleaned}`;
  }
  
  // Return as-is if not a standard US number
  return phone;
};

/**
 * Format currency amount
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: USD)
 * @returns {string} Formatted currency string
 */
const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

/**
 * Format percentage
 * @param {number} value - Value to format as percentage
 * @param {number} decimals - Number of decimal places (default: 3)
 * @returns {string} Formatted percentage string
 */
const formatPercentage = (value, decimals = 3) => {
  return `${value.toFixed(decimals)}%`;
};

/**
 * Calculate Loan-to-Value ratio
 * @param {number} loanAmount - Loan amount
 * @param {number} propertyValue - Property value
 * @returns {number} LTV ratio as percentage
 */
const calculateLTV = (loanAmount, propertyValue) => {
  if (!loanAmount || !propertyValue || propertyValue === 0) {
    return 0;
  }
  
  return (loanAmount / propertyValue) * 100;
};

/**
 * Calculate monthly payment using loan amount, rate, and term
 * @param {number} loanAmount - Principal loan amount
 * @param {number} annualRate - Annual interest rate (as percentage)
 * @param {number} termYears - Loan term in years
 * @returns {number} Monthly payment amount
 */
const calculateMonthlyPayment = (loanAmount, annualRate, termYears) => {
  if (!loanAmount || !annualRate || !termYears) {
    return 0;
  }
  
  const monthlyRate = annualRate / 100 / 12;
  const numPayments = termYears * 12;
  
  if (monthlyRate === 0) {
    return loanAmount / numPayments;
  }
  
  const monthlyPayment = loanAmount * 
    (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
    (Math.pow(1 + monthlyRate, numPayments) - 1);
  
  return Math.round(monthlyPayment * 100) / 100;
};

/**
 * Generate session ID
 * @returns {string} Session ID
 */
const generateSessionId = () => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Create pagination metadata
 * @param {number} total - Total number of records
 * @param {number} page - Current page
 * @param {number} limit - Records per page
 * @returns {Object} Pagination metadata
 */
const createPaginationMeta = (total, page = 1, limit = PAGINATION.DEFAULT_LIMIT) => {
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;
  
  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage,
    hasPrevPage,
    nextPage: hasNextPage ? page + 1 : null,
    prevPage: hasPrevPage ? page - 1 : null
  };
};

/**
 * Sanitize string for database storage
 * @param {string} str - String to sanitize
 * @returns {string} Sanitized string
 */
const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  
  return str
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
    .substring(0, VALIDATION_RULES.MAX_TEXT_LENGTH);
};

/**
 * Deep clone an object
 * @param {Object} obj - Object to clone
 * @returns {Object} Cloned object
 */
const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Check if a value is empty (null, undefined, empty string, empty array, empty object)
 * @param {any} value - Value to check
 * @returns {boolean} True if empty
 */
const isEmpty = (value) => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};

/**
 * Convert string to title case
 * @param {string} str - String to convert
 * @returns {string} Title case string
 */
const toTitleCase = (str) => {
  if (typeof str !== 'string') return str;
  
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Generate a random string
 * @param {number} length - Length of string
 * @param {string} charset - Character set to use
 * @returns {string} Random string
 */
const generateRandomString = (length = 10, charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') => {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return result;
};

/**
 * Sleep for specified milliseconds
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise} Promise that resolves after sleep
 */
const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Retry a function with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} baseDelay - Base delay in milliseconds
 * @returns {Promise} Promise that resolves with function result
 */
const retryWithBackoff = async (fn, maxRetries = 3, baseDelay = 1000) => {
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      const delay = baseDelay * Math.pow(2, attempt);
      await sleep(delay);
    }
  }
};

module.exports = {
  generateUUID,
  generateOTP,
  hashString,
  compareHash,
  isValidEmail,
  isValidPhone,
  isValidZipCode,
  isValidSSN,
  formatPhoneNumber,
  formatCurrency,
  formatPercentage,
  calculateLTV,
  calculateMonthlyPayment,
  generateSessionId,
  createPaginationMeta,
  sanitizeString,
  deepClone,
  isEmpty,
  toTitleCase,
  generateRandomString,
  sleep,
  retryWithBackoff
};