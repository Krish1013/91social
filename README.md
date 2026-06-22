# 🚲 Hero Cycles — Pricing Engine

A full-stack web application for managing bicycle component pricing and generating instant cost breakdowns. Built to replace error-prone Excel-based quoting with a clean, reliable system.

> **Assignment submission by:** [Your Name]  
> **Role applied for:** Software Engineer Intern  
> **Stack:** React 18 · React Router 6 · Express.js · SQLite · Jest

---

## The Problem

Hero Cycles sells thousands of bicycle configurations. Each bicycle is made of multiple components — frames, tyres, gear sets, brakes, seats, chains, handlebars. Component prices change frequently. Salespersons were managing all of this in Excel, leading to pricing errors, stale data, and slow quoting.

## The Solution

A web application where users can:
- Manage components and track their full price history
- Build bicycle configurations from the component catalog
- Instantly calculate total bicycle price with a line-by-line breakdown
- See category-level cost analysis

---

## Features

| Feature | Detail |
|---|---|
| **Component CRUD** | Create, edit, deactivate components with categories |
| **Price History** | Append-only price tracking — every change preserved forever |
| **Price Timeline** | Visual timeline showing price changes with delta indicators |
| **Bicycle Builder** | Drag-free UI to add/remove/quantity-adjust components |
| **Live Pricing** | Total updates in real-time as components are added |
| **Pricing Breakdown** | Full table + category subtotals + percentage bars |
| **Dashboard** | At-a-glance stats + recent price updates + quick actions |
| **Soft Delete** | Components deactivated, not destroyed — configs remain intact |
| **32 Tests Pass** | Pricing engine unit tests + API integration tests |

---

## Architecture

```
┌──────────────────────────────────────────────────┐
│  React SPA  (port 3000)                          │
│  Dashboard · Components · Bicycles · Pricing     │
└────────────────────┬─────────────────────────────┘
                     │ Axios / HTTP+JSON
┌────────────────────▼─────────────────────────────┐
│  Express.js API  (port 5000)                     │
│                                                  │
│  Routes → Controllers → Services → Repositories  │
│  Middleware: errorHandler, morgan, cors          │
└────────────────────┬─────────────────────────────┘
                     │ @libsql/client
┌────────────────────▼─────────────────────────────┐
│  SQLite Database  (hero_cycles.db)               │
│  components · price_history · bicycles · config  │
└──────────────────────────────────────────────────┘
```

**Layer responsibilities:**
- **Routes** — URL mapping only, no logic
- **Controllers** — parse HTTP, call service, format response
- **Services** — business logic and orchestration
- **Repositories** — all SQL queries, nothing else

---

## Project Structure

```
hero-cycles/
├── docs/
│   ├── problem-analysis.md   Business requirements, user stories, edge cases
│   ├── questions.md          Clarifying questions before implementation
│   ├── assumptions.md        MVP decisions and future paths
│   ├── design.md             Architecture, ER diagram, API map, folder structure
│   ├── database.md           Schema, relationships, queries, seed data
│   ├── pseudocode.md         Pricing engine algorithm in plain English
│   ├── testing.md            Test strategy, coverage plan
│   └── interview-prep.md     20 questions + strong model answers
├── prompts/
│   └── ai-prompts.md         Every AI prompt used during development
├── backend/
│   ├── database/
│   │   ├── connection.js     DB client singleton + init
│   │   ├── schema.sql        Table definitions
│   │   └── seed.sql          Sample data (12 components, 2 bikes)
│   ├── repositories/         SQL queries (one file per entity)
│   ├── services/             Business logic + pricing engine
│   ├── controllers/          HTTP parsing + response formatting
│   ├── routes/               URL → controller mapping
│   ├── middleware/           Central error handler + createError()
│   ├── utils/                Input validation functions
│   ├── tests/                32 Jest tests (unit + integration)
│   ├── app.js                Express app configuration
│   └── server.js             Entry point
└── frontend/
    ├── public/index.html     Bootstrap 5 + Bootstrap Icons CDN
    └── src/
        ├── components/       Navbar, Modal, Toast, EmptyState, etc.
        ├── pages/            One file per route
        ├── services/api.js   All Axios calls in one place
        ├── hooks/            useToast
        ├── utils/format.js   Currency + date formatters
        └── styles/global.css Design system (CSS custom properties)
```

---

## Prerequisites

- Node.js ≥ 18.x
- npm ≥ 9.x

> No Python, no native compilation, no Docker needed. `@libsql/client` is pure JavaScript.

---

## Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/hero-cycles-pricing.git
cd hero-cycles-pricing
```

### 2. Backend setup

```bash
cd backend
npm install
npm start
# API running at http://localhost:5000
# Database auto-created and seeded on first run
```

Development mode (auto-restart on file change):
```bash
npm run dev
```

Verify it's working:
```bash
curl http://localhost:5000/api/health
# {"status":"ok","timestamp":"..."}

curl http://localhost:5000/api/components
# {"data":[...],"count":12}
```

### 3. Frontend setup (new terminal)

```bash
cd frontend
npm install
npm start
# App running at http://localhost:3000
```

The `"proxy": "http://localhost:5000"` in `frontend/package.json` routes all `/api/*` calls to the backend automatically during development.

---

## Environment Variables

Backend (`backend/.env` — optional, defaults shown):

```bash
PORT=5000
DB_PATH=./database/hero_cycles.db   # Use :memory: for tests
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

Create this file if you need to override defaults:
```bash
cp backend/.env.example backend/.env
```

---

## Running Tests

```bash
cd backend
npm test
```

Expected output:
```
Test Suites: 3 passed, 3 total
Tests:       32 passed, 32 total
Time:        ~1.5s
```

With coverage:
```bash
npm run test:coverage
```

Reset database (re-runs seed):
```bash
npm run db:reset
```

---

## API Documentation

Base URL: `http://localhost:5000/api`

### Dashboard
| Method | Endpoint | Description |
|---|---|---|
| GET | `/dashboard` | Stats + recent price updates |

### Components
| Method | Endpoint | Description |
|---|---|---|
| GET | `/components` | List active components with current price |
| POST | `/components` | Create component + optional initial price |
| GET | `/components/:id` | Get component + full price history |
| PUT | `/components/:id` | Update component metadata |
| DELETE | `/components/:id` | Soft-delete (is_active = 0) |
| GET | `/components/categories` | List of valid categories |

### Price History
| Method | Endpoint | Description |
|---|---|---|
| GET | `/components/:id/prices` | Price history (newest first) |
| POST | `/components/:id/prices` | Add new price entry |

### Bicycles
| Method | Endpoint | Description |
|---|---|---|
| GET | `/bicycles` | List all bicycles with component count |
| POST | `/bicycles` | Create bicycle |
| GET | `/bicycles/:id` | Get bicycle with components |
| PUT | `/bicycles/:id` | Update bicycle metadata |
| DELETE | `/bicycles/:id` | Delete bicycle (cascades components) |

### Bicycle Builder
| Method | Endpoint | Description |
|---|---|---|
| POST | `/bicycles/:id/components` | Add/upsert component (merges quantity) |
| PUT | `/bicycles/:id/components/:cid` | Update quantity |
| DELETE | `/bicycles/:id/components/:cid` | Remove component |

### Pricing Engine
| Method | Endpoint | Description |
|---|---|---|
| GET | `/bicycles/:id/pricing` | Full breakdown with grand total |

**Pricing response example:**
```json
{
  "data": {
    "bicycle": { "id": 1, "name": "Hero Sprint 26" },
    "breakdown": [
      {
        "component_id": 1,
        "component_name": "Steel Road Frame 26\"",
        "category": "Frame",
        "quantity": 1,
        "unit_price": 2350,
        "line_total": 2350,
        "price_since": "2025-06-01 00:00:00",
        "is_active": true,
        "price_missing": false
      }
    ],
    "category_subtotals": [
      { "category": "Frame", "subtotal": 2350 },
      { "category": "Tyre",  "subtotal": 460 }
    ],
    "grand_total": 5690,
    "missing_prices": [],
    "has_warnings": false
  }
}
```

**Standard error response:**
```json
{ "error": "Component not found", "code": "NOT_FOUND" }
```

---

## Key Design Decisions

**1. Append-only price history**  
Prices are never updated or deleted. Every change creates a new row. Current price = `MAX(effective_date)` per component. This gives a complete audit trail at zero extra complexity.

**2. Soft delete for components**  
Setting `is_active = 0` instead of hard DELETE preserves existing bicycle configurations. A hard delete would orphan foreign key references. Deactivated components show a warning badge in the pricing breakdown.

**3. Four-layer backend architecture**  
Routes → Controllers → Services → Repositories. Each layer has one job. SQL lives only in repositories. Business logic lives only in services. This makes every layer independently testable and replaceable.

**4. Pricing as a pure async function**  
`pricingService.calculateBicyclePrice(id)` reads data, computes, returns a value. No side effects. Trivially testable with a real in-memory DB. Deterministic for the same inputs.

**5. Real DB in tests (no mocks)**  
Tests use `:memory:` SQLite — a real database, not mocked repositories. This catches SQL bugs, constraint violations, and JOIN issues that mocks would miss.

---

## Future Improvements

- [ ] JWT authentication + RBAC (Admin, Salesperson roles)
- [ ] GST / discount / markup support in pricing engine
- [ ] Pagination for large component catalogs
- [ ] PDF quote export (pdfkit)
- [ ] Bulk component import from CSV
- [ ] PostgreSQL migration (swap repository layer only)
- [ ] Locked price snapshot for sent quotes
- [ ] React Testing Library for frontend tests
- [ ] Category-level margin analysis dashboard

---

## Interview Talking Points

1. **"Why append-only price history?"** — Immutable audit trail; current price is always `MAX(effective_date)`; enables point-in-time pricing as a future feature.

2. **"Why soft delete?"** — Hard delete breaks bicycle configurations that reference the component. Soft delete preserves referential integrity.

3. **"Why four layers?"** — Each layer has one job. To swap SQLite for PostgreSQL, change only repositories. To add a business rule, change only services.

4. **"How does the pricing engine work?"** — Single JOIN query resolves latest price per component, then a JavaScript loop computes line totals and category subtotals.

5. **"Why real DB in tests?"** — Mocked repositories can't catch SQL errors, broken JOIN logic, or constraint violations. `:memory:` SQLite gives real behavior with zero setup.

6. **"What would you do differently?"** — Add JWT auth, pagination, and price snapshots for sent quotes. Use `NUMERIC(12,2)` pricing in PostgreSQL instead of `REAL`.

---

## Commit History Plan

```
feat: initialize project structure and documentation
feat: add SQLite schema (components, price_history, bicycles, bicycle_components)
feat: add seed data with 12 components and 2 sample bicycles
feat: implement component repository and price repository
feat: implement bicycle and bicycle_component repositories
feat: implement pricing service (core business logic)
feat: implement component service with validation
feat: implement bicycle service
feat: add Express routes, controllers, and error handling
test: add pricing engine unit tests (9 tests)
test: add component API integration tests (13 tests)
test: add bicycle API integration tests (10 tests)
feat: add React app with design system (CSS custom properties)
feat: implement Dashboard, Components, and PriceHistory pages
feat: implement Bicycles, BicycleBuilder, and PricingBreakdown pages
docs: add complete documentation (8 doc files + AI prompt log)
chore: final cleanup and README
```

---

*Built with care as a demonstration of product thinking, system design, and engineering quality.*
