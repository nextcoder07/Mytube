// backend/scripts/run-migration.js
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Dynamically check and install 'pg' if not present
try {
  require.resolve('pg');
} catch (e) {
  console.log('Installing pg package dynamically...');
  execSync('npm install pg --no-save', { cwd: path.resolve(__dirname, '..') });
}

const { Client } = require('pg');
const dotenv = require('dotenv');

// Load environment variables from backend/.env
const envPath = path.resolve(__dirname, '../.env');
dotenv.config({ path: envPath });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('DATABASE_URL is not set in environment or .env file');
  process.exit(1);
}

// Strip pgbouncer=true query param if it causes issues, but standard node-pg handles it.
const client = new Client({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

async function run() {
  try {
    await client.connect();
    console.log('Connected to PostgreSQL database.');

    const query = `
      ALTER TABLE public.profiles
        ADD COLUMN IF NOT EXISTS user_youtube_api_keys text,
        ADD COLUMN IF NOT EXISTS user_github_api_keys text;
    `;
    await client.query(query);
    console.log('✅ Migration succeeded: profiles table updated with custom user API key columns.');
  } catch (err) {
    console.error('❌ Migration failed:', err.message || err);
  } finally {
    await client.end();
  }
}

run();
