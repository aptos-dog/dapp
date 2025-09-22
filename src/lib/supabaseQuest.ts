// src/lib/supabaseQuest.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// 🔍 Early guard for missing env vars
if (!supabaseUrl) {
  throw new Error("❌ Missing NEXT_PUBLIC_SUPABASE_URL. Check your Vercel env vars.");
}
if (!supabaseAnonKey) {
  throw new Error("❌ Missing NEXT_PUBLIC_SUPABASE_ANON_KEY. Check your Vercel env vars.");
}
if (!supabaseServiceKey && typeof window === "undefined") {
  // service key should only exist on server
  throw new Error("❌ Missing SUPABASE_SERVICE_ROLE_KEY. Check your Vercel env vars.");
}

// ✅ Public client (safe for frontend)
export const supabaseClient = createClient(supabaseUrl!, supabaseAnonKey!);

// ✅ Server client (for API routes only)
export const supabaseServer = createClient(supabaseUrl!, supabaseServiceKey!);
