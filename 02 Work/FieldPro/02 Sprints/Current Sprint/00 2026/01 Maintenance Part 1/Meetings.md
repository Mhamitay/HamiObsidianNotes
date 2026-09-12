---
tags: [sprint, retrospective]
sprint: 30
status: completed
---

# Sprint 30 Retrospective

## What went well
- Outbox pattern implementation was clean and is already paying off — no more missed events since launch
- Good collaboration on the tax recalculation edge cases once we caught the discount double-counting bug early in QA

## What didn't go well
- Underestimated tax recalculation complexity — multi-jurisdiction and partial refund cases weren't scoped up front, cost us ~1.5 extra days
- Backfill migration wasn't load-tested against production-scale data before staging, caused a scramble mid-sprint

## Action items
- [x] Always run backfill migrations against a prod-sized data snapshot before staging, not just local dev data
- [x] Add a "complexity spike" step to estimation for any task touching financial calculations ✅ 2026-08-28
- [x] Document the outbox pattern for the team — done, see [[Why We Chose the Outbox Pattern]]

## Related
- [[Underestimating Edge Cases in Estimation]]
- [[Invoicing V2 Rollout]]

#fieldpro #sprint
