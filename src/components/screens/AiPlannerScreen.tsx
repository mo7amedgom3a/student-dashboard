"use client";

/**
 * AiPlannerScreen — AI Learning Planner (mock).
 *
 * The user describes a learning goal + constraints (role, weekly hours,
 * timeline, current level), then "generates" a personalized week-by-week
 * plan with courses, weekly focus, hours, milestones, and coach tips.
 *
 * IMPORTANT: There is NO real LLM call. The plan is produced by a pure,
 * deterministic-ish `generateMockPlan` function in this file. A 1.4s
 * setTimeout (fired from the click handler, NOT an effect) simulates the
 * "thinking" delay before the plan appears, then confetti + a success toast
 * fire for delight.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { useI18n } from "@/hooks/use-i18n";
import { courses, getCourse, getRole, roles } from "@/lib/mock-data";
import type { Course } from "@/lib/types";
import { CourseThumb } from "@/components/shared/CourseThumb";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  BrainCircuit,
  Briefcase,
  CalendarClock,
  Check,
  Clock,
  Code2,
  Flag,
  Layers,
  Lightbulb,
  Megaphone,
  PenTool,
  PieChart,
  RefreshCw,
  Save,
  Sparkles,
  Target,
  Trophy,
  Wand2,
} from "lucide-react";

// ---------------- Types ----------------

type Level = "beginner" | "intermediate" | "advanced";

interface PlanWeek {
  week: number;
  focus: string;
  focusAr: string;
  hours: number;
  courseIds: string[];
  milestone?: string;
  milestoneAr?: string;
}

interface GeneratedPlan {
  goal: string;
  weeks: PlanWeek[];
  totalHours: number;
  totalCourses: number;
  courseIds: string[];
  tips: string[];
  tipsAr: string[];
  confidence: number;
}

// ---------------- Static lookups ----------------

/** Map role.icon (lucide name string from mock-data) -> component. */
const ROLE_ICONS: Record<string, LucideIcon> = {
  BarChart3,
  Code2,
  Layers,
  PenTool,
  Briefcase,
  Megaphone,
  BrainCircuit,
  PieChart,
};

const TIMELINE_OPTIONS = [4, 8, 12, 16, 24] as const;
const GENERATE_DELAY_MS = 1400;

/** A themed focus sequence cycled across the timeline weeks. */
const FOCUSES: { en: string; ar: string }[] = [
  { en: "Foundations", ar: "الأساسيات" },
  { en: "Core skills", ar: "المهارات الأساسية" },
  { en: "Hands-on practice", ar: "تطبيق عملي" },
  { en: "Project building", ar: "بناء مشروع" },
  { en: "Advanced patterns", ar: "أنماط متقدمة" },
  { en: "Deep dive", ar: "تعمّق" },
  { en: "Real-world case studies", ar: "حالات واقعية" },
  { en: "Review & polish", ar: "مراجعة وتحسين" },
];

/** Milestones that punctuate the plan every few weeks. */
const MILESTONES: { en: string; ar: string }[] = [
  {
    en: "Complete your first mini-project",
    ar: "أكمل أول مشروع مصغّر لك",
  },
  {
    en: "Finish the core curriculum",
    ar: "أنهِ المنهج الأساسي",
  },
  {
    en: "Pass a practice quiz",
    ar: "اجتز اختباراً تجريبياً",
  },
  {
    en: "Build a portfolio-ready capstone",
    ar: "ابنِ مشروع تخرج جاهز للمعرض",
  },
  {
    en: "Publish your portfolio piece",
    ar: "انشر عملك في معرضك",
  },
  {
    en: "Mock interview ready",
    ar: "جاهز لمقابلة تجريبية",
  },
];

const TIPS: { en: string; ar: string }[] = [
  {
    en: "Study in 25-minute focused blocks (Pomodoro) with 5-minute breaks.",
    ar: "ادرس في فترات مركّزة 25 دقيقة (بومودورو) مع 5 دقائق راحة.",
  },
  {
    en: "Revisit yesterday's lesson before starting a new one.",
    ar: "راجع درس أمس قبل بدء درس جديد.",
  },
  {
    en: "Build a small project alongside week 3 to lock in the basics.",
    ar: "ابنِ مشروعاً صغيراً إلى جانب الأسبوع الثالث لترسيخ الأساسيات.",
  },
  {
    en: "Take notes by hand for better retention.",
    ar: "دوّن ملاحظاتك بخط اليد للاحتفاظ بها بشكل أفضل.",
  },
];

/** Mock "similar learners" count used in the confidence note. */
const SIMILAR_LEARNERS = 1240;

// ---------------- Mock plan generator ----------------

/**
 * Picks courses relevant to the goal/role, distributes them across the
 * timeline, and assembles per-week focus + hours + milestones + tips.
 *
 * Pure function — no side effects, no API calls. Deterministic-ish: for
 * the same inputs it returns the same plan.
 */
function generateMockPlan(params: {
  goal: string;
  roleId?: string;
  weeklyHours: number;
  timelineWeeks: number;
  level: Level;
}): GeneratedPlan {
  const { goal, roleId, weeklyHours, timelineWeeks, level } = params;

  // ---- 1. Seed the course pool ----
  const pool: Course[] = [];
  const seen = new Set<string>();

  // 1a. If a role is picked, lead with its recommended courses.
  if (roleId) {
    const role = getRole(roleId);
    if (role) {
      for (const cid of role.recommendedCourseIds) {
        const c = getCourse(cid);
        if (c && !seen.has(c.id)) {
          pool.push(c);
          seen.add(c.id);
        }
      }
    }
  }

  // 1b. Augment with keyword matches from the goal text.
  const keywords = goal
    .toLowerCase()
    .split(/[^a-z\u0600-\u06FF]+/i)
    .map((w) => w.trim())
    .filter((w) => w.length >= 3);

  if (keywords.length > 0) {
    const matches = courses.filter((c) => {
      if (seen.has(c.id)) return false;
      const haystack = [
        c.title.toLowerCase(),
        c.category.toLowerCase(),
        c.skills.join(" ").toLowerCase(),
        c.tags.join(" ").toLowerCase(),
      ].join(" ");
      return keywords.some((kw) => haystack.includes(kw));
    });
    // Sort by enrollment count (popularity) and take a few.
    matches.sort((a, b) => b.enrolledCount - a.enrolledCount);
    for (const c of matches.slice(0, 4)) {
      pool.push(c);
      seen.add(c.id);
    }
  }

  // 1c. If still under 4, top up with the most popular courses.
  if (pool.length < 4) {
    const fallback = [...courses]
      .filter((c) => !seen.has(c.id))
      .sort((a, b) => b.enrolledCount - a.enrolledCount);
    for (const c of fallback) {
      if (pool.length >= 6) break;
      pool.push(c);
      seen.add(c.id);
    }
  }

  // 1d. Cap the pool between 4 and 8 courses.
  const trimmed = pool.slice(0, Math.min(8, Math.max(4, pool.length)));

  // ---- 2. Distribute courses across weeks ----
  // Each course is placed at week = floor(i * timelineWeeks / N) + 1.
  // With N ≤ timelineWeeks this spreads courses 1-per-week, leaving review
  // weeks empty. With N > timelineWeeks some weeks get 2 courses.
  const courseCount = trimmed.length;
  const weekBuckets: Course[][] = Array.from({ length: timelineWeeks }, () => []);
  for (let i = 0; i < courseCount; i++) {
    const w = Math.min(
      timelineWeeks - 1,
      Math.floor((i * timelineWeeks) / courseCount),
    );
    weekBuckets[w].push(trimmed[i]);
  }

  // ---- 3. Build week objects ----
  const weeks: PlanWeek[] = [];
  let milestoneIdx = 0;
  for (let w = 0; w < timelineWeeks; w++) {
    // Hours: weeklyHours ± a deterministic ±1 variation (clamped ≥1).
    const variation = ((w + 1) * 7) % 3 - 1;
    const hours = Math.max(1, weeklyHours + variation);

    // Focus: cycle through the FOCUSES sequence.
    const focus = FOCUSES[w % FOCUSES.length];

    // Milestone: every 3rd week (weeks 3, 6, 9, ...) up to the milestones list.
    const isMilestoneWeek = (w + 1) % 3 === 0 && milestoneIdx < MILESTONES.length;
    let milestone: { en: string; ar: string } | undefined;
    if (isMilestoneWeek) {
      milestone = MILESTONES[milestoneIdx];
      milestoneIdx += 1;
    } else if (w === timelineWeeks - 1 && milestoneIdx < MILESTONES.length) {
      // Always end on a milestone if one is left.
      milestone = MILESTONES[MILESTONES.length - 1];
    }

    weeks.push({
      week: w + 1,
      focus: focus.en,
      focusAr: focus.ar,
      hours,
      courseIds: weekBuckets[w].map((c) => c.id),
      milestone: milestone?.en,
      milestoneAr: milestone?.ar,
    });
  }

  // ---- 4. Compute totals ----
  const totalHours = weeks.reduce((sum, wk) => sum + wk.hours, 0);
  const uniqueCourseIds = Array.from(
    new Set(weeks.flatMap((wk) => wk.courseIds)),
  );

  // ---- 5. Confidence: 80–96, scaled by course pool size + level headroom ----
  const base = 80 + Math.min(courseCount * 2, 14); // 80..94
  const levelBonus = level === "beginner" ? 2 : level === "intermediate" ? 1 : 0;
  const confidence = Math.min(96, base + levelBonus);

  return {
    goal,
    weeks,
    totalHours,
    totalCourses: uniqueCourseIds.length,
    courseIds: uniqueCourseIds,
    tips: TIPS.map((t) => t.en),
    tipsAr: TIPS.map((t) => t.ar),
    confidence,
  };
}

// ---------------- Screen ----------------

export function AiPlannerScreen() {
  const { t, locale, isRTL } = useI18n();
  const user = useAppStore((s) => s.user);
  const onboardingAnswers = useAppStore((s) => s.onboardingAnswers);
  const navigate = useAppStore((s) => s.navigate);
  const pushToast = useAppStore((s) => s.pushToast);
  const fireConfetti = useAppStore((s) => s.fireConfetti);
  const savePlan = useAppStore((s) => s.savePlan);

  // ---- Prefill from onboarding ----
  // If `onboardingAnswers.roleId` exists, default roleId to it and prefill
  // the goal text with "Become a {role label}".
  const initialRole = onboardingAnswers.roleId;
  const initialGoal = (() => {
    if (initialRole) {
      const r = getRole(initialRole);
      if (r) {
        return locale === "ar"
          ? `أصبح ${r.labelAr}`
          : `Become a ${r.label}`;
      }
    }
    return "";
  })();

  // ---- Form state (local) ----
  const [goal, setGoal] = useState<string>(initialGoal);
  const [roleId, setRoleId] = useState<string | undefined>(initialRole);
  const [weeklyHours, setWeeklyHours] = useState<number>(5);
  const [timelineWeeks, setTimelineWeeks] = useState<number>(12);
  const [level, setLevel] = useState<Level>("beginner");

  // ---- Plan state ----
  const [plan, setPlan] = useState<GeneratedPlan | null>(null);
  const [generating, setGenerating] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  // ---- Timer cleanup on unmount ----
  // We only fire setState from inside the setTimeout callback in the click
  // handler (never synchronously in an effect body). This ref + cleanup-only
  // effect ensures the timer is cleared if the user navigates away mid-build.
  const timerRef = useRef<number | null>(null);
  useEffect(
    () => () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    },
    [],
  );

  const canGenerate = goal.trim().length > 0 && !generating;

  const handleGenerate = () => {
    if (!goal.trim()) return;
    setGenerating(true);
    setPlan(null); // clear any previous plan so the skeleton shows
    setIsSaved(false);
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
    }
    timerRef.current = window.setTimeout(() => {
      const newPlan = generateMockPlan({
        goal: goal.trim(),
        roleId,
        weeklyHours,
        timelineWeeks,
        level,
      });
      setPlan(newPlan);
      setGenerating(false);
      timerRef.current = null;
      // Delight: confetti + success toast.
      fireConfetti();
      pushToast({
        title: t("aiPlanner.planSummary"),
        description: t("aiPlanner.planTitle", {
          weeks: timelineWeeks,
          goal: goal.trim(),
        }),
        variant: "success",
      });
    }, GENERATE_DELAY_MS);
  };

  const handleSave = () => {
    if (!plan) return;
    savePlan({
      title: locale === "ar" ? `خطة: ${plan.goal}` : `Plan: ${plan.goal}`,
      titleAr: `خطة: ${plan.goal}`,
      goal: plan.goal,
      timelineWeeks: plan.weeks.length,
      weeklyHours: Math.round(plan.totalHours / Math.max(1, plan.weeks.length)),
      totalHours: plan.totalHours,
      totalCourses: plan.totalCourses,
      weeks: plan.weeks,
      courseIds: plan.courseIds,
      tips: plan.tips,
      tipsAr: plan.tipsAr,
      confidence: plan.confidence,
      isAiGenerated: true,
      completedWeeks: [],
    });
    setIsSaved(true);
    fireConfetti();
    pushToast({
      title: t("aiPlanner.saved"),
      description: t("myPlan.viewInMyPlan"),
      variant: "success",
    });
  };

  const handlePickRole = (id: string) => {
    const r = getRole(id);
    if (!r) return;
    setRoleId(id);
    setGoal(
      locale === "ar" ? `أصبح ${r.labelAr}` : `Become a ${r.label}`,
    );
  };

  // Greeting name (best-effort — falls back to no name if logged out).
  const greetingName = user?.name;

  return (
    <div className="view-enter mx-auto w-full max-w-7xl px-4 sm:px-6 py-6 lg:py-10">
      {/* ---------------- Header ---------------- */}
      <header className="mb-6 lg:mb-8 space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full bg-accent text-accent-foreground px-3 py-1 text-xs font-medium">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          {t("nav.aiPlanner")}
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
          {t("aiPlanner.title")}
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
          {t("aiPlanner.subtitle")}
        </p>
        {greetingName && (
          <p className="text-xs text-muted-foreground">
            {t("nav.welcome")}, <span className="font-medium text-foreground">{greetingName}</span>
          </p>
        )}
      </header>

      {/* ---------------- 2-column layout: form (left) + plan (right) ---------------- */}
      <div className="lg:grid lg:grid-cols-[360px_minmax(0,1fr)] lg:gap-8 xl:gap-10">
        {/* ---------------- Form column (sticky on desktop) ---------------- */}
        <aside className="mb-8 lg:mb-0">
          <div className="lg:sticky lg:top-20">
            <PlannerForm
              goal={goal}
              onGoalChange={setGoal}
              roleId={roleId}
              onPickRole={handlePickRole}
              weeklyHours={weeklyHours}
              onWeeklyHoursChange={setWeeklyHours}
              timelineWeeks={timelineWeeks}
              onTimelineChange={setTimelineWeeks}
              level={level}
              onLevelChange={setLevel}
              generating={generating}
              canGenerate={canGenerate}
              onGenerate={handleGenerate}
            />
          </div>
        </aside>

        {/* ---------------- Plan column ---------------- */}
        <section aria-label={t("aiPlanner.planSummary")} className="min-w-0">
          {generating ? (
            <PlanSkeleton />
          ) : plan ? (
            <PlanDisplay
              plan={plan}
              isSaved={isSaved}
              onRegenerate={handleGenerate}
              onSave={handleSave}
              onGoToPlan={() => navigate("my-plan")}
              onOpenCourse={(courseId) => navigate("course-landing", { courseId })}
              onBackHome={() => navigate("home")}
            />
          ) : (
            <EmptyState
              icon={Wand2}
              title={t("aiPlanner.title")}
              description={t("aiPlanner.empty")}
              className="bg-card border border-border rounded-xl"
            />
          )}
        </section>
      </div>
    </div>
  );
}

// ---------------- Form ----------------

interface PlannerFormProps {
  goal: string;
  onGoalChange: (v: string) => void;
  roleId?: string;
  onPickRole: (id: string) => void;
  weeklyHours: number;
  onWeeklyHoursChange: (v: number) => void;
  timelineWeeks: number;
  onTimelineChange: (v: number) => void;
  level: Level;
  onLevelChange: (v: Level) => void;
  generating: boolean;
  canGenerate: boolean;
  onGenerate: () => void;
}

function PlannerForm({
  goal,
  onGoalChange,
  roleId,
  onPickRole,
  weeklyHours,
  onWeeklyHoursChange,
  timelineWeeks,
  onTimelineChange,
  level,
  onLevelChange,
  generating,
  canGenerate,
  onGenerate,
}: PlannerFormProps) {
  const { t, locale, formatNumber } = useI18n();

  const levelOptions: { id: Level; labelKey: string }[] = [
    { id: "beginner", labelKey: "aiPlanner.level.beginner" },
    { id: "intermediate", labelKey: "aiPlanner.level.intermediate" },
    { id: "advanced", labelKey: "aiPlanner.level.advanced" },
  ];

  return (
    <Card className="gap-0 py-0">
      <CardHeader className="px-5 pt-5 pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Target className="h-4 w-4 text-primary" />
          {t("aiPlanner.goal")}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-5 px-5 pb-5">
        {/* Goal input */}
        <div className="space-y-1.5">
          <Input
            id="ai-planner-goal"
            type="text"
            value={goal}
            onChange={(e) => onGoalChange(e.target.value)}
            placeholder={t("aiPlanner.goalPlaceholder")}
            disabled={generating}
            aria-label={t("aiPlanner.goal")}
          />
        </div>

        {/* Role chips */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">
            {t("aiPlanner.role")}
          </Label>
          <div className="flex flex-wrap gap-1.5">
            {roles.map((r) => {
              const Icon = ROLE_ICONS[r.icon] ?? Briefcase;
              const isActive = roleId === r.id;
              const label = locale === "ar" ? r.labelAr : r.label;
              return (
                <button
                  key={r.id}
                  type="button"
                  aria-pressed={isActive}
                  disabled={generating}
                  onClick={() => onPickRole(r.id)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
                    isActive
                      ? "border-primary bg-primary text-primary-foreground shadow-sm"
                      : "border-border bg-card text-foreground hover:border-primary/40 hover:bg-accent/60",
                    generating && "opacity-60",
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <Separator />

        {/* Weekly hours slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">
              {t("aiPlanner.weeklyHours")}
            </Label>
            <Badge variant="secondary" className="tabular-nums">
              {t("aiPlanner.hrsWeek", { n: formatNumber(weeklyHours) })}
            </Badge>
          </div>
          <Slider
            min={2}
            max={20}
            step={1}
            value={[weeklyHours]}
            onValueChange={(vals) => onWeeklyHoursChange(vals[0] ?? weeklyHours)}
            disabled={generating}
            aria-label={t("aiPlanner.weeklyHours")}
          />
          <div className="flex items-center justify-between text-[10px] text-muted-foreground tabular-nums">
            <span>2h</span>
            <span>20h</span>
          </div>
        </div>

        {/* Timeline select */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground" htmlFor="ai-planner-timeline">
            {t("aiPlanner.timeline")}
          </Label>
          <Select
            value={String(timelineWeeks)}
            onValueChange={(v) => onTimelineChange(Number(v))}
            disabled={generating}
          >
            <SelectTrigger id="ai-planner-timeline" className="w-full">
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

        {/* Level cards */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">
            {t("aiPlanner.level")}
          </Label>
          <div className="grid grid-cols-3 gap-2">
            {levelOptions.map((opt) => {
              const isActive = level === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  aria-pressed={isActive}
                  disabled={generating}
                  onClick={() => onLevelChange(opt.id)}
                  className={cn(
                    "rounded-md border-2 px-2 py-2 text-xs font-semibold transition-all",
                    isActive
                      ? "border-primary bg-primary/5 text-primary ring-2 ring-primary/15"
                      : "border-border bg-card text-foreground hover:border-primary/40",
                    generating && "opacity-60",
                  )}
                >
                  {t(opt.labelKey)}
                </button>
              );
            })}
          </div>
        </div>

        <Separator />

        {/* Generate button */}
        <Button
          type="button"
          size="lg"
          className="w-full gap-2"
          onClick={onGenerate}
          disabled={!canGenerate}
          aria-busy={generating}
        >
          {generating ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              {t("aiPlanner.generating")}
            </>
          ) : (
            <>
              <Wand2 className="h-4 w-4" />
              {t("aiPlanner.generate")}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

// ---------------- Plan display ----------------

interface PlanDisplayProps {
  plan: GeneratedPlan;
  isSaved: boolean;
  onRegenerate: () => void;
  onSave: () => void;
  onGoToPlan: () => void;
  onOpenCourse: (courseId: string) => void;
  onBackHome: () => void;
}

function PlanDisplay({
  plan,
  isSaved,
  onRegenerate,
  onSave,
  onGoToPlan,
  onOpenCourse,
  onBackHome,
}: PlanDisplayProps) {
  const { t, locale, formatNumber } = useI18n();
  const isRTL = locale === "ar";

  // Resolve all courses in the plan once.
  const allCourses = useMemo(() => {
    return plan.courseIds
      .map((id) => getCourse(id))
      .filter((c): c is Course => Boolean(c));
  }, [plan.courseIds]);

  return (
    <div className="space-y-6">
      {/* ---------------- Plan header ---------------- */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1 min-w-0">
          <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            {t("aiPlanner.planTitle", {
              weeks: plan.weeks.length,
              goal: plan.goal,
            })}
          </h2>
          <p className="text-xs text-muted-foreground">
            {t("aiPlanner.confidenceNote", { n: formatNumber(SIMILAR_LEARNERS) })}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={onRegenerate}
            className="gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            {t("aiPlanner.regenerate")}
          </Button>
          {isSaved ? (
            <Button
              variant="default"
              size="sm"
              onClick={onGoToPlan}
              className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Check className="h-3.5 w-3.5" />
              {t("nav.myPlan")}
            </Button>
          ) : (
            <Button
              variant="default"
              size="sm"
              onClick={onSave}
              className="gap-1.5"
            >
              <Save className="h-3.5 w-3.5" />
              {t("aiPlanner.savePlan")}
            </Button>
          )}
        </div>
      </div>

      {/* ---------------- Plan summary card ---------------- */}
      <Card className="py-5">
        <CardHeader className="px-5 pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4 text-primary" />
            {t("aiPlanner.planSummary")}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 space-y-4">
          {/* 3 stats */}
          <div className="grid grid-cols-3 gap-3">
            <StatCell
              icon={CalendarClock}
              label={t("aiPlanner.totalWeeks", { n: plan.weeks.length })}
            />
            <StatCell
              icon={Clock}
              label={t("aiPlanner.totalHours", { n: plan.totalHours })}
            />
            <StatCell
              icon={Target}
              label={t("aiPlanner.totalCourses", { n: plan.totalCourses })}
            />
          </div>

          <Separator />

          {/* Confidence indicator */}
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <Trophy className="h-3.5 w-3.5 text-gold" />
                <span className="text-xs font-medium text-foreground">
                  {t("aiPlanner.confidence")}
                </span>
              </div>
              <Badge className="bg-success text-success-foreground tabular-nums">
                {formatNumber(plan.confidence)}%
              </Badge>
            </div>
            {/* Custom bar (grows from start edge in both LTR and RTL). */}
            <div
              className="h-2 w-full overflow-hidden rounded-full bg-muted"
              role="progressbar"
              aria-label={t("aiPlanner.confidence")}
              aria-valuenow={plan.confidence}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="h-full rounded-full bg-success transition-all"
                style={{ width: `${plan.confidence}%` }}
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              {t("aiPlanner.confidenceNote", { n: formatNumber(SIMILAR_LEARNERS) })}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ---------------- Week-by-week timeline ---------------- */}
      <section aria-label={t("aiPlanner.planSummary")} className="space-y-3">
        <h3 className="flex items-center gap-2 text-base font-semibold text-foreground">
          <CalendarClock className="h-4 w-4 text-primary" />
          {t("aiPlanner.planSummary")}
        </h3>
        <ol className="relative space-y-3">
          {/* Vertical timeline rail on the start side. */}
          <span
            aria-hidden
            className="absolute top-3 bottom-3 w-px bg-border start-2"
          />
          {plan.weeks.map((wk) => (
            <li key={wk.week} className="relative ps-7">
              {/* Timeline dot — centered on the rail. Translate flips with dir. */}
              <span
                aria-hidden
                className={cn(
                  "absolute top-4 z-10 flex h-4 w-4 items-center justify-center rounded-full ring-4 ring-background start-2",
                  isRTL ? "translate-x-1/2" : "-translate-x-1/2",
                  wk.milestone ? "bg-gold" : "bg-primary",
                )}
              >
                {wk.milestone && (
                  <Flag className="h-2 w-2 text-black" strokeWidth={3} />
                )}
              </span>
              <WeekCard
                week={wk}
                courses={allCourses}
                onOpenCourse={onOpenCourse}
              />
            </li>
          ))}
        </ol>
      </section>

      {/* ---------------- Coach tips ---------------- */}
      <Card className="py-5">
        <CardHeader className="px-5 pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Lightbulb className="h-4 w-4 text-gold" />
            {t("aiPlanner.tips")}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5">
          <ul className="space-y-2.5">
            {(locale === "ar" ? plan.tipsAr : plan.tips).map((tip, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm">
                <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold">
                  <Lightbulb className="h-3 w-3" />
                </span>
                <span className="text-foreground/90">{tip}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* ---------------- Back to home (subtle) ---------------- */}
      <div className="flex justify-center pt-2">
        <Button variant="ghost" size="sm" onClick={onBackHome} className="gap-1.5">
          {isRTL ? (
            <ArrowRight className="h-3.5 w-3.5" />
          ) : (
            <ArrowLeft className="h-3.5 w-3.5" />
          )}
          {t("nav.home")}
        </Button>
      </div>
    </div>
  );
}

// ---------------- Week card ----------------

interface WeekCardProps {
  week: PlanWeek;
  courses: Course[];
  onOpenCourse: (courseId: string) => void;
}

function WeekCard({ week, courses, onOpenCourse }: WeekCardProps) {
  const { t, locale, formatNumber } = useI18n();

  const weekCourses = week.courseIds
    .map((id) => courses.find((c) => c.id === id))
    .filter((c): c is Course => Boolean(c));

  const focus = locale === "ar" ? week.focusAr : week.focus;
  const milestone = locale === "ar" ? week.milestoneAr : week.milestone;

  return (
    <article className="rounded-lg border border-border bg-card p-4 shadow-sm">
      {/* Week header */}
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Badge className="bg-primary text-primary-foreground tabular-nums">
            {t("aiPlanner.week", { n: week.week })}
          </Badge>
          <span className="text-sm font-semibold text-foreground">{focus}</span>
        </div>
        <Badge variant="secondary" className="gap-1 tabular-nums">
          <Clock className="h-3 w-3" />
          {t("aiPlanner.hoursThisWeek", { n: formatNumber(week.hours) })}
        </Badge>
      </header>

      {/* Focus label */}
      <p className="mt-1.5 text-[11px] uppercase tracking-wide text-muted-foreground">
        {t("aiPlanner.focus")}
      </p>

      {/* Courses */}
      {weekCourses.length > 0 && (
        <div className="mt-3 space-y-2">
          <p className="text-xs font-medium text-muted-foreground">
            {t("aiPlanner.courses")}
          </p>
          <ul className="space-y-2">
            {weekCourses.map((c) => (
              <li key={c.id}>
                <CourseMiniCard
                  course={c}
                  onOpen={() => onOpenCourse(c.id)}
                />
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Milestone */}
      {milestone && (
        <div className="mt-3 flex items-start gap-2.5 rounded-md border border-gold/40 bg-gold/10 p-3">
          <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold text-black">
            <Trophy className="h-3.5 w-3.5" />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-gold">
              {t("aiPlanner.milestone")}
            </p>
            <p className="text-sm font-medium text-foreground">{milestone}</p>
          </div>
        </div>
      )}
    </article>
  );
}

// ---------------- Mini course card (in-plan) ----------------

interface CourseMiniCardProps {
  course: Course;
  onOpen: () => void;
}

function CourseMiniCard({ course, onOpen }: CourseMiniCardProps) {
  const { t, locale, formatNumber } = useI18n();
  const title = locale === "ar" ? course.titleAr : course.title;
  const category = locale === "ar" ? course.categoryAr : course.category;

  return (
    <button
      type="button"
      onClick={onOpen}
      className="group flex w-full items-start gap-3 rounded-md border border-border bg-background p-2 text-start transition-colors hover:border-primary/40 hover:bg-accent/40"
      aria-label={`${t("aiPlanner.viewCourse")}: ${title}`}
    >
      <div className="w-24 shrink-0">
        <CourseThumb course={course} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h4 className="line-clamp-2 text-xs font-semibold text-foreground group-hover:text-primary sm:text-sm">
            {title}
          </h4>
          <Badge
            variant="outline"
            className="shrink-0 gap-1 border-success/40 bg-success/10 text-success"
          >
            <Check className="h-2.5 w-2.5" />
            {t("aiPlanner.addToPlan")}
          </Badge>
        </div>
        <p className="mt-1 text-[10px] uppercase tracking-wide text-muted-foreground">
          {category} · {course.level}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1 tabular-nums">
            <Clock className="h-3 w-3" />
            {t("card.hours", { n: formatNumber(course.totalHours) })}
          </span>
          <span className="inline-flex items-center gap-1 tabular-nums">
            {t("card.lessons", { n: formatNumber(course.totalLessons) })}
          </span>
        </div>
      </div>
    </button>
  );
}

// ---------------- Stat cell ----------------

function StatCell({
  icon: Icon,
  label,
}: {
  icon: LucideIcon;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-md border border-border bg-background px-2 py-3 text-center">
      <Icon className="mb-1 h-4 w-4 text-primary" />
      <span className="text-xs font-semibold text-foreground">{label}</span>
    </div>
  );
}

// ---------------- Plan skeleton (during generation) ----------------

function PlanSkeleton() {
  const { t } = useI18n();
  return (
    <div className="space-y-6">
      {/* Header shimmer */}
      <div className="space-y-2">
        <Skeleton className="h-7 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>

      {/* Summary card shimmer */}
      <Card className="py-5">
        <CardContent className="px-5 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-md" />
            ))}
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
          <Skeleton className="h-3 w-2/3" />
        </CardContent>
      </Card>

      {/* Week cards shimmer */}
      <div className="space-y-3 ps-6">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 w-full rounded-lg" />
        ))}
      </div>

      {/* Typing dots label */}
      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <span className="typing-dot h-2 w-2 rounded-full bg-primary/60" />
        <span className="typing-dot h-2 w-2 rounded-full bg-primary/60" />
        <span className="typing-dot h-2 w-2 rounded-full bg-primary/60" />
        <span className="ms-1">{t("aiPlanner.generating")}</span>
      </div>
    </div>
  );
}
