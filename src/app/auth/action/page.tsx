"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";
import {
  completeMagicLinkSignIn,
  getSavedEmailForSignIn,
  hasEmailLinkSignInMethod,
  getEmailSignInMethods,
  isValidEmail,
  linkIsSignInLink
} from "@/lib/auth";

export default function AuthActionPage() {
  const [email, setEmail] = useState("");
  const [needsEmail, setNeedsEmail] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { notify } = useToast();
  const router = useRouter();

  useEffect(() => {
    const run = async () => {
      const currentUrl = window.location.href;
      if (!linkIsSignInLink(currentUrl)) {
        notify("Invalid or expired sign-in link.", "error");
        setLoading(false);
        return;
      }

      const savedEmail = getSavedEmailForSignIn();
      if (!savedEmail) {
        setNeedsEmail(true);
        setLoading(false);
        return;
      }

      try {
        await completeMagicLinkSignIn(savedEmail, currentUrl);
        notify("Login successful.", "success");
        router.replace("/dashboard");
      } catch {
        notify("This sign-in link is invalid or has expired.", "error");
        setNeedsEmail(true);
      } finally {
        setLoading(false);
      }
    };

    void run();
  }, [notify, router]);

  const handleManualComplete = async () => {
    if (!isValidEmail(email)) {
      notify("Please enter a valid email address.", "error");
      return;
    }

    setSubmitting(true);
    try {
      const signInMethods = await getEmailSignInMethods(email);
      if (!hasEmailLinkSignInMethod(signInMethods)) {
        notify("No pending email-link sign-in found for this account.", "error");
        setSubmitting(false);
        return;
      }

      await completeMagicLinkSignIn(email, window.location.href);
      notify("Login successful.", "success");
      router.replace("/dashboard");
    } catch {
      notify("Unable to complete sign-in. Request a new magic link.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <section className="mx-auto flex min-h-[60vh] max-w-md items-center justify-center">
        <p className="text-slate-300">Verifying your sign-in link...</p>
      </section>
    );
  }

  return (
    <section className="mx-auto flex min-h-[60vh] max-w-md items-center">
      <div className="w-full space-y-4 rounded-xl border border-slate-800 bg-panel p-6">
        <h1 className="text-2xl font-bold">Complete sign-in</h1>
        {needsEmail ? (
          <>
            <p className="text-sm text-slate-300">For security, confirm the email used to request this magic link.</p>
            <label htmlFor="confirm-email" className="block text-sm font-medium text-slate-200">
              Email address
            </label>
            <input
              id="confirm-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full"
              autoComplete="email"
              placeholder="you@company.com"
              disabled={submitting}
            />
            <button
              type="button"
              onClick={() => void handleManualComplete()}
              disabled={submitting}
              className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Signing in..." : "Complete sign-in"}
            </button>
          </>
        ) : (
          <p className="text-sm text-slate-300">If you are not redirected automatically, request a new magic link from login.</p>
        )}
      </div>
    </section>
  );
}
