// src/lib/supabaseQuest.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

// ✅ Public client (safe for frontend components)
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// ✅ Server client (for API routes only, uses service role key)
export const supabaseServer = createClient(supabaseUrl, supabaseServiceKey);
