import type { Route, RouteName } from "@/lib/types";

export type AppRouter = {
  push: (href: string) => void;
  replace: (href: string) => void;
  back: () => void;
  forward: () => void;
  prefetch?: (href: string) => void;
};

let globalRouter: AppRouter | null = null;

export function registerAppRouter(router: AppRouter | null) {
  globalRouter = router;
}

export function getAppRouter(): AppRouter | null {
  return globalRouter;
}

/**
 * Converts internal store route state to a standard Next.js URL path.
 */
export function routeToPath(name: RouteName, params?: Record<string, string>): string {
  switch (name) {
    case "home":
      return "/";
    case "auth":
      return params?.mode === "signup" ? "/signup" : "/login";
    case "onboarding":
      return "/onboarding";
    case "search":
      return "/search";
    case "course-landing":
      return params?.courseId ? `/courses/${encodeURIComponent(params.courseId)}` : "/courses";
    case "course-player":
      return params?.courseId ? `/courses/${encodeURIComponent(params.courseId)}/learn` : "/";
    case "quiz":
      return params?.courseId ? `/courses/${encodeURIComponent(params.courseId)}/quiz` : "/quiz";
    case "my-learning":
      return params?.tab ? `/my-learning?tab=${encodeURIComponent(params.tab)}` : "/my-learning";
    case "cart":
      return "/cart";
    case "checkout":
      return "/checkout";
    case "checkout-confirmation": {
      const q = new URLSearchParams();
      if (params?.orderId) q.set("orderId", params.orderId);
      if (params?.amount) q.set("amount", params.amount);
      const qs = q.toString();
      return `/checkout/confirmation${qs ? `?${qs}` : ""}`;
    }
    case "instructor-profile":
      return params?.instructorId ? `/instructors/${encodeURIComponent(params.instructorId)}` : "/search";
    case "ai-planner":
      return "/ai-planner";
    case "ai-coach":
      return "/ai-coach";
    case "consultations":
      return "/consultations";
    case "my-plan":
      return "/my-plan";
    case "certifications":
      return "/certifications";
    case "profile":
      return "/profile";
    default:
      return "/";
  }
}

/**
 * Converts a Next.js pathname and search parameters to internal store Route representation.
 */
export function pathToRoute(pathname: string, searchParams?: URLSearchParams | null): Route {
  const normalized = pathname.replace(/\/+$/, "") || "/";

  if (normalized === "/") {
    return { name: "home" };
  }
  if (normalized === "/login") {
    return { name: "auth", params: { mode: "login" } };
  }
  if (normalized === "/signup") {
    return { name: "auth", params: { mode: "signup" } };
  }
  if (normalized === "/auth") {
    const mode = searchParams?.get("mode") === "signup" ? "signup" : "login";
    return { name: "auth", params: { mode } };
  }
  if (normalized === "/onboarding") {
    return { name: "onboarding" };
  }
  if (normalized === "/search" || normalized === "/courses") {
    return { name: "search" };
  }
  if (normalized === "/my-learning") {
    const tab = searchParams?.get("tab") ?? undefined;
    return { name: "my-learning", params: tab ? { tab } : undefined };
  }
  if (normalized === "/cart") {
    return { name: "cart" };
  }
  if (normalized === "/checkout") {
    return { name: "checkout" };
  }
  if (normalized === "/checkout/confirmation") {
    const orderId = searchParams?.get("orderId") ?? "";
    const amount = searchParams?.get("amount") ?? "";
    return { name: "checkout-confirmation", params: { orderId, amount } };
  }
  if (normalized === "/ai-planner") {
    return { name: "ai-planner" };
  }
  if (normalized === "/ai-coach") {
    return { name: "ai-coach" };
  }
  if (normalized === "/consultations") {
    return { name: "consultations" };
  }
  if (normalized === "/my-plan") {
    return { name: "my-plan" };
  }
  if (normalized === "/certifications") {
    return { name: "certifications" };
  }
  if (normalized === "/profile") {
    return { name: "profile" };
  }
  if (normalized === "/quiz") {
    const courseId = searchParams?.get("courseId") ?? "";
    return { name: "quiz", params: courseId ? { courseId } : undefined };
  }

  // Nested dynamic routes
  // /courses/[courseId]/learn
  const learnMatch = normalized.match(/^\/courses\/([^/]+)\/learn$/);
  if (learnMatch) {
    return { name: "course-player", params: { courseId: decodeURIComponent(learnMatch[1]) } };
  }

  // /courses/[courseId]/quiz
  const quizMatch = normalized.match(/^\/courses\/([^/]+)\/quiz$/);
  if (quizMatch) {
    return { name: "quiz", params: { courseId: decodeURIComponent(quizMatch[1]) } };
  }

  // /courses/[courseId]
  const courseMatch = normalized.match(/^\/courses\/([^/]+)$/);
  if (courseMatch) {
    return { name: "course-landing", params: { courseId: decodeURIComponent(courseMatch[1]) } };
  }

  // /instructors/[instructorId]
  const instructorMatch = normalized.match(/^\/instructors\/([^/]+)$/);
  if (instructorMatch) {
    return { name: "instructor-profile", params: { instructorId: decodeURIComponent(instructorMatch[1]) } };
  }

  return { name: "home" };
}
