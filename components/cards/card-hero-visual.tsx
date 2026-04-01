"use client";

import { useState } from "react";
import { Mail, Phone, ExternalLink } from "lucide-react";
import type { Card } from "@/lib/types";

interface CardHeroVisualProps {
  card: Card;
}

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function CardHeroVisual({ card }: CardHeroVisualProps) {
  const [photoError, setPhotoError] = useState(false);
  const [logoError, setLogoError] = useState(false);

  const showPhoto = !!card.photo_url && !photoError;
  const showLogo = !!card.logo_url && !logoError;
  const initials = getInitials(card.name);
  const subtitle = [card.job_title, card.company].filter(Boolean).join(" · ");
  const contacts = [
    { key: "email", value: card.email, Icon: Mail },
    { key: "phone", value: card.phone, Icon: Phone },
    { key: "linkedin_url", value: card.linkedin_url, Icon: ExternalLink },
  ].filter((c) => !!c.value);

  return (
    <div className="border border-black/10 rounded-2xl overflow-hidden bg-white">
      {/* Photo hero */}
      <div className="relative h-52 bg-accent overflow-hidden">
        {showPhoto && (
          <img
            src={card.photo_url!}
            alt={card.name}
            className="w-full h-full object-cover"
            onError={() => setPhotoError(true)}
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

        {/* Company logo / initials circle — bottom right */}
        {(showLogo || card.company) && (
          <div className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-white border border-black/10 overflow-hidden flex items-center justify-center">
            {showLogo ? (
              <img
                src={card.logo_url!}
                alt="logo"
                className="w-full h-full object-contain"
                onError={() => setLogoError(true)}
              />
            ) : (
              <span className="text-xs font-semibold text-accent">
                {card.company[0]?.toUpperCase()}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Identity */}
      <div className="px-4 pt-3 pb-2">
        <div className="border-l-2 border-accent pl-3 mb-3">
          <p className="text-sm font-semibold leading-tight">{card.name}</p>
          {subtitle && <p className="text-xs text-black/50 mt-0.5">{subtitle}</p>}
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
    </div>
  );
}
