# AI Prompt Log

> Every prompt used during the design, implementation, and documentation of this project.
> Required by the assignment to demonstrate AI-assisted engineering process.

---

## 1. Product Discovery & Problem Analysis

```
You are a product manager and business analyst. 
Given this problem: "Hero Cycles wants to replace Excel-based pricing 
with a web app where salespersons can manage components, track price 
history, and instantly calculate bicycle configuration costs."

Generate:
- Stakeholder list with interests
- Business goals (5-7)
- Functional requirements (numbered FR-01 to FR-20)
- Non-functional requirements with measurable targets
- User stories in "As a... I want... So that..." format
- Edge cases that could break the system

Format as a structured markdown document.
```

---

## 2. Clarifying Questions

```
You are a senior software engineer about to start implementing the 
Hero Cycles pricing system. Before writing any code, generate every 
clarifying question you would ask the product owner.

Organize by: Business, Data & History, Technical, User/Access.
For each question, provide the answer/assumption you'd use for an MVP.
```

---

## 3. System Architecture

```
Design the architecture for a full-stack pricing engine:
- Frontend: React + React Router + Axios
- Backend: Node.js + Express.js  
- Database: SQLite
- No TypeScript, no complex tooling

Requirements:
- Component management with price history
- Bicycle configurations
- Pricing engine using latest prices
- Dashboard

Produce:
1. Layer diagram with responsibility of each layer
2. ER diagram in Mermaid syntax
3. Full REST API endpoint table
4. Folder structure (both frontend and backend)
5. Data flow for the pricing calculation request
```

---

## 4. Database Schema

```
Design a SQLite database schema for the Hero Cycles pricing engine.

Entities:
- Components (with soft delete)
- Component price history (append-only, never update/delete)
- Bicycles (configurations)
- Bicycle components (join table with quantity)

For each table provide:
- Column names, types, constraints
- Primary and foreign keys
- Indexes for performance
- Design rationale

Also write the SQL to:
1. Get all active components with their current price
2. Get full pricing breakdown for bicycle ID X
3. Get 5 most recent price updates
```

---

## 5. Pricing Engine Design

```
Design the pricing engine for Hero Cycles. It must:
- Take a bicycle ID as input
- Return a detailed cost breakdown
- Always use the latest price per component
- Handle missing prices gracefully (flag, don't crash)
- Return category-level subtotals
- Be a pure function (no side effects)

Provide:
1. Input/output contract (data shapes)
2. Step-by-step pseudocode
3. Edge case handling table
4. Explanation of why it's designed as a pure function
```

---

## 6. Backend Implementation

```
Implement the Express.js backend for Hero Cycles.

Architecture:
- routes/ → URL mapping only
- controllers/ → HTTP parsing, response formatting  
- services/ → business logic
- repositories/ → all SQL queries
- middleware/ → error handler
- utils/ → validation helpers

Requirements:
- All async/await, no callbacks
- Central error handler with consistent JSON error shape
- Input validation in utils/validation.js
- Soft delete for components
- Append-only price history
- Parameterized SQL (no string interpolation)
- SQLite via @libsql/client

Generate every file with clean, commented code.
```

---

## 7. API Controller Pattern

```
Show me the correct pattern for an async Express controller that:
1. Calls an async service function
2. Awaits the result
3. Sends a JSON response
4. Passes any error to next(err) for central handling

Common mistake to avoid: returning a Promise to res.json() 
instead of awaiting it first.

Show: correct pattern, incorrect pattern, and why the incorrect 
one fails silently (JSON.stringify of a Promise returns {}).
```

---

## 8. Test Suite Design

```
Design a test suite for the Hero Cycles backend using Jest + supertest.

Requirements:
- Use in-memory SQLite (:memory:) — no mocking
- Fresh database per test (beforeEach reset)
- Test the pricing engine as a unit (direct service call)
- Test all API endpoints as integration tests (HTTP request)
- Cover all edge cases: missing prices, soft delete, upsert behavior

Generate:
1. testHelper.js with database setup
2. pricing.test.js — 9 unit tests for the pricing engine  
3. components.test.js — 13 API integration tests
4. bicycles.test.js — 10 API integration tests

All tests must pass with: npm test
```

---

## 9. React Frontend Architecture

```
Design the React frontend for Hero Cycles.

Pages needed:
- Dashboard (stats + recent price updates + quick actions)
- Components (CRUD table with search/filter)
- Price History (timeline + add price modal)
- Bicycles (card grid with create/edit/delete)
- Bicycle Builder (component selector + live total)
- Pricing Breakdown (full breakdown table + category chart)
- 404 Not Found

Reusable components: Navbar, Modal, Toast, EmptyState, 
LoadingSpinner, ConfirmDialog, PageHeader

Design system: custom CSS with CSS variables, navy/orange palette.
No component library — vanilla CSS + Bootstrap utility classes.

Generate: folder structure, component responsibilities, 
routing plan, state management approach.
```

---

## 10. CSS Design System

```
Create a CSS design system for a professional B2B web app.

Brand: Hero Cycles (Indian bicycle manufacturer)
Palette: Deep navy (#1a2744) + vibrant orange (#f05a22) + clean whites
Style: Professional, minimal, trustworthy — NOT playful

Components needed:
- Navbar (sticky, dark)
- Stat cards (icon + number + label)
- Data tables (thead, tbody, tfoot, hover states)
- Buttons (primary/outline/danger, sm/default/lg sizes)
- Form inputs (focus states, error states)
- Badges (category, active/inactive)
- Modal overlay + slide-up animation
- Toast notifications (success/error/info, slide-in)
- Empty states
- Loading states
- Price timeline visualization

Use CSS custom properties for theming. No SCSS. Mobile responsive.
```

---

## 11. Pricing Breakdown UI

```
Design the pricing breakdown page for a bicycle pricing engine.

Data available:
- bicycle: { name, description }
- breakdown: [{ component_name, category, unit_price, quantity, line_total, price_since, is_active, price_missing }]
- category_subtotals: [{ category, subtotal }]
- grand_total: number
- missing_prices: string[]
- has_warnings: boolean

Design requirements:
- Grand total prominently displayed (dark navy hero bar)
- Component breakdown table with subtotals column
- Category breakdown sidebar with percentage bars
- Warning banner for missing prices
- Print-friendly layout
- "Price since" date shown per component
- Inactive component badge

Generate the React component with inline styles matching the design system.
```

---

## 12. Interview Preparation

```
I built a Hero Cycles pricing engine (React + Express + SQLite).
Key design decisions:
- 4-layer architecture (routes/controllers/services/repositories)
- Append-only price history
- Soft delete for components
- Pricing engine as a pure async function
- @libsql/client for SQLite (pure JS, no native compilation)
- 32 passing tests (unit + integration)

Generate 20 likely interview questions with strong answers covering:
- Architecture decisions
- Database design
- Pricing engine logic
- React patterns used
- Tradeoffs made
- How to scale

Answers should be honest about what's in the MVP and what's deferred.
```

---

## 13. README Generation

```
Write a world-class README.md for this project.

Project: Hero Cycles Pricing Engine
Stack: React 18 + React Router 6 + Express.js + SQLite (@libsql/client) + Jest

Include:
- Project overview with clear value proposition
- Feature list
- Architecture diagram (ASCII)
- Prerequisites
- Step-by-step installation (backend + frontend)
- Environment variables
- API documentation (all endpoints with examples)
- Running tests
- Project structure
- Design decisions section
- Future improvements
- Interview talking points

Tone: Professional, clear, written by an engineer who understands the system deeply.
```
