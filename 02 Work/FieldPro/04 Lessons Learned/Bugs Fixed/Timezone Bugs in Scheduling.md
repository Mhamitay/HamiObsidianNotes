---
tags: [lesson-learned, bug, sql]
date: 2026-07-24
severity: high
---

# Timezone Bugs in Scheduling (FP-2291)

## Problem
Technicians were occasionally getting double-booked for overlapping time slots, but only for customers in time zones with a different UTC offset than our primary data center's local assumptions. Hard to reproduce locally because dev environment defaults to UTC.

## Root Cause
`ScheduleSlot.StartUtc`/`EndUtc` were stored correctly as UTC, but a query in the repository layer compared them against a `DateTimeOffset` parameter that had been constructed from local time without an explicit UTC conversion in one specific code path (the reschedule flow, not the original booking flow). Two schedule slots that were actually overlapping in UTC didn't look overlapping to that query.

## Solution
Normalized all `DateTimeOffset` comparisons to UTC explicitly at the repository boundary rather than relying on callers to pass already-normalized values. Added a unit test matrix covering bookings across DST boundaries and non-UTC customer time zones.

## Prevention
- Added an analyzer rule flagging any `DateTimeOffset` comparison in the repository layer that doesn't call `.ToUniversalTime()` or isn't already sourced from a UTC-guaranteed value
- Documented the pattern in [[Repository Pattern in FieldPro]]

## Related
- [[Sprint 31 Bugs]]
- [[Technician Matching Algorithm]]

#lesson-learned #bug #sql #fieldpro
