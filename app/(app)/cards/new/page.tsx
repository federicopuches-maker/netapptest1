"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CardForm } from "@/components/cards/card-form";
import { useAuth } from "@/contexts/auth-context";
import { createClient } from "@/lib/supabase/client";
import { slugify, makeUniqueSlug } from "@/lib/slugify";
import type { CardFormValues } from "@/lib/types";

const empty: CardFormValues = {
  title: "",
  name: "",
  job_title: "",
  company: "",
  email: "",
  phone: "",
  linkedin_url: "",
};

export default function NewCardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (values: CardFormValues) => {
    if (!user) return;
    setLoading(true);
    setError(null);

    const supabase = createClient();

    // Fetch existing slugs to ensure uniqueness
    const { data: existing } = await supabase
      .from("cards")
      .select("slug")
      .eq("user_id", user.id);

    const existingSlugs = (existing ?? []).map((c) => c.slug);
    const slug = makeUniqueSlug(slugify(values.title), existingSlugs);

    const { data, error } = await supabase
      .from("cards")
      .insert({ ...values, user_id: user.id, slug })
      .select("id")
      .single();

    if (error || !data) {
      setError(error?.message ?? "Failed to create card");
      setLoading(false);
      return;
    }

    window.location.href = `/cards/${data.id}`;
  };

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="flex items-center px-4 h-14 border-b border-black/10 gap-3">
        <Link href="/cards" className="text-black/40 hover:text-black transition-colors">
          <ArrowLeft size={20} strokeWidth={1.5} />
        </Link>
        <h1 className="text-base font-semibold flex-1 text-center pr-8">New card</h1>
      </div>

      <div className="p-4">
        {error && <p className="text-sm text-red-500 mb-4">{error}</p>}
        <CardForm
          initialValues={empty}
          onSubmit={handleSubmit}
          submitLabel="Create card"
          loading={loading}
        />
      </div>
    </div>
  );
}
