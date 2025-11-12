import { createClient } from "@supabase/supabase-js";

export const supaUrl = import.meta.env.VITE_SUPABASE_URL 
export const supaPublish = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
export const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY);