"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function JoinForm() {
  const searchParams = useSearchParams();
  const username = searchParams.get("username") ?? "";
  const slug = searchParams.get("slug") ?? "";

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const callbackUrl = typeof window !== "undefined"
    ? `${window.location.origin}/auth/callback?save_username=${encodeURIComponent(username)}&save_slug=${encodeURIComponent(slug)}`
    : "";

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: callbackUrl },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    setSent(true);
    setLoading(false);
  };

  const handleGoogle = async () => {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: callbackUrl },
    });
  };

  if (sent) {
    return (
      <div className="w-full max-w-sm flex flex-col items-center gap-4 text-center">
        <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center">
          <span className="text-2xl">✉️</span>
        </div>
        <div>
          <h1 className="text-xl font-semibold mb-1">Check your email</h1>
          <p className="text-sm text-black/50">
            We sent a magic link to{" "}
            <span className="font-medium text-black">{email}</span>.
            <br />
            Tap it to continue — no password needed.
          </p>
        </div>
        <button
          onClick={() => setSent(false)}
          className="text-sm text-accent underline underline-offset-2"
        >
          Use a different email
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      {/* Wordmark */}
      <p className="text-xs font-semibold tracking-widest text-accent uppercase text-center mb-8">
        Net
      </p>

      <h1 className="text-2xl font-semibold mb-1 text-center">Join Net</h1>
      <p className="text-sm text-black/40 text-center mb-8">
        No password needed — we&apos;ll send you a magic link.
      </p>

      {/* Magic link form */}
      <form onSubmit={handleMagicLink} className="flex flex-col gap-3 mb-4">
        <input
          type="email"
          required
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          className="w-full border border-black/20 rounded-md px-3 py-2.5 text-sm outline-none focus:border-accent transition-colors"
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-accent text-white text-sm font-medium py-3 rounded-full disabled:opacity-50 transition-opacity"
        >
          {loading ? "Sending…" : "Continue with email"}
        </button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-px bg-black/10" />
        <span className="text-xs text-black/30">or</span>
        <div className="flex-1 h-px bg-black/10" />
      </div>

      {/* Google OAuth */}
      <button
        onClick={handleGoogle}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 border border-black/20 text-sm font-medium py-3 rounded-full disabled:opacity-50 transition-colors hover:bg-black/[0.02]"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
          <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
          <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
          <path fill="#FBBC05" d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z"/>
          <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z"/>
        </svg>
        Continue with Google
      </button>

      <p className="text-xs text-black/40 text-center mt-6">
        Already have an account?{" "}
        <Link
          href={`/login?next=${encodeURIComponent(`/card/${username}/${slug}`)}`}
          className="text-accent underline underline-offset-2"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}

export default function JoinPage() {
  return (
    <Suspense>
      <JoinForm />
    </Suspense>
  );
}
