export interface SFGoogleAuthPlugin {
  signIn(): Promise<{ idToken: string; email?: string; displayName?: string; photoUrl?: string }>;
  signOut(): Promise<void>;
}

// Dynamic import to avoid build errors when @capacitor/core is not installed
let SFGoogleAuthPlugin: SFGoogleAuthPlugin | null = null;

export const SFGoogleAuth: SFGoogleAuthPlugin = {
  async signIn() {
    if (typeof window === "undefined") {
      throw new Error("SFGoogleAuth can only be used in browser environment");
    }
    
    if (!SFGoogleAuthPlugin) {
      try {
        const { registerPlugin } = await import("@capacitor/core");
        SFGoogleAuthPlugin = registerPlugin<SFGoogleAuthPlugin>("SFGoogleAuth");
      } catch (error) {
        console.error("Failed to load Capacitor plugin:", error);
        throw new Error("Capacitor plugin not available");
      }
    }
    
    return SFGoogleAuthPlugin.signIn();
  },
  
  async signOut() {
    if (typeof window === "undefined") {
      throw new Error("SFGoogleAuth can only be used in browser environment");
    }
    
    if (!SFGoogleAuthPlugin) {
      try {
        const { registerPlugin } = await import("@capacitor/core");
        SFGoogleAuthPlugin = registerPlugin<SFGoogleAuthPlugin>("SFGoogleAuth");
      } catch (error) {
        console.error("Failed to load Capacitor plugin:", error);
        throw new Error("Capacitor plugin not available");
      }
    }
    
    return SFGoogleAuthPlugin.signOut();
  }
};

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
