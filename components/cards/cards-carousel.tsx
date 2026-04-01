"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { Star, Pencil, Share2, Mail, Phone, ExternalLink } from "lucide-react";
import { ShareSheet } from "@/components/cards/share-sheet";
import { createClient } from "@/lib/supabase/client";
import type { Card } from "@/lib/types";

interface CardsCarouselProps {
  cards: Card[];
  username: string;
}

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function CardsCarousel({ cards: initialCards, username }: CardsCarouselProps) {
  const [cards, setCards] = useState<Card[]>(initialCards);
  const [activeIndex, setActiveIndex] = useState(0);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [shareCard, setShareCard] = useState<Card | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Track active card via IntersectionObserver
  useEffect(() => {
    const root = scrollRef.current;
    if (!root) return;
    const observers = cardRefs.current.map((el, i) => {
      if (!el) return null;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) setActiveIndex(i);
        },
        { root, threshold: 0.5 }
      );
      obs.observe(el);
      return obs;
    });
    return () => observers.forEach((obs) => obs?.disconnect());
  }, [cards.length]);

  const scrollToIndex = useCallback((index: number) => {
    const el = scrollRef.current;
    const card = cardRefs.current[index];
    if (!el || !card) return;
    const scrollLeft = card.offsetLeft - (el.clientWidth - card.offsetWidth) / 2;
    el.scrollTo({ left: scrollLeft, behavior: "smooth" });
  }, []);

  const handleFavoriteToggle = useCallback(
    async (card: Card) => {
      if (togglingId) return;
      setTogglingId(card.id);
      const supabase = createClient();
      const isAlreadyFavorite = card.is_favorite;

      setCards((prev) =>
        prev.map((c) => ({
          ...c,
          is_favorite: isAlreadyFavorite ? false : c.id === card.id,
        }))
      );

      if (isAlreadyFavorite) {
        await supabase.from("cards").update({ is_favorite: false }).eq("id", card.id);
      } else {
        await Promise.all([
          supabase
            .from("cards")
            .update({ is_favorite: false })
            .eq("user_id", card.user_id)
            .neq("id", card.id),
          supabase.from("cards").update({ is_favorite: true }).eq("id", card.id),
        ]);
        setCards((prev) =>
          [...prev].sort((a, b) =>
            a.is_favorite === b.is_favorite ? 0 : a.is_favorite ? -1 : 1
          )
        );
        setTimeout(() => scrollToIndex(0), 50);
        setActiveIndex(0);
      }

      setTogglingId(null);
    },
    [togglingId, scrollToIndex]
  );

  if (cards.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-4">
        <p className="text-sm text-black/40">No cards yet</p>
        <Link
          href="/cards/new"
          className="text-sm font-medium text-accent underline underline-offset-2"
        >
          Create your first card
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1">
      {/* Counter + dot indicators */}
      <div className="flex flex-col items-center gap-2 pt-4 pb-3">
        <p className="text-xs text-black/40">
          {activeIndex + 1} of {cards.length} {cards.length === 1 ? "card" : "cards"}
        </p>
        {cards.length > 1 && (
          <div className="flex items-center gap-1.5">
            {cards.map((card, i) => (
              <button
                key={card.id}
                onClick={() => scrollToIndex(i)}
                aria-label={`Go to card ${i + 1}`}
                className={`h-1.5 rounded-full transition-all duration-200 ${
                  i === activeIndex ? "w-5 bg-accent" : "w-1.5 bg-black/20"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Peek scroll container — 6% side padding lets adjacent cards show */}
      <div
        ref={scrollRef}
        className="flex overflow-x-auto snap-x snap-mandatory gap-3 px-[6%] pb-24"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {cards.map((card, i) => {
          const initials = getInitials(card.name);
          const showPhoto = !!card.photo_url;
          const showLogo = !!card.logo_url;
          const subtitle = [card.job_title, card.company].filter(Boolean).join(" · ");
          const contacts = [
            { key: "email", value: card.email, Icon: Mail },
            { key: "phone", value: card.phone, Icon: Phone },
            { key: "linkedin_url", value: card.linkedin_url, Icon: ExternalLink },
          ].filter((c) => !!c.value);

          return (
            <div
              key={card.id}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              className="w-[88%] flex-shrink-0 snap-center"
            >
              <div className="border border-black/10 rounded-2xl overflow-hidden bg-white">
                {/* Photo hero */}
                <div className="relative h-52 bg-accent overflow-hidden">
                  {showPhoto && (
                    <img
                      src={card.photo_url!}
                      alt={card.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                  {!showPhoto && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-4xl font-semibold text-white/50">{initials}</span>
                    </div>
                  )}

                  {/* Title pill — top left */}
                  {card.title && (
                    <div className="absolute top-3 left-3">
                      <span className="bg-white/90 text-accent text-xs font-semibold px-3 py-1 rounded-full">
                        {card.title}
                      </span>
                    </div>
                  )}

                  {/* Star — top right */}
                  <button
                    onClick={() => handleFavoriteToggle(card)}
                    disabled={!!togglingId}
                    aria-label={card.is_favorite ? "Remove favorite" : "Set as favorite"}
                    className="absolute top-3 right-3 p-1.5 rounded-full bg-white/80 disabled:opacity-50"
                  >
                    <Star
                      size={14}
                      strokeWidth={1.5}
                      className={card.is_favorite ? "text-accent fill-accent" : "text-black/30"}
                    />
                  </button>

                  {/* Company logo / initials circle — bottom right */}
                  {(showLogo || card.company) && (
                    <div className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-white border border-black/10 overflow-hidden flex items-center justify-center">
                      {showLogo ? (
                        <img
                          src={card.logo_url!}
                          alt="logo"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <span className="text-xs font-semibold text-accent">
                          {card.company[0]?.toUpperCase()}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Info section */}
                <div className="px-4 pt-3 pb-2">
                  {/* Name with accent left border */}
                  <div className="border-l-2 border-accent pl-3 mb-3">
                    <p className="text-sm font-semibold leading-tight">{card.name}</p>
                    {subtitle && (
                      <p className="text-xs text-black/50 mt-0.5">{subtitle}</p>
                    )}
                  </div>

                  {contacts.length > 0 && (
                    <div className="border-t border-black/10 divide-y divide-black/10">
                      {contacts.map(({ key, value, Icon }) => (
                        <div key={key} className="flex items-center gap-3 py-2">
                          <Icon size={13} className="text-black/30 shrink-0" strokeWidth={1.5} />
                          <span className="text-xs text-black/70 truncate">{value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex gap-2 px-4 pb-4">
                  <Link
                    href={`/cards/${card.id}?edit=1`}
                    className="flex-1 flex items-center justify-center gap-1.5 border border-black/20 text-xs font-medium py-2.5 rounded-full"
                  >
                    <Pencil size={13} strokeWidth={1.5} />
                    Edit
                  </Link>
                  <button
                    onClick={() => setShareCard(card)}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-accent text-white text-xs font-medium py-2.5 rounded-full"
                  >
                    <Share2 size={13} strokeWidth={1.5} />
                    Share
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Share sheet */}
      {shareCard && (
        <ShareSheet card={shareCard} username={username} onClose={() => setShareCard(null)} />
      )}
    </div>
  );
}
