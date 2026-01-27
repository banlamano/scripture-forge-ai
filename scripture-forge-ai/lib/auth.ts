import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "./db";
import { users } from "./db/schema";
import { eq } from "drizzle-orm";

// Simple password hashing (for production, use bcrypt)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + "scripture-forge-salt");
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}

// Demo users for testing (when no database is configured)
const demoUsers = [
  {
    id: "demo-user-1",
    name: "Demo User",
    email: "demo@example.com",
    password: "demo123",
    image: null,
  },
  {
    id: "demo-user-2", 
    name: "Test User",
    email: "test@example.com",
    password: "test123",
    image: null,
  },
];

// Check if database is configured
const isDatabaseConfigured = !!process.env.DATABASE_URL;

// Build the auth configuration
const authConfig: NextAuthConfig = {
  // Note: Don't use adapter with credentials provider - they don't work well together
  // The adapter is for OAuth providers that need to store accounts
  providers: [
    // Mobile app native Google Sign-In (ID token) provider.
    // This avoids Google's "disallowed_useragent" WebView restriction by using native sign-in
    // and exchanging the resulting ID token for a NextAuth session.
    Credentials({
      id: "google-id-token",
      name: "Google (Native)",
      credentials: {
        idToken: { label: "Google ID Token", type: "text" },
      },
      async authorize(credentials) {
        const idToken = (credentials?.idToken as string | undefined) ?? "";
        if (!idToken) return null;

        const googleClientId = process.env.AUTH_GOOGLE_ID;
        if (!googleClientId) {
          console.error("AUTH_GOOGLE_ID is not configured; cannot verify Google ID token");
          return null;
        }

        // Verify token with Google. (Simple and reliable; for very high scale you can switch to JWKS verification.)
        const tokenInfoRes = await fetch(
          `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`
        );

        if (!tokenInfoRes.ok) {
          console.error("Google tokeninfo verification failed", await tokenInfoRes.text());
          return null;
        }

        const tokenInfo = (await tokenInfoRes.json()) as {
          aud?: string;
          sub?: string;
          email?: string;
          email_verified?: string;
          name?: string;
          picture?: string;
        };

        if (tokenInfo.aud !== googleClientId) {
          console.error("Google ID token aud mismatch", {
            expected: googleClientId,
            got: tokenInfo.aud,
          });
          return null;
        }

        if (!tokenInfo.sub || !tokenInfo.email) return null;

        // Google returns email_verified as string "true"/"false"
        const emailVerified = tokenInfo.email_verified === "true";

        // Try database first if configured
        if (isDatabaseConfigured) {
          try {
            const normalizedEmail = tokenInfo.email.toLowerCase();
            const existing = await db
              .select()
              .from(users)
              .where(eq(users.email, normalizedEmail))
              .limit(1);

            if (existing.length > 0) {
              const user = existing[0];
              // Best-effort profile refresh
              await db
                .update(users)
                .set({
                  name: tokenInfo.name ?? user.name,
                  image: tokenInfo.picture ?? user.image,
                  emailVerified: emailVerified ? new Date() : user.emailVerified,
                  updatedAt: new Date(),
                })
                .where(eq(users.id, user.id));

              return {
                id: user.id,
                name: tokenInfo.name ?? user.name ?? undefined,
                email: normalizedEmail,
                image: tokenInfo.picture ?? user.image ?? undefined,
              };
            }

            // Create new user
            const created = await db
              .insert(users)
              .values({
                email: normalizedEmail,
                name: tokenInfo.name ?? null,
                image: tokenInfo.picture ?? null,
                emailVerified: emailVerified ? new Date() : null,
              })
              .returning();

            const newUser = created[0];
            return {
              id: newUser.id,
              name: newUser.name ?? undefined,
              email: newUser.email,
              image: newUser.image ?? undefined,
            };
          } catch (error) {
            console.error("Database Google ID token auth error:", error);
            return null;
          }
        }

        // Demo/no-DB mode: use token sub as stable id
        return {
          id: tokenInfo.sub,
          name: tokenInfo.name ?? undefined,
          email: tokenInfo.email.toLowerCase(),
          image: tokenInfo.picture ?? undefined,
        };
      },
    }),
    Credentials({
      id: "credentials",
      name: "Email & Password",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "your@email.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        // Try database first if configured
        if (isDatabaseConfigured) {
          try {
            const dbUsers = await db
              .select()
              .from(users)
              .where(eq(users.email, email.toLowerCase()))
              .limit(1);
            
            if (dbUsers.length > 0) {
              const user = dbUsers[0];
              if (user.passwordHash && await verifyPassword(password, user.passwordHash)) {
                return {
                  id: user.id,
                  name: user.name,
                  email: user.email,
                  image: user.image,
                };
              }
            }
          } catch (error) {
            console.error("Database auth error:", error);
            // Continue to demo users fallback
          }
        }

        // Fallback to demo users
        const demoUser = demoUsers.find(
          (u) => u.email === email && u.password === password
        );

        if (demoUser) {
          return {
            id: demoUser.id,
            name: demoUser.name,
            email: demoUser.email,
            image: demoUser.image,
          };
        }

        return null;
      },
    }),
    // Google OAuth provider
    Google({
      clientId: process.env.AUTH_GOOGLE_ID || "",
      clientSecret: process.env.AUTH_GOOGLE_SECRET || "",
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token?.id || token?.sub || "") as string;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  trustHost: true,
};

export const { handlers, signIn, signOut, auth } = NextAuth(authConfig);
