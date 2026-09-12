---
tags: [lesson-learned, bug]
date: 2026-07-15
severity: medium
---

# Rounding Errors in Tax Calculation (FP-2233)

## Problem
Tax recalculation occasionally double-counted a discount, resulting in an invoice total off by a few cents — found during QA, not yet in production.

## Root Cause
The tax calculation service applied the discount to the subtotal, then a separate legacy code path (left over from v1) also subtracted the discount before computing tax on the remaining v1 fields still being written for backward compatibility during the migration window.

## Solution
Removed the legacy v1 dual-write path entirely once we confirmed no consumers still read those fields, eliminating the double-subtraction at the source rather than patching around it.

## Prevention
- Added a golden-file test with known invoice inputs/outputs covering discounts + tax interaction
- Lesson: dual-write "backward compatibility" code paths are a common home for these bugs — set a calendar reminder to remove them once confirmed unused, don't just leave them indefinitely

## Related
- [[Sprint 30 Bugs]]
- [[Strategy Pattern for Tax Calculation]]

#lesson-learned #bug #fieldpro
