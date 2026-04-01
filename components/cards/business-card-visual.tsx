"use client";

import { useState } from "react";
import { Mail, Phone, ExternalLink } from "lucide-react";
import type { Card } from "@/lib/types";

interface BusinessCardVisualProps {
  card: Card;
  compact?: boolean;
}

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function BusinessCardVisual({ card, compact = false }: BusinessCardVisualProps) {
  const [photoError, setPhotoError] = useState(false);
  const [logoError, setLogoError] = useState(false);

  const initials = getInitials(card.name);
  const subtitle = [card.job_title, card.company].filter(Boolean).join(" · ");
  const contacts = [
    { key: "email", value: card.email, Icon: Mail },
    { key: "phone", value: card.phone, Icon: Phone },
    { key: "linkedin_url", value: card.linkedin_url, Icon: ExternalLink },
  ].filter((c) => !!c.value);

  const showPhoto = !!card.photo_url && !photoError;
  const showLogo = !!card.logo_url && !logoError;

  return (
    <div className="border border-black/10 rounded-xl overflow-hidden">
      {/* Banner with optional logo */}
      <div className={`bg-accent relative ${compact ? "h-10" : "h-16"}`}>
        {showLogo && (
          <div className="absolute top-2 right-2 w-8 h-8 rounded bg-white/90 overflow-hidden flex items-center justify-center">
            <img
              src={card.logo_url!}
              alt="Company logo"
              className="w-full h-full object-contain p-0.5"
              onError={() => setLogoError(true)}
            />
          </div>
        )}
      </div>

      {/* Avatar overlapping banner */}
      <div className={`flex justify-center ${compact ? "-mt-5 mb-2" : "-mt-8 mb-3"}`}>
        <div
          className={`rounded-full bg-white border-2 border-black/10 overflow-hidden flex items-center justify-center ${
            compact ? "w-10 h-10" : "w-16 h-16"
          }`}
        >
          {showPhoto ? (
            <img
              src={card.photo_url!}
              alt={card.name}
              className="w-full h-full object-cover"
              onError={() => setPhotoError(true)}
            />
          ) : (
            <span
              className={`text-accent font-semibold ${compact ? "text-sm" : "text-lg"}`}
            >
              {initials}
            </span>
          )}
        </div>
      </div>

      {/* Identity */}
      <div className={`text-center px-4 ${compact ? "pb-2" : "pb-4"}`}>
        <p className={`font-semibold ${compact ? "text-sm" : "text-base"}`}>{card.name}</p>
        {subtitle && (
          <p className={`text-black/50 mt-0.5 ${compact ? "text-xs" : "text-sm"}`}>
            {subtitle}
          </p>
        )}
      </div>

      {/* Contact rows */}
      {contacts.length > 0 && (
        <div className="divide-y divide-black/10 border-t border-black/10">
          {contacts.map(({ key, value, Icon }) => (
            <div
              key={key}
              className={`flex items-center gap-3 px-4 ${compact ? "py-2" : "py-3"}`}
            >
              <Icon size={14} className="text-black/30 shrink-0" strokeWidth={1.5} />
              <span className="text-xs break-all">{value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
