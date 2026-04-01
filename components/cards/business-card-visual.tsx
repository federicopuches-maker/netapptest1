"use client";

import { useState } from "react";
import { Mail, Phone, ExternalLink } from "lucide-react";
import type { Card } from "@/lib/types";

interface BusinessCardVisualProps {
  card: Card;
  compact?: boolean;
}

function getInitials(name: string): string {
  return name.trim().split(/\s+/).slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "").join("");
}

export function BusinessCardVisual({ card, compact = false }: BusinessCardVisualProps) {
  const [photoError, setPhotoError] = useState(false);
  const [logoError, setLogoError] = useState(false);

  const initials = getInitials(card.name);
  const contacts = [
    { key: "email", value: card.email, Icon: Mail },
    { key: "phone", value: card.phone, Icon: Phone },
    { key: "linkedin_url", value: card.linkedin_url, Icon: ExternalLink },
  ].filter((c) => !!c.value);

  const showPhoto = !!card.photo_url && !photoError;
  const showLogo = !!card.logo_url && !logoError;

  return (
    <div className="border border-black/10 rounded-xl overflow-hidden">
      {/* Accent banner — thin strip, edit/star buttons overlay here */}
      <div className={`bg-accent ${compact ? "h-10" : "h-12"}`} />

      {/* Profile photo — sits below banner, no overlap */}
      <div className="flex justify-center pt-4 mb-3">
        <div
          className={`rounded-full bg-white border-2 border-black/10 overflow-hidden flex items-center justify-center ${
            compact ? "w-14 h-14" : "w-20 h-20"
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
              className={`text-accent font-semibold ${compact ? "text-base" : "text-xl"}`}
            >
              {initials}
            </span>
          )}
        </div>
      </div>

      {/* Identity */}
      <div className={`text-center px-4 ${compact ? "pb-2" : "pb-4"}`}>
        <p className={`font-semibold ${compact ? "text-sm" : "text-base"}`}>{card.name}</p>
        {card.job_title && (
          <p className={`text-black/50 mt-0.5 ${compact ? "text-xs" : "text-sm"}`}>
            {card.job_title}
          </p>
        )}
        {card.company && (
          <div className="flex items-center justify-center gap-1.5 mt-0.5">
            <p className={`text-black/50 ${compact ? "text-xs" : "text-sm"}`}>
              {card.company}
            </p>
            {showLogo && (
              <div className="w-4 h-4 rounded overflow-hidden flex-shrink-0">
                <img
                  src={card.logo_url!}
                  alt="logo"
                  className="w-full h-full object-contain"
                  onError={() => setLogoError(true)}
                />
              </div>
            )}
          </div>
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
