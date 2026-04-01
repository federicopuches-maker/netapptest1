import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { ContactWithCard } from "@/lib/types";

export function ContactListItem({ contact }: { contact: ContactWithCard }) {
  const sub = [contact.job_title, contact.company].filter(Boolean).join(" at ");
  return (
    <Link
      href={`/contacts/${contact.id}`}
      className="flex items-center justify-between px-4 py-3 hover:bg-black/[0.02] transition-colors"
    >
      <div className="flex flex-col min-w-0 gap-1">
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
      <ChevronRight size={16} className="text-black/30 shrink-0 ml-2" strokeWidth={1.5} />
    </Link>
  );
}
