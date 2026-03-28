"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // Session is null when email confirmation is required
    if (data.session) {
      window.location.href = "/cards";
    } else {
      setConfirmEmail(true);
      setLoading(false);
    }
  };

  if (confirmEmail) {
    return (
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold mb-2">Check your email</h1>
        <p className="text-sm text-black/60">
          We sent a confirmation link to <span className="font-medium text-black">{email}</span>.
          Click it to activate your account, then{" "}
          <Link href="/login" className="text-accent underline underline-offset-2">
            sign in
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <h1 className="text-2xl font-semibold mb-1">Create account</h1>
      <p className="text-sm text-black/40 mb-8">
        Already have an account?{" "}
        <Link href="/login" className="text-accent underline underline-offset-2">
          Sign in
        </Link>
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-black/20 rounded-md px-3 py-2 text-sm outline-none focus:border-accent transition-colors"
            placeholder="you@example.com"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-sm font-medium">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-black/20 rounded-md px-3 py-2 text-sm outline-none focus:border-accent transition-colors"
            placeholder="••••••••"
          />
          <p className="text-xs text-black/40">Minimum 6 characters</p>
        </div>

        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-accent text-white text-sm font-medium py-2.5 rounded-md disabled:opacity-50 transition-opacity"
        >
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>
    </div>
  );
}
