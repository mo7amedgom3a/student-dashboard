import type { Metadata } from "next";
import { HomeScreen } from "@/components/screens/HomeScreen";

export const metadata: Metadata = {
  title: "Edify — Learn what's next",
  description:
    "Personalized learning recommendations, goal-oriented skill roadmaps, and industry-grade courses.",
};

export default function HomePage() {
  return <HomeScreen />;
}
