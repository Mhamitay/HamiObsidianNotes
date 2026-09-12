---
type: component
layer: backend
status: active
technology: "C# .NET 8, ADO.NET"
updated: 2025-01
tags:
  - system/backend
  - component/service
---

# DB Service

## Purpose

`DB.cs` (`Web/Services/DB.cs`, 821 lines) is the **primary data access abstraction** in FieldPro. It is a thin, disposable ADO.NET wrapper that executes SQL Server stored procedures.

## Why It Exists

Rather than using EF Core for all data access, FieldPro chose stored procedures as the primary data path. `DB.cs` provides a consistent, testable wrapper around `SqlConnection` and `SqlCommand` with built-in transaction support and tenant/user context.

See [[ADR - Stored Procedures over EF Core]].

---

## Construction

```csharp
public DB(string connectionString, int tenantID, int userID)
```

- `connectionString` — from `Secrets.ConnectionString`
- `tenantID` — current user's tenant (from claims)
- `userID` — current user's ID (from claims)
- The `tenantID` and `userID` are automatically available to every SP call

---

## Core Methods

### Reading Data
```csharp
SqlDataReader reader = _db.ExecuteReader("SP_Name", sqlParams);
```
Returns a `SqlDataReader`. The caller is responsible for mapping columns to models.

### Scalar Values
```csharp
object result = _db.ExecuteScalar("SP_Name", sqlParams);
```

### Write / Execute
```csharp
_db.Execute("SP_Name", sqlParams, DB.Action.Insert);
// Action enum controls what the SP returns / how result is interpreted
```

### Transactions
```csharp
_db.Begin();
// ... operations
_db.Commit(setConnectionNull: true); // setConnectionNull allows reuse after commit
// or
_db.Rollback();
```

### Clone
```csharp
DB clone = _db.Clone(); // same connection string/tenant/user, new connection
```
Used when a sub-operation needs its own connection while parent holds a transaction.

---

## Transaction State Check

```csharp
if (_db.IsTransactionGood) { ... }
```

Returns `true` if a transaction is active and the connection is open.

---

## DB.Action Enum

Used to control SP execution behavior:

| Value | Meaning |
|---|---|
| `Insert` | SP inserts and returns new ID |
| `InsertNOSurrogateKey` | Insert without returning ID |
| `Update` | SP updates record |
| `Delete` | SP soft/hard deletes |
| `DeleteByID` | Delete by primary key |
| `SelectID` | SP returns a single ID |
| `SelectCount` | SP returns a count |
| `QuearyOutParameters` | SP uses OUTPUT parameters |
| `Default` | Returns rows affected |

---

## IDisposable

`DB` implements `IDisposable`. Domain classes should ensure the `DB` instance is disposed when done, or use it within a `using` block when appropriate.

---

## Common Problems

- **Open connection not closed** — if `Commit()` is not called after `Begin()`, the connection stays open. See [[Troubleshooting Index]].
- **SP name typo** — SP names are in the `SP` static class. If a SP name doesn't match, SQL Server throws a runtime error.

---

## Related

- [[Data Access Pattern]]
- [[Domain Classes]]
- [[Stored Procedures]]
- [[Multi-Tenancy]]
- [[ADR - Stored Procedures over EF Core]]
