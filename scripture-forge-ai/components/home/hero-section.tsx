"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { ArrowRight, BookOpen, MessageCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  const t = useTranslations("home");
  const tCommon = useTranslations("common");
  
  return (
    <section className="relative overflow-hidden py-20 md:py-32 px-4 md:px-6 lg:px-8">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-scripture-sky/5 rounded-full blur-3xl" />
      </div>

      <div className="container max-w-6xl mx-auto">
        <div className="text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              {t("title")} {t("subtitle")}
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6"
          >
            {t("title")}
            <br />
            <span className="gradient-text">{t("subtitle")}</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
          >
            {t("description")}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          >
            <Button size="xl" variant="glow" asChild>
              <Link href="/chat">
                <MessageCircle className="mr-2 w-5 h-5" />
                {t("getStarted")}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button size="xl" variant="outline" asChild>
              <Link href="/bible">
                <BookOpen className="mr-2 w-5 h-5" />
                {t("exploreBible")}
              </Link>
            </Button>
          </motion.div>

          {/* Feature highlights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              {t("stats.booksOfBible")}
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              {t("stats.translations")}
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              {t("stats.activeUsers")}
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              {t("stats.userRating")}
            </div>
          </motion.div>
        </div>

        {/* Hero illustration / preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mt-16 relative"
        >
          <div className="glass-card rounded-2xl p-4 md:p-6 max-w-4xl mx-auto">
            <div className="bg-muted rounded-xl p-6 space-y-4">
              {/* Mock chat interface */}
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm">👤</span>
                </div>
                <div className="chat-bubble-user max-w-md">
                  {t("mockChat.userQuestion")}
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-scripture-gold/20 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-scripture-gold" />
                </div>
                <div className="chat-bubble-ai max-w-2xl">
                  <p className="mb-3">
                    {t("mockChat.aiResponse1")}
                  </p>
                  <blockquote className="border-l-2 border-primary/50 pl-3 italic text-muted-foreground mb-3">
                    {t("mockChat.verse")}
                  </blockquote>
                  <p className="text-sm text-muted-foreground">
                    {t("mockChat.aiResponse2")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute -top-4 -left-4 w-24 h-24 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-2xl" />
          <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-gradient-to-tl from-scripture-sky/20 to-transparent rounded-full blur-2xl" />
        </motion.div>
      </div>
    </section>
  );
}
