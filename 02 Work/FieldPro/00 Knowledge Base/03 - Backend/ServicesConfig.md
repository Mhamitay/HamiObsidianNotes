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

# ServicesConfig

## Purpose

`Web/ServicesConfig/` contains **20+ focused DI extension methods** — one per concern. This avoids a bloated `Program.cs` and keeps each registration concern isolated.

---

## Master Orchestrator

`RegisterAllServicesExtension.cs` calls all other extension methods in order:

```
AddLoggingServices()
AddSecretsServices()
AddHttpContextServices()
AddDBContextServices()
AddIdentityServices()
AddClaimsAndTokensServices()
AddMailServices()
AddAuthenticationServices()
AddDevExpressServices()
AddReportingServices()
AddCORSServices()
AddDistributedMemoryCache()
AddSupplyChainSecurityService()
AddSession()
AddResponseCompressionServices()
AddRazorPagesServicesExtension()
AddTelemetryAndApplicaitonInsightExtension()
AddNodeJS()
AddSingleton<LSDQueryService>()
AddSingleton<GeoCodeRequestService>()
AddSingleton<PDFMakeServices.SDRevisionPDFService>()
AddScoped<NotificationService>()
AddFactories()
AddSingleton<IStaticGridConfigurationService>()
```

In production (non-DEBUG), HangFire services are added after.

---

## Key Extension Methods

| File | Key registrations |
|---|---|
| `SecretsServicesExtension.cs` | `Secrets` singleton — connection strings, API keys |
| `DBContextServicesExtension.cs` | `ApplicationDbContext` + `DataDbContext` + `DataContextTenantProviderService` |
| `IdentityServicesExtension.cs` | ASP.NET Identity with custom password/lockout policy |
| `AuthenticationServicesExtension.cs` | Cookie auth + Okta SAML handler |
| `ReportingServicesExtension.cs` | DevExpress reporting, Azure Blob storage provider for reports |
| `TelemetryAndApplicationInsightExtension.cs` | Application Insights telemetry |
| `RazorPagesServicesExtension.cs` | Razor Pages + authorization policies |

---

## NodeJS Integration

`AddNodeJS()` registers `Jering.Javascript.NodeJS` — used by `SDRevisionPDFService` to call the `pdfmake` Node.js library for server-side PDF generation of Service Design revision documents.

In DEBUG, NodeJS debugging can be enabled via `EnableNodeJSDebugging = true` (currently disabled).

---

## Factories

`AddFactories()` registers factory services. **TODO: Verify** — the specific factory types registered.

---

## Grid Configuration

`IStaticGridConfigurationService` / `GridConfigurationService` — manages column definitions for DevExtreme data grids. Registered as singleton.

---

## Related

- [[Web Application]]
- [[Backend Overview]]
- [[Security Overview]]
- [[Background Services]]
- [[DevExpress Integration]]
