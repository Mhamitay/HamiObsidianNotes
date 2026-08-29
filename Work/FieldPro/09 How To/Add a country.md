# How to Add a Country and States/Provinces

## 1. Find the Country

- Use `countries.csv` located in `Database\State Province Import`.
- Filter by the country you want to add.
- Copy the `sql` column.
- Note the `Id` field:
    - If `FieldProID` exists, use the `FieldProID` value.
    - Otherwise, use the `Id` value.

Example:

```sql
exec dbo.Country_InsertOrUpdate @CountryID,'Nicaragua','NIC';
```

## 2. Find the States/Provinces

- Use the **States with Sql.xlsx** file.
- Filter by the country you are adding.
- Copy the `sql` column for each state/province.

Example:

```sql
exec dbo.StateProvince_InsertOrUpdate 946,@CountryID,'BO','Boaco';
```

## 3. Check for Non-State Entries

- Open `states.csv` located in `Database\State Province Import`.
- Filter by the country.
- Check the `type` column.
- Identify any entries marked as **non state**.
- Review these entries before adding them to the final script.

## 4. Create the Final Script

The final script should:

1. Declare the `@CountryID`.
2. Add the country.
3. Add all applicable states/provinces.
4. Print a success message when complete.

Example:

```sql
DECLARE @CountryID INT = 172;

-- Adding Paraguay
PRINT 'Adding country - Paraguay'
EXEC dbo.Country_InsertOrUpdate @CountryID,'Paraguay','PRY';

PRINT 'Adding States/Provinces for Paraguay'
exec dbo.StateProvince_InsertOrUpdate 2785,@CountryID,'16','Alto Paraguay Department';
exec dbo.StateProvince_InsertOrUpdate 2784,@CountryID,'10','Alto Paraná Department';
exec dbo.StateProvince_InsertOrUpdate 2782,@CountryID,'13','Amambay Department';
exec dbo.StateProvince_InsertOrUpdate 2780,@CountryID,'19','Boquerón Department';
exec dbo.StateProvince_InsertOrUpdate 2773,@CountryID,'5','Caaguazú';
exec dbo.StateProvince_InsertOrUpdate 2775,@CountryID,'6','Caazapá';
exec dbo.StateProvince_InsertOrUpdate 2771,@CountryID,'14','Canindeyú';
exec dbo.StateProvince_InsertOrUpdate 2777,@CountryID,'11','Central Department';
exec dbo.StateProvince_InsertOrUpdate 2779,@CountryID,'1','Concepción Department';
exec dbo.StateProvince_InsertOrUpdate 2783,@CountryID,'3','Cordillera Department';
exec dbo.StateProvince_InsertOrUpdate 2772,@CountryID,'4','Guairá Department';
exec dbo.StateProvince_InsertOrUpdate 2778,@CountryID,'7','Itapúa';
exec dbo.StateProvince_InsertOrUpdate 2786,@CountryID,'8','Misiones Department';
exec dbo.StateProvince_InsertOrUpdate 2781,@CountryID,'12','Ñeembucú Department';
exec dbo.StateProvince_InsertOrUpdate 2774,@CountryID,'9','Paraguarí Department';
exec dbo.StateProvince_InsertOrUpdate 2770,@CountryID,'15','Presidente Hayes Department';
exec dbo.StateProvince_InsertOrUpdate 2776,@CountryID,'2','San Pedro Department';

PRINT 'Country - Paraguay added successfully';
```

## 5. Final Verification

Before running the script, verify:

- [x] The correct `CountryID` is being used. ✅ 2026-08-28
- [x] `FieldProID` was used when available. ✅ 2026-08-28
- [x] The country code is correct. ✅ 2026-08-28
- [x] All applicable states/provinces are included. ✅ 2026-08-28
- [x] State/province IDs match the source files. ✅ 2026-08-28
- [x] State/province codes match the source files. ✅ 2026-08-28
- [x] State/province names match the source files. ✅ 2026-08-28
- [x] Entries marked `non state` have been reviewed. ✅ 2026-08-28
- [x] The final success message uses the correct country name. ✅ 2026-08-28

#HowTo/SQL
[[Entity Framework Migrations Workflow]]
