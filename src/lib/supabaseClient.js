import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
export const supabaseConfigured = Boolean(url && key && key.startsWith('sb_publishable_'));
export const supabase = supabaseConfigured ? createClient(url, key) : null;
