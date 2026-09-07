import type { Metadata } from "next";
import { MyPlanScreen } from "@/components/screens/MyPlanScreen";

export const metadata: Metadata = {
  title: "My Active Study Plan | Edify",
  description: "View and track your weekly study targets, milestones, and learning progress.",
};

export default function MyPlanPage() {
  return <MyPlanScreen />;
}
