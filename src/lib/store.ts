import { create } from "zustand";
import type {
  Route,
  RouteName,
  Locale,
  ArabicDialect,
  OnboardingAnswers,
  CartItem,
  Certificate,
  CourseProgress,
  QAItem,
  LanguageState,
  ScheduledConsultation,
  SavedPlan,
} from "@/lib/types";
import { courses, getCourse, getAllLessons, roles, demoScheduledConsultations } from "@/lib/mock-data";
import { getAppRouter, routeToPath } from "@/lib/routes";

/**
 * Edify app store — single source of truth for the MVP prototype.
 * In-memory only (no localStorage) per the build brief.
 */

interface User {
  id: string;
  name: string;
  email: string;
  isNew: boolean; // newly signed up → onboarding
}

interface ToastMsg {
  id: string;
  title: string;
  description?: string;
  variant?: "default" | "success" | "destructive";
}

interface AppState {
  // --- i18n
  locale: Locale;
  dialect: ArabicDialect;
  setLocale: (l: Locale) => void;
  setDialect: (d: ArabicDialect) => void;

  // --- routing (SPA within single Next.js route)
  route: Route;
  history: Route[];
  navigate: (name: RouteName, params?: Record<string, string>) => void;
  goBack: () => void;

  // --- auth
  user: User | null;
  signUp: (name: string, email: string) => void;
  logIn: (email: string) => void;
  loginAsDemo: () => void;
  updateUser: (patch: Partial<User>) => void;
  logOut: () => void;

  // --- onboarding
  onboardingStep: number; // 0..4
  onboardingComplete: boolean;
  onboardingAnswers: OnboardingAnswers;
  setOnboardingAnswers: (patch: Partial<OnboardingAnswers>) => void;
  setOnboardingStep: (n: number) => void;
  nextOnboardingStep: () => void;
  prevOnboardingStep: () => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;

  // --- cart
  cart: CartItem[];
  addToCart: (courseId: string) => void;
  removeFromCart: (courseId: string) => void;
  clearCart: () => void;
  isInCart: (courseId: string) => boolean;

  // --- wishlist / saved
  savedCourseIds: string[];
  toggleSaved: (courseId: string) => void;
  isSaved: (courseId: string) => boolean;

  // --- enrollments (purchased courses)
  enrolledCourseIds: string[];
  enroll: (courseId: string) => void;
  isEnrolled: (courseId: string) => boolean;

  // --- course progress (per course, per lesson)
  progress: Record<string, CourseProgress>; // courseId -> CourseProgress
  markLessonComplete: (courseId: string, lessonId: string) => void;
  setLessonPosition: (courseId: string, lessonId: string, sec: number) => void;
  getCourseProgress: (courseId: string) => number; // 0..100
  getCurrentLessonId: (courseId: string) => string | undefined; // auto-resume target

  // --- notes
  addNote: (courseId: string, lessonId: string, text: string, sec: number) => void;

  // --- Q&A (extra questions added by user)
  extraQA: Record<string, QAItem[]>; // courseId -> extra questions
  addQuestion: (courseId: string, question: string, studentName: string) => void;

  // --- certificates
  certificates: Certificate[];
  issueCertificate: (courseId: string, score?: number) => void;

  // --- quiz state (per quiz attempt)
  quizState:
    | {
        quizId: string;
        courseId: string;
        answers: Record<string, number>; // questionId -> selected index
        current: number;
        submitted: boolean;
        score: number;
      }
    | null;
  startQuiz: (quizId: string, courseId: string) => void;
  answerQuizQuestion: (questionId: string, index: number) => void;
  nextQuizQuestion: () => void;
  prevQuizQuestion: () => void;
  submitQuiz: (totalQuestions: number, correct: number, passing: number) => void;
  resetQuiz: () => void;

  // --- toasts (lightweight)
  toasts: ToastMsg[];
  pushToast: (t: Omit<ToastMsg, "id">) => void;
  dismissToast: (id: string) => void;

  // --- confetti trigger (a counter that components can subscribe to)
  confettiToken: number;
  fireConfetti: () => void;

  // --- consultations
  scheduledConsultations: ScheduledConsultation[];
  bookConsultation: (c: Omit<ScheduledConsultation, "id" | "createdAt" | "status">) => string;
  cancelConsultation: (id: string) => void;
  rescheduleConsultation: (id: string, date: string, timeSlot: string) => void;

  // --- study plans (My Plan & AI Planner)
  savedPlans: SavedPlan[];
  activePlanId: string | null;
  savePlan: (p: Omit<SavedPlan, "id" | "createdAt"> | SavedPlan) => string;
  deletePlan: (id: string) => void;
  setActivePlan: (id: string | null) => void;
  togglePlanWeekComplete: (planId: string, weekNumber: number) => void;
}

let toastSeq = 0;
let userSeq = 0;

export const initialDemoPlan: SavedPlan = {
  id: "plan-demo-1",
  title: "Frontend Developer Roadmap",
  titleAr: "خطة إتقان تطوير الواجهات الأمامية",
  goal: "Become a professional Frontend Developer building modern React and TypeScript applications",
  createdAt: Date.now() - 86400000 * 3,
  timelineWeeks: 12,
  weeklyHours: 6,
  totalHours: 72,
  totalCourses: 4,
  weeks: [
    { week: 1, focus: "HTML5 Semantic Structure & Modern CSS", focusAr: "بنية HTML5 الدلالية وتنسيقات CSS الحديثة", hours: 6, courseIds: ["c-html-css"], milestone: "Build accessible responsive landing page", milestoneAr: "بناء صفحة هبوط متجاوبة وسهلة الوصول" },
    { week: 2, focus: "CSS Grid, Flexbox & Responsive Layouts", focusAr: "تخطيطات CSS المتقدمة وشبكات Flexbox", hours: 6, courseIds: ["c-html-css"] },
    { week: 3, focus: "JavaScript Fundamentals & DOM Manipulation", focusAr: "أساسيات جافاسكربت والتحكم بالـ DOM", hours: 6, courseIds: ["c-js"], milestone: "Pass practice JS coding quiz", milestoneAr: "اجتياز اختبار جافاسكربت العملي" },
    { week: 4, focus: "Async JavaScript, Promises & Fetch APIs", focusAr: "جافاسكربت غير المتزامن والـ APIs", hours: 6, courseIds: ["c-js"] },
    { week: 5, focus: "React Components, Props & Hooks", focusAr: "مكونات رياكت والـ Hooks الأساسية", hours: 6, courseIds: ["c-react"] },
    { week: 6, focus: "React State Management & Forms", focusAr: "إدارة الحالة والنماذج في رياكت", hours: 6, courseIds: ["c-react"], milestone: "Build interactive React dashboard", milestoneAr: "بناء لوحة تحكم تفاعلية برياكت" },
    { week: 7, focus: "TypeScript Basics & Typing Components", focusAr: "أساسيات تايبسكربت وتنميط المكونات", hours: 6, courseIds: ["c-ts"] },
    { week: 8, focus: "TypeScript Advanced Generics & Narrowing", focusAr: "الأنماط المتقدمة في تايبسكربت", hours: 6, courseIds: ["c-ts"] },
    { week: 9, focus: "Testing & Code Quality with Vitest", focusAr: "اختبارات الجودة وضمان الكود", hours: 6, courseIds: ["c-react"], milestone: "Achieve 80% test coverage on project", milestoneAr: "تحقيق تغطية اختبارات 80% للمشروع" },
    { week: 10, focus: "Performance Optimization & Next.js Architecture", focusAr: "تحسين الأداء ومعمارية Next.js", hours: 6, courseIds: ["c-react"] },
    { week: 11, focus: "UI/UX Systems & Accessibility (a11y)", focusAr: "أنظمة التصميم وإتاحة الوصول", hours: 6, courseIds: ["c-figma"] },
    { week: 12, focus: "Capstone Portfolio Deployment & Review", focusAr: "نشر المشروع النهائي ومراجعته", hours: 6, courseIds: ["c-react", "c-ts"], milestone: "Publish portfolio & schedule expert consultation", milestoneAr: "نشر المعرض وجدولة استشارة مع خبير" },
  ],
  courseIds: ["c-html-css", "c-js", "c-react", "c-ts"],
  tips: [
    "Study in 25-minute focused blocks (Pomodoro) with 5-minute breaks.",
    "Revisit yesterday's lesson before starting a new one.",
    "Schedule a consultation with Omar Farouk when reaching week 6 to review your code."
  ],
  tipsAr: [
    "ادرس في فترات مركّزة 25 دقيقة (بومودورو) مع 5 دقائق راحة.",
    "راجع درس أمس قبل بدء درس جديد.",
    "احجز استشارة مع عمر فاروق عند وصولك للأسبوع السادس لمراجعة الكود."
  ],
  confidence: 94,
  isAiGenerated: true,
  completedWeeks: [1, 2],
};

export const useAppStore = create<AppState>((set, get) => ({
  // ---------- i18n
  locale: "en",
  dialect: "sa",
  setLocale: (l) => set({ locale: l }),
  setDialect: (d) => set({ dialect: d }),

  // ---------- routing
  route: { name: "home" },
  history: [],
  navigate: (name, params) => {
    set((s) => ({
      route: { name, params },
      history: [...s.history, s.route],
    }));
    const targetPath = routeToPath(name, params);
    const router = getAppRouter();
    if (router) {
      router.push(targetPath);
    } else if (typeof window !== "undefined" && window.location.pathname !== targetPath) {
      window.history.pushState(null, "", targetPath);
    }
    // scroll to top on view change
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  },
  goBack: () => {
    const router = getAppRouter();
    const hist = get().history;
    if (router && typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    if (hist.length === 0) {
      get().navigate("home");
      return;
    }
    const prev = hist[hist.length - 1];
    set({ route: prev, history: hist.slice(0, -1) });
    const targetPath = routeToPath(prev.name, prev.params);
    if (router) {
      router.push(targetPath);
    }
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  },

  // ---------- auth
  user: null,
  signUp: (name, email) => {
    userSeq += 1;
    set({
      user: { id: `u-${userSeq}`, name: name || "Learner", email, isNew: true },
      route: { name: "onboarding" },
      history: [],
      onboardingStep: 0,
      onboardingComplete: false,
      onboardingAnswers: { skillIds: [] },
    });
    getAppRouter()?.push("/onboarding");
  },
  logIn: (email) => {
    userSeq += 1;
    // Returning user → home (and seed some demo progress so it feels alive)
    const demoProgress: Record<string, CourseProgress> = { ...get().progress };
    if (!demoProgress["c-html-css"]) {
      demoProgress["c-html-css"] = {
        lessons: {
          l1: { completed: true, positionSec: 480, notes: [] },
          l2: { completed: true, positionSec: 720, notes: [] },
          l3: { completed: false, positionSec: 240, notes: [] },
        },
      };
    }
    set({
      user: { id: `u-${userSeq}`, name: "Layla Hassan", email, isNew: false },
      route: { name: "home" },
      history: [],
      enrolledCourseIds: get().enrolledCourseIds.includes("c-html-css")
        ? get().enrolledCourseIds
        : [...get().enrolledCourseIds, "c-html-css"],
      progress: demoProgress,
    });
    getAppRouter()?.push("/");
  },
  loginAsDemo: () => {
    userSeq += 1;
    // Demo student: pre-seeded with enrolled course + progress + a certificate
    const demoProgress: Record<string, CourseProgress> = {
      "c-html-css": {
        lessons: {
          l1: { completed: true, positionSec: 480, notes: [{ id: "n1", text: "Box model click moment.", timestampSec: 320, createdAt: Date.now() }] },
          l2: { completed: true, positionSec: 720, notes: [] },
          l3: { completed: false, positionSec: 240, notes: [] },
        },
      },
      "c-js": {
        lessons: {
          l1: { completed: true, positionSec: 600, notes: [] },
          l2: { completed: false, positionSec: 180, notes: [] },
        },
      },
    };
    set({
      user: { id: `u-demo`, name: "Layla Hassan", email: "layla@edify.demo", isNew: false },
      route: { name: "home" },
      history: [],
      enrolledCourseIds: ["c-html-css", "c-js"],
      progress: demoProgress,
      savedCourseIds: ["c-react", "c-figma"],
      onboardingComplete: true,
      onboardingAnswers: {
        intent: "improve",
        roleId: "frontend-dev",
        skillIds: ["react", "typescript"],
        educationLevel: "bachelors",
      },
      scheduledConsultations: demoScheduledConsultations,
      savedPlans: [initialDemoPlan],
      activePlanId: initialDemoPlan.id,
    });
    getAppRouter()?.push("/");
  },
  updateUser: (patch) => {
    set((s) => ({
      user: s.user ? { ...s.user, ...patch } : null,
    }));
  },
  logOut: () => {
    set({
      user: null,
      route: { name: "auth" },
      history: [],
      cart: [],
      enrolledCourseIds: [],
      progress: {},
      savedCourseIds: [],
      certificates: [],
      onboardingComplete: false,
      onboardingAnswers: { skillIds: [] },
      onboardingStep: 0,
      scheduledConsultations: [],
      savedPlans: [],
      activePlanId: null,
    });
    getAppRouter()?.push("/login");
  },

  // ---------- onboarding
  onboardingStep: 0,
  onboardingComplete: false,
  onboardingAnswers: { skillIds: [] },
  setOnboardingAnswers: (patch) =>
    set((s) => ({ onboardingAnswers: { ...s.onboardingAnswers, ...patch } })),
  setOnboardingStep: (n) => set({ onboardingStep: n }),
  nextOnboardingStep: () => set((s) => ({ onboardingStep: Math.min(s.onboardingStep + 1, 4) })),
  prevOnboardingStep: () => set((s) => ({ onboardingStep: Math.max(s.onboardingStep - 1, 0) })),
  completeOnboarding: () => {
    // Auto-enroll the recommended courses so the home page feels alive
    const roleId = get().onboardingAnswers.roleId;
    if (roleId) {
      const role = roles.find((r) => r.id === roleId);
      if (role) {
        const enrolled = [...get().enrolledCourseIds];
        for (const cid of role.recommendedCourseIds.slice(0, 2)) {
          if (!enrolled.includes(cid)) enrolled.push(cid);
        }
        set({ enrolledCourseIds: enrolled });
      }
    }
    set({ onboardingComplete: true, route: { name: "home" }, history: [] });
    getAppRouter()?.push("/");
  },
  resetOnboarding: () =>
    set({ onboardingStep: 0, onboardingComplete: false, onboardingAnswers: { skillIds: [] } }),

  // ---------- cart
  cart: [],
  addToCart: (courseId) =>
    set((s) =>
      s.cart.some((c) => c.courseId === courseId)
        ? s
        : { cart: [...s.cart, { courseId, addedAt: Date.now() }] }
    ),
  removeFromCart: (courseId) =>
    set((s) => ({ cart: s.cart.filter((c) => c.courseId !== courseId) })),
  clearCart: () => set({ cart: [] }),
  isInCart: (courseId) => get().cart.some((c) => c.courseId === courseId),

  // ---------- saved
  savedCourseIds: [],
  toggleSaved: (courseId) =>
    set((s) => ({
      savedCourseIds: s.savedCourseIds.includes(courseId)
        ? s.savedCourseIds.filter((id) => id !== courseId)
        : [...s.savedCourseIds, courseId],
    })),
  isSaved: (courseId) => get().savedCourseIds.includes(courseId),

  // ---------- enrollments
  enrolledCourseIds: [],
  enroll: (courseId) =>
    set((s) => ({
      enrolledCourseIds: s.enrolledCourseIds.includes(courseId)
        ? s.enrolledCourseIds
        : [...s.enrolledCourseIds, courseId],
    })),
  isEnrolled: (courseId) => get().enrolledCourseIds.includes(courseId),

  // ---------- progress
  progress: {},
  markLessonComplete: (courseId, lessonId) =>
    set((s) => {
      const cp = s.progress[courseId] ?? { lessons: {} };
      const lp = cp.lessons[lessonId] ?? { completed: false, positionSec: 0, notes: [] };
      return {
        progress: {
          ...s.progress,
          [courseId]: {
            ...cp,
            lessons: { ...cp.lessons, [lessonId]: { ...lp, completed: true } },
          },
        },
      };
    }),
  setLessonPosition: (courseId, lessonId, sec) =>
    set((s) => {
      const cp = s.progress[courseId] ?? { lessons: {} };
      const lp = cp.lessons[lessonId] ?? { completed: false, positionSec: 0, notes: [] };
      return {
        progress: {
          ...s.progress,
          [courseId]: {
            ...cp,
            lessons: { ...cp.lessons, [lessonId]: { ...lp, positionSec: sec } },
          },
        },
      };
    }),
  getCourseProgress: (courseId) => {
    const course = getCourse(courseId);
    if (!course) return 0;
    const cp = get().progress[courseId];
    if (!cp) return 0;
    const all = getAllLessons(course);
    if (all.length === 0) return 0;
    const done = all.filter((l) => cp.lessons[l.id]?.completed).length;
    return Math.round((done / all.length) * 100);
  },
  getCurrentLessonId: (courseId) => {
    const course = getCourse(courseId);
    if (!course) return undefined;
    const cp = get().progress[courseId];
    // Find first lesson that is not completed. If all complete, return last lesson.
    for (const sec of course.sections) {
      for (const l of sec.lessons) {
        if (!cp?.lessons[l.id]?.completed) return l.id;
      }
    }
    // all complete — return last lesson
    const all = getAllLessons(course);
    return all[all.length - 1]?.id;
  },

  // ---------- notes
  addNote: (courseId, lessonId, text, sec) =>
    set((s) => {
      const cp = s.progress[courseId] ?? { lessons: {} };
      const lp = cp.lessons[lessonId] ?? { completed: false, positionSec: sec, notes: [] };
      return {
        progress: {
          ...s.progress,
          [courseId]: {
            ...cp,
            lessons: {
              ...cp.lessons,
              [lessonId]: {
                ...lp,
                notes: [
                  ...lp.notes,
                  { id: `n-${Date.now()}`, text, timestampSec: sec, createdAt: Date.now() },
                ],
              },
            },
          },
        },
      };
    }),

  // ---------- Q&A
  extraQA: {},
  addQuestion: (courseId, question, studentName) =>
    set((s) => {
      const list = s.extraQA[courseId] ?? [];
      const item: QAItem = {
        id: `qa-${Date.now()}`,
        question,
        questionAr: question,
        answer: "Our team will get back to you soon. (This is a mock response in the MVP.)",
        answerAr: "فريقنا بيرد عليك قريب. (ده رد تجريبي بالنموذج الأولي.)",
        studentName,
        upvotes: 0,
        date: new Date().toISOString().slice(0, 10),
      };
      return { extraQA: { ...s.extraQA, [courseId]: [item, ...list] } };
    }),

  // ---------- certificates
  certificates: [],
  issueCertificate: (courseId, score = 100) =>
    set((s) => {
      if (s.certificates.some((c) => c.courseId === courseId)) return s;
      return {
        certificates: [
          ...s.certificates,
          {
            id: `cert-${Date.now()}`,
            courseId,
            issuedOn: new Date().toISOString(),
            score,
          },
        ],
      };
    }),

  // ---------- quiz
  quizState: null,
  startQuiz: (quizId, courseId) =>
    set({
      quizState: { quizId, courseId, answers: {}, current: 0, submitted: false, score: 0 },
    }),
  answerQuizQuestion: (questionId, index) =>
    set((s) =>
      s.quizState
        ? {
            quizState: {
              ...s.quizState,
              answers: { ...s.quizState.answers, [questionId]: index },
            },
          }
        : s
    ),
  nextQuizQuestion: () =>
    set((s) =>
      s.quizState ? { quizState: { ...s.quizState, current: s.quizState.current + 1 } } : s
    ),
  prevQuizQuestion: () =>
    set((s) =>
      s.quizState
        ? { quizState: { ...s.quizState, current: Math.max(0, s.quizState.current - 1) } }
        : s
    ),
  submitQuiz: (totalQuestions, correct, passing) => {
    const score = Math.round((correct / totalQuestions) * 100);
    const passed = score >= passing;
    set((s) =>
      s.quizState
        ? { quizState: { ...s.quizState, submitted: true, score } }
        : s
    );
    // If passed, issue certificate for the course
    if (passed) {
      const courseId = get().quizState?.courseId;
      if (courseId) {
        // mark all lessons complete as a bonus
        const course = getCourse(courseId);
        if (course) {
          for (const sec of course.sections) {
            for (const l of sec.lessons) {
              get().markLessonComplete(courseId, l.id);
            }
          }
        }
        get().issueCertificate(courseId, score);
        get().fireConfetti();
      }
    }
  },
  resetQuiz: () => {
    const qs = get().quizState;
    if (qs) {
      set({ quizState: { ...qs, answers: {}, current: 0, submitted: false, score: 0 } });
    } else {
      set({ quizState: null });
    }
  },

  // ---------- toasts
  toasts: [],
  pushToast: (t) => {
    toastSeq += 1;
    const id = `t-${toastSeq}`;
    set((s) => ({ toasts: [...s.toasts, { ...t, id }] }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) }));
    }, 3200);
  },
  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })),

  // ---------- confetti
  confettiToken: 0,
  fireConfetti: () => set((s) => ({ confettiToken: s.confettiToken + 1 })),

  // ---------- consultations
  scheduledConsultations: demoScheduledConsultations,
  bookConsultation: (c) => {
    const id = `sc-${Date.now()}`;
    const newBooking: ScheduledConsultation = {
      ...c,
      id,
      status: "upcoming",
      createdAt: Date.now(),
      meetingUrl: `https://meet.google.com/edf-${Math.random().toString(36).substring(2, 7)}`,
    };
    set((s) => ({ scheduledConsultations: [newBooking, ...s.scheduledConsultations] }));
    return id;
  },
  cancelConsultation: (id) =>
    set((s) => ({
      scheduledConsultations: s.scheduledConsultations.map((c) =>
        c.id === id ? { ...c, status: "cancelled" } : c
      ),
    })),
  rescheduleConsultation: (id, date, timeSlot) =>
    set((s) => ({
      scheduledConsultations: s.scheduledConsultations.map((c) =>
        c.id === id ? { ...c, date, timeSlot, status: "upcoming" } : c
      ),
    })),

  // ---------- study plans
  savedPlans: [initialDemoPlan],
  activePlanId: initialDemoPlan.id,
  savePlan: (plan) => {
    const id = "id" in plan && plan.id ? plan.id : `plan-${Date.now()}`;
    const fullPlan: SavedPlan = {
      ...plan,
      id,
      createdAt: "createdAt" in plan && plan.createdAt ? plan.createdAt : Date.now(),
      completedWeeks: "completedWeeks" in plan && plan.completedWeeks ? plan.completedWeeks : [],
    };
    set((s) => {
      const existingIndex = s.savedPlans.findIndex((p) => p.id === id);
      const updated =
        existingIndex >= 0
          ? s.savedPlans.map((p, i) => (i === existingIndex ? fullPlan : p))
          : [fullPlan, ...s.savedPlans];
      return {
        savedPlans: updated,
        activePlanId: id,
      };
    });
    return id;
  },
  deletePlan: (id) =>
    set((s) => {
      const remaining = s.savedPlans.filter((p) => p.id !== id);
      return {
        savedPlans: remaining,
        activePlanId: s.activePlanId === id ? (remaining[0]?.id ?? null) : s.activePlanId,
      };
    }),
  setActivePlan: (id) => set({ activePlanId: id }),
  togglePlanWeekComplete: (planId, weekNumber) =>
    set((s) => ({
      savedPlans: s.savedPlans.map((p) => {
        if (p.id !== planId) return p;
        const isDone = p.completedWeeks.includes(weekNumber);
        const completedWeeks = isDone
          ? p.completedWeeks.filter((w) => w !== weekNumber)
          : [...p.completedWeeks, weekNumber].sort((a, b) => a - b);
        return { ...p, completedWeeks };
      }),
    })),
}));

/** Convenience hook: returns the active language state object. */
export function useLanguage(): LanguageState {
  const locale = useAppStore((s) => s.locale);
  const dialect = useAppStore((s) => s.dialect);
  return { locale, dialect };
}
