const express = require('express');
const leadController = require('./controller');
const { handleValidationErrors } = require('../../middlewares/validation');
const { leadCaptureRateLimiter } = require('../../middlewares/rateLimiter');
const {
  validateCreateLead,
  validateLeadId,
  validateEmailParam,
  validateGetLeads,
  validateMarkAsConverted,
  validateLeadStatistics,
  validateBulkCreateLeads,
  validateDateRange
} = require('./validation');

const router = express.Router();

/**
 * @route   POST /api/v1/leads
 * @desc    Create a new lead capture
 * @access  Public
 */
router.post(
  '/',
  leadCaptureRateLimiter,
  validateCreateLead,
  handleValidationErrors,
  leadController.createLead
);

/**
 * @route   POST /api/v1/leads/bulk
 * @desc    Bulk create lead captures
 * @access  Public (with higher rate limiting)
 */
router.post(
  '/bulk',
  validateBulkCreateLeads,
  handleValidationErrors,
  leadController.bulkCreateLeads
);

/**
 * @route   GET /api/v1/leads
 * @desc    Get all leads with filtering and pagination
 * @access  Public
 */
router.get(
  '/',
  validateGetLeads,
  validateDateRange,
  handleValidationErrors,
  leadController.getLeads
);

/**
 * @route   GET /api/v1/leads/statistics
 * @desc    Get lead statistics
 * @access  Public
 */
router.get(
  '/statistics',
  validateLeadStatistics,
  validateDateRange,
  handleValidationErrors,
  leadController.getLeadStatistics
);

/**
 * @route   GET /api/v1/leads/by-source
 * @desc    Get leads grouped by source
 * @access  Public
 */
router.get(
  '/by-source',
  validateLeadStatistics,
  validateDateRange,
  handleValidationErrors,
  leadController.getLeadsBySource
);

/**
 * @route   GET /api/v1/leads/funnel
 * @desc    Get lead conversion funnel data
 * @access  Public
 */
router.get(
  '/funnel',
  validateLeadStatistics,
  validateDateRange,
  handleValidationErrors,
  leadController.getLeadFunnel
);

/**
 * @route   GET /api/v1/leads/:id
 * @desc    Get lead by ID
 * @access  Public
 */
router.get(
  '/:id',
  validateLeadId,
  handleValidationErrors,
  leadController.getLeadById
);

/**
 * @route   GET /api/v1/leads/email/:email
 * @desc    Get lead by email
 * @access  Public
 */
router.get(
  '/email/:email',
  validateEmailParam,
  handleValidationErrors,
  leadController.getLeadByEmail
);

/**
 * @route   PATCH /api/v1/leads/:id/convert
 * @desc    Mark lead as converted to application
 * @access  Public
 */
router.patch(
  '/:id/convert',
  validateMarkAsConverted,
  handleValidationErrors,
  leadController.markLeadAsConverted
);

/**
 * @route   DELETE /api/v1/leads/:id
 * @desc    Delete a lead capture
 * @access  Public
 */
router.delete(
  '/:id',
  validateLeadId,
  handleValidationErrors,
  leadController.deleteLead
);

module.exports = router;