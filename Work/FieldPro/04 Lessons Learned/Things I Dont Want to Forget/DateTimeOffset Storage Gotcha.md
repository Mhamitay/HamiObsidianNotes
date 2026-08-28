---
tags: [lesson-learned]
date: 2026-07-24
severity: medium
---

# DateTimeOffset Storage Gotcha

## Problem
(Quick note-to-self, root cause of FP-2291 — full writeup in [[Timezone Bugs in Scheduling]].)

## Root Cause
SQL Server's `datetimeoffset` column type preserves the *original* offset it was written with, it does not normalize to UTC automatically. Two values representing the same instant in different offsets will look different in raw storage/display, even though they're comparable correctly by SQL Server internally for ordering.

## Solution
Always convert to UTC explicitly in application code before writing, don't rely on the column type to normalize for you, and don't assume the displayed offset in a query result means anything about "how it's stored."

## Prevention
Keep this note handy — this exact gotcha has caused two separate bugs now across different features.

## Related
- [[Timezone Bugs in Scheduling]]

#lesson-learned #sql #fieldpro
