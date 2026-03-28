"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { createClient } from "@/lib/supabase/client";

const inputClass =
  "w-full border border-black/20 rounded-md px-3 py-2 text-sm outline-none focus:border-accent transition-colors";

function isValidUsername(value: string): boolean {
  return /^[a-z0-9_-]{3,30}$/.test(value);
}

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const [username, setUsername] = useState("");
  const [original, setOriginal] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    if (!user) return;
    const supabase = createClient();
    supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setUsername(data.username);
          setOriginal(data.username);
        }
        setLoadingProfile(false);
      });
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setError(null);
    setSuccess(false);

    if (!isValidUsername(username)) {
      setError("Username must be 3–30 characters: lowercase letters, numbers, _ or -");
      return;
    }

    if (username === original) {
      setError("That's already your username.");
      return;
    }

    setSaving(true);
    const supabase = createClient();

    const { error } = await supabase
      .from("profiles")
      .update({ username, updated_at: new Date().toISOString() })
      .eq("id", user.id);

    if (error) {
      setError(
        error.code === "23505"
          ? "That username is already taken."
          : error.message
      );
      setSaving(false);
      return;
    }

    setOriginal(username);
    setSuccess(true);
    setSaving(false);
    setTimeout(() => setSuccess(false), 3000);
  };

  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/login";
  };

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="flex items-center px-4 h-14 border-b border-black/10 gap-3">
        <Link href="/cards" className="text-black/40 hover:text-black transition-colors">
          <ArrowLeft size={20} strokeWidth={1.5} />
        </Link>
        <h1 className="text-base font-semibold flex-1 text-center pr-8">Settings</h1>
      </div>

      <div className="p-4 flex flex-col gap-8">
        {/* Username section */}
        <section className="flex flex-col gap-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-black/40">
            Profile
          </h2>

          {loadingProfile ? (
            <p className="text-sm text-black/40">Loading…</p>
          ) : (
            <form onSubmit={handleSave} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase())}
                  className={inputClass}
                  placeholder="yourname"
                  autoComplete="off"
                  autoCapitalize="none"
                  spellCheck={false}
                />
                <p className="text-xs text-black/40">
                  Your public card URL: /card/<span className="font-mono">{username || "username"}</span>/…
                </p>
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}
              {success && <p className="text-sm text-green-600">Username updated.</p>}

              <button
                type="submit"
                disabled={saving || username === original}
                className="w-full bg-accent text-white text-sm font-medium py-2.5 rounded-md disabled:opacity-50 transition-opacity"
              >
                {saving ? "Saving…" : "Save username"}
              </button>
            </form>
          )}
        </section>

        {/* Account section */}
        <section className="flex flex-col gap-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-black/40">
            Account
          </h2>
          <p className="text-sm text-black/50">{user?.email}</p>
          <button
            onClick={handleSignOut}
            className="w-full border border-black/20 text-sm font-medium py-2.5 rounded-md hover:bg-black/[0.02] transition-colors text-left px-3"
          >
            Sign out
          </button>
        </section>
      </div>
    </div>
  );
}
