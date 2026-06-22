const { getDb } = require('../database/connection');

const CURRENT_PRICE_JOIN = `
  LEFT JOIN component_price_history cph ON cph.id = (
    SELECT id FROM component_price_history
    WHERE component_id = c.id
    ORDER BY effective_date DESC
    LIMIT 1
  )`;

async function findAll(includeInactive = false) {
  const db = getDb();
  const where = includeInactive ? '' : 'WHERE c.is_active = 1';
  const result = await db.execute(`
    SELECT c.id, c.name, c.category, c.description, c.is_active,
           c.created_at, c.updated_at,
           cph.price AS current_price, cph.effective_date AS price_since
    FROM components c
    ${CURRENT_PRICE_JOIN}
    ${where}
    ORDER BY c.category, c.name
  `);
  return result.rows;
}

async function findById(id) {
  const db = getDb();
  const result = await db.execute({
    sql: `SELECT c.id, c.name, c.category, c.description, c.is_active,
                 c.created_at, c.updated_at,
                 cph.price AS current_price, cph.effective_date AS price_since
          FROM components c
          ${CURRENT_PRICE_JOIN}
          WHERE c.id = ?`,
    args: [id]
  });
  return result.rows[0] || null;
}

async function create({ name, category, description }) {
  const db = getDb();
  const result = await db.execute({
    sql: 'INSERT INTO components (name, category, description) VALUES (?, ?, ?)',
    args: [name, category, description || null]
  });
  return findById(Number(result.lastInsertRowid));
}

async function update(id, { name, category, description }) {
  const db = getDb();
  await db.execute({
    sql: `UPDATE components SET name=?, category=?, description=?, updated_at=datetime('now') WHERE id=?`,
    args: [name, category, description || null, id]
  });
  return findById(id);
}

async function softDelete(id) {
  const db = getDb();
  const result = await db.execute({
    sql: `UPDATE components SET is_active=0, updated_at=datetime('now') WHERE id=?`,
    args: [id]
  });
  return result.rowsAffected > 0;
}

function getCategories() {
  return ['Frame','Tyre','Gear Set','Brake','Seat','Chain','Handlebar','Pedal','Rim','Light','Other'];
}

module.exports = { findAll, findById, create, update, softDelete, getCategories };
