const applicationRepository = require('./repository');
const leadService = require('../leads/service');
const { createNotFoundError, createValidationError, BusinessLogicError } = require('../../utils/errors');
const { isValidEmail, isValidPhone, formatPhoneNumber, sanitizeString, calculateLTV } = require('../../utils/helpers');
const { APPLICATION_STATUS, PROGRESS_STEPS, LOAN_TYPES, PROPERTY_TYPES, EMPLOYMENT_TYPES } = require('../../config/constants');

/**
 * Mortgage Application Service
 * Handles business logic for mortgage applications
 */
class ApplicationService {
  /**
   * Create a new mortgage application
   * @param {Object} applicationData - Application data
   * @param {Object} metadata - Request metadata
   * @returns {Promise<Object>} Created application
   */
  async createApplication(applicationData, metadata = {}) {
    // Validate required fields
    this.validateApplicationData(applicationData);

    // Check for existing application with same email
    const existingApplication = await applicationRepository.findByEmail(applicationData.email);
    
    if (existingApplication && existingApplication.status !== 'cancelled') {
      throw new BusinessLogicError('An active application already exists for this email address');
    }

    // Prepare application data
    const processedData = {
      first_name: sanitizeString(applicationData.first_name),
      last_name: sanitizeString(applicationData.last_name),
      email: applicationData.email.toLowerCase().trim(),
      phone: formatPhoneNumber(applicationData.phone),
      status: APPLICATION_STATUS.DRAFT,
      loan_amount: applicationData.loan_amount || null,
      property_value: applicationData.property_value || null,
      property_type: applicationData.property_type || null,
      loan_type: applicationData.loan_type || null,
      credit_score_range: applicationData.credit_score_range || null,
      employment_type: applicationData.employment_type || null,
      annual_income: applicationData.annual_income || null,
      down_payment: applicationData.down_payment || null,
      property_address: sanitizeString(applicationData.property_address),
      property_city: sanitizeString(applicationData.property_city),
      property_state: sanitizeString(applicationData.property_state),
      property_zip: applicationData.property_zip || null,
      current_step: PROGRESS_STEPS.PERSONAL_INFO
    };

    const createdApplication = await applicationRepository.create(processedData);

    // Try to link with existing lead
    try {
      const existingLead = await leadService.getLeadByEmail(applicationData.email);
      if (existingLead && !existingLead.converted_to_application) {
        await leadService.markLeadAsConverted(existingLead.id, createdApplication.id);
      }
    } catch (error) {
      // Log but don't fail application creation if lead linking fails
      console.warn('Failed to link application with lead:', error.message);
    }

    return this.formatApplicationResponse(createdApplication);
  }

  /**
   * Get application by ID
   * @param {string} id - Application ID
   * @returns {Promise<Object>} Application
   */
  async getApplicationById(id) {
    const application = await applicationRepository.findById(id);
    
    if (!application) {
      throw createNotFoundError('Application', id);
    }

    return this.formatApplicationResponse(application);
  }

  /**
   * Update application
   * @param {string} id - Application ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated application
   */
  async updateApplication(id, updateData) {
    const existingApplication = await applicationRepository.findById(id);
    
    if (!existingApplication) {
      throw createNotFoundError('Application', id);
    }

    // Validate that application can be updated
    if (existingApplication.status === 'submitted') {
      throw new BusinessLogicError('Cannot update a submitted application');
    }

    if (existingApplication.status === 'approved' || existingApplication.status === 'rejected') {
      throw new BusinessLogicError('Cannot update a finalized application');
    }

    // Validate update data
    this.validateUpdateData(updateData);

    // Process update data
    const processedUpdateData = this.processUpdateData(updateData);

    // Update status to in_progress if it was draft and we have meaningful data
    if (existingApplication.status === 'draft' && this.hasSignificantProgress(processedUpdateData)) {
      processedUpdateData.status = APPLICATION_STATUS.IN_PROGRESS;
    }

    const updatedApplication = await applicationRepository.update(id, processedUpdateData);
    
    return this.formatApplicationResponse(updatedApplication);
  }

  /**
   * Submit application
   * @param {string} id - Application ID
   * @returns {Promise<Object>} Submitted application
   */
  async submitApplication(id) {
    const application = await applicationRepository.findById(id);
    
    if (!application) {
      throw createNotFoundError('Application', id);
    }

    if (application.status === 'submitted') {
      throw new BusinessLogicError('Application has already been submitted');
    }

    if (application.status !== 'in_progress') {
      throw new BusinessLogicError('Application must be in progress before submission');
    }

    // Validate that application is complete enough for submission
    this.validateApplicationForSubmission(application);

    const submittedApplication = await applicationRepository.submit(id);
    
    return this.formatApplicationResponse(submittedApplication);
  }

  /**
   * Get all applications with filtering and pagination
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Applications with pagination
   */
  async getApplications(options = {}) {
    const result = await applicationRepository.findAll(options);

    return {
      success: true,
      data: result.data.map(app => this.formatApplicationResponse(app)),
      pagination: result.pagination
    };
  }

  /**
   * Mark application as abandoned
   * @param {string} id - Application ID
   * @returns {Promise<Object>} Updated application
   */
  async markAsAbandoned(id) {
    const application = await applicationRepository.findById(id);
    
    if (!application) {
      throw createNotFoundError('Application', id);
    }

    if (application.is_abandoned) {
      throw new BusinessLogicError('Application is already marked as abandoned');
    }

    if (application.status === 'submitted' || application.status === 'approved') {
      throw new BusinessLogicError('Cannot abandon a submitted or approved application');
    }

    const updatedApplication = await applicationRepository.markAsAbandoned(id);
    
    return this.formatApplicationResponse(updatedApplication);
  }

  /**
   * Get application statistics
   * @param {Object} options - Filter options
   * @returns {Promise<Object>} Application statistics
   */
  async getApplicationStatistics(options = {}) {
    const stats = await applicationRepository.getStatistics(options);
    
    return {
      success: true,
      data: {
        total_applications: parseInt(stats.total_applications),
        by_status: {
          draft: parseInt(stats.draft_applications),
          in_progress: parseInt(stats.in_progress_applications),
          submitted: parseInt(stats.submitted_applications),
          under_review: parseInt(stats.under_review_applications),
          approved: parseInt(stats.approved_applications),
          rejected: parseInt(stats.rejected_applications),
          cancelled: parseInt(stats.cancelled_applications)
        },
        abandoned_applications: parseInt(stats.abandoned_applications),
        averages: {
          loan_amount: parseFloat(stats.avg_loan_amount) || 0,
          property_value: parseFloat(stats.avg_property_value) || 0
        },
        by_loan_type: {
          conventional: parseInt(stats.conventional_loans),
          fha: parseInt(stats.fha_loans),
          va: parseInt(stats.va_loans),
          usda: parseInt(stats.usda_loans),
          jumbo: parseInt(stats.jumbo_loans)
        }
      }
    };
  }

  /**
   * Delete application
   * @param {string} id - Application ID
   * @returns {Promise<Object>} Success response
   */
  async deleteApplication(id) {
    const application = await applicationRepository.findById(id);
    
    if (!application) {
      throw createNotFoundError('Application', id);
    }

    if (application.status === 'submitted' || application.status === 'under_review') {
      throw new BusinessLogicError('Cannot delete a submitted or under review application');
    }

    await applicationRepository.delete(id);
    
    return {
      success: true,
      message: 'Application deleted successfully'
    };
  }

  /**
   * Validate application data
   * @param {Object} applicationData - Application data to validate
   * @throws {ValidationError} If validation fails
   */
  validateApplicationData(applicationData) {
    const errors = [];

    // Required fields
    if (!applicationData.first_name || applicationData.first_name.trim().length === 0) {
      errors.push({ field: 'first_name', message: 'First name is required' });
    }

    if (!applicationData.last_name || applicationData.last_name.trim().length === 0) {
      errors.push({ field: 'last_name', message: 'Last name is required' });
    }

    if (!applicationData.email || applicationData.email.trim().length === 0) {
      errors.push({ field: 'email', message: 'Email is required' });
    } else if (!isValidEmail(applicationData.email)) {
      errors.push({ field: 'email', message: 'Invalid email format' });
    }

    if (!applicationData.phone || applicationData.phone.trim().length === 0) {
      errors.push({ field: 'phone', message: 'Phone number is required' });
    } else if (!isValidPhone(applicationData.phone)) {
      errors.push({ field: 'phone', message: 'Invalid phone number format' });
    }

    // Optional field validation
    if (applicationData.loan_type && !Object.values(LOAN_TYPES).includes(applicationData.loan_type)) {
      errors.push({ field: 'loan_type', message: 'Invalid loan type' });
    }

    if (applicationData.property_type && !Object.values(PROPERTY_TYPES).includes(applicationData.property_type)) {
      errors.push({ field: 'property_type', message: 'Invalid property type' });
    }

    if (applicationData.employment_type && !Object.values(EMPLOYMENT_TYPES).includes(applicationData.employment_type)) {
      errors.push({ field: 'employment_type', message: 'Invalid employment type' });
    }

    if (errors.length > 0) {
      throw createValidationError('Application validation failed', errors);
    }
  }

  /**
   * Validate update data
   * @param {Object} updateData - Update data to validate
   * @throws {ValidationError} If validation fails
   */
  validateUpdateData(updateData) {
    const errors = [];

    if (updateData.email && !isValidEmail(updateData.email)) {
      errors.push({ field: 'email', message: 'Invalid email format' });
    }

    if (updateData.phone && !isValidPhone(updateData.phone)) {
      errors.push({ field: 'phone', message: 'Invalid phone number format' });
    }

    if (updateData.loan_type && !Object.values(LOAN_TYPES).includes(updateData.loan_type)) {
      errors.push({ field: 'loan_type', message: 'Invalid loan type' });
    }

    if (updateData.property_type && !Object.values(PROPERTY_TYPES).includes(updateData.property_type)) {
      errors.push({ field: 'property_type', message: 'Invalid property type' });
    }

    if (updateData.employment_type && !Object.values(EMPLOYMENT_TYPES).includes(updateData.employment_type)) {
      errors.push({ field: 'employment_type', message: 'Invalid employment type' });
    }

    if (errors.length > 0) {
      throw createValidationError('Update validation failed', errors);
    }
  }

  /**
   * Process update data
   * @param {Object} updateData - Raw update data
   * @returns {Object} Processed update data
   */
  processUpdateData(updateData) {
    const processed = {};

    // String fields that need sanitization
    const stringFields = ['first_name', 'last_name', 'property_address', 'property_city', 'property_state'];
    stringFields.forEach(field => {
      if (updateData[field] !== undefined) {
        processed[field] = sanitizeString(updateData[field]);
      }
    });

    // Email normalization
    if (updateData.email) {
      processed.email = updateData.email.toLowerCase().trim();
    }

    // Phone formatting
    if (updateData.phone) {
      processed.phone = formatPhoneNumber(updateData.phone);
    }

    // Direct copy fields
    const directFields = [
      'loan_amount', 'property_value', 'property_type', 'loan_type', 
      'credit_score_range', 'employment_type', 'annual_income', 
      'down_payment', 'property_zip', 'current_step'
    ];
    
    directFields.forEach(field => {
      if (updateData[field] !== undefined) {
        processed[field] = updateData[field];
      }
    });

    return processed;
  }

  /**
   * Check if update data represents significant progress
   * @param {Object} updateData - Update data
   * @returns {boolean} True if significant progress
   */
  hasSignificantProgress(updateData) {
    const significantFields = [
      'loan_amount', 'property_value', 'loan_type', 'property_type',
      'credit_score_range', 'employment_type', 'annual_income'
    ];

    return significantFields.some(field => updateData[field] !== undefined && updateData[field] !== null);
  }

  /**
   * Validate application for submission
   * @param {Object} application - Application to validate
   * @throws {BusinessLogicError} If validation fails
   */
  validateApplicationForSubmission(application) {
    const requiredFields = [
      'loan_amount', 'property_value', 'loan_type', 'property_type',
      'credit_score_range', 'employment_type', 'annual_income', 'down_payment'
    ];

    const missingFields = requiredFields.filter(field => 
      !application[field] || application[field] === null
    );

    if (missingFields.length > 0) {
      throw new BusinessLogicError(
        `Application is incomplete. Missing required fields: ${missingFields.join(', ')}`
      );
    }

    // Validate loan-to-value ratio
    const ltv = calculateLTV(application.loan_amount, application.property_value);
    if (ltv > 100) {
      throw new BusinessLogicError('Loan amount cannot exceed property value');
    }
  }

  /**
   * Format application response
   * @param {Object} application - Raw application data
   * @returns {Object} Formatted application response
   */
  formatApplicationResponse(application) {
    const ltv = application.loan_amount && application.property_value 
      ? calculateLTV(application.loan_amount, application.property_value)
      : null;

    return {
      id: application.id,
      personal_info: {
        first_name: application.first_name,
        last_name: application.last_name,
        email: application.email,
        phone: application.phone
      },
      loan_info: {
        loan_amount: application.loan_amount,
        loan_type: application.loan_type,
        down_payment: application.down_payment
      },
      property_info: {
        property_value: application.property_value,
        property_type: application.property_type,
        property_address: application.property_address,
        property_city: application.property_city,
        property_state: application.property_state,
        property_zip: application.property_zip
      },
      financial_info: {
        credit_score_range: application.credit_score_range,
        employment_type: application.employment_type,
        annual_income: application.annual_income
      },
      status: application.status,
      current_step: application.current_step,
      is_abandoned: application.is_abandoned,
      completed_steps: parseInt(application.completed_steps) || 0,
      completed_step_list: application.completed_step_list || [],
      ltv_ratio: ltv,
      rate_offers_count: parseInt(application.rate_offers_count) || 0,
      latest_rate_offer: application.latest_rate_offer,
      submitted_at: application.submitted_at,
      abandoned_at: application.abandoned_at,
      created_at: application.created_at,
      updated_at: application.updated_at
    };
  }
}

module.exports = new ApplicationService();