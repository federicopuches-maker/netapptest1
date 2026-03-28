"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Pencil, Share2, Mail, Phone, ExternalLink } from "lucide-react";
import { CardForm } from "@/components/cards/card-form";
import { ShareSheet } from "@/components/cards/share-sheet";
import { useAuth } from "@/contexts/auth-context";
import { createClient } from "@/lib/supabase/client";
import { slugify, makeUniqueSlug } from "@/lib/slugify";
import type { Card, CardFormValues } from "@/lib/types";

interface PageProps {
  params: { id: string };
}

const fieldRows: { key: keyof Card; label: string; icon?: React.ElementType }[] = [
  { key: "name", label: "Name" },
  { key: "job_title", label: "Job title" },
  { key: "company", label: "Company" },
  { key: "email", label: "Email", icon: Mail },
  { key: "phone", label: "Phone", icon: Phone },
  { key: "linkedin_url", label: "LinkedIn", icon: ExternalLink },
];

export default function CardDetailPage({ params }: PageProps) {
  const { user } = useAuth();
  const [card, setCard] = useState<Card | null>(null);
  const [username, setUsername] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const supabase = createClient();

    Promise.all([
      supabase.from("cards").select("*").eq("id", params.id).eq("user_id", user.id).single(),
      supabase.from("profiles").select("username").eq("id", user.id).single(),
    ]).then(([{ data: cardData }, { data: profileData }]) => {
      if (!cardData) {
        window.location.href = "/cards";
        return;
      }
      setCard(cardData);
      setUsername(profileData?.username ?? "");
      setLoading(false);
    });
  }, [user, params.id]);

  const handleSave = async (values: CardFormValues) => {
    if (!card || !user) return;
    setSaving(true);
    setError(null);

    const supabase = createClient();

    const { data: existing } = await supabase
      .from("cards")
      .select("slug")
      .eq("user_id", user.id);

    const existingSlugs = (existing ?? []).map((c) => c.slug);
    const newSlug = makeUniqueSlug(slugify(values.title), existingSlugs, card.slug);

    const { data, error } = await supabase
      .from("cards")
      .update({ ...values, slug: newSlug, updated_at: new Date().toISOString() })
      .eq("id", card.id)
      .select("*")
      .single();

    if (error || !data) {
      setError(error?.message ?? "Failed to save");
      setSaving(false);
      return;
    }

    setCard(data);
    setIsEditing(false);
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!card || !confirm(`Delete "${card.title}"?`)) return;
    const supabase = createClient();
    await supabase.from("cards").delete().eq("id", card.id);
    window.location.href = "/cards";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm text-black/40">Loading…</p>
      </div>
    );
  }

  if (!card) return null;

  const formValues: CardFormValues = {
    title: card.title,
    name: card.name,
    job_title: card.job_title,
    company: card.company,
    email: card.email,
    phone: card.phone,
    linkedin_url: card.linkedin_url,
  };

  return (
    <>
      <div className="flex flex-col min-h-full">
        {/* Header */}
        <div className="flex items-center px-4 h-14 border-b border-black/10">
          <Link href="/cards" className="text-black/40 hover:text-black transition-colors">
            <ArrowLeft size={20} strokeWidth={1.5} />
          </Link>
          <h1 className="text-base font-semibold flex-1 text-center">{card.title}</h1>
          <button
            onClick={() => setIsEditing((v) => !v)}
            className={`transition-colors ${isEditing ? "text-accent" : "text-black/40 hover:text-black"}`}
            aria-label={isEditing ? "Cancel edit" : "Edit card"}
          >
            <Pencil size={18} strokeWidth={1.5} />
          </button>
        </div>

        <div className="p-4 flex flex-col gap-6">
          {error && <p className="text-sm text-red-500">{error}</p>}

          {isEditing ? (
            <CardForm
              initialValues={formValues}
              onSubmit={handleSave}
              submitLabel="Save changes"
              loading={saving}
            />
          ) : (
            <>
              {/* Field list */}
              <div className="divide-y divide-black/10 border border-black/10 rounded-xl overflow-hidden">
                {fieldRows.map(({ key, label, icon: Icon }) => {
                  const value = card[key] as string;
                  if (!value) return null;
                  return (
                    <div key={key} className="flex items-start gap-3 px-4 py-3">
                      {Icon && (
                        <Icon size={16} className="text-black/30 mt-0.5 shrink-0" strokeWidth={1.5} />
                      )}
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <span className="text-xs text-black/40">{label}</span>
                        <span className="text-sm break-all">{value}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Share button */}
              <button
                onClick={() => setShowShare(true)}
                className="flex items-center justify-center gap-2 w-full border border-black/20 rounded-md py-2.5 text-sm font-medium hover:bg-black/[0.02] transition-colors"
              >
                <Share2 size={16} strokeWidth={1.5} />
                Share card
              </button>

              {/* Delete */}
              <button
                onClick={handleDelete}
                className="text-xs text-black/30 hover:text-red-500 transition-colors text-center"
              >
                Delete card
              </button>
            </>
          )}
        </div>
      </div>

      {showShare && card && username && (
        <ShareSheet card={card} username={username} onClose={() => setShowShare(false)} />
      )}
    </>
  );
}
