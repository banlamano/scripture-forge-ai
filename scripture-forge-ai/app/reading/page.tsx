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
  Star,
  X,
  RotateCcw,
  Trash2
} from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getDailyReading, type DailyReading } from "@/lib/reading-plans-data";

// Configuration for plan-specific navigation
interface PlanNavConfig {
  buttonLabelKey: string;  // Translation key for button label
  defaultBook: string;     // Default/primary book to open (used for book-specific buttons)
  defaultChapter: number;  // Default chapter to open for new users
  alwaysUseDefaultBook: boolean; // If true, always navigate to defaultBook regardless of schedule
}

// Map of plan IDs to their navigation configurations
const planNavConfigs: Record<string, PlanNavConfig> = {
  "bible-in-year": {
    buttonLabelKey: "openGenesis",
    defaultBook: "Genesis",
    defaultChapter: 1,
    alwaysUseDefaultBook: false, // Use schedule's first reading
  },
  "gospels-30": {
    buttonLabelKey: "openGospel",
    defaultBook: "Matthew",
    defaultChapter: 1,
    alwaysUseDefaultBook: false, // Use schedule (Matthew, Mark, Luke, or John based on progress)
  },
  "psalms-month": {
    buttonLabelKey: "openPsalms",
    defaultBook: "Psalms",
    defaultChapter: 1,
    alwaysUseDefaultBook: true, // Always open Psalms
  },
  "proverbs-31": {
    buttonLabelKey: "openProverbs",
    defaultBook: "Proverbs",
    defaultChapter: 1,
    alwaysUseDefaultBook: true, // Always open Proverbs
  },
  "romans-deep": {
    buttonLabelKey: "openRomans",
    defaultBook: "Romans",
    defaultChapter: 1,
    alwaysUseDefaultBook: true, // Always open Romans
  },
  "genesis-exodus": {
    buttonLabelKey: "openGenesis",
    defaultBook: "Genesis",
    defaultChapter: 1,
    alwaysUseDefaultBook: false, // Use schedule (Genesis or Exodus based on progress)
  },
  "acts-21": {
    buttonLabelKey: "openActs",
    defaultBook: "Acts",
    defaultChapter: 1,
    alwaysUseDefaultBook: true, // Always open Acts
  },
  "sermon-mount": {
    buttonLabelKey: "openMatthew",
    defaultBook: "Matthew",
    defaultChapter: 5,
    alwaysUseDefaultBook: true, // Always open Matthew
  },
};

// Get the navigation URL for a plan based on user progress
// For book-specific plans (Psalms, Proverbs, Romans, Acts, Matthew), always open that specific book
function getPlanNavigationUrl(planId: string, currentDay: number): string {
  const config = planNavConfigs[planId];
  
  // Try to get today's reading from the schedule
  const todaysReading = getDailyReading(planId, currentDay);
  
  if (todaysReading && todaysReading.readings.length > 0 && config) {
    // For plans that should always open a specific book (like "Open Psalms", "Open Proverbs", etc.)
    if (config.alwaysUseDefaultBook) {
      // Find the reading that matches the plan's primary book
      const matchingReading = todaysReading.readings.find(r => r.book === config.defaultBook);
      
      if (matchingReading) {
        // Extract chapter number (handle formats like "1", "1-3", "1:1-7")
        const chapterMatch = matchingReading.chapters.match(/^(\d+)/);
        const chapter = chapterMatch ? chapterMatch[1] : "1";
        return `/bible?book=${encodeURIComponent(config.defaultBook)}&chapter=${chapter}`;
      }
      
      // If no matching reading found, use default book with current day as chapter (for simple plans)
      const chapter = Math.min(currentDay, 150); // Cap at 150 for Psalms
      return `/bible?book=${encodeURIComponent(config.defaultBook)}&chapter=${chapter}`;
    }
    
    // For plans without alwaysUseDefaultBook, use the first reading from the schedule
    const firstReading = todaysReading.readings[0];
    const chapterMatch = firstReading.chapters.match(/^(\d+)/);
    const chapter = chapterMatch ? chapterMatch[1] : "1";
    return `/bible?book=${encodeURIComponent(firstReading.book)}&chapter=${chapter}`;
  }
  
  // Fallback to default config if no schedule data
  if (config) {
    // For book-specific plans without schedule, use current day as chapter
    if (config.alwaysUseDefaultBook) {
      const chapter = Math.min(currentDay, 150); // Use day number as chapter
      return `/bible?book=${encodeURIComponent(config.defaultBook)}&chapter=${chapter}`;
    }
    return `/bible?book=${encodeURIComponent(config.defaultBook)}&chapter=${config.defaultChapter}`;
  }
  
  // Ultimate fallback
  return "/bible";
}

// Get the button label key for a plan
function getPlanButtonLabelKey(planId: string): string {
  const config = planNavConfigs[planId];
  return config?.buttonLabelKey || "openBible";
}

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

// Storage key for localStorage - now stores multiple plans
const STORAGE_KEY = "scripture-forge-reading-plans-v2";

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
  {
    id: "acts-21",
    titleKey: "plans.acts21.title",
    descriptionKey: "plans.acts21.description",
    durationKey: "plans.acts21.duration",
    totalDays: 21,
    categoryKey: "categories.newTestament",
    image: "🔥",
    difficulty: "beginner",
  },
  {
    id: "sermon-mount",
    titleKey: "plans.sermonMount.title",
    descriptionKey: "plans.sermonMount.description",
    durationKey: "plans.sermonMount.duration",
    totalDays: 14,
    categoryKey: "categories.newTestament",
    image: "⛰️",
    difficulty: "beginner",
  },
];

// Load all active plans from localStorage
function loadActivePlans(): Record<string, ActivePlan> {
  if (typeof window === "undefined") return {};
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Error loading reading plans:", error);
  }
  return {};
}

// Save all active plans to localStorage
function saveActivePlans(plans: Record<string, ActivePlan>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
  } catch (error) {
    console.error("Error saving reading plans:", error);
  }
}

export default function ReadingPlansPage() {
  const t = useTranslations("reading");
  const tCommon = useTranslations("common");
  // Store multiple active plans keyed by planId
  const [activePlans, setActivePlans] = useState<Record<string, ActivePlan>>({});
  // Currently selected plan to show in the banner
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isLoaded, setIsLoaded] = useState(false);

  // Load user's progress from localStorage on mount
  useEffect(() => {
    const savedPlans = loadActivePlans();
    setActivePlans(savedPlans);
    // Select the first active plan by default
    const planIds = Object.keys(savedPlans);
    if (planIds.length > 0) {
      setSelectedPlanId(planIds[0]);
    }
    setIsLoaded(true);
  }, []);

  // Save progress whenever activePlans changes
  useEffect(() => {
    if (isLoaded) {
      saveActivePlans(activePlans);
    }
  }, [activePlans, isLoaded]);

  // Get unique category keys for filtering
  const categoryKeys = ["all", ...new Set(readingPlans.map(p => p.categoryKey))];

  const filteredPlans = selectedCategory === "all" 
    ? readingPlans 
    : readingPlans.filter(p => p.categoryKey === selectedCategory);

  // Get the currently selected active plan for the banner
  const currentActivePlan = selectedPlanId ? activePlans[selectedPlanId] : null;
  const activePlanDetails = currentActivePlan 
    ? readingPlans.find(p => p.id === currentActivePlan.planId)
    : null;
  const progress = currentActivePlan && activePlanDetails 
    ? Math.round((currentActivePlan.completedDays.length / activePlanDetails.totalDays) * 100) 
    : 0;
  
  // Get count of active plans
  const activePlanCount = Object.keys(activePlans).length;

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
      // Check if plan already exists - if so, just select it
      if (activePlans[planId]) {
        setSelectedPlanId(planId);
        return;
      }
      // Create new plan progress
      const newPlan: ActivePlan = {
        planId,
        currentDay: 1,
        completedDays: [],
        startedAt: new Date().toISOString(),
      };
      setActivePlans(prev => ({
        ...prev,
        [planId]: newPlan,
      }));
      setSelectedPlanId(planId);
    }
  };

  const handleCompleteDay = () => {
    if (!currentActivePlan || !selectedPlanId) return;
    setActivePlans(prev => ({
      ...prev,
      [selectedPlanId]: {
        ...currentActivePlan,
        completedDays: [...currentActivePlan.completedDays, currentActivePlan.currentDay],
        currentDay: currentActivePlan.currentDay + 1,
      },
    }));
  };

  const handleSelectPlan = (planId: string) => {
    if (activePlans[planId]) {
      setSelectedPlanId(planId);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleResetPlan = (planId: string) => {
    if (!activePlans[planId]) return;
    if (!confirm(t("confirmReset"))) return;
    
    setActivePlans(prev => ({
      ...prev,
      [planId]: {
        ...prev[planId],
        currentDay: 1,
        completedDays: [],
        startedAt: new Date().toISOString(),
      },
    }));
  };

  const handleRemovePlan = (planId: string) => {
    if (!activePlans[planId]) return;
    if (!confirm(t("confirmRemove"))) return;
    
    setActivePlans(prev => {
      const newPlans = { ...prev };
      delete newPlans[planId];
      return newPlans;
    });
    
    // If we removed the selected plan, select another one
    if (selectedPlanId === planId) {
      const remainingPlanIds = Object.keys(activePlans).filter(id => id !== planId);
      setSelectedPlanId(remainingPlanIds.length > 0 ? remainingPlanIds[0] : null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-gradient-to-b from-background to-muted/30">
        <div className="container max-w-6xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-10">
            <h1 className="text-2xl sm:text-4xl font-bold mb-2 sm:mb-3">{t("title")}</h1>
            <p className="text-muted-foreground text-sm sm:text-lg max-w-2xl mx-auto">
              {t("description")}
            </p>
          </div>

          {/* Active Plan Banner */}
          {currentActivePlan && activePlanDetails && (
            <Card className="mb-8 border-primary bg-primary/5">
              <CardContent className="pt-6">
                {/* Plan switcher tabs when multiple plans are active */}
                {activePlanCount > 1 && (
                  <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b">
                    {Object.values(activePlans).map((plan) => {
                      const planInfo = readingPlans.find(p => p.id === plan.planId);
                      if (!planInfo) return null;
                      const isSelected = selectedPlanId === plan.planId;
                      return (
                        <Button
                          key={plan.planId}
                          variant={isSelected ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedPlanId(plan.planId)}
                          className="gap-2"
                        >
                          <span>{planInfo.image}</span>
                          <span className="hidden sm:inline">{t(planInfo.titleKey)}</span>
                        </Button>
                      );
                    })}
                  </div>
                )}
                
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                  <div className="text-6xl">{activePlanDetails.image}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Flame className="w-5 h-5 text-orange-500" />
                      <span className="text-sm font-medium text-orange-500">
                        {currentActivePlan.completedDays.length} {t("dayStreak")}!
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold mb-1">{t(activePlanDetails.titleKey)}</h2>
                    <p className="text-muted-foreground mb-4">
                      {t("dayProgress", { current: currentActivePlan.currentDay, total: activePlanDetails.totalDays })}
                    </p>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-muted rounded-full h-3 mb-4">
                      <div 
                        className="bg-primary h-3 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>

                    {/* Today's Reading - Only show for plans with schedule data */}
                    {(() => {
                      const todaysReading = getDailyReading(currentActivePlan.planId, currentActivePlan.currentDay);
                      if (todaysReading) {
                        return (
                          <div className="bg-background/50 rounded-lg p-4 mb-4 border">
                            <h3 className="font-semibold mb-2 flex items-center gap-2">
                              <BookOpen className="w-4 h-4" />
                              {t("todaysReading")} - {t("day")} {currentActivePlan.currentDay}
                            </h3>
                            <div className="grid gap-2">
                              {todaysReading.readings.map((reading, idx) => (
                                <Link 
                                  key={idx}
                                  href={`/bible?book=${encodeURIComponent(reading.book)}&chapter=${reading.chapters.split("-")[0]}`}
                                  className="flex items-center justify-between p-2 rounded hover:bg-muted transition-colors group"
                                >
                                  <span className="font-medium">{reading.book} {reading.chapters}</span>
                                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                </Link>
                              ))}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })()}
                    
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                      <Button onClick={handleCompleteDay} className="gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        {t("completeDay")} {currentActivePlan.currentDay}
                      </Button>
                      <Link href={getPlanNavigationUrl(currentActivePlan.planId, currentActivePlan.currentDay)}>
                        <Button variant="outline" className="gap-2">
                          <BookOpen className="w-4 h-4" />
                          {t(getPlanButtonLabelKey(currentActivePlan.planId))}
                        </Button>
                      </Link>
                      <div className="flex gap-2 ml-auto">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleResetPlan(selectedPlanId!)}
                          title={t("resetPlan")}
                          className="text-muted-foreground hover:text-orange-500"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleRemovePlan(selectedPlanId!)}
                          title={t("removePlan")}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
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
                <div className="text-2xl font-bold">{activePlanCount}</div>
                <div className="text-sm text-muted-foreground">{t("activePlans")}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <Flame className="w-8 h-8 mx-auto text-orange-500 mb-2" />
                <div className="text-2xl font-bold">
                  {Object.values(activePlans).reduce((sum, p) => sum + p.completedDays.length, 0)}
                </div>
                <div className="text-sm text-muted-foreground">{t("totalDaysCompleted")}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <Trophy className="w-8 h-8 mx-auto text-yellow-500 mb-2" />
                <div className="text-2xl font-bold">
                  {Object.values(activePlans).filter(p => {
                    const planInfo = readingPlans.find(rp => rp.id === p.planId);
                    return planInfo && p.completedDays.length >= planInfo.totalDays;
                  }).length}
                </div>
                <div className="text-sm text-muted-foreground">{t("plansCompleted")}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <Star className="w-8 h-8 mx-auto text-purple-500 mb-2" />
                <div className="text-2xl font-bold">{readingPlans.length}</div>
                <div className="text-sm text-muted-foreground">{t("availablePlans")}</div>
              </CardContent>
            </Card>
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap scrollbar-hide">
            {categoryKeys.map((categoryKey) => (
              <Button
                key={categoryKey}
                variant={selectedCategory === categoryKey ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(categoryKey)}
                className="rounded-full whitespace-nowrap shrink-0"
              >
                {categoryKey === "all" ? t("categories.all") : t(categoryKey)}
              </Button>
            ))}
          </div>

          {/* Plans Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredPlans.map((plan) => {
              const planProgress = activePlans[plan.id];
              const isActive = !!planProgress;
              const isSelected = selectedPlanId === plan.id;
              const activeProgress = isActive ? Math.round((planProgress.completedDays.length / plan.totalDays) * 100) : 0;
              return (
                <Card 
                  key={plan.id} 
                  className={`hover:shadow-lg transition-all ${isSelected ? "ring-2 ring-primary" : isActive ? "ring-1 ring-primary/50" : ""}`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <span className="text-4xl">{plan.image}</span>
                      <div className="flex items-center gap-2">
                        {isActive && (
                          <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                            {t("inProgress")}
                          </span>
                        )}
                        <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(plan.difficulty)}`}>
                          {t(`difficulty.${plan.difficulty}`)}
                        </span>
                      </div>
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
                          {t("dayProgress", { current: planProgress.currentDay, total: plan.totalDays })} ({activeProgress}%)
                        </div>
                        <Button 
                          className="w-full group" 
                          variant={isSelected ? "secondary" : "default"}
                          onClick={() => handleSelectPlan(plan.id)}
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
