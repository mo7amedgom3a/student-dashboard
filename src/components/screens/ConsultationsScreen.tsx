"use client";

import { useMemo, useState } from "react";
import { useAppStore } from "@/lib/store";
import { useI18n } from "@/hooks/use-i18n";
import {
  consultationInstructors,
  consultationCategories,
  getConsultationInstructor,
  getRecommendedConsultationInstructors,
} from "@/lib/mock-data";
import type { ConsultationInstructor, ScheduledConsultation } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { EmptyState } from "@/components/shared/EmptyState";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Calendar,
  Clock,
  Search,
  Star,
  Users,
  Video,
  Sparkles,
  CheckCircle2,
  CalendarCheck,
  XCircle,
  ExternalLink,
  ChevronRight,
  Filter,
  Check,
  CalendarDays,
  Briefcase,
  Languages,
} from "lucide-react";
import { cn } from "@/lib/utils";

type TabValue = "explore" | "scheduled";

export function ConsultationsScreen() {
  const { t, locale, formatPrice, formatDate, formatNumber, isRTL } = useI18n();
  const navigate = useAppStore((s) => s.navigate);
  const user = useAppStore((s) => s.user);
  const onboardingAnswers = useAppStore((s) => s.onboardingAnswers);
  const scheduledConsultations = useAppStore((s) => s.scheduledConsultations);
  const bookConsultation = useAppStore((s) => s.bookConsultation);
  const cancelConsultation = useAppStore((s) => s.cancelConsultation);
  const rescheduleConsultation = useAppStore((s) => s.rescheduleConsultation);
  const pushToast = useAppStore((s) => s.pushToast);
  const fireConfetti = useAppStore((s) => s.fireConfetti);

  const [activeTab, setActiveTab] = useState<TabValue>("explore");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedField, setSelectedField] = useState("all");

  // Booking Modal State
  const [bookingMentor, setBookingMentor] = useState<ConsultationInstructor | null>(null);
  const [bookingTopic, setBookingTopic] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [bookingNotes, setBookingNotes] = useState("");

  // Reschedule Modal State
  const [reschedulingSession, setReschedulingSession] = useState<ScheduledConsultation | null>(null);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");

  // Recommendations based on student profile
  const recommendedMentors = useMemo(() => {
    return getRecommendedConsultationInstructors({
      roleId: onboardingAnswers?.roleId,
      skillIds: onboardingAnswers?.skillIds,
    }).slice(0, 2);
  }, [onboardingAnswers]);

  // Filtered instructors
  const filteredInstructors = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return consultationInstructors.filter((inst) => {
      const matchesField = selectedField === "all" || inst.field === selectedField;
      if (!matchesField) return false;
      if (!q) return true;

      const haystack = [
        inst.name,
        inst.nameAr,
        inst.title,
        inst.titleAr,
        inst.bio,
        inst.bioAr,
        ...inst.specialties,
        ...inst.specialtiesAr,
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(q);
    });
  }, [searchQuery, selectedField]);

  // Upcoming scheduled count
  const upcomingCount = scheduledConsultations.filter((c) => c.status === "upcoming").length;

  // Handlers
  const handleOpenBooking = (mentor: ConsultationInstructor) => {
    setBookingMentor(mentor);
    setBookingTopic(
      locale === "ar" ? mentor.specialtiesAr[0] || "" : mentor.specialties[0] || ""
    );
    // Preselect date (2 days ahead)
    const futureDate = new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10);
    setBookingDate(futureDate);
    setBookingTime(mentor.timeSlots[0] || "10:00 AM");
    setBookingNotes("");
  };

  const handleConfirmBooking = () => {
    if (!bookingMentor) return;
    if (!bookingTopic.trim()) {
      pushToast({
        title: locale === "ar" ? "يرجى كتابة موضوع الاستشارة" : "Please specify a consultation topic",
        variant: "destructive",
      });
      return;
    }

    const studentName = user?.name || (locale === "ar" ? "طالب ماستري" : "Learner");
    const studentEmail = user?.email || "student@edify.demo";

    bookConsultation({
      instructorId: bookingMentor.id,
      studentName,
      studentEmail,
      topic: bookingTopic.trim(),
      date: bookingDate,
      timeSlot: bookingTime,
      durationMin: bookingMentor.sessionDurationMin,
      price: bookingMentor.pricePerSession,
      notes: bookingNotes.trim() || undefined,
    });

    setBookingMentor(null);
    fireConfetti();
    pushToast({
      title: t("consultations.bookedSuccess"),
      description: t("consultations.bookedSuccessDesc"),
      variant: "success",
    });
    setActiveTab("scheduled");
  };

  const handleCancelSession = (id: string) => {
    cancelConsultation(id);
    pushToast({
      title: t("consultations.cancelled"),
      variant: "default",
    });
  };

  const handleConfirmReschedule = () => {
    if (!reschedulingSession || !newDate || !newTime) return;
    rescheduleConsultation(reschedulingSession.id, newDate, newTime);
    setReschedulingSession(null);
    pushToast({
      title: locale === "ar" ? "تم تحديث موعد الاستشارة بنجاح" : "Consultation rescheduled successfully",
      variant: "success",
    });
  };

  return (
    <div className="view-enter mx-auto w-full max-w-7xl px-4 sm:px-6 py-6 lg:py-10 space-y-8">
      {/* Header */}
      <header className="space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-semibold">
          <Users className="h-3.5 w-3.5" />
          {t("consultations.title")}
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
          {t("consultations.title")}
        </h1>
        <p className="max-w-3xl text-sm sm:text-base text-muted-foreground">
          {t("consultations.subtitle")}
        </p>
      </header>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)} className="space-y-6">
        <TabsList className="h-auto flex-wrap p-1">
          <TabsTrigger value="explore" className="gap-2 py-2 px-4">
            <Users className="h-4 w-4 text-primary" />
            <span>{t("consultations.tab.explore")}</span>
            <span className="ms-1 rounded-full bg-muted px-2 py-0.5 text-xs font-semibold">
              {consultationInstructors.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="scheduled" className="gap-2 py-2 px-4">
            <CalendarCheck className="h-4 w-4 text-primary" />
            <span>{t("consultations.tab.scheduled")}</span>
            {upcomingCount > 0 && (
              <Badge className="ms-1 bg-primary text-primary-foreground text-xs font-bold">
                {upcomingCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* ---------------- Tab 1: Explore Mentors ---------------- */}
        <TabsContent value="explore" className="space-y-8">
          {/* Profile-based recommendations banner */}
          {recommendedMentors.length > 0 && (
            <section aria-label={t("consultations.recommended")} className="space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <h2 className="text-base font-semibold text-foreground">
                  {t("consultations.recommended")}
                </h2>
                <Badge variant="outline" className="text-[11px] border-primary/30 text-primary">
                  {t("consultations.recommendedSub")}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recommendedMentors.map((mentor) => {
                  const name = locale === "ar" ? mentor.nameAr : mentor.name;
                  const title = locale === "ar" ? mentor.titleAr : mentor.title;
                  const bio = locale === "ar" ? mentor.bioAr : mentor.bio;
                  return (
                    <Card
                      key={`rec-${mentor.id}`}
                      className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card overflow-hidden hover:shadow-md transition-all"
                    >
                      <CardContent className="p-5 flex flex-col sm:flex-row items-start gap-4">
                        <img
                          src={mentor.avatar}
                          alt={name}
                          className="h-16 w-16 rounded-full object-cover ring-2 ring-primary/40 shrink-0"
                        />
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="text-base font-bold text-foreground leading-tight">
                                {name}
                              </h3>
                              <p className="text-xs text-primary font-medium mt-0.5">{title}</p>
                            </div>
                            <div className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full shrink-0">
                              <Star className="h-3 w-3 fill-amber-500" />
                              <span>{mentor.rating.toFixed(2)}</span>
                            </div>
                          </div>

                          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                            {bio}
                          </p>

                          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/60">
                            <span className="text-sm font-bold text-foreground">
                              {formatPrice(mentor.pricePerSession)}{" "}
                              <span className="text-xs font-normal text-muted-foreground">
                                {t("consultations.perSession")} ({mentor.sessionDurationMin}m)
                              </span>
                            </span>
                            <Button size="sm" onClick={() => handleOpenBooking(mentor)} className="gap-1.5">
                              <CalendarCheck className="h-3.5 w-3.5" />
                              {t("consultations.bookSession")}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </section>
          )}

          {/* Search & Category Filter */}
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("consultations.searchPlaceholder")}
                  className="ps-9 pe-4"
                />
              </div>

              {/* Clear filters */}
              {(searchQuery || selectedField !== "all") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedField("all");
                  }}
                  className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                >
                  <XCircle className="h-3.5 w-3.5" />
                  {t("consultations.filter.clear")}
                </Button>
              )}
            </div>

            {/* Field Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
              {consultationCategories.map((cat) => {
                const isActive = selectedField === cat.id;
                const label = locale === "ar" ? cat.labelAr : cat.label;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedField(cat.id)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-all",
                      isActive
                        ? "border-primary bg-primary text-primary-foreground shadow-sm"
                        : "border-border bg-card text-foreground hover:border-primary/40 hover:bg-accent/60"
                    )}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Mentors Grid */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-foreground">
                {t("consultations.allResults")}
              </h2>
              <span className="text-xs text-muted-foreground">
                {filteredInstructors.length} {locale === "ar" ? "خبير متاح" : "mentors available"}
              </span>
            </div>

            {filteredInstructors.length === 0 ? (
              <EmptyState
                icon={Users}
                title={t("consultations.noResults")}
                description={t("consultations.filter.clear")}
                action={
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedField("all");
                    }}
                  >
                    {t("consultations.filter.clear")}
                  </Button>
                }
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredInstructors.map((mentor) => {
                  const name = locale === "ar" ? mentor.nameAr : mentor.name;
                  const title = locale === "ar" ? mentor.titleAr : mentor.title;
                  const bio = locale === "ar" ? mentor.bioAr : mentor.bio;
                  const specialties = locale === "ar" ? mentor.specialtiesAr : mentor.specialties;
                  const days = locale === "ar" && mentor.availableDaysAr ? mentor.availableDaysAr : mentor.availableDays;

                  return (
                    <Card
                      key={mentor.id}
                      className="flex flex-col justify-between overflow-hidden hover:shadow-lg transition-all border border-border"
                    >
                      <CardHeader className="p-5 pb-3 space-y-3">
                        <div className="flex items-start gap-3">
                          <img
                            src={mentor.avatar}
                            alt={name}
                            className="h-14 w-14 rounded-full object-cover ring-2 ring-border shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <h3 className="font-bold text-foreground text-base leading-snug truncate">
                              {name}
                            </h3>
                            <p className="text-xs text-muted-foreground font-medium line-clamp-1">
                              {title}
                            </p>
                            <div className="flex items-center gap-2 mt-1.5 text-xs">
                              <span className="flex items-center gap-1 font-bold text-amber-500">
                                <Star className="h-3 w-3 fill-amber-500" />
                                {mentor.rating.toFixed(2)}
                              </span>
                              <span className="text-muted-foreground">
                                ({formatNumber(mentor.reviewsCount)} {locale === "ar" ? "تقييم" : "reviews"})
                              </span>
                            </div>
                          </div>
                        </div>

                        <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                          {bio}
                        </p>

                        {/* Specialties badges */}
                        <div className="flex flex-wrap gap-1 pt-1">
                          {specialties.slice(0, 3).map((sp, idx) => (
                            <Badge
                              key={idx}
                              variant="secondary"
                              className="text-[10px] font-normal px-2 py-0.5"
                            >
                              {sp}
                            </Badge>
                          ))}
                        </div>
                      </CardHeader>

                      <CardContent className="p-5 pt-3 space-y-4">
                        <div className="space-y-1.5 text-xs text-muted-foreground border-t border-border pt-3">
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1">
                              <Briefcase className="h-3 w-3 text-muted-foreground" />
                              {t("consultations.experience", { n: mentor.experienceYears })}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              {mentor.sessionDurationMin} {locale === "ar" ? "دقيقة" : "min"}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 truncate">
                            <CalendarDays className="h-3 w-3 text-muted-foreground shrink-0" />
                            <span className="truncate">{days.join(" · ")}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-2 pt-2">
                          <div>
                            <span className="text-lg font-bold text-foreground">
                              {formatPrice(mentor.pricePerSession)}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {" "}
                              {t("consultations.perSession")}
                            </span>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleOpenBooking(mentor)}
                            className="gap-1.5 font-medium"
                          >
                            <CalendarCheck className="h-3.5 w-3.5" />
                            {t("consultations.bookSession")}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </section>
        </TabsContent>

        {/* ---------------- Tab 2: My Scheduled Sessions ---------------- */}
        <TabsContent value="scheduled" className="space-y-6">
          {scheduledConsultations.length === 0 ? (
            <EmptyState
              icon={CalendarCheck}
              title={t("consultations.empty.scheduled")}
              description={t("consultations.empty.scheduledDesc")}
              action={
                <Button onClick={() => setActiveTab("explore")}>
                  {t("consultations.tab.explore")}
                </Button>
              }
            />
          ) : (
            <div className="space-y-4">
              {scheduledConsultations.map((session) => {
                const mentor = getConsultationInstructor(session.instructorId);
                const mentorName = mentor
                  ? locale === "ar"
                    ? mentor.nameAr
                    : mentor.name
                  : locale === "ar"
                  ? "مستشار ماستري"
                  : "Mentor";
                const mentorTitle = mentor
                  ? locale === "ar"
                    ? mentor.titleAr
                    : mentor.title
                  : "";
                const isUpcoming = session.status === "upcoming";
                const isCompleted = session.status === "completed";
                const isCancelled = session.status === "cancelled";

                return (
                  <Card
                    key={session.id}
                    className={cn(
                      "overflow-hidden transition-all border",
                      isUpcoming && "border-primary/40 bg-card",
                      isCompleted && "border-border bg-muted/20 opacity-85",
                      isCancelled && "border-destructive/20 bg-destructive/5 opacity-70"
                    )}
                  >
                    <CardContent className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      {/* Left: Mentor info & Topic */}
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        {mentor && (
                          <img
                            src={mentor.avatar}
                            alt={mentorName}
                            className="h-12 w-12 rounded-full object-cover ring-2 ring-border shrink-0 mt-0.5"
                          />
                        )}
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-foreground text-base leading-snug">
                              {session.topic}
                            </h3>
                            <Badge
                              className={cn(
                                "text-[11px] font-semibold",
                                isUpcoming && "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
                                isCompleted && "bg-muted text-muted-foreground",
                                isCancelled && "bg-destructive/15 text-destructive border-destructive/20"
                              )}
                            >
                              {isUpcoming && t("consultations.status.upcoming")}
                              {isCompleted && t("consultations.status.completed")}
                              {isCancelled && t("consultations.status.cancelled")}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {t("consultations.mentor")}:{" "}
                            <span className="font-semibold text-foreground">{mentorName}</span>
                            {mentorTitle && ` (${mentorTitle})`}
                          </p>
                          {session.notes && (
                            <p className="text-xs text-muted-foreground/80 italic line-clamp-1">
                              &ldquo;{session.notes}&rdquo;
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Middle: Timing */}
                      <div className="flex md:flex-col items-center md:items-start gap-3 md:gap-1 text-xs text-muted-foreground shrink-0 border-y md:border-y-0 md:border-s md:border-border py-2 md:py-0 md:ps-4">
                        <div className="flex items-center gap-1.5 font-medium text-foreground">
                          <Calendar className="h-3.5 w-3.5 text-primary" />
                          <span>{formatDate(session.date)}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-primary" />
                          <span>
                            {session.timeSlot} ({session.durationMin}m)
                          </span>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-2 w-full md:w-auto shrink-0 justify-end pt-2 md:pt-0">
                        {isUpcoming && (
                          <>
                            {session.meetingUrl && (
                              <Button
                                size="sm"
                                className="gap-1.5 bg-primary text-primary-foreground font-medium"
                                asChild
                              >
                                <a
                                  href={session.meetingUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <Video className="h-3.5 w-3.5" />
                                  {t("consultations.join")}
                                </a>
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setReschedulingSession(session);
                                setNewDate(session.date);
                                setNewTime(session.timeSlot);
                              }}
                            >
                              {t("consultations.reschedule")}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => handleCancelSession(session.id)}
                            >
                              {t("consultations.cancel")}
                            </Button>
                          </>
                        )}
                        {isCompleted && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <CheckCircle2 className="h-4 w-4 text-success" />
                            {t("consultations.status.completed")}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* ---------------- Booking Dialog ---------------- */}
      <Dialog open={bookingMentor !== null} onOpenChange={(open) => !open && setBookingMentor(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarCheck className="h-5 w-5 text-primary" />
              {t("consultations.modal.title")}
            </DialogTitle>
            <DialogDescription>
              {bookingMentor &&
                (locale === "ar" ? bookingMentor.titleAr : bookingMentor.title)}
            </DialogDescription>
          </DialogHeader>

          {bookingMentor && (
            <div className="space-y-4 py-2">
              {/* Mentor mini card */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border">
                <img
                  src={bookingMentor.avatar}
                  alt={bookingMentor.name}
                  className="h-11 w-11 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm text-foreground">
                    {locale === "ar" ? bookingMentor.nameAr : bookingMentor.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatPrice(bookingMentor.pricePerSession)} / {bookingMentor.sessionDurationMin} {locale === "ar" ? "دقيقة" : "min"}
                  </div>
                </div>
                <Badge variant="secondary" className="gap-1 text-xs">
                  <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                  {bookingMentor.rating.toFixed(2)}
                </Badge>
              </div>

              {/* Topic */}
              <div className="space-y-1.5">
                <Label htmlFor="booking-topic" className="text-xs font-semibold">
                  {t("consultations.modal.topic")} *
                </Label>
                <Input
                  id="booking-topic"
                  value={bookingTopic}
                  onChange={(e) => setBookingTopic(e.target.value)}
                  placeholder={t("consultations.modal.topicPlaceholder")}
                />
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="booking-date" className="text-xs font-semibold">
                    {t("consultations.modal.selectDate")}
                  </Label>
                  <Input
                    id="booking-date"
                    type="date"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    min={new Date().toISOString().slice(0, 10)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="booking-time" className="text-xs font-semibold">
                    {t("consultations.modal.selectTime")}
                  </Label>
                  <select
                    id="booking-time"
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {bookingMentor.timeSlots.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <Label htmlFor="booking-notes" className="text-xs font-semibold">
                  {t("consultations.modal.notes")}
                </Label>
                <Textarea
                  id="booking-notes"
                  rows={3}
                  value={bookingNotes}
                  onChange={(e) => setBookingNotes(e.target.value)}
                  placeholder={t("consultations.modal.notesPlaceholder")}
                  className="text-xs"
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setBookingMentor(null)}>
              {t("common.cancel")}
            </Button>
            <Button onClick={handleConfirmBooking} className="gap-1.5 font-semibold">
              <CalendarCheck className="h-4 w-4" />
              {t("consultations.modal.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ---------------- Reschedule Dialog ---------------- */}
      <Dialog
        open={reschedulingSession !== null}
        onOpenChange={(open) => !open && setReschedulingSession(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              {t("consultations.reschedule")}
            </DialogTitle>
            <DialogDescription>
              {reschedulingSession?.topic}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">{t("consultations.modal.selectDate")}</Label>
              <Input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                min={new Date().toISOString().slice(0, 10)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">{t("consultations.modal.selectTime")}</Label>
              <Input
                type="text"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                placeholder="e.g. 03:00 PM"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setReschedulingSession(null)}>
              {t("common.cancel")}
            </Button>
            <Button onClick={handleConfirmReschedule}>
              {t("consultations.reschedule")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
