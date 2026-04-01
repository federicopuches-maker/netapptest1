"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { BusinessCardVisual } from "@/components/cards/business-card-visual";
import { createClient } from "@/lib/supabase/client";
import type { Card } from "@/lib/types";

interface CardsCarouselProps {
  cards: Card[];
  username: string;
}

export function CardsCarousel({ cards: initialCards, username }: CardsCarouselProps) {
  const [cards, setCards] = useState<Card[]>(initialCards);
  const [activeIndex, setActiveIndex] = useState(0);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const appUrl =
    typeof window !== "undefined"
      ? (process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin)
      : (process.env.NEXT_PUBLIC_APP_URL ?? "");

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setActiveIndex(Math.round(el.scrollLeft / el.clientWidth));
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const scrollToIndex = useCallback((index: number) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ left: index * el.clientWidth, behavior: "smooth" });
  }, []);

  const handleFavoriteToggle = useCallback(
    async (card: Card) => {
      if (togglingId) return;
      setTogglingId(card.id);
      const supabase = createClient();
      const isAlreadyFavorite = card.is_favorite;

      // Optimistic update
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
      <div
        ref={scrollRef}
        className="flex overflow-x-scroll snap-x snap-mandatory"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {cards.map((card) => {
          const cardUrl =
            username && card.slug ? `${appUrl}/card/${username}/${card.slug}` : "";
          return (
            <div
              key={card.id}
              className="snap-center w-full flex-shrink-0 px-4 py-4 flex flex-col gap-4"
            >
              <Link href={`/cards/${card.id}`} className="block">
                <BusinessCardVisual card={card} />
              </Link>

              {cardUrl && (
                <div className="flex flex-col items-center gap-3 border border-black/10 rounded-xl py-6">
                  <QRCodeSVG value={cardUrl} size={160} fgColor="#1a2744" bgColor="#ffffff" />
                  <p className="text-xs text-black/40 font-mono px-4 text-center break-all">
                    {cardUrl}
                  </p>
                </div>
              )}

              <button
                onClick={() => handleFavoriteToggle(card)}
                disabled={!!togglingId}
                aria-label={card.is_favorite ? "Remove favorite" : "Set as favorite"}
                className="flex items-center justify-center gap-2 w-full py-3 border border-black/10 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
              >
                <Star
                  size={16}
                  strokeWidth={1.5}
                  className={card.is_favorite ? "text-accent fill-accent" : "text-black/30"}
                />
                <span className={card.is_favorite ? "text-accent" : "text-black/60"}>
                  {card.is_favorite ? "Favorited" : "Set as favorite"}
                </span>
              </button>
            </div>
          );
        })}
      </div>

      {cards.length > 1 && (
        <div className="flex items-center justify-center gap-1.5 py-3">
          {cards.map((card, i) => (
            <button
              key={card.id}
              onClick={() => scrollToIndex(i)}
              aria-label={`Go to card ${i + 1}`}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                i === activeIndex ? "bg-accent" : "bg-black/20"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
