---
tags: [sprint, bug]
sprint: 30
---

# Sprint 30 Bugs

- [x] FP-2233 — Tax recalculation double-counted discounts. Root cause + fix: [[Rounding Errors in Tax Calculation]]
- [x] FP-2241 — Outbox publisher occasionally re-published events after a transient SQL timeout (idempotency key was missing). Fixed by adding a unique constraint on `EventId`.
- [x] FP-2249 — Backfill migration timed out on the largest customer's invoice history (~40k rows). Fixed by batching in chunks of 1000.

#fieldpro #bug
