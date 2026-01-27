const db = require('../../config/db');
const { createDatabaseError } = require('../../utils/errors');

/**
 * Lead Captures Repository
 * Handles all database operations for lead captures
 */
class LeadRepository {
  /**
   * Create a new lead capture
   * @param {Object} leadData - Lead capture data
   * @returns {Promise<Object>} Created lead capture
   */
  async create(leadData) {
    const query = `
      INSERT INTO lead_captures (
        first_name, email, phone, source, utm_source, utm_medium, 
        utm_campaign, utm_content, utm_term, referrer_url, ip_address, user_agent
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `;

    const values = [
      leadData.first_name,
      leadData.email,
      leadData.phone || null,
      leadData.source || 'website',
      leadData.utm_source || null,
      leadData.utm_medium || null,
      leadData.utm_campaign || null,
      leadData.utm_content || null,
      leadData.utm_term || null,
      leadData.referrer_url || null,
      leadData.ip_address || null,
      leadData.user_agent || null
    ];

    try {
      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw createDatabaseError(error);
    }
  }

  /**
   * Find lead by ID
   * @param {string} id - Lead ID
   * @returns {Promise<Object|null>} Lead capture or null
   */
  async findById(id) {
    const query = `
      SELECT lc.*, ma.id as application_id, ma.status as application_status
      FROM lead_captures lc
      LEFT JOIN mortgage_applications ma ON lc.application_id = ma.id
      WHERE lc.id = $1
    `;

    try {
      const result = await db.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      throw createDatabaseError(error);
    }
  }

  /**
   * Find lead by email
   * @param {string} email - Email address
   * @returns {Promise<Object|null>} Lead capture or null
   */
  async findByEmail(email) {
    const query = `
      SELECT lc.*, ma.id as application_id, ma.status as application_status
      FROM lead_captures lc
      LEFT JOIN mortgage_applications ma ON lc.application_id = ma.id
      WHERE lc.email = $1
      ORDER BY lc.created_at DESC
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
   * Get all leads with pagination and filtering
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Leads with pagination info
   */
  async findAll(options = {}) {
    const {
      page = 1,
      limit = 20,
      source,
      converted,
      startDate,
      endDate,
      search
    } = options;

    const offset = (page - 1) * limit;
    let whereConditions = [];
    let queryParams = [];
    let paramIndex = 1;

    // Build WHERE conditions
    if (source) {
      whereConditions.push(`lc.source = $${paramIndex}`);
      queryParams.push(source);
      paramIndex++;
    }

    if (converted !== undefined) {
      whereConditions.push(`lc.converted_to_application = $${paramIndex}`);
      queryParams.push(converted);
      paramIndex++;
    }

    if (startDate) {
      whereConditions.push(`lc.created_at >= $${paramIndex}`);
      queryParams.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      whereConditions.push(`lc.created_at <= $${paramIndex}`);
      queryParams.push(endDate);
      paramIndex++;
    }

    if (search) {
      whereConditions.push(`(
        lc.first_name ILIKE $${paramIndex} OR 
        lc.email ILIKE $${paramIndex}
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
      FROM lead_captures lc
      ${whereClause}
    `;

    // Data query
    const dataQuery = `
      SELECT 
        lc.*,
        ma.id as application_id,
        ma.status as application_status,
        ma.created_at as application_created_at
      FROM lead_captures lc
      LEFT JOIN mortgage_applications ma ON lc.application_id = ma.id
      ${whereClause}
      ORDER BY lc.created_at DESC
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
   * Update lead conversion status
   * @param {string} id - Lead ID
   * @param {string} applicationId - Application ID
   * @returns {Promise<Object>} Updated lead
   */
  async markAsConverted(id, applicationId) {
    const query = `
      UPDATE lead_captures 
      SET 
        converted_to_application = true,
        application_id = $2,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;

    try {
      const result = await db.query(query, [id, applicationId]);
      return result.rows[0];
    } catch (error) {
      throw createDatabaseError(error);
    }
  }

  /**
   * Get lead statistics
   * @param {Object} options - Filter options
   * @returns {Promise<Object>} Lead statistics
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
        COUNT(*) as total_leads,
        COUNT(CASE WHEN converted_to_application = true THEN 1 END) as converted_leads,
        COUNT(CASE WHEN source = 'website' THEN 1 END) as website_leads,
        COUNT(CASE WHEN source = 'landing_page' THEN 1 END) as landing_page_leads,
        COUNT(CASE WHEN source = 'social_media' THEN 1 END) as social_media_leads,
        COUNT(CASE WHEN source = 'referral' THEN 1 END) as referral_leads,
        COUNT(CASE WHEN source = 'advertisement' THEN 1 END) as advertisement_leads,
        COUNT(CASE WHEN source = 'organic_search' THEN 1 END) as organic_search_leads,
        COUNT(CASE WHEN source = 'paid_search' THEN 1 END) as paid_search_leads,
        COUNT(CASE WHEN source = 'email_campaign' THEN 1 END) as email_campaign_leads,
        COUNT(CASE WHEN source = 'other' THEN 1 END) as other_leads,
        ROUND(
          COUNT(CASE WHEN converted_to_application = true THEN 1 END) * 100.0 / 
          NULLIF(COUNT(*), 0), 2
        ) as conversion_rate
      FROM lead_captures
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
   * Get leads by source with counts
   * @param {Object} options - Filter options
   * @returns {Promise<Array>} Leads grouped by source
   */
  async getLeadsBySource(options = {}) {
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
        source,
        COUNT(*) as total_leads,
        COUNT(CASE WHEN converted_to_application = true THEN 1 END) as converted_leads,
        ROUND(
          COUNT(CASE WHEN converted_to_application = true THEN 1 END) * 100.0 / 
          NULLIF(COUNT(*), 0), 2
        ) as conversion_rate
      FROM lead_captures
      ${whereClause}
      GROUP BY source
      ORDER BY total_leads DESC
    `;

    try {
      const result = await db.query(query, queryParams);
      return result.rows;
    } catch (error) {
      throw createDatabaseError(error);
    }
  }

  /**
   * Delete a lead capture
   * @param {string} id - Lead ID
   * @returns {Promise<boolean>} Success status
   */
  async delete(id) {
    const query = 'DELETE FROM lead_captures WHERE id = $1';

    try {
      const result = await db.query(query, [id]);
      return result.rowCount > 0;
    } catch (error) {
      throw createDatabaseError(error);
    }
  }
}

module.exports = new LeadRepository();