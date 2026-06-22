-- Hero Cycles — Sample Seed Data
-- Run automatically on first startup when database is empty

INSERT INTO components (name, category, description) VALUES
  ('Steel Road Frame 26"',    'Frame',     'Standard alloy road frame, suitable for city riding'),
  ('Carbon MTB Frame 29"',    'Frame',     'Lightweight carbon mountain bike frame'),
  ('MRF Zapper 26x1.75',      'Tyre',      'All-terrain road tyre, puncture resistant'),
  ('Kenda 29x2.1 Knobby',     'Tyre',      'Aggressive mountain bike tyre'),
  ('Shimano Tourney 21-Speed','Gear Set',  '3x7 derailleur system, entry level'),
  ('Shimano Altus 24-Speed',  'Gear Set',  '3x8 mountain gear set, trail ready'),
  ('Tektro Alloy V-Brake',    'Brake',     'Reliable front + rear V-brake set'),
  ('Shimano MT200 Hydraulic', 'Brake',     'Hydraulic disc brake set, superior stopping power'),
  ('Hero Comfort Saddle',     'Seat',      'Ergonomic padded seat for long rides'),
  ('WTB Volt Sport Saddle',   'Seat',      'Performance trail saddle, narrow profile'),
  ('KMC Z51 Chain',           'Chain',     'Durable 1/2x1/8" single-speed chain'),
  ('Flat Bar Handlebar 680mm','Handlebar', 'Flat aluminium handlebar, 680mm width');

-- Price history: multiple entries for some components to demonstrate history tracking
INSERT INTO component_price_history (component_id, price, notes, effective_date) VALUES
  (1,  2200.00, 'Initial price',              '2025-01-01 00:00:00'),
  (1,  2350.00, 'Steel cost increase Q2',     '2025-06-01 00:00:00'),
  (2,  8500.00, 'Initial price',              '2025-01-01 00:00:00'),
  (2,  8200.00, 'Carbon sheet bulk discount', '2025-04-01 00:00:00'),
  (3,   200.00, 'Initial price',              '2025-01-01 00:00:00'),
  (3,   220.00, 'Annual price revision',      '2025-06-01 00:00:00'),
  (3,   230.00, 'Freight surcharge applied',  '2025-12-01 00:00:00'),
  (4,   380.00, 'Initial price',              '2025-01-01 00:00:00'),
  (5,  1150.00, 'Initial price',              '2025-01-01 00:00:00'),
  (6,  1800.00, 'Initial price',              '2025-01-01 00:00:00'),
  (7,   320.00, 'Initial price',              '2025-01-01 00:00:00'),
  (8,  2800.00, 'Initial price',              '2025-01-01 00:00:00'),
  (9,   250.00, 'Initial price',              '2025-01-01 00:00:00'),
  (10,  420.00, 'Initial price',              '2025-01-01 00:00:00'),
  (11,  180.00, 'Initial price',              '2025-01-01 00:00:00'),
  (12,  350.00, 'Initial price',              '2025-01-01 00:00:00');

INSERT INTO bicycles (name, description) VALUES
  ('Hero Sprint 26',  'Entry-level road bike for city commuting'),
  ('Hero Trail Pro',  'Mid-range mountain bike for trail riding');

INSERT INTO bicycle_components (bicycle_id, component_id, quantity) VALUES
  (1, 1, 1), (1, 3, 2), (1, 5, 1), (1, 7, 1), (1, 9, 1), (1, 11, 1), (1, 12, 1),
  (2, 2, 1), (2, 4, 2), (2, 6, 1), (2, 8, 1), (2, 10, 1),(2, 11, 1), (2, 12, 1);
