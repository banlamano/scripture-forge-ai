import { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { BlogContent } from "@/components/resources/blog-content";

export const metadata: Metadata = {
  title: "Blog",
  description: "Explore articles about Bible study, AI technology, spiritual growth, and more from ScriptureForge AI.",
};

export default function BlogPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <BlogContent />
      </main>
      <Footer />
    </div>
  );
}
