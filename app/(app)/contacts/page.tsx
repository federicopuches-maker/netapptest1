import { createClient } from "@/lib/supabase/server";
import { ContactsList } from "@/components/contacts/contacts-list";
import type { ContactWithCard } from "@/lib/types";

export default async function ContactsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: rows } = await supabase
    .from("contacts")
    .select(`id, card_id, saved_at, notes, tags, where_met, cards ( name, job_title, company, slug, photo_url, profiles ( username ) )`)
    .eq("owner_id", user!.id)
    .order("saved_at", { ascending: false });

  type Row = {
    id: string;
    card_id: string;
    saved_at: string;
    notes: string | null;
    tags: string[];
    where_met: string | null;
    cards: {
      name: string;
      job_title: string;
      company: string;
      slug: string;
      photo_url: string | null;
      profiles: { username: string } | null;
    } | null;
  };

  const contacts: ContactWithCard[] = ((rows ?? []) as unknown as Row[]).map((row) => ({
    id: row.id,
    card_id: row.card_id,
    saved_at: row.saved_at,
    notes: row.notes,
    tags: row.tags ?? [],
    where_met: row.where_met,
    name: row.cards?.name ?? "",
    job_title: row.cards?.job_title ?? "",
    company: row.cards?.company ?? "",
    slug: row.cards?.slug ?? "",
    username: row.cards?.profiles?.username ?? "",
    photo_url: row.cards?.photo_url ?? null,
  }));

  return (
    <div className="flex flex-col min-h-full">
      <div className="flex items-center px-4 h-14 border-b border-black/10">
        <h1 className="text-base font-semibold">Contacts</h1>
      </div>
      <ContactsList contacts={contacts} />
    </div>
  );
}
