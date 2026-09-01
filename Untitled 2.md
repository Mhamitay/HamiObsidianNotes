1. Never silently narrow SQL types.

2. string → NVARCHAR by default.

3. Preserve string length.

4. Preserve decimal precision and scale.

5. int → INT.

6. short → SMALLINT.

7. long → BIGINT.

8. bool → BIT.

9. DateTime → DATETIME2(7).

10. DateTimeOffset → DATETIMEOFFSET(7).

11. DateOnly → DATE.

12. Guid → UNIQUEIDENTIFIER.

13. Preserve Unicode.

14. Never generate SELECT *.

15. Never generate comma-style JOINs.

16. Avoid functions on indexed columns in predicates.

17. Prefer typed SQL parameters over string parsing.

18. Use TRY_CAST / TRY_CONVERT when SQL-side parsing is unavoidable.

19. Require explicit justification for narrowing conversions.

20. Require explicit justification for ANSI string types.

21. Validate generated SQL before accepting it.

22. Treat unexpected SSDT warnings as build failures.

23. Test the generator itself, not just generated SQL.

24. Never suppress a warning globally just to achieve a green build.