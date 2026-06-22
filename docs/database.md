# Database Design

## 1. Design Principles

1. **Append-only price history** — prices are never updated or deleted. Every change creates a new row. This gives a full audit trail at zero cost.
2. **Soft-delete components** — `is_active = 0` instead of hard DELETE. Bicycle configs remain valid after a component is discontinued.
3. **Current price = latest row** — `MAX(effective_date)` or `ORDER BY effective_date DESC LIMIT 1` per component.
4. **Foreign key constraints** — enabled via `PRAGMA foreign_keys = ON` for referential integrity.
5. **Timestamps on every table** — `created_at` and `updated_at` on all mutable tables.

---

## 2. Schema

### Table: `components`

```sql
CREATE TABLE IF NOT EXISTS components (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT    NOT NULL,
  category    TEXT    NOT NULL CHECK(category IN (
                'Frame','Tyre','Gear Set','Brake','Seat',
                'Chain','Handlebar','Pedal','Rim','Light','Other'
              )),
  description TEXT,
  is_active   INTEGER NOT NULL DEFAULT 1 CHECK(is_active IN (0,1)),
  created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);
```

| Column | Type | Notes |
|---|---|---|
| id | INTEGER PK | Auto-incremented surrogate key |
| name | TEXT NOT NULL | Component display name (max 100 chars validated in app) |
| category | TEXT NOT NULL | Constrained to known categories via CHECK |
| description | TEXT | Optional notes |
| is_active | INTEGER | 1 = active, 0 = soft-deleted |
| created_at / updated_at | TEXT | ISO 8601 strings (SQLite has no native TIMESTAMP) |

---

### Table: `component_price_history`

```sql
CREATE TABLE IF NOT EXISTS component_price_history (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  component_id   INTEGER NOT NULL REFERENCES components(id),
  price          REAL    NOT NULL CHECK(price >= 0),
  notes          TEXT,
  effective_date TEXT    NOT NULL DEFAULT (datetime('now')),
  created_at     TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_price_history_component
  ON component_price_history(component_id, effective_date DESC);
```

| Column | Notes |
|---|---|
| component_id | FK to components; row never deleted |
| price | REAL >= 0; zero allowed for promotional items |
| notes | Reason for change ("Supplier rate revision Q1 2025") |
| effective_date | When this price became active; defaults to now |

**Key query pattern — current price:**
```sql
SELECT price, effective_date
FROM component_price_history
WHERE component_id = ?
ORDER BY effective_date DESC
LIMIT 1;
```

---

### Table: `bicycles`

```sql
CREATE TABLE IF NOT EXISTS bicycles (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT    NOT NULL,
  description TEXT,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);
```

---

### Table: `bicycle_components`

```sql
CREATE TABLE IF NOT EXISTS bicycle_components (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  bicycle_id   INTEGER NOT NULL REFERENCES bicycles(id) ON DELETE CASCADE,
  component_id INTEGER NOT NULL REFERENCES components(id),
  quantity     INTEGER NOT NULL DEFAULT 1 CHECK(quantity > 0),
  created_at   TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at   TEXT    NOT NULL DEFAULT (datetime('now')),
  UNIQUE(bicycle_id, component_id)
);

CREATE INDEX IF NOT EXISTS idx_bicycle_components_bicycle
  ON bicycle_components(bicycle_id);
```

| Design note | Reason |
|---|---|
| `UNIQUE(bicycle_id, component_id)` | Prevents duplicate rows; use quantity for count |
| `ON DELETE CASCADE` | Deleting a bicycle removes its component rows |
| FK to `components` has no CASCADE | Component deletion is soft; config rows stay |

---

## 3. Relationships Summary

```
components (1) ──────< component_price_history (many)
     │
     └──────< bicycle_components (many) >────── bicycles (1)
```

- One component has many price history entries (append-only).
- One bicycle has many bicycle_component rows.
- One component can appear in many bicycle configs.
- `bicycle_components` is the join table with an extra `quantity` column.

---

## 4. Key Queries

### Get all components with current price
```sql
SELECT
  c.id, c.name, c.category, c.description, c.is_active,
  cph.price AS current_price,
  cph.effective_date AS price_since
FROM components c
LEFT JOIN component_price_history cph ON cph.id = (
  SELECT id FROM component_price_history
  WHERE component_id = c.id
  ORDER BY effective_date DESC
  LIMIT 1
)
WHERE c.is_active = 1
ORDER BY c.category, c.name;
```

### Get full pricing breakdown for a bicycle
```sql
SELECT
  bc.bicycle_id,
  c.id AS component_id,
  c.name AS component_name,
  c.category,
  bc.quantity,
  cph.price AS unit_price,
  cph.price * bc.quantity AS line_total,
  cph.effective_date AS price_since,
  c.is_active
FROM bicycle_components bc
JOIN components c ON c.id = bc.component_id
LEFT JOIN component_price_history cph ON cph.id = (
  SELECT id FROM component_price_history
  WHERE component_id = bc.component_id
  ORDER BY effective_date DESC
  LIMIT 1
)
WHERE bc.bicycle_id = ?
ORDER BY c.category, c.name;
```

### Dashboard: recent price updates
```sql
SELECT
  cph.id, cph.price, cph.notes, cph.effective_date,
  c.name AS component_name, c.category
FROM component_price_history cph
JOIN components c ON c.id = cph.component_id
ORDER BY cph.created_at DESC
LIMIT 5;
```

---

## 5. Sample Seed Data

```sql
-- Components
INSERT INTO components (name, category, description) VALUES
  ('Steel Road Frame 26"',    'Frame',     'Standard alloy road frame'),
  ('Carbon MTB Frame 29"',    'Frame',     'Lightweight carbon mountain bike frame'),
  ('MRF Zapper 26x1.75',      'Tyre',      'All-terrain road tyre'),
  ('Kenda 29x2.1 Knobby',     'Tyre',      'Mountain bike tyre'),
  ('Shimano Tourney 21-Spd',  'Gear Set',  '3x7 derailleur system'),
  ('Shimano Altus 24-Spd',    'Gear Set',  '3x8 mountain gear set'),
  ('Tektro Alloy V-Brake',    'Brake',     'Front + rear V-brake set'),
  ('Shimano MT200 Hydraulic', 'Brake',     'Hydraulic disc brake set'),
  ('Hero Comfort Saddle',     'Seat',      'Ergonomic padded seat'),
  ('WTB Volt Sport Saddle',   'Seat',      'Performance trail saddle'),
  ('KMC Z51 Chain',           'Chain',     'Single-speed 1/2x1/8" chain'),
  ('Flat Bar Handlebar 680mm','Handlebar', 'Flat aluminium handlebar');

-- Price history (multiple entries for some components to demo history)
INSERT INTO component_price_history (component_id, price, notes, effective_date) VALUES
  (1,  2200.00, 'Initial price',           '2025-01-01 00:00:00'),
  (1,  2350.00, 'Steel cost increase Q2',  '2025-06-01 00:00:00'),
  (2,  8500.00, 'Initial price',           '2025-01-01 00:00:00'),
  (2,  8200.00, 'Carbon sheet discount',   '2025-04-01 00:00:00'),
  (3,   200.00, 'Initial price',           '2025-01-01 00:00:00'),
  (3,   220.00, 'Price revision',          '2025-06-01 00:00:00'),
  (3,   230.00, 'Freight surcharge',       '2025-12-01 00:00:00'),
  (4,   380.00, 'Initial price',           '2025-01-01 00:00:00'),
  (5,  1150.00, 'Initial price',           '2025-01-01 00:00:00'),
  (6,  1800.00, 'Initial price',           '2025-01-01 00:00:00'),
  (7,   320.00, 'Initial price',           '2025-01-01 00:00:00'),
  (8,  2800.00, 'Initial price',           '2025-01-01 00:00:00'),
  (9,   250.00, 'Initial price',           '2025-01-01 00:00:00'),
  (10,  420.00, 'Initial price',           '2025-01-01 00:00:00'),
  (11,  180.00, 'Initial price',           '2025-01-01 00:00:00'),
  (12,  350.00, 'Initial price',           '2025-01-01 00:00:00');

-- Bicycles
INSERT INTO bicycles (name, description) VALUES
  ('Hero Sprint 26', 'Entry-level road bike for city commuting'),
  ('Hero Trail Pro', 'Mid-range mountain bike for trail riding');

-- Bicycle components
INSERT INTO bicycle_components (bicycle_id, component_id, quantity) VALUES
  -- Hero Sprint 26
  (1, 1, 1),   -- Steel Frame
  (1, 3, 2),   -- MRF Tyres × 2
  (1, 5, 1),   -- Shimano 21-spd
  (1, 7, 1),   -- Tektro Brake
  (1, 9, 1),   -- Comfort Saddle
  (1, 11, 1),  -- KMC Chain
  (1, 12, 1),  -- Flat Handlebar
  -- Hero Trail Pro
  (2, 2, 1),   -- Carbon Frame
  (2, 4, 2),   -- Kenda MTB Tyres × 2
  (2, 6, 1),   -- Shimano 24-spd
  (2, 8, 1),   -- Hydraulic Brakes
  (2, 10, 1),  -- WTB Saddle
  (2, 11, 1),  -- KMC Chain
  (2, 12, 1);  -- Flat Handlebar
```
