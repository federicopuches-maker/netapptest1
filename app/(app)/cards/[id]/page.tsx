"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Pencil, Share2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { CardForm } from "@/components/cards/card-form";
import { ImageUploadField } from "@/components/cards/image-upload-field";
import { ShareSheet } from "@/components/cards/share-sheet";
import { BusinessCardVisual } from "@/components/cards/business-card-visual";
import { useAuth } from "@/contexts/auth-context";
import { createClient } from "@/lib/supabase/client";
import { slugify, makeUniqueSlug } from "@/lib/slugify";
import type { Card, CardFormValues } from "@/lib/types";

interface PageProps {
  params: { id: string };
}

export default function CardDetailPage({ params }: PageProps) {
  const { user } = useAuth();
  const [card, setCard] = useState<Card | null>(null);
  const [username, setUsername] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("edit") === "1") setIsEditing(true);
  }, []);
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

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ??
    (typeof window !== "undefined" ? window.location.origin : "");
  const cardUrl = username && card.slug ? `${appUrl}/card/${username}/${card.slug}` : "";

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

        {isEditing ? (
          <div className="p-4 flex flex-col gap-6">
            {/* Image uploads */}
            <div className="flex gap-8 justify-center py-2">
              <ImageUploadField
                cardId={card.id}
                field="photo_url"
                currentUrl={card.photo_url ?? null}
                shape="circle"
                label="Photo"
                onUploaded={(url) => setCard((c) => c ? { ...c, photo_url: url } : c)}
              />
              <ImageUploadField
                cardId={card.id}
                field="logo_url"
                currentUrl={card.logo_url ?? null}
                shape="square"
                label="Logo"
                onUploaded={(url) => setCard((c) => c ? { ...c, logo_url: url } : c)}
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <CardForm
              initialValues={formValues}
              onSubmit={handleSave}
              submitLabel="Save changes"
              loading={saving}
            />
            <button
              onClick={handleDelete}
              className="text-xs text-black/30 hover:text-red-500 transition-colors text-center"
            >
              Delete card
            </button>
          </div>
        ) : (
          <>
            <div className="p-4 flex flex-col gap-6 pb-28">
              {/* QR Code */}
              {cardUrl && (
                <div className="flex flex-col items-center gap-3 border border-black/10 rounded-xl py-6">
                  <QRCodeSVG value={cardUrl} size={180} fgColor="#1a2744" bgColor="#ffffff" />
                  <p className="text-xs text-black/40 font-mono px-4 text-center break-all">{cardUrl}</p>
                </div>
              )}

              {/* Business card visual */}
              <BusinessCardVisual card={card} />
            </div>

            {/* Share button — fixed above bottom nav */}
            <button
              onClick={() => setShowShare(true)}
              className="fixed bottom-20 left-4 right-4 bg-accent text-white text-sm font-semibold py-3 rounded-full flex items-center justify-center gap-2"
            >
              <Share2 size={16} strokeWidth={1.5} />
              Share
            </button>
          </>
        )}
      </div>

      {showShare && card && username && (
        <ShareSheet card={card} username={username} onClose={() => setShowShare(false)} />
      )}
    </>
  );
}
