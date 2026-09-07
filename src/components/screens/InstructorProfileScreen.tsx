"use client";

import { useMemo, useState } from "react";
import { useAppStore } from "@/lib/store";
import { useI18n } from "@/hooks/use-i18n";
import { courses, getInstructor } from "@/lib/mock-data";
import type { Course, Instructor, Review } from "@/lib/types";
import { StarRating } from "@/components/shared/StarRating";
import { CourseCard } from "@/components/shared/CourseCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Clock,
  GraduationCap,
  ShoppingCart,
  Sparkles,
  Star,
  UserX,
  Users,
  ChevronDown,
} from "lucide-react";

/**
 * InstructorProfileScreen — instructor public profile page.
 *
 * Renders: hero header (avatar + name + title + 4 stat cards + bio +
 * specialties pills), a responsive grid of the instructor's courses
 * (CourseCard), an aggregate reviews section with a summary card, and a
 * subtle CTA card at the bottom suggesting the instructor's top-rated
 * course when the learner isn't enrolled in any of them.
 *
 * Reads `instructorId` from the SPA store route params. Falls back to
 * EmptyState when the instructor isn't found.
 */
export interface InstructorProfileScreenProps {
  instructorId?: string;
}

export function InstructorProfileScreen({ instructorId: propInstructorId }: InstructorProfileScreenProps = {}) {
  const storeInstructorId = useAppStore((s) => s.route.params?.instructorId);
  const instructorId = propInstructorId ?? storeInstructorId;
  const instructor = instructorId ? getInstructor(instructorId) : undefined;

  if (!instructor) {
    return <InstructorNotFound />;
  }

  return <InstructorProfileContent instructor={instructor} />;
}

// ----------------------------------------------------------------------------
// Not found
// ----------------------------------------------------------------------------

function InstructorNotFound() {
  const { t } = useI18n();
  const navigate = useAppStore((s) => s.navigate);
  return (
    <div className="view-enter max-w-3xl mx-auto w-full px-4 sm:px-6 py-12">
      <EmptyState
        icon={UserX}
        title={t("instructor.notFound")}
        description={t("instructor.notFoundDesc")}
        action={
          <Button onClick={() => navigate("search")}>{t("instructor.browse")}</Button>
        }
      />
    </div>
  );
}

// ----------------------------------------------------------------------------
// Main content
// ----------------------------------------------------------------------------

function InstructorProfileContent({ instructor }: { instructor: Instructor }) {
  const { t, locale, isRTL, formatNumber } = useI18n();
  const navigate = useAppStore((s) => s.navigate);
  const goBack = useAppStore((s) => s.goBack);
  const history = useAppStore((s) => s.history);
  const enrolledCourseIds = useAppStore((s) => s.enrolledCourseIds);

  const name = locale === "ar" ? instructor.nameAr ?? instructor.name : instructor.name;
  const title = locale === "ar" ? instructor.titleAr ?? instructor.title : instructor.title;
  const bio = locale === "ar" ? instructor.bioAr ?? instructor.bio : instructor.bio;

  // All courses by this instructor (filter the mock catalog).
  const myCourses = useMemo(
    () => courses.filter((c) => c.instructorId === instructor.id),
    [instructor.id]
  );

  // Unique categories = "specialties" (locale-aware).
  const specialties = useMemo(() => {
    const seen = new Set<string>();
    const out: { en: string; ar: string }[] = [];
    for (const c of myCourses) {
      if (!seen.has(c.category)) {
        seen.add(c.category);
        out.push({ en: c.category, ar: c.categoryAr });
      }
    }
    return out;
  }, [myCourses]);

  // Sum of every course's totalHours.
  const totalHours = useMemo(
    () => myCourses.reduce((sum, c) => sum + c.totalHours, 0),
    [myCourses]
  );

  // Aggregate reviews across all of the instructor's courses.
  const reviewsWithCourse = useMemo(() => {
    const out: { review: Review; course: Course }[] = [];
    for (const c of myCourses) {
      for (const r of c.reviews) {
        out.push({ review: r, course: c });
      }
    }
    return out;
  }, [myCourses]);

  const avgRating =
    reviewsWithCourse.length > 0
      ? reviewsWithCourse.reduce((sum, x) => sum + x.review.rating, 0) / reviewsWithCourse.length
      : instructor.rating;

  // Top-rated course (for the CTA card).
  const topCourse = useMemo(() => {
    if (myCourses.length === 0) return undefined;
    return [...myCourses].sort((a, b) => b.rating - a.rating)[0];
  }, [myCourses]);

  // Whether the learner is already enrolled in any of this instructor's courses.
  const enrolledAny = myCourses.some((c) => enrolledCourseIds.includes(c.id));

  const handleBack = () => {
    if (history.length > 0) goBack();
    else navigate("search");
  };

  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  return (
    <div className="view-enter max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 space-y-8">
      {/* 1. Back link */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="text-muted-foreground hover:text-foreground gap-1.5 -ms-2"
          aria-label={t("onboarding.back")}
        >
          <BackIcon className="w-4 h-4" />
          <span>{t("onboarding.back")}</span>
        </Button>
      </div>

      {/* 2. Hero header card */}
      <HeroCard
        instructor={instructor}
        name={name}
        title={title}
        bio={bio}
        myCourses={myCourses}
        specialties={specialties}
        totalHours={totalHours}
        avgRating={avgRating}
        reviewsCount={reviewsWithCourse.length}
      />

      {/* 3. Courses by {name} */}
      <section aria-labelledby="instructor-courses-heading" className="space-y-4">
        <header className="flex items-baseline justify-between gap-3">
          <h2 id="instructor-courses-heading" className="text-xl sm:text-2xl font-bold">
            {t("instructor.allCourses", { name })}
          </h2>
          <Badge variant="secondary" className="text-xs tabular-nums">
            {myCourses.length}
          </Badge>
        </header>
        {myCourses.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title={t("home.empty")}
            action={
              <Button onClick={() => navigate("search")}>{t("landing.backToBrowse")}</Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {myCourses.map((c) => (
              <CourseCard key={c.id} course={c} variant="default" showActions />
            ))}
          </div>
        )}
      </section>

      {/* 4. Student reviews */}
      <ReviewsSection
        reviewsWithCourse={reviewsWithCourse}
        avgRating={avgRating}
        instructorRating={instructor.rating}
      />

      {/* 5. Bottom CTA card (subtle, not enrolled in any of their courses) */}
      {!enrolledAny && topCourse ? (
        <CtaCard topCourse={topCourse} />
      ) : null}
    </div>
  );
}

// ----------------------------------------------------------------------------
// Hero header card
// ----------------------------------------------------------------------------

interface HeroCardProps {
  instructor: Instructor;
  name: string;
  title: string;
  bio: string;
  myCourses: Course[];
  specialties: { en: string; ar: string }[];
  totalHours: number;
  avgRating: number;
  reviewsCount: number;
}

function HeroCard({
  instructor,
  name,
  title,
  bio,
  myCourses,
  specialties,
  totalHours,
  avgRating,
  reviewsCount,
}: HeroCardProps) {
  const { t, locale, formatNumber } = useI18n();

  return (
    <Card className="overflow-hidden gap-0 py-0">
      {/* Top banner with avatar + name + title + specialties */}
      <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent px-5 sm:px-8 pt-6 sm:pt-8 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-start gap-5 sm:gap-6">
          <Avatar className="w-24 h-24 sm:w-28 sm:h-28 border-4 border-background shadow-md shrink-0">
            <AvatarImage src={instructor.avatar} alt={name} />
            <AvatarFallback className="text-3xl font-bold bg-primary/10 text-primary">
              {name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0 space-y-2">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                {name}
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground mt-1">{title}</p>
            </div>
            {specialties.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-xs font-medium text-muted-foreground">
                  {t("instructor.specialties")}:
                </span>
                {specialties.map((s) => (
                  <Badge key={s.en} variant="outline" className="bg-background/70 text-xs">
                    {locale === "ar" ? s.ar : s.en}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats + bio */}
      <div className="px-5 sm:px-8 py-5 sm:py-6 space-y-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard
            icon={<Star className="w-4 h-4 text-gold" strokeWidth={0} fill="currentColor" />}
            label={t("instructor.rating")}
            ariaLabel={`${t("instructor.rating")}: ${avgRating.toFixed(1)}`}
            value={
              <div className="flex items-center gap-2">
                <span className="tabular-nums">{avgRating.toFixed(1)}</span>
                <StarRating value={avgRating} size={12} />
              </div>
            }
          />
          <StatCard
            icon={<Users className="w-4 h-4 text-primary" />}
            label={t("instructor.students")}
            ariaLabel={`${t("instructor.students")}: ${formatNumber(instructor.students)}`}
            value={<span className="tabular-nums">{formatNumber(instructor.students)}</span>}
          />
          <StatCard
            icon={<GraduationCap className="w-4 h-4 text-primary" />}
            label={t("instructor.courses")}
            ariaLabel={`${t("instructor.courses")}: ${myCourses.length}`}
            value={<span className="tabular-nums">{myCourses.length}</span>}
          />
          <StatCard
            icon={<Clock className="w-4 h-4 text-primary" />}
            label={t("instructor.totalHours")}
            ariaLabel={`${t("instructor.totalHours")}: ${formatNumber(totalHours)}`}
            value={<span className="tabular-nums">{formatNumber(totalHours)}</span>}
          />
        </div>

        {/* Bio */}
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
            {t("instructor.bio")}
          </h2>
          <p className="text-sm sm:text-base text-foreground/85 leading-relaxed">{bio}</p>
        </div>

        {/* Tiny meta row: instructor's own rating vs aggregate reviews count */}
        <p className="text-xs text-muted-foreground">
          {t("instructor.avgRating")}:{" "}
          <span className="font-semibold text-foreground tabular-nums">
            {instructor.rating.toFixed(1)}
          </span>
          <span className="mx-1.5" aria-hidden>
            ·
          </span>
          {t("instructor.reviews")}:{" "}
          <span className="font-semibold text-foreground tabular-nums">
            {formatNumber(reviewsCount)}
          </span>
        </p>
      </div>
    </Card>
  );
}

function StatCard({
  icon,
  label,
  value,
  ariaLabel,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  ariaLabel: string;
}) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className="flex flex-col gap-1 p-3 rounded-md bg-muted/60 border border-border/60"
    >
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      <div className="text-base font-bold text-foreground">{value}</div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// Reviews section
// ----------------------------------------------------------------------------

function ReviewsSection({
  reviewsWithCourse,
  avgRating,
  instructorRating,
}: {
  reviewsWithCourse: { review: Review; course: Course }[];
  avgRating: number;
  instructorRating: number;
}) {
  const { t, locale, formatNumber, formatDate } = useI18n();
  const [expanded, setExpanded] = useState(false);
  const INITIAL = 6;
  const MAX = 12;
  const visible = expanded
    ? reviewsWithCourse.slice(0, MAX)
    : reviewsWithCourse.slice(0, INITIAL);
  const hasMore = reviewsWithCourse.length > INITIAL;

  return (
    <section aria-labelledby="instructor-reviews-heading" className="space-y-4">
      <header className="flex items-baseline justify-between gap-3">
        <h2 id="instructor-reviews-heading" className="text-xl sm:text-2xl font-bold">
          {t("instructor.allReviews")}
        </h2>
      </header>

      {reviewsWithCourse.length === 0 ? (
        <EmptyState icon={BookOpen} title={t("home.empty")} />
      ) : (
        <>
          {/* Summary card */}
          <Card className="p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
              <div className="flex items-center gap-4">
                <div className="text-4xl sm:text-5xl font-bold text-foreground tabular-nums">
                  {avgRating.toFixed(1)}
                </div>
                <div className="space-y-1">
                  <StarRating value={avgRating} size={18} />
                  <p className="text-xs text-muted-foreground">
                    {t("landing.reviewsSub", { n: formatNumber(reviewsWithCourse.length) })}
                  </p>
                </div>
              </div>
              <div className="sm:ms-auto text-xs text-muted-foreground">
                {t("instructor.avgRating")}:{" "}
                <span className="font-semibold text-foreground tabular-nums">
                  {instructorRating.toFixed(1)}
                </span>
              </div>
            </div>
          </Card>

          {/* Review list */}
          <ul className="space-y-3 list-none p-0 m-0">
            {visible.map(({ review, course }) => {
              const courseTitle = locale === "ar" ? course.titleAr : course.title;
              const comment =
                locale === "ar" ? review.commentAr ?? review.comment : review.comment;
              return (
                <li key={review.id}>
                  <Card className="p-4 sm:p-5 gap-2">
                    <div className="flex items-start gap-3">
                      <Avatar className="w-9 h-9 shrink-0">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                          {review.studentName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                          <span className="font-semibold text-sm text-foreground">
                            {review.studentName}
                          </span>
                          <span className="text-xs text-muted-foreground" aria-hidden>
                            ·
                          </span>
                          <StarRating value={review.rating} size={12} />
                          <span className="text-xs text-muted-foreground sm:ms-auto">
                            {formatDate(review.date)}
                          </span>
                        </div>
                        <p className="text-sm text-foreground/85 leading-relaxed mt-1.5">
                          {comment}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          <span className="text-foreground/70">{t("landing.instructor")}:</span>{" "}
                          <span className="text-foreground/85">{courseTitle}</span>
                        </p>
                      </div>
                    </div>
                  </Card>
                </li>
              );
            })}
          </ul>

          {hasMore && (
            <div className="flex justify-center pt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setExpanded((v) => !v)}
                aria-expanded={expanded}
                className="gap-1.5"
              >
                <ChevronDown
                  className={cnChevron(expanded)}
                  aria-hidden
                />
                <span>{expanded ? t("landing.showLess") : t("landing.showMore")}</span>
              </Button>
            </div>
          )}
        </>
      )}
    </section>
  );
}

/** Tiny helper: rotate the chevron depending on the expanded state. */
function cnChevron(expanded: boolean) {
  return `w-4 h-4 transition-transform ${expanded ? "rotate-180" : ""}`;
}

// ----------------------------------------------------------------------------
// Bottom CTA card
// ----------------------------------------------------------------------------

function CtaCard({ topCourse }: { topCourse: Course }) {
  const { t, locale } = useI18n();
  const navigate = useAppStore((s) => s.navigate);
  const addToCart = useAppStore((s) => s.addToCart);
  const isInCart = useAppStore((s) => s.isInCart(topCourse.id));
  const pushToast = useAppStore((s) => s.pushToast);

  const title = locale === "ar" ? topCourse.titleAr : topCourse.title;

  const handleAddToCart = () => {
    if (isInCart) return;
    addToCart(topCourse.id);
    pushToast({ title: t("landing.addedToCart"), variant: "success" });
  };

  return (
    <Card className="p-5 sm:p-6 bg-gradient-to-br from-primary/5 via-transparent to-transparent border-primary/20">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">{t("home.trendingSub")}</p>
            <p className="text-sm font-semibold text-foreground truncate">{title}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={handleAddToCart} className="gap-1.5">
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>{t("card.addToCart")}</span>
          </Button>
          <Button
            size="sm"
            onClick={() => navigate("course-landing", { courseId: topCourse.id })}
          >
            {t("instructor.viewCourse")}
          </Button>
        </div>
      </div>
    </Card>
  );
}
