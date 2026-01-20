"use client";

import { useTranslations } from "next-intl";
import { Calendar, Clock, User, ArrowRight, Tag } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function BlogContent() {
  const t = useTranslations("resources.blog");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = t.raw("categories") as Array<{ id: string; name: string }>;
  const posts = t.raw("posts") as Array<{
    slug: string;
    title: string;
    excerpt: string;
    author: string;
    date: string;
    readTime: string;
    category: string;
    featured?: boolean;
  }>;

  const filteredPosts = selectedCategory === "all" 
    ? posts 
    : posts.filter(post => post.category === selectedCategory);

  const featuredPost = posts.find(post => post.featured);
  const regularPosts = filteredPosts.filter(post => !post.featured);

  return (
    <div className="container px-4 md:px-6 py-12 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">{t("title")}</h1>
        <p className="text-xl text-muted-foreground">{t("subtitle")}</p>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap justify-center gap-2 mb-12">
        <button
          onClick={() => setSelectedCategory("all")}
          className={`px-4 py-2 rounded-full text-sm transition-colors ${
            selectedCategory === "all"
              ? "bg-primary text-primary-foreground"
              : "bg-muted hover:bg-muted/80"
          }`}
        >
          {t("allPosts")}
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-4 py-2 rounded-full text-sm transition-colors ${
              selectedCategory === category.id
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80"
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Featured Post */}
      {featuredPost && selectedCategory === "all" && (
        <Link
          href={`/blog/${featuredPost.slug}`}
          className="block mb-12 group"
        >
          <div className="relative bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-8 md:p-12 overflow-hidden">
            <div className="absolute top-4 left-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
              {t("featured")}
            </div>
            <div className="max-w-2xl">
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4 mt-4">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {featuredPost.date}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {featuredPost.readTime}
                </span>
              </div>
              <h2 className="text-3xl font-bold mb-4 group-hover:text-primary transition-colors">
                {featuredPost.title}
              </h2>
              <p className="text-muted-foreground mb-6">{featuredPost.excerpt}</p>
              <div className="flex items-center gap-2 text-primary font-medium">
                {t("readMore")}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </Link>
      )}

      {/* Blog Posts Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {regularPosts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group"
          >
            <article className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
              <div className="h-48 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <Tag className="w-12 h-12 text-primary/40" />
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {post.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {post.readTime}
                  </span>
                </div>
                <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
                  {post.title}
                </h3>
                <p className="text-muted-foreground text-sm flex-1">{post.excerpt}</p>
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {post.author}
                  </span>
                  <span className="text-xs bg-muted px-2 py-1 rounded">
                    {categories.find(c => c.id === post.category)?.name || post.category}
                  </span>
                </div>
              </div>
            </article>
          </Link>
        ))}
      </div>

      {/* Newsletter */}
      <div className="mt-16 text-center bg-muted/50 rounded-lg p-8">
        <h2 className="text-2xl font-bold mb-4">{t("newsletter.title")}</h2>
        <p className="text-muted-foreground mb-6">{t("newsletter.description")}</p>
        <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <input
            type="email"
            placeholder={t("newsletter.placeholder")}
            className="flex-1 px-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            type="submit"
            className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
          >
            {t("newsletter.button")}
          </button>
        </form>
      </div>
    </div>
  );
}
