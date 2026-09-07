import type { Metadata } from "next";
import { AiPlannerScreen } from "@/components/screens/AiPlannerScreen";

export const metadata: Metadata = {
  title: "AI Study Planner | Edify",
  description: "Generate customized week-by-week study roadmaps powered by AI.",
};

export default function AiPlannerPage() {
  return <AiPlannerScreen />;
}
