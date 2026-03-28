import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Mail, Phone, ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ContactActions } from "@/components/cards/contact-actions";
import type { Card } from "@/lib/types";

interface PageProps {
  params: { username: string; slug: string };
}

async function getCard(username: string, slug: string): Promise<Card | null> {
  const supabase = createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .single();

  if (!profile) return null;

  const { data: card } = await supabase
    .from("cards")
    .select("*")
    .eq("user_id", profile.id)
    .eq("slug", slug)
    .single();

  return card ?? null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const card = await getCard(params.username, params.slug);
  if (!card) return { title: "Card not found — Net" };
  return {
    title: `${card.name} — Net`,
    description: [card.job_title, card.company].filter(Boolean).join(" at "),
  };
}

const contactFields: { key: keyof Card; label: string; icon: React.ElementType }[] = [
  { key: "email", label: "Email", icon: Mail },
  { key: "phone", label: "Phone", icon: Phone },
  { key: "linkedin_url", label: "LinkedIn", icon: ExternalLink },
];

export default async function PublicCardPage({ params }: PageProps) {
  const supabase = createClient();
  const card = await getCard(params.username, params.slug);
  if (!card) notFound();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let viewer: { id: string; isOwner: boolean; alreadySaved: boolean } | null = null;
  if (user) {
    const isOwner = user.id === card.user_id;
    if (!isOwner) {
      const { data } = await supabase
        .from("contacts")
        .select("id")
        .eq("owner_id", user.id)
        .eq("card_id", card.id)
        .maybeSingle();
      viewer = { id: user.id, isOwner: false, alreadySaved: !!data };
    } else {
      viewer = { id: user.id, isOwner: true, alreadySaved: false };
    }
  }

  const subtitle = [card.job_title, card.company].filter(Boolean).join(" at ");

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-sm mx-auto px-4 pt-12 pb-16 flex flex-col gap-8">
        {/* Wordmark */}
        <p className="text-xs font-semibold tracking-widest text-accent uppercase text-center">
          Net
        </p>

        {/* Identity */}
        <div className="text-center">
          <h1 className="text-2xl font-semibold">{card.name}</h1>
          {subtitle && <p className="text-sm text-black/50 mt-1">{subtitle}</p>}
        </div>

        {/* Contact fields */}
        {contactFields.some(({ key }) => !!card[key]) && (
          <div className="divide-y divide-black/10 border-t border-b border-black/10">
            {contactFields.map(({ key, label, icon: Icon }) => {
              const value = card[key] as string;
              if (!value) return null;
              return (
                <div key={key} className="flex items-center gap-3 py-3">
                  <Icon size={16} className="text-black/30 shrink-0" strokeWidth={1.5} />
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs text-black/40">{label}</span>
                    <span className="text-sm break-all">{value}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* CTA */}
        <ContactActions card={card} viewer={viewer} username={params.username} />
      </div>
    </div>
  );
}
