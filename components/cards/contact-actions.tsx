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
        className="w-full bg-green-600 text-white text-sm font-medium py-3 rounded-full opacity-80"
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
        className="w-full bg-accent text-white text-sm font-medium py-3 rounded-full disabled:opacity-50 transition-opacity"
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
  const joinHref = `/join?username=${encodeURIComponent(username)}&slug=${encodeURIComponent(card.slug)}`;
  const loginHref = `/login?next=${encodeURIComponent(`/card/${username}/${card.slug}`)}`;
  const firstName = card.name.split(" ")[0];

  return (
    <div className="flex flex-col gap-3">
      <Link
        href={joinHref}
        className="w-full bg-accent text-white text-sm font-medium py-3 rounded-full text-center"
      >
        Save {firstName}&apos;s card — Join Net free
      </Link>
      <p className="text-xs text-black/40 text-center">
        Already have an account?{" "}
        <Link href={loginHref} className="text-accent underline underline-offset-2">
          Sign in
        </Link>
      </p>
    </div>
  );
}
