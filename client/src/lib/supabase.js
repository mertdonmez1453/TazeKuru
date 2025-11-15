import { createClient } from '@supabase/supabase-js'

// Supabase URL ve Anon Key'i buraya ekleyin
// Bunları Supabase dashboard'unuzdan alabilirsiniz: https://app.supabase.com
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'YOUR_SUPABASE_URL'
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)


