const rateLimit = require('express-rate-limit');
const { OTP_RATE_LIMIT_WINDOW_MS, OTP_RATE_LIMIT_MAX_REQUESTS } = require('../config/env');
const { ERROR_TYPES } = require('../config/constants');

/**
 * Rate limiter for OTP endpoints
 * More restrictive than general API rate limiting
 */
const otpRateLimiter = rateLimit({
  windowMs: OTP_RATE_LIMIT_WINDOW_MS,
  max: OTP_RATE_LIMIT_MAX_REQUESTS,
  message: {
    success: false,
    error: {
      type: ERROR_TYPES.RATE_LIMIT_ERROR,
      message: 'Too many OTP requests. Please try again later.',
      retryAfter: Math.ceil(OTP_RATE_LIMIT_WINDOW_MS / 1000)
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Rate limit by IP and phone number if available
    const phone = req.body?.phone || req.query?.phone;
    return phone ? `${req.ip}:${phone}` : req.ip;
  },
  skip: (req) => {
    // Skip rate limiting in test environment
    return process.env.NODE_ENV === 'test';
  },
  onLimitReached: (req, res, options) => {
    console.warn('🚨 OTP Rate limit exceeded:', {
      ip: req.ip,
      phone: req.body?.phone || req.query?.phone,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Rate limiter for callback request endpoints
 */
const callbackRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // 3 callback requests per 15 minutes
  message: {
    success: false,
    error: {
      type: ERROR_TYPES.RATE_LIMIT_ERROR,
      message: 'Too many callback requests. Please try again later.',
      retryAfter: 900 // 15 minutes in seconds
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Rate limit by IP and email/phone if available
    const email = req.body?.email || req.query?.email;
    const phone = req.body?.phone || req.query?.phone;
    const identifier = email || phone || req.ip;
    return `${req.ip}:${identifier}`;
  },
  skip: (req) => {
    return process.env.NODE_ENV === 'test';
  }
});

/**
 * Rate limiter for lead capture endpoints
 */
const leadCaptureRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5, // 5 lead submissions per 5 minutes
  message: {
    success: false,
    error: {
      type: ERROR_TYPES.RATE_LIMIT_ERROR,
      message: 'Too many lead submissions. Please try again later.',
      retryAfter: 300 // 5 minutes in seconds
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const email = req.body?.email || req.query?.email;
    return email ? `${req.ip}:${email}` : req.ip;
  },
  skip: (req) => {
    return process.env.NODE_ENV === 'test';
  }
});

/**
 * Rate limiter for application creation
 */
const applicationRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 applications per hour
  message: {
    success: false,
    error: {
      type: ERROR_TYPES.RATE_LIMIT_ERROR,
      message: 'Too many application submissions. Please try again later.',
      retryAfter: 3600 // 1 hour in seconds
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const email = req.body?.email || req.query?.email;
    return email ? `${req.ip}:${email}` : req.ip;
  },
  skip: (req) => {
    return process.env.NODE_ENV === 'test';
  }
});

/**
 * Rate limiter for tool runs
 */
const toolRunRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 20, // 20 tool runs per 10 minutes
  message: {
    success: false,
    error: {
      type: ERROR_TYPES.RATE_LIMIT_ERROR,
      message: 'Too many tool executions. Please try again later.',
      retryAfter: 600 // 10 minutes in seconds
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    return process.env.NODE_ENV === 'test';
  }
});

module.exports = {
  otpRateLimiter,
  callbackRateLimiter,
  leadCaptureRateLimiter,
  applicationRateLimiter,
  toolRunRateLimiter
};