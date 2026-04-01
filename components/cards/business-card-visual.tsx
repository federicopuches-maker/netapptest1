"use client";

import { Mail, Phone, ExternalLink } from "lucide-react";
import type { Card } from "@/lib/types";

interface BusinessCardVisualProps {
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

export function BusinessCardVisual({ card }: BusinessCardVisualProps) {
  const initials = getInitials(card.name);
  const subtitle = [card.job_title, card.company].filter(Boolean).join(" · ");
  const contacts = [
    { key: "email", value: card.email, Icon: Mail },
    { key: "phone", value: card.phone, Icon: Phone },
    { key: "linkedin_url", value: card.linkedin_url, Icon: ExternalLink },
  ].filter((c) => !!c.value);

  return (
    <div className="border border-black/10 rounded-xl overflow-hidden">
      {/* Banner */}
      <div className="bg-accent h-16" />

      {/* Avatar overlapping banner */}
      <div className="flex justify-center -mt-8 mb-3">
        <div className="w-16 h-16 rounded-full bg-white border-2 border-black/10 flex items-center justify-center">
          <span className="text-accent text-lg font-semibold">{initials}</span>
        </div>
      </div>

      {/* Identity */}
      <div className="text-center px-4 pb-4">
        <p className="text-base font-semibold">{card.name}</p>
        {subtitle && <p className="text-sm text-black/50 mt-0.5">{subtitle}</p>}
      </div>

      {/* Contact rows */}
      {contacts.length > 0 && (
        <div className="divide-y divide-black/10 border-t border-black/10">
          {contacts.map(({ key, value, Icon }) => (
            <div key={key} className="flex items-center gap-3 px-4 py-3">
              <Icon size={16} className="text-black/30 shrink-0" strokeWidth={1.5} />
              <span className="text-sm break-all">{value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
