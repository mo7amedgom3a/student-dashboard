"use client";

import { useEffect, useMemo, useState, type ComponentType, type ReactNode } from "react";
import { useAppStore } from "@/lib/store";
import { useI18n } from "@/hooks/use-i18n";
import {
  courses,
  demoHistoryCourseIds,
  getCourse,
  getInstructor,
  getRole,
} from "@/lib/mock-data";
import type { Course } from "@/lib/types";
import { CourseCard } from "@/components/shared/CourseCard";
import { CourseThumb } from "@/components/shared/CourseThumb";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowRight,
  ArrowLeft,
  PlayCircle,
  GraduationCap,
  Compass,
  Sparkles,
  Flame,
  type LucideProps,
} from "lucide-react";

/**
 * HomeScreen — Udemy-inspired discovery surface crossed with Coursera-style
 * goal orientation. Shows a personalized greeting, a "continue learning"
 * rail for in-progress courses, and three discovery carousels:
 *   1. What to learn next (same categories as enrolled courses)
 *   2. Recommended for you (from onboarding role)
 *   3. Trending now (top by enrollment count)
 *
 * All data is derived in-memory from the Zustand store + mock catalog.
 * Skeleton placeholders are shown for ~600ms on mount to simulate loading.
 */
export function HomeScreen() {
  const { t, isRTL } = useI18n();
  const user = useAppStore((s) => s.user);
  const navigate = useAppStore((s) => s.navigate);
  const enrolledCourseIds = useAppStore((s) => s.enrolledCourseIds);
  const onboardingAnswers = useAppStore((s) => s.onboardingAnswers);
  const getCourseProgress = useAppStore((s) => s.getCourseProgress);

  const [loading, setLoading] = useState(true);

  // Simulate a brief loading window for the skeleton placeholders.
  // setState is called inside the setTimeout callback (not synchronously
  // in the effect body) to satisfy the `react-hooks/set-state-in-effect` rule.
  useEffect(() => {
    const id = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(id);
  }, []);

  // --- Continue learning: enrolled courses (any progress) ---
  const enrolledCourses = useMemo(() => {
    return enrolledCourseIds
      .map((id) => getCourse(id))
      .filter((c): c is Course => Boolean(c));
  }, [enrolledCourseIds]);

  // Enrolled courses still in progress (< 100% complete)
  const inProgressCourses = useMemo(() => {
    return enrolledCourses.filter((c) => getCourseProgress(c.id) < 100);
  }, [enrolledCourses, getCourseProgress]);

  // --- What to learn next ---
  // Courses in the same categories as the user's enrolled courses (or demo
  // history), excluding already-enrolled. A couple are tagged bestseller for
  // display only (we spread a copy so the original mock data is untouched).
  const whatNextCourses = useMemo(() => {
    const enrolledSet = new Set(enrolledCourseIds);
    const seedIds = new Set<string>([...enrolledCourseIds, ...demoHistoryCourseIds]);
    const seedCourses = [...seedIds]
      .map((id) => getCourse(id))
      .filter((c): c is Course => Boolean(c));
    const cats = new Set(seedCourses.map((c) => c.category));
    let pool = courses.filter(
      (c) => !enrolledSet.has(c.id) && cats.has(c.category)
    );
    if (pool.length === 0) {
      pool = courses.filter((c) => !enrolledSet.has(c.id));
    }
    return pool.slice(0, 10).map((c, i) => (i < 2 ? { ...c, bestseller: true } : c));
  }, [enrolledCourseIds]);

  // --- Recommended for you (from onboarding role) ---
  const recommendedCourses = useMemo(() => {
    const enrolledSet = new Set(enrolledCourseIds);
    const roleId = onboardingAnswers.roleId;
    if (roleId) {
      const role = getRole(roleId);
      if (role) {
        const recs = role.recommendedCourseIds
          .map((id) => getCourse(id))
          .filter((c): c is Course => Boolean(c))
          .filter((c) => !enrolledSet.has(c.id));
        if (recs.length > 0) return recs;
      }
    }
    // Fallback: top-rated, non-enrolled
    return [...courses]
      .filter((c) => !enrolledSet.has(c.id))
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 8);
  }, [enrolledCourseIds, onboardingAnswers.roleId]);

  // --- Trending now (top by enrollment) ---
  const trendingCourses = useMemo(() => {
    return [...courses]
      .sort((a, b) => b.enrolledCount - a.enrolledCount)
      .slice(0, 8)
      .map((c, i) => (i < 3 ? { ...c, bestseller: true } : c));
  }, []);

  if (loading) {
    return <HomeSkeleton />;
  }

  let greetingContent: ReactNode;
  if (user) {
    const rawGreeting = t("home.greeting", { name: "%%NAME%%" });
    if (rawGreeting.includes("%%NAME%%")) {
      const [prefix, suffix] = rawGreeting.split("%%NAME%%");
      greetingContent = (
        <>
          {prefix}
          <span>{user.name}</span>
          <span
            className="inline-block animate-wave-hand ms-2 select-none"
            role="img"
            aria-label="waving hand"
          >
            👋
          </span>
          {suffix}
        </>
      );
    } else {
      greetingContent = (
        <>
          {t("home.greeting", { name: user.name })}
          <span
            className="inline-block animate-wave-hand ms-2 select-none"
            role="img"
            aria-label="waving hand"
          >
            👋
          </span>
        </>
      );
    }
  } else {
    greetingContent = t("brand.tagline");
  }

  const greetingSub = user ? t("home.greetingSub") : "";
  const ViewAllIcon = isRTL ? ArrowLeft : ArrowRight;

  return (
    <div className="view-enter max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-10">
      {/* Hero greeting */}
      <header className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          {greetingContent}
        </h1>
        {greetingSub && (
          <p className="text-sm sm:text-base text-muted-foreground">{greetingSub}</p>
        )}
      </header>

      {/* Continue learning — or welcoming CTA when user has zero enrollments */}
      {enrolledCourses.length === 0 ? (
        <section
          aria-labelledby="continue-heading"
          className="rounded-lg border border-border bg-gradient-to-br from-primary/5 to-transparent p-4 sm:p-6"
        >
          <h2 id="continue-heading" className="sr-only">
            {t("home.continue")}
          </h2>
          <EmptyState
            icon={GraduationCap}
            title={t("myLearning.empty.inProgress")}
            description={t("home.greetingSub")}
            action={
              <Button onClick={() => navigate("search")}>
                <PlayCircle className="w-4 h-4" />
                {t("confirmation.cta")}
              </Button>
            }
          />
        </section>
      ) : inProgressCourses.length === 0 ? (
        // All enrolled courses are completed — celebrate and route to My Learning
        <section
          aria-labelledby="continue-heading"
          className="rounded-lg border border-success/30 bg-success/5 p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        >
          <div>
            <h2 id="continue-heading" className="text-lg font-semibold text-foreground">
              {t("home.continue")}
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {t("myLearning.completed")}
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate("my-learning")}>
            {t("myLearning.title")}
          </Button>
        </section>
      ) : (
        <section aria-labelledby="continue-heading" className="space-y-3">
          <SectionHeader
            headingId="continue-heading"
            icon={PlayCircle}
            title={t("home.continue")}
            subtitle={t("home.greetingSub")}
            viewAllLabel={t("home.viewAll")}
            onViewAll={() => navigate("my-learning")}
            ViewAllIcon={ViewAllIcon}
          />
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
            {inProgressCourses.map((c) => (
              <ContinueLearningCard key={c.id} course={c} />
            ))}
          </div>
        </section>
      )}

      {/* What to learn next */}
      {whatNextCourses.length > 0 && (
        <CarouselSection
          headingId="whatnext-heading"
          icon={Compass}
          title={t("home.whatNext")}
          subtitle={t("home.whatNextSub")}
          viewAllLabel={t("home.viewAll")}
          onViewAll={() => navigate("search")}
          ViewAllIcon={ViewAllIcon}
        >
          {whatNextCourses.map((c) => (
            <div key={c.id} className="w-72 shrink-0">
              <CourseCard course={c} variant="default" showActions />
            </div>
          ))}
        </CarouselSection>
      )}

      {/* Recommended for you */}
      {recommendedCourses.length > 0 && (
        <CarouselSection
          headingId="recommended-heading"
          icon={Sparkles}
          title={t("home.recommended")}
          subtitle={t("home.recommendedSub")}
          viewAllLabel={t("home.viewAll")}
          onViewAll={() => navigate("search")}
          ViewAllIcon={ViewAllIcon}
        >
          {recommendedCourses.map((c) => (
            <div key={c.id} className="w-72 shrink-0">
              <CourseCard course={c} variant="default" showActions />
            </div>
          ))}
        </CarouselSection>
      )}

      {/* Trending now */}
      {trendingCourses.length > 0 && (
        <CarouselSection
          headingId="trending-heading"
          icon={Flame}
          title={t("home.trending")}
          subtitle={t("home.trendingSub")}
          viewAllLabel={t("home.viewAll")}
          onViewAll={() => navigate("search")}
          ViewAllIcon={ViewAllIcon}
        >
          {trendingCourses.map((c) => (
            <div key={c.id} className="w-72 shrink-0">
              <CourseCard course={c} variant="default" showActions />
            </div>
          ))}
        </CarouselSection>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------------
// Sub-components (kept in the same file to avoid bloating the shared folder)
// ----------------------------------------------------------------------------

interface SectionHeaderProps {
  headingId: string;
  icon: ComponentType<LucideProps>;
  title: string;
  subtitle?: string;
  viewAllLabel?: string;
  onViewAll?: () => void;
  ViewAllIcon?: ComponentType<LucideProps>;
}

function SectionHeader({
  headingId,
  icon: Icon,
  title,
  subtitle,
  viewAllLabel,
  onViewAll,
  ViewAllIcon,
}: SectionHeaderProps) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div className="flex items-start gap-3 min-w-0">
        <div className="mt-0.5 w-9 h-9 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <h2
            id={headingId}
            className="text-lg sm:text-xl font-bold text-foreground truncate"
          >
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs sm:text-sm text-muted-foreground truncate">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {viewAllLabel && onViewAll && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onViewAll}
          className="shrink-0 text-primary hover:text-primary"
        >
          {viewAllLabel}
          {ViewAllIcon && <ViewAllIcon className="w-4 h-4" />}
        </Button>
      )}
    </div>
  );
}

interface CarouselSectionProps extends SectionHeaderProps {
  children: React.ReactNode;
}

function CarouselSection(props: CarouselSectionProps) {
  const { children, ...header } = props;
  return (
    <section aria-labelledby={header.headingId} className="space-y-3">
      <SectionHeader {...header} />
      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">{children}</div>
    </section>
  );
}

/**
 * Wide card for an in-progress course: thumbnail, title, instructor,
 * a success-colored progress bar, "% complete" text, and a big Resume
 * button that opens the course player on the auto-resume lesson.
 */
function ContinueLearningCard({ course }: { course: Course }) {
  const { t, locale } = useI18n();
  const navigate = useAppStore((s) => s.navigate);
  const getCourseProgress = useAppStore((s) => s.getCourseProgress);

  const instructor = getInstructor(course.instructorId);
  const instructorName = instructor
    ? locale === "ar"
      ? instructor.nameAr ?? instructor.name
      : instructor.name
    : "";
  const title = locale === "ar" ? course.titleAr : course.title;
  const pct = getCourseProgress(course.id);
  const totalLessons = course.totalLessons;

  return (
    <div className="w-80 sm:w-96 shrink-0 bg-card border border-border rounded-lg overflow-hidden flex flex-col hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
      <button
        type="button"
        onClick={() => navigate("course-landing", { courseId: course.id })}
        className="relative text-start block"
        aria-label={title}
      >
        <CourseThumb course={course} showPlay />
      </button>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-foreground line-clamp-2 leading-snug">
          {title}
        </h3>
        <p className="text-xs text-muted-foreground mt-1">{instructorName}</p>

        <div className="mt-3">
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-success rounded-full transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-1.5 text-xs">
            <span className="font-semibold text-success">
              {t("myLearning.progress", { n: pct })}
            </span>
            <span className="text-muted-foreground">
              {t("card.lessons", { n: totalLessons })}
            </span>
          </div>
        </div>

        <Button
          className="mt-3 w-full"
          onClick={() => navigate("course-player", { courseId: course.id })}
        >
          <PlayCircle className="w-4 h-4" />
          {t("myLearning.resume")}
        </Button>
      </div>
    </div>
  );
}

/** Skeleton placeholder shown during the simulated loading window. */
function HomeSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-10">
      {/* Hero */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-72" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>

      {/* Continue learning row */}
      <div className="space-y-3">
        <Skeleton className="h-6 w-48" />
        <div className="flex gap-4 overflow-hidden">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="w-80 sm:w-96 shrink-0 h-56 rounded-lg" />
          ))}
        </div>
      </div>

      {/* Three discovery carousels */}
      {[0, 1, 2].map((sec) => (
        <div key={sec} className="space-y-3">
          <Skeleton className="h-6 w-48" />
          <div className="flex gap-4 overflow-hidden">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="w-72 shrink-0 h-80 rounded-lg" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
