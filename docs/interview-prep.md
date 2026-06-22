# Interview Preparation

> 20 likely questions with strong model answers. Study these — every question maps to a real design decision in this codebase.

---

## Architecture Questions

**Q1. Walk me through the request lifecycle when a salesperson clicks "Calculate Price."**

The browser sends `GET /api/bicycles/:id/pricing`. Express routes it to `bicycleController.getPricing`, which calls `await pricingService.calculateBicyclePrice(id)`. The service calls `bicycleRepository.findById` to verify the bicycle exists, then `bicycleComponentRepository.findByBicycleId` which runs a JOIN query that resolves the current price for each component in one SQL statement via a correlated subquery on `component_price_history`. The service loops over results, computes `unit_price × quantity` for each row, accumulates `grand_total`, groups category subtotals, and returns a structured object. The controller calls `res.json({ data: pricing })`. Total round trip: ~30–50ms.

---

**Q2. Why four layers — routes, controllers, services, repositories?**

Each layer has exactly one job. Routes do URL mapping only. Controllers parse HTTP and format responses. Services hold business logic. Repositories hold SQL. This means: to swap SQLite for PostgreSQL, I only change repository files. To add a new business rule (e.g. minimum margin check), I only touch the service. To change the API response shape, I only touch the controller. Every layer is independently testable. Without this separation, business logic leaks into route handlers and becomes untestable.

---

**Q3. Why is the pricing engine a separate service file?**

The pricing engine is the most critical business logic in the system. Isolating it means: (1) I can test it without starting an HTTP server, (2) it can be called from multiple controllers if needed, (3) it has no side effects — it only reads data and returns a value. This is the functional core / imperative shell pattern: pure computation at the center, I/O at the edges.

---

## Database Questions

**Q4. Why is price history append-only? Why not just update the component's price field?**

Price changes are facts about the world, not corrections of an error. If I overwrite prices, I lose the audit trail. With append-only history I can answer: "What did this tyre cost in June?" or "Who changed the price and why?" at zero extra cost. The current price is always `MAX(effective_date)` — a single indexed query. This pattern is called event sourcing at the field level.

---

**Q5. What does "soft delete" mean and why did you use it for components?**

Soft delete sets `is_active = 0` instead of running `DELETE`. If I hard-delete a component that's referenced in a bicycle configuration, the bicycle's pricing query would fail with a broken foreign key. With soft delete, the configuration stays intact, the price history stays intact, and I show a warning badge in the UI. The component disappears from the active catalog without breaking anything historical.

---

**Q6. How does the system ensure it always uses the current price?**

The pricing query uses a correlated subquery:
```sql
LEFT JOIN component_price_history cph ON cph.id = (
  SELECT id FROM component_price_history
  WHERE component_id = c.id
  ORDER BY effective_date DESC
  LIMIT 1
)
```
This selects the single most recent price history row per component. It's index-backed (`idx_price_history_component`). There is no application-level caching, so the price is always freshly resolved. Stale data is impossible.

---

**Q7. Why SQLite instead of PostgreSQL or MySQL?**

Three reasons: (1) Zero setup — it's a file, no server process. (2) ACID-compliant — transactions work correctly. (3) Sufficient for MVP scale (< 500 components, single concurrent user). The schema uses standard SQL — migrating to PostgreSQL means changing the connection module and a few type names (`REAL` → `NUMERIC(12,2)`). I explicitly documented this upgrade path in assumptions.md.

---

## Backend Questions

**Q8. How does your error handling work? What happens when an unhandled exception occurs?**

Every route handler is an `async` function that wraps everything in `try/catch` and passes errors to `next(err)`. The central `errorHandler` middleware is the last middleware registered in `app.js`. It checks for known application errors (with a `.status` property set by `createError()`), SQLite constraint errors, and falls back to a 500 with a generic message for anything unexpected. Controllers never write error responses directly — they always delegate to the central handler.

---

**Q9. How do you prevent SQL injection?**

All queries use parameterized statements:
```javascript
db.execute({ sql: 'SELECT * FROM components WHERE id = ?', args: [id] })
```
The `args` array is never string-interpolated. Values are passed separately from the SQL structure, so no user input can modify the query syntax.

---

**Q10. What validation do you do and where?**

Two layers: (1) Application-level validation in `utils/validation.js` — checks types, lengths, enums, value ranges. Services call these before any DB operation. (2) Database-level constraints (NOT NULL, CHECK for is_active). The DB is a last line of defense, not the primary validator. I return structured error messages with field-level detail so the frontend can display them inline.

---

## React / Frontend Questions

**Q11. Why is all API logic in one `api.js` file?**

Single source of truth for all backend calls. If the base URL changes, I change one line. If an endpoint changes, there's one place to update. If I want to add request logging or a retry wrapper, I do it once in the Axios interceptor. Spreading `fetch` calls across 6 page files would mean 6 places to update for any API change.

---

**Q12. How does the live total update in the bicycle builder work?**

It's a `useEffect` that depends on `bicycle.components`. Every time a component is added, removed, or its quantity changes via the API, I call `load()` which re-fetches the bicycle. The `useEffect` then recalculates: `SUM(unit_price × quantity)`. For quantity changes I also do optimistic UI updates — update the local React state immediately before the API call confirms, so the UI feels instant.

---

**Q13. Why React Router and not just conditional rendering?**

URL-based routing gives users shareable links (e.g. `/bicycles/3/pricing` is a permanent URL for a specific breakdown), working browser back/forward buttons, and clear separation between page states. Conditional rendering would have broken browser history and made it impossible to link directly to a specific page.

---

## Tradeoff Questions

**Q14. What tradeoffs did you make in this MVP?**

1. **No authentication** — fastest path to working app; JWT + RBAC is the next milestone.
2. **No pagination** — lists are fully fetched; acceptable at < 500 components, but needs adding before scale.
3. **No price snapshots** — pricing is always live (current prices). A "locked quote" feature would require snapshotting prices at quote time.
4. **Floating point for prices** — REAL in SQLite is adequate for INR in MVP; production should use INTEGER (paise) or NUMERIC(12,2) in PostgreSQL.
5. **`@libsql/client` instead of `better-sqlite3`** — chosen because it's a pure-JS package with no native compilation requirement, making it reliably installable in any environment.

---

**Q15. How would you scale this to 1000 concurrent users?**

1. Migrate SQLite → PostgreSQL with `pg` + connection pool (pgBouncer).
2. Add Redis caching for pricing results with short TTL (60s), invalidated on price updates.
3. Add JWT authentication; route read vs write traffic separately.
4. Deploy Node with PM2 cluster mode (one process per CPU core).
5. Put Nginx in front for load balancing and static asset serving.
6. Add a `bull` job queue for any async operations (e.g. bulk price imports).

---

**Q16. How would you add GST or discount support?**

Add a `markup_percentage` field to the `bicycles` table and a `tax_rate` to a `system_settings` table. The pricing service applies:
```
pre_tax_total  = grand_total × (1 + markup_rate)
tax_amount     = pre_tax_total × tax_rate
final_total    = pre_tax_total + tax_amount
```
The breakdown response would include `pre_tax`, `tax_amount`, and `final_total` fields. No schema changes to the core tables.

---

**Q17. A component's price is updated while a salesperson has the pricing screen open. What happens?**

Nothing automatic in MVP — they see the price at the time the page loaded. When they refresh or recalculate, they get the new price. This is correct behavior: the system always shows current prices on request, not stale cached values. For a production quote-management system, you'd add a "price changed since last viewed" warning by storing a `last_calculated_at` timestamp and comparing it to the latest price `created_at`.

---

## Code Quality Questions

**Q18. Why do you have a `utils/validation.js` file instead of validating in services?**

Separation of concerns. Validation logic (what makes data valid?) is independent of business logic (what do we do with valid data?). The validation functions are pure: they take data, return error arrays. This makes them trivially unit-testable and reusable across services. If I add a second endpoint that accepts component data, I import the same validator.

---

**Q19. What would you do differently with more time?**

1. Add JWT authentication with role-based access (Admin vs Salesperson).
2. Add React Testing Library tests for frontend components.
3. Add pagination to the components list.
4. Add a CSV import feature for bulk component loading from Excel.
5. Add a `locked_at` quote snapshot so sent quotes don't change when prices update.
6. Add category-level cost analysis dashboard.
7. Use `NUMERIC(12,2)` pricing by migrating to PostgreSQL.

---

**Q20. What makes this a production-quality MVP rather than just a prototype?**

1. **Layered architecture** — each layer has one job; concerns are separated.
2. **Append-only price history** — data is never lost; full audit trail.
3. **Soft delete** — referential integrity preserved; nothing breaks when parts are discontinued.
4. **Parameterized queries** — SQL injection is impossible.
5. **Central error handler** — all errors formatted consistently; no raw Node errors leak to clients.
6. **32 tests pass** — pricing engine and all major API endpoints verified.
7. **Documented decisions** — assumptions, questions, design choices all written down; easy to hand off.
8. **Graceful edge cases** — missing prices, empty configs, inactive components all handled with clear UI feedback.
