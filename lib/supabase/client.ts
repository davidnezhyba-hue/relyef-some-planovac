import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "[Supabase] Chybí proměnné prostředí!\n" +
      "  NEXT_PUBLIC_SUPABASE_URL:", supabaseUrl ?? "❌ není nastaveno\n" +
      "  NEXT_PUBLIC_SUPABASE_ANON_KEY:", supabaseAnonKey ? "✓ nastaveno" : "❌ není nastaveno"
  );
}

export function createClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Supabase není nakonfigurován. Zkontrolujte .env.local soubor a ujistěte se, že jsou nastaveny NEXT_PUBLIC_SUPABASE_URL a NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }
  return createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey);
}
