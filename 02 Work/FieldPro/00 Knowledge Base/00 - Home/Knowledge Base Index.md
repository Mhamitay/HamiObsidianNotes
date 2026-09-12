---
type: index
status: active
updated: 2025-01
tags:
  - system
  - system/index
---

# Knowledge Base Index

> Complete map of the FieldPro / RiseFSM knowledge base.

---

## 🏠 Start Here

- [[System Overview]] — what the system is, who uses it, main data flow
- [[System Architecture]] — layers, components, request flow
- [[Development Guide]] — prerequisites, local setup, build, deploy

---

## 🏗 Architecture

- [[System Architecture]] — overall architecture and component map
- [[Data Access Pattern]] — DB.cs (ADO.NET/SP) vs EF Core (views)
- [[Multi-Tenancy]] — how tenant isolation works end-to-end
- [[Offline PWA Architecture]] — service worker, IndexedDB, sync
- [[Architecture Decision Records]] — ADR index

---

## 🖥 Applications

- [[Applications Overview]] — the three projects explained
- [[Web Application]] — ASP.NET Core Razor Pages app
- [[Client Library]] — Vue.js 2 TypeScript frontend
- [[Database Project]] — SQL Server SSDT project

---

## ⚙️ Backend

- [[Backend Overview]] — services, controllers, domain pattern
- [[API Controllers]] — controller structure and base class
- [[Domain Classes]] — business logic layer (e.g., Job.cs)
- [[DB Service]] — ADO.NET stored proc wrapper
- [[DataDbContext]] — EF Core context for views
- [[Background Services]] — HangFire jobs
- [[ServicesConfig]] — DI registration overview

---

## 🎨 Frontend

- [[Frontend Overview]] — Vue.js 2 + TypeScript architecture
- [[Vue Components]] — component organization
- [[Offline Sync]] — IndexedDB and sync mechanism
- [[API Client Layer]] — TypeScript API modules

---

## 🗄 Database

- [[Database Overview]] — schema structure, naming conventions
- [[Database Naming Conventions]] — t/v/vr/ta/tc/e prefix guide
- [[Core Tables]] — important table reference
- [[Stored Procedures]] — SP patterns and naming
- [[Views]] — view naming and usage
- [[Database Triggers]] — audit and business rule triggers

---

## 🔌 Integrations

- [[Integrations Overview]]
- [[Azure Blob Storage Integration]]
- [[SendGrid Email Integration]]
- [[Okta SSO Integration]]
- [[OneSignal Push Notifications]]
- [[Application Insights Telemetry]]
- [[DevExpress Integration]]

---

## 🚀 Features

- [[Feature Index]]
- [[Jobs Feature]]
- [[Daily Tickets Feature]]
- [[Load Out Feature]]
- [[Service Design Feature]]
- [[Safety Feature]]
- [[Supply Chain Feature]]
- [[Timesheets Feature]]
- [[Reporting Feature]]
- [[Sales / CRM Feature]]

---

## 🔄 Workflows

- [[Workflow Index]]
- [[Job Lifecycle Workflow]]
- [[Daily Ticket Workflow]]
- [[Load Out Workflow]]
- [[Offline Sync Workflow]]
- [[Authentication Flow]]

---

## 🔐 Security

- [[Security Overview]]
- [[Authentication Flow]]
- [[Authorization and Roles]]
- [[Okta SSO Integration]]

---

## 🧪 Testing

- [[Testing Strategy]]

---

## 🐛 Troubleshooting

- [[Troubleshooting Index]]
- [[EF Core Multi-Mapping Errors]]
- [[Offline Sync Issues]]
- [[HangFire Job Failures]]
- [[DevExpress Report Issues]]

---

## 📋 Decisions

- [[Architecture Decision Records]]
- [[ADR - Stored Procedures over EF Core]]
- [[ADR - Vue.js 2 Frontend Architecture]]
- [[ADR - Multi-Tenant Design]]

---

## 🛠 Development

- [[Development Guide]]
- [[Environment Configuration]]
- [[Build and Deploy]]
