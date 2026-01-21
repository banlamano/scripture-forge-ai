"use client";

import { Calendar, Clock, User, ArrowRight, BookOpen, Heart, Sparkles, Sun, Users, Lightbulb, Book, Flame } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRawTranslations } from "@/components/providers/language-provider";

interface BlogTranslations {
  title: string;
  subtitle: string;
  blogSubtitleDescription: string;
  allPosts: string;
  readMore: string;
  featured: string;
  categories: Array<{ id: string; name: string }>;
  posts: Array<{
    slug: string;
    title: string;
    excerpt: string;
    author: string;
    authorRole?: string;
    date: string;
    readTime: string;
    category: string;
    featured?: boolean;
  }>;
  newsletter: {
    title: string;
    description: string;
    placeholder: string;
    button: string;
  };
}

// Blog post image components based on category/slug
const BlogImage = ({ slug, category }: { slug: string; category: string }) => {
  const imageStyles: Record<string, { gradient: string; icon: React.ReactNode }> = {
    'how-ai-is-transforming-bible-study': { 
      gradient: 'from-blue-500/20 via-purple-500/20 to-indigo-500/20',
      icon: <Sparkles className="w-16 h-16 text-blue-500/60" />
    },
    '5-ways-to-study-bible-effectively': { 
      gradient: 'from-emerald-500/20 via-teal-500/20 to-cyan-500/20',
      icon: <BookOpen className="w-16 h-16 text-emerald-500/60" />
    },
    'understanding-biblical-context': { 
      gradient: 'from-amber-500/20 via-orange-500/20 to-yellow-500/20',
      icon: <Book className="w-16 h-16 text-amber-500/60" />
    },
    'new-features-january-2026': { 
      gradient: 'from-violet-500/20 via-purple-500/20 to-fuchsia-500/20',
      icon: <Lightbulb className="w-16 h-16 text-violet-500/60" />
    },
    'daily-devotional-habit': { 
      gradient: 'from-rose-500/20 via-pink-500/20 to-red-500/20',
      icon: <Heart className="w-16 h-16 text-rose-500/60" />
    },
    'power-of-prayer': { 
      gradient: 'from-sky-500/20 via-blue-500/20 to-indigo-500/20',
      icon: <Sun className="w-16 h-16 text-sky-500/60" />
    },
    'community-bible-study': { 
      gradient: 'from-green-500/20 via-emerald-500/20 to-teal-500/20',
      icon: <Users className="w-16 h-16 text-green-500/60" />
    },
    'finding-hope-in-difficult-times': { 
      gradient: 'from-orange-500/20 via-amber-500/20 to-yellow-500/20',
      icon: <Flame className="w-16 h-16 text-orange-500/60" />
    },
  };

  const style = imageStyles[slug] || { 
    gradient: 'from-primary/20 via-primary/10 to-primary/5',
    icon: <BookOpen className="w-16 h-16 text-primary/40" />
  };

  return (
    <div className={`h-52 bg-gradient-to-br ${style.gradient} flex items-center justify-center relative overflow-hidden`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),transparent)]" />
      <div className="relative z-10 transform group-hover:scale-110 transition-transform duration-300">
        {style.icon}
      </div>
    </div>
  );
};

export function BlogContent() {
  const t = useRawTranslations<BlogTranslations>("resources.blog");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = t?.categories || [];
  const posts = t?.posts || [];

  const filteredPosts = selectedCategory === "all" 
    ? posts 
    : posts.filter(post => post.category === selectedCategory);

  const featuredPost = posts.find(post => post.featured);
  const regularPosts = filteredPosts.filter(post => !post.featured);

  return (
    <div className="container px-4 md:px-6 py-12 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-16">
        <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
          {t?.title}
        </span>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
          {t?.subtitle}
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {t?.blogSubtitleDescription}
        </p>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap justify-center gap-2 mb-12">
        <button
          onClick={() => setSelectedCategory("all")}
          className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
            selectedCategory === "all"
              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
              : "bg-muted hover:bg-muted/80 hover:shadow-md"
          }`}
        >
          {t?.allPosts}
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
              selectedCategory === category.id
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                : "bg-muted hover:bg-muted/80 hover:shadow-md"
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
          className="block mb-16 group"
        >
          <article className="relative rounded-2xl overflow-hidden border shadow-sm hover:shadow-xl transition-all duration-300">
            <div className="grid md:grid-cols-2">
              <div className="h-64 md:h-auto bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-indigo-500/20 flex items-center justify-center relative">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,rgba(120,119,198,0.15),transparent)]" />
                <Sparkles className="w-24 h-24 text-blue-500/50 relative z-10 group-hover:scale-110 transition-transform duration-300" />
                <div className="absolute top-4 left-4 bg-primary text-primary-foreground px-3 py-1.5 rounded-full text-sm font-semibold shadow-lg">
                  ✨ {t?.featured}
                </div>
              </div>
              <div className="p-8 md:p-10 flex flex-col justify-center">
                <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4">
                  <span className="flex items-center gap-1.5 bg-muted px-3 py-1 rounded-full">
                    <Calendar className="w-3.5 h-3.5" />
                    {featuredPost.date}
                  </span>
                  <span className="flex items-center gap-1.5 bg-muted px-3 py-1 rounded-full">
                    <Clock className="w-3.5 h-3.5" />
                    {featuredPost.readTime}
                  </span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold mb-4 group-hover:text-primary transition-colors leading-tight">
                  {featuredPost.title}
                </h2>
                <p className="text-muted-foreground mb-6 line-clamp-3">{featuredPost.excerpt}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center text-sm font-bold text-primary">
                      {featuredPost.author.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{featuredPost.author}</p>
                      <p className="text-xs text-muted-foreground">{featuredPost.authorRole || 'Contributor'}</p>
                    </div>
                  </div>
                  <span className="flex items-center gap-2 text-primary font-semibold group-hover:gap-3 transition-all">
                    {t?.readMore}
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </div>
          </article>
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
            <article className="border rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 h-full flex flex-col bg-card">
              <BlogImage slug={post.slug} category={post.category} />
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {post.date}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {post.readTime}
                  </span>
                </div>
                <h3 className="text-lg font-bold mb-3 group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                  {post.title}
                </h3>
                <p className="text-muted-foreground text-sm flex-1 line-clamp-3">{post.excerpt}</p>
                <div className="flex items-center justify-between mt-5 pt-5 border-t">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center text-xs font-bold text-primary">
                      {post.author.split(' ').map(n => n[0]).join('')}
                    </div>
                    <span className="text-sm font-medium">{post.author}</span>
                  </div>
                  <span className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-medium">
                    {categories.find(c => c.id === post.category)?.name || post.category}
                  </span>
                </div>
              </div>
            </article>
          </Link>
        ))}
      </div>

      {/* Newsletter */}
      <div className="mt-20 relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 p-8 md:p-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(120,119,198,0.1),transparent)]" />
        <div className="relative z-10 text-center max-w-xl mx-auto">
          <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
            📬 Newsletter
          </span>
          <h2 className="text-2xl md:text-3xl font-bold mb-4">{t?.newsletter?.title}</h2>
          <p className="text-muted-foreground mb-8">{t?.newsletter?.description}</p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder={t?.newsletter?.placeholder}
              className="flex-1 px-5 py-3 rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
            />
            <button
              type="submit"
              className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25"
            >
              {t?.newsletter?.button}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
