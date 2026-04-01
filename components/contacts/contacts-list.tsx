"use client";

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { ContactListItem } from "@/components/cards/contact-list-item";
import type { ContactWithCard } from "@/lib/types";

interface ContactsListProps {
  contacts: ContactWithCard[];
}

export function ContactsList({ contacts }: ContactsListProps) {
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    contacts.forEach((c) => c.tags.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [contacts]);

  const filtered = useMemo(() => {
    return contacts.filter((c) => {
      const matchesTag = !activeTag || c.tags.includes(activeTag);
      const matchesQuery = !query.trim() || (() => {
        const q = query.toLowerCase();
        return (
          c.name.toLowerCase().includes(q) ||
          c.tags.some((t) => t.toLowerCase().includes(q))
        );
      })();
      return matchesTag && matchesQuery;
    });
  }, [contacts, query, activeTag]);

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
      <div className="px-4 pt-3 pb-2 border-b border-black/10">
        <div className="flex items-center gap-2 border border-black/20 rounded-lg px-3 py-2">
          <Search size={14} className="text-black/30 shrink-0" strokeWidth={1.5} />
          <input
            type="text"
            placeholder="Search by name or tag…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 text-sm outline-none bg-transparent placeholder:text-black/30"
          />
          {query && (
            <button onClick={() => setQuery("")} aria-label="Clear search">
              <X size={14} className="text-black/30" strokeWidth={1.5} />
            </button>
          )}
        </div>

        {/* Tag filter pills */}
        {allTags.length > 0 && (
          <div
            className="flex gap-2 mt-2 overflow-x-auto"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                className={`shrink-0 text-xs font-medium px-3 py-1 rounded-full border transition-colors ${
                  activeTag === tag
                    ? "bg-accent text-white border-accent"
                    : "text-accent bg-accent/10 border-transparent"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-black/40 text-center py-12">No results</p>
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
