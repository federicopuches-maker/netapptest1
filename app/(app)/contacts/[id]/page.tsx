"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, X, ExternalLink } from "lucide-react";
import { BusinessCardVisual } from "@/components/cards/business-card-visual";
import { useAuth } from "@/contexts/auth-context";
import { createClient } from "@/lib/supabase/client";
import type { Card } from "@/lib/types";

interface ContactDetail {
  id: string;
  notes: string | null;
  tags: string[];
  where_met: string | null;
  card: Card;
  username: string;
}

interface PageProps {
  params: { id: string };
}

export default function ContactDetailPage({ params }: PageProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [detail, setDetail] = useState<ContactDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState("");
  const [whereMet, setWhereMet] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const supabase = createClient();
    supabase
      .from("contacts")
      .select(`*, cards(*, profiles(username))`)
      .eq("id", params.id)
      .eq("owner_id", user.id)
      .single()
      .then(({ data }) => {
        if (!data) {
          window.location.href = "/contacts";
          return;
        }
        const card = data.cards as unknown as Card & {
          profiles: { username: string } | null;
        };
        setDetail({
          id: data.id,
          notes: data.notes,
          tags: data.tags ?? [],
          where_met: data.where_met,
          card,
          username: card.profiles?.username ?? "",
        });
        setNotes(data.notes ?? "");
        setWhereMet(data.where_met ?? "");
        setTags(data.tags ?? []);
        setLoading(false);
      });
  }, [user, params.id]);

  const handleSave = async () => {
    if (!detail) return;
    setSaving(true);
    setSaveError(null);
    const supabase = createClient();
    const { error } = await supabase
      .from("contacts")
      .update({ notes, where_met: whereMet, tags })
      .eq("id", detail.id);
    if (error) {
      setSaveError(error.message);
      setSaving(false);
    } else {
      router.push("/contacts");
    }
  };

  const addTag = (value: string) => {
    const tag = value.trim().toLowerCase();
    if (tag && !tags.includes(tag)) setTags((prev) => [...prev, tag]);
    setTagInput("");
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(tagInput);
    }
    if (e.key === "Backspace" && !tagInput && tags.length > 0) {
      setTags((prev) => prev.slice(0, -1));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm text-black/40">Loading…</p>
      </div>
    );
  }

  if (!detail) return null;

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ??
    (typeof window !== "undefined" ? window.location.origin : "");
  const publicUrl =
    detail.username && detail.card.slug
      ? `${appUrl}/card/${detail.username}/${detail.card.slug}`
      : "";

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="flex items-center px-4 h-14 border-b border-black/10">
        <Link href="/contacts" className="text-black/40 hover:text-black transition-colors">
          <ArrowLeft size={20} strokeWidth={1.5} />
        </Link>
        <h1 className="text-base font-semibold flex-1 text-center">{detail.card.name}</h1>
        {publicUrl && (
          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-black/40 hover:text-black transition-colors"
            aria-label="View public card"
          >
            <ExternalLink size={18} strokeWidth={1.5} />
          </a>
        )}
      </div>

      <div className="p-4 flex flex-col gap-5 pb-40">
        {/* Card visual */}
        <BusinessCardVisual card={detail.card} />

        {/* Where we met */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">Where we met</label>
          <input
            type="text"
            value={whereMet}
            onChange={(e) => setWhereMet(e.target.value)}
            placeholder="Conference, coffee chat, LinkedIn…"
            className="w-full border border-black/20 rounded-md px-3 py-2 text-sm outline-none focus:border-accent transition-colors"
          />
        </div>

        {/* Tags */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">Tags</label>
          <div className="border border-black/20 rounded-md px-3 py-2 flex flex-wrap gap-1.5 focus-within:border-accent transition-colors min-h-[42px]">
            {tags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1 text-xs text-accent bg-accent/10 px-2 py-0.5 rounded-full"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => setTags((prev) => prev.filter((t) => t !== tag))}
                  aria-label={`Remove tag ${tag}`}
                >
                  <X size={10} strokeWidth={2} />
                </button>
              </span>
            ))}
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              onBlur={() => { if (tagInput.trim()) addTag(tagInput); }}
              placeholder={tags.length === 0 ? "Add tags (press Enter)…" : ""}
              className="flex-1 text-sm outline-none bg-transparent placeholder:text-black/30 min-w-[120px]"
            />
          </div>
        </div>

        {/* Notes */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add notes about this contact…"
            rows={4}
            className="w-full border border-black/20 rounded-md px-3 py-2 text-sm outline-none focus:border-accent transition-colors resize-none"
          />
        </div>

        {/* Save */}
        {saveError && <p className="text-sm text-red-500">{saveError}</p>}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-accent text-white text-sm font-medium py-2.5 rounded-md disabled:opacity-50 transition-opacity"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
    </div>
  );
}
