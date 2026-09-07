import type { Metadata } from "next";
import { SearchScreen } from "@/components/screens/SearchScreen";

export const metadata: Metadata = {
  title: "All Courses | Edify",
  description: "Browse the complete course catalog on Edify.",
};

export default function CoursesPage() {
  return <SearchScreen />;
}
