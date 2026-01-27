import { registerPlugin } from "@capacitor/core";

export interface SFGoogleAuthPlugin {
  signIn(): Promise<{ idToken: string; email?: string; displayName?: string; photoUrl?: string }>;
  signOut(): Promise<void>;
}

export const SFGoogleAuth = registerPlugin<SFGoogleAuthPlugin>("SFGoogleAuth");

export function isCapacitorNative(): boolean {
  if (typeof window === "undefined") return false;

  const cap = (window as any).Capacitor;
  if (!cap) return false;

  // Capacitor versions differ; support multiple detection strategies.
  if (typeof cap.isNativePlatform === "function") return !!cap.isNativePlatform();
  if (typeof cap.getPlatform === "function") return cap.getPlatform() !== "web";

  // Last-resort heuristic
  const ua = window.navigator?.userAgent ?? "";
  return /Capacitor/i.test(ua);
}
