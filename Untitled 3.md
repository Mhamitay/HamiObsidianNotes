# SQL Build / SSDT Warning Prevention Rules

## Purpose

This document defines the SQL coding and generator rules we will follow going forward to prevent SSDT build warnings, particularly:

- SR0014 — Data Loss / Unsafe Conversion
- SR0001 — `SELECT *`
- SR0015 — Non-SARGable Function Usage
- SR0006 — Predicate / Table Scan Risk
- SR0010 — Old-Style JOIN Syntax
- SR0009 — Short String Type Usage

The primary goal is to make generated SQL consistent with the underlying database and application metadata, while avoiding implicit conversions, data loss, schema fragility, and unnecessary performance issues.

---

# 1. Use Database Metadata as the Source of Truth

All generated SQL parameter, variable, and column types must be based on the actual database/application metadata.

The generator must not make assumptions about a type for convenience or storage optimization.

### Rules

- Preserve the source SQL type, length, precision, scale, and nullability.
- Do not automatically downsize a type.
- Do not change Unicode types to non-Unicode types.
- Do not infer a smaller type simply because current data happens to fit.
- Any intentional type difference must be explicitly defined and justified.

### Example

If the database column is `INT`, the generated parameter should also be `INT`, rather than `TINYINT` or `SMALLINT`.

---

## 2. Preserve Unicode Strings

C# `string` values and SQL columns that support Unicode should use `NVARCHAR` unless the field is explicitly designed to contain ANSI-only data.

### `VARCHAR` vs `NVARCHAR`- We need to decide.

- **`VARCHAR`** stores non-Unicode characters and is generally intended for data limited to a specific code page/character set.
- **`NVARCHAR`** stores Unicode characters, allowing text from many languages and character sets to be represented correctly.
- Since C# `string` supports Unicode, mapping a C# `string` to `VARCHAR` can cause characters to be lost or incorrectly converted when the data contains characters outside the supported code page.

For example, names or descriptions may contain characters such as **é, Arabic, Chinese, Japanese, or Cyrillic**. `NVARCHAR` is the safer default when the application does not explicitly restrict the data to ANSI characters.

### Rules

- `string` → `NVARCHAR`
- Preserve the source column length.
- Use `NVARCHAR(MAX)` only when the source metadata is `MAX`.
- Do not automatically convert `NVARCHAR` → `VARCHAR`.
- ANSI strings should require an **explicit design decision** and should not be selected automatically.

### Example

**Avoid:**  
`NVARCHAR(100)` → `VARCHAR(100)`

Even though both allow 100 characters, the conversion can lose Unicode information.

**Preferred:**  
`NVARCHAR(100)` → `NVARCHAR(100)`

---

# 3. Do Not Narrow Integer Types

Integer types must not be reduced to a smaller SQL type unless the range restriction is intentional and explicitly validated.

### Default mapping

| C# Type | SQL Type |
|---|---|
| `byte` | `TINYINT` |
| `short` | `SMALLINT` |
| `int` | `INT` |
| `long` | `BIGINT` |

### Rules

- Do not map `INT` to `TINYINT` or `SMALLINT` by default.
- Do not map `BIGINT` to `INT` or smaller types.
- Ordering/sequence fields must use a type appropriate for their expected range.
- If a smaller database type is intentional, enforce the valid range before writing the value.

### Example

Do not silently convert:

`INT → TINYINT`

because the current values happen to be below 256.

---

# 4. Preserve Decimal Precision and Scale

Decimal values must retain the precision and scale required by the source data and business logic.

### Rules

- Use the database metadata for `DECIMAL(p,s)`.
- Do not arbitrarily reduce precision or scale.
- Intermediate calculations must have sufficient precision.
- Monetary calculations should use a consistent decimal standard.
- Avoid unnecessary `FLOAT → DECIMAL` conversions.
- When rounding is required, make the rounding behavior explicit.

### Example

If a source value is `DECIMAL(18,4)`, do not automatically convert it to `DECIMAL(10,3)`.

Any reduction in precision must be deliberate and safe.

---

# 5. Preserve Date/Time Types and Precision

Date and time parameters should use strongly typed SQL date/time values rather than strings.

### Default mapping

| C# Type | SQL Type |
|---|---|
| `DateTime` | `DATETIME2(7)` |
| `DateTimeOffset` | `DATETIMEOFFSET(7)` |
| `DateOnly` | `DATE` |

### Rules

- Do not pass dates as `VARCHAR`/`NVARCHAR` parameters.
- Avoid `DATETIME` or `SMALLDATETIME` when the source requires higher precision.
- Use `DATE` only when the business value is genuinely date-only.
- If a date-only comparison is required, perform the conversion deliberately in the query rather than changing the parameter type.

### Example

Prefer:

`@CreatedDate DATETIME2(7)`

over:

`@CreatedDate VARCHAR(50)`

and parsing it inside the procedure.

---

# 6. Avoid String-to-Date and String-to-Numeric Conversions

Values should be strongly typed before reaching SQL whenever possible.

### Rules

- Parse and validate values in the application layer when practical.
- Use properly typed SQL parameters.
- If SQL must parse external data, use `TRY_CAST` or `TRY_CONVERT`.
- Invalid input must be handled explicitly.
- Do not rely on implicit conversion behavior.

### Example

For an external date received as text, convert it to `DateTime` in C# and pass it to SQL as `DATETIME2`.

For unavoidable SQL parsing, prefer `TRY_CONVERT` over an unsafe `CAST`.

---

# 7. Map Boolean Values Directly to BIT

Boolean application values must map directly to SQL `BIT`.

### Rules

- C# `bool` → SQL `BIT`.
- Do not pass booleans through `INT` or string parameters.
- Do not use `'true'` / `'false'` strings when a `BIT` value can be used.
- Use `0` and `1` for SQL boolean values where appropriate.

### Example

Prefer:

`@IsActive BIT`

over:

`@IsActive VARCHAR(5)`

followed by a conversion to `BIT`.

---

# 8. Handle RowVersion Correctly

Database concurrency tokens must preserve their intended SQL semantics.

### Rules

- SQL `ROWVERSION` columns must not be unnecessarily converted to `BINARY(8)`.


---

# 9. Never Use SELECT * in  SQL

All `SELECT`, `INSERT ... SELECT`, and view definitions must use explicit column lists.

### Rules

- Do not generate `SELECT *`.
- Do not use `INSERT INTO Target SELECT * FROM Source`.
- Keep source and target column mappings explicit.

### Example

Prefer:

`SELECT Id, Name, Status FROM Customer`

over:

`SELECT * FROM Customer`

This prevents  SQL from becoming fragile when the schema changes.

---

# 10. Keep Queries SARGable

Do not unnecessarily apply functions to indexed columns inside `WHERE`, `JOIN`, or `ON` predicates.

### Rules

Avoid expressions such as:

- `YEAR(DateColumn)`
- `MONTH(DateColumn)`
- `UPPER(Column)`
- `LEN(Column)`
- `ISNULL(Column, ...)`
- arithmetic expressions on indexed columns

when an equivalent SARGable predicate can be used.

### Example

Instead of:

`WHERE YEAR(CreatedDate) = @Year`

prefer a range:

`WHERE CreatedDate >= @YearStart AND CreatedDate < @YearEnd`

This allows SQL Server to make better use of indexes.

---

# 11. Be Careful With Calculations in Predicates

Calculations such as `FLOOR()` must not be placed around indexed columns in predicates without considering their performance impact.

### Rules

- Avoid applying calculations directly to indexed columns in `WHERE` clauses.
- Prefer range-based comparisons when possible.
- Consider computed columns when a calculated value is queried frequently.
- Move calculations outside the predicate when practical.
- Preserve the existing business behavior while improving SARGability.

### Example

Instead of calculating a value from the column for every row, calculate the appropriate boundary values once and compare the column directly against those boundaries.

---

# 12. Use ANSI JOIN Syntax

All joins must use explicit ANSI JOIN syntax.

### Rules

- Do not use comma-separated tables with join conditions in the `WHERE` clause.
- Use `INNER JOIN`, `LEFT JOIN`, `RIGHT JOIN`, etc.
- Put join conditions in the `ON` clause.

### Example

Prefer:

`FROM Customer c INNER JOIN Order o ON o.CustomerId = c.Id`

over:

`FROM Customer c, Order o WHERE o.CustomerId = c.Id`

---

# 13. Use Appropriate Types for Fixed-Length Codes

Values with a guaranteed fixed length should use an appropriate fixed-length type when that matches the database design.

### Rules

- Country codes, state/province codes, and similar fixed-length values should use `CHAR(n)` when appropriate.
- Do not change an existing database type solely to eliminate a warning without confirming the data model.
- The database schema and application metadata must remain consistent.

### Example

A two-character country code may be represented as:

`CHAR(2)`

when the value is always exactly two characters.

---

# 14. Do Not Perform "Helpful" Type Optimization in the Generator

The type defined by metadata rather than trying to optimize it.

### Rules

- `INT → SMALLINT`
- `INT → TINYINT`
- `BIGINT → INT`
- `NVARCHAR → VARCHAR`
- `NVARCHAR(MAX) → NVARCHAR(n)`
- `DECIMAL(p,s) → smaller DECIMAL`
- `DATETIME2 → DATETIME`
- `DATETIME2 → DATE`

unless an explicit business/data-model rule requires it.

Any narrowing must be explicitly configured and validated.

---

# 15. Generated Parameters Must Match Target Columns

Stored procedure parameters should match the corresponding database column types as closely as possible.

### Rules

For an insert or update procedure:

- Match SQL type.
- Match string length.
- Match decimal precision and scale.
- Match date/time precision.
- Match Unicode/non-Unicode behavior.
- Match nullability where applicable.

This prevents implicit conversions from being introduced by generated procedures.

---

# 16. Handle External Data at the Boundary

Data coming from APIs, JSON, XML, offline synchronization, imports, or other external sources must be validated and converted at the boundary.

### Rules

- Deserialize external data into strongly typed C# models.
- Validate values before sending them to SQL.
- Pass strongly typed SQL parameters.
- Avoid using generic strings for IDs, dates, numbers, and booleans.
- SQL should not be responsible for repeatedly converting application strings into database types.

---

# 17. Explicitly Define Intentional Conversions

Not every conversion is a warning that must be removed. Some conversions are legitimate business requirements.

### Rules

When a conversion is intentional:

1. Confirm that the conversion cannot cause data loss.
2. Document why the conversion is required.
3. Validate the source range/format when necessary.
4. Keep the conversion explicit.
5. Do not hide intentional conversions behind implicit SQL behavior.

The goal is **zero accidental warnings**, not zero explicit conversions.

---

# 18.  Validation Is Required

### Validation should check

- Parameter types
- Column types
- String lengths
- Decimal precision/scale
- Unicode vs ANSI
- Date/time types
- Boolean types
- RowVersion handling
- `SELECT *`
- Unsafe conversions
- Non-SARGable predicates
- Old-style joins

--

# 19. Warnings Must Not Be Ignored

Warnings should be treated as defects unless there is a documented reason for the warning to exist.

### Rules

- Do not suppress warnings simply to make the build clean.
- Do not add warning suppressions as a shortcut.
- Any suppression must include a documented justification.
- New warnings should be investigated before code is merged.

The preferred end state is a clean SQL build with no unexpected warnings.

---

# 20. Checklist

### Type Safety

- [ ] SQL types are derived from metadata.
- [ ] No unintended integer narrowing exists.
- [ ] Unicode types are preserved.
- [ ] String lengths match the source definition.
- [ ] Decimal precision and scale are preserved.
- [ ] Date/time precision is preserved.
- [ ] Boolean values use `BIT`.
- [ ] RowVersion values use the correct concurrency type.
- [ ] No unsafe string-to-number/date conversions exist.

### Query Quality

- [ ] No `SELECT *`.
- [ ] No unnecessary functions on indexed columns in predicates.
- [ ] Queries are SARGable where practical.
- [ ] ANSI JOIN syntax is used.
- [ ] Fixed-length codes use appropriate types.

### Codegen Quality

- [ ] Generated parameters match their target columns.
- [ ] Generator does not perform automatic type narrowing.
- [ ] Generated column lists come from metadata.
- [ ] Intentional conversions are explicit and documented.
- [ ] Generated SQL passes SSDT validation.

### Make sure

- [ ] warnings have been reviewed.
- [ ] No new warning has been introduced.
- [ ] Existing warnings are not suppressed without justification.
- [ ] Generator changes have been tested against representative SQL output.

---

# Standard Going Forward

The guiding principle is:

> **Generate SQL from the actual data model, preserve types and precision, avoid implicit conversions, and write queries that remain safe and performant as the schema grows.**

When there is a choice between a convenient generated type and the actual database type, **the database metadata wins**.

When a conversion is required by business logic, make it **explicit, validated, and intentional** rather than relying on implicit SQL conversion.