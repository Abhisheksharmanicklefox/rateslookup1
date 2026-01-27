const leadService = require('./service');
const { asyncHandler } = require('../../utils/errors');
const { HTTP_STATUS } = require('../../config/constants');

/**
 * Lead Capture Controller
 * Handles HTTP requests for lead capture operations
 */
class LeadController {
  /**
   * Create a new lead capture
   * POST /api/v1/leads
   */
  createLead = asyncHandler(async (req, res) => {
    const leadData = req.body;
    
    // Extract metadata from request
    const metadata = {
      ip_address: req.ip,
      user_agent: req.get('User-Agent'),
      referrer_url: req.get('Referer')
    };

    const lead = await leadService.createLead(leadData, metadata);

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Lead captured successfully',
      data: lead
    });
  });

  /**
   * Get lead by ID
   * GET /api/v1/leads/:id
   */
  getLeadById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const lead = await leadService.getLeadById(id);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: lead
    });
  });

  /**
   * Get lead by email
   * GET /api/v1/leads/email/:email
   */
  getLeadByEmail = asyncHandler(async (req, res) => {
    const { email } = req.params;
    const lead = await leadService.getLeadByEmail(email);

    if (!lead) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Lead not found'
      });
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: lead
    });
  });

  /**
   * Get all leads with filtering and pagination
   * GET /api/v1/leads
   */
  getLeads = asyncHandler(async (req, res) => {
    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20,
      source: req.query.source,
      converted: req.query.converted,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      search: req.query.search
    };

    const result = await leadService.getLeads(options);

    res.status(HTTP_STATUS.OK).json(result);
  });

  /**
   * Mark lead as converted to application
   * PATCH /api/v1/leads/:id/convert
   */
  markLeadAsConverted = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { applicationId } = req.body;

    if (!applicationId) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Application ID is required'
      });
    }

    const lead = await leadService.markLeadAsConverted(id, applicationId);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Lead marked as converted successfully',
      data: lead
    });
  });

  /**
   * Get lead statistics
   * GET /api/v1/leads/statistics
   */
  getLeadStatistics = asyncHandler(async (req, res) => {
    const options = {
      startDate: req.query.startDate,
      endDate: req.query.endDate
    };

    const statistics = await leadService.getLeadStatistics(options);

    res.status(HTTP_STATUS.OK).json(statistics);
  });

  /**
   * Get leads grouped by source
   * GET /api/v1/leads/by-source
   */
  getLeadsBySource = asyncHandler(async (req, res) => {
    const options = {
      startDate: req.query.startDate,
      endDate: req.query.endDate
    };

    const sourceData = await leadService.getLeadsBySource(options);

    res.status(HTTP_STATUS.OK).json(sourceData);
  });

  /**
   * Delete a lead capture
   * DELETE /api/v1/leads/:id
   */
  deleteLead = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await leadService.deleteLead(id);

    res.status(HTTP_STATUS.OK).json(result);
  });

  /**
   * Bulk create leads (for testing/migration purposes)
   * POST /api/v1/leads/bulk
   */
  bulkCreateLeads = asyncHandler(async (req, res) => {
    const { leads } = req.body;

    if (!Array.isArray(leads) || leads.length === 0) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Leads array is required and must not be empty'
      });
    }

    if (leads.length > 100) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Maximum 100 leads can be created at once'
      });
    }

    const metadata = {
      ip_address: req.ip,
      user_agent: req.get('User-Agent')
    };

    const results = [];
    const errors = [];

    for (let i = 0; i < leads.length; i++) {
      try {
        const lead = await leadService.createLead(leads[i], metadata);
        results.push(lead);
      } catch (error) {
        errors.push({
          index: i,
          data: leads[i],
          error: error.message
        });
      }
    }

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: `${results.length} leads created successfully`,
      data: {
        created: results,
        errors: errors,
        summary: {
          total: leads.length,
          created: results.length,
          failed: errors.length
        }
      }
    });
  });

  /**
   * Get lead conversion funnel data
   * GET /api/v1/leads/funnel
   */
  getLeadFunnel = asyncHandler(async (req, res) => {
    const options = {
      startDate: req.query.startDate,
      endDate: req.query.endDate
    };

    const [statistics, sourceData] = await Promise.all([
      leadService.getLeadStatistics(options),
      leadService.getLeadsBySource(options)
    ]);

    const funnelData = {
      total_leads: statistics.data.total_leads,
      converted_leads: statistics.data.converted_leads,
      conversion_rate: statistics.data.conversion_rate,
      sources: sourceData.data,
      funnel_stages: [
        {
          stage: 'Lead Captured',
          count: statistics.data.total_leads,
          percentage: 100
        },
        {
          stage: 'Converted to Application',
          count: statistics.data.converted_leads,
          percentage: statistics.data.conversion_rate
        }
      ]
    };

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: funnelData
    });
  });
}

module.exports = new LeadController();