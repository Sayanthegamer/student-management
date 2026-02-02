import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // This warning is helpful during development/setup
  console.warn('Supabase credentials missing. Check .env file.');
}

let client;
try {
    client = createClient(supabaseUrl, supabaseAnonKey);
} catch (error) {
    console.warn('Supabase client creation failed:', error.message);
    client = null;
}

export const supabase = client;
