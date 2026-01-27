const leadRepository = require('./repository');
const { createNotFoundError, createValidationError, BusinessLogicError } = require('../../utils/errors');
const { isValidEmail, isValidPhone, formatPhoneNumber, sanitizeString, createPaginationMeta } = require('../../utils/helpers');
const { LEAD_SOURCES } = require('../../config/constants');

/**
 * Lead Capture Service
 * Handles business logic for lead captures
 */
class LeadService {
  /**
   * Create a new lead capture
   * @param {Object} leadData - Lead capture data
   * @param {Object} metadata - Request metadata (IP, user agent, etc.)
   * @returns {Promise<Object>} Created lead capture
   */
  async createLead(leadData, metadata = {}) {
    // Validate required fields
    this.validateLeadData(leadData);

    // Check for existing lead with same email
    const existingLead = await leadRepository.findByEmail(leadData.email);
    
    // If lead exists and was created recently (within 24 hours), return existing
    if (existingLead) {
      const hoursSinceCreation = (Date.now() - new Date(existingLead.created_at).getTime()) / (1000 * 60 * 60);
      
      if (hoursSinceCreation < 24) {
        // Update the existing lead with new metadata if provided
        return existingLead;
      }
    }

    // Prepare lead data
    const processedLeadData = {
      first_name: sanitizeString(leadData.first_name),
      email: leadData.email.toLowerCase().trim(),
      phone: leadData.phone ? formatPhoneNumber(leadData.phone) : null,
      source: this.validateSource(leadData.source),
      utm_source: sanitizeString(leadData.utm_source),
      utm_medium: sanitizeString(leadData.utm_medium),
      utm_campaign: sanitizeString(leadData.utm_campaign),
      utm_content: sanitizeString(leadData.utm_content),
      utm_term: sanitizeString(leadData.utm_term),
      referrer_url: leadData.referrer_url,
      ip_address: metadata.ip_address,
      user_agent: metadata.user_agent
    };

    const createdLead = await leadRepository.create(processedLeadData);

    return {
      id: createdLead.id,
      first_name: createdLead.first_name,
      email: createdLead.email,
      phone: createdLead.phone,
      source: createdLead.source,
      converted_to_application: createdLead.converted_to_application,
      created_at: createdLead.created_at
    };
  }

  /**
   * Get lead by ID
   * @param {string} id - Lead ID
   * @returns {Promise<Object>} Lead capture
   */
  async getLeadById(id) {
    const lead = await leadRepository.findById(id);
    
    if (!lead) {
      throw createNotFoundError('Lead', id);
    }

    return this.formatLeadResponse(lead);
  }

  /**
   * Get lead by email
   * @param {string} email - Email address
   * @returns {Promise<Object|null>} Lead capture or null
   */
  async getLeadByEmail(email) {
    if (!isValidEmail(email)) {
      throw createValidationError('Invalid email format');
    }

    const lead = await leadRepository.findByEmail(email.toLowerCase().trim());
    
    return lead ? this.formatLeadResponse(lead) : null;
  }

  /**
   * Get all leads with filtering and pagination
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Leads with pagination
   */
  async getLeads(options = {}) {
    const {
      page = 1,
      limit = 20,
      source,
      converted,
      startDate,
      endDate,
      search
    } = options;

    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
      throw createValidationError('Invalid pagination parameters');
    }

    // Validate source if provided
    if (source && !Object.values(LEAD_SOURCES).includes(source)) {
      throw createValidationError('Invalid lead source');
    }

    // Validate date range
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      throw createValidationError('Start date must be before end date');
    }

    const result = await leadRepository.findAll({
      page,
      limit,
      source,
      converted: converted !== undefined ? converted === 'true' : undefined,
      startDate,
      endDate,
      search: search ? sanitizeString(search) : undefined
    });

    return {
      success: true,
      data: result.data.map(lead => this.formatLeadResponse(lead)),
      pagination: result.pagination
    };
  }

  /**
   * Mark lead as converted to application
   * @param {string} leadId - Lead ID
   * @param {string} applicationId - Application ID
   * @returns {Promise<Object>} Updated lead
   */
  async markLeadAsConverted(leadId, applicationId) {
    const existingLead = await leadRepository.findById(leadId);
    
    if (!existingLead) {
      throw createNotFoundError('Lead', leadId);
    }

    if (existingLead.converted_to_application) {
      throw new BusinessLogicError('Lead has already been converted to an application');
    }

    const updatedLead = await leadRepository.markAsConverted(leadId, applicationId);
    
    return this.formatLeadResponse(updatedLead);
  }

  /**
   * Get lead statistics
   * @param {Object} options - Filter options
   * @returns {Promise<Object>} Lead statistics
   */
  async getLeadStatistics(options = {}) {
    const { startDate, endDate } = options;

    // Validate date range
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      throw createValidationError('Start date must be before end date');
    }

    const stats = await leadRepository.getStatistics({ startDate, endDate });
    
    return {
      success: true,
      data: {
        total_leads: parseInt(stats.total_leads),
        converted_leads: parseInt(stats.converted_leads),
        conversion_rate: parseFloat(stats.conversion_rate) || 0,
        sources: {
          website: parseInt(stats.website_leads),
          landing_page: parseInt(stats.landing_page_leads),
          social_media: parseInt(stats.social_media_leads),
          referral: parseInt(stats.referral_leads),
          advertisement: parseInt(stats.advertisement_leads),
          organic_search: parseInt(stats.organic_search_leads),
          paid_search: parseInt(stats.paid_search_leads),
          email_campaign: parseInt(stats.email_campaign_leads),
          other: parseInt(stats.other_leads)
        }
      }
    };
  }

  /**
   * Get leads grouped by source
   * @param {Object} options - Filter options
   * @returns {Promise<Object>} Leads by source
   */
  async getLeadsBySource(options = {}) {
    const { startDate, endDate } = options;

    // Validate date range
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      throw createValidationError('Start date must be before end date');
    }

    const sourceData = await leadRepository.getLeadsBySource({ startDate, endDate });
    
    return {
      success: true,
      data: sourceData.map(item => ({
        source: item.source,
        total_leads: parseInt(item.total_leads),
        converted_leads: parseInt(item.converted_leads),
        conversion_rate: parseFloat(item.conversion_rate) || 0
      }))
    };
  }

  /**
   * Delete a lead capture
   * @param {string} id - Lead ID
   * @returns {Promise<Object>} Success response
   */
  async deleteLead(id) {
    const existingLead = await leadRepository.findById(id);
    
    if (!existingLead) {
      throw createNotFoundError('Lead', id);
    }

    if (existingLead.converted_to_application) {
      throw new BusinessLogicError('Cannot delete a lead that has been converted to an application');
    }

    await leadRepository.delete(id);
    
    return {
      success: true,
      message: 'Lead deleted successfully'
    };
  }

  /**
   * Validate lead data
   * @param {Object} leadData - Lead data to validate
   * @throws {ValidationError} If validation fails
   */
  validateLeadData(leadData) {
    const errors = [];

    // Required fields
    if (!leadData.first_name || leadData.first_name.trim().length === 0) {
      errors.push({ field: 'first_name', message: 'First name is required' });
    }

    if (!leadData.email || leadData.email.trim().length === 0) {
      errors.push({ field: 'email', message: 'Email is required' });
    } else if (!isValidEmail(leadData.email)) {
      errors.push({ field: 'email', message: 'Invalid email format' });
    }

    // Optional phone validation
    if (leadData.phone && !isValidPhone(leadData.phone)) {
      errors.push({ field: 'phone', message: 'Invalid phone number format' });
    }

    // Field length validation
    if (leadData.first_name && leadData.first_name.length > 100) {
      errors.push({ field: 'first_name', message: 'First name must be less than 100 characters' });
    }

    if (leadData.email && leadData.email.length > 255) {
      errors.push({ field: 'email', message: 'Email must be less than 255 characters' });
    }

    if (errors.length > 0) {
      throw createValidationError('Lead validation failed', errors);
    }
  }

  /**
   * Validate and normalize lead source
   * @param {string} source - Lead source
   * @returns {string} Validated source
   */
  validateSource(source) {
    if (!source) {
      return LEAD_SOURCES.WEBSITE;
    }

    const normalizedSource = source.toLowerCase();
    const validSources = Object.values(LEAD_SOURCES);
    
    if (validSources.includes(normalizedSource)) {
      return normalizedSource;
    }

    return LEAD_SOURCES.OTHER;
  }

  /**
   * Format lead response
   * @param {Object} lead - Raw lead data
   * @returns {Object} Formatted lead response
   */
  formatLeadResponse(lead) {
    return {
      id: lead.id,
      first_name: lead.first_name,
      email: lead.email,
      phone: lead.phone,
      source: lead.source,
      utm_data: {
        utm_source: lead.utm_source,
        utm_medium: lead.utm_medium,
        utm_campaign: lead.utm_campaign,
        utm_content: lead.utm_content,
        utm_term: lead.utm_term
      },
      referrer_url: lead.referrer_url,
      converted_to_application: lead.converted_to_application,
      application: lead.application_id ? {
        id: lead.application_id,
        status: lead.application_status,
        created_at: lead.application_created_at
      } : null,
      created_at: lead.created_at,
      updated_at: lead.updated_at
    };
  }
}

module.exports = new LeadService();