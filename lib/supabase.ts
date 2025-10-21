import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';

// Only create clients if we have the required environment variables
// This allows the build to succeed even when env vars aren't available
export const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null as any;

// For server-side operations that need elevated permissions
export const supabaseAdmin = supabaseUrl && (supabaseServiceKey || supabaseKey)
  ? createClient(supabaseUrl, supabaseServiceKey || supabaseKey)
  : null as any;
