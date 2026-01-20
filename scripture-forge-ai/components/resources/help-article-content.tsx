"use client";

import { useTranslations } from "next-intl";
import { ArrowLeft, BookOpen, MessageCircle, Settings, Shield, HelpCircle } from "lucide-react";
import Link from "next/link";

const categoryIcons: Record<string, React.ReactNode> = {
  gettingStarted: <BookOpen className="w-6 h-6" />,
  bibleReading: <BookOpen className="w-6 h-6" />,
  aiChat: <MessageCircle className="w-6 h-6" />,
  account: <Settings className="w-6 h-6" />,
  privacy: <Shield className="w-6 h-6" />,
};

interface HelpArticleContentProps {
  category: string;
  slug: string;
}

export function HelpArticleContent({ category, slug }: HelpArticleContentProps) {
  const t = useTranslations("resources.helpCenter");
  
  const categories = t.raw("categories") as Array<{
    id: string;
    title: string;
    description: string;
    articles: Array<{ title: string; slug: string; content: string }>;
  }>;

  const currentCategory = categories.find(c => c.id === category);
  const article = currentCategory?.articles.find(a => a.slug === slug);

  if (!currentCategory || !article) {
    return (
      <div className="container px-4 md:px-6 py-12 max-w-4xl mx-auto text-center">
        <h1 className="text-2xl font-bold mb-4">Article not found</h1>
        <Link href="/help" className="text-primary hover:underline">
          Return to Help Center
        </Link>
      </div>
    );
  }

  // Get related articles (other articles in same category)
  const relatedArticles = currentCategory.articles.filter(a => a.slug !== slug).slice(0, 3);

  return (
    <div className="container px-4 md:px-6 py-12 max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
        <Link href="/help" className="hover:text-foreground transition-colors">
          Help Center
        </Link>
        <span>/</span>
        <Link href={`/help#${category}`} className="hover:text-foreground transition-colors">
          {currentCategory.title}
        </Link>
        <span>/</span>
        <span className="text-foreground">{article.title}</span>
      </nav>

      {/* Back button */}
      <Link 
        href="/help" 
        className="inline-flex items-center gap-2 text-primary hover:underline mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Help Center
      </Link>

      {/* Article header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
          {categoryIcons[category] || <HelpCircle className="w-7 h-7" />}
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{currentCategory.title}</p>
          <h1 className="text-3xl font-bold">{article.title}</h1>
        </div>
      </div>

      {/* Article content */}
      <div className="prose prose-neutral dark:prose-invert max-w-none mb-12">
        <p className="text-lg text-muted-foreground leading-relaxed mb-6">
          {article.content}
        </p>
        
        {/* Extended content based on article type */}
        {slug === 'creating-account' && (
          <>
            <h2 className="text-xl font-semibold mt-8 mb-4">How to Create Your Account</h2>
            <ol className="list-decimal list-inside space-y-3 text-muted-foreground">
              <li>Visit the ScriptureForge AI website or open the app</li>
              <li>Click the "Sign In" button in the top right corner</li>
              <li>Choose to sign up with your email address or use Google Sign-In for faster registration</li>
              <li>If using email, enter your name, email, and create a secure password</li>
              <li>Verify your email address by clicking the link sent to your inbox</li>
              <li>Complete your profile by adding a profile picture and bio (optional)</li>
            </ol>
            <h2 className="text-xl font-semibold mt-8 mb-4">Benefits of Creating an Account</h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Save your bookmarks and highlights across devices</li>
              <li>Access your chat history with the AI assistant</li>
              <li>Track your reading progress and plans</li>
              <li>Sync your prayer journal entries</li>
              <li>Personalize your Bible study experience</li>
            </ul>
          </>
        )}

        {slug === 'navigating-interface' && (
          <>
            <h2 className="text-xl font-semibold mt-8 mb-4">Main Sections of ScriptureForge AI</h2>
            <div className="space-y-4 text-muted-foreground">
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium text-foreground mb-2">📖 Bible Reader</h3>
                <p>Read Scripture in multiple translations with tools for bookmarking, highlighting, and taking notes.</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium text-foreground mb-2">💬 AI Chat</h3>
                <p>Ask questions about the Bible and receive insightful, contextual answers powered by AI.</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium text-foreground mb-2">🙏 Prayer Journal</h3>
                <p>Record your prayers, track answered prayers, and reflect on your spiritual journey.</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium text-foreground mb-2">📅 Reading Plans</h3>
                <p>Follow structured reading plans to guide your daily Bible study.</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium text-foreground mb-2">✨ Devotionals</h3>
                <p>Access daily devotional content to inspire and guide your spiritual growth.</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium text-foreground mb-2">🔍 Search</h3>
                <p>Search across all Bible translations to find specific verses, words, or topics.</p>
              </div>
            </div>
            <h2 className="text-xl font-semibold mt-8 mb-4">Navigation Tips</h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Use the top navigation bar to quickly switch between main sections</li>
              <li>Access your profile and settings from the user menu in the top right</li>
              <li>Use the search function to find verses or navigate to specific books</li>
              <li>Toggle dark/light mode using the theme switcher</li>
            </ul>
          </>
        )}

        {slug === 'setup-preferences' && (
          <>
            <h2 className="text-xl font-semibold mt-8 mb-4">Customizing Your Experience</h2>
            <div className="space-y-6 text-muted-foreground">
              <div>
                <h3 className="font-medium text-foreground mb-2">Bible Translation</h3>
                <p className="mb-2">Choose your preferred default Bible translation from options including:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>King James Version (KJV)</li>
                  <li>New International Version (NIV)</li>
                  <li>English Standard Version (ESV)</li>
                  <li>New American Standard Bible (NASB)</li>
                  <li>And many more translations</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-2">Theme Settings</h3>
                <p>Switch between light and dark mode based on your preference or set it to follow your system settings.</p>
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-2">Language</h3>
                <p>ScriptureForge AI supports multiple interface languages including English, Spanish, French, German, Portuguese, Italian, and Chinese.</p>
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-2">Notifications</h3>
                <p>Configure which notifications you receive, including daily verse reminders, reading plan updates, and prayer reminders.</p>
              </div>
            </div>
            <h2 className="text-xl font-semibold mt-8 mb-4">How to Access Settings</h2>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
              <li>Click on your profile icon in the top right corner</li>
              <li>Select "Settings" or "Profile" from the dropdown menu</li>
              <li>Navigate through the different settings tabs</li>
              <li>Make your desired changes</li>
              <li>Changes are saved automatically</li>
            </ol>
          </>
        )}

        {/* Default extended content for other articles */}
        {!['creating-account', 'navigating-interface', 'setup-preferences'].includes(slug) && (
          <>
            <h2 className="text-xl font-semibold mt-8 mb-4">Need More Help?</h2>
            <p className="text-muted-foreground">
              If you have additional questions about this topic, feel free to reach out to our support team 
              or explore related articles below.
            </p>
          </>
        )}
      </div>

      {/* Related articles */}
      {relatedArticles.length > 0 && (
        <div className="border-t pt-8">
          <h2 className="text-xl font-semibold mb-6">Related Articles</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {relatedArticles.map((related) => (
              <Link
                key={related.slug}
                href={`/help/${category}/${related.slug}`}
                className="p-4 border rounded-lg hover:border-primary hover:shadow-md transition-all"
              >
                <h3 className="font-medium mb-2">{related.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{related.content}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Contact support */}
      <div className="mt-12 p-6 bg-muted/50 rounded-lg text-center">
        <h2 className="text-lg font-semibold mb-2">{t("contactTitle")}</h2>
        <p className="text-muted-foreground mb-4">{t("contactDescription")}</p>
        <Link
          href="/contact"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
        >
          {t("contactButton")}
        </Link>
      </div>
    </div>
  );
}
