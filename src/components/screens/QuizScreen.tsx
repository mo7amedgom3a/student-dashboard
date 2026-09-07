"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  Check,
  CheckCircle2,
  ClipboardList,
  ListChecks,
  RotateCcw,
  Sparkles,
  XCircle,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { useI18n } from "@/hooks/use-i18n";
import { getQuizForCourse } from "@/lib/mock-data";
import type { Locale, Quiz, QuizQuestion } from "@/lib/types";
import { StepProgressBar } from "@/components/shared/StepProgressBar";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

// ---------- Inline bilingual strings ----------
// Kept inline because `src/lib/i18n.ts` is a protected foundation file we may
// not edit. The strings are intentionally dialect-neutral so they read
// naturally in both Saudi and Egyptian tones.

const STR = {
  certEarned: {
    en: "You earned a certificate!",
    ar: "حصلت على شهادة!",
  },
  failHint: {
    en: "Review the explanations below and give it another shot.",
    ar: "راجع الشرح بالأسفل وحاول مرة تانية.",
  },
  hideReview: { en: "Hide review", ar: "إخفاء المراجعة" },
  yourAnswer: { en: "Your answer", ar: "إجابتك" },
  correctAnswer: { en: "Correct answer", ar: "الإجابة الصحيحة" },
  noQuizDesc: {
    en: "This course doesn't have a quiz yet. Check back later.",
    ar: "لا يوجد اختبار لهذا الكورس حالياً. تابع لاحقاً.",
  },
  passingLabel: { en: "Passing score", ar: "درجة النجاح" },
  loading: { en: "Loading quiz…", ar: "جاري تحميل الاختبار…" },
} as const;

/** Pick a locale-aware value from a small bilingual map. */
function pick<T>(locale: Locale, map: { en: T; ar: T }): T {
  return locale === "ar" ? map.ar : map.en;
}

/** Compose a "{n} of {total} correct" line in the active locale. */
function ofTotalLine(n: number, total: number, locale: Locale): string {
  return locale === "ar"
    ? `${n} من ${total} صحيحة`
    : `${n} of ${total} correct`;
}

/** Pull the locale-aware question fields from a QuizQuestion. */
function localizeQuestion(q: QuizQuestion, locale: Locale) {
  return {
    text: locale === "ar" ? (q.questionAr ?? q.question) : q.question,
    options:
      locale === "ar" ? (q.optionsAr ?? q.options) : q.options,
    explanation:
      locale === "ar" ? (q.explanationAr ?? q.explanation) : q.explanation,
  };
}

function localizeQuizTitle(q: Quiz, locale: Locale): string {
  return locale === "ar" ? (q.titleAr ?? q.title) : q.title;
}

// ---------------- QuizScreen ----------------

export interface QuizScreenProps {
  courseId?: string;
}

export function QuizScreen({ courseId: propCourseId }: QuizScreenProps = {}) {
  const { t, locale } = useI18n();
  const route = useAppStore((s) => s.route);
  const courseId = propCourseId ?? route.params?.courseId ?? "";
  const quizState = useAppStore((s) => s.quizState);
  const startQuiz = useAppStore((s) => s.startQuiz);
  const navigate = useAppStore((s) => s.navigate);

  const quiz = getQuizForCourse(courseId);

  // Auto-start (or restart) the quiz attempt on mount when needed.
  // `startQuiz` is a Zustand store action — not a React `setState` — so calling
  // it inside the effect body does not trip the `react-hooks/set-state-in-effect`
  // rule. Guarded against infinite loops: only fires when the IDs mismatch.
  useEffect(() => {
    if (!quiz) return;
    if (!quizState || quizState.quizId !== quiz.id) {
      startQuiz(quiz.id, courseId);
    }
  }, [quiz, quizState?.quizId, courseId, startQuiz]);

  // No quiz for this course → empty state + back-to-course CTA.
  if (!quiz) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-accent/30 via-background to-background">
        <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
          <BackToCourseButton courseId={courseId} variant="ghost" />
          <div className="mt-6">
            <EmptyState
              icon={ClipboardList}
              title={t("quiz.title")}
              description={pick(locale, STR.noQuizDesc)}
              action={
                <Button onClick={() => navigate("course-player", { courseId })}>
                  {t("quiz.backToCourse")}
                </Button>
              }
            />
          </div>
        </div>
      </main>
    );
  }

  // Brief placeholder while `startQuiz()` resolves (one frame). Also handles
  // the edge case where quizState is set for a *different* quiz — the effect
  // above will fire startQuiz() on the next commit, so we just wait.
  if (!quizState || quizState.quizId !== quiz.id) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-accent/30 via-background to-background">
        <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
          <BackToCourseButton courseId={courseId} variant="ghost" />
          <div className="mt-8 space-y-4" aria-busy="true" aria-live="polite">
            <span className="sr-only">{pick(locale, STR.loading)}</span>
            <div className="h-8 w-48 animate-pulse rounded-md bg-muted" />
            <div className="h-2 w-full animate-pulse rounded-full bg-muted" />
            <div className="h-64 w-full animate-pulse rounded-xl bg-muted" />
          </div>
        </div>
      </main>
    );
  }

  const title = localizeQuizTitle(quiz, locale);

  return (
    <main className="min-h-screen bg-gradient-to-b from-accent/30 via-background to-background">
      <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-10">
        <BackToCourseButton courseId={courseId} variant="ghost" />

        {/* Quiz header: badge + passing score + title */}
        <header className="mt-6 mb-6">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Badge variant="secondary" className="gap-1">
              <ClipboardList className="size-3" />
              {t("quiz.title")}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {pick(locale, STR.passingLabel)}: {quiz.passingScore}%
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {title}
          </h1>
        </header>

        {!quizState.submitted ? (
          <AnsweringView quiz={quiz} />
        ) : (
          <ResultsView quiz={quiz} courseId={courseId} />
        )}
      </div>
    </main>
  );
}

// ---------------- Shared bits ----------------

function BackToCourseButton({
  courseId,
  variant = "ghost",
}: {
  courseId: string;
  variant?: "ghost" | "outline";
}) {
  const { t, isRTL } = useI18n();
  const navigate = useAppStore((s) => s.navigate);
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;
  return (
    <Button
      variant={variant}
      size="sm"
      className="text-muted-foreground hover:text-foreground"
      onClick={() => navigate("course-player", { courseId })}
    >
      <BackIcon className="size-4" />
      {t("quiz.backToCourse")}
    </Button>
  );
}

// ---------------- Answering phase ----------------

function AnsweringView({ quiz }: { quiz: Quiz }) {
  const { t, locale, isRTL } = useI18n();
  const quizState = useAppStore((s) => s.quizState)!;
  const answerQuizQuestion = useAppStore((s) => s.answerQuizQuestion);
  const nextQuizQuestion = useAppStore((s) => s.nextQuizQuestion);
  const prevQuizQuestion = useAppStore((s) => s.prevQuizQuestion);
  const submitQuiz = useAppStore((s) => s.submitQuiz);

  const total = quiz.questions.length;
  const current = quizState.current;
  const question = quiz.questions[current];
  const localized = localizeQuestion(question, locale);
  const selectedIndex = quizState.answers[question.id];
  const answered = selectedIndex !== undefined;
  const isLast = current === total - 1;

  // correctCount recomputed live as the user answers; passed to submitQuiz on
  // the final click.
  const correctCount = useMemo(
    () =>
      quiz.questions.filter(
        (q) => quizState.answers[q.id] === q.correctIndex,
      ).length,
    [quiz.questions, quizState.answers],
  );

  const handleSubmit = () => {
    submitQuiz(total, correctCount, quiz.passingScore);
  };

  const NextIcon = isRTL ? ArrowLeft : ArrowRight;
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  const questionCounter = t("quiz.question", {
    current: current + 1,
    total,
  });

  return (
    <section aria-label={questionCounter}>
      <StepProgressBar current={current} total={total} className="mb-5" />
      <p className="text-sm font-medium text-muted-foreground mb-4 tabular-nums">
        {questionCounter}
      </p>

      {/* `key={current}` remounts the question card on each navigation so the
          `.slide-enter` animation replays between questions. */}
      <div key={current} className="slide-enter">
        <Card className="overflow-hidden" aria-label={questionCounter}>
          <CardHeader>
            <CardTitle className="text-lg font-semibold leading-relaxed sm:text-xl">
              {localized.text}
            </CardTitle>
            <CardDescription className="sr-only">
              {questionCounter}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={selectedIndex !== undefined ? String(selectedIndex) : ""}
              onValueChange={(val) =>
                answerQuizQuestion(question.id, Number(val))
              }
              className="gap-3"
              aria-label={localized.text}
            >
              {localized.options.map((option, idx) => {
                const optionId = `${question.id}-opt-${idx}`;
                const selected = selectedIndex === idx;
                return (
                  <Label
                    key={optionId}
                    htmlFor={optionId}
                    className={cn(
                      "flex cursor-pointer items-start gap-3 rounded-md border p-4 transition-all",
                      "hover:border-primary/40 hover:bg-accent/40",
                      selected
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                        : "border-input bg-card",
                    )}
                  >
                    <RadioGroupItem
                      value={String(idx)}
                      id={optionId}
                      className="mt-0.5"
                    />
                    <span className="text-sm leading-relaxed sm:text-base">
                      {option}
                    </span>
                    {selected && (
                      <Check className="ms-auto size-4 shrink-0 text-primary" />
                    )}
                  </Label>
                );
              })}
            </RadioGroup>
          </CardContent>
          <Separator />
          <CardFooter className="flex items-center justify-between gap-3 pt-6">
            <Button
              variant="outline"
              onClick={prevQuizQuestion}
              disabled={current === 0}
            >
              <BackIcon className="size-4" />
              {t("onboarding.back")}
            </Button>

            {isLast ? (
              <Button onClick={handleSubmit} disabled={!answered}>
                <Check className="size-4" />
                {t("quiz.submit")}
              </Button>
            ) : (
              <Button onClick={nextQuizQuestion} disabled={!answered}>
                {t("quiz.next")}
                <NextIcon className="size-4" />
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </section>
  );
}

// ---------------- Results phase ----------------

function ResultsView({
  quiz,
  courseId,
}: {
  quiz: Quiz;
  courseId: string;
}) {
  const { t, locale } = useI18n();
  const quizState = useAppStore((s) => s.quizState)!;
  const resetQuiz = useAppStore((s) => s.resetQuiz);
  const navigate = useAppStore((s) => s.navigate);

  // Toggled by the "Review answers" button — set in an event handler, never
  // in an effect body, so no `react-hooks/set-state-in-effect` concern.
  const [showReview, setShowReview] = useState(false);

  const score = quizState.score;
  const passed = score >= quiz.passingScore;
  const total = quiz.questions.length;
  const correctCount = quiz.questions.filter(
    (q) => quizState.answers[q.id] === q.correctIndex,
  ).length;

  return (
    <section aria-label={t("quiz.title")} className="space-y-6">
      {/* `role="status"` announces the result to screen readers when it appears. */}
      <div role="status" aria-live="polite" className="slide-enter">
        <Card
          className={cn(
            "overflow-hidden border-2",
            passed ? "border-success/30" : "border-destructive/30",
          )}
        >
          <CardHeader className="items-center text-center">
            <div
              className={cn(
                "mx-auto mb-3 flex size-16 items-center justify-center rounded-full",
                passed
                  ? "bg-success/15 text-success"
                  : "bg-destructive/15 text-destructive",
              )}
            >
              {passed ? (
                <CheckCircle2 className="size-8" />
              ) : (
                <XCircle className="size-8" />
              )}
            </div>
            <CardTitle className="text-2xl font-bold sm:text-3xl">
              {passed ? t("quiz.passed") : t("quiz.failed")}
            </CardTitle>
            {passed && (
              <Badge className="mx-auto mt-1 gap-1 bg-gold text-black hover:bg-gold">
                <Sparkles className="size-3" />
                {t("quiz.confetti")}
              </Badge>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Score block */}
            <div className="rounded-md bg-muted/50 p-5 text-center">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {t("quiz.score")}
              </p>
              <p
                className={cn(
                  "mt-1 text-5xl font-bold tabular-nums sm:text-6xl",
                  passed ? "text-success" : "text-destructive",
                )}
              >
                {score}%
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {ofTotalLine(correctCount, total, locale)}
                <span className="mx-1.5" aria-hidden="true">
                  ·
                </span>
                {pick(locale, STR.passingLabel)}: {quiz.passingScore}%
              </p>
              <Progress
                value={score}
                className={cn(
                  "mt-4 h-2",
                  passed ? "bg-success/20" : "bg-destructive/20",
                )}
              />
            </div>

            {passed ? (
              <div className="flex items-center gap-3 rounded-md border border-success/20 bg-success/5 p-4">
                <Award className="size-6 shrink-0 text-success" />
                <p className="text-sm font-medium text-foreground">
                  {pick(locale, STR.certEarned)}
                </p>
              </div>
            ) : (
              <p className="text-center text-sm text-muted-foreground">
                {pick(locale, STR.failHint)}
              </p>
            )}
          </CardContent>
          <Separator />
          <CardFooter className="flex flex-col gap-2 pt-6 sm:flex-row sm:justify-center">
            {passed ? (
              <Button
                size="lg"
                onClick={() => navigate("course-player", { courseId })}
              >
                {t("quiz.backToCourse")}
              </Button>
            ) : (
              <>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => setShowReview((v) => !v)}
                  aria-expanded={showReview}
                >
                  <ListChecks className="size-4" />
                  {showReview
                    ? pick(locale, STR.hideReview)
                    : t("quiz.review")}
                </Button>
                <Button
                  size="lg"
                  onClick={() => {
                    setShowReview(false);
                    resetQuiz();
                  }}
                >
                  <RotateCcw className="size-4" />
                  {t("quiz.retry")}
                </Button>
              </>
            )}
          </CardFooter>
        </Card>
      </div>

      {!passed && showReview && <ReviewList quiz={quiz} className="slide-enter" />}
    </section>
  );
}

// ---------------- Review list (failed → toggle) ----------------

function ReviewList({
  quiz,
  className,
}: {
  quiz: Quiz;
  className?: string;
}) {
  const { t, locale } = useI18n();
  const quizState = useAppStore((s) => s.quizState)!;

  return (
    <div className={cn("space-y-4", className)}>
      <h2 className="text-lg font-semibold text-foreground">
        {t("quiz.review")}
      </h2>
      {quiz.questions.map((q, i) => {
        const localized = localizeQuestion(q, locale);
        const userPick = quizState.answers[q.id];
        const isCorrect = userPick === q.correctIndex;
        const userText =
          userPick !== undefined ? localized.options[userPick] : "—";

        return (
          <Card key={q.id} className="overflow-hidden">
            <CardHeader>
              <div className="flex items-start gap-3">
                <span
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                    isCorrect
                      ? "bg-success/15 text-success"
                      : "bg-destructive/15 text-destructive",
                  )}
                  aria-hidden="true"
                >
                  {i + 1}
                </span>
                <CardTitle className="text-base font-semibold leading-relaxed">
                  {localized.text}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Your answer */}
              <div
                className={cn(
                  "rounded-md border p-3",
                  isCorrect
                    ? "border-success/30 bg-success/5"
                    : "border-destructive/30 bg-destructive/5",
                )}
              >
                <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {isCorrect ? (
                    <Check className="size-3.5 text-success" />
                  ) : (
                    <XCircle className="size-3.5 text-destructive" />
                  )}
                  {pick(locale, STR.yourAnswer)}
                </p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {userText}
                </p>
              </div>

              {/* Correct answer (only shown when user got it wrong) */}
              {!isCorrect && (
                <div className="rounded-md border border-success/30 bg-success/5 p-3">
                  <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    <Check className="size-3.5 text-success" />
                    {pick(locale, STR.correctAnswer)}
                  </p>
                  <p className="mt-1 text-sm font-medium text-foreground">
                    {localized.options[q.correctIndex]}
                  </p>
                </div>
              )}

              {/* Explanation */}
              <div className="rounded-md bg-muted/40 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {t("quiz.explanation")}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-foreground">
                  {localized.explanation}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
