import type { Metadata } from "next";
import { CertificationsScreen } from "@/components/screens/CertificationsScreen";

export const metadata: Metadata = {
  title: "Certifications & Credentials | Edify",
  description: "View and share your verified certificates of course completion.",
};

export default function CertificationsPage() {
  return <CertificationsScreen />;
}
