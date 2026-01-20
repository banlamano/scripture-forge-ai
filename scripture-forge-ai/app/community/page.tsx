import { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { CommunityContent } from "@/components/resources/community-content";

export const metadata: Metadata = {
  title: "Community",
  description: "Join the ScriptureForge AI community. Connect with other users, contribute, and grow together.",
};

export default function CommunityPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <CommunityContent />
      </main>
      <Footer />
    </div>
  );
}
