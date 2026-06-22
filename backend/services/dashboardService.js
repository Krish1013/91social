const { getDb } = require('../database/connection');
const priceRepository = require('../repositories/priceRepository');

async function getDashboardStats() {
  const db = getDb();

  const compResult = await db.execute("SELECT COUNT(*) AS count FROM components WHERE is_active = 1");
  const bikeResult = await db.execute("SELECT COUNT(*) AS count FROM bicycles");
  const recent_price_updates = await priceRepository.getRecentUpdates(5);

  return {
    total_components: compResult.rows[0].count,
    total_bicycles: bikeResult.rows[0].count,
    recent_price_updates
  };
}

module.exports = { getDashboardStats };
