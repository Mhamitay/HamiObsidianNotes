---
type: reference
layer: database
status: active
updated: 2025-01
tags:
  - system/database
  - reference
---

# Database Naming Conventions

## Table Prefixes

| Prefix | Meaning | Examples |
|---|---|---|
| `t` | Primary data table | `tJob`, `tDailyTicket`, `tAsset`, `tEmployee` |
| `ta` | Audit/history table | `taJob`, `taDailyTicket` — mirrors `t` table, tracks changes |
| `tc` | Code/lookup table | `tcJobStatus`, `tcSafetyIncidentType` — system lookup values |
| `e` | Enum table | `eJobType`, `eServiceType` — small reference sets |

## View Prefixes

| Prefix | Meaning | Usage |
|---|---|---|
| `v` | Operational view | Used by application queries, returns enriched data via joins |
| `vr` | Report view | Used exclusively by DevExpress reports — may return different shape |

## Stored Procedure Naming

```
{Domain}_{Action}
```

| Pattern | Examples |
|---|---|
| `{Domain}_SelectAll` | `Job_SelectAll`, `Employee_SelectAll` |
| `{Domain}_SelectBy{Key}` | `Job_SelectByID`, `DailyTicket_SelectByJobID` |
| `{Domain}_Insert` | `Job_Insert`, `Asset_Insert` |
| `{Domain}_Update` | `Job_Update`, `DailyTicket_Update` |
| `{Domain}_Delete` | `Job_Delete` |
| `{Domain}_SelectAllOffline` | `Job_SelectAllJobsOffline` — offline sync variants |

## Column Conventions

| Convention | Example | Notes |
|---|---|---|
| PK: `{TableName}ID` | `JobID`, `DailyTicketID` | Integer surrogate key |
| FK: `{RelatedTable}ID` | `TenantID`, `CustomerID` | Integer FK |
| `TenantID` | Present on ALL data tables | Multi-tenant isolation |
| `CreatedDate` / `ModifiedDate` | Audit timestamps | On most tables |
| `CreatedBy` / `ModifiedBy` | User ID FK | On most tables |
| `IsActive` / `IsDeleted` | Soft delete flags | Common pattern |

## Important Notes

- Every SP **must** accept `@TenantID INT` and filter by it
- Report views (`vr`) may return aggregated or denormalized data not suitable for direct editing
- Audit tables (`ta`) are append-only — no updates or deletes
- SQL scripts must be wrapped in an `IF EXISTS` guard per project conventions

---

## Related

- [[Database Overview]]
- [[Stored Procedures]]
- [[Views]]
- [[Core Tables]]
