const { getDb } = require('../database/connection');

async function findAll() {
  const db = getDb();
  const result = await db.execute(`
    SELECT b.id, b.name, b.description, b.created_at, b.updated_at,
           COUNT(bc.id) AS component_count
    FROM bicycles b
    LEFT JOIN bicycle_components bc ON bc.bicycle_id = b.id
    GROUP BY b.id
    ORDER BY b.created_at DESC
  `);
  return result.rows;
}

async function findById(id) {
  const db = getDb();
  const result = await db.execute({
    sql: 'SELECT id, name, description, created_at, updated_at FROM bicycles WHERE id = ?',
    args: [id]
  });
  return result.rows[0] || null;
}

async function create({ name, description }) {
  const db = getDb();
  const result = await db.execute({
    sql: 'INSERT INTO bicycles (name, description) VALUES (?, ?)',
    args: [name, description || null]
  });
  return findById(Number(result.lastInsertRowid));
}

async function update(id, { name, description }) {
  const db = getDb();
  await db.execute({
    sql: `UPDATE bicycles SET name=?, description=?, updated_at=datetime('now') WHERE id=?`,
    args: [name, description || null, id]
  });
  return findById(id);
}

async function remove(id) {
  const db = getDb();
  // Manually cascade since libsql may not enforce FK cascades
  await db.execute({ sql: 'DELETE FROM bicycle_components WHERE bicycle_id = ?', args: [id] });
  const result = await db.execute({ sql: 'DELETE FROM bicycles WHERE id = ?', args: [id] });
  return result.rowsAffected > 0;
}

async function count() {
  const db = getDb();
  const result = await db.execute('SELECT COUNT(*) as count FROM bicycles');
  return result.rows[0].count;
}

module.exports = { findAll, findById, create, update, remove, count };
