process.env.DB_PATH = ':memory:';

const { initializeDb, closeDb, resetDb } = require('../database/connection');

function setupTestDb() {
  beforeEach(async () => {
    resetDb();
    await initializeDb();
  });
  afterAll(() => { closeDb(); });
}

module.exports = { setupTestDb };
