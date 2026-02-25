
import { createClient } from '@supabase/supabase-js'

// Replace these with your project URL and Anon Key from the Supabase Dashboard
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://dagbjswzrrzcpsbhunvm.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_KEY || 'sb_publishable_YuPWcOGrHbBxx45YUoznhw_Bm_3N6UI'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
