"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/components/ui/Toast";
import { sendMagicLink, isValidEmail } from "@/lib/auth";
import { useAuth } from "@/hooks/useAuth";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const { notify } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();

  const redirectPath = useMemo(() => searchParams.get("redirect") ?? "/dashboard", [searchParams]);

  useEffect(() => {
    if (!loading && user) {
      router.replace(redirectPath);
    }
  }, [loading, redirectPath, router, user]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isValidEmail(email)) {
      notify("Please enter a valid email address.", "error");
      return;
    }

    setSending(true);
    try {
      await sendMagicLink(email);
      notify("Magic link sent. Check your inbox.", "success");
    } catch {
      notify("Unable to send magic link. Please try again.", "error");
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-slate-800 bg-panel p-6">
      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-medium text-slate-200">
          Email address
        </label>
        <input
          id="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@company.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full"
          required
          disabled={sending}
        />
      </div>
      <button
        type="submit"
        disabled={sending}
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {sending ? "Sending..." : "Send Magic Link"}
      </button>
    </form>
  );
}
