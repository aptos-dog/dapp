// src/lib/supabaseClient.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 🔍 Guards
if (!supabaseUrl) {
  throw new Error("❌ Missing NEXT_PUBLIC_SUPABASE_URL. Check your env vars.");
}
if (!supabaseAnonKey) {
  throw new Error("❌ Missing NEXT_PUBLIC_SUPABASE_ANON_KEY. Check your env vars.");
}

// ✅ Public client (safe to use in the browser)
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
