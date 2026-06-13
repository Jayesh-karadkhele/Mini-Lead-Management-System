const fs = require('fs');
const path = require('path');
const { pool } = require('../config/db');

async function migrate() {
  try {
    console.log('Reading schema.sql...');
    const schemaPath = path.join(__dirname, 'schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');

    console.log('Running migrations...');
    await pool.query(sql);
    console.log('Database migrated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  }
}

migrate();
