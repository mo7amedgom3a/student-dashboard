"use client";

import { useMemo, useState } from "react";
import { useAppStore } from "@/lib/store";
import { useI18n } from "@/hooks/use-i18n";
import { courses, getCourse, getAllLessons } from "@/lib/mock-data";
import type { Certificate, Course } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { EmptyState } from "@/components/shared/EmptyState";
import { CourseThumb } from "@/components/shared/CourseThumb";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Award,
  Download,
  Eye,
  Share2,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  Clock,
  PlayCircle,
  ShieldCheck,
  FileCheck,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

type TabValue = "earned" | "in-progress" | "available";

export function CertificationsScreen() {
  const { t, locale, formatDate, formatNumber, isRTL } = useI18n();
  const navigate = useAppStore((s) => s.navigate);
  const user = useAppStore((s) => s.user);
  const certificates = useAppStore((s) => s.certificates);
  const enrolledCourseIds = useAppStore((s) => s.enrolledCourseIds);
  const getCourseProgress = useAppStore((s) => s.getCourseProgress);
  const pushToast = useAppStore((s) => s.pushToast);

  const [tab, setTab] = useState<TabValue>("earned");
  const [viewingCert, setViewingCert] = useState<Certificate | null>(null);

  const studentName = user?.name ?? (locale === "ar" ? "طالب ماستري" : "Learner");

  // Resolved earned certificates
  const certsWithCourses = useMemo(
    () =>
      certificates
        .map((cert) => ({ cert, course: getCourse(cert.courseId) }))
        .filter((x): x is { cert: Certificate; course: Course } => Boolean(x.course)),
    [certificates]
  );

  // In-progress courses (enrolled but not yet certified)
  const inProgressCourses = useMemo(() => {
    return enrolledCourseIds
      .filter((cid) => !certificates.some((cert) => cert.courseId === cid))
      .map((cid) => getCourse(cid))
      .filter((c): c is Course => Boolean(c));
  }, [enrolledCourseIds, certificates]);

  // Available courses with certificates that student hasn't enrolled in yet
  const availableCourses = useMemo(() => {
    return courses.filter(
      (c) => c.includes?.certificate && !enrolledCourseIds.includes(c.id)
    );
  }, [enrolledCourseIds]);

  // Handlers
  const handleDownloadCert = (course: Course) => {
    pushToast({
      title: locale === "ar" ? "جاري تحميل الشهادة…" : "Downloading verified certificate PDF…",
      description: locale === "ar" ? course.titleAr : course.title,
      variant: "success",
    });
  };

  const handleShareCert = (course: Course) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(
        `https://edify.learn/verify/cert-${course.id}-${Date.now().toString(36)}`
      );
    }
    pushToast({
      title: locale === "ar" ? "تم نسخ رابط التحقق من الشهادة" : "Certificate verification link copied!",
      variant: "success",
    });
  };

  const viewingCourse = viewingCert ? getCourse(viewingCert.courseId) : undefined;

  return (
    <div className="view-enter mx-auto w-full max-w-7xl px-4 sm:px-6 py-6 lg:py-10 space-y-8">
      {/* Header */}
      <header className="space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-semibold">
          <Award className="h-3.5 w-3.5 text-primary" />
          {t("certifications.title")}
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
          {t("certifications.title")}
        </h1>
        <p className="max-w-2xl text-sm sm:text-base text-muted-foreground">
          {t("certifications.subtitle")}
        </p>
      </header>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={(v) => setTab(v as TabValue)} className="space-y-6">
        <TabsList className="h-auto flex-wrap p-1">
          <TabsTrigger value="earned" className="gap-2 py-2 px-4">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span>{t("certifications.tab.earned")}</span>
            <Badge variant="secondary" className="ms-1 text-xs">
              {certsWithCourses.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="in-progress" className="gap-2 py-2 px-4">
            <Clock className="h-4 w-4 text-primary" />
            <span>{t("certifications.tab.inProgress")}</span>
            {inProgressCourses.length > 0 && (
              <Badge variant="outline" className="ms-1 text-xs">
                {inProgressCourses.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="available" className="gap-2 py-2 px-4">
            <Award className="h-4 w-4 text-primary" />
            <span>{t("certifications.tab.available")}</span>
          </TabsTrigger>
        </TabsList>

        {/* ---------------- Tab 1: Earned Certificates ---------------- */}
        <TabsContent value="earned" className="space-y-6">
          {certsWithCourses.length === 0 ? (
            <EmptyState
              icon={Award}
              title={t("certifications.empty.earned")}
              description={t("certifications.empty.earnedDesc")}
              action={
                <Button onClick={() => setTab("in-progress")}>
                  {t("certifications.tab.inProgress")}
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {certsWithCourses.map(({ cert, course }) => {
                const title = locale === "ar" ? course.titleAr : course.title;
                const issuedDate = formatDate(cert.issuedOn);

                return (
                  <Card
                    key={cert.id}
                    className="overflow-hidden border-2 border-amber-500/40 bg-gradient-to-br from-card via-amber-500/5 to-card hover:shadow-lg transition-all"
                  >
                    <div className="h-1.5 w-full bg-gradient-to-r from-amber-500/20 via-amber-500 to-amber-500/20" />
                    <CardHeader className="p-5 pb-3 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-amber-500/15 ring-2 ring-amber-500/40 flex items-center justify-center">
                            <GraduationCap className="w-4 h-4 text-amber-500" />
                          </div>
                          <span className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                            {t("brand.name")} Verified
                          </span>
                        </div>
                        <Badge className="bg-amber-500 text-black hover:bg-amber-500 font-bold text-[11px] gap-1">
                          <Award className="w-3 h-3" />
                          {cert.score}% Score
                        </Badge>
                      </div>

                      <div className="space-y-1">
                        <h3 className="font-bold text-base text-foreground line-clamp-2 leading-snug">
                          {title}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {t("myLearning.certificate.issued", { date: issuedDate })}
                        </p>
                      </div>
                    </CardHeader>

                    <CardContent className="p-5 pt-0 space-y-3">
                      <div className="rounded-md bg-muted/40 p-2.5 text-xs text-muted-foreground space-y-1">
                        <div className="flex justify-between">
                          <span>Recipient:</span>
                          <span className="font-semibold text-foreground">{studentName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Verification ID:</span>
                          <span className="font-mono text-[11px] text-foreground">{cert.id}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-xs gap-1.5"
                          onClick={() => setViewingCert(cert)}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          {t("certifications.view")}
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1 text-xs gap-1.5"
                          onClick={() => handleDownloadCert(course)}
                        >
                          <Download className="w-3.5 h-3.5" />
                          {t("certifications.download")}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={() => handleShareCert(course)}
                          title={t("certifications.share")}
                        >
                          <Share2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* ---------------- Tab 2: In Progress ---------------- */}
        <TabsContent value="in-progress" className="space-y-4">
          {inProgressCourses.length === 0 ? (
            <EmptyState
              icon={CheckCircle2}
              title={locale === "ar" ? "لا توجد دورات قيد التحصيل" : "No in-progress certificates"}
              description={
                locale === "ar"
                  ? "لقد أتممت جميع الشهادات أو يمكنك استكشاف دورات جديدة متاحة!"
                  : "All enrolled courses are certified, or you can explore new certificate programs!"
              }
              action={
                <Button onClick={() => setTab("available")}>
                  {t("certifications.tab.available")}
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {inProgressCourses.map((course) => {
                const pct = getCourseProgress(course.id);
                const title = locale === "ar" ? course.titleAr : course.title;

                return (
                  <Card key={course.id} className="overflow-hidden border border-border hover:shadow-md transition-all">
                    <button
                      type="button"
                      onClick={() => navigate("course-player", { courseId: course.id })}
                      className="block w-full text-start"
                    >
                      <CourseThumb course={course} showPlay />
                    </button>
                    <CardContent className="p-4 space-y-3">
                      <div>
                        <h3 className="font-bold text-sm text-foreground line-clamp-2 leading-snug">
                          {title}
                        </h3>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {course.category} · {course.totalLessons} {locale === "ar" ? "درس" : "lessons"}
                        </p>
                      </div>

                      {/* Progress bar */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground font-medium">
                            {pct}% completed
                          </span>
                          <span className="text-[11px] text-primary font-semibold">
                            Quiz score ≥ 80% needed
                          </span>
                        </div>
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                        </div>
                      </div>

                      <div className="pt-1">
                        <Button
                          size="sm"
                          className="w-full gap-1.5"
                          onClick={() => navigate("course-player", { courseId: course.id })}
                        >
                          <PlayCircle className="w-4 h-4" />
                          {t("certifications.continueCourse")}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* ---------------- Tab 3: Available Certificates ---------------- */}
        <TabsContent value="available" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {availableCourses.map((course) => {
              const title = locale === "ar" ? course.titleAr : course.title;

              return (
                <Card key={course.id} className="overflow-hidden border border-border hover:shadow-md transition-all">
                  <button
                    type="button"
                    onClick={() => navigate("course-landing", { courseId: course.id })}
                    className="block w-full text-start"
                  >
                    <CourseThumb course={course} />
                  </button>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center gap-1 text-[11px] text-amber-500 font-semibold">
                      <Award className="h-3.5 w-3.5" />
                      {t("landing.includes.certificate")}
                    </div>
                    <h3 className="font-bold text-sm text-foreground line-clamp-2 leading-snug">
                      {title}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {locale === "ar" ? course.subtitleAr : course.subtitle}
                    </p>

                    <div className="pt-2 flex items-center justify-between gap-2 border-t border-border">
                      <span className="text-xs font-semibold text-muted-foreground">
                        {course.totalHours}h · {course.level}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate("course-landing", { courseId: course.id })}
                      >
                        {t("certifications.startCourse")}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* ---------------- Certificate Document Dialog ---------------- */}
      <Dialog open={viewingCert !== null} onOpenChange={(open) => !open && setViewingCert(null)}>
        <DialogContent className="sm:max-w-2xl p-0 overflow-hidden">
          <DialogTitle className="sr-only">{t("certifications.view")}</DialogTitle>
          <DialogDescription className="sr-only">{t("certifications.view")}</DialogDescription>
          {viewingCert && viewingCourse && (
            <div className="rounded-lg border-4 border-amber-500/60 bg-gradient-to-br from-background via-amber-500/5 to-background p-6 sm:p-10">
              <div className="flex flex-col items-center text-center gap-1">
                <div className="w-14 h-14 rounded-full bg-primary/10 ring-2 ring-amber-500 flex items-center justify-center mb-1">
                  <GraduationCap className="w-7 h-7 text-primary" />
                </div>
                <span className="font-bold text-lg text-foreground">{t("brand.name")}</span>
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  {t("brand.tagline")}
                </span>
              </div>

              <Separator className="my-5 bg-amber-500/40" />

              <div className="text-center space-y-2">
                <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  {t("landing.includes.certificate")}
                </p>
                <p className="text-sm text-muted-foreground mt-3">
                  {locale === "ar" ? "تشهد منصة ماستري بأن" : "This is to certify that"}
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-foreground py-1">
                  {studentName}
                </p>
                <p className="text-sm text-muted-foreground">
                  {locale === "ar" ? "أتمّ بنجاح متطلبات الدورة واجتاز التقييم بدرجة امتياز في" : "has successfully completed the curriculum and final assessment for"}
                </p>
                <p className="text-lg sm:text-xl font-semibold text-primary leading-snug max-w-md mx-auto">
                  {locale === "ar" ? viewingCourse.titleAr : viewingCourse.title}
                </p>
              </div>

              <Separator className="my-5 bg-amber-500/40" />

              <div className="grid grid-cols-3 items-end gap-4">
                <div className="text-xs text-muted-foreground space-y-0.5">
                  <p className="font-semibold text-foreground">
                    {t("myLearning.certificate.issued", { date: formatDate(viewingCert.issuedOn) })}
                  </p>
                  <p>
                    Score: <span className="font-bold text-foreground">{viewingCert.score}%</span>
                  </p>
                </div>

                <div className="flex flex-col items-center text-center">
                  <div className="w-14 h-14 rounded-full bg-amber-500/15 ring-2 ring-amber-500 flex items-center justify-center mb-1">
                    <Sparkles className="w-6 h-6 text-amber-500" />
                  </div>
                  <p className="text-[9px] uppercase tracking-wide text-muted-foreground">
                    Official Seal
                  </p>
                </div>

                <div className="flex flex-col items-end text-center">
                  <div className="w-full max-w-[8rem] border-t-2 border-foreground mb-1" />
                  <p className="text-[9px] uppercase tracking-wide text-muted-foreground">
                    Verified Signature
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
