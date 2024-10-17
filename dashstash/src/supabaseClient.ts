import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

console.log("supabaseUrl", supabaseUrl);
console.log("supabaseAnonKey", supabaseAnonKey);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false
    }
  })
  
  console.log('Supabase client created:', supabase)
