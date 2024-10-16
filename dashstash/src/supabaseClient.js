import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

// console.log('Initializing Supabase client')
// console.log('Supabase URL:', supabaseUrl)
// console.log('Supabase Anon Key:', supabaseAnonKey?.substring(0, 5) + '...')

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

console.log('Supabase client created: supabaseClient.js')