import type { Metadata } from "next";
import { AuthScreen } from "@/components/screens/AuthScreen";

export const metadata: Metadata = {
  title: "Sign Up | Edify",
  description: "Create your free Edify account to start learning modern tech, design, and AI skills.",
};

export default function SignUpPage() {
  return <AuthScreen initialTab="signup" />;
}
