const { Pool } = require('pg');
const {
  DATABASE_URL,
  DB_HOST,
  DB_PORT,
  DB_NAME,
  DB_USER,
  DB_PASSWORD,
  DB_MAX_CONNECTIONS,
  DB_IDLE_TIMEOUT,
  DB_CONNECTION_TIMEOUT,
  isDevelopment
} = require('./env');

// Create connection pool
const pool = new Pool({
  connectionString: DATABASE_URL,
  host: DB_HOST,
  port: DB_PORT,
  database: DB_NAME,
  user: DB_USER,
  password: DB_PASSWORD,
  max: DB_MAX_CONNECTIONS,
  idleTimeoutMillis: DB_IDLE_TIMEOUT,
  connectionTimeoutMillis: DB_CONNECTION_TIMEOUT,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Pool event handlers
pool.on('connect', (client) => {
  if (isDevelopment) {
    console.log('🔗 New database connection established');
  }
});

pool.on('error', (err, client) => {
  console.error('💥 Unexpected error on idle client:', err);
});

pool.on('remove', (client) => {
  if (isDevelopment) {
    console.log('🔌 Database connection removed from pool');
  }
});

/**
 * Execute a SQL query with optional parameters
 * @param {string} text - SQL query string
 * @param {Array} params - Query parameters
 * @returns {Promise<Object>} Query result
 */
const query = async (text, params = []) => {
  const start = Date.now();
  
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    
    if (isDevelopment) {
      console.log('📊 Query executed:', {
        query: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
        duration: `${duration}ms`,
        rows: result.rowCount
      });
    }
    
    return result;
  } catch (error) {
    const duration = Date.now() - start;
    console.error('❌ Query error:', {
      query: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
      duration: `${duration}ms`,
      error: error.message
    });
    throw error;
  }
};

/**
 * Get a client from the pool for transactions
 * @returns {Promise<Object>} Database client
 */
const getClient = async () => {
  try {
    const client = await pool.connect();
    
    // Add query method to client for consistency
    const originalQuery = client.query;
    client.query = async (text, params = []) => {
      const start = Date.now();
      try {
        const result = await originalQuery.call(client, text, params);
        const duration = Date.now() - start;
        
        if (isDevelopment) {
          console.log('📊 Transaction query executed:', {
            query: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
            duration: `${duration}ms`,
            rows: result.rowCount
          });
        }
        
        return result;
      } catch (error) {
        const duration = Date.now() - start;
        console.error('❌ Transaction query error:', {
          query: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
          duration: `${duration}ms`,
          error: error.message
        });
        throw error;
      }
    };
    
    return client;
  } catch (error) {
    console.error('❌ Error getting database client:', error);
    throw error;
  }
};

/**
 * Execute multiple queries in a transaction
 * @param {Function} callback - Function that receives client and executes queries
 * @returns {Promise<any>} Transaction result
 */
const transaction = async (callback) => {
  const client = await getClient();
  
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Test database connection
 * @returns {Promise<boolean>} Connection status
 */
const testConnection = async () => {
  try {
    const result = await query('SELECT NOW() as current_time, version() as version');
    console.log('✅ Database connection successful:', {
      time: result.rows[0].current_time,
      version: result.rows[0].version.split(' ')[0]
    });
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
};

/**
 * Close all database connections
 * @returns {Promise<void>}
 */
const end = async () => {
  try {
    await pool.end();
    console.log('🔒 Database pool closed');
  } catch (error) {
    console.error('❌ Error closing database pool:', error);
    throw error;
  }
};

// Test connection on startup
if (isDevelopment) {
  testConnection();
}

module.exports = {
  query,
  getClient,
  transaction,
  testConnection,
  end,
  pool
};