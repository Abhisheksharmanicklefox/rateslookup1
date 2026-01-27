const applicationService = require('./service');
const { asyncHandler } = require('../../utils/errors');
const { HTTP_STATUS } = require('../../config/constants');

/**
 * Mortgage Application Controller
 * Handles HTTP requests for mortgage application operations
 */
class ApplicationController {
  /**
   * Create a new mortgage application
   * POST /api/v1/applications
   */
  createApplication = asyncHandler(async (req, res) => {
    const applicationData = req.body;
    
    const metadata = {
      ip_address: req.ip,
      user_agent: req.get('User-Agent')
    };

    const application = await applicationService.createApplication(applicationData, metadata);

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Application created successfully',
      data: application
    });
  });

  /**
   * Get application by ID
   * GET /api/v1/applications/:id
   */
  getApplicationById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const application = await applicationService.getApplicationById(id);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: application
    });
  });

  /**
   * Update application
   * PATCH /api/v1/applications/:id
   */
  updateApplication = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    const application = await applicationService.updateApplication(id, updateData);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Application updated successfully',
      data: application
    });
  });

  /**
   * Submit application
   * POST /api/v1/applications/:id/submit
   */
  submitApplication = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const application = await applicationService.submitApplication(id);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Application submitted successfully',
      data: application
    });
  });

  /**
   * Get all applications with filtering and pagination
   * GET /api/v1/applications
   */
  getApplications = asyncHandler(async (req, res) => {
    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20,
      status: req.query.status,
      loan_type: req.query.loan_type,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      search: req.query.search,
      abandoned: req.query.abandoned === 'true'
    };

    const result = await applicationService.getApplications(options);

    res.status(HTTP_STATUS.OK).json(result);
  });

  /**
   * Mark application as abandoned
   * PATCH /api/v1/applications/:id/abandon
   */
  markAsAbandoned = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const application = await applicationService.markAsAbandoned(id);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Application marked as abandoned',
      data: application
    });
  });

  /**
   * Get application statistics
   * GET /api/v1/applications/statistics
   */
  getApplicationStatistics = asyncHandler(async (req, res) => {
    const options = {
      startDate: req.query.startDate,
      endDate: req.query.endDate
    };

    const statistics = await applicationService.getApplicationStatistics(options);

    res.status(HTTP_STATUS.OK).json(statistics);
  });

  /**
   * Delete application
   * DELETE /api/v1/applications/:id
   */
  deleteApplication = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await applicationService.deleteApplication(id);

    res.status(HTTP_STATUS.OK).json(result);
  });
}

module.exports = new ApplicationController();