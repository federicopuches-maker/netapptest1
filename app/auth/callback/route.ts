import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const saveUsername = searchParams.get("save_username");
  const saveSlug = searchParams.get("save_slug");

  if (code) {
    const supabase = createClient();
    const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && user) {
      // Determine if new user (no cards yet)
      const { data: cards } = await supabase
        .from("cards")
        .select("id")
        .eq("user_id", user.id)
        .limit(1);

      const isNewUser = !cards || cards.length === 0;

      if (isNewUser) {
        // New user → go to onboarding; contact saved there after card creation
        const params = new URLSearchParams();
        if (saveUsername) params.set("save_username", saveUsername);
        if (saveSlug) params.set("save_slug", saveSlug);
        const qs = params.toString();
        return NextResponse.redirect(`${origin}/onboarding${qs ? `?${qs}` : ""}`);
      }

      // Existing user → save contact immediately, then go to contacts
      if (saveUsername && saveSlug) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("username", saveUsername)
          .single();

        if (profile) {
          const { data: card } = await supabase
            .from("cards")
            .select("id")
            .eq("user_id", profile.id)
            .eq("slug", saveSlug)
            .single();

          if (card) {
            // Insert silently — ignore 23505 duplicate
            await supabase
              .from("contacts")
              .insert({ owner_id: user.id, card_id: card.id });
          }
        }

        return NextResponse.redirect(`${origin}/contacts`);
      }

      return NextResponse.redirect(`${origin}/cards`);
    }
  }

  return NextResponse.redirect(`${origin}/login`);
}
