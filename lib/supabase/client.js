import { createBrowserClient } from "@supabase/ssr";

// Used in "use client" components. Reads the public URL + publishable
// (anon) key — safe to expose, protected entirely by RLS on the server.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
