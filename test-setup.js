/**
 * Setup Test Script
 * Run this to verify your installation
 */

const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

console.log('🔍 Testing RatesLookup Backend Setup...\n');

// Test 1: Check Node.js version
console.log('1️⃣ Node.js Version:');
console.log(`   ✅ ${process.version}`);
if (parseInt(process.version.slice(1)) < 16) {
  console.log('   ⚠️  Warning: Node.js 16+ is recommended');
}
console.log();

// Test 2: Check environment variables
console.log('2️⃣ Environment Variables:');
const requiredEnvVars = [
  'NODE_ENV',
  'PORT',
  'DATABASE_URL',
  'DB_HOST',
  'DB_PORT',
  'DB_NAME',
  'DB_USER',
  'DB_PASSWORD'
];

let envVarsOk = true;
requiredEnvVars.forEach(envVar => {
  if (process.env[envVar]) {
    console.log(`   ✅ ${envVar}: ${envVar.includes('PASSWORD') ? '***' : process.env[envVar]}`);
  } else {
    console.log(`   ❌ ${envVar}: NOT SET`);
    envVarsOk = false;
  }
});
console.log();

if (!envVarsOk) {
  console.log('❌ Setup incomplete: Missing environment variables');
  console.log('📝 Please configure your .env file');
  process.exit(1);
}

// Test 3: Check dependencies
console.log('3️⃣ Dependencies:');
try {
  require('express');
  console.log('   ✅ express');
  require('pg');
  console.log('   ✅ pg (PostgreSQL driver)');
  require('dotenv');
  console.log('   ✅ dotenv');
  require('express-validator');
  console.log('   ✅ express-validator');
  require('bcrypt');
  console.log('   ✅ bcrypt');
  require('uuid');
  console.log('   ✅ uuid');
  console.log();
} catch (error) {
  console.log(`   ❌ Missing dependency: ${error.message}`);
  console.log('   Run: npm install');
  console.log();
  process.exit(1);
}

// Test 4: Test database connection
console.log('4️⃣ Database Connection:');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

pool.query('SELECT NOW() as current_time, version() as version')
  .then(result => {
    console.log('   ✅ Database connection successful');
    console.log(`   📅 Server time: ${result.rows[0].current_time}`);
    console.log(`   🗄️  PostgreSQL: ${result.rows[0].version.split(' ')[0]} ${result.rows[0].version.split(' ')[1]}`);
    console.log();

    // Test 5: Check if tables exist
    console.log('5️⃣ Database Tables:');
    return pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
  })
  .then(result => {
    if (result.rows.length === 0) {
      console.log('   ⚠️  No tables found');
      console.log('   📝 Run database migration: npm run db:migrate');
      console.log('   Or manually: psql -U postgres -d rateslookup -f src/database/index.sql');
    } else {
      console.log(`   ✅ Found ${result.rows.length} tables:`);
      result.rows.forEach(row => {
        console.log(`      - ${row.table_name}`);
      });
    }
    console.log();

    // Test 6: Test server startup
    console.log('6️⃣ Server Configuration:');
    console.log(`   ✅ Environment: ${process.env.NODE_ENV}`);
    console.log(`   ✅ Port: ${process.env.PORT}`);
    console.log(`   ✅ Host: ${process.env.HOST}`);
    console.log(`   ✅ CORS Origin: ${process.env.CORS_ORIGIN}`);
    console.log();

    console.log('✅ Setup verification complete!');
    console.log();
    console.log('🚀 Next steps:');
    if (result.rows.length === 0) {
      console.log('   1. Run database migration: npm run db:migrate');
      console.log('   2. Start server: npm run dev');
    } else {
      console.log('   1. Start server: npm run dev');
      console.log('   2. Test API: http://localhost:' + process.env.PORT + '/health');
    }
    console.log();

    pool.end();
    process.exit(0);
  })
  .catch(error => {
    console.log('   ❌ Database connection failed');
    console.log(`   Error: ${error.message}`);
    console.log();
    console.log('🔧 Troubleshooting:');
    console.log('   1. Is PostgreSQL running?');
    console.log('   2. Does the database "rateslookup" exist?');
    console.log('   3. Are the credentials in .env correct?');
    console.log('   4. Is PostgreSQL accessible on the specified host/port?');
    console.log();
    console.log('📝 To create database:');
    console.log('   createdb -U postgres rateslookup');
    console.log();

    pool.end();
    process.exit(1);
  });