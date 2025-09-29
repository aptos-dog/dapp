// src/lib/supabaseQuest.ts
// ✅ Only re-export the *public client* for client-side usage
export { supabaseClient } from "./supabaseClient";

// ✅ If you really need the server client, import it directly:
// import { supabaseServer } from "@/lib/supabaseServer";
