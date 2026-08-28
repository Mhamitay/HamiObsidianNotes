---
tags: [lesson-learned, bug, csharp]
date: 2026-07-18
severity: medium
---

# Null Reference on Cancelled Work Orders (FP-2260)

## Problem
`NullReferenceException` thrown when cancelling a WorkOrder that had no assigned technician yet (still in `Requested` state).

## Root Cause
The cancellation handler assumed a `ScheduleSlot` always existed and unconditionally called `workOrder.ScheduleSlot.Release()`. That assumption was true for `Scheduled` state WorkOrders but not `Requested` ones — the handler didn't branch on state.

## Solution
Added an explicit null check, and more importantly, made the state machine explicit: cancellation logic now branches on `WorkOrder.Status` and only releases a slot if one exists.

## Prevention
- This is exactly the class of bug nullable reference types are meant to catch — `ScheduleSlot` navigation property should have been modeled as nullable (`ScheduleSlot?`) from the start, since it genuinely can be null. See [[Nullable Reference Types in C#]].
- Added a unit test for cancellation from every valid source state in [[Work Order Lifecycle]].

## Related
- [[Sprint 31 Bugs]]
- [[Exception Handling Strategy]]

#lesson-learned #bug #csharp #fieldpro
