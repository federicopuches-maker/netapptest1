import Link from "next/link";
import { Plus, Settings } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { CardListItem } from "@/components/cards/card-list-item";

export default async function CardsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: cards } = await supabase
    .from("cards")
    .select("id, title, slug")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: true });

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-14 border-b border-black/10">
        <h1 className="text-base font-semibold">Cards</h1>
        <Link href="/settings" className="text-black/40 hover:text-black transition-colors" aria-label="Settings">
          <Settings size={18} strokeWidth={1.5} />
        </Link>
      </div>

      {/* List */}
      {cards && cards.length > 0 ? (
        <div className="divide-y divide-black/10">
          {cards.map((card) => (
            <CardListItem key={card.id} id={card.id} title={card.title} />
          ))}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-4">
          <p className="text-sm text-black/40">No cards yet</p>
          <Link
            href="/cards/new"
            className="text-sm font-medium text-accent underline underline-offset-2"
          >
            Create your first card
          </Link>
        </div>
      )}

      {/* FAB */}
      <Link
        href="/cards/new"
        className="fixed bottom-24 right-4 w-12 h-12 rounded-full bg-accent text-white flex items-center justify-center"
        aria-label="New card"
      >
        <Plus size={22} />
      </Link>
    </div>
  );
}
