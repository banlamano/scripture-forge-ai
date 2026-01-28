"use client";

import { signIn, useSession } from "next-auth/react";
import { SFGoogleAuth, isCapacitorNative } from "@/lib/mobile/sf-google-auth";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { BookOpen, Mail, Loader2, Lock, AlertCircle, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

function SignInContent() {
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();
  const { status } = useSession();
  const searchParams = useSearchParams();

  const normalizeCallbackUrl = (raw: string | null): string => {
    if (!raw) return "/";

    // Some flows may pass a full URL (or even a Google URL) as callbackUrl.
    // For security and to avoid WebView "spinning" redirects, only allow same-origin
    // callbacks and never redirect into NextAuth callback routes.
    try {
      const url = new URL(raw, window.location.origin);

      const isSameOrigin = url.origin === window.location.origin;
      if (!isSameOrigin) return "/";

      if (url.pathname.startsWith("/api/auth")) return "/";

      return url.pathname + url.search + url.hash;
    } catch {
      // If it's a relative path, keep it (but block auth callback paths)
      if (raw.startsWith("/api/auth")) return "/";
      if (raw.startsWith("/")) return raw;
      return "/";
    }
  };

  const callbackUrl = normalizeCallbackUrl(searchParams.get("callbackUrl"));

  // If already signed in, leave this page immediately (prevents "spinning" state in WebViews)
  useEffect(() => {
    if (status === "authenticated") {
      router.replace(callbackUrl || "/");
      // Extra hard navigation fallback for stubborn WebViews
      setTimeout(() => {
        try {
          window.location.replace(callbackUrl || "/");
        } catch {}
      }, 150);
    }
  }, [status, router, callbackUrl]);
  const t = useTranslations("auth");

  const handleGoogleSignIn = async () => {
    if (isGoogleLoading) return;
    setIsGoogleLoading(true);
    setError("");
    setSuccess("");

    try {
      // In the Capacitor mobile app, use native Google Sign-In to avoid Google's WebView restriction.
      if (isCapacitorNative()) {
        const { idToken } = await SFGoogleAuth.signIn();

        const result = await signIn("google-id-token", {
          idToken,
          redirect: false,
          // NextAuth may return a url, but in WebViews it can be safer to hard-navigate.
          callbackUrl,
        });

        if (result?.error) {
          // If NextAuth returns an error string, show it; otherwise show a generic message.
          setError(result.error || t("error"));
          return;
        }

        // Navigate inside the Next.js app, then refresh to ensure session state is reflected.
        const destination = result?.url || callbackUrl || "/";
        setIsGoogleLoading(false);
        router.replace(destination);
        router.refresh();
        return;
      }

      // Regular web flow
      await signIn("google", { callbackUrl });
    } catch (e) {
      console.error(e);
      const message =
        e instanceof Error
          ? e.message
          : typeof e === "string"
            ? e
            : JSON.stringify(e);

      // Show the real error (especially important for Capacitor native flows)
      setError(message || t("error"));
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || t("error"));
        return;
      }

      setSuccess(t("accountCreated"));
      
      // Auto sign in after registration
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl,
      });

      if (result?.url) {
        window.location.href = result.url;
      }
    } catch {
      setError(t("error"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCredentialsSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        setError(t("invalidCredentials"));
      } else if (result?.url) {
        window.location.href = result.url;
      }
    } catch {
      setError(t("error"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background to-muted/30">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="font-bold text-2xl">
            Scripture<span className="text-primary">Forge</span>
          </span>
        </Link>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              {isRegisterMode ? t("createAccount") : t("welcomeBack")}
            </CardTitle>
            <CardDescription>
              {isRegisterMode 
                ? t("signInDescription")
                : t("signInDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 dark:bg-red-950/50 dark:text-red-400 rounded-lg">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="flex items-center gap-2 p-3 text-sm text-green-600 bg-green-50 dark:bg-green-950/50 dark:text-green-400 rounded-lg">
                <span>{success}</span>
              </div>
            )}

            {/* Google Sign In */}
            <Button
              variant="outline"
              className="w-full h-12"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading || isLoading}
            >
              {isGoogleLoading ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              )}
              {t("google")}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  {t("orContinueWith")}
                </span>
              </div>
            </div>

            {/* Email/Password Form */}
            <form onSubmit={isRegisterMode ? handleRegister : handleCredentialsSignIn} className="space-y-3">
              <div className="space-y-2">
                {isRegisterMode && (
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder={t("name")}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="h-12 pl-10"
                    />
                  </div>
                )}
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder={t("email")}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 pl-10"
                    required
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder={t("password")}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 pl-10"
                    required
                    minLength={isRegisterMode ? 6 : undefined}
                  />
                </div>
              </div>
              <Button 
                type="submit" 
                className="w-full h-12" 
                disabled={!email || !password || isLoading || isGoogleLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : null}
                {isRegisterMode ? t("createAccount") : t("signIn")}
              </Button>
            </form>

            {/* Demo Credentials Info - only show on sign in */}
            {!isRegisterMode && (
              <div className="p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground">
                <p className="font-medium mb-1">{t("demoCredentials")}:</p>
                <p>{t("email")}: <code className="bg-muted px-1 rounded">demo@example.com</code></p>
                <p>{t("password")}: <code className="bg-muted px-1 rounded">demo123</code></p>
              </div>
            )}

            <p className="text-xs text-center text-muted-foreground">
              {t("termsText")}{" "}
              <Link href="/terms" className="underline hover:text-foreground">
                {t("termsOfService")}
              </Link>{" "}
              {t("and")}{" "}
              <Link href="/privacy" className="underline hover:text-foreground">
                {t("privacyPolicy")}
              </Link>
            </p>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          {isRegisterMode ? t("hasAccount") : t("noAccount")}{" "}
          <button
            type="button"
            onClick={() => {
              setIsRegisterMode(!isRegisterMode);
              setError("");
              setSuccess("");
            }}
            className="text-primary hover:underline font-medium"
          >
            {isRegisterMode ? t("signIn") : t("signUp")}
          </button>
        </p>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    }>
      <SignInContent />
    </Suspense>
  );
}
