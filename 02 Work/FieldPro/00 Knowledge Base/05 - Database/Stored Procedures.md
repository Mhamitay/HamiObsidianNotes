---
type: reference
layer: database
status: active
updated: 2025-01
tags:
  - system/database
  - reference
---

# Stored Procedures

## Overview

Stored procedures are the **primary data access mechanism** in FieldPro (~1000+ total). All writes and most reads go through stored procedures called from [[DB Service]].

---

## Naming Pattern

```
{Domain}_{Action}
```

| Action | Purpose |
|---|---|
| `SelectAll` | Get all records for tenant |
| `SelectByID` | Get single record by PK |
| `SelectBy{Key}` | Get records filtered by a specific key (e.g., `SelectByJobID`) |
| `Insert` | Create new record, returns new ID |
| `Update` | Update existing record |
| `Delete` | Soft or hard delete |
| `SelectAllOffline` | Variant for offline sync data loading |

---

## SP Reference Class

SP names are stored as constants in the `SP` static class in the C# codebase:
```csharp
public static class SP
{
	public const string Job_SelectAll = "Job_SelectAll";
	public const string Job_Insert = "Job_Insert";
	// ...
}
```

This prevents magic strings and makes SP references searchable via Find All References.

---

## Standard Parameters

Every SP that reads tenant data includes:
```sql
@TenantID INT
```

Write SPs also typically include:
```sql
@UserID INT  -- for CreatedBy/ModifiedBy tracking
```

---

## SP Script Convention

Per project rules, SQL scripts must be wrapped in an `IF EXISTS` guard:
```sql
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Job_Insert]') AND type = 'P')
	DROP PROCEDURE [dbo].[Job_Insert]
GO
CREATE PROCEDURE [dbo].[Job_Insert]
	@TenantID INT,
	@UserID INT,
	-- ...
AS
BEGIN
	SET NOCOUNT ON;
	-- ...
END
```

---

## Key SP Groups

| Domain | Example SPs |
|---|---|
| Job | `Job_SelectAll`, `Job_Insert`, `Job_Update`, `Job_SelectAllJobsOffline` |
| Daily Ticket | `DailyTicket_SelectByJobID`, `DailyTicket_Insert`, `DailyTicket_Approve` |
| Load Out | `LoadOut_SelectByJobID`, `LoadOut_Insert` |
| Service Design | `ServiceDesign_Select`, `ServiceDesign_Insert`, `ServiceDesign_Revise` |
| Asset | `Asset_SelectAll`, `Asset_Insert`, `Asset_UpdateCertification` |
| Purchase Order | `PurchaseOrder_SelectAll`, `PurchaseOrder_Insert` |
| Timesheet | `Timesheet_SelectByEmployee`, `Timesheet_Submit` |
| Safety | `SafetyIncident_Insert`, `SafetyIncident_SelectAll` |
| Employee | `Employee_SelectAll`, `Employee_Insert` |
| Customer | `Customer_SelectAll`, `Customer_Insert` |

---

## Report SPs

Some DevExpress reports call SPs directly via `CustomSqlDataConnectionProviderFactory`. These SPs typically have `_Report` suffix or are the same operational SPs.

---

## Related

- [[Database Overview]]
- [[Database Naming Conventions]]
- [[DB Service]]
- [[Data Access Pattern]]
- [[Views]]
