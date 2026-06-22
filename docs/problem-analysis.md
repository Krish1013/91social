# Product Discovery & Problem Analysis

## 1. Stakeholders

| Stakeholder | Role | Interest |
|---|---|---|
| Hero Cycles Management | Decision maker | Revenue accuracy, margin visibility, competitive pricing |
| Sales Team (Salespersons) | Primary users | Fast, accurate quoting — replacing error-prone Excel |
| Procurement / Inventory | Price setters | Ability to update component costs when suppliers change |
| Finance | Auditors | Price history, cost tracking, margin reporting |
| IT / Engineering | Maintainers | Clean, simple codebase; easy to extend |
| End Customer | Indirect beneficiary | Transparent, trustworthy pricing |

---

## 2. Business Goals

1. **Eliminate pricing errors** — replace Excel with a single source of truth.
2. **Accelerate quoting** — salesperson generates a quote in under 60 seconds.
3. **Enforce pricing governance** — all price changes are logged; no silent overwrites.
4. **Enable product diversity** — support thousands of bicycle configurations.
5. **Lay the foundation for analytics** — price history enables future margin reports.

---

## 3. Functional Requirements

### Components
- FR-01: Create a component with name, category, description.
- FR-02: Edit a component's metadata (name, category).
- FR-03: Soft-delete a component (mark inactive; preserve history).
- FR-04: List all components with their current price.
- FR-05: Search components by name; filter by category.

### Component Price History
- FR-06: Add a new price for a component (appends to history; never overwrites).
- FR-07: View the full price timeline for any component.
- FR-08: Current price = most recent entry in history.

### Bicycles
- FR-09: Create a named bicycle configuration.
- FR-10: Edit bicycle name and description.
- FR-11: Delete a bicycle configuration.
- FR-12: List all bicycles with computed total price.

### Bicycle Configuration (Builder)
- FR-13: Add a component to a bicycle with a quantity.
- FR-14: Remove a component from a bicycle.
- FR-15: Update the quantity of a component in a bicycle.
- FR-16: Prevent adding the same component twice (merge via quantity update).

### Pricing Engine
- FR-17: Calculate total bicycle price using current prices for each component.
- FR-18: Return a line-by-line breakdown: component, quantity, unit price, subtotal.
- FR-19: Return category-level subtotals.
- FR-20: Flag configurations where any component is missing a price.

### Dashboard
- FR-21: Show total component count, total bicycle count.
- FR-22: Show 5 most recent price updates across all components.
- FR-23: Quick-action navigation links.

---

## 4. Non-Functional Requirements

| Requirement | Target |
|---|---|
| Response time | API responses < 300ms for any endpoint |
| Reliability | SQLite ACID transactions; no data loss on crash |
| Maintainability | Clear folder structure; < 200 lines per file target |
| Code quality | ESLint enforced; consistent naming conventions |
| Security (MVP) | Input validation on all endpoints; parameterized queries |
| Usability | All core tasks completable in < 3 clicks |
| Compatibility | Chrome, Firefox, Safari; desktop + tablet |

---

## 5. Risks & Constraints

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| SQLite concurrency limits | Low (single-user MVP) | Medium | Document PostgreSQL migration path |
| Component deleted while in bicycle | Medium | High | Soft-delete only; warn in UI |
| Price missing for a component | Medium | High | Pricing engine returns graceful error with details |
| No authentication in MVP | High (known gap) | Medium | Explicitly scoped out; add JWT as next milestone |
| Fresher unfamiliar with edge cases | Medium | Medium | Document all edge cases in this doc |

---

## 6. User Stories

```
US-01  As a salesperson, I want to see all available components and their 
       current prices so I can plan a configuration.

US-02  As a salesperson, I want to build a bicycle by selecting components 
       and quantities so I can generate an accurate quote.

US-03  As a salesperson, I want to instantly see the total price of a bicycle 
       with a full breakdown so I can share it with a customer.

US-04  As a procurement manager, I want to update a component's price so 
       the system reflects current supplier costs.

US-05  As a procurement manager, I want to view the price history of any 
       component so I can track cost trends.

US-06  As a manager, I want a dashboard showing system activity so I can 
       monitor pricing changes at a glance.

US-07  As a salesperson, I want to search and filter components by category 
       so I can find parts quickly in a large catalog.
```

---

## 7. Edge Cases

| Scenario | Handling |
|---|---|
| Component has no price history | Pricing engine flags it; breakdown shows "Price not set" |
| Same component added to bicycle twice | API updates quantity instead of creating duplicate |
| Component deactivated after being added to bicycle | Still shown in config; flagged as inactive in UI |
| Price of ₹0 | Allowed (promotional / included parts); treated as valid |
| Negative price submitted | Rejected with 400 validation error |
| Bicycle with zero components | Allowed to save; total = ₹0 with empty breakdown |
| Deleting a component used in bicycles | Soft-delete only; bicycle configurations remain intact |
| Quantity of 0 or negative | Rejected with 400; minimum quantity is 1 |
| Very long component names | DB column limit; validated at 100 chars max |
| Concurrent price updates | SQLite serializes writes; last-write-wins in MVP |
