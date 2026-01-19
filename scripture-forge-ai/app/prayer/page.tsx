"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { 
  BookHeart, 
  Plus, 
  Calendar, 
  Check, 
  Clock, 
  Trash2, 
  Edit2,
  Heart,
  Loader2,
  Filter,
  Search
} from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface PrayerEntry {
  id: string;
  title: string;
  content: string;
  category: string;
  isAnswered: boolean;
  createdAt: Date;
  answeredAt?: Date;
}

const categoryIds = ["personal", "family", "health", "work", "church", "world", "gratitude"] as const;
const categoryColors: Record<string, string> = {
  personal: "bg-blue-500",
  family: "bg-green-500",
  health: "bg-red-500",
  work: "bg-yellow-500",
  church: "bg-purple-500",
  world: "bg-orange-500",
  gratitude: "bg-pink-500",
};

// Sample prayers are now loaded from translations
function getSamplePrayers(t: ReturnType<typeof useTranslations>): PrayerEntry[] {
  return [
    {
      id: "1",
      title: t("samples.sample1.title"),
      content: t("samples.sample1.content"),
      category: "personal",
      isAnswered: false,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      id: "2",
      title: t("samples.sample2.title"),
      content: t("samples.sample2.content"),
      category: "health",
      isAnswered: true,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      answeredAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
    {
      id: "3",
      title: t("samples.sample3.title"),
      content: t("samples.sample3.content"),
      category: "gratitude",
      isAnswered: false,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
  ];
}

export default function PrayerJournalPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const t = useTranslations("prayer");
  const tCommon = useTranslations("common");
  const samplePrayers = getSamplePrayers(t);
  const [prayers, setPrayers] = useState<PrayerEntry[]>(samplePrayers);
  const [showNewPrayer, setShowNewPrayer] = useState(false);
  const [newPrayer, setNewPrayer] = useState({ title: "", content: "", category: "personal" });
  const [filter, setFilter] = useState<"all" | "active" | "answered">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPrayers = prayers.filter((prayer) => {
    const matchesFilter = 
      filter === "all" ? true :
      filter === "answered" ? prayer.isAnswered :
      !prayer.isAnswered;
    
    const matchesSearch = 
      prayer.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prayer.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const handleAddPrayer = () => {
    if (!newPrayer.title.trim() || !newPrayer.content.trim()) return;
    
    const prayer: PrayerEntry = {
      id: Date.now().toString(),
      title: newPrayer.title,
      content: newPrayer.content,
      category: newPrayer.category,
      isAnswered: false,
      createdAt: new Date(),
    };
    
    setPrayers([prayer, ...prayers]);
    setNewPrayer({ title: "", content: "", category: "personal" });
    setShowNewPrayer(false);
  };

  const toggleAnswered = (id: string) => {
    setPrayers(prayers.map(p => 
      p.id === id 
        ? { ...p, isAnswered: !p.isAnswered, answeredAt: !p.isAnswered ? new Date() : undefined }
        : p
    ));
  };

  const deletePrayer = (id: string) => {
    setPrayers(prayers.filter(p => p.id !== id));
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    }).format(date);
  };

  const getCategoryColor = (categoryId: string) => {
    return categoryColors[categoryId] || "bg-gray-500";
  };

  const getCategoryName = (categoryId: string) => {
    return t(`categories.${categoryId}`);
  };

  const stats = {
    total: prayers.length,
    active: prayers.filter(p => !p.isAnswered).length,
    answered: prayers.filter(p => p.isAnswered).length,
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-gradient-to-b from-background to-muted/30">
        <div className="container max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <BookHeart className="w-8 h-8 text-primary" />
                {t("title")}
              </h1>
              <p className="text-muted-foreground mt-1">
                {t("description")}
              </p>
            </div>
            <Button onClick={() => setShowNewPrayer(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              {t("newPrayer")}
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-primary">{stats.total}</div>
                <div className="text-sm text-muted-foreground">{t("totalPrayers")}</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-blue-500">{stats.active}</div>
                <div className="text-sm text-muted-foreground">{t("active")}</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-green-500">{stats.answered}</div>
                <div className="text-sm text-muted-foreground">{t("answered")}</div>
              </CardContent>
            </Card>
          </div>

          {/* New Prayer Form */}
          {showNewPrayer && (
            <Card className="mb-6 border-primary">
              <CardHeader>
                <CardTitle>{t("newPrayer")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder={t("prayerTitle")}
                  value={newPrayer.title}
                  onChange={(e) => setNewPrayer({ ...newPrayer, title: e.target.value })}
                />
                <Textarea
                  placeholder={t("writePrayer")}
                  value={newPrayer.content}
                  onChange={(e) => setNewPrayer({ ...newPrayer, content: e.target.value })}
                  rows={4}
                />
                <div className="flex flex-wrap gap-2">
                  {categoryIds.map((catId) => (
                    <Button
                      key={catId}
                      variant={newPrayer.category === catId ? "default" : "outline"}
                      size="sm"
                      onClick={() => setNewPrayer({ ...newPrayer, category: catId })}
                      className="rounded-full"
                    >
                      <span className={`w-2 h-2 rounded-full ${categoryColors[catId]} mr-2`} />
                      {t(`categories.${catId}`)}
                    </Button>
                  ))}
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setShowNewPrayer(false)}>
                    {tCommon("cancel")}
                  </Button>
                  <Button onClick={handleAddPrayer}>
                    {t("savePrayer")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Filters and Search */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={tCommon("search")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("all")}
              >
                {t("all")}
              </Button>
              <Button
                variant={filter === "active" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("active")}
              >
                <Clock className="w-4 h-4 mr-1" />
                {t("active")}
              </Button>
              <Button
                variant={filter === "answered" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("answered")}
              >
                <Check className="w-4 h-4 mr-1" />
                {t("answered")}
              </Button>
            </div>
          </div>

          {/* Prayer List */}
          <div className="space-y-4">
            {filteredPrayers.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <BookHeart className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold text-lg mb-2">{t("noPrayers")}</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery ? tCommon("search") : t("startAdding")}
                  </p>
                  {!searchQuery && (
                    <Button onClick={() => setShowNewPrayer(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      {t("newPrayer")}
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              filteredPrayers.map((prayer) => (
                <Card 
                  key={prayer.id} 
                  className={`transition-all ${prayer.isAnswered ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800" : ""}`}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`w-2 h-2 rounded-full ${getCategoryColor(prayer.category)}`} />
                          <span className="text-xs text-muted-foreground">
                            {getCategoryName(prayer.category)}
                          </span>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(prayer.createdAt)}
                          </span>
                          {prayer.isAnswered && (
                            <>
                              <span className="text-xs text-muted-foreground">•</span>
                              <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                                <Check className="w-3 h-3" />
                                {t("answered")} {prayer.answeredAt && formatDate(prayer.answeredAt)}
                              </span>
                            </>
                          )}
                        </div>
                        <h3 className="font-semibold text-lg mb-1">{prayer.title}</h3>
                        <p className="text-muted-foreground">{prayer.content}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleAnswered(prayer.id)}
                          className={prayer.isAnswered ? "text-green-600" : "text-muted-foreground"}
                          title={prayer.isAnswered ? t("markActive") : t("markAnswered")}
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deletePrayer(prayer.id)}
                          className="text-muted-foreground hover:text-red-600"
                          title={t("deletePrayer")}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Encouraging Verse */}
          <Card className="mt-8 bg-primary/5 border-primary/20">
            <CardContent className="py-6 text-center">
              <p className="italic text-lg mb-2">
                {t("encouragingVerse")}
              </p>
              <p className="text-sm text-muted-foreground">{t("verseReference")}</p>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
