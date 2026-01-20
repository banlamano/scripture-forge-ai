import { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ApiDocsContent } from "@/components/resources/api-docs-content";

export const metadata: Metadata = {
  title: "API Documentation",
  description: "Integrate ScriptureForge AI into your applications. Explore our REST API endpoints and SDKs.",
};

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <ApiDocsContent />
      </main>
      <Footer />
    </div>
  );
}
