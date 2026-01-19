import { Metadata } from "next";
import { Suspense } from "react";
import { BibleReader } from "@/components/bible/bible-reader";
import { Navbar } from "@/components/layout/navbar";
import { Loading } from "@/components/ui/loading";

export const metadata: Metadata = {
  title: "Bible Reader",
  description: "Read and study the Bible with multiple translations, bookmarks, highlights, and AI-powered insights.",
};

export default function BiblePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Suspense fallback={<Loading />}>
          <BibleReader />
        </Suspense>
      </main>
    </div>
  );
}
