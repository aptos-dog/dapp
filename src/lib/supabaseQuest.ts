// src/lib/supabaseQuest.ts
// ✅ Only expose the public client for client-side use
export { supabaseClient } from "./supabaseClient";

// ❌ Do NOT export supabaseServer here
// If you need supabaseServer, import it directly:
// import { supabaseServer } from "@/lib/supabaseServer";
