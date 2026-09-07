import type { Metadata } from "next";
import { getInstructor } from "@/lib/mock-data";
import { InstructorProfileScreen } from "@/components/screens/InstructorProfileScreen";

interface PageProps {
  params: Promise<{ instructorId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { instructorId } = await params;
  const instructor = getInstructor(instructorId);

  if (!instructor) {
    return {
      title: "Instructor Not Found | Edify",
    };
  }

  return {
    title: `${instructor.name} — ${instructor.title} | Edify`,
    description: instructor.bio,
  };
}

export default async function InstructorPage({ params }: PageProps) {
  const { instructorId } = await params;
  return <InstructorProfileScreen instructorId={instructorId} />;
}
