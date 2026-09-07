"use client";

import { useEffect, useMemo, useState } from "react";
import {
  PlayCircle,
  RotateCcw,
  Heart,
  ShoppingCart,
  Trash2,
  Award,
  Download,
  Eye,
  GraduationCap,
  Bookmark,
  CheckCircle2,
  Sparkles,
  Clock,
  BookOpen,
  Search,
  Filter,
  Trophy,
  ArrowRight,
  ArrowLeft,
  Calendar,
  Share2,
  Flame,
} from "lucide-react";
import { useI18n } from "@/hooks/use-i18n";
import { useAppStore } from "@/lib/store";
import { courses, getCourse, getInstructor } from "@/lib/mock-data";
import { CourseThumb } from "@/components/shared/CourseThumb";
import { CourseCard } from "@/components/shared/CourseCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { Certificate, Course } from "@/lib/types";
import { cn } from "@/lib/utils";

type TabValue = "in-progress" | "saved" | "certificates";
type FilterStatus = "all" | "in-progress" | "completed";

export interface MyLearningScreenProps {
  initialTab?: TabValue;
}

export function MyLearningScreen({ initialTab }: MyLearningScreenProps = {}) {
  const { t, locale, formatPrice, formatDate, formatNumber, isRTL } = useI18n();
  const navigate = useAppStore((s) => s.navigate);
  const route = useAppStore((s) => s.route);
  const enrolledCourseIds = useAppStore((s) => s.enrolledCourseIds);
  const savedCourseIds = useAppStore((s) => s.savedCourseIds);
  const certificates = useAppStore((s) => s.certificates);
  const getCourseProgress = useAppStore((s) => s.getCourseProgress);
  const getCurrentLessonId = useAppStore((s) => s.getCurrentLessonId);
  const addToCart = useAppStore((s) => s.addToCart);
  const toggleSaved = useAppStore((s) => s.toggleSaved);
  const pushToast = useAppStore((s) => s.pushToast);
  const user = useAppStore((s) => s.user);

  // Controlled tab (supporting direct navigation to saved or certificates)
  const routeTab = (initialTab ?? route.params?.tab) as TabValue | undefined;
  const [tab, setTab] = useState<TabValue>(
    routeTab === "saved" || routeTab === "certificates" ? routeTab : "in-progress"
  );
  const [viewingCert, setViewingCert] = useState<Certificate | null>(null);

  useEffect(() => {
    const targetTab = initialTab ?? (route.params?.tab as TabValue | undefined);
    if (
      targetTab &&
      (targetTab === "in-progress" ||
        targetTab === "saved" ||
        targetTab === "certificates")
    ) {
      setTab(targetTab);
    }
  }, [initialTab, route.params?.tab]);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");

  const L = (en: string, ar: string) => (locale === "ar" ? ar : en);

  const enrolledCourses = useMemo<Course[]>(
    () =>
      enrolledCourseIds
        .map((id) => getCourse(id))
        .filter((c): c is Course => Boolean(c)),
    [enrolledCourseIds]
  );

  const savedCourses = useMemo<Course[]>(
    () =>
      savedCourseIds
        .map((id) => getCourse(id))
        .filter((c): c is Course => Boolean(c)),
    [savedCourseIds]
  );

  const certsWithCourses = useMemo(
    () =>
      certificates
        .map((cert) => ({ cert, course: getCourse(cert.courseId) }))
        .filter(
          (x): x is { cert: Certificate; course: Course } => Boolean(x.course)
        ),
    [certificates]
  );

  // Filtered enrolled courses
  const filteredEnrolledCourses = useMemo(() => {
    return enrolledCourses.filter((course) => {
      const pct = getCourseProgress(course.id);
      if (statusFilter === "in-progress" && pct === 100) return false;
      if (statusFilter === "completed" && pct < 100) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const title = (locale === "ar" ? course.titleAr : course.title).toLowerCase();
      const category = (locale === "ar" ? course.categoryAr : course.category).toLowerCase();
      return title.includes(q) || category.includes(q);
    });
  }, [enrolledCourses, statusFilter, searchQuery, getCourseProgress, locale]);

  // Learning stats calculation
  const completedCoursesCount = useMemo(() => {
    return enrolledCourses.filter((c) => getCourseProgress(c.id) === 100).length;
  }, [enrolledCourses, getCourseProgress]);

  const totalLearningHours = useMemo(() => {
    return enrolledCourses.reduce((sum, c) => sum + c.totalHours, 0);
  }, [enrolledCourses]);

  const avgProgress = useMemo(() => {
    if (enrolledCourses.length === 0) return 0;
    const totalPct = enrolledCourses.reduce((sum, c) => sum + getCourseProgress(c.id), 0);
    return Math.round(totalPct / enrolledCourses.length);
  }, [enrolledCourses, getCourseProgress]);

  // Recommended courses for empty states
  const recommendedCourses = useMemo(() => {
    const enrolledSet = new Set(enrolledCourseIds);
    return courses.filter((c) => !enrolledSet.has(c.id)).slice(0, 4);
  }, [enrolledCourseIds]);

  const studentName = user?.name ?? L("Learner", "متعلّم");

  // ---- Action handlers -----------------------------------------------------
  const moveToCart = (course: Course) => {
    addToCart(course.id);
    toggleSaved(course.id);
    pushToast({
      title: L("Moved to cart", "اتنقل للسلة"),
      description: locale === "ar" ? course.titleAr : course.title,
      variant: "success",
    });
  };

  const handleMoveAllSavedToCart = () => {
    for (const course of savedCourses) {
      addToCart(course.id);
      toggleSaved(course.id);
    }
    pushToast({
      title: locale === "ar" ? "تم نقل جميع المحفوظات إلى السلة" : "All saved courses moved to cart",
      variant: "success",
    });
  };

  const removeSaved = (course: Course) => {
    toggleSaved(course.id);
    pushToast({
      title: L("Removed from saved", "اتشال من المحفوظات"),
      description: locale === "ar" ? course.titleAr : course.title,
      variant: "default",
    });
  };

  const downloadCert = (course: Course) => {
    pushToast({
      title: L("Downloading certificate…", "جاري تحميل الشهادة…"),
      description: locale === "ar" ? course.titleAr : course.title,
      variant: "success",
    });
  };

  const viewingCourse = viewingCert ? getCourse(viewingCert.courseId) : undefined;
  const ForwardIcon = isRTL ? ArrowLeft : ArrowRight;

  return (
    <div className="view-enter max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 lg:py-10 space-y-8">
      {/* Header & Title */}
      <header className="space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-semibold">
          <GraduationCap className="h-3.5 w-3.5" />
          {t("myLearning.title")}
        </div>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
              {t("myLearning.title")}
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              {t("home.greetingSub")}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("search")}
            className="gap-1.5 self-start sm:self-auto"
          >
            <BookOpen className="w-3.5 h-3.5 text-primary" />
            <span>{t("myLearning.browse")}</span>
          </Button>
        </div>
      </header>

      {/* Learning Stats Bar across full width */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:gap-4">
        <Card className="border border-border bg-gradient-to-br from-card to-accent/10">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-muted-foreground block">
                {locale === "ar" ? "الدورات المسجلة" : "Enrolled Courses"}
              </span>
              <span className="text-lg sm:text-xl font-bold text-foreground">
                {enrolledCourses.length}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border bg-gradient-to-br from-card to-accent/10">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-muted-foreground block">
                {locale === "ar" ? "الدورات المكتملة" : "Completed Courses"}
              </span>
              <span className="text-lg sm:text-xl font-bold text-foreground">
                {completedCoursesCount}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border bg-gradient-to-br from-card to-accent/10">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-muted-foreground block">
                {t("myLearning.tab.certificates")}
              </span>
              <span className="text-lg sm:text-xl font-bold text-foreground">
                {certsWithCourses.length}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border bg-gradient-to-br from-card to-accent/10">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-muted-foreground block">
                {locale === "ar" ? "معدل الإنجاز العام" : "Overall Progress"}
              </span>
              <span className="text-lg sm:text-xl font-bold text-foreground">
                {avgProgress}%
              </span>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Main Tabs Container */}
      <Tabs
        value={tab}
        onValueChange={(v) => setTab(v as TabValue)}
        className="space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
          <TabsList aria-label={t("myLearning.title")} className="h-auto flex-wrap p-1">
            <TabsTrigger value="in-progress" className="gap-2 py-2 px-3 sm:px-4">
              <GraduationCap className="w-4 h-4 text-primary" />
              <span>{t("myLearning.tab.inProgress")}</span>
              <CountPill n={enrolledCourses.length} />
            </TabsTrigger>
            <TabsTrigger value="saved" className="gap-2 py-2 px-3 sm:px-4">
              <Heart className="w-4 h-4 text-primary" />
              <span>{t("myLearning.tab.saved")}</span>
              <CountPill n={savedCourses.length} />
            </TabsTrigger>
            <TabsTrigger value="certificates" className="gap-2 py-2 px-3 sm:px-4">
              <Award className="w-4 h-4 text-primary" />
              <span>{t("myLearning.tab.certificates")}</span>
              <CountPill n={certsWithCourses.length} />
            </TabsTrigger>
          </TabsList>

          {/* Quick Search & Filter in Tab 1 */}
          {tab === "in-progress" && enrolledCourses.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="relative w-48 sm:w-60">
                <Search className="absolute start-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={locale === "ar" ? "ابحث في دوراتك…" : "Search your courses…"}
                  className="h-9 ps-8 pe-3 text-xs"
                />
              </div>

              <div className="flex items-center gap-1 bg-muted p-0.5 rounded-lg text-xs">
                <button
                  type="button"
                  onClick={() => setStatusFilter("all")}
                  className={cn(
                    "px-2.5 py-1 rounded-md transition-colors",
                    statusFilter === "all"
                      ? "bg-background text-foreground font-semibold shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {locale === "ar" ? "الكل" : "All"}
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter("in-progress")}
                  className={cn(
                    "px-2.5 py-1 rounded-md transition-colors",
                    statusFilter === "in-progress"
                      ? "bg-background text-foreground font-semibold shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {t("myLearning.tab.inProgress")}
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter("completed")}
                  className={cn(
                    "px-2.5 py-1 rounded-md transition-colors",
                    statusFilter === "completed"
                      ? "bg-background text-foreground font-semibold shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {t("myLearning.completed")}
                </button>
              </div>
            </div>
          )}

          {/* Move all to cart button in Tab 2 */}
          {tab === "saved" && savedCourses.length > 1 && (
            <Button size="sm" onClick={handleMoveAllSavedToCart} className="gap-1.5 self-start sm:self-auto">
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>{locale === "ar" ? "نقل الكل إلى السلة" : "Move all to cart"}</span>
            </Button>
          )}
        </div>

        {/* ---------- TAB 1: In progress ---------- */}
        <TabsContent value="in-progress" className="space-y-6">
          {enrolledCourses.length === 0 ? (
            <div className="space-y-8">
              <Card className="border border-border">
                <CardContent className="py-12">
                  <EmptyState
                    icon={GraduationCap}
                    title={t("myLearning.empty.inProgress")}
                    description={t("home.greetingSub")}
                    action={
                      <Button onClick={() => navigate("search")} className="gap-2 mt-2">
                        <Bookmark className="w-4 h-4" /> {t("myLearning.browse")}
                      </Button>
                    }
                  />
                </CardContent>
              </Card>

              {/* Recommended discovery */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-foreground">
                    {locale === "ar" ? "ابدأ بدورات موصى بها لك" : "Recommended courses to begin"}
                  </h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate("search")}
                    className="gap-1.5"
                  >
                    <span>{t("home.viewAll")}</span>
                    <ForwardIcon className="w-3.5 h-3.5" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {recommendedCourses.map((c) => (
                    <CourseCard key={c.id} course={c} variant="default" showActions />
                  ))}
                </div>
              </section>
            </div>
          ) : filteredEnrolledCourses.length === 0 ? (
            <Card className="border border-border">
              <CardContent className="py-10 text-center space-y-3">
                <p className="text-sm text-muted-foreground">
                  {locale === "ar"
                    ? "لا توجد دورات مطابقة لمعايير البحث والتصفية."
                    : "No courses match your search and filter criteria."}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                  }}
                >
                  {locale === "ar" ? "إعادة ضبط التصفية" : "Reset filters"}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEnrolledCourses.map((course) => {
                const pct = getCourseProgress(course.id);
                const instructor = getInstructor(course.instructorId);
                const title = locale === "ar" ? course.titleAr : course.title;
                const instructorName = instructor
                  ? locale === "ar"
                    ? instructor.nameAr ?? instructor.name
                    : instructor.name
                  : "";
                const hasCert = certificates.some((c) => c.courseId === course.id);
                const completed = pct === 100;

                return (
                  <Card
                    key={course.id}
                    className="gap-0 p-0 overflow-hidden flex flex-col justify-between hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 border border-border"
                  >
                    <div>
                      <button
                        type="button"
                        onClick={() =>
                          navigate("course-player", { courseId: course.id })
                        }
                        aria-label={title}
                        className="block w-full text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
                      >
                        <CourseThumb course={course} showPlay />
                      </button>

                      <div className="p-5 flex flex-col gap-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1 text-[11px] text-muted-foreground">
                            <span>{course.category}</span>
                            <span>•</span>
                            <span>{course.level}</span>
                          </div>
                          <h3 className="font-bold text-base text-foreground leading-snug line-clamp-2 hover:text-primary transition-colors">
                            {title}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-1">
                            {instructorName}
                          </p>
                        </div>

                        {/* Progress bar */}
                        <div className="space-y-1.5 pt-1">
                          <div className="flex items-center justify-between gap-2 text-xs">
                            <span
                              className={
                                completed
                                  ? "font-semibold text-success"
                                  : "text-muted-foreground"
                              }
                            >
                              {pct === 0
                                ? t("myLearning.notStarted")
                                : t("myLearning.progress", { n: pct })}
                            </span>
                            {completed && (
                              <Badge className="bg-success text-success-foreground hover:bg-success gap-1 text-[10px] font-semibold">
                                <CheckCircle2 className="w-3 h-3" />
                                {t("myLearning.completed")}
                              </Badge>
                            )}
                          </div>
                          <div
                            role="progressbar"
                            aria-valuenow={pct}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-label={t("myLearning.progress", { n: pct })}
                            className="h-2 w-full bg-muted rounded-full overflow-hidden"
                          >
                            <div
                              className={cn(
                                "h-full rounded-full transition-all duration-300",
                                completed ? "bg-success" : "bg-primary"
                              )}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="p-5 pt-0 flex items-center gap-2">
                      <Button
                        className="flex-1 text-xs font-semibold"
                        onClick={() =>
                          navigate("course-player", { courseId: course.id })
                        }
                      >
                        {completed ? (
                          <>
                            <RotateCcw className="w-4 h-4 me-1.5" />
                            {t("card.goToCourse")}
                          </>
                        ) : (
                          <>
                            <PlayCircle className="w-4 h-4 me-1.5" />
                            {t("myLearning.resume")}
                          </>
                        )}
                      </Button>

                      {completed && hasCert && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setTab("certificates")}
                          className="text-xs gap-1.5 border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
                        >
                          <Award className="w-4 h-4" />
                          <span>{t("myLearning.certificate.view")}</span>
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* ---------- TAB 2: Saved ---------- */}
        <TabsContent value="saved" className="space-y-6">
          {savedCourses.length === 0 ? (
            <Card className="border border-border">
              <CardContent className="py-12">
                <EmptyState
                  icon={Heart}
                  title={t("myLearning.empty.saved")}
                  description={
                    locale === "ar"
                      ? "يمكنك حفظ الدورات بالضغط على علامة القلب في أي دورة للرجوع إليها لاحقاً."
                      : "Tap the heart icon on any course to save it to your wishlist for later."
                  }
                  action={
                    <Button onClick={() => navigate("search")} className="gap-2 mt-2">
                      <Bookmark className="w-4 h-4" /> {t("myLearning.browse")}
                    </Button>
                  }
                />
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedCourses.map((course) => {
                const instructor = getInstructor(course.instructorId);
                const title = locale === "ar" ? course.titleAr : course.title;
                const instructorName = instructor
                  ? locale === "ar"
                    ? instructor.nameAr ?? instructor.name
                    : instructor.name
                  : "";

                return (
                  <Card
                    key={course.id}
                    className="gap-0 p-0 overflow-hidden flex flex-col justify-between hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 border border-border"
                  >
                    <div>
                      <button
                        type="button"
                        onClick={() =>
                          navigate("course-landing", { courseId: course.id })
                        }
                        aria-label={title}
                        className="block w-full text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
                      >
                        <CourseThumb course={course} />
                      </button>

                      <div className="p-5 flex flex-col gap-2.5">
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                          <span>{course.category}</span>
                          <span>•</span>
                          <span>{course.level}</span>
                        </div>

                        <h3 className="font-bold text-base text-foreground leading-snug line-clamp-2 hover:text-primary transition-colors">
                          {title}
                        </h3>
                        <p className="text-xs text-muted-foreground">{instructorName}</p>

                        <div className="flex items-baseline gap-2 pt-2">
                          <span className="text-lg font-bold text-foreground">
                            {formatPrice(course.price)}
                          </span>
                          {course.originalPrice && (
                            <span className="text-xs text-muted-foreground line-through">
                              {formatPrice(course.originalPrice)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="p-5 pt-0 flex gap-2">
                      <Button
                        className="flex-1 text-xs font-semibold gap-1.5"
                        onClick={() => moveToCart(course)}
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>{L("Move to cart", "انقل للسلة")}</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => removeSaved(course)}
                        aria-label={t("cart.remove")}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* ---------- TAB 3: Certificates ---------- */}
        <TabsContent value="certificates" className="space-y-6">
          {certsWithCourses.length === 0 ? (
            <Card className="border border-border">
              <CardContent className="py-12">
                <EmptyState
                  icon={Award}
                  title={t("myLearning.empty.certificates")}
                  description={
                    locale === "ar"
                      ? "أكمل كل دروس الدورة واجتز الاختبار النهائي لتحصل على شهادتك المعتمدة."
                      : "Complete all course lessons and pass the final quiz to earn your shareable verified certificate."
                  }
                  action={
                    <Button onClick={() => setTab("in-progress")} className="gap-2 mt-2">
                      <GraduationCap className="w-4 h-4" />
                      {t("myLearning.tab.inProgress")}
                    </Button>
                  }
                />
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {certsWithCourses.map(({ cert, course }) => {
                const title = locale === "ar" ? course.titleAr : course.title;
                return (
                  <Card
                    key={cert.id}
                    className="overflow-hidden border-2 border-amber-500/40 bg-gradient-to-br from-card via-accent/20 to-card hover:shadow-lg transition-all"
                  >
                    <div className="h-1.5 w-full bg-gradient-to-r from-amber-500/20 via-amber-500 to-amber-500/20" />
                    <div className="p-5 flex flex-col gap-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="w-9 h-9 rounded-full bg-primary/10 ring-2 ring-amber-500/60 flex items-center justify-center">
                            <GraduationCap className="w-5 h-5 text-primary" />
                          </div>
                          <span className="font-bold text-sm">{t("brand.name")}</span>
                        </div>
                        <Badge className="bg-amber-500 text-black hover:bg-amber-500 gap-1 font-bold text-xs">
                          <Award className="w-3.5 h-3.5" /> {t("myLearning.completed")}
                        </Badge>
                      </div>

                      <div className="text-center py-2">
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                          {t("landing.includes.certificate")}
                        </p>
                        <h3 className="font-bold text-foreground line-clamp-2 mt-1.5 leading-snug">
                          {title}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-2">
                          {t("myLearning.certificate.issued", {
                            date: formatDate(cert.issuedOn),
                          })}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-sm border-t border-border/60 pt-3">
                        <span className="text-muted-foreground">{L("Score", "الدرجة")}</span>
                        <Badge variant="secondary" className="font-bold tabular-nums">
                          {formatNumber(cert.score)}%
                        </Badge>
                      </div>
                    </div>

                    <div className="flex gap-2 px-5 pb-5">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-xs gap-1.5"
                        onClick={() => setViewingCert(cert)}
                      >
                        <Eye className="w-4 h-4" /> {t("myLearning.certificate.view")}
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1 text-xs gap-1.5"
                        onClick={() => downloadCert(course)}
                      >
                        <Download className="w-4 h-4" /> {t("myLearning.certificate.download")}
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* ---------- Certificate view dialog ---------- */}
      <Dialog
        open={viewingCert !== null}
        onOpenChange={(open) => {
          if (!open) setViewingCert(null);
        }}
      >
        <DialogContent
          aria-label={t("myLearning.certificate.view")}
          className="sm:max-w-2xl p-0 overflow-hidden"
        >
          <DialogTitle className="sr-only">
            {t("myLearning.certificate.view")}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {t("myLearning.certificate.view")}
          </DialogDescription>
          {viewingCert && viewingCourse && (
            <div className="rounded-lg border-4 border-amber-500/60 bg-gradient-to-br from-background via-accent/20 to-background p-6 sm:p-10">
              {/* Header */}
              <div className="flex flex-col items-center text-center gap-1">
                <div className="w-14 h-14 rounded-full bg-primary/10 ring-2 ring-amber-500 flex items-center justify-center mb-1">
                  <GraduationCap className="w-7 h-7 text-primary" />
                </div>
                <span className="font-bold text-lg">{t("brand.name")}</span>
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  {t("brand.tagline")}
                </span>
              </div>

              <Separator className="my-5 bg-amber-500/40" />

              {/* Body */}
              <div className="text-center space-y-2">
                <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  {t("landing.includes.certificate")}
                </p>
                <p className="text-sm text-muted-foreground mt-3">
                  {L("This is to certify that", "تشهد منصة ماستري بأن")}
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-foreground py-1">
                  {studentName}
                </p>
                <p className="text-sm text-muted-foreground">
                  {L("has successfully completed", "أتمّ بنجاح متطلبات الدورة واجتاز التقييم بدرجة امتياز في")}
                </p>
                <p className="text-lg sm:text-xl font-semibold text-primary leading-snug max-w-md mx-auto">
                  {locale === "ar" ? viewingCourse.titleAr : viewingCourse.title}
                </p>
              </div>

              <Separator className="my-5 bg-amber-500/40" />

              {/* Footer: meta + seal + signature */}
              <div className="grid grid-cols-3 items-end gap-4">
                <div className="text-xs text-muted-foreground space-y-0.5">
                  <p className="font-semibold text-foreground">
                    {t("myLearning.certificate.issued", {
                      date: formatDate(viewingCert.issuedOn),
                    })}
                  </p>
                  <p>
                    {L("Score", "الدرجة")}:{" "}
                    <span className="font-bold text-foreground tabular-nums">
                      {formatNumber(viewingCert.score)}%
                    </span>
                  </p>
                </div>

                <div className="flex flex-col items-center text-center">
                  <div className="w-14 h-14 rounded-full bg-amber-500/15 ring-2 ring-amber-500 flex items-center justify-center mb-1">
                    <Sparkles className="w-6 h-6 text-amber-500" />
                  </div>
                  <p className="text-[9px] uppercase tracking-wide text-muted-foreground">
                    {L("Official seal", "الختم الرسمي")}
                  </p>
                </div>

                <div className="flex flex-col items-end text-center">
                  <div className="w-full max-w-[8rem] border-t-2 border-foreground mb-1" />
                  <p className="text-[9px] uppercase tracking-wide text-muted-foreground">
                    {L("Signature", "التوقيع")}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CountPill({ n }: { n: number }) {
  if (n === 0) return null;
  return (
    <span className="ms-0.5 inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-primary/15 text-primary text-[11px] font-semibold tabular-nums">
      {n}
    </span>
  );
}
