---
tags: [lesson-learned, performance, sql]
date: 2026-06-05
severity: medium
---

# Index Fragmentation Investigation

## Problem
`WorkOrder` table reads gradually slowed over ~6 weeks with no corresponding data volume growth to explain it.

## Root Cause
Clustered index fragmentation reached 62% — our maintenance job only checked fragmentation monthly, and high-frequency status updates on this table fragmented pages faster than that cadence accounted for.

## Solution
Immediate index rebuild, plus changed the maintenance job to check weekly and use a graduated response (reorganize above 10% fragmentation, full rebuild above 30%).

## Prevention
- Weekly fragmentation check now runs automatically, alerts if any index exceeds 40%
- Added this as a standard checklist item when a table's write pattern changes significantly (e.g. a new frequently-updated column)

## Related
- [[SQL Server Index Fundamentals]]
- [[03 Knowledge Base/SQL Server/Index Fragmentation Investigation]]

#lesson-learned #performance #sql #fieldpro
