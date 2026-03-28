import { createClient } from "@/lib/supabase/server";
import { ContactListItem } from "@/components/cards/contact-list-item";
import type { ContactWithCard } from "@/lib/types";

export default async function ContactsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: rows } = await supabase
    .from("contacts")
    .select(`id, card_id, saved_at, cards ( name, job_title, company, slug, profiles ( username ) )`)
    .eq("owner_id", user!.id)
    .order("saved_at", { ascending: false });

  type Row = { id: string; card_id: string; saved_at: string; cards: { name: string; job_title: string; company: string; slug: string; profiles: { username: string } | null } | null };
  const contacts: ContactWithCard[] = ((rows ?? []) as unknown as Row[]).map((row) => ({
    id: row.id,
    card_id: row.card_id,
    saved_at: row.saved_at,
    name: row.cards?.name ?? "",
    job_title: row.cards?.job_title ?? "",
    company: row.cards?.company ?? "",
    slug: row.cards?.slug ?? "",
    username: row.cards?.profiles?.username ?? "",
  }));

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="flex items-center px-4 h-14 border-b border-black/10">
        <h1 className="text-base font-semibold">Contacts</h1>
      </div>

      {contacts.length > 0 ? (
        <div className="divide-y divide-black/10">
          {contacts.map((c) => (
            <ContactListItem key={c.id} contact={c} />
          ))}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center gap-2 text-center px-4">
          <p className="text-sm text-black/40">No saved contacts yet</p>
          <p className="text-xs text-black/30">
            When someone shares their Net card with you, save it here.
          </p>
        </div>
      )}
    </div>
  );
}
