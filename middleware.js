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
      // Supabase not configured — degrade gracefully rather than lock
      // everyone out of the site.
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

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Sign-in gate: the whole app is for signed-in users only.
    // Open paths: the login page, the auth link handlers, and payment
    // webhooks (Razorpay/Dodo call these server-to-server, with no login),
    // and the daily cron job (protected by CRON_SECRET instead).
    const path = request.nextUrl.pathname;
    const isOpen =
      path === "/login" ||
      path.startsWith("/auth/") ||
      path.startsWith("/api/webhooks/") ||
      path.startsWith("/api/cron/");

    if (!user && !isOpen) {
      if (path.startsWith("/api/")) {
        return NextResponse.json({ error: "Sign in first" }, { status: 401 });
      }
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.search = "";
      return NextResponse.redirect(url);
    }
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
