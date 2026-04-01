"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { ContactWithCard } from "@/lib/types";

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

interface ContactListItemProps {
  contact: ContactWithCard;
}

export function ContactListItem({ contact }: ContactListItemProps) {
  const [photoError, setPhotoError] = useState(false);
  const sub = [contact.job_title, contact.company].filter(Boolean).join(" at ");
  const showPhoto = !!contact.photo_url && !photoError;
  const initials = getInitials(contact.name);

  return (
    <Link
      href={`/contacts/${contact.id}`}
      className="flex items-center gap-3 px-4 py-3 hover:bg-black/[0.02] transition-colors"
    >
      {/* Avatar */}
      <div className="w-10 h-10 rounded-full bg-accent/10 border border-black/10 overflow-hidden flex items-center justify-center shrink-0">
        {showPhoto ? (
          <img
            src={contact.photo_url!}
            alt={contact.name}
            className="w-full h-full object-cover"
            onError={() => setPhotoError(true)}
          />
        ) : (
          <span className="text-xs font-semibold text-accent">{initials}</span>
        )}
      </div>

      {/* Text */}
      <div className="flex flex-col min-w-0 gap-0.5 flex-1">
        <span className="text-sm font-medium truncate">{contact.name}</span>
        {sub && <span className="text-xs text-black/40 truncate">{sub}</span>}
        {contact.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-0.5">
            {contact.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs text-accent bg-accent/10 px-1.5 py-0.5 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <ChevronRight size={16} className="text-black/30 shrink-0" strokeWidth={1.5} />
    </Link>
  );
}
