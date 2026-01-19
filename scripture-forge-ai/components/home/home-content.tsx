"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BookOpen, 
  MessageCircle, 
  Sparkles, 
  Sun, 
  Heart, 
  Search,
  ArrowRight,
  ChevronRight,
  Star,
  Zap
} from "lucide-react";
import { VerseOfTheDay } from "@/components/home/verse-of-the-day";
import { PopularQueries } from "@/components/home/popular-queries";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

const featureIcons = {
  bibleReader: BookOpen,
  aiChat: MessageCircle,
  devotional: Sparkles,
  smartSearch: Search,
  prayerJournal: Heart,
  readingPlans: Sun,
};

const featureColors = {
  bibleReader: "text-scripture-olive",
  aiChat: "text-scripture-sky",
  devotional: "text-scripture-gold",
  smartSearch: "text-primary",
  prayerJournal: "text-red-500",
  readingPlans: "text-amber-500",
};

const featureHrefs = {
  bibleReader: "/bible",
  aiChat: "/chat",
  devotional: "/devotional",
  smartSearch: "/search",
  prayerJournal: "/prayer",
  readingPlans: "/reading",
};

const featureKeys = ["bibleReader", "aiChat", "devotional", "smartSearch", "prayerJournal", "readingPlans"] as const;

export function HomeContent() {
  const t = useTranslations();

  const stats = [
    { value: "66", label: t("home.stats.booksOfBible") },
    { value: "4+", label: t("home.stats.translations") },
    { value: "50K+", label: t("home.stats.activeUsers") },
    { value: "4.8", label: t("home.stats.userRating") },
  ];

  const testimonials = [
    {
      quote: t("home.testimonials.testimonial1.quote"),
      author: t("home.testimonials.testimonial1.author"),
      role: t("home.testimonials.testimonial1.role"),
      rating: 5,
    },
    {
      quote: t("home.testimonials.testimonial2.quote"),
      author: t("home.testimonials.testimonial2.author"),
      role: t("home.testimonials.testimonial2.role"),
      rating: 5,
    },
    {
      quote: t("home.testimonials.testimonial3.quote"),
      author: t("home.testimonials.testimonial3.author"),
      role: t("home.testimonials.testimonial3.role"),
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 px-4 md:px-6 lg:px-8 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-scripture-gold/5" />
          <div className="container max-w-6xl mx-auto relative">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                {t("home.title")}{" "}
                <span className="gradient-text">{t("home.subtitle")}</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                {t("home.description")}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild className="text-lg px-8">
                  <Link href="/chat">
                    {t("home.getStarted")}
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="text-lg px-8">
                  <Link href="/bible">
                    {t("home.exploreBible")}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Verse of the Day */}
        <section className="py-12 px-4 md:px-6 lg:px-8 bg-muted/30">
          <div className="container max-w-6xl mx-auto">
            <VerseOfTheDay />
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 px-4 md:px-6 lg:px-8">
          <div className="container max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {t("home.featuresTitle")}{" "}
                <span className="gradient-text">{t("home.featuresHighlight")}</span>
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                {t("home.featuresDescription")}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featureKeys.map((key) => {
                const Icon = featureIcons[key];
                return (
                  <Link key={key} href={featureHrefs[key]}>
                    <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group cursor-pointer">
                      <CardHeader>
                        <div className={`w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-4 group-hover:scale-110 transition-transform ${featureColors[key]}`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <CardTitle className="flex items-center gap-2">
                          {t(`home.features.${key}.title`)}
                          <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </CardTitle>
                        <CardDescription>{t(`home.features.${key}.description`)}</CardDescription>
                      </CardHeader>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* Popular Queries */}
        <section className="py-16 px-4 md:px-6 lg:px-8 bg-muted/30">
          <div className="container max-w-6xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold mb-3">
                {t("home.popularQuestions")}
              </h2>
              <p className="text-muted-foreground">
                {t("home.popularQuestionsDescription")}
              </p>
            </div>
            <PopularQueries />
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 px-4 md:px-6 lg:px-8">
          <div className="container max-w-4xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-4xl md:text-5xl font-bold gradient-text mb-2">
                    {stat.value}
                  </div>
                  <div className="text-muted-foreground text-sm">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 px-4 md:px-6 lg:px-8 bg-muted/30">
          <div className="container max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {t("home.testimonialsTitle")}
              </h2>
              <p className="text-muted-foreground text-lg">
                {t("home.testimonialsDescription")}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, i) => (
                <Card key={i} className="bg-card">
                  <CardContent className="pt-6">
                    <div className="flex gap-1 mb-4">
                      {Array.from({ length: testimonial.rating }).map((_, j) => (
                        <Star key={j} className="w-4 h-4 fill-scripture-gold text-scripture-gold" />
                      ))}
                    </div>
                    <p className="text-foreground mb-4 italic">
                      "{testimonial.quote}"
                    </p>
                    <div>
                      <p className="font-semibold">{testimonial.author}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 md:px-6 lg:px-8">
          <div className="container max-w-4xl mx-auto text-center">
            <div className="glass-card rounded-3xl p-8 md:p-12">
              <Zap className="w-12 h-12 text-scripture-gold mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {t("home.ctaTitle")}
              </h2>
              <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
                {t("home.ctaDescription")}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild className="text-lg px-8">
                  <Link href="/chat">
                    {t("home.ctaButton")}
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="text-lg px-8">
                  <Link href="/bible">
                    {t("home.exploreBible")}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
