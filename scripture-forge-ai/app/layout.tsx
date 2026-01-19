import type { Metadata, Viewport } from "next";
import { Inter, Merriweather } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { AuthProvider } from "@/components/providers/auth-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { LanguageProvider } from "@/components/providers/language-provider";
import { Toaster } from "@/components/ui/sonner";
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const merriweather = Merriweather({
  weight: ["300", "400", "700", "900"],
  subsets: ["latin"],
  variable: "--font-merriweather",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "ScriptureForge AI - Your AI Bible Study Companion",
    template: "%s | ScriptureForge AI",
  },
  description:
    "Experience the Bible like never before with AI-powered insights, personalized devotionals, and interactive study tools. Your trusted companion for deeper spiritual growth.",
  keywords: [
    "Bible",
    "AI",
    "Bible study",
    "scripture",
    "devotional",
    "Christian",
    "faith",
    "spiritual growth",
    "Bible chat",
    "verse explanation",
  ],
  authors: [{ name: "ScriptureForge Team" }],
  creator: "ScriptureForge AI",
  publisher: "ScriptureForge AI",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "ScriptureForge AI",
    title: "ScriptureForge AI - Your AI Bible Study Companion",
    description:
      "Experience the Bible like never before with AI-powered insights and interactive study tools.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ScriptureForge AI",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ScriptureForge AI - Your AI Bible Study Companion",
    description:
      "Experience the Bible like never before with AI-powered insights and interactive study tools.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf8f5" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1d2e" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${merriweather.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          <LanguageProvider>
            <AuthProvider>
              <QueryProvider>
                {children}
                <Toaster richColors position="top-center" />
              </QueryProvider>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
