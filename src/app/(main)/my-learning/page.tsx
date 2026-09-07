import type { Metadata } from "next";
import { MyLearningScreen } from "@/components/screens/MyLearningScreen";

export const metadata: Metadata = {
  title: "My Learning | Edify",
  description: "Track your enrolled courses, active progress, saved wishlist, and earned certificates.",
};

interface PageProps {
  searchParams: Promise<{ tab?: "in-progress" | "saved" | "certificates" }>;
}

export default async function MyLearningPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  return <MyLearningScreen initialTab={resolvedSearchParams.tab} />;
}
