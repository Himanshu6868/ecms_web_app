import {
  EmailAuthProvider,
  type Auth,
  type UserCredential,
  fetchSignInMethodsForEmail,
  isSignInWithEmailLink,
  sendSignInLinkToEmail,
  signInWithEmailLink
} from "firebase/auth";
import { auth } from "@/lib/firebase";

export const EMAIL_STORAGE_KEY = "emailForSignIn";

const resolveActionUrl = (): string => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${baseUrl.replace(/\/$/, "")}/auth/action`;
};

export const actionCodeSettings = {
  url: resolveActionUrl(),
  handleCodeInApp: true
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isValidEmail = (email: string): boolean => EMAIL_REGEX.test(email.trim().toLowerCase());

export const sendMagicLink = async (email: string, instance: Auth = auth): Promise<void> => {
  const normalizedEmail = email.trim().toLowerCase();
  await sendSignInLinkToEmail(instance, normalizedEmail, actionCodeSettings);
  window.localStorage.setItem(EMAIL_STORAGE_KEY, normalizedEmail);
};

export const linkIsSignInLink = (link: string, instance: Auth = auth): boolean => isSignInWithEmailLink(instance, link);

export const completeMagicLinkSignIn = async (
  email: string,
  link: string,
  instance: Auth = auth
): Promise<UserCredential> => {
  const normalizedEmail = email.trim().toLowerCase();
  const result = await signInWithEmailLink(instance, normalizedEmail, link);
  window.localStorage.removeItem(EMAIL_STORAGE_KEY);
  return result;
};

export const getSavedEmailForSignIn = (): string | null => window.localStorage.getItem(EMAIL_STORAGE_KEY);

export const getEmailSignInMethods = async (email: string, instance: Auth = auth): Promise<string[]> => {
  const normalizedEmail = email.trim().toLowerCase();
  return fetchSignInMethodsForEmail(instance, normalizedEmail);
};

export const hasEmailLinkSignInMethod = (methods: string[]): boolean => methods.includes(EmailAuthProvider.EMAIL_LINK_SIGN_IN_METHOD);
