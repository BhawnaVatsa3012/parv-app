import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

// Refreshes the Supabase auth session cookie on every request that isn't
// a static asset. Critical: if this throws (e.g. env vars unset), the
// whole site — including the free Stories pages — must NOT go down.
export async function middleware(request) {
  let response = NextResponse.next({ request: { headers: request.headers } });

  try {
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ) {
      // Monetization not configured yet — degrade gracefully, free
      // content keeps working, Rituals paywall will just always show locked.
      return response;
    }

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            response = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    await supabase.auth.getUser();
  } catch (err) {
    console.error("Auth middleware error (degrading gracefully):", err);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
