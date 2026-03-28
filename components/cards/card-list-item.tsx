import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface CardListItemProps {
  id: string;
  title: string;
}

export function CardListItem({ id, title }: CardListItemProps) {
  return (
    <Link
      href={`/cards/${id}`}
      className="flex items-center justify-between h-14 px-4 hover:bg-black/[0.02] transition-colors"
    >
      <span className="text-sm font-medium">{title}</span>
      <ChevronRight size={16} className="text-black/30" strokeWidth={1.5} />
    </Link>
  );
}
