# SQL Warning Root-Cause Investigation Report

**Generator:** `RiseFSMCodeGen (RiseFSMCodeGen.csproj)`  
**Audit Summary:** ~647 warnings, ~292 affected SQL files  
**Status:** Investigation phase — **NO code modified**

---

# Section 1 — Architecture

## How the Generator Works

The tool is a live-database-driven scaffolding engine. It connects to a real SQL Server database, reads schema metadata from `INFORMATION_SCHEMA`, and generates:

- SQL stored procedures
    
- SQL views
    
- SQL audit tables and triggers
    
- C# model classes
    
- C# domain layer
    
- Razor Pages and controllers
    

## Data Flow

```text
SQL Server (INFORMATION_SCHEMA)
        |
        v
Data.cs --> GetTables() / GetForeignKeyColumns() / GetUniqueColumns() / GetFilterColumns()
        |
        v
Column model
(SQLDataType, CharacterMaximumLength, NumericPrecision,
 NumericScale, IsNullable, Default)
        |
        v
Database.Tables
(List<Table> with List<Column> per table)
        |
        v
ASPNetCoreWeb.Scaffold() --> per-table orchestration
        |
        +--------------------------------------------------------------+
        | StoredProcedures.CreateMultiple(table, view, name)           |
        |   -> SelectAll / SelectAllChanges / SelectAllForList         |
        |   -> SelectOne / Insert / Update / UpdateOrder               |
        |   -> Delete / DeleteByID                                     |
        |   -> uses Utility.Parameter(column) for each column param    |
        |   -> uses Utility.PurgeColumns() to filter system columns   |
        +--------------------------------------------------------------+
        |
        +--------------------------------------------------------------+
        | View.Create(table, name)                                     |
        |   -> explicit SELECT column list (no SELECT *)              |
        |   -> ANSI JOIN ... ON syntax                                |
        +--------------------------------------------------------------+
        |
        +--------------------------------------------------------------+
        | Audit.Create(table, name)                                    |
        |   -> generates ta* audit tables                             |
        |   -> generates AFTER INSERT/UPDATE/DELETE triggers           |
        |   -> uses Utility.GetFullSQLDataType(column)                |
        +--------------------------------------------------------------+
        |
        +--------------------------------------------------------------+
        | DDL.cs -> CreateDDL() / CodeTable()                         |
        |   -> generates CREATE TABLE DDL                             |
        |   -> hardcodes varchar(50) as default column type           |
        |   -> hardcodes [Order] tinyint in code tables (tc*)         |
        +--------------------------------------------------------------+
        |
        +--------------------------------------------------------------+
        | Domain.Create() / Model.Create() / Controllers / Pages      |
        |   -> C# code, does not produce SQL warnings directly        |
        +--------------------------------------------------------------+
```

## Where SQL Types Are Determined

### Primary Type Authority

**Method:** `Utility.GetFullSQLDataType(Column column)`  
**File:** `Domain\Utility.cs`, lines 336–354

```csharp
public static string GetFullSQLDataType(Column column)
{
    string x = column.SQLDataType;  // raw string from INFORMATION_SCHEMA

    switch (column.SQLDataType)
    {
        case varchar / nvarchar / char / nchar:
            x = $"{x}({column.CharacterMaximumLengthString})";
            break;

        case decimal_:
            x = $"{x}({column.NumericPrecision},{column.NumericScale})";
            break;

        // ALL OTHER TYPES:
        // x = column.SQLDataType, no modification
    }

    return x;
}
```

And `Utility.Parameter(Column column)` at lines 329–334:

```csharp
public static string Parameter(Column column)
{
    string fullSQLDataType = GetFullSQLDataType(column);
    return $"@{column.Name} {fullSQLDataType}";
}
```

This is the foundational type-preservation mechanism for **all stored procedure parameters**. Its fidelity directly determines whether type-mismatch warnings are produced.

## What the Generator Does Not Produce

The generator does **not** produce:

- `SELECT *` anywhere
    
- Old-style comma-separated JOIN syntax
    
- Explicit `CAST` or `CONVERT`
    
- `FLOOR`, `YEAR`, `MONTH`, `LEN`, or `ISNULL` in `WHERE` predicates
    
- Date predicate filtering
    

---

# Section 2 — Warning Root-Cause Summary

| RC #     | Root Cause                                           | Warning Type          | Generator Source                                  |  Count | Risk          | Confidence |
| -------- | ---------------------------------------------------- | --------------------- | ------------------------------------------------- | -----: | ------------- | ---------- |
| **RC-1** | `@Addend` smallint receives int literal `1/-1`       | Int → SmallInt        | `StoredProcedures.cs` lines 591, 615–616, 626–627 |    ~25 | Potential     | High       |
| **RC-2** | `SET [Order]=@NewOrder` (int) when column is tinyint | Int → TinyInt         | `StoredProcedures.cs` lines 635, 638, 641–642     |  1–2/t | Potential     | High       |
| **RC-3** | `[Order]+@Addend` (tinyint + smallint → int)         | Int → TinyInt         | `StoredProcedures.cs` line 631                    |    1/t | Potential     | High       |
| **RC-4** | `ISNULL(@NVarCharCol,'')` — no `N''` prefix          | NVarChar → VarChar    | `StoredProcedures.cs` line 505                    |    ~10 | Potential     | High       |
| **RC-5** | `[Order] tinyint` hardcoded in `tc*` DDL             | TinyInt schema        | `DDL.cs` line 384                                 | Schema | Potential     | High       |
| **RC-6** | `(short)reader["ID"]` cast on int IDENTITY column    | C# overflow bug       | `Domain.cs` line 387                              |      1 | **Confirmed** | High       |
| **RC-7** | High-warning files do not match generator output     | All categories        | Not this generator                                |  ~600+ | Separate      | High       |
| **RC-8** | `varchar(50)` default in DDL generator               | Short String/NVarChar | `DDL.cs` lines 207, 278, 383                      |    DDL | Potential     | Medium     |

> **Note:** `/t` = per table with `IsOrder=true`.

---

# Section 3 — Detailed Root-Cause Analysis

## RC-1: `@Addend` Smallint Receives Int Literal in UpdateOrder Template

### Generated SQL

Every `*_UpdateOrder.sql` contains:

```sql
CREATE PROCEDURE [dbo].[JobSafetyAnalysisStep_UpdateOrder]
    @TenantID int,
    @UserID int,
    @ID int,
    @RowVersion rowversion,
    @JobID int,
    @Direction bit
AS
BEGIN
    DECLARE @Order int;
    DECLARE @MaxOrder int;
    DECLARE @Addend smallint;
    DECLARE @NewOrder int;
    ...
    SET @Addend = 1;
    ...
    SET @Addend = -1;
```

### Warning

`SR0007` or equivalent:

> Implicit narrowing conversion from `int` (literal `1/-1`) to `smallint`.

### Generator Source

`StoredProcedures.cs`, lines 591, 615–616, 626–627:

```csharp
sb.AppendLine("    DECLARE @Addend smallint;");
```

```csharp
sb.AppendLine("        SET @Addend = 1;");
```

```csharp
sb.AppendLine("        SET @Addend = -1;");
```

### Relevant C# Logic

The `UpdateOrder` method is a fixed hardcoded template. It does **not** read the actual type of the `[Order]` column from the `Table` metadata.

`@Addend` is always declared as `smallint`, regardless of the actual `[Order]` column type in the database.

### Metadata Source

**None.**

This is a hardcoded SQL template and is not driven by `Column.SQLDataType`.

### Root Cause

The `UpdateOrder` generator hardcodes:

```sql
DECLARE @Addend smallint;
```

without consulting the actual data type of the `[Order]` column.

The integer literals `1` and `-1` are typed as `int` by SQL Server, causing an implicit narrowing conversion to `smallint`.

### Risk

The values `1` and `-1` fit safely inside the `smallint` range:

```text
-32,768 to 32,767
```

Therefore, data loss cannot actually occur with these specific values.

However, the warning is technically valid.

### Classification

**FALSE POSITIVE / TOOL LIMITATION**

The values fit safely in `smallint`, but the variable is unnecessarily narrow.

### Potential Generator-Level Fix

Change:

```sql
DECLARE @Addend smallint;
```

to:

```sql
DECLARE @Addend int;
```

in `StoredProcedures.cs`.

This eliminates both:

```sql
SET @Addend = 1;
SET @Addend = -1;
```

warnings with no semantic change.

### Estimated Warning Reduction

**~25 warnings**

Approximately two warnings per `UpdateOrder`-generated procedure for every table where:

```text
table.IsOrder == true
```

### Affected Generated Objects

Every `*_UpdateOrder.sql` file, including:

- `JobSafetyAnalysisStep_UpdateOrder.sql`
    
- `FormalHazardAssessmentHazard_UpdateOrder.sql`
    
- Every other table where `table.IsOrder == true`
    

---

## RC-2 & RC-3: `SET [Order] = @NewOrder` and Arithmetic with TinyInt Column

### Generated SQL

```sql
UPDATE [dbo].[tJobSafetyAnalysisStep]
   SET [Order] = [Order] + @Addend
      ,[UserID] = @UserID
 WHERE [TenantID] = @TenantID
   AND [JobID] = @JobID
   AND [Order] = @NewOrder;
```

And:

```sql
UPDATE [dbo].[tJobSafetyAnalysisStep]
   SET [Order] = @NewOrder
```

### Warning

Implicit:

```text
Int -> TinyInt
```

conversion.

### Generator Source

`StoredProcedures.cs`, lines 630–635 and 637–642:

```csharp
sb.AppendLine("      SET [Order] = [Order] + @Addend");
```

```csharp
sb.AppendLine("      AND [Order] = @NewOrder;");
```

```csharp
sb.AppendLine("      SET [Order] = @NewOrder");
```

### Relevant C# Logic

The `UpdateOrder` template never reads the actual type of `[Order]` from table metadata.

`@NewOrder` is always declared as `int`.

If the target table's `[Order]` column is `tinyint`, SQL Server warns about:

- assigning `int` to `tinyint`
    
- comparing `tinyint` to `int`
    
- arithmetic involving `tinyint` and the hardcoded `@Addend` type
    

### Metadata Source

**None.**

`UpdateOrder` is entirely hardcoded and does not inspect:

```csharp
table.Columns
```

for the `[Order]` column type.

### Root Cause

The `UpdateOrder` template assumes `[Order]` is `int` everywhere.

However:

- the DDL generator creates `[Order]` as `tinyint` in code tables
    
- some `t*` tables may also have `[Order]` as `tinyint`
    

This creates implicit conversion warnings.

### Risk

`tinyint` has a maximum value of:

```text
255
```

If order values exceed 255 at runtime, overflow can occur.

For typical ordering lists this may be unlikely, but it is still architecturally fragile.

### Classification

**POTENTIAL RISK**

For tables where `[Order]` is `tinyint`, assigning `@NewOrder` (`int`) creates an implicit narrowing conversion.

### Potential Generator-Level Fix

In `UpdateOrder()`:

1. Look up the `[Order]` column from `table.Columns`.
    
2. Determine its actual SQL type.
    
3. Declare `@Addend` using that type where appropriate.
    
4. Declare `@NewOrder` using the appropriate type.
    

For example, if `[Order]` is `tinyint`:

```sql
DECLARE @Addend tinyint;
DECLARE @NewOrder tinyint;
```

If `[Order]` is `int`:

```sql
DECLARE @Addend int;
DECLARE @NewOrder int;
```

### Estimated Warning Reduction

**~3–10 warnings per affected `UpdateOrder` procedure**

### Affected Objects

All `*_UpdateOrder.sql` files for tables where:

```text
[Order] is tinyint
```

---

## RC-4: `ISNULL(@NVarCharColumn, column.Default)` — Missing `N''` Prefix

### Generated SQL

Example:

```sql
UPDATE [dbo].[tSomeTable]
   SET [SomeNVarCharColumn] = ISNULL(@SomeNVarCharColumn, '')
```

The `''` literal is a `varchar` literal while the target column is `nvarchar`.

### Warning

Implicit conversion:

```text
NVarChar -> VarChar
```

or:

```text
VarChar -> NVarChar
```

depending on the SSDT rule and expression context.

Typical rule:

```text
SR0010 or equivalent
```

### Generator Source

`StoredProcedures.cs`, lines 503–506:

```csharp
if (column.Default.Length > 0 && column.IsNullable == false)
{
    value = $"ISNULL({value},{column.Default})";
}
```

### Relevant C# Logic

The `Update` method applies `ISNULL()` wrapping when a column has a non-empty default value.

The default comes directly from:

```text
INFORMATION_SCHEMA.COLUMNS.COLUMN_DEFAULT
```

and is used verbatim.

`INFORMATION_SCHEMA` may return defaults as raw SQL text such as:

```sql
('')
('N')
((0))
```

For `nvarchar` columns, the generator can therefore emit:

```sql
ISNULL(@Column, '')
```

instead of:

```sql
ISNULL(@Column, N'')
```

### Metadata Source

```text
column.Default
```

from:

```text
INFORMATION_SCHEMA.COLUMNS.COLUMN_DEFAULT
```

Read in `Data.cs`, line 65.

### Root Cause

The generator does not inspect:

```csharp
column.SQLDataType
```

when emitting the default value inside `ISNULL()`.

For `nvarchar` columns, the default string literal should be Unicode-compatible.

### Risk

For an empty-string default:

```sql
''
```

SQL Server safely widens the value to `nvarchar`.

However, for non-ASCII defaults, the `varchar` literal can lose Unicode data.

For common defaults such as:

```sql
''
'N'
'Y'
```

the practical risk is low, but the generated SQL is technically incorrect.

### Classification

**POTENTIAL RISK**

Safe for ASCII-only defaults, but technically incorrect for Unicode defaults.

### Potential Generator-Level Fix

When:

```csharp
column.SQLDataType == "nvarchar"
```

ensure the default literal receives the Unicode prefix.

For example:

```sql
ISNULL(@Col, N'')
```

instead of:

```sql
ISNULL(@Col, '')
```

### Estimated Warning Reduction

**~10 warnings**

This matches the audit count of approximately 10 `NVarChar -> VarChar` warnings.

### Affected Objects

All `*_Update.sql` files containing `nvarchar` columns with defaults.

---

## RC-5: Hardcoded `[Order] tinyint` in DDL-Generated Code Table Schema

### Generated DDL

Generated by `CodeTable()` in `DDL.cs`:

```sql
CREATE TABLE [dbo].[tcSomething](
    [ID] int IDENTITY(0,1) NOT NULL,
    [TenantID] int NOT NULL,
    [UserID] int NOT NULL,
    [RowVersion] rowversion NOT NULL,
    [Name] varchar(50) NOT NULL,
    [Order] tinyint NOT NULL,
    ...
)
```

### Generator Source

`DDL.cs`, line 384:

```csharp
_codeTables.AppendLine("    [Order] tinyint NOT NULL,");
```

### Relevant C# Logic

Every code table (`tc*`) generated by `DDL.cs` receives:

```sql
[Order] tinyint
```

This is a design-level decision embedded in the DDL generator.

### Metadata Source

**None.**

The type is hardcoded.

### Root Cause

Every code table receives `tinyint` for `[Order]`, regardless of the number of rows expected.

This creates the schema-level type mismatch that `UpdateOrder` subsequently encounters when it uses `int` variables for `@NewOrder`.

### Risk

`tinyint` has a maximum value of:

```text
255
```

If a code table grows beyond 255 ordered rows, overflow becomes possible.

This is unlikely for many code tables but is architecturally fragile.

### Classification

**POTENTIAL RISK**

### Potential Generator-Level Fix

Consider changing:

```sql
[Order] tinyint NOT NULL
```

to either:

```sql
[Order] smallint NOT NULL
```

or:

```sql
[Order] int NOT NULL
```

This is a **schema-level change** and requires migration.

---

## RC-6: `(short)reader["ID"]` Hardcoded Cast — Confirmed Bug

### Generated C# Code

Example from `Domain.cs`:

```csharp
model = new Models.Job
{
    ID = (short)reader["ID"],
    JobStatusName = (string)reader["JobStatusName"],
    ...
};
```

### Warning / Problem

This is a **C# runtime bug**, not a SQL static-analysis warning.

The database ID is an `int` IDENTITY.

When the ID exceeds:

```text
32,767
```

the cast to `short` can throw:

```text
OverflowException
```

### Generator Source

`Domain.cs`, lines 385–392.

The problematic generated code is:

```csharp
(short)reader["ID"]
```

### Relevant C# Logic

The `ID` column is defined as:

```sql
int IDENTITY(1,1) NOT NULL
```

in `DDL.cs`, line 103.

The generator correctly uses `int` elsewhere.

Only this hardcoded method uses `short`.

### Metadata Source

**None.**

This method is fully hardcoded and does not use column metadata.

### Root Cause

A hardcoded:

```csharp
(short)
```

cast is applied to an `int IDENTITY` column.

The method bypasses the type-driven code-generation path.

### Risk

**CONFIRMED BUG / REAL RISK**

Once production IDs exceed 32,767, the application can encounter:

```text
OverflowException
```

### Classification

**CONFIRMED BUG / REAL RISK**

This is the highest-risk finding in the entire generator investigation.

### Dependencies / Callers

Potentially affected:

- Application code calling the generated `Job.SelectOneSimple(int id)` method
    
- Any service that reads `model.ID` after this call
    
- Any workflow that retrieves jobs with IDs above 32,767
    

### Potential Generator-Level Fix

Change:

```csharp
(short)reader["ID"]
```

to:

```csharp
(int)reader["ID"]
```

in `Domain.cs`, line 387.

### Estimated SQL Warning Reduction

**0 SQL warnings**

However, this eliminates a confirmed runtime defect.

---

## RC-7: High-Warning Files Are Not Generator Output

### Key Observation

The generator output naming convention is:

```text
{EntityNameSansPrefix}_{Verb}.sql
```

Valid verbs are:

```text
SelectAll
SelectAll_Changes
SelectAllForList
SelectOne
Insert
Update
UpdateOrder
Delete
DeleteByID
```

### Comparison

|File|Matches Generator?|Evidence|
|---|---|---|
|`Tenant_Populate_Imperial.sql`|**No**|`Populate_Imperial` is not a generator verb|
|`AssetHistoryReportData_Imperial_Refresh_New.sql`|**No**|`Imperial_Refresh_New` is not a generator verb|
|`InventoryItemAccounting_OnJobStatusUpdated.sql`|**No**|`OnJobStatusUpdated` is not a generator verb|
|`JobSafetyAnalysisStep_UpdateOrder.sql`|**Yes**|Matches `{Entity}_UpdateOrder`|
|`FormalHazardAssessmentHazard_UpdateOrder.sql`|**Yes**|Matches `{Entity}_UpdateOrder`|

### Conclusion

This is the **single most important finding** of the investigation.

The majority of the ~647 warnings — including most:

- `Int -> TinyInt`
    
- `SELECT *`
    
- `FLOOR/YEAR/MONTH/LEN` in predicates
    
- old-style JOIN syntax
    
- `String -> Numeric`
    
- `Float -> Decimal`
    
- `DateTime -> Date`
    

are concentrated in **manually written SQL files that this generator did not produce**.

The generator is responsible for a relatively small subset of the total warning count, primarily through the `UpdateOrder` template and the `ISNULL` default handling.

---

## RC-8: `varchar(50)` Default in DDL Generator

### Generated DDL

Examples:

```sql
[SomeColumn] varchar(50) NOT NULL
```

and:

```sql
[Name] varchar(50) NOT NULL
```

### Generator Source

`DDL.cs`, lines 207 and 278:

```csharp
string dataType = "varchar(50)"; // default data type
```

And line 383:

```csharp
_codeTables.AppendLine("    [Name] varchar(50) NOT NULL,");
```

### Root Cause

If no explicit type is specified for a column in the input text/JSON definition, the DDL generator defaults to:

```sql
varchar(50)
```

Additionally, `[Name]` in all code tables is hardcoded as:

```sql
varchar(50)
```

rather than:

```sql
nvarchar(...)
```

### Risk

If the application stores Unicode data, this can result in:

- Unicode data loss
    
- data corruption
    
- insufficient string length
    

For field-service management systems operating exclusively with English data, the probability is lower, but the architecture is still unnecessarily restrictive.

### Classification

**POTENTIAL RISK**

### Potential Generator-Level Fix

Consider changing the default to:

```sql
nvarchar(100)
```

or, preferably, making the default configurable.

Also consider changing:

```sql
[Name] varchar(50)
```

to:

```sql
[Name] nvarchar(100)
```

### Affected Objects

All tables and code tables generated by `DDL.cs` without an explicit string type.

---

# Section 4 — Root-Cause Analysis: Systemic Patterns

## Systemic Pattern A: `UpdateOrder` Is a Fixed-Template Generator, Not Metadata-Driven

All other stored procedure generators such as:

- `Insert`
    
- `Update`
    
- `SelectAll`
    
- `SelectOne`
    
- `Delete`
    

use:

```csharp
Utility.Parameter(column)
```

which reads the actual type from:

```csharp
Column.SQLDataType
```

However, `UpdateOrder` is entirely hardcoded.

It does **not** read the `[Order]` column type from metadata.

### Impact

This is the systemic source of the type-related `UpdateOrder` warnings.

### Recommended Direction

One focused fix in:

```text
StoredProcedures.UpdateOrder()
```

could eliminate approximately:

```text
~25–30 generator-caused type warnings
```

---

## Systemic Pattern B: `INFORMATION_SCHEMA` Default Used Verbatim Without Type Transformation

The `column.Default` value comes directly from:

```text
INFORMATION_SCHEMA.COLUMNS.COLUMN_DEFAULT
```

and is inserted into the generated SQL verbatim.

No type-aware transformation occurs.

For `nvarchar` columns, this can result in:

```sql
ISNULL(@Column, '')
```

instead of:

```sql
ISNULL(@Column, N'')
```

### Impact

One targeted fix in:

```text
StoredProcedures.Update()
```

could eliminate approximately:

```text
~10 NVarChar -> VarChar warnings
```

---

## Systemic Pattern C: DDL Generator Uses `varchar` for Default and Name Columns

The DDL generator:

- defaults unspecified string columns to `varchar(50)`
    
- hardcodes `[Name] varchar(50)` in code tables
    

### Impact

This can cause Unicode limitations across generated schemas.

---

## Systemic Pattern D: Most Warnings Are in Manually Written SQL

The generator does **not** produce:

- `SELECT *`
    
- old-style JOIN syntax
    
- function-in-predicate `WHERE` clauses
    
- `CAST` / `CONVERT` expressions
    
- `FLOOR`
    
- `YEAR`
    
- `MONTH`
    
- `LEN` in predicates
    

Therefore, these warning categories must be investigated separately.

---

# Section 5 — Warnings Not Caused by This Generator

The following warning categories and files are **not attributable to this code generator**:

|Warning Category|Evidence It Is Not From the Generator|
|---|---|
|`SELECT *` usage|Generator explicitly enumerates all columns|
|Old-style JOIN (`FROM A, B WHERE A.ID=B.ID`)|`View.cs` uses ANSI `JOIN ... ON` exclusively|
|`FLOOR/YEAR/MONTH/LEN/ISNULL` in `WHERE`|Generator produces no function-in-predicate expressions|
|String → Numeric / Numeric → String|Generator produces no `CAST` / `CONVERT`|
|Float → Decimal conversions|Generator preserves exact column types|
|DateTime → Date truncation|Generator produces no date predicates|
|Boolean conversions beyond `@Direction bit`|Generator does not produce other Boolean conversions|
|All warnings in `Tenant_Populate_Imperial.sql`|Naming pattern indicates manually maintained SQL|
|All warnings in `AssetHistoryReportData_Imperial_Refresh_New.sql`|Naming pattern indicates manually maintained SQL|
|All warnings in `InventoryItemAccounting_OnJobStatusUpdated.sql`|Naming pattern indicates manually maintained SQL|
|Most of the 79 `Int -> TinyInt` occurrences|`UpdateOrder` accounts for only a small fraction|

These warnings require direct inspection and remediation of the manually maintained SQL files in the database project.

That is a **separate repository / investigation track**.

---

# Section 6 — Recommended Fix Plan

## P1 — High Risk: Confirmed Bug

|Fix #|Generator File|Method|Problem|Warnings Eliminated|Risk of Change|Tests Required|
|---|---|---|---|---|---|---|
|**F-1**|`Domain.cs`|`SelectOneSimpleJob()`|`(short)reader["ID"]` casts `int` to `short`, causing `OverflowException` when job ID > 32,767|0 SQL warnings; fixes C# runtime bug|**Low**|Test with ID > 32,767 and verify no `OverflowException`|

---

## P2 — Medium Risk: High-Impact Generator Fixes

|Fix #|Generator File|Method|Problem|Warnings Eliminated|Risk of Change|Tests Required|
|---|---|---|---|---|---|---|
|**F-2**|`StoredProcedures.cs`|`UpdateOrder()`|`DECLARE @Addend smallint`; should be `int` because literals `1/-1` are `int`|~25 `Int -> SmallInt`|**Very Low** — semantic equivalent|Compare before/after generated SQL; run SSDT analysis; verify order logic|
|**F-3**|`StoredProcedures.cs`|`UpdateOrder()`|`@NewOrder` / `@Addend` should match actual `[Order]` column type|~3–10 `Int -> TinyInt`|**Low**|Run `UpdateOrder` for tinyint and int `[Order]` tables; verify boundary values|
|**F-4**|`StoredProcedures.cs`|`Update()`|`ISNULL(@Col, default)` uses varchar literal for `nvarchar` columns|~10 `NVarChar -> VarChar`|**Low**|Compare generated procedures; test defaults including Unicode|

---

## P3 — Low Priority: Cleanup and Schema Improvements

| Fix #   | Generator File | Method                         | Problem                                                              | Risk of Change | Notes                                                        |
| ------- | -------------- | ------------------------------ | -------------------------------------------------------------------- | -------------- | ------------------------------------------------------------ |
| **F-5** | `DDL.cs`       | `CodeTable()`                  | `[Order] tinyint` hardcoded; consider `smallint` or `int`            | **Medium**     | Schema change requires migration and FK/reference validation |
| **F-6** | `DDL.cs`       | `DoColumns()` / `DoColumns2()` | `varchar(50)` default; consider `nvarchar(50)` or configurable value | **Medium**     | Requires migration for existing tables                       |
| **F-7** | `DDL.cs`       | `CodeTable()`                  | `[Name] varchar(50)`; consider `nvarchar(100)`                       | **Medium**     | Same considerations as F-6                                   |

---

# Section 7 — Test Strategy

## Phase 1 — Baseline Capture

**Before making any changes:**

1. Run the generator against the current database.
    
2. Use a representative set of tables, including at least:
    
    - One table with `IsOrder = true`, such as `tJobSafetyAnalysisStep`
        
    - One table with an `nvarchar` column that has a default
        
    - One table with `datetime` and `date` columns
        
3. Save **all generated SQL files** to:
    

```text
baseline/
```

4. Run SSDT static analysis against the baseline output.
    
5. Record exact warning counts by rule ID.
    

---

# Phase 2 — Apply Generator Fixes One at a Time

For each fix, **F-2 through F-4**:

1. Apply only the single generator change.
    
2. Regenerate SQL for the same representative tables.
    
3. Save the generated output to:
    

```text
after-fix-N/
```

4. Diff:
    

```text
baseline/
```

against:

```text
after-fix-N/
```

5. Confirm that **only the intended SQL changed**.
    
6. Confirm that no unrelated stored procedures changed.
    
7. Re-run SSDT static analysis.
    
8. Verify that the specific warning count decreased.
    
9. Verify that warning counts for unrelated categories did not change.
    

---

# Phase 3 — Semantic Validation

## F-2 — `@Addend smallint -> int`

- Deploy the new stored procedure to a test database.
    
- Execute `UpdateOrder` with direction **up**.
    
- Execute `UpdateOrder` with direction **down**.
    
- Verify `[Order]` values change correctly.
    
- Verify boundary conditions:
    
    - first item moving up
        
    - last item moving down
        

---

## F-3 — Metadata-Driven `UpdateOrder` Types

- Deploy to a test database.
    
- Execute against a table where `[Order]` is `tinyint`.
    
- Confirm there is no overflow.
    
- Execute against a table where `[Order]` is `int`.
    
- Confirm behavior is identical to the existing implementation.
    

---

## F-4 — `ISNULL` `nvarchar` Default Fix

- Insert/update a row with `NULL` for the affected column using the generated `Update` procedure.
    
- Verify the default value is applied correctly.
    
- Test ASCII default values.
    
- If applicable, test non-ASCII / Unicode default values.
    
- Verify no Unicode data is lost or corrupted.
    

---

# Phase 4 — Full SSDT Re-Analysis

After all approved generator fixes have been implemented:

1. Regenerate all stored procedures.
    
2. Deploy to a test SQL Server database project.
    
3. Run full SSDT static analysis.
    
4. Compare before/after warning counts by rule ID.
    
5. Confirm the expected reduction in:
    
    - `Int -> SmallInt`
        
    - `NVarChar -> VarChar`
        
    - applicable `Int -> TinyInt`
        
6. Identify any remaining generator-attributable warnings.
    
7. Create a second investigation round if necessary.
    

---

# Phase 5 — Manual SQL Investigation

The majority of the ~647 warnings — particularly:

- the 79 `Int -> TinyInt` occurrences
    
- all warnings in `Tenant_Populate_Imperial.sql`
    
- all warnings in `AssetHistoryReportData_Imperial_Refresh_New.sql`
    
- all warnings in `InventoryItemAccounting_OnJobStatusUpdated.sql`
    

require a **separate investigation** of the manually maintained SQL files.

This investigation is independent of the C# generator.

The manual SQL should be analyzed directly against the database-project repository.

---

# Section 8 — Key Takeaways

## 1. The Generator Is Responsible for a Small, Well-Defined Subset of Warnings

The primary generator-caused warnings come from:

- the hardcoded `UpdateOrder` template:
    
    - `Int -> SmallInt`
        
    - `Int -> TinyInt`
        
- the `Update` `ISNULL` pattern:
    
    - `NVarChar -> VarChar`
        

---

## 2. Three Targeted Generator Fixes Should Eliminate ~35–40 Warnings

The highest-value generator fixes are:

```text
F-2  UpdateOrder @Addend smallint -> int
F-3  UpdateOrder metadata-driven [Order] type
F-4  Update nvarchar default -> Unicode literal
```

Together these should eliminate approximately:

```text
~35–40 warnings
```

across generated stored procedures.

---

## 3. One Confirmed C# Runtime Bug Exists

### F-1

```csharp
(short)reader["ID"]
```

inside:

```text
SelectOneSimpleJob()
```

can cause:

```text
OverflowException
```

once job IDs exceed:

```text
32,767
```

This should be treated as **P1**, regardless of the SQL warning count.

---

## 4. The Overwhelming Majority of the ~647 Warnings Are Not Generated by This Tool

Most warnings originate from manually maintained SQL.

These files require a separate investigation of the database-project repository.

The generator should **not** be modified to fix warnings it does not produce.

---

## 5. The Generator Architecture Is Fundamentally Sound for Type Preservation

`Utility.GetFullSQLDataType()` correctly reads exact SQL types from `INFORMATION_SCHEMA` for:

- `varchar`
    
- `nvarchar`
    
- `char`
    
- `nchar`
    
- `decimal`
    
- and other SQL types
    

The primary generator-level defects are concentrated in:

1. The hardcoded `UpdateOrder` template
    
2. The untransformed `ISNULL` default literal
    
3. A hardcoded C# cast in `SelectOneSimpleJob()`
    
4. Some DDL design decisions around string and ordering types
    

---

# Appendix A — Files Investigated

|File|Lines|Role|
|---|--:|---|
|`Domain\StoredProcedures.cs`|740|Primary SQL generator|
|`Domain\Utility.cs`|490|Type mapping, parameter generation|
|`Domain\View.cs`|145|View generator|
|`Domain\Audit.cs`|133|Audit table and trigger generator|
|`Domain\DDL.cs`|472|DDL schema generator|
|`Domain\Domain.cs`|773|C# domain layer generator|
|`Domain\ASPNetCoreWeb.cs`|293|Orchestration entry point|
|`Domain\Data.cs`|333|`INFORMATION_SCHEMA` data reader|
|`Domain\Model.cs`|358|C# model generator|
|`Domain\Const.cs`|152|SQL type constants|
|`Models\Column.cs`|52|Column metadata model|
|`Models\Table.cs`|28|Table metadata model|
|`Models\Database.cs`|35|Static database registry|
|`Program.cs`|59|Entry point|

---

# Appendix B — Generator-to-SQL Filename Mapping

## Generated Filename Pattern

```text
{EntitySansPrefix}_{Verb}.sql
```

## Valid Verbs

From:

```text
Const.StoredProcedureVerb
```

the valid verbs are:

```text
SelectAll
SelectAll_Changes
SelectAllForList
SelectOne
Insert
Update
UpdateOrder
Delete
DeleteByID
```

## Example Generator Output

```text
JobSafetyAnalysisStep_SelectAll.sql
JobSafetyAnalysisStep_Update.sql
JobSafetyAnalysisStep_UpdateOrder.sql
FormalHazardAssessmentHazard_UpdateOrder.sql
```

The following file is therefore confirmed as generator output:

```text
JobSafetyAnalysisStep_UpdateOrder.sql
```

and is affected by:

```text
RC-1
RC-2
RC-3
```

Likewise:

```text
FormalHazardAssessmentHazard_UpdateOrder.sql
```

is confirmed generator output and is affected by:

```text
RC-1
RC-2
RC-3
```

## Files Not Following the Generator Pattern

```text
Tenant_Populate_Imperial.sql
AssetHistoryReportData_Imperial_Refresh_New.sql
InventoryItemAccounting_OnJobStatusUpdated.sql
```

These do **not** match the generator's known filename pattern and therefore are classified as manually maintained SQL.

---

# Final Status

**Investigation complete.**

No generator or SQL files have been modified.

### Recommended next step

Implement the fixes in this order:

```text
1. F-1 — Fix confirmed (short) -> (int) runtime bug
2. F-2 — Change @Addend smallint -> int
3. F-3 — Make UpdateOrder type-aware
4. F-4 — Make nvarchar defaults Unicode-aware
5. Re-run full SSDT analysis
6. Separately investigate manually written SQL warnings
```

**Approval is required before implementing any fixes.**