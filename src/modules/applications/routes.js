const express = require('express');
const applicationController = require('./controller');
const { handleValidationErrors } = require('../../middlewares/validation');
const { applicationRateLimiter } = require('../../middlewares/rateLimiter');
const {
  validateCreateApplication,
  validateUpdateApplication,
  validateApplicationId,
  validateGetApplications
} = require('./validation');

const router = express.Router();

/**
 * @route   POST /api/v1/applications
 * @desc    Create a new mortgage application
 * @access  Public
 */
router.post(
  '/',
  applicationRateLimiter,
  validateCreateApplication,
  handleValidationErrors,
  applicationController.createApplication
);

/**
 * @route   GET /api/v1/applications
 * @desc    Get all applications with filtering and pagination
 * @access  Public
 */
router.get(
  '/',
  validateGetApplications,
  handleValidationErrors,
  applicationController.getApplications
);

/**
 * @route   GET /api/v1/applications/statistics
 * @desc    Get application statistics
 * @access  Public
 */
router.get(
  '/statistics',
  applicationController.getApplicationStatistics
);

/**
 * @route   GET /api/v1/applications/:id
 * @desc    Get application by ID
 * @access  Public
 */
router.get(
  '/:id',
  validateApplicationId,
  handleValidationErrors,
  applicationController.getApplicationById
);

/**
 * @route   PATCH /api/v1/applications/:id
 * @desc    Update application
 * @access  Public
 */
router.patch(
  '/:id',
  validateUpdateApplication,
  handleValidationErrors,
  applicationController.updateApplication
);

/**
 * @route   POST /api/v1/applications/:id/submit
 * @desc    Submit application
 * @access  Public
 */
router.post(
  '/:id/submit',
  validateApplicationId,
  handleValidationErrors,
  applicationController.submitApplication
);

/**
 * @route   PATCH /api/v1/applications/:id/abandon
 * @desc    Mark application as abandoned
 * @access  Public
 */
router.patch(
  '/:id/abandon',
  validateApplicationId,
  handleValidationErrors,
  applicationController.markAsAbandoned
);

/**
 * @route   DELETE /api/v1/applications/:id
 * @desc    Delete application
 * @access  Public
 */
router.delete(
  '/:id',
  validateApplicationId,
  handleValidationErrors,
  applicationController.deleteApplication
);

module.exports = router;