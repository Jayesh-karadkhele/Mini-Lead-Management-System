const { Pool } = require('pg');
require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';
const hasSSL = process.env.DB_SSL === 'true' || (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('supabase'));

const poolConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: hasSSL ? { rejectUnauthorized: false } : false
};

// If DATABASE_URL is not set, fallback to individual connection parameters
if (!poolConfig.connectionString) {
  poolConfig.host = process.env.DB_HOST || 'localhost';
  poolConfig.port = process.env.DB_PORT || 5432;
  poolConfig.user = process.env.DB_USER || 'postgres';
  poolConfig.password = process.env.DB_PASSWORD || 'postgres';
  poolConfig.database = process.env.DB_DATABASE || 'lead_management';
}

const pool = new Pool(poolConfig);

// Test database connection
pool.on('connect', () => {
  console.log('Database connected successfully');
});

pool.on('error', (err) => {
  console.error('Unexpected database client error:', err.message);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
