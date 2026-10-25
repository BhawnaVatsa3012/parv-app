import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Sign-in links verify a one-time token directly (no PKCE cookie needed),
// so the link works even if it is opened in a different browser or in-app
// mail viewer than the one that requested it.
export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") ?? "email";
  // After sign-in everyone lands in the app (festival list). The email
  // templates still send next=/account, so treat that as the app home too.
  const rawNext = searchParams.get("next") ?? "/";
  const safe = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/";
  const next = safe === "/account" ? "/" : safe;

  if (token_hash) {
    const supabase = createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
