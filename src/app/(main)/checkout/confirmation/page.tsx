import type { Metadata } from "next";
import { CheckoutConfirmationScreen } from "@/components/screens/CheckoutConfirmationScreen";

export const metadata: Metadata = {
  title: "Order Confirmed | Edify",
  description: "Your enrollment is complete. Welcome to your new learning journey!",
};

interface PageProps {
  searchParams: Promise<{ orderId?: string; amount?: string }>;
}

export default async function CheckoutConfirmationPage({ searchParams }: PageProps) {
  const params = await searchParams;
  return <CheckoutConfirmationScreen orderId={params.orderId} amount={params.amount} />;
}
