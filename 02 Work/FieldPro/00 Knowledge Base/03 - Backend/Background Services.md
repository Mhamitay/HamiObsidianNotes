---
type: component
layer: backend
status: active
technology: "C# .NET 8, HangFire"
updated: 2025-01
tags:
  - system/backend
  - component/service
---

# Background Services

## Overview

FieldPro uses **HangFire** for background job scheduling. HangFire is registered **only in production** (non-DEBUG builds) using conditional compilation.

```csharp
#if !DEBUG
services.AddHangfire(...);
services.AddHangfireServer();
services.AddScoped<IJobScheduler, WeeklyExpiryService>();
services.AddScoped<IJobScheduler, DailyReportService>();
services.AddScoped<IJobScheduler, TenantCurrencyRefreshService>();
#endif
```

---

## HangFire Storage

HangFire uses the **Azure SQL database** for job storage (same connection as the app). Configuration via `appsettings.json` under `Hangfire:SqlServerStorageOptions`. Job history is retained for **30 days**.

---

## Registered Background Jobs

| Service | Interface | Purpose |
|---|---|---|
| `DailyReportService` | `IJobScheduler` | Generates and emails daily operational reports |
| `WeeklyExpiryService` | `IJobScheduler` | Checks for expiring certifications, licenses, documents |
| `TenantCurrencyRefreshService` | `IJobScheduler` | Refreshes foreign exchange rates per tenant |
| `ExecuteDatabaseStoredProcService` | — | Generic SP executor for scheduled DB maintenance |
| `ThemeBuilderService` | — | Rebuilds per-tenant CSS theme assets |
| `JobSchedulerService` | — | Orchestrates job schedule registration |

---

## IJobScheduler Interface

All schedulable background jobs implement `IJobScheduler`. This allows the `JobSchedulerService` to discover and register them on startup.

**TODO: Verify** — the exact schedule configuration (cron expressions, recurrence) per job.

---

## HangFire Dashboard

HangFire provides a built-in management dashboard. Access and visibility may be restricted to admin roles.

**TODO: Verify** — the URL route and authorization policy for the HangFire dashboard.

---

## Debugging Background Jobs

In DEBUG/Development, HangFire is not registered. To test background job logic locally:
1. Extract the business logic from the job service
2. Call it directly from a test controller or console
3. Or temporarily remove the `#if !DEBUG` guard (revert before commit)

See [[HangFire Job Failures]] for troubleshooting.

---

## Related

- [[Web Application]]
- [[ServicesConfig]]
- [[HangFire Job Failures]]
- [[Reporting Feature]]
- [[Integrations Overview]]
