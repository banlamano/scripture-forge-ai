"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { 
  BookOpen, 
  Calendar, 
  Clock, 
  Play, 
  CheckCircle2, 
  Circle,
  ChevronRight,
  Target,
  Flame,
  Trophy,
  Star
} from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ReadingPlan {
  id: string;
  titleKey: string;
  descriptionKey: string;
  durationKey: string;
  totalDays: number;
  categoryKey: string;
  image: string;
  difficulty: "beginner" | "intermediate" | "advanced";
}

interface ActivePlan {
  planId: string;
  currentDay: number;
  completedDays: number[];
  startedAt: string; // ISO string for localStorage serialization
}

// Storage key for localStorage
const STORAGE_KEY = "scripture-forge-reading-plans";

// Reading plans with translation keys instead of hardcoded text
const readingPlans: ReadingPlan[] = [
  {
    id: "bible-in-year",
    titleKey: "plans.bibleInYear.title",
    descriptionKey: "plans.bibleInYear.description",
    durationKey: "plans.bibleInYear.duration",
    totalDays: 365,
    categoryKey: "categories.wholeBible",
    image: "📖",
    difficulty: "intermediate",
  },
  {
    id: "gospels-30",
    titleKey: "plans.gospels30.title",
    descriptionKey: "plans.gospels30.description",
    durationKey: "plans.gospels30.duration",
    totalDays: 30,
    categoryKey: "categories.newTestament",
    image: "✝️",
    difficulty: "beginner",
  },
  {
    id: "psalms-month",
    titleKey: "plans.psalmsMonth.title",
    descriptionKey: "plans.psalmsMonth.description",
    durationKey: "plans.psalmsMonth.duration",
    totalDays: 30,
    categoryKey: "categories.poetry",
    image: "🎵",
    difficulty: "beginner",
  },
  {
    id: "proverbs-31",
    titleKey: "plans.proverbs31.title",
    descriptionKey: "plans.proverbs31.description",
    durationKey: "plans.proverbs31.duration",
    totalDays: 31,
    categoryKey: "categories.wisdom",
    image: "💡",
    difficulty: "beginner",
  },
  {
    id: "romans-deep",
    titleKey: "plans.romansDeep.title",
    descriptionKey: "plans.romansDeep.description",
    durationKey: "plans.romansDeep.duration",
    totalDays: 112,
    categoryKey: "categories.epistles",
    image: "📜",
    difficulty: "advanced",
  },
  {
    id: "genesis-exodus",
    titleKey: "plans.genesisExodus.title",
    descriptionKey: "plans.genesisExodus.description",
    durationKey: "plans.genesisExodus.duration",
    totalDays: 60,
    categoryKey: "categories.oldTestament",
    image: "🌍",
    difficulty: "intermediate",
  },
];

// Load active plan from localStorage
function loadActivePlan(): ActivePlan | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Error loading reading plan:", error);
  }
  return null;
}

// Save active plan to localStorage
function saveActivePlan(plan: ActivePlan | null) {
  if (typeof window === "undefined") return;
  try {
    if (plan) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch (error) {
    console.error("Error saving reading plan:", error);
  }
}

export default function ReadingPlansPage() {
  const t = useTranslations("reading");
  const tCommon = useTranslations("common");
  const [activePlan, setActivePlan] = useState<ActivePlan | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isLoaded, setIsLoaded] = useState(false);

  // Load user's progress from localStorage on mount
  useEffect(() => {
    const savedPlan = loadActivePlan();
    setActivePlan(savedPlan);
    setIsLoaded(true);
  }, []);

  // Save progress whenever activePlan changes
  useEffect(() => {
    if (isLoaded) {
      saveActivePlan(activePlan);
    }
  }, [activePlan, isLoaded]);

  // Get unique category keys for filtering
  const categoryKeys = ["all", ...new Set(readingPlans.map(p => p.categoryKey))];

  const filteredPlans = selectedCategory === "all" 
    ? readingPlans 
    : readingPlans.filter(p => p.categoryKey === selectedCategory);

  const getActivePlanDetails = () => {
    if (!activePlan) return null;
    return readingPlans.find(p => p.id === activePlan.planId);
  };

  const activePlanDetails = getActivePlanDetails();
  const progress = activePlan ? Math.round((activePlan.completedDays.length / (activePlanDetails?.totalDays || 1)) * 100) : 0;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "text-green-600 bg-green-100 dark:bg-green-900/30";
      case "intermediate": return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30";
      case "advanced": return "text-red-600 bg-red-100 dark:bg-red-900/30";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const handleStartPlan = (planId: string) => {
    const plan = readingPlans.find(p => p.id === planId);
    if (plan) {
      setActivePlan({
        planId,
        currentDay: 1,
        completedDays: [],
        startedAt: new Date().toISOString(),
      });
    }
  };

  const handleCompleteDay = () => {
    if (!activePlan) return;
    setActivePlan({
      ...activePlan,
      completedDays: [...activePlan.completedDays, activePlan.currentDay],
      currentDay: activePlan.currentDay + 1,
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-gradient-to-b from-background to-muted/30">
        <div className="container max-w-6xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold mb-3">{t("title")}</h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {t("description")}
            </p>
          </div>

          {/* Active Plan Banner */}
          {activePlan && activePlanDetails && (
            <Card className="mb-8 border-primary bg-primary/5">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                  <div className="text-6xl">{activePlanDetails.image}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Flame className="w-5 h-5 text-orange-500" />
                      <span className="text-sm font-medium text-orange-500">
                        {activePlan.completedDays.length} {t("dayStreak")}!
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold mb-1">{t(activePlanDetails.titleKey)}</h2>
                    <p className="text-muted-foreground mb-4">
                      {t("dayProgress", { current: activePlan.currentDay, total: activePlanDetails.totalDays })}
                    </p>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-muted rounded-full h-3 mb-4">
                      <div 
                        className="bg-primary h-3 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <Button onClick={handleCompleteDay} className="gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        {t("completeDay")} {activePlan.currentDay}
                      </Button>
                      <Link href="/bible">
                        <Button variant="outline" className="gap-2">
                          <BookOpen className="w-4 h-4" />
                          {t("openBible")}
                        </Button>
                      </Link>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary">{progress}%</div>
                    <div className="text-sm text-muted-foreground">{t("complete")}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6 text-center">
                <Target className="w-8 h-8 mx-auto text-primary mb-2" />
                <div className="text-2xl font-bold">{readingPlans.length}</div>
                <div className="text-sm text-muted-foreground">{t("availablePlans")}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <Flame className="w-8 h-8 mx-auto text-orange-500 mb-2" />
                <div className="text-2xl font-bold">{activePlan?.completedDays.length || 0}</div>
                <div className="text-sm text-muted-foreground">{t("dayStreak")}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <Trophy className="w-8 h-8 mx-auto text-yellow-500 mb-2" />
                <div className="text-2xl font-bold">0</div>
                <div className="text-sm text-muted-foreground">{t("plansCompleted")}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <Star className="w-8 h-8 mx-auto text-purple-500 mb-2" />
                <div className="text-2xl font-bold">{activePlan?.completedDays.length || 0}</div>
                <div className="text-sm text-muted-foreground">{t("chaptersRead")}</div>
              </CardContent>
            </Card>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-6">
            {categoryKeys.map((categoryKey) => (
              <Button
                key={categoryKey}
                variant={selectedCategory === categoryKey ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(categoryKey)}
                className="rounded-full"
              >
                {categoryKey === "all" ? t("categories.all") : t(categoryKey)}
              </Button>
            ))}
          </div>

          {/* Plans Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlans.map((plan) => {
              const isActive = activePlan?.planId === plan.id;
              const activeProgress = isActive ? Math.round((activePlan.completedDays.length / plan.totalDays) * 100) : 0;
              return (
                <Card 
                  key={plan.id} 
                  className={`hover:shadow-lg transition-all ${isActive ? "ring-2 ring-primary" : ""}`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <span className="text-4xl">{plan.image}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(plan.difficulty)}`}>
                        {t(`difficulty.${plan.difficulty}`)}
                      </span>
                    </div>
                    <CardTitle className="mt-2">{t(plan.titleKey)}</CardTitle>
                    <CardDescription>{t(plan.descriptionKey)}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {t(plan.durationKey)}
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        {t(plan.categoryKey)}
                      </span>
                    </div>
                    
                    {isActive ? (
                      <>
                        {/* Progress bar for active plan */}
                        <div className="w-full bg-muted rounded-full h-2 mb-3">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all duration-500"
                            style={{ width: `${activeProgress}%` }}
                          />
                        </div>
                        <div className="text-xs text-muted-foreground mb-3 text-center">
                          {t("dayProgress", { current: activePlan.currentDay, total: plan.totalDays })} ({activeProgress}%)
                        </div>
                        <Button 
                          className="w-full group" 
                          variant="default"
                          onClick={() => {
                            // Scroll to the active plan banner at top
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                        >
                          <Play className="w-4 h-4 mr-2" />
                          {t("continuePlan")}
                          <ChevronRight className="w-4 h-4 ml-auto group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </>
                    ) : (
                      <Button 
                        className="w-full group" 
                        variant="outline"
                        onClick={() => handleStartPlan(plan.id)}
                      >
                        <Play className="w-4 h-4 mr-2" />
                        {t("startPlan")}
                        <ChevronRight className="w-4 h-4 ml-auto group-hover:translate-x-1 transition-transform" />
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
