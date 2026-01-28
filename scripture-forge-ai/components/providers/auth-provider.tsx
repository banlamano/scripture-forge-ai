"use client";

import { SessionProvider } from "next-auth/react";
import { type ReactNode } from "react";

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <SessionProvider
      // In WebViews, focus/visibility events can be unreliable; poll briefly so session state updates quickly
      // after native sign-in.
      refetchInterval={5}
      refetchOnWindowFocus
    >
      {children}
    </SessionProvider>
  );
}
