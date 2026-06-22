# Assumptions

> Practical decisions made to move forward without blocking. Each assumption has a rationale and a future path.

---

| # | Assumption | Rationale | Future Path |
|---|---|---|---|
| A-01 | Single currency: Indian Rupee (₹) | Scope clarity; Hero Cycles is India-based | Add currency column + conversion layer |
| A-02 | No taxes, discounts, or markups in MVP | Simplifies pricing engine; tax rules vary by state | Add `tax_rate` and `discount` fields to configurations |
| A-03 | No authentication or authorization | MVP for internal team; single trusted user | Add JWT + role-based access (Admin, Salesperson, Viewer) |
| A-04 | Component categories are a fixed set | Avoids category management UI complexity | Add a `categories` table with CRUD |
| A-05 | Pricing always uses the latest (most recent) price | Aligns with business expectation of "current price" | Add `as_of_date` param for point-in-time queries |
| A-06 | Price history is append-only; prices are never edited or deleted | Preserves full audit trail; immutable history | Add `voided_at` for soft-voiding erroneous entries |
| A-07 | Deleting a component is a soft-delete (is_active = false) | Components in bicycle configs must stay resolvable | Hard-delete with cascade when admin explicitly clears |
| A-08 | SQLite is acceptable for MVP | Zero-config, ACID-compliant, sufficient for < 500 components | Migrate to PostgreSQL for multi-user production |
| A-09 | No pagination; all lists fetched in full | Simplifies API and UI for small catalogs | Add `?page=&limit=` query params when count > 100 |
| A-10 | Bicycle configurations reflect current prices at query time | No price snapshots needed in MVP | Add `locked_price_at` snapshot for sent quotes |
| A-11 | Minimum component quantity is 1; no fractional quantities | Physical parts are whole units | Add decimal support for consumables (e.g., chain links) |
| A-12 | CORS enabled for localhost:3000 in development | Frontend dev server runs separately | Configure per-environment CORS origins |
| A-13 | Seed data is included for demo purposes | Evaluators need data to review the system | Make seed idempotent; skip if data already exists |
| A-14 | Component SKU is optional | Not all parts have manufacturer codes in legacy data | Make SKU required + indexed in production |
| A-15 | Price stored as REAL (float) in SQLite | Adequate for INR amounts in MVP | Use INTEGER (paise) or NUMERIC(12,2) in PostgreSQL |
