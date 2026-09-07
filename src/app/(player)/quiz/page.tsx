import type { Metadata } from "next";
import { QuizScreen } from "@/components/screens/QuizScreen";

export const metadata: Metadata = {
  title: "Quiz | Edify",
  description: "Test your skills and earn your completion certificate on Edify.",
};

interface PageProps {
  searchParams: Promise<{ courseId?: string }>;
}

export default async function QuizPage({ searchParams }: PageProps) {
  const params = await searchParams;
  return <QuizScreen courseId={params.courseId} />;
}
