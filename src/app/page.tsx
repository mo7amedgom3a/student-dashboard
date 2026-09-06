"use client";

import { useAppStore } from "@/lib/store";
import { DirSync } from "@/components/shared/DirSync";
import { ConfettiOverlay } from "@/components/shared/ConfettiOverlay";
import { ToastViewport } from "@/components/shared/ToastViewport";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AuthScreen } from "@/components/screens/AuthScreen";
import { OnboardingScreen } from "@/components/screens/OnboardingScreen";
import { HomeScreen } from "@/components/screens/HomeScreen";
import { SearchScreen } from "@/components/screens/SearchScreen";
import { CourseLandingScreen } from "@/components/screens/CourseLandingScreen";
import { CoursePlayerScreen } from "@/components/screens/CoursePlayerScreen";
import { MyLearningScreen } from "@/components/screens/MyLearningScreen";
import { CartScreen } from "@/components/screens/CartScreen";
import { CheckoutScreen } from "@/components/screens/CheckoutScreen";
import { CheckoutConfirmationScreen } from "@/components/screens/CheckoutConfirmationScreen";
import { QuizScreen } from "@/components/screens/QuizScreen";
import { InstructorProfileScreen } from "@/components/screens/InstructorProfileScreen";
import { AiPlannerScreen } from "@/components/screens/AiPlannerScreen";
import { AiCoachScreen } from "@/components/screens/AiCoachScreen";
import { ConsultationsScreen } from "@/components/screens/ConsultationsScreen";
import { MyPlanScreen } from "@/components/screens/MyPlanScreen";
import { CertificationsScreen } from "@/components/screens/CertificationsScreen";
import { ProfileScreen } from "@/components/screens/ProfileScreen";
import type { RouteName } from "@/lib/types";

const SCREENS: Record<RouteName, () => JSX.Element> = {
  auth: AuthScreen,
  onboarding: OnboardingScreen,
  home: HomeScreen,
  search: SearchScreen,
  "course-landing": CourseLandingScreen,
  "course-player": CoursePlayerScreen,
  "my-learning": MyLearningScreen,
  cart: CartScreen,
  checkout: CheckoutScreen,
  "checkout-confirmation": CheckoutConfirmationScreen,
  quiz: QuizScreen,
  "instructor-profile": InstructorProfileScreen,
  "ai-planner": AiPlannerScreen,
  "ai-coach": AiCoachScreen,
  consultations: ConsultationsScreen,
  "my-plan": MyPlanScreen,
  certifications: CertificationsScreen,
  profile: ProfileScreen,
};

export default function Home() {
  const route = useAppStore((s) => s.route);
  const user = useAppStore((s) => s.user);

  // Guard: if there's no user and the route isn't auth/onboarding, send to auth.
  // This handles direct deep-link-ish states and logout.
  const effectiveRoute: RouteName =
    !user && route.name !== "auth" && route.name !== "onboarding" ? "auth" : route.name;

  const Screen = SCREENS[effectiveRoute] ?? HomeScreen;
  const isAuthLike = effectiveRoute === "auth";
  const isOnboarding = effectiveRoute === "onboarding";
  const isPlayer = effectiveRoute === "course-player";
  const isQuiz = effectiveRoute === "quiz";
  // Auth + onboarding are full-screen (no header/footer).
  // Player + quiz are immersive — header is hidden but they manage their own chrome.
  const showChrome = !isAuthLike && !isOnboarding;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <DirSync />
      <ConfettiOverlay />
      <ToastViewport />
      {showChrome && <Header />}
      <main
        className={
          isPlayer || isQuiz
            ? "flex-1 flex flex-col"
            : isAuthLike || isOnboarding
            ? "flex-1 flex flex-col"
            : "flex-1"
        }
      >
        <div key={effectiveRoute + JSON.stringify(route.params ?? {})} className="view-enter flex-1 flex flex-col">
          <Screen />
        </div>
      </main>
      {showChrome && <Footer />}
    </div>
  );
}
