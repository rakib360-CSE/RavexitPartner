import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = url && key && !url.includes("YOUR_PROJECT")
  ? createClient(url, key)
  : null;

// The starter runs in local demo mode until valid environment variables are added.
// Before production, create tables and enable Row Level Security using README.md.
