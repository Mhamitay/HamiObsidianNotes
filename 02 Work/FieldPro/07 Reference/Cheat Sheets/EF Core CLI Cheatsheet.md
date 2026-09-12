---
tags: [reference, entity-framework]
---

# EF Core CLI Cheatsheet

```bash
dotnet ef migrations add <Name> --project FieldPro.Data
dotnet ef migrations remove --project FieldPro.Data
dotnet ef database update --project FieldPro.Data
dotnet ef database update <MigrationName> --project FieldPro.Data  # rollback to specific migration
dotnet ef migrations script --idempotent -o deploy.sql --project FieldPro.Data
dotnet ef dbcontext info --project FieldPro.Data
```

Full workflow notes: [[Entity Framework Migrations Workflow]]

#reference #entity-framework
