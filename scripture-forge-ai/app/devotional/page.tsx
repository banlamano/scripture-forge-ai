import { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { DevotionalContent } from "@/components/devotional/devotional-content";

export const metadata: Metadata = {
  title: "Daily Devotional",
  description: "Start your day with AI-generated devotionals grounded in Scripture.",
};

export default function DevotionalPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-8 px-4 md:px-6 lg:px-8">
        <DevotionalContent />
      </main>
      <Footer />
    </div>
  );
}
