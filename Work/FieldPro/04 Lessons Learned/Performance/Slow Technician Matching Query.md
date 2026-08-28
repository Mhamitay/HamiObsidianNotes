---
tags: [lesson-learned, performance, sql]
date: 2026-07-21
severity: high
---

# Slow Technician Matching Query

## Problem
The technician-matching endpoint was the single largest source of P95 latency complaints from support — up to 1.8s for customers with a large technician pool.

## Root Cause
Original implementation loaded all technicians into memory and looped through them in C# checking availability one at a time (O(n²) against schedule slots) — worked fine at small scale, degraded badly as technician pool size grew.

## Solution
Rewrote as a single indexed SQL query using a CTE and a new filtered index on `ScheduleSlot.IsAvailable`. Result: ~40ms, a ~45x improvement.

## Prevention
- Any "loop and check" pattern over a growing collection should be treated as a performance red flag during code review, not just at scale-testing time
- Added a load test with a realistic large technician pool (500+) to the pre-release checklist, since our staging data previously only had ~30 technicians and never surfaced this

## Related
- [[SQL Server Index Fundamentals]]
- [[Technician Matching Algorithm]]
- [[Sprint 31 Technical Decisions]]

#lesson-learned #performance #sql #fieldpro
