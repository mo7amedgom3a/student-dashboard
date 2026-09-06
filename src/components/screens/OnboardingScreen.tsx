"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  BrainCircuit,
  Briefcase,
  Check,
  CheckCircle2,
  Code2,
  GraduationCap,
  Layers,
  Megaphone,
  PenTool,
  PieChart,
  Rocket,
  Search,
  Sparkles,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { useI18n } from "@/hooks/use-i18n";
import {
  roles,
  getRole,
  getSkill,
  getCourse,
  courses as allCourses,
} from "@/lib/mock-data";
import { StepProgressBar } from "@/components/shared/StepProgressBar";
import { CourseCard } from "@/components/shared/CourseCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// ----- Static lookups -----

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

interface EduLevel {
  id: string;
  labelEn: string;
  labelAr: string;
  descEn: string;
  descAr: string;
  icon: LucideIcon;
}

/**
 * Education level options for step 3. Labels are inline (bilingual) because
 * `src/lib/i18n.ts` is a protected foundation file we are not allowed to edit.
 */
const EDUCATION_LEVELS: EduLevel[] = [
  {
    id: "highschool",
    labelEn: "High school",
    labelAr: "ثانوية عامة",
    descEn: "Secondary school graduate",
    descAr: "خريج ثانوية",
    icon: GraduationCap,
  },
  {
    id: "associate",
    labelEn: "Associate degree",
    labelAr: "دبلوم",
    descEn: "2-year diploma",
    descAr: "دبلوم سنتين",
    icon: GraduationCap,
  },
  {
    id: "bachelors",
    labelEn: "Bachelor's",
    labelAr: "بكالوريوس",
    descEn: "4-year university degree",
    descAr: "شهادة جامعية 4 سنوات",
    icon: GraduationCap,
  },
  {
    id: "masters",
    labelEn: "Master's",
    labelAr: "ماجستير",
    descEn: "Postgraduate degree",
    descAr: "درجة عليا",
    icon: GraduationCap,
  },
  {
    id: "phd",
    labelEn: "PhD",
    labelAr: "دكتوراه",
    descEn: "Doctoral degree",
    descAr: "درجة الدكتوراه",
    icon: GraduationCap,
  },
  {
    id: "selftaught",
    labelEn: "Self-taught",
    labelAr: "متعلّم ذاتياً",
    descEn: "No formal degree",
    descAr: "بدون شهادة رسمية",
    icon: Sparkles,
  },
];

const PLAN_LOADING_MS = 1200;
const TOTAL_STEPS = 5;

// ---------------- OnboardingScreen ----------------

export function OnboardingScreen() {
  const { t, locale, isRTL } = useI18n();
  const step = useAppStore((s) => s.onboardingStep);
  const answers = useAppStore((s) => s.onboardingAnswers);
  const setOnboardingAnswers = useAppStore((s) => s.setOnboardingAnswers);
  const nextOnboardingStep = useAppStore((s) => s.nextOnboardingStep);
  const prevOnboardingStep = useAppStore((s) => s.prevOnboardingStep);
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);
  const user = useAppStore((s) => s.user);

  // Shortened labels for the progress bar — locale-aware (kept inline since
  // i18n.ts is a protected foundation file).
  const stepLabels = useMemo(
    () =>
      locale === "ar"
        ? ["الهدف", "الدور", "المهارات", "التعليم", "الخطة"]
        : ["Goal", "Role", "Skills", "Education", "Plan"],
    [locale],
  );

  // Completion-step loading shimmer state.
  // IMPORTANT: setState is only called inside a setTimeout callback in the
  // effect below (never synchronously in the effect body) so we satisfy the
  // `react-hooks/set-state-in-effect` lint rule.
  const [planReady, setPlanReady] = useState(false);
  // Inline validation hint for the skills step ("select at least one").
  const [showSkillHint, setShowSkillHint] = useState(false);

  // Move into the completion step — reset shimmer state first (in the click
  // handler, not in an effect) so the build-plan animation replays each time.
  const goToCompletion = () => {
    setPlanReady(false);
    setShowSkillHint(false);
    nextOnboardingStep();
  };

  // Fire confetti + kick off the build-plan shimmer when entering step 4.
  useEffect(() => {
    if (step !== 4) return;
    // Fire confetti burst on entering the completion step.
    useAppStore.getState().fireConfetti();
    // setState lives inside the timeout callback — never called synchronously.
    const timer = window.setTimeout(() => setPlanReady(true), PLAN_LOADING_MS);
    return () => window.clearTimeout(timer);
  }, [step]);

  // ----- Step validation -----
  const canProceed = useMemo(() => {
    if (step === 0) return Boolean(answers.intent);
    if (step === 1) return Boolean(answers.roleId);
    // Step 2 (skills): button stays clickable so we can show the inline hint
    // if the user tries to advance with 0 selected.
    if (step === 2) return true;
    if (step === 3) return Boolean(answers.educationLevel);
    return true;
  }, [step, answers]);

  const handleNext = () => {
    if (step === 2 && (answers.skillIds?.length ?? 0) === 0) {
      setShowSkillHint(true);
      return;
    }
    setShowSkillHint(false);
    if (step === 3) {
      goToCompletion();
    } else {
      nextOnboardingStep();
    }
  };

  const handleBack = () => {
    setShowSkillHint(false);
    prevOnboardingStep();
  };

  const isCompletion = step === 4;
  const isLastInput = step === 3; // Education → "Build my plan"

  // RTL-aware navigation icons: in Arabic, "forward" visually points left.
  const NextIcon = isRTL ? ArrowLeft : ArrowRight;
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  return (
    <main className="min-h-screen bg-gradient-to-b from-accent/40 via-background to-background">
      <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
        {/* Header */}
        <header className="mb-8 flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {t("onboarding.title")}
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
              {t("onboarding.subtitle")}
            </p>
            {user?.name && (
              <p className="text-xs text-muted-foreground">
                {t("nav.welcome")},{" "}
                <span className="font-medium text-foreground">{user.name}</span>
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground hover:text-foreground"
            onClick={() => completeOnboarding()}
          >
            {t("onboarding.saveExit")}
          </Button>
        </header>

        {/* Progress bar */}
        <StepProgressBar
          current={step}
          total={TOTAL_STEPS}
          labels={stepLabels}
          className="mb-8"
        />

        {/* Step content — keyed by step so each transition replays slide-enter */}
        <div key={step} className="slide-enter">
          {step === 0 && (
            <IntentStep
              selected={answers.intent}
              onSelect={(intent) => setOnboardingAnswers({ intent })}
            />
          )}
          {step === 1 && (
            <RoleStep
              selectedRoleId={answers.roleId}
              onSelect={(roleId) =>
                setOnboardingAnswers({ roleId, skillIds: [] })
              }
            />
          )}
          {step === 2 && (
            <SkillsStep
              roleId={answers.roleId}
              selectedIds={answers.skillIds ?? []}
              showHint={showSkillHint}
              onToggle={(id) => {
                const current = answers.skillIds ?? [];
                const next = current.includes(id)
                  ? current.filter((x) => x !== id)
                  : [...current, id];
                setOnboardingAnswers({ skillIds: next });
                setShowSkillHint(false);
              }}
            />
          )}
          {step === 3 && (
            <EducationStep
              selected={answers.educationLevel}
              onSelect={(educationLevel) =>
                setOnboardingAnswers({ educationLevel })
              }
            />
          )}
          {step === 4 && (
            <CompletionStep ready={planReady} roleId={answers.roleId} />
          )}
        </div>

        {/* Footer nav */}
        <footer className="mt-10 flex items-center justify-between gap-3">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={step === 0}
            className="gap-2"
          >
            <BackIcon className="h-4 w-4" />
            {t("onboarding.back")}
          </Button>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-muted-foreground tabular-nums sm:inline">
              {t("onboarding.step", { current: step + 1, total: TOTAL_STEPS })}
            </span>
            {isCompletion ? (
              <Button
                size="lg"
                onClick={() => completeOnboarding()}
                disabled={!planReady}
                className="gap-2"
              >
                <Rocket className="h-4 w-4" />
                {t("onboarding.s5.startLearning")}
              </Button>
            ) : isLastInput ? (
              <Button
                onClick={handleNext}
                disabled={!canProceed}
                className="gap-2"
              >
                <Sparkles className="h-4 w-4" />
                {t("onboarding.finish")}
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={!canProceed}
                className="gap-2"
              >
                {t("onboarding.next")}
                <NextIcon className="h-4 w-4" />
              </Button>
            )}
          </div>
        </footer>
      </div>
    </main>
  );
}

// ---------------- Sub-steps ----------------

function IntentStep({
  selected,
  onSelect,
}: {
  selected?: "improve" | "learn-new";
  onSelect: (intent: "improve" | "learn-new") => void;
}) {
  const { t } = useI18n();
  const cards: {
    id: "improve" | "learn-new";
    titleKey: string;
    descKey: string;
    icon: LucideIcon;
  }[] = [
    {
      id: "improve",
      titleKey: "onboarding.s1.improve",
      descKey: "onboarding.s1.improveDesc",
      icon: TrendingUp,
    },
    {
      id: "learn-new",
      titleKey: "onboarding.s1.learnNew",
      descKey: "onboarding.s1.learnNewDesc",
      icon: Rocket,
    },
  ];

  return (
    <section aria-label={t("onboarding.s1.title")} className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold text-foreground sm:text-2xl">
          {t("onboarding.s1.title")}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t("onboarding.s1.subtitle")}
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {cards.map((card) => {
          const Icon = card.icon;
          const isActive = selected === card.id;
          return (
            <button
              key={card.id}
              type="button"
              aria-pressed={isActive}
              onClick={() => onSelect(card.id)}
              className={cn(
                "group relative flex flex-col gap-3 rounded-md border-2 bg-card p-6 text-start transition-all hover:shadow-md",
                isActive
                  ? "border-primary ring-2 ring-primary/20 shadow-md"
                  : "border-border hover:border-primary/40",
              )}
            >
              <div
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-md transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "bg-accent text-accent-foreground",
                )}
              >
                <Icon className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-foreground sm:text-lg">
                  {t(card.titleKey)}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t(card.descKey)}
                </p>
              </div>
              {isActive && (
                <span className="absolute end-4 top-4 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Check className="h-4 w-4" />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function RoleStep({
  selectedRoleId,
  onSelect,
}: {
  selectedRoleId?: string;
  onSelect: (id: string) => void;
}) {
  const { t, locale, formatNumber } = useI18n();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return roles;
    return roles.filter((r) => {
      const en = r.label.toLowerCase();
      const ar = r.labelAr;
      return en.includes(q) || ar.includes(query.trim()) || ar.toLowerCase().includes(q);
    });
  }, [query, locale]);

  return (
    <section aria-label={t("onboarding.s2.title")} className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold text-foreground sm:text-2xl">
          {t("onboarding.s2.title")}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t("onboarding.s2.subtitle")}
        </p>
      </div>
      <div className="relative">
        <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("onboarding.s2.search")}
          className="ps-9"
          aria-label={t("onboarding.s2.search")}
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((role) => {
          const Icon = ROLE_ICONS[role.icon] ?? Briefcase;
          const isActive = selectedRoleId === role.id;
          const skillCount = role.skillIds.length;
          const label = locale === "ar" ? role.labelAr : role.label;
          const skillsWord =
            locale === "ar"
              ? skillCount === 1
                ? "مهارة"
                : "مهارات"
              : skillCount === 1
                ? "skill"
                : "skills";
          return (
            <button
              key={role.id}
              type="button"
              aria-pressed={isActive}
              onClick={() => onSelect(role.id)}
              className={cn(
                "group relative flex flex-col gap-3 rounded-md border-2 bg-card p-4 text-start transition-all hover:shadow-md",
                isActive
                  ? "border-primary ring-2 ring-primary/20 shadow-md"
                  : "border-border hover:border-primary/40",
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-md transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-accent text-accent-foreground",
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold leading-snug text-foreground sm:text-base">
                    {label}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {formatNumber(skillCount)} {skillsWord}
                  </p>
                </div>
              </div>
              {isActive && (
                <span className="absolute end-2 top-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Check className="h-3.5 w-3.5" />
                </span>
              )}
            </button>
          );
        })}
        {filtered.length === 0 && (
          <p className="col-span-full py-8 text-center text-sm text-muted-foreground">
            {locale === "ar" ? "ما في نتائج مطابقة" : "No roles match your search."}
          </p>
        )}
      </div>
    </section>
  );
}

function SkillsStep({
  roleId,
  selectedIds,
  showHint,
  onToggle,
}: {
  roleId?: string;
  selectedIds: string[];
  showHint: boolean;
  onToggle: (id: string) => void;
}) {
  const { t, locale } = useI18n();

  const role = roleId ? getRole(roleId) : undefined;
  const skillsForRole = useMemo(() => {
    if (!role) return [];
    return role.skillIds
      .map((id) => getSkill(id))
      .filter((s): s is NonNullable<typeof s> => Boolean(s));
  }, [role]);

  if (!role) {
    // Defensive: user landed here without picking a role. Prompt them to go back.
    return (
      <section aria-label={t("onboarding.s3.title")} className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground sm:text-2xl">
          {t("onboarding.s3.title")}
        </h2>
        <p className="text-sm text-muted-foreground">
          {locale === "ar"
            ? "اختر دوراً أولاً من الخطوة السابقة."
            : "Please pick a role in the previous step first."}
        </p>
      </section>
    );
  }

  return (
    <section aria-label={t("onboarding.s3.title")} className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold text-foreground sm:text-2xl">
          {t("onboarding.s3.title")}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t("onboarding.s3.subtitle")}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {skillsForRole.map((skill) => {
          const isActive = selectedIds.includes(skill.id);
          const label = locale === "ar" ? skill.labelAr : skill.label;
          return (
            <button
              key={skill.id}
              type="button"
              aria-pressed={isActive}
              onClick={() => onToggle(skill.id)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border-2 px-4 py-2 text-sm font-medium transition-all",
                isActive
                  ? "border-primary bg-primary text-primary-foreground shadow-sm"
                  : "border-border bg-card text-foreground hover:border-primary/40",
              )}
            >
              {isActive && <Check className="h-3.5 w-3.5" />}
              {label}
            </button>
          );
        })}
      </div>
      {showHint && selectedIds.length === 0 && (
        <p
          role="alert"
          className="text-sm font-medium text-destructive"
        >
          {t("onboarding.s3.none")}
        </p>
      )}
    </section>
  );
}

function EducationStep({
  selected,
  onSelect,
}: {
  selected?: string;
  onSelect: (id: string) => void;
}) {
  const { t, locale } = useI18n();

  return (
    <section aria-label={t("onboarding.s4.title")} className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold text-foreground sm:text-2xl">
          {t("onboarding.s4.title")}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t("onboarding.s4.subtitle")}
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {EDUCATION_LEVELS.map((edu) => {
          const Icon = edu.icon;
          const isActive = selected === edu.id;
          const label = locale === "ar" ? edu.labelAr : edu.labelEn;
          const desc = locale === "ar" ? edu.descAr : edu.descEn;
          return (
            <button
              key={edu.id}
              type="button"
              aria-pressed={isActive}
              onClick={() => onSelect(edu.id)}
              className={cn(
                "group relative flex flex-col gap-2 rounded-md border-2 bg-card p-4 text-start transition-all hover:shadow-md",
                isActive
                  ? "border-primary ring-2 ring-primary/20 shadow-md"
                  : "border-border hover:border-primary/40",
              )}
            >
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-accent text-accent-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-sm font-semibold text-foreground sm:text-base">
                  {label}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{desc}</p>
              {isActive && (
                <span className="absolute end-2 top-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Check className="h-3.5 w-3.5" />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function CompletionStep({
  ready,
  roleId,
}: {
  ready: boolean;
  roleId?: string;
}) {
  const { t, locale } = useI18n();

  const recommended = useMemo(() => {
    const role = roleId ? getRole(roleId) : undefined;
    const ids = role?.recommendedCourseIds ?? [];
    const list = ids
      .map((id) => getCourse(id))
      .filter((c): c is NonNullable<typeof c> => Boolean(c));
    if (list.length > 0) return list;
    // Fallback: top trending by enrolledCount.
    return [...allCourses]
      .sort((a, b) => b.enrolledCount - a.enrolledCount)
      .slice(0, 4);
  }, [roleId]);

  return (
    <section aria-label={t("onboarding.s5.title")} className="space-y-8">
      <div className="space-y-3 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/15 text-success">
          <CheckCircle2 className="h-9 w-9" />
        </div>
        <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
          {t("onboarding.s5.title")}
        </h2>
        <p className="mx-auto max-w-md text-sm text-muted-foreground">
          {ready
            ? t("onboarding.s5.confetti")
            : t("onboarding.s5.subtitle")}
        </p>
      </div>

      {!ready ? (
        <div className="mx-auto max-w-3xl space-y-4">
          <div className="flex items-center justify-center gap-1.5 py-2">
            <span className="typing-dot h-2 w-2 rounded-full bg-primary/60" />
            <span className="typing-dot h-2 w-2 rounded-full bg-primary/60" />
            <span className="typing-dot h-2 w-2 rounded-full bg-primary/60" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-lg border border-border bg-card p-3"
              >
                <Skeleton className="h-24 w-full rounded-md" />
                <Skeleton className="mt-3 h-4 w-3/4" />
                <Skeleton className="mt-2 h-3 w-1/2" />
                <Skeleton className="mt-2 h-3 w-2/3" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">
            {t("onboarding.s5.recommended")}
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {recommended.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
          {!roleId && (
            <p className="text-center text-xs text-muted-foreground">
              {locale === "ar"
                ? "نعرض لك الأكثر شيوعاً لأنك لم تختر دوراً."
                : "Showing trending courses because no role was selected."}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
