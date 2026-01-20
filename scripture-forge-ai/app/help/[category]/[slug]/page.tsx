import { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { HelpArticleContent } from "@/components/resources/help-article-content";
import { notFound } from "next/navigation";

// Define valid categories and slugs
const validArticles: Record<string, string[]> = {
  gettingStarted: ['creating-account', 'navigating-interface', 'setup-preferences', 'quick-start', 'mobile-desktop'],
  bibleReading: ['bible-translations', 'bookmarks-highlights', 'reading-plans', 'navigation', 'offline-reading', 'verse-of-day'],
  aiChat: ['effective-questions', 'ai-responses', 'chat-history', 'biblical-topics', 'verse-explanations', 'devotional-insights'],
  account: ['update-profile', 'change-password', 'email-preferences', 'language-region', 'connected-accounts', 'delete-account'],
  privacy: ['data-privacy', 'two-factor-auth', 'export-data', 'managing-cookies', 'secure-connection', 'security-issues'],
};

type Props = {
  params: Promise<{ category: string; slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category, slug } = await params;
  const title = slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  return {
    title: `${title} - Help Center`,
    description: `Learn about ${title.toLowerCase()} in ScriptureForge AI.`,
  };
}

export default async function HelpArticlePage({ params }: Props) {
  const { category, slug } = await params;
  
  // Validate category and slug
  if (!validArticles[category] || !validArticles[category].includes(slug)) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <HelpArticleContent category={category} slug={slug} />
      </main>
      <Footer />
    </div>
  );
}
