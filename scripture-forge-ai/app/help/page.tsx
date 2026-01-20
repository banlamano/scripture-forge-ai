import { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { HelpCenterContent } from "@/components/resources/help-center-content";

export const metadata: Metadata = {
  title: "Help Center",
  description: "Find answers to your questions about ScriptureForge AI. Browse our help articles and FAQs.",
};

export default function HelpPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <HelpCenterContent />
      </main>
      <Footer />
    </div>
  );
}
