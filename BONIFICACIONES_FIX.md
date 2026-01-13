# Fix for Bonificaciones Embed Error

## Problem
Error message: `Error al guardar los datos: Could not embed because more than one relationship was found for 'ClienteSucursal' and 'Bonificaciones'`

## Root Cause
This error occurs when there are multiple foreign key relationships between two tables in Supabase/PostgreSQL. In this case, the `ClienteSucursal` table has more than one foreign key column pointing to the `Bonificaciones` table, and Supabase doesn't know which one to use for the embed.

## Solution Applied
Modified the Supabase query in `/src/app/logdb/page.tsx` (line 190) to explicitly specify which foreign key constraint to use:

```typescript
// Before:
Bonificaciones(Bon_general, BG_porc)

// After:
Bonificaciones!ClienteSucursal_CODBO_fkey(Bon_general, BG_porc)
```

## Quick Fix: If You Still Get the Error

If you still see the embed error after applying this fix, it means the foreign key constraint name is different in your database. Follow these steps:

### Step 1: Find the Correct Foreign Key Name

The error message from Supabase may include hints about the available foreign keys. Look for messages like:
- "Hint: Disambiguate the relationship using the foreign key constraint name."
- Or it may list the available constraint names.

### Step 2: Query Your Database

Run this SQL in your Supabase SQL Editor to find all foreign keys from ClienteSucursal to Bonificaciones:

```sql
SELECT
    tc.constraint_name, 
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name='ClienteSucursal'
    AND ccu.table_name='Bonificaciones';
```

This will show you something like:
```
constraint_name                          | column_name      | foreign_table_name | foreign_column_name
-----------------------------------------|------------------|--------------------|--------------------- 
ClienteSucursal_CODBO_fkey              | CODBO            | Bonificaciones     | id
ClienteSucursal_bonificacion_general_fkey| bonif_general_id | Bonificaciones     | id
```

### Step 3: Update the Code

Replace the constraint name in `/src/app/logdb/page.tsx` line 190 with the correct one from Step 2:

```typescript
// Use the constraint name from your query results
Bonificaciones!YOUR_ACTUAL_CONSTRAINT_NAME(Bon_general, BG_porc)
```

### Common Foreign Key Name Patterns to Try:
- `ClienteSucursal_CODBO_fkey` ← **(currently used)**
- `ClienteSucursal_bonificacion_id_fkey`
- `ClienteSucursal_bonif_id_fkey`  
- `ClienteSucursal_cod_bonificacion_fkey`
- `ClienteSucursal_bonificacion_general_fkey`

### Alternative Syntax Options

If you know the column name but not the constraint name, you can try using the column name directly:

```typescript
// Using column name hint (if there's a bonificacion_id column)
bonificacion_id:Bonificaciones(Bon_general, BG_porc)

// Or if the column is CODBO
CODBO:Bonificaciones(Bon_general, BG_porc)
```

## Files Modified
- `/src/app/logdb/page.tsx` - Line 190 (main fix)
- `/src/app/logdb/page.tsx` - Lines 177-183 (documentation comments)

## Related Code
The same pattern may need to be applied in other files if they have similar queries:
- `/src/app/tomarpedido/page.tsx` - Lines 148-169 contains a commented-out function `fetchBonificaciones` with a similar query on line 153 that would need the same fix if uncommented in the future

## Testing
To verify the fix works:
1. Run the application: `npm run dev`
2. Navigate to the login page (usually at http://localhost:3000)
3. Enter valid credentials for a vendedor (salesperson)
4. The system should fetch data from Supabase including ClienteSucursal and Bonificaciones
5. If successful, you'll see "Datos guardados correctamente" alert and be able to proceed
6. If you still see the embed error, follow the "Quick Fix" steps above to find the correct constraint name

## Technical Details

### Why This Happens
PostgreSQL/Supabase allows multiple foreign keys from one table to another. For example:
- `ClienteSucursal` might have a `bonificacion_general_id` that references `Bonificaciones`
- `ClienteSucursal` might also have a `bonificacion_especial_id` that also references `Bonificaciones`

When you query `Bonificaciones(...)` without specifying which foreign key to use, Supabase doesn't know whether to follow the first or second relationship.

### The Solution
The `!constraint_name` syntax tells Supabase exactly which foreign key constraint to follow:
```typescript
Bonificaciones!ClienteSucursal_CODBO_fkey(Bon_general, BG_porc)
//             ↑ This specifies which foreign key to use
```

## Need More Help?
If you're still having issues:
1. Check the actual error message - it may contain hints
2. Look at your Supabase table schema for ClienteSucursal  
3. Identify which column should be used to link to Bonificaciones
4. Update the constraint name in the code accordingly

