"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { createClient } from "@/lib/supabase/client";
import { slugify, makeUniqueSlug } from "@/lib/slugify";

function OnboardingForm() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const saveUsername = searchParams.get("save_username") ?? "";
  const saveSlug = searchParams.get("save_slug") ?? "";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pre-fill from auth metadata
  useEffect(() => {
    if (!user) return;
    const meta = user.user_metadata as Record<string, string> | undefined;
    const authName = meta?.full_name ?? meta?.name ?? "";
    setName(authName);
    setEmail(user.email ?? "");
  }, [user]);

  const handleSubmit = async (skipPhone = false) => {
    if (!user || !name.trim()) return;
    setLoading(true);
    setError(null);

    const supabase = createClient();

    // Generate unique username
    const baseSlug = slugify(name);
    const { data: existingProfiles } = await supabase
      .from("profiles")
      .select("username");
    const existingUsernames = (existingProfiles ?? []).map((p: { username: string }) => p.username);
    const username = makeUniqueSlug(baseSlug, existingUsernames);

    // Upsert profile
    const { error: profileError } = await supabase
      .from("profiles")
      .upsert({ id: user.id, username, name: name.trim(), updated_at: new Date().toISOString() });

    if (profileError) {
      setError(profileError.message);
      setLoading(false);
      return;
    }

    // Create card
    const { data: card, error: cardError } = await supabase
      .from("cards")
      .insert({
        user_id: user.id,
        title: "Professional",
        name: name.trim(),
        email: email.trim(),
        phone: skipPhone ? "" : phone.trim(),
        job_title: "",
        company: "",
        linkedin_url: "",
        slug: username,
      })
      .select("id")
      .single();

    if (cardError || !card) {
      setError(cardError?.message ?? "Failed to create card");
      setLoading(false);
      return;
    }

    // Save pending contact if present
    if (saveUsername && saveSlug) {
      const { data: contactProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", saveUsername)
        .single();

      if (contactProfile) {
        const { data: contactCard } = await supabase
          .from("cards")
          .select("id")
          .eq("user_id", contactProfile.id)
          .eq("slug", saveSlug)
          .single();

        if (contactCard) {
          await supabase
            .from("contacts")
            .insert({ owner_id: user.id, card_id: contactCard.id });
        }
      }
    }

    window.location.href = "/cards";
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-center px-4 h-14">
        <p className="text-xs font-semibold tracking-widest text-accent uppercase">Net</p>
      </div>

      <div className="flex-1 flex flex-col px-6 pt-4 pb-10 max-w-sm mx-auto w-full">
        <h1 className="text-2xl font-semibold mb-1">Your card in 60 seconds</h1>
        <p className="text-sm text-black/40 mb-8">
          Fill in your details and start sharing right away.
        </p>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Full name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              autoComplete="name"
              className="w-full border border-black/20 rounded-md px-3 py-2.5 text-sm outline-none focus:border-accent transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Phone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 555 000 0000"
              autoComplete="tel"
              className="w-full border border-black/20 rounded-md px-3 py-2.5 text-sm outline-none focus:border-accent transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              className="w-full border border-black/20 rounded-md px-3 py-2.5 text-sm outline-none focus:border-accent transition-colors"
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            onClick={() => handleSubmit(false)}
            disabled={loading || !name.trim()}
            className="w-full bg-accent text-white text-sm font-medium py-3 rounded-full disabled:opacity-50 transition-opacity mt-2"
          >
            {loading ? "Creating your card…" : "Start sharing"}
          </button>

          <button
            onClick={() => handleSubmit(true)}
            disabled={loading || !name.trim()}
            className="w-full text-sm text-black/40 py-2 disabled:opacity-50"
          >
            Complete later
          </button>
        </div>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense>
      <OnboardingForm />
    </Suspense>
  );
}
