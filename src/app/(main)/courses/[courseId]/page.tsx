import type { Metadata } from "next";
import { getCourse } from "@/lib/mock-data";
import { CourseLandingScreen } from "@/components/screens/CourseLandingScreen";

interface PageProps {
  params: Promise<{ courseId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { courseId } = await params;
  const course = getCourse(courseId);

  if (!course) {
    return {
      title: "Course Not Found | Edify",
    };
  }

  return {
    title: `${course.title} | Edify`,
    description: course.subtitle || course.description,
  };
}

export default async function CourseDetailPage({ params }: PageProps) {
  const { courseId } = await params;
  return <CourseLandingScreen courseId={courseId} />;
}
