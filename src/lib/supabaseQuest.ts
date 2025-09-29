// src/lib/supabaseQuest.ts
import { createClient } from "@supabase/supabase-js";

// 🔹 Public client (for client-side code, uses anon key)
export const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// 🔹 Server client (for server-only code, uses service role key)
export const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // ⬅ only safe on the server
);
