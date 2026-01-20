import { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { CookiesContent } from "@/components/legal/cookies-content";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "Learn about how ScriptureForge AI uses cookies and similar technologies.",
};

export default function CookiesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <CookiesContent />
      </main>
      <Footer />
    </div>
  );
}
