import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  "https://qzkekkdgjsxbgtpgwiry.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6a2Vra2RnanN4Ymd0cGd3aXJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzU5ODkzNDQsImV4cCI6MTk5MTU2NTM0NH0.C7Q75OcPlbqfExoswLohJiBrWFW1iJpfzbwF5w5-sno"
);

export default supabase;