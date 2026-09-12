---
type: component
layer: backend
status: active
technology: "C# .NET 8"
updated: 2025-01
tags:
  - system/backend
  - component/application
---

# Web Application

## Purpose

The `Web/RiseFSM.csproj` project is the **heart of FieldPro** — it serves the UI, exposes all API endpoints, contains all business logic, and manages all integrations.

## Technology

- ASP.NET Core 8, Razor Pages
- C# 12
- Serilog (structured logging)
- HangFire (background jobs, production only)
- DevExpress (reports + dashboards)

---

## Entry Point — Program.cs

`Web/Program.cs` (300 lines) bootstraps the application:

1. Reads configuration (`appsettings.json` + environment overrides)
2. Configures Serilog logging (with `SendToAdminErrorSink` in production)
3. Calls `builder.Services.RegisterAllServices(builder.Configuration)` — all DI wiring
4. Configures middleware pipeline
5. Registers application lifetime events

---

## Service Registration — ServicesConfig/

All DI registrations are split into **20+ focused extension methods** in `Web/ServicesConfig/`:

| File | Responsibility |
|---|---|
| `RegisterAllServicesExtension.cs` | Master orchestrator — calls all others |
| `AuthenticationServicesExtension.cs` | Cookie auth, Okta SAML |
| `DBContextServicesExtension.cs` | `ApplicationDbContext` + `DataDbContext` |
| `IdentityServicesExtension.cs` | ASP.NET Identity configuration |
| `DevExpressServicesExtension.cs` | DevExpress component registration |
| `ReportingServicesExtension.cs` | DevExpress reports, Azure Blob storage provider |
| `SupplyChainSecurityServiceExtension.cs` | Supply chain security services |
| `TelemetryAndApplicationInsightExtension.cs` | Application Insights |
| `RazorPagesServicesExtension.cs` | Razor Pages pipeline, authorization policies |
| `ResponseCompressionServicesExtension.cs` | Gzip/Brotli compression |

See [[ServicesConfig]].

---

## Razor Pages (`Web/Pages/`)

Page models inherit from `LoggedInTenantPageModel` which:
- Enforces authentication
- Provides `TenantID` and `UserID` to all page handlers
- Handles common error rendering

Pages are **thin** — they serve the HTML shell. Actual data loading is done by Vue components via API calls.

---

## API Controllers (`Web/API/`)

150+ controllers grouped by domain folder:

| Folder | Domain |
|---|---|
| `Jobs/` | Job management |
| `Fleet/` | Vehicle/fleet management |
| `Safety/` | Safety reports, permits, incidents |
| `Sales/` | CRM and sales |
| `SupplyChain/` | Assets, inventory, purchase orders |
| `Shared/` | Cross-cutting: users, tenants, lookups |
| `Reporting/` | Report generation |
| `Quality/` | Quality management |
| `Timesheet/` | Time tracking |
| `User/` | User profile, preferences |

All controllers inherit `APIControllerBase`. See [[API Controllers]].

---

## Domain Classes (`Web/Domain/`)

300+ domain classes implementing business logic. The `Job.cs` class alone is 2356 lines. Pattern:

```csharp
public class Job : DataModelBase
{
	private readonly DB _db;
	private readonly int _tenantID;
	private readonly int _userID;

	public Job(string connectionString, int tenantID, int userID) { ... }
}
```

See [[Domain Classes]].

---

## Background Services (`Web/Services/HangFire/`)

Registered in production only:
- `DailyReportService` — sends daily reports to configured recipients
- `WeeklyExpiryService` — notifies of expiring certifications/documents
- `TenantCurrencyRefreshService` — updates exchange rates per tenant
- `ExecuteDatabaseStoredProcService` — generic SP execution via scheduler
- `ThemeBuilderService` — rebuilds per-tenant theme assets
- `JobSchedulerService` — orchestrates the schedule

See [[Background Services]].

---

## Related

- [[Applications Overview]]
- [[API Controllers]]
- [[Domain Classes]]
- [[DB Service]]
- [[DataDbContext]]
- [[ServicesConfig]]
- [[Background Services]]
- [[Security Overview]]
