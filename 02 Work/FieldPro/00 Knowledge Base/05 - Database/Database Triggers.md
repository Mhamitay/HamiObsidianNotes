---
type: reference
layer: database
status: active
updated: 2025-01
tags:
  - system/database
  - reference
---

# Database Triggers

## Overview

FieldPro uses ~30 database triggers, primarily for **audit logging**. Every INSERT, UPDATE, or DELETE on a major data table is captured in the corresponding `ta` (audit) table.

---

## Audit Trigger Pattern

```sql
CREATE TRIGGER [dbo].[trg_tJob_Audit]
ON [dbo].[tJob]
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
	SET NOCOUNT ON;
	-- Capture deleted rows
	INSERT INTO taJob (...)
	SELECT 'DELETE', GETUTCDATE(), ...
	FROM deleted;

	-- Capture inserted/updated rows
	INSERT INTO taJob (...)
	SELECT 'INSERT/UPDATE', GETUTCDATE(), ...
	FROM inserted;
END
```

---

## Audit Table Structure

`ta` tables mirror the source `t` table columns plus:
- `AuditAction` — `'INSERT'`, `'UPDATE'`, `'DELETE'`
- `AuditDate` — UTC timestamp of the change
- Source row snapshot at time of change

---

## Business Rule Triggers

Some triggers enforce business rules beyond simple audit logging (e.g., cascading status updates). **TODO: Verify** — catalog any non-audit triggers and their business rules.

---

## Related

- [[Database Overview]]
- [[Core Tables]]
- [[Database Naming Conventions]]
