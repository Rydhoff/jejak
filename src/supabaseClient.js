import { createClient } from "@supabase/supabase-js";

export const supbaseUrl1 = import.meta.env.VITE_SUPABASE_URL
export const supbaseUrl2 = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
export const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY);