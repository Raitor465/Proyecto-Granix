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

## If the Fix Doesn't Work
The foreign key constraint name `ClienteSucursal_CODBO_fkey` is based on common PostgreSQL naming conventions. If this doesn't work, you need to find the actual foreign key constraint name in your database.

### How to Find the Correct Foreign Key Name

1. **Using Supabase Dashboard:**
   - Go to your Supabase project
   - Navigate to Table Editor
   - Select the `ClienteSucursal` table
   - Look at the foreign keys section
   - Find the foreign keys that reference the `Bonificaciones` table

2. **Using SQL Query:**
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

3. **Common Foreign Key Name Patterns:**
   - `ClienteSucursal_CODBO_fkey` (current implementation)
   - `ClienteSucursal_bonificacion_id_fkey`
   - `ClienteSucursal_bonif_id_fkey`
   - `ClienteSucursal_cod_bonificacion_fkey`

### Alternative Syntax Options

If you know the column name but not the constraint name, you can use:
```typescript
// Using column name hint
bonificacion_id:Bonificaciones(Bon_general, BG_porc)
// or
CODBO:Bonificaciones(Bon_general, BG_porc)
```

## Files Modified
- `/src/app/logdb/page.tsx` - Line 190

## Related Code
The same pattern may need to be applied in other files if they have similar queries:
- `/src/app/tomarpedido/page.tsx` - Line 153 (currently commented out, but may need fixing if uncommented)

## Testing
To verify the fix works:
1. Run the application: `npm run dev`
2. Navigate to the login page
3. Enter valid credentials
4. The data should load without the embed error

If you still see the error, check the error message for hints about the actual foreign key constraint name and update the query accordingly.
