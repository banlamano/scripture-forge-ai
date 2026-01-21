"use client";

import { ArrowLeft, BookOpen, MessageCircle, Settings, Shield, HelpCircle } from "lucide-react";
import Link from "next/link";
import { useRawTranslations } from "@/components/providers/language-provider";

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

interface ArticleContentSection {
  creatingAccount: {
    howToCreate: string;
    steps: string[];
    benefitsTitle: string;
    benefits: string[];
  };
  navigatingInterface: {
    mainSections: string;
    sections: {
      bibleReader: { title: string; description: string };
      aiChat: { title: string; description: string };
      prayerJournal: { title: string; description: string };
      readingPlans: { title: string; description: string };
      devotionals: { title: string; description: string };
      search: { title: string; description: string };
    };
    navigationTips: string;
    tips: string[];
  };
  setupPreferences: {
    customizing: string;
    preferences: {
      bibleTranslation: { title: string; description: string; options: string[] };
      theme: { title: string; description: string };
      language: { title: string; description: string };
      notifications: { title: string; description: string };
    };
    howToAccess: string;
    accessSteps: string[];
  };
}

interface HelpCenterTranslations {
  title: string;
  articleNotFound: string;
  returnToHelpCenter: string;
  backToHelpCenter: string;
  relatedArticles: string;
  needMoreHelp: string;
  needMoreHelpDescription: string;
  contactTitle: string;
  contactDescription: string;
  contactButton: string;
  articleContent: ArticleContentSection;
  categories: Array<{
    id: string;
    title: string;
    description: string;
    articles: Array<{ title: string; slug: string; content: string }>;
  }>;
}

export function HelpArticleContent({ category, slug }: HelpArticleContentProps) {
  const t = useRawTranslations<HelpCenterTranslations>("resources.helpCenter");
  
  const categories = t?.categories || [];
  const currentCategory = categories.find(c => c.id === category);
  const article = currentCategory?.articles.find(a => a.slug === slug);

  if (!currentCategory || !article) {
    return (
      <div className="container px-4 md:px-6 py-12 max-w-4xl mx-auto text-center">
        <h1 className="text-2xl font-bold mb-4">{t?.articleNotFound}</h1>
        <Link href="/help" className="text-primary hover:underline">
          {t?.returnToHelpCenter}
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
          {t?.title}
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
        {t?.backToHelpCenter}
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
        {slug === 'creating-account' && t?.articleContent?.creatingAccount && (
          <>
            <h2 className="text-xl font-semibold mt-8 mb-4">{t.articleContent.creatingAccount.howToCreate}</h2>
            <ol className="list-decimal list-inside space-y-3 text-muted-foreground">
              {t.articleContent.creatingAccount.steps.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
            <h2 className="text-xl font-semibold mt-8 mb-4">{t.articleContent.creatingAccount.benefitsTitle}</h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              {t.articleContent.creatingAccount.benefits.map((benefit, index) => (
                <li key={index}>{benefit}</li>
              ))}
            </ul>
          </>
        )}

        {slug === 'navigating-interface' && t?.articleContent?.navigatingInterface && (
          <>
            <h2 className="text-xl font-semibold mt-8 mb-4">{t.articleContent.navigatingInterface.mainSections}</h2>
            <div className="space-y-4 text-muted-foreground">
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium text-foreground mb-2">{t.articleContent.navigatingInterface.sections.bibleReader.title}</h3>
                <p>{t.articleContent.navigatingInterface.sections.bibleReader.description}</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium text-foreground mb-2">{t.articleContent.navigatingInterface.sections.aiChat.title}</h3>
                <p>{t.articleContent.navigatingInterface.sections.aiChat.description}</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium text-foreground mb-2">{t.articleContent.navigatingInterface.sections.prayerJournal.title}</h3>
                <p>{t.articleContent.navigatingInterface.sections.prayerJournal.description}</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium text-foreground mb-2">{t.articleContent.navigatingInterface.sections.readingPlans.title}</h3>
                <p>{t.articleContent.navigatingInterface.sections.readingPlans.description}</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium text-foreground mb-2">{t.articleContent.navigatingInterface.sections.devotionals.title}</h3>
                <p>{t.articleContent.navigatingInterface.sections.devotionals.description}</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium text-foreground mb-2">{t.articleContent.navigatingInterface.sections.search.title}</h3>
                <p>{t.articleContent.navigatingInterface.sections.search.description}</p>
              </div>
            </div>
            <h2 className="text-xl font-semibold mt-8 mb-4">{t.articleContent.navigatingInterface.navigationTips}</h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              {t.articleContent.navigatingInterface.tips.map((tip, index) => (
                <li key={index}>{tip}</li>
              ))}
            </ul>
          </>
        )}

        {slug === 'setup-preferences' && t?.articleContent?.setupPreferences && (
          <>
            <h2 className="text-xl font-semibold mt-8 mb-4">{t.articleContent.setupPreferences.customizing}</h2>
            <div className="space-y-6 text-muted-foreground">
              <div>
                <h3 className="font-medium text-foreground mb-2">{t.articleContent.setupPreferences.preferences.bibleTranslation.title}</h3>
                <p className="mb-2">{t.articleContent.setupPreferences.preferences.bibleTranslation.description}</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  {t.articleContent.setupPreferences.preferences.bibleTranslation.options.map((option, index) => (
                    <li key={index}>{option}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-2">{t.articleContent.setupPreferences.preferences.theme.title}</h3>
                <p>{t.articleContent.setupPreferences.preferences.theme.description}</p>
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-2">{t.articleContent.setupPreferences.preferences.language.title}</h3>
                <p>{t.articleContent.setupPreferences.preferences.language.description}</p>
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-2">{t.articleContent.setupPreferences.preferences.notifications.title}</h3>
                <p>{t.articleContent.setupPreferences.preferences.notifications.description}</p>
              </div>
            </div>
            <h2 className="text-xl font-semibold mt-8 mb-4">{t.articleContent.setupPreferences.howToAccess}</h2>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
              {t.articleContent.setupPreferences.accessSteps.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
          </>
        )}

        {/* Default extended content for other articles */}
        {!['creating-account', 'navigating-interface', 'setup-preferences'].includes(slug) && (
          <>
            <h2 className="text-xl font-semibold mt-8 mb-4">{t?.needMoreHelp}</h2>
            <p className="text-muted-foreground">
              {t?.needMoreHelpDescription}
            </p>
          </>
        )}
      </div>

      {/* Related articles */}
      {relatedArticles.length > 0 && (
        <div className="border-t pt-8">
          <h2 className="text-xl font-semibold mb-6">{t?.relatedArticles}</h2>
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
        <h2 className="text-lg font-semibold mb-2">{t?.contactTitle}</h2>
        <p className="text-muted-foreground mb-4">{t?.contactDescription}</p>
        <Link
          href="/contact"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
        >
          {t?.contactButton}
        </Link>
      </div>
    </div>
  );
}
