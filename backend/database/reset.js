/**
 * Resets the database by deleting the file and re-initializing.
 * Run: node database/reset.js
 */
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'hero_cycles.db');

if (fs.existsSync(DB_PATH)) {
  fs.unlinkSync(DB_PATH);
  console.log('Database file deleted.');
}

// Re-initialize
const { getDb, closeDb } = require('./connection');
getDb();
closeDb();
console.log('Database reset complete. Run npm start to use fresh database.');
