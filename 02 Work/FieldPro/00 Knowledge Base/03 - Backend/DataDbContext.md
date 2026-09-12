---
type: component
layer: backend
status: active
technology: "C# .NET 8, EF Core"
updated: 2025-01
tags:
  - system/backend
  - component/service
---

# DataDbContext

## Purpose

`DataDbContext` (`Web/Data/DataDbContext.cs`, 1435 lines) is the **EF Core DbContext** used for reading view-backed models and a select number of table-backed models. It is **not** the primary write path — that is [[DB Service]].

---

## Key Design

- Most entities are mapped to **SQL views** (`ToView("vXxx")`)
- Global query filters enforce **tenant isolation** automatically
- Custom value converters handle JSON extra-data fields and UOM pairs
- UTC date handling via `UtcDateTimeConverter`

---

## Tenant Isolation

```csharp
modelBuilder.Entity<Models.BusinessUnit>()
	.HasQueryFilter(m => m.TenantID == GetTenantIDDbContext());
```

`GetTenantIDDbContext()` resolves the current TenantID from `DataContextTenantProviderService`, which reads from the HTTP context claims. This filter is applied globally — every LINQ query automatically includes `WHERE TenantID = @current_tenant`.

> **Warning:** If you add a new entity to `DataDbContext` without adding a `HasQueryFilter`, it will return data for ALL tenants. Always add the filter.

---

## ApplicationDbContext

`Web/Data/ApplicationDbContext.cs` is a separate, minimal context extending `IdentityDbContext`. It manages:
- ASP.NET Identity users (`AspNetUsers`)
- Roles (`AspNetRoles`)
- Role assignments, claims, tokens

No domain entities are in `ApplicationDbContext`.

---

## Custom Value Converters (`Web/Data/Configurations/`)

| Converter | Purpose |
|---|---|
| `DateTimeListToStringConverter` | Stores `List<DateTime>` as delimited string |
| `ExtraDataCollectionConverter` | Serializes `ExtraData` collection as JSON |
| `UOMFieldValueConverter` | Converts UOM field values |
| `UOMPairValueConverter` | Converts UOM pair objects |
| `TenantModelConfigartionBase` | Base configuration applying tenant filter |

---

## EF Core Collision Risk

> **From project conventions:** When two or more EF entities map to the same table/view, configure explicit linking/ownership before finalizing. When introducing new EF entities, **proactively scan existing model mappings** for the same table/view name and resolve collisions before running.

Runtime EF errors often manifest as "Cannot use the same table for two entity types" or unexpected query shapes. Always check `DataDbContext.OnModelCreating()` before adding new entities.

---

## DEBUG Logging

```csharp
#if DEBUG
optionsBuilder
	.UseLoggerFactory(MyLoggerFactory)
	.EnableSensitiveDataLogging();
#endif
```

EF Core query logging is enabled in DEBUG mode only, writing to the debug output window.

---

## Related

- [[Data Access Pattern]]
- [[Multi-Tenancy]]
- [[DB Service]]
- [[EF Core Multi-Mapping Errors]]
- [[System Architecture]]
