import { createClient } from '@supabase/supabase-js';


/**
 * supabaseUrl
 * 
 * Utility function or helper.
 */
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

/**
 * supabaseAnonKey
 * 
 * Utility function or helper.
 */
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


/**
 * supabase
 * 
 * Utility function or helper.
 */
export const supabase = client;
