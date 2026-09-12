---
type: component
layer: backend
status: active
technology: "C# .NET 8"
updated: 2025-01
tags:
  - system/backend
  - component/service
---

# Domain Classes

## Overview

Domain classes in `Web/Domain/` are the **business logic layer** of FieldPro. They contain all data manipulation, validation, transformation, and SP invocation logic. Controllers are thin — they delegate to domain classes.

---

## Pattern

Every domain class follows a consistent structure:

```csharp
public class Job : DataModelBase
{
	private readonly DB _db;
	private readonly int _tenantID;
	private readonly int _userID;

	// Constructor with connection string (most common)
	public Job(string connectionString, int tenantID, int userID)
	{
		_db = new DB(connectionString, tenantID, userID);
		_tenantID = tenantID;
		_userID = userID;
	}

	// Alternate constructor for sharing an existing DB/transaction
	public Job(DB db, int tenantID, int userID)
	{
		_db = db;
		_tenantID = tenantID;
		_userID = userID;
	}
}
```

Key points:
- **Not registered in DI** — instantiated directly by controllers/page models
- **Tenant and user context** are always injected at construction time
- Alternate `DB db` constructor allows sharing transactions across domain objects
- Inherits `DataModelBase` (provides `AddParameter()` helper for `SqlParameter`)

---

## Scale

`Job.cs` alone is **2356 lines**. Domain classes are large, containing all operations for their domain entity. This is intentional — it keeps the full domain model for each entity in one place.

---

## Major Domain Classes

| Class | Domain | Key Methods (approx) |
|---|---|---|
| `Job` | Job lifecycle | Select, Insert, Update, Delete, Export, Offline operations |
| `DailyTicket` | Billing tickets | Select, Insert, Update, Approve, Export |
| `LoadOut` | Equipment dispatch | Select, Insert, Update, Complete |
| `ServiceDesign` | MOC/JSA | Select, Insert, Update, Revise, Approve |
| `Asset` | Physical assets | Select, Insert, Update, Certifications |
| `SupplyChain` | Inventory/Products | Select, Insert, Update, Purchase Orders |
| `Timesheet` | Time entries | Select, Insert, Update, Submit, Approve |
| `Employee` | Staff records | Select, Insert, Update |
| `Customer` | CRM customers | Select, Insert, Update |
| `Incident` | Safety incidents | Select, Insert, Update, Investigate |

---

## Data Mapping Pattern

Domain classes map `SqlDataReader` columns to model properties manually:

```csharp
using (SqlDataReader reader = _db.ExecuteReader(SP.Job_Select, parameters))
{
	while (reader.Read())
	{
		var model = new Models.Job();
		model.JobID = reader.GetInt32("JobID");
		model.JobNumber = reader.GetString("JobNumber");
		// ...
		models.Add(model);
	}
}
```

This is verbose but explicit — no ORM magic in the primary data path.

---

## Transactions Across Domain Classes

When an operation needs to span multiple domain objects:

```csharp
_db.Begin();
var ticket = new DailyTicket(_db, _tenantID, _userID); // shares transaction
ticket.Insert(...);
// more operations...
_db.Commit();
```

---

## Export Functionality

Many domain classes have `Export()` methods that return a `MemoryStream` of an Excel/CSV file via `Utility.Export.GetStreamAsync()`.

---

## SP Reference

SP names are referenced via a **static `SP` class** with string constants:
```csharp
SP.Job_SelectAll
SP.Job_Insert
SP.Job_Update
SP.Job_Delete
```

This prevents magic strings and makes SP usage searchable.

---

## Related

- [[DB Service]]
- [[Data Access Pattern]]
- [[API Controllers]]
- [[Stored Procedures]]
- [[Jobs Feature]]
- [[Daily Tickets Feature]]
