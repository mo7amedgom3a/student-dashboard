"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bot,
  Send,
  Sparkles,
  Trash2,
  Lightbulb,
  Target,
  BookOpen,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { useI18n } from "@/hooks/use-i18n";
import { courses, getCourse, getRole } from "@/lib/mock-data";
import type { Course, Locale } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

// ============================================================
// AiCoachScreen — a chat-based AI Learning Coach with MOCK
// responses (no real LLM). The coach gives contextual advice on
// study habits, motivation, career, course selection, and
// routines. Responses are keyword-matched and locale-aware
// (English + Saudi-Arabic). All state is in-memory React state.
// ============================================================

// ---------- types ----------

type CoachRole = "user" | "coach";

interface CoachAction {
  kind: "course" | "planner";
  courseId?: string;
  /** already localized at generation time */
  label: string;
}

interface Message {
  id: string;
  role: CoachRole;
  text: string;
  action?: CoachAction;
}

interface CoachContext {
  name: string;
  locale: Locale;
  roleId?: string;
  enrolledCourseIds: string[];
  enrolledCount: number;
}

interface CoachResponse {
  text: string;
  action?: CoachAction;
}

// ---------- keyword matching ----------

/** Split a message into lowercase word tokens (Unicode-aware, keeps apostrophes). */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^\p{L}\p{N}']+/u)
    .filter(Boolean);
}

/**
 * True if any keyword appears in the message. Single words are matched as
 * whole tokens (so "hi" won't match "this"); multi-word phrases use substring
 * matching. This keeps false positives low for both English and Arabic.
 */
function hasKeyword(text: string, keywords: readonly string[]): boolean {
  const lower = text.toLowerCase();
  const tokens = tokenize(text);
  return keywords.some((kw) => {
    const k = kw.toLowerCase();
    if (k.includes(" ")) return lower.includes(k);
    return tokens.includes(k);
  });
}

// ---------- course picker (uses mock catalog + user context) ----------

function pickNextCourse(ctx: CoachContext): Course | undefined {
  const enrolled = new Set(ctx.enrolledCourseIds);

  // 1. Role-based recommendation (first not-yet-enrolled, else first rec).
  if (ctx.roleId) {
    const role = getRole(ctx.roleId);
    if (role) {
      const recs = role.recommendedCourseIds
        .map((id) => getCourse(id))
        .filter((c): c is Course => Boolean(c));
      const notEnrolled = recs.find((c) => !enrolled.has(c.id));
      if (notEnrolled) return notEnrolled;
      if (recs[0]) return recs[0];
    }
  }

  // 2. Same category as the first enrolled course, not yet enrolled.
  if (enrolled.size > 0) {
    const first = getCourse(ctx.enrolledCourseIds[0]);
    if (first) {
      const sameCat = courses.find(
        (c) => c.category === first.category && !enrolled.has(c.id)
      );
      if (sameCat) return sameCat;
    }
  }

  // 3. Fallback to the catalog's first course.
  return courses[0];
}

// ---------- mock response generator (the core of this screen) ----------

const KEYWORDS = {
  thanks: {
    en: ["thanks", "thank", "thx", "appreciate", "ty"],
    ar: ["شكرا", "شكراً", "مشكور", "يعطيك", "تسلم", "تسلمي", "متشكر"],
  },
  hello: {
    en: ["hello", "hi", "hey", "yo", "salam", "marhaba", "start", "begin"],
    ar: ["مرحبا", "هلا", "أهلا", "اهلا", "أهلاً", "السلام", "سلام", "ابدأ", "يلا"],
  },
  planner: {
    en: ["plan", "planner", "roadmap", "study plan", "learning path"],
    ar: ["خطة", "مخطط", "خارطة", "جدول دراسة", "مخططي"],
  },
  career: {
    en: ["career", "job", "resume", "cv", "interview", "salary", "hire", "hiring", "work"],
    ar: ["مهنة", "مهنية", "مهني", "شغل", "وظيفة", "سيرة", "مقابلة", "راتب", "توظيف", "اشتغل", "اعمل"],
  },
  hours: {
    en: ["hours", "hour", "time", "schedule", "routine", "weekly", "week", "duration"],
    ar: ["ساعة", "ساعات", "وقت", "جدول", "روتين", "أسبوعيا", "أسبوع", "مدة", "كام ساعة", "كم ساعة"],
  },
  whatNext: {
    en: ["what next", "learn next", "which course", "recommend", "suggest", "next course", "next step", "should i learn"],
    ar: ["وش بعدين", "ايش بعدين", "وش أتعلّم", "وش اتعلم", "اقترح", "كورس جاي", "وش أدرس", "وش ادرس", "ايش أتعلم", "ايش اتعلم"],
  },
  stuck: {
    en: ["stuck", "confused", "hard", "difficult", "lost", "understand", "complicated", "tricky"],
    ar: ["تعلّقت", "علقت", "مو فاهم", "مش فاهم", "صعب", "صعبة", "معقد", "معقدة", "ضايع", "ما فهمت", "افهم"],
  },
  motivation: {
    en: ["motivation", "motivated", "give up", "frustrated", "demotivated", "unmotivated", "hopeless", "burnout", "bored", "tired"],
    ar: ["حماس", "أحمّس", "احمس", "فقدت", "يأس", "محبط", "تعبت", "ملل", "زهقت", "مكتئب", "أفقدت"],
  },
} as const;

/**
 * Generate a contextual MOCK coach response based on keyword matching.
 * NO real LLM. Returns locale-aware text (English or Saudi-Arabic) and an
 * optional action (navigate to a course or the AI Planner).
 */
function generateCoachResponse(userMessage: string, ctx: CoachContext): CoachResponse {
  const ar = ctx.locale === "ar";

  const kws = (cat: keyof typeof KEYWORDS): boolean => {
    const primary = ar ? KEYWORDS[cat].ar : KEYWORDS[cat].en;
    const secondary = ar ? KEYWORDS[cat].en : KEYWORDS[cat].ar;
    // Match the active locale's keywords first, then the other locale's so
    // a user typing English inside the Arabic UI (or vice versa) still gets
    // a relevant response.
    return hasKeyword(userMessage, primary) || hasKeyword(userMessage, secondary);
  };

  // --- Thanks ---
  if (kws("thanks")) {
    return ar
      ? { text: "العفو يا غالي! 🌟 أنا هنا أي وقت تحتاجني. استمر على الجهود الحلوة — تسوي أحسن مما تظن!" }
      : { text: "You're very welcome! 🌟 I'm here whenever you need me. Keep up the great work — you're doing better than you think!" };
  }

  // --- Hello / start ---
  if (kws("hello")) {
    return ar
      ? { text: `هلا ${ctx.name}! 👋 أنا مدرّب ماستري الذكي. أقدر أساعدك بخطط الدراسة والتحفيز وأسئلة المسار أو اختيار كورسك الجاي. إيش تحب تشتغل عليه اليوم؟` }
      : { text: `Hi ${ctx.name}! 👋 I'm your Edify AI Coach. I can help with study plans, staying motivated, career questions, or picking your next course. What would you like to work on today?` };
  }

  // --- Plan / planner / roadmap → direct to the AI Planner ---
  if (kws("planner")) {
    return ar
      ? {
          text: "أبي أبني لك خطة أسبوعية كاملة! روح لمخطط الذكاء (في قائمة استكشف) — بيبني لك جدول مخصص حسب هدفك وساعتك المتاحة وخطتك الزمنية. تحب آخذك له؟",
          action: { kind: "planner", label: "افتح المخطط الذكي" },
        }
      : {
          text: "I'd love to build you a full week-by-week plan! Head to the AI Planner (in the Explore menu) — it'll create a personalized schedule based on your goal, available hours, and timeline. Want me to take you there?",
          action: { kind: "planner", label: "Open AI Planner" },
        };
  }

  // --- Career / job / resume / interview ---
  if (kws("career")) {
    const role = ctx.roleId ? getRole(ctx.roleId) : undefined;
    const roleLabel = role
      ? ar
        ? role.labelAr
        : role.label
      : ar
        ? "مسارك المختار"
        : "your chosen path";
    return ar
      ? {
          text: `سؤال ممتاز! لمسار ${roleLabel}: ركّز على بناء 2-3 مشاريع بورتفوليو تُظهر أثر حقيقي، ساهم بمفتوح المصدر أو اكتب عمّا تتعلّم، وتمرّن على شرح قراراتك. الشهادة تساعد، لكن المشاريع هي اللي تجيب لك الوظيفة. تحب أقترح أفكار مشاريع بناءً على كورساتك؟`,
        }
      : {
          text: `Great question! For a ${roleLabel} career path: focus on building 2–3 portfolio projects that show real impact, contribute to open source or write about what you learn, and practice explaining your decisions. The certificate helps, but projects get you hired. Want me to suggest project ideas based on your courses?`,
        };
  }

  // --- Hours / time / schedule / routine ---
  if (kws("hours")) {
    return ar
      ? {
          text: "لأغلب المتعلّمين، 4-6 ساعات تركيز بالأسبوع هي الرقم المثالي — يكفي تبني زخم بدون احتراق. جرّب جلستين 45 دقيقة بأيام الأسبوع وجلسة 90 دقيقة بالويكند. الانتظام يتفوق على الكثافة! تحب أبني لك خطة أسبوعية؟ (جرّب المخطط الذكي!) 💪",
          action: { kind: "planner", label: "افتح المخطط الذكي" },
        }
      : {
          text: "For most learners, 4–6 focused hours per week is the sweet spot — enough to build momentum without burnout. Try two 45-min sessions on weekdays and one 90-min weekend session. Consistency beats intensity! Want me to build you a weekly plan? (Try the AI Planner!) 💪",
          action: { kind: "planner", label: "Open AI Planner" },
        };
  }

  // --- What next / recommend a course ---
  if (kws("whatNext")) {
    const course = pickNextCourse(ctx);
    if (course) {
      const title = ar ? course.titleAr : course.title;
      const skill = ar
        ? (course.skillsAr[0] ?? course.skills[0] ?? "")
        : (course.skills[0] ?? "");
      return ar
        ? {
            text: `بناءً على هدفك، أنصحك تبني أساس قوي أول. «${title}» خطوة ممتازة جاية — يغطي ${skill} وهو أساسي لمسارك. تحب أساعدك تخطط تسلسل كامل؟`,
            action: { kind: "course", courseId: course.id, label: "اعرض الكورس" },
          }
        : {
            text: `Based on your goal, I'd recommend building a strong foundation first. "${title}" is a great next step — it covers ${skill} which is essential for your path. Want me to help you plan a full sequence?`,
            action: { kind: "course", courseId: course.id, label: "View course" },
          };
    }
  }

  // --- Stuck / confused / hard ---
  if (kws("stuck")) {
    return ar
      ? {
          text: "التعلّق عند نقطة هو مكان التعلّم الحقيقي! جرّب: (1) أعد آخر دقيقتين من الدرس. (2) اشرح الفكرة بصوت عالي كأنك تدرّس أحد. (3) ابحث في تبويب الأسئلة — أحد ممكن سأل قبل. (4) اسأل المساعد الذكي داخل الكورس مع الدقيقة بالضبط. تقدر! 🎯",
        }
      : {
          text: "Getting stuck is where real learning happens! Try this: (1) Re-watch the last 2 minutes of the lesson. (2) Explain the concept out loud as if teaching someone. (3) Search the Q&A tab — someone may have asked. (4) Ask in the course's AI Assistant with the exact timestamp. You've got this! 🎯",
        };
  }

  // --- Motivation / give up / frustrated ---
  if (kws("motivation")) {
    return ar
      ? {
          text: "هبوط الحماس طبيعي تماماً — التعلّم ماراثون مو سباق. جرّب: اختر أصغر درس ممكن تالي (حتى 10 دقايق) وابدأ بس. الحركة تصنع الزخم. وصلت أبعد مما تظن! 💪",
        }
      : {
          text: "Motivation dips are completely normal — learning is a marathon, not a sprint. Try this: pick the smallest possible next lesson (even 10 minutes) and just start. Action creates momentum. You've already come further than you think! 💪",
        };
  }

  // --- Default / fallback ---
  return ar
    ? {
        text: "شي حلو نستكشفه! إليك طريقتي: قسمه لخطوات أصغر، حدد وقت ثابت، وتابع تقدّمك. تقدر تخبرني شوي أكثر عن إيش تحب تحقق؟ أقدر أعطي نصايح أدق بسياق أكبر. 💡",
      }
    : {
        text: "That's a great thing to explore! Here's how I'd approach it: break it into smaller steps, schedule a consistent time, and track your progress. Could you tell me a bit more about what you're trying to achieve? I can give more specific advice with a little more context. 💡",
      };
}

// ============================================================
// Component
// ============================================================

export function AiCoachScreen() {
  const { t, locale } = useI18n();
  const user = useAppStore((s) => s.user);
  const onboardingAnswers = useAppStore((s) => s.onboardingAnswers);
  const enrolledCourseIds = useAppStore((s) => s.enrolledCourseIds);
  const navigate = useAppStore((s) => s.navigate);

  const name = user?.name ?? "there";
  const roleId = onboardingAnswers.roleId;

  // Seed the conversation with a single greeting message from the coach.
  // Lazy initial state — runs once, no setState-in-effect needed.
  const [messages, setMessages] = useState<Message[]>(() => [
    {
      id: "m-greeting",
      role: "coach",
      text: t("aiCoach.greeting", { name }),
    },
  ]);
  const [draft, setDraft] = useState("");
  const [thinking, setThinking] = useState(false);

  // Refs (no assignment during render — only in effects / event handlers).
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const idSeq = useRef(0);
  const sendingRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const nextId = () => `m-${++idSeq.current}`;

  // Auto-scroll to the latest message whenever the message count or the
  // thinking flag changes. The effect body ONLY mutates `scrollRef.current`
  // (a DOM mutation) — it never calls setState, satisfying the
  // `react-hooks/set-state-in-effect` rule.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length, thinking]);

  // Clear any pending timeout on unmount to avoid setState after unmount.
  // (Cleanup-only effect — no setState in the body.)
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // --- Send a message (used by the Send button, Enter key, and chips) ---
  const sendMessage = (raw: string) => {
    const text = raw.trim();
    if (!text || sendingRef.current) return;

    sendingRef.current = true;

    const userMsg: Message = { id: nextId(), role: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setDraft("");
    setThinking(true);

    const ctx: CoachContext = {
      name,
      locale,
      roleId,
      enrolledCourseIds,
      enrolledCount: enrolledCourseIds.length,
    };

    // Simulated "thinking" delay (900–1300ms) using setTimeout INSIDE the
    // send handler — never inside an effect.
    const delay = 900 + Math.random() * 400;
    timeoutRef.current = setTimeout(() => {
      const resp = generateCoachResponse(text, ctx);
      const coachMsg: Message = {
        id: nextId(),
        role: "coach",
        text: resp.text,
        action: resp.action,
      };
      setMessages((prev) => [...prev, coachMsg]);
      setThinking(false);
      sendingRef.current = false;
      timeoutRef.current = null;
    }, delay);
  };

  const handleClear = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    sendingRef.current = false;
    setThinking(false);
    setMessages([
      { id: "m-greeting", role: "coach", text: t("aiCoach.greeting", { name }) },
    ]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(draft);
    }
  };

  const suggestions = [
    t("aiCoach.s1"),
    t("aiCoach.s2"),
    t("aiCoach.s3"),
    t("aiCoach.s4"),
    t("aiCoach.s5"),
    t("aiCoach.s6"),
  ];

  const showSuggestions = messages.length <= 1 && !thinking;
  const canSend = draft.trim().length > 0 && !thinking;

  const userInitial = (user?.name?.trim()?.[0] ?? "U").toUpperCase();

  const handleAction = (action: CoachAction) => {
    if (action.kind === "course" && action.courseId) {
      navigate("course-landing", { courseId: action.courseId });
    } else if (action.kind === "planner") {
      navigate("ai-planner");
    }
  };

  return (
    <div className="mx-auto flex h-[calc(100dvh-4rem)] w-full max-w-3xl flex-col overflow-hidden">
      {/* ---------- Header ---------- */}
      <header className="border-b border-border px-4 pb-3 pt-4 sm:px-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-bold leading-tight text-foreground">
                {t("aiCoach.title")}
              </h1>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {t("aiCoach.subtitle")}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            aria-label={t("aiCoach.clear")}
            className="shrink-0 text-muted-foreground hover:text-foreground"
          >
            <Trash2 className="h-4 w-4" />
            <span className="ms-1.5 hidden sm:inline">{t("aiCoach.clear")}</span>
          </Button>
        </div>
        <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Lightbulb className="h-3.5 w-3.5 shrink-0" />
          <span>{t("aiCoach.disclaimer")}</span>
        </div>
      </header>

      {/* ---------- Messages (scrollable) ---------- */}
      <div
        ref={scrollRef}
        role="log"
        aria-label={t("aiCoach.history")}
        className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-6"
      >
        {messages.map((m) => (
          <MessageBubble
            key={m.id}
            message={m}
            youLabel={t("aiCoach.you")}
            coachLabel={t("aiCoach.coach")}
            userInitial={userInitial}
            onAction={handleAction}
          />
        ))}

        {thinking && (
          <div
            aria-live="polite"
            aria-label={t("aiCoach.thinking")}
            className="flex items-end gap-2"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Bot className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2 rounded-2xl rounded-ss-md border border-border bg-card px-4 py-3">
              <span className="typing-dot h-2 w-2 rounded-full bg-muted-foreground/60" />
              <span className="typing-dot h-2 w-2 rounded-full bg-muted-foreground/60" />
              <span className="typing-dot h-2 w-2 rounded-full bg-muted-foreground/60" />
              <span className="ms-1 text-xs text-muted-foreground">
                {t("aiCoach.thinking")}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ---------- Suggestions + Input (bottom) ---------- */}
      <div className="border-t border-border bg-background px-4 py-3 sm:px-6">
        {showSuggestions && (
          <div className="mb-3">
            <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Lightbulb className="h-3.5 w-3.5" />
              <span>{t("aiCoach.suggestions")}</span>
            </div>
            <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => sendMessage(s)}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  <Lightbulb className="h-3 w-3 text-primary" />
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-end gap-2">
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={2}
            aria-label={t("aiCoach.placeholder")}
            placeholder={t("aiCoach.placeholder")}
            className="min-h-[44px] max-h-40 resize-none"
          />
          <Button
            type="button"
            size="icon"
            onClick={() => sendMessage(draft)}
            disabled={!canSend}
            aria-label={t("aiCoach.send")}
            className="h-10 w-10 shrink-0 rounded-full"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// ---------- Message bubble (presentational) ----------

interface MessageBubbleProps {
  message: Message;
  youLabel: string;
  coachLabel: string;
  userInitial: string;
  onAction: (action: CoachAction) => void;
}

function MessageBubble({
  message,
  youLabel,
  coachLabel,
  userInitial,
  onAction,
}: MessageBubbleProps) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex items-end justify-end gap-2" role="article" aria-label={youLabel}>
        <div className="max-w-[80%] rounded-2xl rounded-se-md bg-primary px-4 py-2.5 text-sm text-primary-foreground">
          <p className="whitespace-pre-wrap break-words">{message.text}</p>
        </div>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
          {userInitial}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-end gap-2" role="article" aria-label={coachLabel}>
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
        <Bot className="h-4 w-4" />
      </div>
      <div className="max-w-[80%] rounded-2xl rounded-ss-md border border-border bg-card px-4 py-2.5 text-sm text-foreground">
        <p className="whitespace-pre-wrap break-words">{message.text}</p>
        {message.action && (
          <button
            type="button"
            onClick={() => onAction(message.action!)}
            className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-primary transition-opacity hover:opacity-80"
          >
            {message.action.kind === "course" ? (
              <BookOpen className="h-3.5 w-3.5" />
            ) : (
              <Target className="h-3.5 w-3.5" />
            )}
            {message.action.label}
          </button>
        )}
      </div>
    </div>
  );
}
