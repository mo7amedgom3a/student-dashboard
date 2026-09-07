import type { Metadata } from "next";
import { getCourse } from "@/lib/mock-data";
import { QuizScreen } from "@/components/screens/QuizScreen";

interface PageProps {
  params: Promise<{ courseId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { courseId } = await params;
  const course = getCourse(courseId);

  return {
    title: course ? `Knowledge Check: ${course.title} | Edify` : "Quiz | Edify",
    description: course ? `Test your knowledge for ${course.title} on Edify.` : undefined,
  };
}

export default async function CourseQuizPage({ params }: PageProps) {
  const { courseId } = await params;
  return <QuizScreen courseId={courseId} />;
}
