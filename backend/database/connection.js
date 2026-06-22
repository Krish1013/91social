const { createClient } = require('@libsql/client');
const path = require('path');
const fs = require('fs');

let db = null;
let initialized = false;

/**
 * Returns the singleton database client.
 * All operations are async (returns Promises).
 */
function getDb() {
  if (!db) {
    const dbPath = process.env.DB_PATH || path.join(__dirname, 'hero_cycles.db');
    // ':memory:' stays as is; file paths get file:// prefix
    const url = dbPath === ':memory:' ? ':memory:' : `file:${dbPath}`;
    db = createClient({ url });
  }
  return db;
}

/**
 * Runs schema + seed on first call. Safe to call multiple times.
 */
async function initializeDb() {
  if (initialized) return;
  initialized = true;

  const client = getDb();
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');

  // Execute each statement separately (libsql doesn't support multi-statement exec)
  const statements = schema.split(';').map(s => s.trim()).filter(s => s.length > 0);
  for (const stmt of statements) {
    await client.execute(stmt);
  }

  // Seed if empty
  const result = await client.execute('SELECT COUNT(*) as count FROM components');
  if (result.rows[0].count === 0) {
    const seedPath = path.join(__dirname, 'seed.sql');
    const seed = fs.readFileSync(seedPath, 'utf8');
    const seedStatements = seed.split(';').map(s => s.trim()).filter(s => s.length > 0);
    for (const stmt of seedStatements) {
      await client.execute(stmt);
    }
    console.log('Database seeded with sample data.');
  }
}

function closeDb() {
  if (db) {
    db.close();
    db = null;
    initialized = false;
  }
}

function resetDb() {
  closeDb();
}

module.exports = { getDb, initializeDb, closeDb, resetDb };
