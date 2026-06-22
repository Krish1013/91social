# Testing Strategy

## Philosophy

Tests give you confidence to change code without fear. For this MVP we focus on three levels:

1. **Unit tests** — the pricing engine in isolation.
2. **Integration tests** — full HTTP stack: request → controller → service → DB → response.
3. **Edge case tests** — scenarios that break real systems.

We use a real in-memory SQLite database (`:memory:`) in all tests — no mocked repositories. This catches bugs that pure mocking misses.

---

## Test Infrastructure

```javascript
// testHelper.js — fresh DB per test
process.env.DB_PATH = ':memory:';

function setupTestDb() {
  beforeEach(async () => {
    resetDb();           // destroy singleton
    await initializeDb(); // re-run schema on fresh connection
  });
  afterAll(() => closeDb());
}
```

Each `beforeEach` destroys and recreates the database. Tests never share state.

---

## Test Files

### `pricing.test.js` — Pricing Engine Unit Tests

| Test | What it verifies |
|---|---|
| Throws 404 for bad bicycle ID | Error handling |
| Empty bicycle → total = 0 | Edge case: no components |
| Single component × 1 | Basic correctness |
| Component × quantity | Quantity multiplication |
| Latest price used when multiple exist | Core pricing rule |
| Missing price flagged, excluded from total | Graceful degradation |
| Category subtotals correct | Aggregation logic |
| Price of ₹0 handled | Zero-price edge case |
| Float rounded to 2dp | Precision correctness |

### `components.test.js` — Component API Integration Tests

| Test | Endpoint |
|---|---|
| Create with valid data → 201 | POST /components |
| Create without price → 201 | POST /components |
| Missing name → 400 | POST /components |
| Invalid category → 400 | POST /components |
| Negative price → 400 | POST /components |
| List components | GET /components |
| Deactivated excluded by default | GET /components |
| Get single with history | GET /components/:id |
| 404 for missing | GET /components/:id |
| Price history is append-only | POST /components/:id/prices |
| Negative price rejected | POST /components/:id/prices |
| Soft-delete (is_active=0) | DELETE /components/:id |
| 404 for missing | DELETE /components/:id |

### `bicycles.test.js` — Bicycle API Integration Tests

| Test | What it verifies |
|---|---|
| Create bicycle | Happy path |
| Missing name → 400 | Validation |
| List bicycles | Returns all |
| Add component | Relationship creation |
| Upsert on duplicate | No duplicate rows |
| Quantity 0 → 400 | Quantity validation |
| Nonexistent component → 404 | FK integrity |
| Full pricing breakdown | Grand total math |
| Pricing 404 | Not found handling |
| Delete cascades components | Cascade delete |

---

## Running Tests

```bash
cd backend
npm test                 # All 32 tests
npm run test:coverage    # With coverage report
```

Expected: `Tests: 32 passed, 32 total`
