import type { Metadata } from "next";
import { OnboardingScreen } from "@/components/screens/OnboardingScreen";

export const metadata: Metadata = {
  title: "Personalized Onboarding | Edify",
  description: "Tell us about your learning goals and target skills so we can build your tailored curriculum.",
};

export default function OnboardingPage() {
  return <OnboardingScreen />;
}
