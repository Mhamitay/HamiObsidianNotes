---
type: component
layer: database
status: active
technology: "SQL Server SSDT"
updated: 2025-01
tags:
  - system/database
  - component/application
---

# Database Project

## Overview

`Database/Database.sqlproj` is a **SQL Server Data Tools (SSDT)** project that contains all database schema definitions. It is the authoritative source for the database structure.

---

## Important: Build Separately

> The Database project is **excluded from the default solution build**.
> Always build the Database project separately to validate SQL changes.

To build:
- In Visual Studio: right-click `Database` project → Build
- Via CLI: `msbuild Database/Database.sqlproj`

The solution build (`dotnet build` or building `RiseFSM.sln`) does **not** validate SQL. You must build the Database project explicitly.

---

## Adding New Files

Per project conventions:
> When adding any new files to the database project, **always add them to `Database.sqlproj`**.

SSDT requires explicit file inclusion in the `.sqlproj` file. Files in the `Database/` folder that are not in the project file will not be compiled or deployed.

Steps:
1. Create the SQL file in the correct subfolder (`Tables/`, `Views/`, `StoredProcedures/`, etc.)
2. Right-click the project in Solution Explorer → Add → Existing Item (or it may auto-include)
3. Verify the file appears in `Database.sqlproj`

---

## Pre-Commit Checklist

Before committing database changes:
1. ✅ Only intended SQL files are staged
2. ✅ No accidental duplicate files at the `Database/` root
3. ✅ Each new file is in the correct subfolder
4. ✅ Database project builds successfully
5. ✅ New files are registered in `Database.sqlproj`

---

## Deployment

Database changes are deployed via the Azure DevOps pipeline — not manually published. The SSDT project produces a `.dacpac` that is applied to the Azure SQL database.

See [[Build and Deploy]].

---

## Related

- [[Database Overview]]
- [[Database Naming Conventions]]
- [[Build and Deploy]]
- [[Applications Overview]]
