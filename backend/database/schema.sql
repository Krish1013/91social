PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS components (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT    NOT NULL,
  category    TEXT    NOT NULL,
  description TEXT,
  is_active   INTEGER NOT NULL DEFAULT 1,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS component_price_history (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  component_id   INTEGER NOT NULL REFERENCES components(id),
  price          REAL    NOT NULL,
  notes          TEXT,
  effective_date TEXT    NOT NULL DEFAULT (datetime('now')),
  created_at     TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_price_history_component
  ON component_price_history(component_id, effective_date);

CREATE TABLE IF NOT EXISTS bicycles (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT    NOT NULL,
  description TEXT,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS bicycle_components (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  bicycle_id   INTEGER NOT NULL REFERENCES bicycles(id),
  component_id INTEGER NOT NULL REFERENCES components(id),
  quantity     INTEGER NOT NULL DEFAULT 1,
  created_at   TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at   TEXT    NOT NULL DEFAULT (datetime('now')),
  UNIQUE(bicycle_id, component_id)
)
