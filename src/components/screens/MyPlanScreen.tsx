"use client";

import { useMemo, useState } from "react";
import { useAppStore } from "@/lib/store";
import { useI18n } from "@/hooks/use-i18n";
import { courses, getCourse } from "@/lib/mock-data";
import type { Course, SavedPlan, PlanWeek } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { EmptyState } from "@/components/shared/EmptyState";
import { CourseThumb } from "@/components/shared/CourseThumb";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Target,
  Sparkles,
  CalendarClock,
  Clock,
  CheckCircle2,
  Trophy,
  Flag,
  Plus,
  Trash2,
  PlayCircle,
  RotateCcw,
  Lightbulb,
  Check,
  Search,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  CalendarDays,
  Wand2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const TIMELINE_OPTIONS = [4, 8, 12, 16, 24] as const;

export function MyPlanScreen() {
  const { t, locale, formatNumber, isRTL } = useI18n();
  const navigate = useAppStore((s) => s.navigate);
  const savedPlans = useAppStore((s) => s.savedPlans);
  const activePlanId = useAppStore((s) => s.activePlanId);
  const setActivePlan = useAppStore((s) => s.setActivePlan);
  const savePlan = useAppStore((s) => s.savePlan);
  const deletePlan = useAppStore((s) => s.deletePlan);
  const togglePlanWeekComplete = useAppStore((s) => s.togglePlanWeekComplete);
  const enrolledCourseIds = useAppStore((s) => s.enrolledCourseIds);
  const pushToast = useAppStore((s) => s.pushToast);
  const fireConfetti = useAppStore((s) => s.fireConfetti);

  const [activeTab, setActiveTab] = useState<"active" | "all">("active");

  // Custom Plan Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [customGoal, setCustomGoal] = useState("");
  const [customTimeline, setCustomTimeline] = useState<number>(12);
  const [customWeeklyHours, setCustomWeeklyHours] = useState<number>(6);
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
  const [courseSearch, setCourseSearch] = useState("");

  // Active plan resolution
  const activePlan: SavedPlan | undefined = useMemo(() => {
    if (activePlanId) {
      const found = savedPlans.find((p) => p.id === activePlanId);
      if (found) return found;
    }
    return savedPlans[0];
  }, [savedPlans, activePlanId]);

  // Filter courses for modal selection
  const selectableCourses = useMemo(() => {
    const q = courseSearch.trim().toLowerCase();
    if (!q) return courses;
    return courses.filter((c) => {
      const text = `${c.title} ${c.titleAr} ${c.category} ${c.skills.join(" ")}`.toLowerCase();
      return text.includes(q);
    });
  }, [courseSearch]);

  // Handlers for custom plan creation
  const handleToggleCourseSelection = (courseId: string) => {
    setSelectedCourseIds((prev) =>
      prev.includes(courseId) ? prev.filter((id) => id !== courseId) : [...prev, courseId]
    );
  };

  const handleCreateCustomPlan = () => {
    if (!customGoal.trim()) {
      pushToast({
        title: t("myPlan.modal.errorName"),
        variant: "destructive",
      });
      return;
    }
    if (selectedCourseIds.length === 0) {
      pushToast({
        title: t("myPlan.modal.errorCourses"),
        variant: "destructive",
      });
      return;
    }

    // Build timeline weeks and distribute chosen courses
    const weekBuckets: string[][] = Array.from({ length: customTimeline }, () => []);
    selectedCourseIds.forEach((cid, idx) => {
      const w = Math.min(customTimeline - 1, Math.floor((idx * customTimeline) / selectedCourseIds.length));
      weekBuckets[w].push(cid);
    });

    const weeks: PlanWeek[] = [];
    for (let w = 0; w < customTimeline; w++) {
      const weekNum = w + 1;
      const hours = customWeeklyHours;
      const isLast = w === customTimeline - 1;
      const isMid = w === Math.floor(customTimeline / 2);

      weeks.push({
        week: weekNum,
        focus: `Module ${weekNum} Practice & Concepts`,
        focusAr: `الوحدة ${weekNum}: التطبيق العملي والمفاهيم`,
        hours,
        courseIds: weekBuckets[w],
        milestone: isLast
          ? "Complete Capstone Project & Roadmap Review"
          : isMid
          ? "Mid-term Assessment & Practice Project"
          : undefined,
        milestoneAr: isLast
          ? "إتمام مشروع التخرج ومراجعة مسار الخطة"
          : isMid
          ? "تقييم منتصف الخطة ومشروع تطبيقي"
          : undefined,
      });
    }

    const totalHours = weeks.reduce((sum, wk) => sum + wk.hours, 0);

    const newPlanId = savePlan({
      title: customGoal.trim(),
      titleAr: customGoal.trim(),
      goal: customGoal.trim(),
      timelineWeeks: customTimeline,
      weeklyHours: customWeeklyHours,
      totalHours,
      totalCourses: selectedCourseIds.length,
      weeks,
      courseIds: selectedCourseIds,
      tips: [
        "Study consistently every day for at least 45 minutes.",
        "Build a hands-on project for every major topic.",
        "Book a consultation session with a mentor to review your progress.",
      ],
      tipsAr: [
        "ادرس بانتظام يومياً لمدة لا تقل عن 45 دقيقة.",
        "ابنِ مشروعاً تطبيقياً لكل موضوع رئيسي.",
        "احجز جلسة استشارة مع خبير لمراجعة تقدمك وتصحيح المسار.",
      ],
      isAiGenerated: false,
      completedWeeks: [],
    });

    setActivePlan(newPlanId);
    setIsCreateModalOpen(false);
    setCustomGoal("");
    setSelectedCourseIds([]);
    fireConfetti();
    pushToast({
      title: t("myPlan.createdSuccess"),
      variant: "success",
    });
  };

  const handleToggleWeek = (weekNum: number) => {
    if (!activePlan) return;
    togglePlanWeekComplete(activePlan.id, weekNum);
    const wasDone = activePlan.completedWeeks.includes(weekNum);
    if (!wasDone) {
      pushToast({
        title: t("myPlan.milestoneDone"),
        variant: "success",
      });
    }
  };

  // Progress metrics
  const completedWeeksCount = activePlan?.completedWeeks.length ?? 0;
  const totalWeeksCount = activePlan?.weeks.length ?? 0;
  const planProgressPct = totalWeeksCount > 0 ? Math.round((completedWeeksCount / totalWeeksCount) * 100) : 0;

  return (
    <div className="view-enter mx-auto w-full max-w-7xl px-4 sm:px-6 py-6 lg:py-10 space-y-8">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-semibold">
            <Target className="h-3.5 w-3.5" />
            {t("myPlan.title")}
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
            {t("myPlan.title")}
          </h1>
          <p className="max-w-2xl text-sm sm:text-base text-muted-foreground">
            {t("myPlan.subtitle")}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("ai-planner")}
            className="gap-1.5"
          >
            <Wand2 className="h-3.5 w-3.5 text-primary" />
            <span>{t("myPlan.generateAi")}</span>
          </Button>
          <Button
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
            className="gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>{t("myPlan.createCustom")}</span>
          </Button>
        </div>
      </header>

      {/* Main Tabs */}
      {savedPlans.length > 0 ? (
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "active" | "all")} className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <TabsList className="h-auto p-1">
              <TabsTrigger value="active" className="gap-1.5 py-1.5 px-3">
                <Target className="h-3.5 w-3.5" />
                {t("myPlan.tab.active")}
              </TabsTrigger>
              <TabsTrigger value="all" className="gap-1.5 py-1.5 px-3">
                <CalendarDays className="h-3.5 w-3.5" />
                {t("myPlan.tab.allPlans")} ({savedPlans.length})
              </TabsTrigger>
            </TabsList>

            {/* Active Plan Selector if multiple plans exist */}
            {savedPlans.length > 1 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground hidden sm:inline">
                  {t("myPlan.switchPlan")}:
                </span>
                <Select
                  value={activePlan?.id}
                  onValueChange={(id) => setActivePlan(id)}
                >
                  <SelectTrigger className="h-8 text-xs w-[220px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {savedPlans.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {locale === "ar" && p.titleAr ? p.titleAr : p.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* ---------------- Tab 1: Active Plan ---------------- */}
          <TabsContent value="active" className="space-y-8">
            {activePlan ? (
              <>
                {/* Plan Overview Hero Card */}
                <Card className="border-2 border-primary/20 bg-gradient-to-br from-card via-accent/15 to-card overflow-hidden">
                  <CardHeader className="p-5 pb-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className="gap-1 text-xs border-primary/40 text-primary font-semibold"
                        >
                          {activePlan.isAiGenerated ? (
                            <>
                              <Sparkles className="h-3 w-3" />
                              AI Planner
                            </>
                          ) : (
                            <>
                              <Target className="h-3 w-3" />
                              Custom Plan
                            </>
                          )}
                        </Badge>
                        {activePlan.confidence && (
                          <Badge className="bg-success text-success-foreground text-xs font-semibold">
                            {activePlan.confidence}% Match
                          </Badge>
                        )}
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          deletePlan(activePlan.id);
                          pushToast({ title: locale === "ar" ? "تم حذف الخطة" : "Plan deleted" });
                        }}
                        className="text-xs text-muted-foreground hover:text-destructive gap-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        {t("myPlan.delete")}
                      </Button>
                    </div>

                    <h2 className="text-xl sm:text-2xl font-bold text-foreground mt-2">
                      {locale === "ar" && activePlan.titleAr ? activePlan.titleAr : activePlan.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {activePlan.goal}
                    </p>
                  </CardHeader>

                  <CardContent className="p-5 pt-2 space-y-4">
                    {/* 4 Key Metrics */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                      <div className="rounded-lg border border-border bg-background p-3 text-center">
                        <CalendarClock className="h-4 w-4 text-primary mx-auto mb-1" />
                        <span className="text-[11px] text-muted-foreground block">{t("myPlan.timeline")}</span>
                        <span className="text-sm font-bold text-foreground">
                          {t("myPlan.timelineWeeks", { n: activePlan.timelineWeeks })}
                        </span>
                      </div>

                      <div className="rounded-lg border border-border bg-background p-3 text-center">
                        <Clock className="h-4 w-4 text-primary mx-auto mb-1" />
                        <span className="text-[11px] text-muted-foreground block">{t("myPlan.weeklyHours")}</span>
                        <span className="text-sm font-bold text-foreground">
                          {t("myPlan.weeklyHoursVal", { n: activePlan.weeklyHours })}
                        </span>
                      </div>

                      <div className="rounded-lg border border-border bg-background p-3 text-center">
                        <BookOpen className="h-4 w-4 text-primary mx-auto mb-1" />
                        <span className="text-[11px] text-muted-foreground block">{t("myPlan.totalCourses")}</span>
                        <span className="text-sm font-bold text-foreground">
                          {formatNumber(activePlan.totalCourses)} {locale === "ar" ? "دورات" : "courses"}
                        </span>
                      </div>

                      <div className="rounded-lg border border-border bg-background p-3 text-center">
                        <Trophy className="h-4 w-4 text-amber-500 mx-auto mb-1" />
                        <span className="text-[11px] text-muted-foreground block">{t("myPlan.progress")}</span>
                        <span className="text-sm font-bold text-foreground">
                          {planProgressPct}%
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1.5 pt-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-foreground">
                          {t("myPlan.completedWeeks", {
                            done: formatNumber(completedWeeksCount),
                            total: formatNumber(totalWeeksCount),
                          })}
                        </span>
                        <span className="font-bold text-primary">{planProgressPct}%</span>
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all duration-300"
                          style={{ width: `${planProgressPct}%` }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Week by Week Roadmap */}
                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                      <CalendarClock className="h-4 w-4 text-primary" />
                      {locale === "ar" ? "خارطة الطريق الأسبوعية" : "Weekly Curriculum & Tasks"}
                    </h3>
                    <span className="text-xs text-muted-foreground">
                      {t("myPlan.timelineWeeks", { n: activePlan.weeks.length })}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {activePlan.weeks.map((week) => {
                      const isWeekDone = activePlan.completedWeeks.includes(week.week);
                      const focus = locale === "ar" ? week.focusAr : week.focus;
                      const milestone = locale === "ar" ? week.milestoneAr : week.milestone;
                      const weekCourses = week.courseIds
                        .map((cid) => getCourse(cid))
                        .filter((c): c is Course => Boolean(c));

                      return (
                        <Card
                          key={week.week}
                          className={cn(
                            "transition-all border",
                            isWeekDone
                              ? "bg-muted/30 border-success/40"
                              : "bg-card border-border hover:border-primary/40"
                          )}
                        >
                          <CardContent className="p-4 sm:p-5 space-y-3">
                            {/* Week Header */}
                            <div className="flex flex-wrap items-start justify-between gap-2">
                              <div className="flex items-center gap-2.5">
                                <Badge
                                  className={cn(
                                    "text-xs font-bold",
                                    isWeekDone
                                      ? "bg-success text-success-foreground"
                                      : "bg-primary text-primary-foreground"
                                  )}
                                >
                                  {locale === "ar" ? `الأسبوع ${week.week}` : `Week ${week.week}`}
                                </Badge>
                                <span
                                  className={cn(
                                    "font-semibold text-sm sm:text-base text-foreground",
                                    isWeekDone && "line-through opacity-70"
                                  )}
                                >
                                  {focus}
                                </span>
                              </div>

                              {/* Toggle completed button */}
                              <Button
                                variant={isWeekDone ? "secondary" : "outline"}
                                size="sm"
                                onClick={() => handleToggleWeek(week.week)}
                                className={cn(
                                  "gap-1.5 text-xs",
                                  isWeekDone && "border-success/40 text-success"
                                )}
                              >
                                {isWeekDone ? (
                                  <>
                                    <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                                    {t("myPlan.weekCompleted")}
                                  </>
                                ) : (
                                  <>
                                    <Check className="h-3.5 w-3.5" />
                                    {t("myPlan.markComplete")}
                                  </>
                                )}
                              </Button>
                            </div>

                            {/* Milestone banner if any */}
                            {milestone && (
                              <div className="flex items-center gap-2 rounded-md bg-amber-500/10 border border-amber-500/20 px-3 py-2 text-xs font-medium text-amber-700 dark:text-amber-300">
                                <Trophy className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                                <span>{milestone}</span>
                              </div>
                            )}

                            {/* Assigned Courses */}
                            {weekCourses.length > 0 && (
                              <div className="pt-2 space-y-2">
                                <span className="text-xs font-semibold text-muted-foreground block">
                                  {locale === "ar" ? "الدورات المقترحة لهذا الأسبوع:" : "Courses for this week:"}
                                </span>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  {weekCourses.map((c) => {
                                    const isEnrolled = enrolledCourseIds.includes(c.id);
                                    const title = locale === "ar" ? c.titleAr : c.title;

                                    return (
                                      <div
                                        key={c.id}
                                        className="flex items-center justify-between gap-3 p-2.5 rounded-lg border border-border bg-background hover:bg-muted/40 transition-colors"
                                      >
                                        <div className="flex items-center gap-2.5 min-w-0">
                                          <div className="w-16 h-10 shrink-0 rounded overflow-hidden">
                                            <CourseThumb course={c} />
                                          </div>
                                          <div className="min-w-0">
                                            <h4 className="text-xs font-bold text-foreground truncate">
                                              {title}
                                            </h4>
                                            <span className="text-[10px] text-muted-foreground block">
                                              {c.level} · {c.totalHours}h
                                            </span>
                                          </div>
                                        </div>

                                        <Button
                                          size="sm"
                                          variant={isEnrolled ? "default" : "outline"}
                                          className="text-xs h-7 px-2.5 shrink-0"
                                          onClick={() =>
                                            isEnrolled
                                              ? navigate("course-player", { courseId: c.id })
                                              : navigate("course-landing", { courseId: c.id })
                                          }
                                        >
                                          {isEnrolled ? (
                                            <>
                                              <PlayCircle className="h-3 w-3 me-1" />
                                              {t("myLearning.resume")}
                                            </>
                                          ) : (
                                            <>
                                              {locale === "ar" ? "عرض الدورة" : "View Course"}
                                            </>
                                          )}
                                        </Button>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </section>

                {/* Coach Tips */}
                {activePlan.tips && activePlan.tips.length > 0 && (
                  <Card className="border border-border">
                    <CardHeader className="p-5 pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Lightbulb className="h-4 w-4 text-amber-500" />
                        {locale === "ar" ? "نصائح وإرشادات النجاح" : "Study Tips & Recommendations"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-5 pt-0">
                      <ul className="space-y-2">
                        {(locale === "ar" && activePlan.tipsAr ? activePlan.tipsAr : activePlan.tips).map(
                          (tip, i) => (
                            <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-muted-foreground">
                              <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                              <span>{tip}</span>
                            </li>
                          )
                        )}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : null}
          </TabsContent>

          {/* ---------------- Tab 2: All Saved Plans ---------------- */}
          <TabsContent value="all" className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {savedPlans.map((p) => {
                const isSelected = p.id === activePlan?.id;
                const completed = p.completedWeeks.length;
                const total = p.weeks.length;
                const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
                const title = locale === "ar" && p.titleAr ? p.titleAr : p.title;

                return (
                  <Card
                    key={p.id}
                    className={cn(
                      "flex flex-col justify-between overflow-hidden transition-all border",
                      isSelected && "border-primary ring-2 ring-primary/20"
                    )}
                  >
                    <CardHeader className="p-5 pb-3 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <Badge variant={p.isAiGenerated ? "default" : "secondary"} className="text-[10px]">
                          {p.isAiGenerated ? "AI Planner" : "Custom"}
                        </Badge>
                        {isSelected && (
                          <Badge className="bg-primary text-primary-foreground text-[10px]">
                            {t("myPlan.activePlan")}
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-bold text-base text-foreground line-clamp-2">
                        {title}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-2">{p.goal}</p>
                    </CardHeader>

                    <CardContent className="p-5 pt-0 space-y-4">
                      <div className="grid grid-cols-3 gap-2 text-center text-xs py-2 border-y border-border">
                        <div>
                          <span className="text-[10px] text-muted-foreground block">{t("myPlan.timeline")}</span>
                          <span className="font-bold text-foreground">{p.timelineWeeks}w</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-muted-foreground block">{t("myPlan.weeklyHours")}</span>
                          <span className="font-bold text-foreground">{p.weeklyHours}h</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-muted-foreground block">{t("myPlan.totalCourses")}</span>
                          <span className="font-bold text-foreground">{p.totalCourses}</span>
                        </div>
                      </div>

                      {/* Progress */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                          <span>{pct}% completed</span>
                          <span>{completed}/{total} weeks</span>
                        </div>
                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        {!isSelected && (
                          <Button
                            size="sm"
                            className="flex-1 text-xs"
                            onClick={() => {
                              setActivePlan(p.id);
                              setActiveTab("active");
                            }}
                          >
                            {t("myPlan.switchPlan")}
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          onClick={() => deletePlan(p.id)}
                          aria-label={t("myPlan.delete")}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      ) : (
        /* Empty State */
        <EmptyState
          icon={Target}
          title={t("myPlan.empty.title")}
          description={t("myPlan.empty.desc")}
          action={
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Button onClick={() => navigate("ai-planner")} className="gap-2">
                <Wand2 className="h-4 w-4" />
                {t("myPlan.generateAi")}
              </Button>
              <Button variant="outline" onClick={() => setIsCreateModalOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                {t("myPlan.createCustom")}
              </Button>
            </div>
          }
        />
      )}

      {/* ---------------- Custom Plan Builder Modal ---------------- */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              {t("myPlan.modal.title")}
            </DialogTitle>
            <DialogDescription>{t("myPlan.modal.desc")}</DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-3">
            {/* Plan Title / Goal */}
            <div className="space-y-1.5">
              <Label htmlFor="custom-plan-title" className="text-xs font-semibold">
                {t("myPlan.modal.planName")} *
              </Label>
              <Input
                id="custom-plan-title"
                value={customGoal}
                onChange={(e) => setCustomGoal(e.target.value)}
                placeholder={t("myPlan.modal.namePlaceholder")}
              />
            </div>

            {/* Timeline & Weekly Hours */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">{t("myPlan.modal.timeline")}</Label>
                <Select
                  value={String(customTimeline)}
                  onValueChange={(v) => setCustomTimeline(Number(v))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMELINE_OPTIONS.map((w) => (
                      <SelectItem key={w} value={String(w)}>
                        {t("aiPlanner.totalWeeks", { n: w })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold">{t("myPlan.modal.hours")}</Label>
                  <Badge variant="secondary" className="text-xs">
                    {customWeeklyHours}h / {locale === "ar" ? "أسبوع" : "week"}
                  </Badge>
                </div>
                <Slider
                  min={2}
                  max={25}
                  step={1}
                  value={[customWeeklyHours]}
                  onValueChange={(vals) => setCustomWeeklyHours(vals[0] ?? customWeeklyHours)}
                  className="pt-2"
                />
              </div>
            </div>

            <Separator />

            {/* Course Selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-xs font-semibold block">
                    {t("myPlan.modal.selectCourses")} *
                  </Label>
                  <span className="text-[11px] text-muted-foreground">
                    {t("myPlan.modal.selectedCount", { n: selectedCourseIds.length })}
                  </span>
                </div>

                <div className="relative w-48">
                  <Search className="absolute start-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    type="text"
                    value={courseSearch}
                    onChange={(e) => setCourseSearch(e.target.value)}
                    placeholder={t("myPlan.modal.searchCourses")}
                    className="h-8 ps-8 text-xs"
                  />
                </div>
              </div>

              {/* Course list selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pe-1">
                {selectableCourses.map((c) => {
                  const isChecked = selectedCourseIds.includes(c.id);
                  const title = locale === "ar" ? c.titleAr : c.title;

                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleToggleCourseSelection(c.id)}
                      className={cn(
                        "flex items-start gap-2.5 p-2 rounded-lg border text-start transition-all",
                        isChecked
                          ? "border-primary bg-primary/10 ring-1 ring-primary"
                          : "border-border bg-card hover:bg-muted/50"
                      )}
                    >
                      <div
                        className={cn(
                          "w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5",
                          isChecked ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground"
                        )}
                      >
                        {isChecked && <Check className="h-3 w-3" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-semibold text-foreground line-clamp-1 leading-snug">
                          {title}
                        </h4>
                        <span className="text-[10px] text-muted-foreground block">
                          {c.category} · {c.totalHours}h
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button onClick={handleCreateCustomPlan} className="gap-1.5 font-semibold">
              <Target className="h-4 w-4" />
              {t("myPlan.modal.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
