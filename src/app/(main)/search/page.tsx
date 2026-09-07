import type { Metadata } from "next";
import { SearchScreen } from "@/components/screens/SearchScreen";

export const metadata: Metadata = {
  title: "Explore Courses & Catalog | Edify",
  description: "Browse thousands of high-impact courses, filter by topic, level, and dialect.",
};

export default function SearchPage() {
  return <SearchScreen />;
}
