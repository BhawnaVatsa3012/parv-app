import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Used in Route Handlers / Server Components. Reads the caller's session
// from cookies so RLS applies as that specific user — never the service role.
export function createClient() {
  // Next 15+: cookies() returns a promise. @supabase/ssr accepts async
  // getAll/setAll, so createClient() itself stays synchronous and none of
  // its callers need to change.
  const cookieStorePromise = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        async getAll() {
          return (await cookieStorePromise).getAll();
        },
        async setAll(cookiesToSet) {
          try {
            const cookieStore = await cookieStorePromise;
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component that can't set cookies —
            // safe to ignore as long as proxy.js is refreshing sessions.
          }
        },
      },
    }
  );
}

// Service-role client. ONLY ever import this inside webhook route handlers
// (app/api/webhooks/*) — never in anything reachable from the browser.
// It bypasses RLS entirely, so it's the only thing allowed to write to
// public.subscriptions.
export function createServiceClient() {
  const { createClient: createSupabaseClient } = require("@supabase/supabase-js");
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
