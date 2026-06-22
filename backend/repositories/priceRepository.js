const { getDb } = require('../database/connection');

async function getHistory(componentId) {
  const db = getDb();
  const result = await db.execute({
    sql: `SELECT id, component_id, price, notes, effective_date, created_at
          FROM component_price_history
          WHERE component_id = ?
          ORDER BY effective_date DESC`,
    args: [componentId]
  });
  return result.rows;
}

async function getLatestPrice(componentId) {
  const db = getDb();
  const result = await db.execute({
    sql: `SELECT price, effective_date FROM component_price_history
          WHERE component_id = ? ORDER BY effective_date DESC LIMIT 1`,
    args: [componentId]
  });
  return result.rows[0] || null;
}

async function addPrice(componentId, { price, notes, effective_date }) {
  const db = getDb();
  const date = effective_date || new Date().toISOString().replace('T',' ').slice(0,19);
  const result = await db.execute({
    sql: `INSERT INTO component_price_history (component_id, price, notes, effective_date)
          VALUES (?, ?, ?, ?)`,
    args: [componentId, price, notes || null, date]
  });
  const res = await db.execute({
    sql: 'SELECT * FROM component_price_history WHERE id = ?',
    args: [Number(result.lastInsertRowid)]
  });
  return res.rows[0];
}

async function getRecentUpdates(limit = 5) {
  const db = getDb();
  const result = await db.execute({
    sql: `SELECT cph.id, cph.price, cph.notes, cph.effective_date, cph.created_at,
                 c.id AS component_id, c.name AS component_name, c.category
          FROM component_price_history cph
          JOIN components c ON c.id = cph.component_id
          ORDER BY cph.created_at DESC LIMIT ?`,
    args: [limit]
  });
  return result.rows;
}

module.exports = { getHistory, getLatestPrice, addPrice, getRecentUpdates };
