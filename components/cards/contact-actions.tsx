"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Card } from "@/lib/types";

interface ViewerContext {
  id: string;
  isOwner: boolean;
  alreadySaved: boolean;
}

interface ContactActionsProps {
  card: Card;
  viewer: ViewerContext | null;
  username: string;
}

export function ContactActions({ card, viewer, username }: ContactActionsProps) {
  // State A — Owner
  if (viewer?.isOwner) {
    return (
      <p className="text-sm text-black/40 text-center">This is your card</p>
    );
  }

  // State B — Logged in, not owner
  if (viewer) {
    return <SaveButton cardId={card.id} ownerId={viewer.id} alreadySaved={viewer.alreadySaved} />;
  }

  // State C — Not logged in
  return <JoinCTA card={card} username={username} />;
}

function SaveButton({
  cardId,
  ownerId,
  alreadySaved,
}: {
  cardId: string;
  ownerId: string;
  alreadySaved: boolean;
}) {
  const [saved, setSaved] = useState(alreadySaved);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    setError(false);
    const supabase = createClient();
    const { error } = await supabase
      .from("contacts")
      .insert({ owner_id: ownerId, card_id: cardId });

    if (error && error.code !== "23505") {
      setError(true);
      setSaving(false);
      return;
    }

    setSaved(true);
    setSaving(false);
  };

  if (saved) {
    return (
      <button
        disabled
        className="w-full bg-green-600 text-white text-sm font-medium py-2.5 rounded-md opacity-80"
      >
        Saved to contacts
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-accent text-white text-sm font-medium py-2.5 rounded-md disabled:opacity-50 transition-opacity"
      >
        {saving ? "Saving…" : "Save to Net Contacts"}
      </button>
      {error && (
        <p className="text-sm text-red-500 text-center">Something went wrong. Try again.</p>
      )}
    </div>
  );
}

function JoinCTA({ card, username }: { card: Card; username: string }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [alreadyExists, setAlreadyExists] = useState(false);
  const [done, setDone] = useState(false);

  const inputClass =
    "w-full border border-black/20 rounded-md px-3 py-2 text-sm outline-none focus:border-accent transition-colors";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setAlreadyExists(false);

    const supabase = createClient();
    const password = crypto.randomUUID();

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });

    if (signUpError) {
      if (signUpError.message.toLowerCase().includes("already registered")) {
        setAlreadyExists(true);
      } else {
        setError(signUpError.message);
      }
      setLoading(false);
      return;
    }

    // Save contact if we have an immediate session (email confirm disabled)
    if (data.session) {
      await supabase
        .from("contacts")
        .insert({ owner_id: data.session.user.id, card_id: card.id });
    }

    setDone(true);
    setLoading(false);
  };

  const returnPath = `/card/${username}/${card.slug}`;

  if (done) {
    return (
      <div className="flex flex-col gap-2 border border-black/10 rounded-xl p-5 text-center">
        <p className="text-base font-semibold">Check your email</p>
        <p className="text-sm text-black/50">
          We sent a link to <span className="font-medium text-black">{email}</span>.
          Click it to access your account and create your Net card.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 border border-black/10 rounded-xl p-5">
      <div>
        <h2 className="text-base font-semibold">Create your free Net card</h2>
        <p className="text-sm text-black/50 mt-0.5">
          Join Net — it only takes a few seconds
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="text"
          required
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClass}
          autoComplete="name"
        />
        <input
          type="email"
          required
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
          autoComplete="email"
        />

        {error && <p className="text-sm text-red-500">{error}</p>}

        {alreadyExists && (
          <p className="text-sm text-black/60">
            Account exists.{" "}
            <Link
              href={`/login?next=${encodeURIComponent(returnPath)}`}
              className="text-accent underline underline-offset-2"
            >
              Sign in
            </Link>
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-accent text-white text-sm font-medium py-2.5 rounded-md disabled:opacity-50 transition-opacity"
        >
          {loading ? "Creating account…" : "Join Net"}
        </button>
      </form>

      <p className="text-xs text-black/40 text-center">
        Already have an account?{" "}
        <Link
          href={`/login?next=${encodeURIComponent(returnPath)}`}
          className="text-accent underline underline-offset-2"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
