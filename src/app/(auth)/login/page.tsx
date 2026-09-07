import type { Metadata } from "next";
import { AuthScreen } from "@/components/screens/AuthScreen";

export const metadata: Metadata = {
  title: "Log In | Edify",
  description: "Sign in to your Edify learner account to resume your courses and track your progress.",
};

export default function LoginPage() {
  return <AuthScreen initialTab="login" />;
}
