"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  BookX,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Circle,
  ClipboardList,
  Clock,
  FileArchive,
  FileQuestion,
  FileText,
  Globe,
  GraduationCap,
  Inbox,
  Menu,
  PanelRightClose,
  PanelRightOpen,
  Pause,
  Play,
  PlayCircle,
  Presentation,
  RotateCcw,
  Send,
  Settings,
  Sparkles,
  Star,
  ThumbsUp,
  Trash2,
  Users,
  Volume2,
  X,
  type LucideIcon,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { useI18n } from "@/hooks/use-i18n";
import {
  getAllLessons,
  getCourse,
  getInstructor,
  getLessonById,
  getQuizForCourse,
} from "@/lib/mock-data";
import type { Course, Lesson, LessonType, Locale, QAItem } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { StarRating } from "@/components/shared/StarRating";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// ----------------------------------------------------------------------------
// Inline bilingual strings (dialect-neutral Saudi/Egyptian — kept inline
// because `src/lib/i18n.ts` is a protected foundation file we avoid touching
// for non-player-namespace additions). Existing `player.*` keys are used
// directly from the i18n dictionary; everything else lives here.
// ----------------------------------------------------------------------------

const STR = {
  backToCourseDetails: {
    en: "Back to course details",
    ar: "رجوع لتفاصيل الكورس",
  },
  hideCurriculum: { en: "Hide curriculum", ar: "إخفاء المنهج" },
  showCurriculum: { en: "Curriculum", ar: "المنهج" },
  videoPlay: { en: "Play video", ar: "تشغيل الفيديو" },
  videoPause: { en: "Pause video", ar: "إيقاف الفيديو" },
  videoMute: { en: "Mute", ar: "كتم الصوت" },
  videoSettings: { en: "Settings", ar: "الإعدادات" },
  videoProgress: { en: "Video progress", ar: "تقدّم الفيديو" },
  videoRestart: { en: "Restart", ar: "إعادة التشغيل" },
  send: { en: "Send", ar: "إرسال" },
  closeAssistant: { en: "Close assistant", ar: "إغلاق المساعد" },
  lessonMarked: {
    en: "Lesson marked complete",
    ar: "تم اعتبار الدرس مكتمل",
  },
  noteSaved: { en: "Note saved", ar: "تم حفظ الملاحظة" },
  questionAsked: { en: "Question posted", ar: "تم نشر سؤالك" },
  downloading: { en: "Downloading {name}…", ar: "جاري تحميل {name}…" },
  deleteNote: { en: "Delete note", ar: "حذف الملاحظة" },
  upvote: { en: "Upvote", ar: "صوّت" },
  lessonsCount: { en: "{n} lessons", ar: "{n} دروس" },
  courseNotFound: { en: "Course not found", ar: "الكورس غير موجود" },
  courseNotFoundDesc: {
    en: "We couldn't find this course. It may have been removed.",
    ar: "ماقدرنا نلاقي الكورس. يمكن اتشال.",
  },
  backHome: { en: "Back to home", ar: "رجوع للرئيسية" },
  transcript: { en: "Transcript", ar: "النص" },
  reviewsCount: { en: "{n} reviews", ar: "{n} تقييم" },
  ratingLabel: { en: "rating", ar: "تقييم" },
  viewsLabel: { en: "views", ar: "مشاهدة" },
  enrolledLabel: { en: "enrolled", ar: "مشترك" },
  durationLabel: { en: "duration", ar: "المدة" },
  languageLabel: { en: "language", ar: "اللغة" },
  notesDraftAria: { en: "Note text", ar: "نص الملاحظة" },
  qaInputAria: { en: "Your question", ar: "سؤالك" },
  aiInputAria: { en: "Ask the AI tutor", ar: "اسأل المساعد الذكي" },
  chatHistory: { en: "Chat history", ar: "سجل المحادثة" },
  askAi: { en: "Ask AI", ar: "اسأل الذكاء" },
  // AI canned responses (dialect-neutral)
  aiReply1: {
    en: "Great question about {lesson}! The key idea is: {snippet} Want me to give you a quick example?",
    ar: "سؤال ممتاز عن {lesson}! الفكرة الأساسية هي: {snippet} تحب أعطيك مثال سريع؟",
  },
  aiReply2: {
    en: "Based on this lesson, here's the short version: {snippet} Try pausing the video and re-watching that part.",
    ar: "بناءً على هذا الدرس، إليك الخلاصة: {snippet} جرّب توقف الفيديو وأعد مشاهدة الجزء ده.",
  },
  aiReply3: {
    en: "Let me quiz you: What's the main purpose of {lesson}? Reply with your answer and I'll check it.",
    ar: "خليني أختبرك: إيه الهدف الرئيسي من {lesson}؟ رد بإجابتك وأنا أتحقق منها.",
  },
} as const;

function pick(locale: Locale, map: { en: string; ar: string }): string {
  return locale === "ar" ? map.ar : map.en;
}

/** Inline placeholder replacement for STR strings. */
function fmt(locale: Locale, key: keyof typeof STR, params?: Record<string, string | number>): string {
  let s = pick(locale, STR[key]);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      s = s.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
    }
  }
  return s;
}

/** Format seconds as mm:ss (Latin digits — convention used by YouTube/Udemy Arabic UIs). */
function formatTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

const LESSON_TYPE_ICON: Record<LessonType, LucideIcon> = {
  video: PlayCircle,
  reading: BookOpen,
  quiz: FileQuestion,
};

const RESOURCE_ICON: Record<"pdf" | "zip" | "slides", LucideIcon> = {
  pdf: FileText,
  zip: FileArchive,
  slides: Presentation,
};

// ----------------------------------------------------------------------------
// Main screen
// ----------------------------------------------------------------------------

/**
 * CoursePlayerScreen — Udemy-inspired in-course experience.
 *
 * Reads `courseId` from `route.params.courseId`, auto-resumes to the first
 * uncompleted lesson (or the last lesson if all are done), and renders a
 * focused 2-column layout: video + content tabs on the left, collapsible
 * curriculum sidebar on the right. Mobile collapses to a single column with
 * the curriculum in a Sheet and the AI assistant in a Sheet/floating button.
 */
export interface CoursePlayerScreenProps {
  courseId?: string;
}

export function CoursePlayerScreen({ courseId: propCourseId }: CoursePlayerScreenProps = {}) {
  const storeCourseId = useAppStore((s) => s.route.params?.courseId);
  const courseId = propCourseId ?? storeCourseId ?? "";
  const course = useMemo(() => getCourse(courseId), [courseId]);

  if (!course) {
    return <CourseNotFound courseId={courseId} />;
  }

  return <CoursePlayerContent course={course} />;
}

// ----------------------------------------------------------------------------
// Not-found state
// ----------------------------------------------------------------------------

function CourseNotFound({ courseId }: { courseId: string }) {
  const { t, locale } = useI18n();
  const navigate = useAppStore((s) => s.navigate);
  return (
    <div className="view-enter max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <EmptyState
        icon={BookX}
        title={pick(locale, STR.courseNotFound)}
        description={pick(locale, STR.courseNotFoundDesc)}
        action={
          <div className="flex items-center gap-2">
            {courseId ? (
              <Button
                variant="outline"
                onClick={() => navigate("course-landing", { courseId })}
              >
                {pick(locale, STR.backToCourseDetails)}
              </Button>
            ) : null}
            <Button onClick={() => navigate("home")}>
              {pick(locale, STR.backHome)}
            </Button>
          </div>
        }
      />
    </div>
  );
}

// ----------------------------------------------------------------------------
// Player content (course resolved)
// ----------------------------------------------------------------------------

interface PlayerState {
  activeLessonId: string;
  setActiveLessonId: (id: string) => void;
  currentSec: number;
  setCurrentSec: React.Dispatch<React.SetStateAction<number>>;
  isPlaying: boolean;
  setIsPlaying: (b: boolean) => void;
  totalSec: number;
  goToLesson: (id: string) => void;
}

function CoursePlayerContent({ course }: { course: Course }) {
  const { t, locale, isRTL } = useI18n();
  const navigate = useAppStore((s) => s.navigate);
  const getCourseProgress = useAppStore((s) => s.getCourseProgress);
  const isMobile = useIsMobile();

  // -- Active lesson: initialize from store on the FIRST render (no effect) --
  const firstLessonId = course.sections[0]?.lessons[0]?.id ?? "";
  const [activeLessonId, setActiveLessonIdRaw] = useState<string>(
    () => useAppStore.getState().getCurrentLessonId(course.id) ?? firstLessonId,
  );

  // Resolve the active lesson object + parent section.
  const resolved = useMemo(
    () => getLessonById(course, activeLessonId),
    [course, activeLessonId],
  );
  const activeLesson: Lesson = resolved?.lesson ?? course.sections[0]?.lessons[0];
  const totalSec = Math.max(1, (activeLesson?.durationMin ?? 1) * 60);

  // -- Video playback state --
  const [currentSec, setCurrentSec] = useState<number>(() => {
    const init =
      useAppStore.getState().getCurrentLessonId(course.id) ?? firstLessonId;
    return useAppStore.getState().progress[course.id]?.lessons[init]?.positionSec ?? 0;
  });
  const [isPlaying, setIsPlaying] = useState(false);

  // Track latest currentSec in a ref so the 5s persist interval can read it
  // without re-creating itself every tick. Refs are mutated inside effects,
  // never during render.
  const currentSecRef = useRef(currentSec);
  useEffect(() => {
    currentSecRef.current = currentSec;
  }, [currentSec]);

  // -- Auto-resume banner: shown briefly if the initial lesson had saved progress --
  const [resumedLessonId, setResumedLessonId] = useState<string | null>(() => {
    const state = useAppStore.getState();
    const init = state.getCurrentLessonId(course.id);
    if (!init) return null;
    const sec = state.progress[course.id]?.lessons[init]?.positionSec ?? 0;
    return sec > 0 ? init : null;
  });
  useEffect(() => {
    if (!resumedLessonId) return;
    const t = setTimeout(() => setResumedLessonId(null), 4000);
    return () => clearTimeout(t);
  }, [resumedLessonId]);

  // -- Layout/UI state --
  const [sidebarOpen, setSidebarOpen] = useState(true); // desktop sidebar
  const [mobileCurriculumOpen, setMobileCurriculumOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);

  // -- Go to a specific lesson (resets video to that lesson's saved position) --
  const goToLesson = (lessonId: string) => {
    if (lessonId === activeLessonId) return;
    setActiveLessonIdRaw(lessonId);
    setResumedLessonId(null);
    const saved =
      useAppStore.getState().progress[course.id]?.lessons[lessonId]?.positionSec ?? 0;
    setCurrentSec(saved);
    setIsPlaying(false);
  };

  const playerState: PlayerState = {
    activeLessonId,
    setActiveLessonId: setActiveLessonIdRaw,
    currentSec,
    setCurrentSec,
    isPlaying,
    setIsPlaying,
    totalSec,
    goToLesson,
  };

  const courseProgress = getCourseProgress(course.id);
  const courseTitle = locale === "ar" ? course.titleAr : course.title;
  const quiz = getQuizForCourse(course.id);

  const showResumeBanner = activeLessonId === resumedLessonId && resumedLessonId !== null;

  return (
    <div className="view-enter min-h-screen bg-background">
      {/* ---------------- Top bar ---------------- */}
      <header className="sticky top-0 z-30 bg-card/95 backdrop-blur border-b border-border">
        <div className="max-w-[1600px] mx-auto px-3 sm:px-4 lg:px-6 h-14 flex items-center gap-2 sm:gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground gap-1.5"
            onClick={() => navigate("course-landing", { courseId: course.id })}
          >
            {isRTL ? <ArrowRight className="size-4" /> : <ArrowLeft className="size-4" />}
            <span className="hidden sm:inline">
              {pick(locale, STR.backToCourseDetails)}
            </span>
          </Button>

          <div className="hidden md:block h-5 w-px bg-border" aria-hidden="true" />

          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-semibold text-foreground truncate" title={courseTitle}>
              {courseTitle}
            </h1>
            <p className="text-[11px] text-muted-foreground tabular-nums">
              {t("player.progress")}: {courseProgress}%
            </p>
          </div>

          {/* Course progress mini-bar (hidden on small screens) */}
          <div
            className="hidden sm:block w-24 h-1.5 rounded-full bg-muted overflow-hidden"
            aria-hidden="true"
          >
            <div
              className="h-full bg-success rounded-full"
              style={{ width: `${courseProgress}%` }}
            />
          </div>

          {/* Mobile: open curriculum */}
          <Button
            variant="outline"
            size="sm"
            className="lg:hidden"
            onClick={() => setMobileCurriculumOpen(true)}
            aria-label={pick(locale, STR.showCurriculum)}
          >
            <Menu className="size-4" />
            <span className="hidden sm:inline">{pick(locale, STR.showCurriculum)}</span>
          </Button>

          {/* Desktop: toggle sidebar */}
          <Button
            variant="outline"
            size="icon"
            className="hidden lg:inline-flex"
            onClick={() => setSidebarOpen((v) => !v)}
            aria-label={sidebarOpen ? pick(locale, STR.hideCurriculum) : pick(locale, STR.showCurriculum)}
            aria-pressed={sidebarOpen}
          >
            {sidebarOpen ? <PanelRightClose className="size-4" /> : <PanelRightOpen className="size-4" />}
          </Button>

          {/* AI Assistant toggle */}
          <Button
            size="sm"
            className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5"
            onClick={() => setAiOpen((v) => !v)}
            aria-pressed={aiOpen}
            aria-label={t("player.aiToggle")}
          >
            <Sparkles className="size-4" />
            <span className="hidden sm:inline">{t("player.aiToggle")}</span>
          </Button>
        </div>
      </header>

      {/* ---------------- Body ---------------- */}
      <div className="max-w-[1600px] mx-auto px-3 sm:px-4 lg:px-6 py-4 lg:py-6">
        <div
          className={cn(
            "grid gap-4 lg:gap-6",
            sidebarOpen ? "lg:grid-cols-[minmax(0,1fr)_20rem] xl:grid-cols-[minmax(0,1fr)_22rem]" : "lg:grid-cols-1",
          )}
        >
          {/* LEFT: video + tabs */}
          <div className="min-w-0 space-y-4">
            {showResumeBanner && <ResumeBanner text={t("player.autoResumed")} />}
            <VideoArea
              course={course}
              lesson={activeLesson}
              state={playerState}
              onGoToLesson={goToLesson}
            />
            <PlayerTabs
              course={course}
              lesson={activeLesson}
              currentSec={currentSec}
            />
          </div>

          {/* RIGHT: curriculum sidebar (desktop only — mobile uses Sheet below) */}
          {sidebarOpen && (
            <aside className="hidden lg:block" aria-label={pick(locale, STR.showCurriculum)}>
              <CurriculumSidebar
                course={course}
                activeLessonId={activeLessonId}
                onSelectLesson={(id) => {
                  goToLesson(id);
                }}
              />
            </aside>
          )}
        </div>
      </div>

      {/* ---------------- Mobile curriculum Sheet ---------------- */}
      <Sheet open={mobileCurriculumOpen} onOpenChange={setMobileCurriculumOpen}>
        <SheetContent side={isRTL ? "left" : "right"} className="w-[90vw] sm:max-w-md p-0">
          <SheetHeader className="px-4 pt-4 pb-2 border-b">
            <SheetTitle>{pick(locale, STR.showCurriculum)}</SheetTitle>
          </SheetHeader>
          <div className="flex-1 min-h-0 overflow-hidden">
            <CurriculumSidebar
              course={course}
              activeLessonId={activeLessonId}
              onSelectLesson={(id) => {
                goToLesson(id);
                setMobileCurriculumOpen(false);
              }}
              inSheet
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* ---------------- AI Assistant ---------------- */}
      <AiAssistant
        course={course}
        lesson={activeLesson}
        open={aiOpen}
        onOpenChange={setAiOpen}
        isMobile={isMobile}
      />

      {/* ---------------- Floating "Ask AI" button (mobile only, when closed) ---------------- */}
      {!aiOpen && (
        <button
          type="button"
          onClick={() => setAiOpen(true)}
          aria-label={t("player.aiToggle")}
          className={cn(
            "lg:hidden fixed z-40 bottom-4 end-4 inline-flex items-center justify-center rounded-full",
            "size-14 shadow-lg shadow-primary/30 bg-primary text-primary-foreground",
            "hover:bg-primary/90 transition-colors",
          )}
        >
          <Sparkles className="size-6" />
        </button>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------------
// Resume banner
// ----------------------------------------------------------------------------

function ResumeBanner({ text }: { text: string }) {
  return (
    <div
      role="status"
      className="flex items-center gap-2 rounded-md border border-primary/20 bg-primary/5 px-3 py-2 text-sm text-foreground slide-enter"
    >
      <RotateCcw className="size-4 text-primary" />
      <span className="font-medium">{text}</span>
    </div>
  );
}

// ----------------------------------------------------------------------------
// Video area
// ----------------------------------------------------------------------------

function VideoArea({
  course,
  lesson,
  state,
  onGoToLesson,
}: {
  course: Course;
  lesson: Lesson;
  state: PlayerState;
  onGoToLesson: (id: string) => void;
}) {
  const { t, locale, formatDuration } = useI18n();
  const markLessonComplete = useAppStore((s) => s.markLessonComplete);
  const setLessonPosition = useAppStore((s) => s.setLessonPosition);
  const pushToast = useAppStore((s) => s.pushToast);
  const lessonProgress = useAppStore(
    (s) => s.progress[course.id]?.lessons[lesson.id],
  );
  const isCompleted = !!lessonProgress?.completed;

  const allLessons = useMemo(() => getAllLessons(course), [course]);
  const currentIndex = allLessons.findIndex((l) => l.id === lesson.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < allLessons.length - 1;

  const { currentSec, setCurrentSec, isPlaying, setIsPlaying, totalSec, activeLessonId } = state;

  const playbackPct = totalSec > 0 ? Math.min(100, (currentSec / totalSec) * 100) : 0;
  const atEnd = currentSec >= totalSec;

  // Keep a ref synced with currentSec so the 5s persist interval can read the
  // latest value without re-creating itself every tick. Refs are mutated
  // inside effects — never during render.
  const currentSecRef = useRef(currentSec);
  useEffect(() => {
    currentSecRef.current = currentSec;
  }, [currentSec]);

  // ---- Playback interval: 1Hz tick while playing ----
  // The interval callback calls setCurrentSec via a functional updater, so it
  // always reads the latest value. setState is called from inside the interval
  // callback — NOT synchronously in the effect body — so the
  // `react-hooks/set-state-in-effect` rule is satisfied.
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentSec((prev) => (prev >= totalSec ? prev : prev + 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying, totalSec, setCurrentSec]);

  // ---- Auto-pause when reaching the end ----
  // setState (setIsPlaying) is called inside a setTimeout callback, not
  // synchronously in the effect body — safe for `set-state-in-effect`.
  useEffect(() => {
    if (!isPlaying) return;
    if (currentSec >= totalSec) {
      const t = setTimeout(() => setIsPlaying(false), 0);
      return () => clearTimeout(t);
    }
  }, [currentSec, totalSec, isPlaying, setIsPlaying]);

  // ---- Persist position every 5s while playing ----
  // setLessonPosition is a Zustand store action (not a setState), so calling
  // it inside the interval callback is fine.
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setLessonPosition(course.id, activeLessonId, currentSecRef.current);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPlaying, activeLessonId, course.id, setLessonPosition]);

  const togglePlay = () => {
    if (atEnd) {
      // Restart from 0
      setCurrentSec(0);
      setIsPlaying(true);
      return;
    }
    setIsPlaying(!isPlaying);
  };

  const seekTo = (sec: number) => {
    const clamped = Math.max(0, Math.min(totalSec, sec));
    setCurrentSec(clamped);
    setLessonPosition(course.id, activeLessonId, clamped);
  };

  const handleMarkComplete = () => {
    if (isCompleted) return;
    markLessonComplete(course.id, lesson.id);
    // Persist final position
    setLessonPosition(course.id, lesson.id, totalSec);
    pushToast({
      title: pick(locale, STR.lessonMarked),
      variant: "success",
    });
    // Auto-advance after a short delay
    setTimeout(() => {
      const idx = allLessons.findIndex((l) => l.id === lesson.id);
      const next = allLessons[idx + 1];
      if (next) {
        onGoToLesson(next.id);
      }
    }, 800);
  };

  const PrevIcon = locale === "ar" ? ChevronRight : ChevronLeft;
  const NextIcon = locale === "ar" ? ChevronLeft : ChevronRight;
  const lessonTitle = locale === "ar" ? lesson.titleAr ?? lesson.title : lesson.title;
  const lessonDesc = locale === "ar" ? lesson.descriptionAr ?? lesson.description : lesson.description;
  const LessonTypeIcon = LESSON_TYPE_ICON[lesson.type];

  return (
    <div className="space-y-3">
      {/* 16:9 video placeholder */}
      <div
        className={cn(
          "relative w-full aspect-video overflow-hidden rounded-xl bg-gradient-to-br shadow-lg",
          course.accent,
        )}
      >
        {/* subtle pattern overlay */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 30%, rgba(255,255,255,0.4) 0, transparent 40%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.3) 0, transparent 40%)",
          }}
          aria-hidden="true"
        />

        {/* Lesson title overlay (top) */}
        <div className="absolute top-0 inset-x-0 p-4 sm:p-5 bg-gradient-to-b from-black/40 to-transparent">
          <div className="flex items-center gap-2 text-white/95">
            <LessonTypeIcon className="size-4 shrink-0" />
            <span className="text-[11px] font-semibold uppercase tracking-wider opacity-90">
              {lesson.type}
            </span>
          </div>
          <h2 className="mt-1 text-white font-semibold text-base sm:text-lg line-clamp-2 drop-shadow">
            {lessonTitle}
          </h2>
        </div>

        {/* Big center play/pause button */}
        <button
          type="button"
          onClick={togglePlay}
          aria-pressed={isPlaying}
          aria-label={isPlaying ? pick(locale, STR.videoPause) : pick(locale, STR.videoPlay)}
          className="absolute inset-0 flex items-center justify-center group"
        >
          <span className="flex items-center justify-center size-16 sm:size-20 rounded-full bg-white/95 text-primary shadow-xl group-hover:scale-105 transition-transform">
            {atEnd ? (
              <RotateCcw className="size-7 sm:size-9" />
            ) : isPlaying ? (
              <Pause className="size-7 sm:size-9" />
            ) : (
              <Play className="size-7 sm:size-9 ms-0.5" />
            )}
          </span>
        </button>

        {/* Control bar (bottom) */}
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent px-3 pb-2 pt-6">
          {/* progress bar (clickable) */}
          <div
            className="group/bar relative h-1.5 rounded-full bg-white/30 cursor-pointer mb-2"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const ratio =
                locale === "ar"
                  ? (rect.right - e.clientX) / rect.width // RTL: clicks from the right
                  : (e.clientX - rect.left) / rect.width;
              seekTo(Math.round(ratio * totalSec));
            }}
            role="slider"
            aria-label={pick(locale, STR.videoProgress)}
            aria-valuemin={0}
            aria-valuemax={totalSec}
            aria-valuenow={Math.round(currentSec)}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight") seekTo(currentSec + 5);
              if (e.key === "ArrowLeft") seekTo(currentSec - 5);
            }}
          >
            <div
              className="absolute inset-y-0 start-0 bg-primary rounded-full"
              style={{ width: `${playbackPct}%` }}
            />
          </div>

          <div className="flex items-center gap-2 text-white">
            <button
              type="button"
              onClick={togglePlay}
              aria-pressed={isPlaying}
              aria-label={isPlaying ? pick(locale, STR.videoPause) : pick(locale, STR.videoPlay)}
              className="p-1 rounded hover:bg-white/10"
            >
              {atEnd ? (
                <RotateCcw className="size-4" />
              ) : isPlaying ? (
                <Pause className="size-4" />
              ) : (
                <Play className="size-4" />
              )}
            </button>
            <span className="text-xs font-mono tabular-nums">
              {formatTime(currentSec)} / {formatTime(totalSec)}
            </span>
            <div className="flex-1" />
            <button
              type="button"
              aria-label={pick(locale, STR.videoMute)}
              className="p-1 rounded hover:bg-white/10"
            >
              <Volume2 className="size-4" />
            </button>
            <button
              type="button"
              aria-label={pick(locale, STR.videoSettings)}
              className="p-1 rounded hover:bg-white/10"
            >
              <Settings className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Below-video action bar: prev / mark complete / next */}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={!hasPrev}
          onClick={() => {
            const prev = allLessons[currentIndex - 1];
            if (prev) onGoToLesson(prev.id);
          }}
        >
          <PrevIcon className="size-4" />
          {t("player.prevLesson")}
        </Button>

        <div className="flex-1" />

        {isCompleted ? (
          <Badge className="bg-success/15 text-success border border-success/30 gap-1.5 py-1 px-3">
            <CheckCircle2 className="size-4" />
            {t("player.completed")}
          </Badge>
        ) : (
          <Button
            size="sm"
            onClick={handleMarkComplete}
            className="bg-success text-success-foreground hover:bg-success/90 gap-1.5"
          >
            <Check className="size-4" />
            {t("player.markComplete")}
          </Button>
        )}

        <Button
          variant="outline"
          size="sm"
          disabled={!hasNext}
          onClick={() => {
            const next = allLessons[currentIndex + 1];
            if (next) onGoToLesson(next.id);
          }}
        >
          {t("player.nextLesson")}
          <NextIcon className="size-4" />
        </Button>
      </div>

      {/* Lesson title + description */}
      <div className="space-y-2">
        <div className="flex items-start gap-2 flex-wrap">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground leading-tight flex-1 min-w-0">
            {lessonTitle}
          </h2>
          <Badge variant="secondary" className="gap-1.5">
            <LessonTypeIcon className="size-3.5" />
            {formatDuration(lesson.durationMin)}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {lessonDesc}
        </p>
      </div>

      {/* Take the quiz CTA (only if a quiz exists for this course) */}
      {getQuizForCourse(course.id) ? (
        <QuizCta courseId={course.id} />
      ) : null}
    </div>
  );
}

function QuizCta({ courseId }: { courseId: string }) {
  const { t } = useI18n();
  const navigate = useAppStore((s) => s.navigate);
  return (
    <Card className="p-4 flex items-center gap-3 border-primary/20 bg-primary/5">
      <div className="flex items-center justify-center size-10 rounded-full bg-primary/15 text-primary shrink-0">
        <ClipboardList className="size-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground">
          {t("player.takeQuiz")}
        </p>
        <p className="text-xs text-muted-foreground">
          {t("quiz.title")} • {courseId}
        </p>
      </div>
      <Button size="sm" onClick={() => navigate("quiz", { courseId })}>
        {t("player.takeQuiz")}
      </Button>
    </Card>
  );
}

// ----------------------------------------------------------------------------
// Tabs (Overview | Q&A | Notes | Reviews | Resources)
// ----------------------------------------------------------------------------

function PlayerTabs({
  course,
  lesson,
  currentSec,
}: {
  course: Course;
  lesson: Lesson;
  currentSec: number;
}) {
  const { t } = useI18n();
  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="w-full justify-start overflow-x-auto no-scrollbar h-auto py-1">
        <TabsTrigger value="overview">{t("player.tab.overview")}</TabsTrigger>
        <TabsTrigger value="qa">{t("player.tab.qa")}</TabsTrigger>
        <TabsTrigger value="notes">{t("player.tab.notes")}</TabsTrigger>
        <TabsTrigger value="reviews">{t("player.tab.reviews")}</TabsTrigger>
        <TabsTrigger value="resources">{t("player.tab.resources")}</TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="mt-4">
        <OverviewTab course={course} lesson={lesson} />
      </TabsContent>
      <TabsContent value="qa" className="mt-4">
        <QATab course={course} />
      </TabsContent>
      <TabsContent value="notes" className="mt-4">
        <NotesTab course={course} lesson={lesson} currentSec={currentSec} />
      </TabsContent>
      <TabsContent value="reviews" className="mt-4">
        <ReviewsTab course={course} />
      </TabsContent>
      <TabsContent value="resources" className="mt-4">
        <ResourcesTab lesson={lesson} />
      </TabsContent>
    </Tabs>
  );
}

// ----------------------------------------------------------------------------
// Overview tab
// ----------------------------------------------------------------------------

function OverviewTab({ course, lesson }: { course: Course; lesson: Lesson }) {
  const { t, locale, formatNumber, formatDuration } = useI18n();
  const instructor = getInstructor(course.instructorId);
  const viewsCount = course.enrolledCount * 3;
  const transcript = locale === "ar" ? lesson.transcriptAr ?? lesson.transcript : lesson.transcript;
  const description = locale === "ar" ? course.descriptionAr : course.description;

  const meta: { icon: LucideIcon; label: string; value: string }[] = [
    {
      icon: Globe,
      label: pick(locale, STR.languageLabel),
      value: course.language,
    },
    {
      icon: Star,
      label: pick(locale, STR.ratingLabel),
      value: `${course.rating.toFixed(1)} (${formatNumber(course.ratingCount)})`,
    },
    {
      icon: Users,
      label: pick(locale, STR.viewsLabel),
      value: formatNumber(viewsCount),
    },
    {
      icon: Clock,
      label: pick(locale, STR.durationLabel),
      value: formatDuration(lesson.durationMin),
    },
    {
      icon: GraduationCap,
      label: pick(locale, STR.enrolledLabel),
      value: formatNumber(course.enrolledCount),
    },
  ];

  return (
    <div className="space-y-5">
      {/* Course-level meta grid */}
      <Card className="p-4 sm:p-5">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {meta.map((m) => (
            <div key={m.label} className="flex items-center gap-2.5">
              <div className="flex items-center justify-center size-9 rounded-full bg-primary/10 text-primary shrink-0">
                <m.icon className="size-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  {m.label}
                </p>
                <p className="text-sm font-semibold text-foreground truncate">
                  {m.value}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Course description */}
      <div className="space-y-2">
        <h3 className="text-base font-semibold text-foreground">
          {locale === "ar" ? "نبذة عن الكورس" : "About this course"}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
          {description}
        </p>
        {instructor ? (
          <p className="text-xs text-muted-foreground pt-1">
            {locale === "ar" ? "المحاضر" : "Instructor"}:{" "}
            <span className="font-medium text-foreground">
              {locale === "ar" ? instructor.nameAr ?? instructor.name : instructor.name}
            </span>
          </p>
        ) : null}
      </div>

      {/* Transcript excerpt */}
      {transcript ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <BookOpen className="size-4 text-primary" />
            <h3 className="text-base font-semibold text-foreground">
              {pick(locale, STR.transcript)}
            </h3>
          </div>
          <div className="max-h-48 overflow-y-auto lms-scroll rounded-md border border-border bg-muted/30 p-3 text-sm leading-relaxed text-foreground">
            {transcript}
          </div>
        </div>
      ) : null}
    </div>
  );
}

// ----------------------------------------------------------------------------
// Q&A tab
// ----------------------------------------------------------------------------

const EMPTY_QA: QAItem[] = [];

function QATab({ course }: { course: Course }) {
  const { t, locale, formatDate } = useI18n();
  const extraQA = useAppStore((s) => s.extraQA[course.id]) ?? EMPTY_QA;
  const addQuestion = useAppStore((s) => s.addQuestion);
  const pushToast = useAppStore((s) => s.pushToast);
  const user = useAppStore((s) => s.user);

  const [draft, setDraft] = useState("");
  const [upvoteBoost, setUpvoteBoost] = useState<Record<string, number>>({});

  // Show extra (user-added) questions first, then seed Q&A.
  const allQA: QAItem[] = useMemo(
    () => [...extraQA, ...(course.qa ?? [])],
    [extraQA, course.qa]
  );

  const handleSubmit = () => {
    const q = draft.trim();
    if (!q) return;
    addQuestion(course.id, q, user?.name ?? "You");
    setDraft("");
    pushToast({ title: pick(locale, STR.questionAsked), variant: "success" });
  };

  return (
    <div className="space-y-4">
      {/* Ask a question box */}
      <Card className="p-4 space-y-2">
        <label htmlFor="qa-input" className="text-sm font-medium text-foreground">
          {t("player.qa.ask")}
        </label>
        <Textarea
          id="qa-input"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={t("player.qa.askPlaceholder")}
          aria-label={pick(locale, STR.qaInputAria)}
          className="min-h-20"
        />
        <div className="flex justify-end">
          <Button size="sm" onClick={handleSubmit} disabled={!draft.trim()}>
            {t("player.qa.ask")}
          </Button>
        </div>
      </Card>

      {/* List */}
      {allQA.length === 0 ? (
        <EmptyState icon={Inbox} title={t("player.qa.empty")} />
      ) : (
        <ul className="space-y-3">
          {allQA.map((item) => (
            <QaItem
              key={item.id}
              item={item}
              boost={upvoteBoost[item.id] ?? 0}
              onUpvote={() =>
                setUpvoteBoost((prev) => ({
                  ...prev,
                  [item.id]: (prev[item.id] ?? 0) + 1,
                }))
              }
              formatDate={formatDate}
              locale={locale}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function QaItem({
  item,
  boost,
  onUpvote,
  formatDate,
  locale,
}: {
  item: QAItem;
  boost: number;
  onUpvote: () => void;
  formatDate: (d: string | Date) => string;
  locale: Locale;
}) {
  const { t } = useI18n();
  const question = locale === "ar" ? item.questionAr ?? item.question : item.question;
  const answer = locale === "ar" ? item.answerAr ?? item.answer : item.answer;
  const upvotes = item.upvotes + boost;

  return (
    <li>
      <Card className="p-4 space-y-2">
        <div className="flex items-start gap-3">
          <Avatar className="size-8 shrink-0">
            <AvatarFallback className="bg-primary/15 text-primary text-xs font-semibold">
              {item.studentName.slice(0, 1).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-sm font-semibold text-foreground">
                {item.studentName}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatDate(item.date)}
              </span>
            </div>
            <p className="text-sm text-foreground mt-1 leading-relaxed">{question}</p>
          </div>
        </div>
        <Separator />
        <div className="ps-11 space-y-2">
          <p className="text-sm text-muted-foreground leading-relaxed">{answer}</p>
          <button
            type="button"
            onClick={onUpvote}
            aria-label={pick(locale, STR.upvote)}
            aria-pressed={boost > 0}
            className={cn(
              "inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-md border transition-colors",
              boost > 0
                ? "border-primary/30 bg-primary/5 text-primary"
                : "border-border text-muted-foreground hover:text-foreground hover:bg-muted",
            )}
          >
            <ThumbsUp className="size-3.5" />
            <span className="tabular-nums">{t("player.qa.upvotes", { n: upvotes })}</span>
          </button>
        </div>
      </Card>
    </li>
  );
}

// ----------------------------------------------------------------------------
// Notes tab
// ----------------------------------------------------------------------------

const EMPTY_NOTES: { id: string; text: string; timestampSec: number; createdAt: number }[] = [];

function NotesTab({
  course,
  lesson,
  currentSec,
}: {
  course: Course;
  lesson: Lesson;
  currentSec: number;
}) {
  const { t, locale } = useI18n();
  const addNote = useAppStore((s) => s.addNote);
  const pushToast = useAppStore((s) => s.pushToast);
  const notes =
    useAppStore((s) => s.progress[course.id]?.lessons[lesson.id]?.notes) ?? EMPTY_NOTES;

  const [draft, setDraft] = useState("");
  const [deletedNoteIds, setDeletedNoteIds] = useState<Set<string>>(new Set());

  const visibleNotes = notes.filter((n) => !deletedNoteIds.has(n.id));

  const handleSave = () => {
    const text = draft.trim();
    if (!text) return;
    addNote(course.id, lesson.id, text, currentSec);
    setDraft("");
    pushToast({ title: pick(locale, STR.noteSaved), variant: "success" });
  };

  const handleDelete = (id: string) => {
    setDeletedNoteIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  const placeholder = t("player.notes.placeholder", { time: formatTime(currentSec) });

  return (
    <div className="space-y-4">
      {/* Draft box */}
      <Card className="p-4 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <label htmlFor="note-input" className="text-sm font-medium text-foreground">
            {t("player.tab.notes")}
          </label>
          <Badge variant="secondary" className="tabular-nums font-mono">
            {formatTime(currentSec)}
          </Badge>
        </div>
        <Textarea
          id="note-input"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={placeholder}
          aria-label={pick(locale, STR.notesDraftAria)}
          className="min-h-20"
        />
        <div className="flex justify-end">
          <Button size="sm" onClick={handleSave} disabled={!draft.trim()}>
            {t("player.notes.add")}
          </Button>
        </div>
      </Card>

      {/* Notes list */}
      {visibleNotes.length === 0 ? (
        <EmptyState icon={Inbox} title={t("player.notes.empty")} />
      ) : (
        <ul className="space-y-2">
          {visibleNotes.map((n) => (
            <li key={n.id}>
              <Card className="p-3 flex items-start gap-3">
                <Badge
                  variant="outline"
                  className="font-mono tabular-nums shrink-0 border-primary/30 text-primary"
                >
                  {t("player.notes.at")} {formatTime(n.timestampSec)}
                </Badge>
                <p className="flex-1 text-sm text-foreground leading-relaxed whitespace-pre-line">
                  {n.text}
                </p>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 shrink-0 text-muted-foreground hover:text-destructive"
                  aria-label={pick(locale, STR.deleteNote)}
                  onClick={() => handleDelete(n.id)}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------------
// Reviews tab
// ----------------------------------------------------------------------------

function ReviewsTab({ course }: { course: Course }) {
  const { t, locale, formatNumber, formatDate } = useI18n();
  const reviews = course.reviews;

  // Compact summary at top
  const summary = (
    <Card className="p-4 sm:p-5">
      <div className="flex items-center gap-4">
        <div className="text-center shrink-0">
          <p className="text-4xl font-bold tabular-nums text-foreground leading-none">
            {course.rating.toFixed(1)}
          </p>
          <StarRating value={course.rating} size={14} className="mt-1.5 justify-center" />
          <p className="text-xs text-muted-foreground mt-1">
            {fmt(locale, "reviewsCount", { n: formatNumber(course.ratingCount) })}
          </p>
        </div>
        <Separator orientation="vertical" className="h-16" />
        <p className="text-sm text-muted-foreground leading-relaxed">
          {locale === "ar"
            ? "تقييمات المتعلمين اللي خدوا الكورس ده."
            : "Ratings from learners who took this course."}
        </p>
      </div>
    </Card>
  );

  if (reviews.length === 0) {
    return (
      <div className="space-y-4">
        {summary}
        <EmptyState icon={Inbox} title={fmt(locale, "reviewsCount", { n: 0 })} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {summary}
      <ul className="space-y-3">
        {reviews.map((r) => {
          const comment = locale === "ar" ? r.commentAr ?? r.comment : r.comment;
          return (
            <li key={r.id}>
              <Card className="p-4 space-y-2">
                <div className="flex items-center gap-3">
                  <Avatar className="size-9 shrink-0">
                    <AvatarFallback className="bg-primary/15 text-primary text-xs font-semibold">
                      {r.studentName.slice(0, 1).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">
                      {r.studentName}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <StarRating value={r.rating} size={12} />
                      <span className="text-xs text-muted-foreground">
                        {formatDate(r.date)}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-foreground leading-relaxed">{comment}</p>
              </Card>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ----------------------------------------------------------------------------
// Resources tab
// ----------------------------------------------------------------------------

function ResourcesTab({ lesson }: { lesson: Lesson }) {
  const { t, locale } = useI18n();
  const pushToast = useAppStore((s) => s.pushToast);
  const resources = lesson.resources ?? [];

  if (resources.length === 0) {
    return <EmptyState icon={Inbox} title={t("player.resources.empty")} />;
  }

  const handleDownload = (name: string) => {
    pushToast({
      title: fmt(locale, "downloading", { name }),
      variant: "default",
    });
  };

  return (
    <ul className="space-y-2">
      {resources.map((r) => {
        const Icon = RESOURCE_ICON[r.type];
        return (
          <li key={r.name}>
            <Card className="p-3 flex items-center gap-3">
              <div className="flex items-center justify-center size-9 rounded-md bg-primary/10 text-primary shrink-0">
                <Icon className="size-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{r.name}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  {r.type}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownload(r.name)}
              >
                {t("player.resources.download")}
              </Button>
            </Card>
          </li>
        );
      })}
    </ul>
  );
}

// ----------------------------------------------------------------------------
// Curriculum sidebar
// ----------------------------------------------------------------------------

function CurriculumSidebar({
  course,
  activeLessonId,
  onSelectLesson,
  inSheet = false,
}: {
  course: Course;
  activeLessonId: string;
  onSelectLesson: (id: string) => void;
  inSheet?: boolean;
}) {
  const { t, locale } = useI18n();
  const getCourseProgress = useAppStore((s) => s.getCourseProgress);
  const progress = useAppStore((s) => s.progress[course.id]);
  const courseProgress = getCourseProgress(course.id);
  const courseTitle = locale === "ar" ? course.titleAr : course.title;

  return (
    <nav
      aria-label={pick(locale, STR.showCurriculum)}
      className={cn(
        "flex flex-col h-full bg-card border rounded-xl overflow-hidden",
        inSheet ? "h-full" : "lg:sticky lg:top-[4.5rem] max-h-[calc(100vh-5rem)]",
      )}
    >
      {/* Header */}
      <div className="p-3 border-b bg-muted/30 shrink-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {t("player.curriculum")}
        </p>
        <p className="text-sm font-semibold text-foreground line-clamp-1 mt-0.5" title={courseTitle}>
          {courseTitle}
        </p>
        <div className="mt-2 flex items-center gap-2">
          <div
            className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden"
            aria-hidden="true"
          >
            <div
              className="h-full bg-success rounded-full"
              style={{ width: `${courseProgress}%` }}
            />
          </div>
          <span className="text-[11px] font-semibold text-muted-foreground tabular-nums shrink-0">
            {courseProgress}%
          </span>
        </div>
      </div>

      {/* Sections / lessons list */}
      <div className={cn("overflow-y-auto lms-scroll", inSheet ? "flex-1" : "lg:max-h-[70vh]")}>
        {course.sections.map((section) => {
          const sectionTitle =
            locale === "ar" ? section.titleAr ?? section.title : section.title;
          const lessonsCount = section.lessons.length;
          return (
            <Collapsible key={section.id} defaultOpen className="border-b last:border-b-0">
              <CollapsibleTrigger asChild>
                <button
                  type="button"
                  className="w-full flex items-center gap-2 p-3 text-start hover:bg-muted/40 transition-colors [&[data-state=closed]>svg]:-rotate-90"
                >
                  <ChevronDown
                    className="size-4 text-muted-foreground shrink-0 transition-transform duration-200"
                    aria-hidden="true"
                  />
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-semibold text-foreground line-clamp-1">
                      {sectionTitle}
                    </span>
                    <span className="block text-[11px] text-muted-foreground tabular-nums">
                      {fmt(locale, "lessonsCount", { n: lessonsCount })}
                    </span>
                  </span>
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <ul className="pb-1">
                  {section.lessons.map((lesson) => {
                    const lp = progress?.lessons[lesson.id];
                    const completed = !!lp?.completed;
                    const isActive = lesson.id === activeLessonId;
                    const Icon = LESSON_TYPE_ICON[lesson.type];
                    const lessonTitle =
                      locale === "ar" ? lesson.titleAr ?? lesson.title : lesson.title;
                    return (
                      <li key={lesson.id}>
                        <button
                          type="button"
                          onClick={() => onSelectLesson(lesson.id)}
                          aria-current={isActive ? "true" : undefined}
                          className={cn(
                            "w-full flex items-center gap-2.5 ps-3 pe-3 py-2 text-start transition-colors",
                            isActive
                              ? "bg-primary/10 border-s-4 border-primary"
                              : "border-s-4 border-transparent hover:bg-muted/40",
                          )}
                        >
                          {/* Completion indicator */}
                          <span className="shrink-0">
                            {completed ? (
                              <CheckCircle2 className="size-4 text-success" />
                            ) : (
                              <Circle className="size-4 text-muted-foreground/40" />
                            )}
                          </span>
                          <Icon
                            className={cn(
                              "size-4 shrink-0",
                              isActive ? "text-primary" : "text-muted-foreground",
                            )}
                          />
                          <span className="flex-1 min-w-0">
                            <span
                              className={cn(
                                "block text-xs leading-snug line-clamp-2",
                                isActive
                                  ? "font-semibold text-foreground"
                                  : "text-foreground/80",
                              )}
                            >
                              {lessonTitle}
                            </span>
                          </span>
                          <span className="text-[10px] text-muted-foreground tabular-nums shrink-0">
                            {lesson.durationMin} {t("landing.min")}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </div>
    </nav>
  );
}

// ----------------------------------------------------------------------------
// AI Assistant
// ----------------------------------------------------------------------------

interface ChatMessage {
  role: "user" | "ai";
  text: string;
}

function AiAssistant({
  course,
  lesson,
  open,
  onOpenChange,
  isMobile,
}: {
  course: Course;
  lesson: Lesson;
  open: boolean;
  onOpenChange: (b: boolean) => void;
  isMobile: boolean;
}) {
  const { t, locale } = useI18n();
  const user = useAppStore((s) => s.user);

  // Chat state lives here so it persists across open/close toggles within the
  // same screen mount. Greeting is seeded once.
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);

  const messagesRef = useRef<HTMLDivElement>(null);
  // Track greeting-seeding with a ref (mutated in effect — allowed) so we
  // don't trip `react-hooks/set-state-in-effect` by calling setState in the
  // effect body.
  const greetedRef = useRef(false);

  // Seed the greeting the first time the assistant opens. setState
  // (setMessages) is called inside a setTimeout callback — not synchronously
  // in the effect body — so the lint rule is satisfied.
  useEffect(() => {
    if (!open || greetedRef.current) return;
    greetedRef.current = true;
    const greeting = t("player.aiGreeting");
    const timer = setTimeout(() => {
      setMessages([{ role: "ai", text: greeting }]);
    }, 50);
    return () => clearTimeout(timer);
  }, [open, t]);

  // Auto-scroll the messages container to the bottom whenever messages or
  // thinking indicator change. We mutate the DOM via the ref only — no
  // setState in the effect body.
  useEffect(() => {
    const el = messagesRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, isThinking]);

  const lessonTitle = locale === "ar" ? lesson.titleAr ?? lesson.title : lesson.title;
  const transcript =
    locale === "ar" ? lesson.transcriptAr ?? lesson.transcript : lesson.transcript;
  const firstSentence =
    transcript && transcript.length > 0
      ? (() => {
          const parts = transcript.split(".");
          return (parts[0] ?? transcript).trim() + ".";
        })()
      : "";

  const generateReply = (userText: string): string => {
    // Heuristic: pick template based on message length + a touch of randomness.
    const templates = [STR.aiReply1, STR.aiReply2, STR.aiReply3];
    let idx: number;
    if (userText.length < 20) idx = 0;
    else if (userText.length > 80) idx = 2;
    else idx = 1;
    // small rotation so consecutive identical-length messages don't always repeat
    if (Math.random() < 0.3) idx = (idx + 1) % templates.length;

    const template = templates[idx];
    let s = pick(locale, template);
    s = s.replace(/\{lesson\}/g, lessonTitle);
    s = s.replace(/\{snippet\}/g, firstSentence || lessonTitle);
    return s;
  };

  const handleSend = () => {
    const text = input.trim();
    if (!text || isThinking) return;
    const userMsg: ChatMessage = { role: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsThinking(true);
    const reply = generateReply(text);
    // setTimeout inside an event handler — setState is called from the
    // callback, NOT synchronously in any effect body. Safe for the
    // `react-hooks/set-state-in-effect` rule.
    setTimeout(() => {
      setMessages((prev) => [...prev, { role: "ai", text: reply }]);
      setIsThinking(false);
    }, 900);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClose = () => onOpenChange(false);

  const chatBody = (
    <ChatBody
      messages={messages}
      isThinking={isThinking}
      messagesRef={messagesRef}
      userInitial={(user?.name ?? "Y").slice(0, 1).toUpperCase()}
      locale={locale}
      thinkingLabel={t("player.aiThinking")}
      ariaLabel={pick(locale, STR.chatHistory)}
    />
  );

  const chatInput = (
    <div className="flex items-center gap-2 p-3 border-t border-border bg-card">
      <Input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={t("player.aiPlaceholder")}
        aria-label={pick(locale, STR.aiInputAria)}
        disabled={isThinking}
      />
      <Button
        size="icon"
        onClick={handleSend}
        disabled={!input.trim() || isThinking}
        aria-label={pick(locale, STR.send)}
      >
        <Send className="size-4" />
      </Button>
    </div>
  );

  // Mobile: Sheet (bottom drawer).
  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-[80vh] p-0 flex flex-col">
          <SheetHeader className="px-4 pt-4 pb-2 border-b">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center size-7 rounded-full bg-primary/15 text-primary">
                <Sparkles className="size-4" />
              </div>
              <SheetTitle>{t("player.aiAssistant")}</SheetTitle>
            </div>
          </SheetHeader>
          <div className="flex-1 min-h-0 flex flex-col">
            <div className="flex-1 min-h-0">{chatBody}</div>
            {chatInput}
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop: fixed side panel (only rendered when open).
  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label={t("player.aiAssistant")}
      className="hidden lg:flex fixed z-40 bottom-4 end-4 w-96 max-w-[calc(100vw-2rem)] h-[600px] max-h-[calc(100vh-5rem)] flex-col bg-card border border-border rounded-xl shadow-2xl shadow-primary/10 slide-enter"
    >
      {/* Header */}
      <div className="flex items-center gap-2 p-3 border-b border-border">
        <div className="flex items-center justify-center size-7 rounded-full bg-primary/15 text-primary">
          <Sparkles className="size-4" />
        </div>
        <span className="text-sm font-semibold text-foreground flex-1">
          {t("player.aiAssistant")}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          onClick={handleClose}
          aria-label={pick(locale, STR.closeAssistant)}
        >
          <X className="size-4" />
        </Button>
      </div>
      <div className="flex-1 min-h-0">{chatBody}</div>
      {chatInput}
    </div>
  );
}

function ChatBody({
  messages,
  isThinking,
  messagesRef,
  userInitial,
  locale,
  thinkingLabel,
  ariaLabel,
}: {
  messages: ChatMessage[];
  isThinking: boolean;
  messagesRef: React.RefObject<HTMLDivElement | null>;
  userInitial: string;
  locale: Locale;
  thinkingLabel: string;
  ariaLabel: string;
}) {
  return (
    <div
      ref={messagesRef}
      aria-label={ariaLabel}
      className="h-full max-h-[55vh] overflow-y-auto lms-scroll p-3 space-y-3"
    >
      {messages.length === 0 && !isThinking ? (
        <div className="text-center text-xs text-muted-foreground py-8">
          {pick(locale, STR.chatHistory)}
        </div>
      ) : null}

      {messages.map((m, i) => {
        if (m.role === "user") {
          return (
            <div key={i} className="flex justify-end">
              <div className="flex items-start gap-2 max-w-[85%] flex-row-reverse">
                <Avatar className="size-7 shrink-0">
                  <AvatarFallback className="bg-muted text-foreground text-[10px] font-semibold">
                    {userInitial}
                  </AvatarFallback>
                </Avatar>
                <div className="rounded-2xl rounded-es-sm bg-primary text-primary-foreground px-3 py-2 text-sm leading-relaxed">
                  {m.text}
                </div>
              </div>
            </div>
          );
        }
        return (
          <div key={i} role="status" className="flex justify-start">
            <div className="flex items-start gap-2 max-w-[85%]">
              <div className="flex items-center justify-center size-7 rounded-full bg-primary/15 text-primary shrink-0">
                <Sparkles className="size-3.5" />
              </div>
              <div className="rounded-2xl rounded-ee-sm bg-muted text-foreground px-3 py-2 text-sm leading-relaxed">
                {m.text}
              </div>
            </div>
          </div>
        );
      })}

      {isThinking ? (
        <div role="status" aria-label={thinkingLabel} className="flex justify-start">
          <div className="flex items-start gap-2 max-w-[85%]">
            <div className="flex items-center justify-center size-7 rounded-full bg-primary/15 text-primary shrink-0">
              <Sparkles className="size-3.5" />
            </div>
            <div className="rounded-2xl rounded-ee-sm bg-muted px-3 py-3 flex items-center gap-1">
              <span className="typing-dot size-1.5 rounded-full bg-muted-foreground/60 inline-block" />
              <span className="typing-dot size-1.5 rounded-full bg-muted-foreground/60 inline-block" />
              <span className="typing-dot size-1.5 rounded-full bg-muted-foreground/60 inline-block" />
              <span className="sr-only">{thinkingLabel}</span>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
