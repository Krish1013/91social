# Clarifying Questions

> Questions a software engineer should ask before writing a single line of code.
> Answers are provided based on the assumptions made for this MVP.

---

## Business & Domain

**Q1. Is pricing in a single currency (INR)? Will multi-currency be needed?**  
→ MVP: Single currency, INR. Multi-currency deferred.

**Q2. Are there taxes (GST), discounts, or markups applied on top of component costs?**  
→ MVP: No. Raw component cost only. Tax/discount layer is a next-phase feature.

**Q3. Should "bicycle price" be the cost price (procurement) or the selling price (with margin)?**  
→ MVP: Cost price only. Margin calculation is out of scope.

**Q4. When a price is updated, should existing saved bicycle configurations reflect the new price?**  
→ Yes. Pricing is always computed fresh (no snapshot). The system always uses the latest price.

**Q5. Can a bicycle have two of the same component (e.g., two tyres)?**  
→ Yes. Quantity field handles this. One row per component per bicycle, quantity >= 1.

**Q6. Are component categories a fixed list or user-managed?**  
→ MVP: Fixed enum (Frame, Tyre, Gear Set, Brake, Seat, Chain, Handlebar, Other). Admin-managed categories deferred.

**Q7. Is there a concept of a "published" quote vs. a draft configuration?**  
→ MVP: All configurations are saved immediately. No draft/publish workflow.

**Q8. Should a bicycle require all categories to be filled (e.g., must have a Frame)?**  
→ MVP: No hard validation on category completeness. Salesperson decides.

---

## Data & History

**Q9. How far back should price history be retained?**  
→ Indefinitely. Append-only; no archiving in MVP.

**Q10. Should we support point-in-time pricing (what was this bicycle worth on Jan 1)?**  
→ Not in MVP. Current price only. Point-in-time is a future feature.

**Q11. Who makes price changes — dedicated admin or any salesperson?**  
→ MVP: Any user (no roles). Role-based access control is a future feature.

**Q12. Should components be hard-deleted or soft-deleted?**  
→ Soft-delete. Components used in bicycle configs must remain queryable.

---

## Technical

**Q13. Should this work offline?**  
→ No. Web-based, requires network to backend.

**Q14. Is there an existing database or data we need to import?**  
→ No. Fresh system. Seed data provided for demo.

**Q15. What is the expected number of components and bicycles in the system?**  
→ MVP target: < 500 components, < 100 bicycles. SQLite is appropriate.

**Q16. Should the API support pagination?**  
→ Not in MVP. Lists are fetched in full. Pagination added when count > 100.

**Q17. Is there a requirement for API authentication (API keys, JWT)?**  
→ No. Explicitly out of scope for MVP. Document as future improvement.

**Q18. Should prices be stored as integers (paise) or floats (rupees)?**  
→ Stored as REAL (float) in SQLite; displayed with 2 decimal places. For production, use INTEGER paise + PostgreSQL NUMERIC.

**Q19. Should the frontend support multiple tabs/users editing simultaneously?**  
→ Not in MVP. Single-user assumption. Optimistic concurrency deferred.

**Q20. Is a mobile-first design required?**  
→ Responsive design required. Desktop is the primary target. Mobile is secondary.
