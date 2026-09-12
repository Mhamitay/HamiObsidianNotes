---
type: architecture
layer: system
status: active
updated: 2025-01
tags:
  - architecture
  - system
---

# System Architecture

## Overview

FieldPro is a **layered, multi-tenant SaaS application** with three physical projects and a clear separation of concerns across presentation, API, domain, data access, and database layers.

```mermaid
flowchart TB
	subgraph Browser["Browser"]
		RazorPages["Razor Pages\n(Server-rendered HTML)"]
		Vue["Vue.js 2 Components\n(ClientLibrary - compiled JS)"]
	end

	subgraph WebServer["ASP.NET Core 8 Web Server (Web/RiseFSM.csproj)"]
		APIControllers["API Controllers\n(Web/API/**)"]
		PageModels["Razor Page Models\n(Web/Pages/**)"]
		DomainClasses["Domain Classes\n(Web/Domain/**)"]
		DBService["DB.cs\n(ADO.NET / Stored Procs)"]
		EFCore["DataDbContext\n(EF Core - views only)"]
		HangFire["HangFire Background Jobs\n(production only)"]
		DevExpress["DevExpress Reports\n& Dashboard"]
	end

	subgraph Data["Data Layer"]
		MSSQL[("Azure SQL\nSQL Server")]
		SPs["Stored Procedures\n(~1000+)"]
		Views["Views\n(v/vr prefix, ~500+)"]
		Tables["Tables\n(t prefix, ~200+)"]
	end

	subgraph External["External Services"]
		AzureBlob["Azure Blob Storage\n(files, reports, logos)"]
		SendGrid["SendGrid\n(email)"]
		Okta["Okta\n(SSO/SAML)"]
		OneSignal["OneSignal\n(push)"]
		AppInsights["Application Insights\n(telemetry)"]
	end

	RazorPages -->|HTTP fetch/axios| APIControllers
	Vue -->|HTTP fetch/axios| APIControllers
	Vue -->|renders in| RazorPages
	APIControllers --> DomainClasses
	PageModels --> DomainClasses
	DomainClasses --> DBService
	DomainClasses --> EFCore
	DBService --> SPs
	EFCore --> Views
	SPs --> Tables
	Views --> Tables
	HangFire --> DomainClasses
	DevExpress --> MSSQL
	APIControllers --> AzureBlob
	APIControllers --> SendGrid
	APIControllers --> Okta
	APIControllers --> OneSignal
	APIControllers --> AppInsights
```

---

## Project Structure

| Project | Path | Role |
|---|---|---|
| Web app | `Web/RiseFSM.csproj` | ASP.NET Core 8 — all server-side code |
| Frontend | `ClientLibrary/ClientLibrary.esproj` | Vue.js 2 + TypeScript SPA components |
| Database | `Database/Database.sqlproj` | SQL Server SSDT — schema, SPs, views |

> The Database project is **excluded from the solution build** by default. Build it separately to validate SQL. See [[Database Project]].

---

## Layer Responsibilities

### Razor Pages (`Web/Pages/`)
- Server-rendered page shells
- Authentication guards via `[Authorize]` attributes
- Page models (`LoggedInTenantPageModel` base class) handle SSR data
- Vue components are mounted inside Razor Page `.cshtml` files

### API Controllers (`Web/API/`)
- JSON REST endpoints consumed by Vue components
- All inherit from `APIControllerBase`
- Grouped by domain: `Jobs/`, `Fleet/`, `Safety/`, `Sales/`, `SupplyChain/`, `Shared/`, `Reporting/`, `Quality/`, `Timesheet/`, `User/`
- See [[API Controllers]]

### Domain Classes (`Web/Domain/`)
- Business logic lives here — **NOT in controllers**
- Each domain class (e.g., `Job.cs`, `DailyTicket.cs`) wraps DB calls and business rules
- Constructed with `connectionString`, `tenantID`, `userID`
- See [[Domain Classes]]

### DB Service (`Web/Services/DB.cs`)
- Thin ADO.NET wrapper over `SqlConnection` + `SqlCommand`
- Executes stored procedures by name using `SqlParameter[]`
- Supports transactions (`Begin()`, `Commit()`, `Rollback()`)
- See [[DB Service]]

### DataDbContext (`Web/Data/DataDbContext.cs`)
- EF Core used **selectively** for views and a few tables
- Global query filters enforce tenant isolation on mapped entities
- Used alongside `DB.cs` — not as a replacement
- See [[DataDbContext]]

### Background Services (`Web/Services/HangFire/`)
- HangFire registered in production only (`#if !DEBUG`)
- Services: `DailyReportService`, `WeeklyExpiryService`, `TenantCurrencyRefreshService`, `ExecuteDatabaseStoredProcService`, `ThemeBuilderService`, `JobSchedulerService`
- See [[Background Services]]

---

## Request Flow (API call)

```mermaid
sequenceDiagram
	participant Vue as Vue.js Component
	participant API as API Controller
	participant Domain as Domain Class
	participant DB as DB.cs
	participant SP as Stored Procedure
	participant SQL as SQL Server

	Vue->>API: HTTP GET/POST (JSON)
	API->>API: Resolve TenantID + UserID from claims
	API->>Domain: new Job(connectionString, tenantID, userID)
	Domain->>DB: ExecuteReader(SP.Job_SelectAll, params)
	DB->>SP: SqlCommand.ExecuteReader()
	SP->>SQL: SELECT ... WHERE TenantID = @TenantID
	SQL-->>SP: ResultSet
	SP-->>DB: SqlDataReader
	DB-->>Domain: SqlDataReader
	Domain-->>API: List<Models.Job>
	API-->>Vue: JsonResult
```

---

## Authentication Flow Summary

1. User navigates to app → Razor Page enforces `[Authorize]`
2. ASP.NET Identity checks cookie session
3. If not authenticated → redirect to login page
4. Optional: Okta SAML SSO for tenants configured with `TenantOkta`
5. On login success → claims principal populated with `TenantID`, `UserID`, roles
6. All subsequent API calls carry cookie (or Bearer token for API routes)

See [[Authentication Flow]] and [[Security Overview]].

---

## Multi-Tenancy Summary

Every DB call passes `@TenantID` parameter. EF Core entities have global query filters. No tenant can access another tenant's data. See [[Multi-Tenancy]].

---

## Offline PWA Summary

Service worker intercepts API calls when offline. Vue components write to IndexedDB. On reconnect, `syncup.ts` pushes pending records. See [[Offline PWA Architecture]].

---

## Related

- [[Data Access Pattern]]
- [[Multi-Tenancy]]
- [[Offline PWA Architecture]]
- [[API Controllers]]
- [[Domain Classes]]
- [[DB Service]]
- [[Background Services]]
- [[Security Overview]]
