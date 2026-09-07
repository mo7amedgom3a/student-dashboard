import type { Metadata } from "next";
import { CheckoutScreen } from "@/components/screens/CheckoutScreen";

export const metadata: Metadata = {
  title: "Checkout | Edify",
  description: "Complete your course purchase securely on Edify.",
};

export default function CheckoutPage() {
  return <CheckoutScreen />;
}
