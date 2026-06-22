const { getDb } = require('../database/connection');

const PRICE_JOIN = `
  LEFT JOIN component_price_history cph ON cph.id = (
    SELECT id FROM component_price_history
    WHERE component_id = c.id
    ORDER BY effective_date DESC LIMIT 1
  )`;

async function findByBicycleId(bicycleId) {
  const db = getDb();
  const result = await db.execute({
    sql: `SELECT bc.id, bc.bicycle_id, bc.quantity, bc.created_at, bc.updated_at,
                 c.id AS component_id, c.name AS component_name,
                 c.category, c.is_active,
                 cph.price AS unit_price, cph.effective_date AS price_since
          FROM bicycle_components bc
          JOIN components c ON c.id = bc.component_id
          ${PRICE_JOIN}
          WHERE bc.bicycle_id = ?
          ORDER BY c.category, c.name`,
    args: [bicycleId]
  });
  return result.rows;
}

async function findOne(bicycleId, componentId) {
  const db = getDb();
  const result = await db.execute({
    sql: 'SELECT id, bicycle_id, component_id, quantity FROM bicycle_components WHERE bicycle_id=? AND component_id=?',
    args: [bicycleId, componentId]
  });
  return result.rows[0] || null;
}

async function upsert(bicycleId, componentId, quantity) {
  const db = getDb();
  const existing = await findOne(bicycleId, componentId);
  if (existing) {
    await db.execute({
      sql: `UPDATE bicycle_components SET quantity=?, updated_at=datetime('now') WHERE bicycle_id=? AND component_id=?`,
      args: [quantity, bicycleId, componentId]
    });
  } else {
    await db.execute({
      sql: 'INSERT INTO bicycle_components (bicycle_id, component_id, quantity) VALUES (?, ?, ?)',
      args: [bicycleId, componentId, quantity]
    });
  }
  return findOne(bicycleId, componentId);
}

async function updateQuantity(bicycleId, componentId, quantity) {
  const db = getDb();
  const result = await db.execute({
    sql: `UPDATE bicycle_components SET quantity=?, updated_at=datetime('now') WHERE bicycle_id=? AND component_id=?`,
    args: [quantity, bicycleId, componentId]
  });
  return result.rowsAffected > 0;
}

async function remove(bicycleId, componentId) {
  const db = getDb();
  const result = await db.execute({
    sql: 'DELETE FROM bicycle_components WHERE bicycle_id=? AND component_id=?',
    args: [bicycleId, componentId]
  });
  return result.rowsAffected > 0;
}

module.exports = { findByBicycleId, findOne, upsert, updateQuantity, remove };
