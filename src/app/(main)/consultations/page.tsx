import type { Metadata } from "next";
import { ConsultationsScreen } from "@/components/screens/ConsultationsScreen";

export const metadata: Metadata = {
  title: "1-on-1 Expert Consultations | Edify",
  description: "Book personal mentoring and code review sessions with leading industry instructors.",
};

export default function ConsultationsPage() {
  return <ConsultationsScreen />;
}
