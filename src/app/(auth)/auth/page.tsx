import type { Metadata } from "next";
import { AuthScreen } from "@/components/screens/AuthScreen";

export const metadata: Metadata = {
  title: "Account | Edify",
  description: "Sign in or create your Edify account.",
};

export default function AuthPage() {
  return <AuthScreen initialTab="login" />;
}
