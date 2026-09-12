---
type: component
layer: backend
status: active
technology: "C# .NET 8"
updated: 2025-01
tags:
  - system/backend
  - component/controller
---

# API Controllers

## Overview

All interactive data operations are served through **JSON API controllers** consumed by Vue.js components. Controllers are located in `Web/API/` and grouped by domain.

---

## Base Class — `APIControllerBase`

**Location:** `Web/API/Shared/APIControllerBase.cs` (340 lines)

All API controllers inherit `APIControllerBase : ControllerBase`. The base class provides:

| Method | Purpose |
|---|---|
| `HandleException(Exception)` | Logs exception, returns error `JsonResult` |
| `HandleException(ModelStateDictionary)` | Returns model validation errors as `JsonResult` |
| `HandleException(List<string>)` | Returns custom error list as `JsonResult` |
| `HandleInvalidUser(List<string> roles)` | Returns 403-equivalent response |
| `LogUnauthorizedAccessException(Exception)` | Logs + redirects for unauthorized access |
| `LogControllerActionException(Exception)` | Adds model error + returns error result |

The base class holds a reference to `Secrets` (connection strings, API keys).

---

## Controller Organization

```
Web/API/
	Jobs/           # Job lifecycle controllers
	Fleet/          # Vehicles and fleet assets
	Safety/         # Safety reports, incidents, permits, JSAs
	Sales/          # CRM and sales pipeline
	SupplyChain/    # Assets, inventory, purchase orders, products
	Shared/         # Users, tenants, lookups, configuration
	Reporting/      # Report requests and delivery
	Quality/        # QA/QC management
	Timesheet/      # Time tracking
	User/           # User profile and preferences
	Offline/        # Offline sync endpoints
```

---

## Controller Pattern

A typical controller:

```csharp
[Route("api/[controller]")]
[ApiController]
[Authorize]
public class JobController : APIControllerBase
{
	public JobController(Secrets secrets) : base(secrets) { }

	[HttpGet]
	public IActionResult GetAll()
	{
		try
		{
			var tenantID = User.GetTenantID();
			var userID = User.GetUserID();
			var domain = new Job(_secrets.ConnectionString, tenantID, userID);
			var result = domain.SelectAll();
			return new JsonResult(result);
		}
		catch (Exception e)
		{
			return HandleException(e);
		}
	}
}
```

Key observations:
- `User.GetTenantID()` and `User.GetUserID()` are claim-based extension methods
- Domain class is instantiated per request (not injected via DI)
- `HandleException` is always used in catch blocks
- `Secrets` provides the connection string

---

## Authentication on Controllers

- Most controllers have `[Authorize]` at the class level
- Role-based access uses `[Authorize(Roles = "...")]` or `HandleInvalidUser()` checks
- Some endpoints use `[AllowAnonymous]` for public or offline sync routes

---

## Special: `JobUnauthorizedAcessException`

When a user tries to access a job they don't own, `JobUnauthorizedAcessException` is thrown. The base class catches this specifically and redirects to `~/jobs/index` instead of the access-denied page (less disruptive UX).

---

## CSV Import Error Handling

The base class has special handling for `CsvHelper.TypeConversion.TypeConverterException` — it extracts the column name and type to provide a meaningful error message. This powers bulk CSV import features throughout the app.

---

## Related

- [[Backend Overview]]
- [[Domain Classes]]
- [[DB Service]]
- [[Security Overview]]
- [[Authorization and Roles]]
- [[System Architecture]]
