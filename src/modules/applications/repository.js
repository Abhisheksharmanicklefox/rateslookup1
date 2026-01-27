const db = require('../../config/db');
const { createDatabaseError } = require('../../utils/errors');

/**
 * Mortgage Applications Repository
 * Handles all database operations for mortgage applications
 */
class ApplicationRepository {
  /**
   * Create a new mortgage application
   * @param {Object} applicationData - Application data
   * @returns {Promise<Object>} Created application
   */
  async create(applicationData) {
    const query = `
      INSERT INTO mortgage_applications (
        first_name, last_name, email, phone, status, loan_amount, property_value,
        property_type, loan_type, credit_score_range, employment_type, annual_income,
        down_payment, property_address, property_city, property_state, property_zip,
        current_step
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING *
    `;

    const values = [
      applicationData.first_name,
      applicationData.last_name,
      applicationData.email,
      applicationData.phone,
      applicationData.status || 'draft',
      applicationData.loan_amount || null,
      applicationData.property_value || null,
      applicationData.property_type || null,
      applicationData.loan_type || null,
      applicationData.credit_score_range || null,
      applicationData.employment_type || null,
      applicationData.annual_income || null,
      applicationData.down_payment || null,
      applicationData.property_address || null,
      applicationData.property_city || null,
      applicationData.property_state || null,
      applicationData.property_zip || null,
      applicationData.current_step || 'personal_info'
    ];

    try {
      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw createDatabaseError(error);
    }
  }

  /**
   * Find application by ID
   * @param {string} id - Application ID
   * @returns {Promise<Object|null>} Application or null
   */
  async findById(id) {
    const query = `
      SELECT ma.*, 
             COUNT(ap.id) as completed_steps,
             array_agg(
               CASE WHEN ap.is_completed = true 
               THEN ap.step 
               ELSE NULL END
             ) FILTER (WHERE ap.is_completed = true) as completed_step_list
      FROM mortgage_applications ma
      LEFT JOIN application_progress ap ON ma.id = ap.application_id
      WHERE ma.id = $1
      GROUP BY ma.id
    `;

    try {
      const result = await db.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      throw createDatabaseError(error);
    }
  }

  /**
   * Find application by email
   * @param {string} email - Email address
   * @returns {Promise<Object|null>} Application or null
   */
  async findByEmail(email) {
    const query = `
      SELECT ma.*, 
             COUNT(ap.id) as completed_steps
      FROM mortgage_applications ma
      LEFT JOIN application_progress ap ON ma.id = ap.application_id AND ap.is_completed = true
      WHERE ma.email = $1
      GROUP BY ma.id
      ORDER BY ma.created_at DESC
      LIMIT 1
    `;

    try {
      const result = await db.query(query, [email]);
      return result.rows[0] || null;
    } catch (error) {
      throw createDatabaseError(error);
    }
  }

  /**
   * Update application
   * @param {string} id - Application ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated application
   */
  async update(id, updateData) {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    // Build dynamic update query
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        fields.push(`${key} = $${paramIndex}`);
        values.push(updateData[key]);
        paramIndex++;
      }
    });

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    const query = `
      UPDATE mortgage_applications 
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    values.push(id);

    try {
      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw createDatabaseError(error);
    }
  }

  /**
   * Get all applications with pagination and filtering
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Applications with pagination info
   */
  async findAll(options = {}) {
    const {
      page = 1,
      limit = 20,
      status,
      loan_type,
      startDate,
      endDate,
      search,
      abandoned
    } = options;

    const offset = (page - 1) * limit;
    let whereConditions = [];
    let queryParams = [];
    let paramIndex = 1;

    // Build WHERE conditions
    if (status) {
      whereConditions.push(`ma.status = $${paramIndex}`);
      queryParams.push(status);
      paramIndex++;
    }

    if (loan_type) {
      whereConditions.push(`ma.loan_type = $${paramIndex}`);
      queryParams.push(loan_type);
      paramIndex++;
    }

    if (abandoned !== undefined) {
      whereConditions.push(`ma.is_abandoned = $${paramIndex}`);
      queryParams.push(abandoned);
      paramIndex++;
    }

    if (startDate) {
      whereConditions.push(`ma.created_at >= $${paramIndex}`);
      queryParams.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      whereConditions.push(`ma.created_at <= $${paramIndex}`);
      queryParams.push(endDate);
      paramIndex++;
    }

    if (search) {
      whereConditions.push(`(
        ma.first_name ILIKE $${paramIndex} OR 
        ma.last_name ILIKE $${paramIndex} OR 
        ma.email ILIKE $${paramIndex}
      )`);
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';

    // Count query
    const countQuery = `
      SELECT COUNT(*) as total
      FROM mortgage_applications ma
      ${whereClause}
    `;

    // Data query
    const dataQuery = `
      SELECT 
        ma.*,
        COUNT(ap.id) FILTER (WHERE ap.is_completed = true) as completed_steps,
        COUNT(ro.id) as rate_offers_count,
        MAX(ro.created_at) as latest_rate_offer
      FROM mortgage_applications ma
      LEFT JOIN application_progress ap ON ma.id = ap.application_id
      LEFT JOIN rate_offers ro ON ma.id = ro.application_id
      ${whereClause}
      GROUP BY ma.id
      ORDER BY ma.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    queryParams.push(limit, offset);

    try {
      const [countResult, dataResult] = await Promise.all([
        db.query(countQuery, queryParams.slice(0, -2)),
        db.query(dataQuery, queryParams)
      ]);

      const total = parseInt(countResult.rows[0].total);
      const totalPages = Math.ceil(total / limit);

      return {
        data: dataResult.rows,
        pagination: {
          total,
          page,
          limit,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      };
    } catch (error) {
      throw createDatabaseError(error);
    }
  }

  /**
   * Mark application as abandoned
   * @param {string} id - Application ID
   * @returns {Promise<Object>} Updated application
   */
  async markAsAbandoned(id) {
    const query = `
      UPDATE mortgage_applications 
      SET 
        is_abandoned = true,
        abandoned_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND is_abandoned = false
      RETURNING *
    `;

    try {
      const result = await db.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw createDatabaseError(error);
    }
  }

  /**
   * Submit application
   * @param {string} id - Application ID
   * @returns {Promise<Object>} Updated application
   */
  async submit(id) {
    const query = `
      UPDATE mortgage_applications 
      SET 
        status = 'submitted',
        submitted_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND status IN ('draft', 'in_progress')
      RETURNING *
    `;

    try {
      const result = await db.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw createDatabaseError(error);
    }
  }

  /**
   * Get application statistics
   * @param {Object} options - Filter options
   * @returns {Promise<Object>} Application statistics
   */
  async getStatistics(options = {}) {
    const { startDate, endDate } = options;
    
    let whereConditions = [];
    let queryParams = [];
    let paramIndex = 1;

    if (startDate) {
      whereConditions.push(`created_at >= $${paramIndex}`);
      queryParams.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      whereConditions.push(`created_at <= $${paramIndex}`);
      queryParams.push(endDate);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';

    const query = `
      SELECT 
        COUNT(*) as total_applications,
        COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_applications,
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_applications,
        COUNT(CASE WHEN status = 'submitted' THEN 1 END) as submitted_applications,
        COUNT(CASE WHEN status = 'under_review' THEN 1 END) as under_review_applications,
        COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_applications,
        COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_applications,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_applications,
        COUNT(CASE WHEN is_abandoned = true THEN 1 END) as abandoned_applications,
        AVG(loan_amount) FILTER (WHERE loan_amount IS NOT NULL) as avg_loan_amount,
        AVG(property_value) FILTER (WHERE property_value IS NOT NULL) as avg_property_value,
        COUNT(CASE WHEN loan_type = 'conventional' THEN 1 END) as conventional_loans,
        COUNT(CASE WHEN loan_type = 'fha' THEN 1 END) as fha_loans,
        COUNT(CASE WHEN loan_type = 'va' THEN 1 END) as va_loans,
        COUNT(CASE WHEN loan_type = 'usda' THEN 1 END) as usda_loans,
        COUNT(CASE WHEN loan_type = 'jumbo' THEN 1 END) as jumbo_loans
      FROM mortgage_applications
      ${whereClause}
    `;

    try {
      const result = await db.query(query, queryParams);
      return result.rows[0];
    } catch (error) {
      throw createDatabaseError(error);
    }
  }

  /**
   * Delete application
   * @param {string} id - Application ID
   * @returns {Promise<boolean>} Success status
   */
  async delete(id) {
    const query = 'DELETE FROM mortgage_applications WHERE id = $1';

    try {
      const result = await db.query(query, [id]);
      return result.rowCount > 0;
    } catch (error) {
      throw createDatabaseError(error);
    }
  }

  /**
   * Find applications that should be marked as abandoned
   * @param {number} hoursThreshold - Hours of inactivity threshold
   * @returns {Promise<Array>} Applications to abandon
   */
  async findApplicationsToAbandon(hoursThreshold = 24) {
    const query = `
      SELECT id, email, first_name, last_name, current_step, updated_at
      FROM mortgage_applications
      WHERE 
        status IN ('draft', 'in_progress') 
        AND is_abandoned = false
        AND updated_at < NOW() - INTERVAL '${hoursThreshold} hours'
      ORDER BY updated_at ASC
    `;

    try {
      const result = await db.query(query);
      return result.rows;
    } catch (error) {
      throw createDatabaseError(error);
    }
  }
}

module.exports = new ApplicationRepository();