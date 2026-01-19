"use client";

import { useState } from "react";
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
  title: string;
  description: string;
  duration: string;
  totalDays: number;
  category: string;
  image: string;
  difficulty: "beginner" | "intermediate" | "advanced";
}

interface ActivePlan {
  planId: string;
  currentDay: number;
  completedDays: number[];
  startedAt: Date;
}

const readingPlans: ReadingPlan[] = [
  {
    id: "bible-in-year",
    title: "Bible in a Year",
    description: "Read through the entire Bible in 365 days with daily Old Testament, New Testament, and Psalms readings.",
    duration: "365 days",
    totalDays: 365,
    category: "Whole Bible",
    image: "📖",
    difficulty: "intermediate",
  },
  {
    id: "gospels-30",
    title: "The Gospels in 30 Days",
    description: "Journey through Matthew, Mark, Luke, and John to encounter the life and teachings of Jesus.",
    duration: "30 days",
    totalDays: 30,
    category: "New Testament",
    image: "✝️",
    difficulty: "beginner",
  },
  {
    id: "psalms-month",
    title: "Psalms in a Month",
    description: "Experience the full range of human emotion and divine praise through all 150 Psalms.",
    duration: "30 days",
    totalDays: 30,
    category: "Poetry",
    image: "🎵",
    difficulty: "beginner",
  },
  {
    id: "proverbs-31",
    title: "Proverbs: 31 Days of Wisdom",
    description: "One chapter of Proverbs each day for practical wisdom in daily life.",
    duration: "31 days",
    totalDays: 31,
    category: "Wisdom",
    image: "💡",
    difficulty: "beginner",
  },
  {
    id: "romans-deep",
    title: "Romans Deep Dive",
    description: "A thorough 16-week study through Paul's theological masterpiece.",
    duration: "16 weeks",
    totalDays: 112,
    category: "Epistles",
    image: "📜",
    difficulty: "advanced",
  },
  {
    id: "genesis-exodus",
    title: "Genesis & Exodus Journey",
    description: "Explore the foundations of faith through creation, the patriarchs, and the exodus.",
    duration: "60 days",
    totalDays: 60,
    category: "Old Testament",
    image: "🌍",
    difficulty: "intermediate",
  },
];

const sampleActivePlan: ActivePlan = {
  planId: "gospels-30",
  currentDay: 8,
  completedDays: [1, 2, 3, 4, 5, 6, 7],
  startedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
};

export default function ReadingPlansPage() {
  const t = useTranslations("reading");
  const tCommon = useTranslations("common");
  const [activePlan, setActivePlan] = useState<ActivePlan | null>(sampleActivePlan);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = ["all", ...new Set(readingPlans.map(p => p.category))];

  const filteredPlans = selectedCategory === "all" 
    ? readingPlans 
    : readingPlans.filter(p => p.category === selectedCategory);

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
        startedAt: new Date(),
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
                    <h2 className="text-2xl font-bold mb-1">{activePlanDetails.title}</h2>
                    <p className="text-muted-foreground mb-4">
                      {activePlan.currentDay} / {activePlanDetails.totalDays}
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
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="rounded-full capitalize"
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Plans Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlans.map((plan) => {
              const isActive = activePlan?.planId === plan.id;
              return (
                <Card 
                  key={plan.id} 
                  className={`hover:shadow-lg transition-all ${isActive ? "ring-2 ring-primary" : ""}`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <span className="text-4xl">{plan.image}</span>
                      <span className={`text-xs px-2 py-1 rounded-full capitalize ${getDifficultyColor(plan.difficulty)}`}>
                        {plan.difficulty}
                      </span>
                    </div>
                    <CardTitle className="mt-2">{plan.title}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {plan.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        {plan.category}
                      </span>
                    </div>
                    
                    {isActive ? (
                      <Button className="w-full" variant="secondary" disabled>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        {t("currentlyActive")}
                      </Button>
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
