import type { Metadata } from "next";
import { getCourse } from "@/lib/mock-data";
import { CoursePlayerScreen } from "@/components/screens/CoursePlayerScreen";

interface PageProps {
  params: Promise<{ courseId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { courseId } = await params;
  const course = getCourse(courseId);

  return {
    title: course ? `Learning: ${course.title} | Edify` : "Course Player | Edify",
    description: course ? `Continue learning ${course.title} on Edify.` : undefined,
  };
}

export default async function CourseLearnPage({ params }: PageProps) {
  const { courseId } = await params;
  return <CoursePlayerScreen courseId={courseId} />;
}
