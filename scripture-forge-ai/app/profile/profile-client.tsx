"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { 
  User, 
  Mail, 
  Calendar, 
  Settings, 
  LogOut, 
  BookOpen, 
  MessageCircle,
  Bookmark,
  Crown,
  ChevronRight,
  Loader2,
  Shield,
  Sun,
  Moon,
  Monitor,
  Check,
  Heart,
  Trash2,
  Share2
} from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { useLanguage } from "@/components/providers/language-provider";
import { BIBLE_TRANSLATIONS } from "@/lib/api-bible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { ShareModal } from "@/components/ui/share-modal";

// Type for saved verses
interface SavedVerse {
  text: string;
  reference: string;
  translation: string;
  savedAt: string;
}

// Local storage key for default translation preference
const TRANSLATION_PREFERENCE_KEY = "scripture-forge-default-translation";

export default function ProfileClient() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { locale } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [defaultTranslation, setDefaultTranslation] = useState<string>("");
  const [savedVerses, setSavedVerses] = useState<SavedVerse[]>([]);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareContent, setShareContent] = useState("");
  const t = useTranslations("profile");
  const tCommon = useTranslations("common");

  // Get available translations for the current language
  const availableTranslations = useMemo(() => {
    return BIBLE_TRANSLATIONS[locale] || BIBLE_TRANSLATIONS["en"];
  }, [locale]);

  // Load saved translation preference and saved verses on mount
  useEffect(() => {
    setMounted(true);
    // Load saved preference from localStorage
    const savedTranslation = localStorage.getItem(TRANSLATION_PREFERENCE_KEY);
    if (savedTranslation) {
      // Check if the saved translation is valid for current language
      const isValid = availableTranslations.some(t => t.id === savedTranslation);
      if (isValid) {
        setDefaultTranslation(savedTranslation);
      } else {
        // Default to first translation for current language
        setDefaultTranslation(availableTranslations[0]?.id || "");
      }
    } else {
      // Default to first translation for current language
      setDefaultTranslation(availableTranslations[0]?.id || "");
    }
    
    // Load saved verses from localStorage
    const verses = JSON.parse(localStorage.getItem("savedVerses") || "[]");
    setSavedVerses(verses);
  }, [availableTranslations]);

  // Delete a saved verse
  const handleDeleteVerse = (reference: string) => {
    const updatedVerses = savedVerses.filter(v => v.reference !== reference);
    setSavedVerses(updatedVerses);
    localStorage.setItem("savedVerses", JSON.stringify(updatedVerses));
    toast.success(t("verseDeleted") || "Verse removed");
  };

  // Share a saved verse
  const handleShareVerse = (verse: SavedVerse) => {
    setShareContent(`"${verse.text}" — ${verse.reference} (${verse.translation})`);
    setShowShareModal(true);
  };

  // Handle translation change
  const handleTranslationChange = (translationId: string) => {
    setDefaultTranslation(translationId);
    localStorage.setItem(TRANSLATION_PREFERENCE_KEY, translationId);
    toast.success(t("translationSaved"));
  };

  // Server component (page.tsx) handles auth redirect; keep client logic simple.
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/auth/signin?callbackUrl=/profile");
    }
  }, [status, router]);

  if (status === "loading" || !mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  const user = session.user;
  const memberSince = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  });

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  const quickLinks = [
    {
      title: tCommon("bible"),
      description: t("continueReading"),
      href: "/bible",
      icon: BookOpen,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: tCommon("chat"),
      description: t("askQuestions"),
      href: "/chat",
      icon: MessageCircle,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: tCommon("devotional"),
      description: t("dailyInsights"),
      href: "/devotional",
      icon: Bookmark,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
  ];

  return (
    <>
    <ShareModal
      isOpen={showShareModal}
      onClose={() => setShowShareModal(false)}
      text={shareContent}
      title="ScriptureForge AI - Saved Verse"
      translations={{
        shareTitle: tCommon("share"),
        copyLink: tCommon("copy"),
        copied: tCommon("copied"),
      }}
    />
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-gradient-to-b from-background to-muted/30">
        <div className="container max-w-4xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">{t("title")}</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            {t("description")}
          </p>
        </div>

        {/* User Info Card */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <Avatar className="w-24 h-24 ring-4 ring-primary/20">
                <AvatarImage src={user.image || ""} alt={user.name || "User"} />
                <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                  {user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-2xl font-bold mb-1">{user.name || "User"}</h2>
                <div className="flex items-center justify-center sm:justify-start gap-2 text-muted-foreground mb-3">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm">{user.email}</span>
                </div>
                <div className="flex items-center justify-center sm:justify-start gap-2 text-muted-foreground mb-4">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">{t("memberSince")} {memberSince}</span>
                </div>
                
                {/* Subscription Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
                  <Crown className="w-4 h-4" />
                  {t("freePlan")}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">{t("quickLinks")}</CardTitle>
            <CardDescription>{t("jumpBack")}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {quickLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <div className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors group">
                  <div className={`p-3 rounded-lg ${link.bgColor}`}>
                    <link.icon className={`w-5 h-5 ${link.color}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium group-hover:text-primary transition-colors">
                      {link.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {link.description}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* Saved Verses */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500" />
              {t("savedVerses") || "Saved Verses"}
            </CardTitle>
            <CardDescription>{t("savedVersesDescription") || "Your favorite verses saved from the verse of the day"}</CardDescription>
          </CardHeader>
          <CardContent>
            {savedVerses.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Bookmark className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>{t("noSavedVerses") || "No saved verses yet"}</p>
                <p className="text-sm mt-1">{t("saveVersesHint") || "Save verses from the home page to see them here"}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {savedVerses.map((verse, index) => (
                  <div key={index} className="p-4 rounded-lg border bg-muted/30">
                    <p className="text-sm italic mb-2">&ldquo;{verse.text}&rdquo;</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="font-medium text-primary">{verse.reference}</span>
                        <span>•</span>
                        <span>{verse.translation}</span>
                        <span>•</span>
                        <span>{new Date(verse.savedAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleShareVerse(verse)}
                          title={tCommon("share")}
                        >
                          <Share2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                          onClick={() => handleDeleteVerse(verse.reference)}
                          title={tCommon("delete")}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Settings className="w-5 h-5" />
              {t("preferences")}
            </CardTitle>
            <CardDescription>{t("customize")}</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Theme Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 border-b gap-3">
              <div>
                <h3 className="font-medium">{t("theme")}</h3>
                <p className="text-sm text-muted-foreground">
                  {t("themeDescription")}
                </p>
              </div>
              <div className="flex items-center gap-1 p-1 bg-muted rounded-lg w-full sm:w-auto">
                <Button
                  variant={theme === "light" ? "default" : "ghost"}
                  size="sm"
                  className="h-10 sm:h-8 px-3 flex-1 sm:flex-initial"
                  onClick={() => setTheme("light")}
                >
                  <Sun className="w-4 h-4 mr-1" />
                  {t("light")}
                </Button>
                <Button
                  variant={theme === "dark" ? "default" : "ghost"}
                  size="sm"
                  className="h-10 sm:h-8 px-3 flex-1 sm:flex-initial"
                  onClick={() => setTheme("dark")}
                >
                  <Moon className="w-4 h-4 mr-1" />
                  {t("dark")}
                </Button>
                <Button
                  variant={theme === "system" ? "default" : "ghost"}
                  size="sm"
                  className="h-10 sm:h-8 px-3 flex-1 sm:flex-initial"
                  onClick={() => setTheme("system")}
                >
                  <Monitor className="w-4 h-4 mr-1" />
                  {t("system")}
                </Button>
              </div>
            </div>

            {/* Default Translation */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 gap-3">
              <div>
                <h3 className="font-medium">{t("defaultTranslation")}</h3>
                <p className="text-sm text-muted-foreground">
                  {t("translationDescription")}
                </p>
              </div>
              <Select 
                value={defaultTranslation} 
                onValueChange={handleTranslationChange}
              >
                <SelectTrigger className="w-full sm:w-[180px] h-10 sm:h-9">
                  <SelectValue placeholder={t("selectTranslation")}>
                    {availableTranslations.find(t => t.id === defaultTranslation)?.abbreviation || t("selectTranslation")}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {availableTranslations.map((trans) => (
                    <SelectItem key={trans.id} value={trans.id}>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{trans.abbreviation}</span>
                        <span className="text-muted-foreground text-xs">- {trans.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="w-5 h-5" />
              {t("account")}
            </CardTitle>
            <CardDescription>{t("accountSettings")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start h-12 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
              onClick={handleSignOut}
            >
              <LogOut className="w-5 h-5 mr-3" />
              {tCommon("signOut")}
            </Button>
          </CardContent>
        </Card>

        {/* Footer Links */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            <Link href="/terms" className="hover:underline">Terms of Service</Link>
            {" · "}
            <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
          </p>
        </div>
        </div>
      </main>
      <Footer />
    </div>
    </>
  );
}
