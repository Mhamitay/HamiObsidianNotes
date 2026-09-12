---
type: overview
layer: database
status: active
technology: "SQL Server"
updated: 2025-01
tags:
  - system/database
---

# Database Overview

## Summary

The FieldPro database is a **SQL Server** database managed as an **SSDT project** (`Database/Database.sqlproj`). It contains all schema definitions, stored procedures, views, functions, and triggers. It is the **authoritative source of truth** for the data model.

---

## Scale

| Object Type | Approximate Count |
|---|---|
| Tables | ~200 |
| Views | ~500 |
| Stored Procedures | ~1000 |
| Functions | ~80 |
| Triggers | ~30 |
| Audit tables | ~50 |

---

## Database Project

**Location:** `Database/Database.sqlproj`

> **Important:** The Database project is **excluded from the default solution build**. Always build it separately to validate SQL changes:
> ```
> msbuild Database/Database.sqlproj
> ```
> Or use Visual Studio "Build" on the Database project specifically.

See [[Database Project]].

---

## Schema Structure

All objects are in the `dbo` schema unless otherwise noted.

```
Database/dbo/
	Tables/
	Views/
	StoredProcedures/
	Functions/
	Triggers/
```

---

## Naming Conventions

See [[Database Naming Conventions]] for the complete guide.

| Prefix | Type | Example |
|---|---|---|
| `t` | Data table | `tJob`, `tDailyTicket`, `tAsset` |
| `v` | View (operational) | `vJob`, `vDailyTicket` |
| `vr` | View (report) | `vrJobReport`, `vrCurrentAndAgedWIPReport` |
| `ta` | Audit table | `taJob`, `taDailyTicket` |
| `tc` | Code/lookup table | `tcJobStatus`, `tcSafetyIncidentType` |
| `e` | Enum table | `eJobType`, `eServiceType` |
| No prefix | Stored procedures | `Job_SelectAll`, `DailyTicket_Insert` |

---

## Key Tables

| Table | Purpose |
|---|---|
| `tJob` | Core job/work order record |
| `tDailyTicket` | Field billing ticket |
| `tTenant` | Tenant (client company) definitions |
| `tEmployee` | Staff and crew |
| `tCustomer` | CRM customer accounts |
| `tAsset` | Physical equipment/tools |
| `tLoadOut` | Equipment dispatch records |
| `tServiceDesign` | MOC/JSA pre-job documents |
| `tSafetyIncident` | Safety incident reports |
| `tPurchaseOrder` | Supply chain purchase orders |
| `tTimesheet` | Employee time records |
| `tProduct` | Inventory products |

See [[Core Tables]].

---

## Stored Procedure Patterns

All SPs follow a naming convention:
```
{Domain}_{Action}
```

Examples: `Job_SelectAll`, `Job_Insert`, `Job_Update`, `DailyTicket_SelectByJobID`

All SPs accept `@TenantID INT` as a parameter for tenant filtering.

See [[Stored Procedures]].

---

## Views

- `v` views: operational queries used by the application
- `vr` views: report-specific queries used by DevExpress reports

See [[Views]].

---

## Audit Tables

All major tables have a corresponding `ta` audit table that captures change history (who changed what and when). Audit triggers (`AFTER INSERT, UPDATE, DELETE`) write to `ta` tables.

See [[Database Triggers]].

---

## Adding New Database Objects

Per project conventions:
> When adding any new files to the database project, **always add them to `Database.sqlproj`**.
> Before committing, verify only intended SQL files are added and each file is in the correct location.

---

## Related

- [[Database Naming Conventions]]
- [[Core Tables]]
- [[Stored Procedures]]
- [[Views]]
- [[Database Triggers]]
- [[Database Project]]
- [[Data Access Pattern]]
