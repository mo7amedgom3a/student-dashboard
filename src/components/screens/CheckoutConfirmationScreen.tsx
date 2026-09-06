"use client";

import { useEffect, useMemo } from "react";
import {
  CheckCircle2,
  GraduationCap,
  Search,
  ArrowRight,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { useI18n } from "@/hooks/use-i18n";
import { getCourse } from "@/lib/mock-data";
import type { Course } from "@/lib/types";
import { CourseThumb } from "@/components/shared/CourseThumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export function CheckoutConfirmationScreen() {
  const { t, locale, isRTL, formatPrice } = useI18n();
  const route = useAppStore((s) => s.route);
  const navigate = useAppStore((s) => s.navigate);
  const enrolledCourseIds = useAppStore((s) => s.enrolledCourseIds);

  const orderId = route.params?.orderId ?? "—";
  const amount = route.params?.amount ?? "0";

  // Fire confetti once on mount. `fireConfetti()` is a Zustand action (not a
  // React setState), so calling it inside a useEffect is safe and does not
  // trip the react-hooks/set-state-in-effect rule.
  useEffect(() => {
    useAppStore.getState().fireConfetti();
  }, []);

  const enrolledCourses = useMemo<Course[]>(() => {
    const out: Course[] = [];
    for (const id of enrolledCourseIds) {
      const c = getCourse(id);
      if (c) out.push(c);
    }
    return out;
  }, [enrolledCourseIds]);

  // Show the most recent N enrolled courses (the freshly purchased ones are
  // at the tail of enrolledCourseIds). Cap at 6 so the confirmation card
  // stays tidy.
  const recentCourses = useMemo(
    () => enrolledCourses.slice(-6).reverse(),
    [enrolledCourses]
  );

  // Inline bilingual labels — kept here (not in i18n.ts) because that file is
  // a protected foundation asset.
  const nowInLearningLabel =
    locale === "ar" ? "كورساتك الآن في تعلّمي" : "Now in your learning";
  const browseMoreLabel =
    locale === "ar" ? "تصفّح كورسات أكتر" : "Browse more courses";
  const emptyLearningLabel =
    locale === "ar" ? "مفيش كورسات لسه" : "No courses yet";

  const ForwardIcon = isRTL ? ArrowLeft : ArrowRight;

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-8 sm:py-12">
      <Card className="overflow-hidden">
        <CardContent className="pt-8 sm:pt-10 pb-6 px-6 sm:px-10 flex flex-col items-center text-center">
          {/* Big success check */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-success/15 flex items-center justify-center mb-4">
            <CheckCircle2
              className="w-10 h-10 sm:w-12 sm:h-12 text-success"
              strokeWidth={2}
              aria-hidden
            />
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            {t("confirmation.title")}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1.5 max-w-md">
            {t("confirmation.subtitle")}
          </p>

          {/* Confetti banner */}
          <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold text-foreground">
            <Sparkles className="w-3.5 h-3.5 text-gold" aria-hidden />
            {t("confirmation.confetti")}
          </div>

          {/* Order details */}
          <div className="w-full mt-6 rounded-md border border-border bg-muted/30 p-4 flex flex-col gap-3 text-sm">
            <p className="font-mono font-semibold text-foreground text-center">
              {t("confirmation.orderId", { id: orderId })}
            </p>
            <Separator />
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">
                {t("confirmation.amount")}
              </span>
              <span className="font-bold text-foreground text-base">
                {formatPrice(Number(amount))}
              </span>
            </div>
          </div>

          {/* Now in your learning */}
          <div className="w-full mt-6">
            <h2 className="text-sm font-semibold text-foreground mb-3 text-start">
              {nowInLearningLabel}
            </h2>
            {recentCourses.length === 0 ? (
              <p className="text-sm text-muted-foreground text-start">
                {emptyLearningLabel}
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {recentCourses.map((course) => {
                  const title = locale === "ar" ? course.titleAr : course.title;
                  return (
                    <li key={course.id}>
                      <button
                        type="button"
                        onClick={() =>
                          navigate("course-landing", { courseId: course.id })
                        }
                        className="w-full flex items-center gap-3 text-start p-2 rounded-md hover:bg-muted/60 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        aria-label={title}
                      >
                        <div className="w-20 shrink-0 rounded-md overflow-hidden">
                          <CourseThumb course={course} />
                        </div>
                        <span className="flex-1 min-w-0 text-sm font-medium text-foreground line-clamp-2">
                          {title}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* CTAs */}
          <div className="w-full mt-8 flex flex-col sm:flex-row gap-2.5">
            <Button
              size="lg"
              className="flex-1"
              onClick={() => navigate("my-learning")}
            >
              <GraduationCap className="w-4 h-4 me-1.5" />
              {t("confirmation.cta")}
              <ForwardIcon className="w-4 h-4 ms-1.5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="flex-1"
              onClick={() => navigate("search")}
            >
              <Search className="w-4 h-4 me-1.5" />
              {browseMoreLabel}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
