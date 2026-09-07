import type { Metadata } from "next";
import { CartScreen } from "@/components/screens/CartScreen";

export const metadata: Metadata = {
  title: "Shopping Cart | Edify",
  description: "Review and manage the courses in your cart.",
};

export default function CartPage() {
  return <CartScreen />;
}
