---
type: reference
layer: database
status: active
updated: 2025-01
tags:
  - system/database
  - reference
---

# Views

## Overview

FieldPro has ~500 database views used for enriched read queries and reporting.

---

## View Types

### `v` — Operational Views
Used by the application for data display. Typically join multiple tables to produce a denormalized record suitable for grid display.

Example: `vJob` joins `tJob` with `tCustomer`, `tEmployee`, `tcJobStatus` to produce a flat, display-ready row.

### `vr` — Report Views
Used exclusively by DevExpress reports. May return different columns, aggregations, or data shapes not needed for operational use. Report views often have heavier joins or computed columns.

Example: `vrCurrentAndAgedWIPReport` (the file currently open in the user's IDE) — provides work-in-progress aging data for billing/finance reports.

---

## EF Core View Mapping

Operational views are mapped in `DataDbContext` as EF Core entities:
```csharp
modelBuilder.Entity<Models.vJob>().ToView("vJob");
modelBuilder.Entity<Models.vJob>().HasQueryFilter(m => m.TenantID == GetTenantIDDbContext());
```

The corresponding C# model class (e.g., `Models.vJob`) must exactly match the view's column names.

> **Important:** View-backed EF models must NOT inherit from other EF entities and must NOT have navigation properties unless explicitly configured. Use flat, dedicated model classes. See [[EF Core Multi-Mapping Errors]].

---

## Report Views

Report views (`vr`) are queried directly by DevExpress via SQL — not through EF Core. They are referenced by the report designer's SQL data source.

---

## Related

- [[Database Overview]]
- [[Database Naming Conventions]]
- [[DataDbContext]]
- [[Reporting Feature]]
- [[EF Core Multi-Mapping Errors]]
