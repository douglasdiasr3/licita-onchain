import { createBrowserClient } from "@supabase/ssr";

export function createSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.warn("Supabase não configurado — funcionalidades realtime desabilitadas");
    return null;
  }

  return createBrowserClient(url, key);
}
