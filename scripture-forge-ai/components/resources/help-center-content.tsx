"use client";

import { useTranslations } from "next-intl";
import { Search, BookOpen, MessageCircle, Settings, CreditCard, Shield, HelpCircle, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const categoryIcons: Record<string, React.ReactNode> = {
  gettingStarted: <BookOpen className="w-6 h-6" />,
  bibleReading: <BookOpen className="w-6 h-6" />,
  aiChat: <MessageCircle className="w-6 h-6" />,
  account: <Settings className="w-6 h-6" />,
  subscription: <CreditCard className="w-6 h-6" />,
  privacy: <Shield className="w-6 h-6" />,
};

export function HelpCenterContent() {
  const t = useTranslations("resources.helpCenter");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = t.raw("categories") as Array<{
    id: string;
    title: string;
    description: string;
    articles: Array<{ title: string; slug: string }>;
  }>;

  const faqs = t.raw("faqs") as Array<{ question: string; answer: string }>;

  const filteredCategories = searchQuery
    ? categories.map(cat => ({
        ...cat,
        articles: cat.articles.filter(article =>
          article.title.toLowerCase().includes(searchQuery.toLowerCase())
        ),
      })).filter(cat => cat.articles.length > 0)
    : categories;

  return (
    <div className="container px-4 md:px-6 py-12 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">{t("title")}</h1>
        <p className="text-xl text-muted-foreground mb-8">{t("subtitle")}</p>
        
        {/* Search */}
        <div className="max-w-xl mx-auto relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder={t("searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        {filteredCategories.map((category) => (
          <div
            key={category.id}
            className="border rounded-lg p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                {categoryIcons[category.id] || <HelpCircle className="w-6 h-6" />}
              </div>
              <h2 className="text-xl font-semibold">{category.title}</h2>
            </div>
            <p className="text-muted-foreground mb-4">{category.description}</p>
            <ul className="space-y-2">
              {category.articles.slice(0, 3).map((article) => (
                <li key={article.slug}>
                  <Link
                    href={`/help/${category.id}/${article.slug}`}
                    className="text-sm text-primary hover:underline flex items-center gap-1"
                  >
                    <ChevronRight className="w-4 h-4" />
                    {article.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* FAQs */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold mb-8 text-center">{t("faqTitle")}</h2>
        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <details
              key={index}
              className="border rounded-lg p-4 group"
            >
              <summary className="font-medium cursor-pointer list-none flex items-center justify-between">
                {faq.question}
                <ChevronRight className="w-5 h-5 transition-transform group-open:rotate-90" />
              </summary>
              <p className="mt-4 text-muted-foreground">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>

      {/* Contact Support */}
      <div className="text-center bg-muted/50 rounded-lg p-8">
        <h2 className="text-2xl font-bold mb-4">{t("contactTitle")}</h2>
        <p className="text-muted-foreground mb-6">{t("contactDescription")}</p>
        <Link
          href="/contact"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
        >
          <MessageCircle className="w-5 h-5" />
          {t("contactButton")}
        </Link>
      </div>
    </div>
  );
}
