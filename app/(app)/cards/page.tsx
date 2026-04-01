import Link from "next/link";
import { Plus, Settings } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { CardsCarousel } from "@/components/cards/cards-carousel";
import type { Card } from "@/lib/types";

export default async function CardsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: cards }, { data: profile }] = await Promise.all([
    supabase
      .from("cards")
      .select("*")
      .eq("user_id", user!.id)
      .order("is_favorite", { ascending: false })
      .order("created_at", { ascending: true }),
    supabase.from("profiles").select("username").eq("id", user!.id).single(),
  ]);

  return (
    <div className="flex flex-col min-h-full">
      <div className="flex items-center justify-between px-4 h-14 border-b border-black/10">
        <h1 className="text-base font-semibold">Cards</h1>
        <Link
          href="/settings"
          className="text-black/40 hover:text-black transition-colors"
          aria-label="Settings"
        >
          <Settings size={18} strokeWidth={1.5} />
        </Link>
      </div>

      <CardsCarousel
        cards={(cards ?? []) as Card[]}
        username={profile?.username ?? ""}
      />

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
