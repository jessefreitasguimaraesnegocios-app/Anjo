import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://apjluzpllwtbdcxwscxg.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFwamx1enBsbHd0YmRjeHdzY3hnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxMzQwMTIsImV4cCI6MjA3NTcxMDAxMn0.LUZFzVU0Lkv3LKOHo2lEuvE3fm2j2D8mABNXtmulcD0";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
