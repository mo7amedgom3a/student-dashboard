import type { Metadata } from "next";
import { ProfileScreen } from "@/components/screens/ProfileScreen";

export const metadata: Metadata = {
  title: "Student Profile & Settings | Edify",
  description: "Manage your learner profile, career goals, skills inventory, and account preferences.",
};

export default function ProfilePage() {
  return <ProfileScreen />;
}
