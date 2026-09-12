---
type: reference
layer: database
status: active
updated: 2025-01
tags:
  - system/database
  - reference
---

# Core Tables

## Overview

Key tables in the FieldPro database. All tables have `TenantID` for multi-tenant isolation.

---

## tJob

**Purpose:** Core work order — represents a well intervention job.

| Column | Type | Purpose |
|---|---|---|
| `JobID` | INT PK | Surrogate key |
| `TenantID` | INT FK | Tenant isolation |
| `JobNumber` | VARCHAR | Human-readable job identifier |
| `CustomerID` | INT FK → `tCustomer` | Client company |
| `WellID` | INT FK | Well location |
| `StatusID` | INT FK → `tcJobStatus` | Current job status |
| `StartDate` | DATETIME | Planned/actual start |
| `EndDate` | DATETIME | Planned/actual end |
| `CreatedDate` | DATETIME | Record creation |
| `CreatedBy` | INT FK → `tEmployee` | Who created |

**Used by:** [[Jobs Feature]], [[Daily Tickets Feature]], [[Load Out Feature]]

---

## tDailyTicket

**Purpose:** Field billing ticket — daily record of services rendered, attached to a job.

| Column | Type | Purpose |
|---|---|---|
| `DailyTicketID` | INT PK | Surrogate key |
| `TenantID` | INT FK | Tenant isolation |
| `JobID` | INT FK → `tJob` | Parent job |
| `TicketDate` | DATE | Date of service |
| `StatusID` | INT FK → `tcTicketStatus` | Approval status |
| `ApprovedBy` | INT FK | Customer rep approval |

**Used by:** [[Daily Tickets Feature]], [[Reporting Feature]]

---

## tTenant

**Purpose:** Tenant (client company) configuration.

| Column | Type | Purpose |
|---|---|---|
| `TenantID` | INT PK | Surrogate key |
| `TenantKey` | VARCHAR | URL slug (e.g., `xyz`) |
| `TenantName` | VARCHAR | Display name |
| `IsActive` | BIT | Enabled flag |
| `ConnectionString` | VARCHAR | **TODO: Verify** — per-tenant DB or shared |

**Used by:** [[Multi-Tenancy]], [[Security Overview]]

---

## tEmployee

**Purpose:** Staff, crew, and system users.

**Used by:** [[Timesheets Feature]], [[Jobs Feature]], [[Safety Feature]]

---

## tCustomer

**Purpose:** CRM customer/client companies.

**Used by:** [[Sales / CRM Feature]], [[Jobs Feature]]

---

## tAsset

**Purpose:** Physical tools and equipment tracked across jobs.

**Used by:** [[Supply Chain Feature]], [[Load Out Feature]]

---

## tLoadOut

**Purpose:** Equipment dispatch records for jobs.

**Used by:** [[Load Out Feature]]

---

## tServiceDesign

**Purpose:** Pre-job MOC/JSA documentation.

**Used by:** [[Service Design Feature]]

---

## tSafetyIncident

**Purpose:** Safety incident and near-miss reports.

**Used by:** [[Safety Feature]]

---

## tPurchaseOrder

**Purpose:** Supply chain purchase orders.

**Used by:** [[Supply Chain Feature]]

---

## tTimesheet

**Purpose:** Employee time records.

**Used by:** [[Timesheets Feature]]

---

## Audit Tables (ta prefix)

Each major table has a `ta` counterpart (e.g., `taJob`, `taDailyTicket`) that records every INSERT/UPDATE/DELETE via triggers. See [[Database Triggers]].

---

## Related

- [[Database Overview]]
- [[Database Naming Conventions]]
- [[Database Triggers]]
- [[Stored Procedures]]
