import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Faltan VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. Revisá tu .env.local (ver .env.example)."
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// TEMPORAL — para debuggear desde la consola del navegador. Sacar esto
// después de resolver el tema de permisos en Storage.
if (typeof window !== "undefined") {
  (window as unknown as { supabase: typeof supabase }).supabase = supabase;
}