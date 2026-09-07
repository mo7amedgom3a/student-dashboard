"use client";

import { useMemo, useState } from "react";
import { useAppStore } from "@/lib/store";
import { useI18n } from "@/hooks/use-i18n";
import { courses, getCourse, getInstructor } from "@/lib/mock-data";
import type { Course, CourseLevel, Instructor, Lesson } from "@/lib/types";
import { cn } from "@/lib/utils";
import { StarRating } from "@/components/shared/StarRating";
import { CourseThumb } from "@/components/shared/CourseThumb";
import { CourseCard } from "@/components/shared/CourseCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import {
  PlayCircle,
  BookOpen,
  FileQuestion,
  Heart,
  ShoppingCart,
  Check,
  Download,
  Smartphone,
  Award,
  Clock,
  Globe,
  GraduationCap,
  Star,
  Users,
  X,
  BookX,
  type LucideIcon,
} from "lucide-react";

/** Arabic labels for course levels — kept inline because i18n.ts is a protected foundation file. */
const LEVEL_AR: Record<CourseLevel, string> = {
  Beginner: "مبتدئ",
  Intermediate: "متوسط",
  Advanced: "متقدم",
};

/** Mock rating distribution shown in the reviews breakdown card. */
const RATING_BREAKDOWN: { stars: number; pct: number }[] = [
  { stars: 5, pct: 70 },
  { stars: 4, pct: 20 },
  { stars: 3, pct: 6 },
  { stars: 2, pct: 2 },
  { stars: 1, pct: 2 },
];

/**
 * CourseLandingScreen — Udemy + Coursera style course detail page.
 * Reads `courseId` from the SPA store route params and renders a 2-column
 * layout on desktop (main content + sticky right rail) and a single column
 * on mobile with a sticky bottom CTA bar.
 */
export interface CourseLandingScreenProps {
  courseId?: string;
}

export function CourseLandingScreen({ courseId: propCourseId }: CourseLandingScreenProps = {}) {
  const storeCourseId = useAppStore((s) => s.route.params?.courseId);
  const courseId = propCourseId ?? storeCourseId;
  const course = courseId ? getCourse(courseId) : undefined;

  if (!course) {
    return <CourseNotFound />;
  }

  return <CourseLandingContent course={course} />;
}

// ----------------------------------------------------------------------------
// Sub-components
// ----------------------------------------------------------------------------

function CourseNotFound() {
  const { t } = useI18n();
  const goBack = useAppStore((s) => s.goBack);
  const navigate = useAppStore((s) => s.navigate);
  return (
    <div className="view-enter max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <EmptyState
        icon={BookX}
        title={t("landing.notFound")}
        description={t("landing.notFoundDesc")}
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => goBack()}>
              {t("onboarding.back")}
            </Button>
            <Button onClick={() => navigate("search")}>{t("landing.backToBrowse")}</Button>
          </div>
        }
      />
    </div>
  );
}

function CourseLandingContent({ course }: { course: Course }) {
  const { t, locale, formatPrice } = useI18n();
  const navigate = useAppStore((s) => s.navigate);
  const isEnrolled = useAppStore((s) => s.isEnrolled(course.id));
  const isInCart = useAppStore((s) => s.isInCart(course.id));
  const isSaved = useAppStore((s) => s.isSaved(course.id));
  const addToCart = useAppStore((s) => s.addToCart);
  const removeFromCart = useAppStore((s) => s.removeFromCart);
  const toggleSaved = useAppStore((s) => s.toggleSaved);
  const enroll = useAppStore((s) => s.enroll);
  const pushToast = useAppStore((s) => s.pushToast);

  const instructor = getInstructor(course.instructorId);

  const relatedCourses = useMemo(
    () =>
      courses
        .filter((c) => c.id !== course.id && c.category === course.category)
        .slice(0, 3),
    [course.id, course.category]
  );

  const discountPct = course.originalPrice
    ? Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100)
    : 0;

  const handleEnroll = () => {
    enroll(course.id);
    pushToast({ title: t("landing.enrolledSuccess"), variant: "success" });
    navigate("course-player", { courseId: course.id });
  };

  const handleGoToCourse = () => navigate("course-player", { courseId: course.id });

  const handleBuyNow = () => {
    if (!isInCart) addToCart(course.id);
    navigate("checkout");
  };

  const handleCartToggle = () => {
    if (isInCart) {
      removeFromCart(course.id);
      pushToast({ title: t("landing.removedFromCart"), variant: "default" });
    } else {
      addToCart(course.id);
      pushToast({ title: t("landing.addedToCart"), variant: "success" });
    }
  };

  const handleWishlist = () => {
    toggleSaved(course.id);
    pushToast({
      title: isSaved ? t("landing.removed") : t("landing.saved"),
      variant: isSaved ? "default" : "success",
    });
  };

  const pricingActions = {
    isEnrolled,
    isInCart,
    isSaved,
    onEnroll: handleEnroll,
    onGoToCourse: handleGoToCourse,
    onBuyNow: handleBuyNow,
    onCartToggle: handleCartToggle,
    onWishlist: handleWishlist,
  };

  return (
    <div className="view-enter max-w-7xl mx-auto px-4 sm:px-6 py-6 lg:py-8 pb-28 lg:pb-8">
      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-8 xl:gap-10">
        {/* ---------------- MAIN COLUMN ---------------- */}
        <div className="min-w-0 space-y-10 lg:space-y-12">
          <HeaderBlock course={course} instructorName={instructor ? (locale === "ar" ? instructor.nameAr ?? instructor.name : instructor.name) : ""} />

          {/* Mobile inline pricing card (under header) */}
          <div className="lg:hidden">
            <PricingCard
              course={course}
              discountPct={discountPct}
              formatPrice={formatPrice}
              t={t}
              {...pricingActions}
            />
          </div>

          <SkillsSection skills={locale === "ar" ? course.skillsAr : course.skills} />

          <SyllabusSection course={course} />

          {instructor && <InstructorSection instructor={instructor} />}

          <ReviewsSection course={course} />

          <FaqSection faqs={course.faqs} />

          <RelatedSection related={relatedCourses} />
        </div>

        {/* ---------------- DESKTOP RIGHT RAIL ---------------- */}
        <aside className="hidden lg:block" aria-label={course.title}>
          <div className="sticky top-20">
            <PricingCard
              course={course}
              discountPct={discountPct}
              formatPrice={formatPrice}
              t={t}
              {...pricingActions}
            />
          </div>
        </aside>
      </div>

      {/* ---------------- MOBILE STICKY BOTTOM BAR ---------------- */}
      <MobileCTABar
        course={course}
        formatPrice={formatPrice}
        t={t}
        {...pricingActions}
      />
    </div>
  );
}

// ---------------- Header ----------------

function HeaderBlock({ course, instructorName }: { course: Course; instructorName: string }) {
  const { t, locale, formatNumber, formatDate } = useI18n();
  const title = locale === "ar" ? course.titleAr : course.title;
  const subtitle = locale === "ar" ? course.subtitleAr : course.subtitle;
  const category = locale === "ar" ? course.categoryAr : course.category;
  const levelLabel = locale === "ar" ? LEVEL_AR[course.level] : course.level;

  return (
    <section aria-label={title} className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant="secondary" className="uppercase tracking-wide text-[10px]">
          {category}
        </Badge>
        {course.bestseller && (
          <Badge className="bg-gold text-black hover:bg-gold text-[10px] font-bold">
            {t("card.bestseller")}
          </Badge>
        )}
        {course.isNew && (
          <Badge variant="outline" className="border-primary text-primary text-[10px] font-bold">
            {t("card.new")}
          </Badge>
        )}
      </div>

      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight text-foreground">
        {title}
      </h1>
      <p className="text-base sm:text-lg text-muted-foreground">{subtitle}</p>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
        <StarRating value={course.rating} size={16} showValue count={course.ratingCount} />
        <Dot />
        <span className="inline-flex items-center gap-1 text-muted-foreground">
          <Users className="w-4 h-4" />
          {t("landing.instructorStudents", { n: formatNumber(course.enrolledCount) })}
        </span>
        <Dot />
        <span className="inline-flex items-center gap-1 text-muted-foreground">
          <GraduationCap className="w-4 h-4" />
          {levelLabel}
        </span>
        <Dot />
        <span className="inline-flex items-center gap-1 text-muted-foreground">
          <Globe className="w-4 h-4" />
          {course.language}
        </span>
        <Dot />
        <span className="inline-flex items-center gap-1 text-muted-foreground">
          <Clock className="w-4 h-4" />
          {t("landing.updated", { date: formatDate(course.lastUpdated) })}
        </span>
      </div>

      {instructorName && (
        <div className="text-sm">
          <span className="text-muted-foreground">{t("landing.instructor")}: </span>
          <a
            href="#instructor"
            className="font-semibold text-primary hover:underline underline-offset-4"
          >
            {instructorName}
          </a>
        </div>
      )}
    </section>
  );
}

function Dot() {
  return <span className="text-muted-foreground/50 select-none" aria-hidden>·</span>;
}

// ---------------- Skills ----------------

function SkillsSection({ skills }: { skills: string[] }) {
  const { t } = useI18n();
  if (!skills.length) return null;
  return (
    <section aria-labelledby="skills-heading">
      <h2 id="skills-heading" className="text-xl sm:text-2xl font-bold mb-3">
        {t("landing.skillsTitle")}
      </h2>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill) => (
          <Badge
            key={skill}
            variant="outline"
            className="text-sm px-3 py-1.5 rounded-full bg-primary/10 text-primary border-primary/20"
          >
            {skill}
          </Badge>
        ))}
      </div>
    </section>
  );
}

// ---------------- Syllabus ----------------

function SyllabusSection({ course }: { course: Course }) {
  const { t, locale, formatDuration } = useI18n();
  const totalLessons = course.sections.reduce((acc, s) => acc + s.lessons.length, 0);
  const totalMinutes = course.sections.reduce(
    (acc, s) => acc + s.lessons.reduce((a, l) => a + l.durationMin, 0),
    0
  );
  const totalHours = Math.max(1, Math.round((totalMinutes / 60) * 10) / 10);

  return (
    <section aria-labelledby="syllabus-heading">
      <header className="mb-3">
        <h2 id="syllabus-heading" className="text-xl sm:text-2xl font-bold">
          {t("landing.syllabus")}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {t("landing.syllabusSub", {
            sections: course.sections.length,
            lessons: totalLessons,
            hours: totalHours,
          })}
        </p>
      </header>

      <Card className="p-0 gap-0 overflow-hidden">
        <Accordion
          type="multiple"
          defaultValue={course.sections[0] ? [course.sections[0].id] : []}
        >
          {course.sections.map((section) => {
            const sectionTitle =
              locale === "ar" ? section.titleAr ?? section.title : section.title;
            const sectionMinutes = section.lessons.reduce((a, l) => a + l.durationMin, 0);
            return (
              <AccordionItem
                key={section.id}
                value={section.id}
                className="px-4 first:pt-1 last:pb-1 border-b last:border-b-0"
              >
                <AccordionTrigger className="hover:no-underline py-4 text-start">
                  <div className="flex flex-col items-start text-start gap-0.5 pe-2 min-w-0">
                    <span className="text-sm sm:text-base font-semibold text-foreground line-clamp-2">
                      {sectionTitle}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {t("landing.lessonsCount", { n: section.lessons.length })} •{" "}
                      {formatDuration(sectionMinutes)}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-0 pb-2">
                  <ul className="divide-y divide-border/50">
                    {section.lessons.map((lesson) => (
                      <LessonRow key={lesson.id} lesson={lesson} />
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </Card>
    </section>
  );
}

function LessonRow({ lesson }: { lesson: Lesson }) {
  const { locale, formatDuration } = useI18n();
  const Icon: LucideIcon =
    lesson.type === "video" ? PlayCircle : lesson.type === "reading" ? BookOpen : FileQuestion;
  const title = locale === "ar" ? lesson.titleAr ?? lesson.title : lesson.title;

  return (
    <li className="flex items-center gap-3 py-2.5 px-2 rounded-md hover:bg-muted/60 transition-colors">
      <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
      <span className="text-sm flex-1 min-w-0 text-foreground/90 truncate">{title}</span>
      <span className="text-xs text-muted-foreground tabular-nums shrink-0">
        {formatDuration(lesson.durationMin)}
      </span>
    </li>
  );
}

// ---------------- Instructor ----------------

function InstructorSection({ instructor }: { instructor: Instructor }) {
  const { t, locale, formatNumber } = useI18n();
  const navigate = useAppStore((s) => s.navigate);
  const name = locale === "ar" ? instructor.nameAr ?? instructor.name : instructor.name;
  const title = locale === "ar" ? instructor.titleAr ?? instructor.title : instructor.title;
  const bio = locale === "ar" ? instructor.bioAr ?? instructor.bio : instructor.bio;

  const goToProfile = () => navigate("instructor-profile", { instructorId: instructor.id });

  return (
    <section id="instructor" aria-labelledby="instructor-heading" className="scroll-mt-20">
      <h2 id="instructor-heading" className="text-xl sm:text-2xl font-bold mb-3">
        {t("landing.instructor")}
      </h2>
      <Card className="p-5 sm:p-6 gap-4">
        <div className="flex items-start gap-4">
          <button onClick={goToProfile} className="shrink-0 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" aria-label={name}>
            <Avatar className="w-16 h-16 border border-border">
              <AvatarImage src={instructor.avatar} alt={name} />
              <AvatarFallback className="text-lg font-semibold bg-primary/10 text-primary">
                {name.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </button>
          <div className="flex-1 min-w-0">
            <button onClick={goToProfile} className="text-start group">
              <h3 className="text-lg font-bold leading-tight group-hover:text-primary transition-colors">{name}</h3>
            </button>
            <p className="text-sm text-muted-foreground mt-0.5">{title}</p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-gold" strokeWidth={0} fill="currentColor" />
                <span className="font-semibold text-foreground tabular-nums">
                  {instructor.rating.toFixed(1)}
                </span>
                <span>{t("landing.instructorRating")}</span>
              </span>
              <span className="inline-flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                {t("landing.instructorStudents", { n: formatNumber(instructor.students) })}
              </span>
              <span className="inline-flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5" />
                {t("landing.instructorCourses", { n: instructor.coursesCount })}
              </span>
            </div>
          </div>
        </div>
        <p className="text-sm text-foreground/85 leading-relaxed">{bio}</p>
        <Button variant="outline" size="sm" className="self-start" onClick={goToProfile}>
          {t("instructor.viewProfile")}
        </Button>
      </Card>
    </section>
  );
}

// ---------------- Reviews ----------------

function ReviewsSection({ course }: { course: Course }) {
  const { t, locale, formatNumber, formatDate } = useI18n();
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? course.reviews : course.reviews.slice(0, 3);

  return (
    <section aria-labelledby="reviews-heading">
      <header className="mb-4">
        <h2 id="reviews-heading" className="text-xl sm:text-2xl font-bold">
          {t("landing.reviews")}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {t("landing.reviewsSub", { n: formatNumber(course.ratingCount) })}
        </p>
      </header>

      <div className="grid sm:grid-cols-[200px_minmax(0,1fr)] gap-5">
        {/* Rating breakdown */}
        <Card className="p-5 gap-3 h-fit">
          <div className="text-center">
            <div className="text-4xl font-bold text-foreground tabular-nums">
              {course.rating.toFixed(1)}
            </div>
            <StarRating value={course.rating} size={18} className="mt-1 justify-center" />
            <div className="text-xs text-muted-foreground mt-1">
              {t("landing.reviewsSub", { n: formatNumber(course.ratingCount) })}
            </div>
          </div>
          <Separator />
          <div className="space-y-1.5" aria-label={t("landing.ratingBreakdown")}>
            {RATING_BREAKDOWN.map((row) => (
              <div key={row.stars} className="flex items-center gap-2 text-xs">
                <span className="w-3 text-muted-foreground tabular-nums text-end">{row.stars}</span>
                <Star className="w-3 h-3 text-gold shrink-0" strokeWidth={0} fill="currentColor" />
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden min-w-[60px]">
                  <div
                    className="h-full bg-gold/80 rounded-full"
                    style={{ width: `${row.pct}%` }}
                  />
                </div>
                <span className="w-9 text-end text-muted-foreground tabular-nums">{row.pct}%</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Reviews list */}
        <div className="min-w-0">
          <ul className="space-y-5">
            {visible.map((review) => {
              const comment =
                locale === "ar" ? review.commentAr ?? review.comment : review.comment;
              const initial = review.studentName.charAt(0).toUpperCase();
              return (
                <li key={review.id} className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-full bg-primary/15 text-primary flex items-center justify-center font-semibold text-sm shrink-0"
                      aria-hidden
                    >
                      {initial}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm">{review.studentName}</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <StarRating value={review.rating} size={12} />
                        <span className="text-xs text-muted-foreground">
                          {formatDate(review.date)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-foreground/85 leading-relaxed">{comment}</p>
                </li>
              );
            })}
          </ul>
          {course.reviews.length > 3 && (
            <Button
              variant="outline"
              className="mt-5"
              onClick={() => setShowAll((v) => !v)}
              aria-expanded={showAll}
            >
              {showAll ? t("landing.showLess") : t("landing.showMore")}
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}

// ---------------- FAQ ----------------

function FaqSection({ faqs }: { faqs: Course["faqs"] }) {
  const { t, locale } = useI18n();
  if (!faqs.length) return null;
  return (
    <section aria-labelledby="faq-heading">
      <h2 id="faq-heading" className="text-xl sm:text-2xl font-bold mb-3">
        {t("landing.faq")}
      </h2>
      <Accordion
        type="single"
        collapsible
        className="bg-card border rounded-xl px-4"
      >
        {faqs.map((faq, i) => {
          const q = locale === "ar" ? faq.questionAr ?? faq.question : faq.question;
          const a = locale === "ar" ? faq.answerAr ?? faq.answer : faq.answer;
          return (
            <AccordionItem
              key={faq.id}
              value={faq.id}
              className={i === faqs.length - 1 ? "border-b-0" : ""}
            >
              <AccordionTrigger className="text-start text-sm sm:text-base font-semibold hover:no-underline">
                {q}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                {a}
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </section>
  );
}

// ---------------- Related ----------------

function RelatedSection({ related }: { related: Course[] }) {
  const { t } = useI18n();
  if (!related.length) return null;
  return (
    <section aria-labelledby="related-heading">
      <h2 id="related-heading" className="text-xl sm:text-2xl font-bold mb-3">
        {t("landing.related")}
      </h2>
      <Card className="p-2 sm:p-3 gap-0">
        <ul className="divide-y divide-border/60">
          {related.map((c) => (
            <li key={c.id}>
              <CourseCard course={c} variant="compact" />
            </li>
          ))}
        </ul>
      </Card>
    </section>
  );
}

// ---------------- Pricing card (right rail + mobile inline) ----------------

interface PricingCardProps {
  course: Course;
  discountPct: number;
  formatPrice: (n: number) => string;
  t: (k: string, p?: Record<string, string | number>) => string;
  isEnrolled: boolean;
  isInCart: boolean;
  isSaved: boolean;
  onEnroll: () => void;
  onGoToCourse: () => void;
  onBuyNow: () => void;
  onCartToggle: () => void;
  onWishlist: () => void;
}

function PricingCard({
  course,
  discountPct,
  formatPrice,
  t,
  isEnrolled,
  isInCart,
  isSaved,
  onEnroll,
  onGoToCourse,
  onBuyNow,
  onCartToggle,
  onWishlist,
}: PricingCardProps) {
  return (
    <Card className="overflow-hidden p-0 gap-0 shadow-md">
      <CourseThumb course={course} />
      <div className="p-5 space-y-4">
        {/* Price */}
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-3xl font-bold text-foreground tabular-nums">
            {formatPrice(course.price)}
          </span>
          {course.originalPrice && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(course.originalPrice)}
            </span>
          )}
          {discountPct > 0 && (
            <Badge className="bg-gold text-black hover:bg-gold text-xs font-bold ms-1">
              {t("common.off", { n: discountPct })}
            </Badge>
          )}
        </div>

        {/* CTAs */}
        <div className="space-y-2">
          {isEnrolled ? (
            <>
              <Badge className="bg-success text-success-foreground hover:bg-success gap-1 w-full justify-center py-1.5">
                <Check className="w-3.5 h-3.5" /> {t("landing.alreadyEnrolled")}
              </Badge>
              <Button
                className="w-full"
                size="lg"
                onClick={onGoToCourse}
                aria-label={t("landing.goToCourse")}
              >
                <PlayCircle className="w-4 h-4" />
                {t("landing.goToCourse")}
              </Button>
            </>
          ) : (
            <>
              <Button
                className="w-full"
                size="lg"
                onClick={onEnroll}
                aria-label={t("landing.enroll")}
              >
                <GraduationCap className="w-4 h-4" />
                {t("landing.enroll")}
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={onCartToggle}
                  aria-label={isInCart ? t("landing.alreadyInCart") : t("landing.addToCart")}
                >
                  {isInCart ? (
                    <>
                      <Check className="w-4 h-4" /> {t("landing.alreadyInCart")}
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4" /> {t("landing.addToCart")}
                    </>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onWishlist}
                  aria-pressed={isSaved}
                  aria-label={t("landing.wishlist")}
                  className="border border-border"
                >
                  <Heart
                    className={cn("w-5 h-5", isSaved && "fill-rose-500 text-rose-500")}
                  />
                </Button>
              </div>
              <Button variant="outline" className="w-full" onClick={onBuyNow}>
                {t("landing.buyNow")}
              </Button>
            </>
          )}
        </div>

        <Separator />

        {/* Includes */}
        <div>
          <h3 className="text-sm font-semibold mb-2">{t("landing.includes")}</h3>
          <ul className="space-y-2 text-sm text-foreground/90">
            <li className="flex items-center gap-2.5">
              <PlayCircle className="w-4 h-4 text-muted-foreground shrink-0" />
              <span>{t("landing.includes.videos", { n: course.includes.hoursOfVideo })}</span>
            </li>
            <li className="flex items-center gap-2.5">
              <BookOpen className="w-4 h-4 text-muted-foreground shrink-0" />
              <span>{t("landing.includes.articles", { n: course.includes.articles })}</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Download className="w-4 h-4 text-muted-foreground shrink-0" />
              <span>
                {t("landing.includes.resources", { n: course.includes.downloadableResources })}
              </span>
            </li>
            <li className="flex items-center gap-2.5">
              {course.includes.mobileAccess ? (
                <Check className="w-4 h-4 text-success shrink-0" />
              ) : (
                <X className="w-4 h-4 text-muted-foreground shrink-0" />
              )}
              <span className={cn(!course.includes.mobileAccess && "text-muted-foreground line-through")}>
                <Smartphone className="inline w-3.5 h-3.5 me-1 -mt-0.5 align-middle" />
                {t("landing.includes.mobile")}
              </span>
            </li>
            <li className="flex items-center gap-2.5">
              {course.includes.certificate ? (
                <Check className="w-4 h-4 text-success shrink-0" />
              ) : (
                <X className="w-4 h-4 text-muted-foreground shrink-0" />
              )}
              <span className={cn(!course.includes.certificate && "text-muted-foreground line-through")}>
                <Award className="inline w-3.5 h-3.5 me-1 -mt-0.5 align-middle" />
                {t("landing.includes.certificate")}
              </span>
            </li>
          </ul>
        </div>
      </div>
    </Card>
  );
}

// ---------------- Mobile sticky CTA bar ----------------

interface MobileCTABarProps {
  course: Course;
  formatPrice: (n: number) => string;
  t: (k: string, p?: Record<string, string | number>) => string;
  isEnrolled: boolean;
  isInCart: boolean;
  isSaved: boolean;
  onEnroll: () => void;
  onGoToCourse: () => void;
  onCartToggle: () => void;
  onWishlist: () => void;
}

function MobileCTABar({
  course,
  formatPrice,
  t,
  isEnrolled,
  isInCart,
  isSaved,
  onEnroll,
  onGoToCourse,
  onCartToggle,
  onWishlist,
}: MobileCTABarProps) {
  return (
    <div
      className="lg:hidden fixed inset-x-0 bottom-0 z-40 bg-card/95 backdrop-blur border-t border-border shadow-[0_-4px_12px_rgba(0,0,0,0.06)]"
      role="region"
      aria-label={t("landing.enroll")}
    >
      <div className="max-w-7xl mx-auto px-3 py-2.5 flex items-center gap-2">
        {/* Price */}
        <div className="flex flex-col leading-none me-1">
          <span className="text-base font-bold text-foreground tabular-nums">
            {formatPrice(course.price)}
          </span>
          {course.originalPrice && (
            <span className="text-[11px] text-muted-foreground line-through mt-0.5">
              {formatPrice(course.originalPrice)}
            </span>
          )}
        </div>

        <div className="flex-1" />

        {/* Wishlist heart */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onWishlist}
          aria-pressed={isSaved}
          aria-label={t("landing.wishlist")}
          className="border border-border shrink-0"
        >
          <Heart className={cn("w-5 h-5", isSaved && "fill-rose-500 text-rose-500")} />
        </Button>

        {/* Add to cart (hidden on very small screens to make room) */}
        {!isEnrolled && (
          <Button
            variant="secondary"
            onClick={onCartToggle}
            className="shrink-0"
            aria-label={isInCart ? t("landing.alreadyInCart") : t("landing.addToCart")}
          >
            {isInCart ? (
              <Check className="w-4 h-4" />
            ) : (
              <ShoppingCart className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">
              {isInCart ? t("landing.alreadyInCart") : t("landing.addToCart")}
            </span>
          </Button>
        )}

        {/* Primary CTA */}
        <Button
          onClick={isEnrolled ? onGoToCourse : onEnroll}
          className="shrink-0"
          aria-label={isEnrolled ? t("landing.goToCourse") : t("landing.enroll")}
        >
          {isEnrolled ? (
            <>
              <PlayCircle className="w-4 h-4" />
              <span>{t("landing.goToCourse")}</span>
            </>
          ) : (
            <>
              <GraduationCap className="w-4 h-4" />
              <span>{t("landing.enroll")}</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
