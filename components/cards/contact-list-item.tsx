import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { ContactWithCard } from "@/lib/types";

export function ContactListItem({ contact }: { contact: ContactWithCard }) {
  const sub = [contact.job_title, contact.company].filter(Boolean).join(" at ");
  return (
    <Link
      href={`/card/${contact.username}/${contact.slug}`}
      className="flex items-center justify-between h-16 px-4 hover:bg-black/[0.02] transition-colors"
    >
      <div className="flex flex-col min-w-0">
        <span className="text-sm font-medium truncate">{contact.name}</span>
        {sub && <span className="text-xs text-black/40 truncate">{sub}</span>}
      </div>
      <ChevronRight size={16} className="text-black/30 shrink-0 ml-2" strokeWidth={1.5} />
    </Link>
  );
}
