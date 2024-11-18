import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Por favor, define las variables de entorno de Supabase')
}

export const supabase = createClient(supabaseUrl, supabaseKey)
//NEXT_PUBLIC_SUPABASE_URL=https://gesvxuiyntddmxbkrtig.supabase.co
//NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdlc3Z4dWl5bnRkZG14YmtydGlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjg5Mzc3NzIsImV4cCI6MjA0NDUxMzc3Mn0.o37i_L1qlxXX-dh4ofOANzV-YuaNbSEv5RJAkjw2VAM