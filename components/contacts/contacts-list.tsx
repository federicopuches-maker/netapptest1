"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { ContactListItem } from "@/components/cards/contact-list-item";
import type { ContactWithCard } from "@/lib/types";

interface ContactsListProps {
  contacts: ContactWithCard[];
}

export function ContactsList({ contacts }: ContactsListProps) {
  const [query, setQuery] = useState("");

  const filtered = query.trim()
    ? contacts.filter((c) => {
        const q = query.toLowerCase();
        return (
          c.name.toLowerCase().includes(q) ||
          c.tags.some((t) => t.toLowerCase().includes(q))
        );
      })
    : contacts;

  if (contacts.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-2 text-center px-4">
        <p className="text-sm text-black/40">No saved contacts yet</p>
        <p className="text-xs text-black/30">
          When someone shares their Net card with you, save it here.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Search bar */}
      <div className="px-4 py-3 border-b border-black/10">
        <div className="flex items-center gap-2 border border-black/20 rounded-lg px-3 py-2">
          <Search size={14} className="text-black/30 shrink-0" strokeWidth={1.5} />
          <input
            type="search"
            placeholder="Search by name or tag…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 text-sm outline-none bg-transparent placeholder:text-black/30"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-black/40 text-center py-12">No results for "{query}"</p>
      ) : (
        <div className="divide-y divide-black/10">
          {filtered.map((c) => (
            <ContactListItem key={c.id} contact={c} />
          ))}
        </div>
      )}
    </div>
  );
}
