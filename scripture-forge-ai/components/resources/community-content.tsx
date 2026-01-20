"use client";

import { useTranslations } from "next-intl";
import { Users, MessageSquare, Github, Twitter, Heart, BookOpen, Lightbulb, Award } from "lucide-react";
import Link from "next/link";

export function CommunityContent() {
  const t = useTranslations("resources.community");

  const stats = t.raw("stats") as Array<{ value: string; label: string }>;
  const channels = t.raw("channels") as Array<{
    id: string;
    title: string;
    description: string;
    link: string;
    icon: string;
  }>;
  const contributors = t.raw("contributors") as Array<{
    name: string;
    role: string;
    avatar: string;
  }>;

  const iconMap: Record<string, React.ReactNode> = {
    discord: <MessageSquare className="w-6 h-6" />,
    github: <Github className="w-6 h-6" />,
    twitter: <Twitter className="w-6 h-6" />,
    forum: <Users className="w-6 h-6" />,
  };

  return (
    <div className="container px-4 md:px-6 py-12 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4">{t("title")}</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">{t("subtitle")}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
        {stats.map((stat, index) => (
          <div key={index} className="text-center p-6 bg-muted/50 rounded-lg">
            <p className="text-3xl font-bold text-primary mb-2">{stat.value}</p>
            <p className="text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Community Channels */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-8 text-center">{t("channelsTitle")}</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {channels.map((channel) => (
            <a
              key={channel.id}
              href={channel.link}
              target="_blank"
              rel="noopener noreferrer"
              className="border rounded-lg p-6 hover:shadow-lg transition-all hover:border-primary group"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  {iconMap[channel.icon] || <Users className="w-6 h-6" />}
                </div>
                <h3 className="text-xl font-semibold">{channel.title}</h3>
              </div>
              <p className="text-muted-foreground">{channel.description}</p>
            </a>
          ))}
        </div>
      </section>

      {/* How to Contribute */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-8 text-center">{t("contributeTitle")}</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="border rounded-lg p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto mb-4">
              <Lightbulb className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold mb-2">{t("contribute.ideas.title")}</h3>
            <p className="text-muted-foreground">{t("contribute.ideas.description")}</p>
          </div>
          <div className="border rounded-lg p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto mb-4">
              <Github className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold mb-2">{t("contribute.code.title")}</h3>
            <p className="text-muted-foreground">{t("contribute.code.description")}</p>
          </div>
          <div className="border rounded-lg p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto mb-4">
              <BookOpen className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold mb-2">{t("contribute.docs.title")}</h3>
            <p className="text-muted-foreground">{t("contribute.docs.description")}</p>
          </div>
        </div>
      </section>

      {/* Top Contributors */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-8 text-center">{t("contributorsTitle")}</h2>
        <div className="flex flex-wrap justify-center gap-6">
          {contributors.map((contributor, index) => (
            <div key={index} className="text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center text-2xl font-bold text-primary mb-2 mx-auto">
                {contributor.avatar}
              </div>
              <p className="font-medium">{contributor.name}</p>
              <p className="text-sm text-muted-foreground">{contributor.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <div className="text-center bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-8">
        <Heart className="w-12 h-12 text-primary mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-4">{t("ctaTitle")}</h2>
        <p className="text-muted-foreground mb-6 max-w-xl mx-auto">{t("ctaDescription")}</p>
        <div className="flex flex-wrap justify-center gap-4">
          <a
            href="https://discord.gg/scriptureforge"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
          >
            <MessageSquare className="w-5 h-5" />
            {t("joinDiscord")}
          </a>
          <a
            href="https://github.com/scriptureforge"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border px-6 py-3 rounded-lg hover:bg-muted transition-colors"
          >
            <Github className="w-5 h-5" />
            {t("viewGithub")}
          </a>
        </div>
      </div>
    </div>
  );
}
