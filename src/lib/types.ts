// Shared domain types for the Edify LMS MVP prototype.

export type Locale = "en" | "ar";
export type ArabicDialect = "sa" | "eg"; // Saudi / Egyptian

export type LanguageState = {
  locale: Locale;
  dialect: ArabicDialect; // only meaningful when locale === "ar"
};

export type CourseLevel = "Beginner" | "Intermediate" | "Advanced";

export type LessonType = "video" | "reading" | "quiz";

export interface Lesson {
  id: string;
  title: string;
  type: LessonType;
  durationMin: number;
  /** localized titles keyed by locale */
  titleAr?: string;
  description: string;
  descriptionAr?: string;
  /** mock video metadata */
  videoThumb?: string;
  /** transcript snippet for AI assistant context */
  transcript: string;
  transcriptAr?: string;
  /** downloadable resources */
  resources?: { name: string; type: "pdf" | "zip" | "slides" }[];
}

export interface CourseSection {
  id: string;
  title: string;
  titleAr?: string;
  lessons: Lesson[];
}

export interface Instructor {
  id: string;
  name: string;
  nameAr?: string;
  title: string;
  titleAr?: string;
  bio: string;
  bioAr?: string;
  avatar: string;
  rating: number;
  students: number;
  coursesCount: number;
}

export interface Review {
  id: string;
  studentName: string;
  rating: number;
  date: string;
  comment: string;
  commentAr?: string;
}

export interface QAItem {
  id: string;
  question: string;
  questionAr?: string;
  answer: string;
  answerAr?: string;
  studentName: string;
  upvotes: number;
  date: string;
}

export interface FAQItem {
  id: string;
  question: string;
  questionAr?: string;
  answer: string;
  answerAr?: string;
}

export interface Course {
  id: string;
  title: string;
  titleAr: string;
  subtitle: string;
  subtitleAr: string;
  description: string;
  descriptionAr: string;
  category: string;
  categoryAr: string;
  level: CourseLevel;
  language: string;
  thumbnail: string;
  /** hex or tailwind gradient class for placeholder */
  accent: string;
  price: number;
  originalPrice?: number;
  rating: number;
  ratingCount: number;
  enrolledCount: number;
  totalHours: number;
  totalLessons: number;
  lastUpdated: string;
  instructorId: string;
  skills: string[];
  skillsAr: string[];
  sections: CourseSection[];
  reviews: Review[];
  qa: QAItem[];
  faqs: FAQItem[];
  includes: {
    hoursOfVideo: number;
    articles: number;
    downloadableResources: number;
    mobileAccess: boolean;
    certificate: boolean;
  };
  tags: string[]; // for semantic search mapping
  bestseller?: boolean; // optional badge
  isNew?: boolean; // optional "new" badge
}

export interface OnboardingAnswers {
  intent?: "improve" | "learn-new";
  roleId?: string;
  skillIds: string[];
  educationLevel?: string;
}

export interface Role {
  id: string;
  label: string;
  labelAr: string;
  /** skills surfaced when this role is chosen */
  skillIds: string[];
  /** courses recommended when this role is chosen */
  recommendedCourseIds: string[];
  icon: string; // lucide icon name
}

export interface Skill {
  id: string;
  label: string;
  labelAr: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  questionAr?: string;
  options: string[];
  optionsAr?: string[];
  correctIndex: number;
  explanation: string;
  explanationAr?: string;
}

export interface Quiz {
  id: string;
  title: string;
  titleAr?: string;
  courseId: string;
  sectionId?: string;
  lessonId?: string;
  passingScore: number; // percent
  questions: QuizQuestion[];
}

export interface Certificate {
  id: string;
  courseId: string;
  issuedOn: string;
  score: number;
}

export interface CartItem {
  courseId: string;
  addedAt: number;
}

export type RouteName =
  | "auth"
  | "onboarding"
  | "home"
  | "search"
  | "course-landing"
  | "course-player"
  | "my-learning"
  | "cart"
  | "checkout"
  | "checkout-confirmation"
  | "quiz"
  | "instructor-profile"
  | "ai-planner"
  | "ai-coach"
  | "consultations"
  | "my-plan"
  | "certifications";

export interface Route {
  name: RouteName;
  params?: Record<string, string>;
}

export interface LessonProgress {
  completed: boolean;
  /** position in seconds (mock) */
  positionSec: number;
  notes: { id: string; text: string; timestampSec: number; createdAt: number }[];
}

export interface CourseProgress {
  /** keyed by lessonId */
  lessons: Record<string, LessonProgress>;
}

// ---------- Consultations ----------
export interface ConsultationInstructor {
  id: string;
  name: string;
  nameAr: string;
  title: string;
  titleAr: string;
  bio: string;
  bioAr: string;
  avatar: string;
  rating: number;
  reviewsCount: number;
  field: string;
  fieldAr: string;
  category: string;
  categoryAr: string;
  pricePerSession: number;
  sessionDurationMin: number;
  availableDays: string[];
  availableDaysAr?: string[];
  timeSlots: string[];
  specialties: string[];
  specialtiesAr: string[];
  languages: string[];
  languagesAr: string[];
  experienceYears: number;
}

export interface ScheduledConsultation {
  id: string;
  instructorId: string;
  studentName: string;
  studentEmail: string;
  topic: string;
  date: string; // YYYY-MM-DD
  timeSlot: string;
  durationMin: number;
  price: number;
  status: "upcoming" | "completed" | "cancelled";
  meetingUrl?: string;
  notes?: string;
  createdAt: number;
}

// ---------- Plans ----------
export interface PlanWeek {
  week: number;
  focus: string;
  focusAr: string;
  hours: number;
  courseIds: string[];
  milestone?: string;
  milestoneAr?: string;
}

export interface SavedPlan {
  id: string;
  title: string;
  titleAr?: string;
  goal: string;
  createdAt: number;
  timelineWeeks: number;
  weeklyHours: number;
  totalHours: number;
  totalCourses: number;
  weeks: PlanWeek[];
  courseIds: string[];
  tips: string[];
  tipsAr?: string[];
  confidence?: number;
  isAiGenerated: boolean;
  completedWeeks: number[];
}

