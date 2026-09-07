import type { Metadata } from "next";
import { AiCoachScreen } from "@/components/screens/AiCoachScreen";

export const metadata: Metadata = {
  title: "AI Tutor & Learning Coach | Edify",
  description: "Interactive AI tutor to answer questions, explain concepts, and guide your studies.",
};

export default function AiCoachPage() {
  return <AiCoachScreen />;
}
