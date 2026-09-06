import type { Metadata } from "next";
import { Inter, Cairo } from "next/font/google";
import "./globals.css";
import "react-loading-skeleton/dist/skeleton.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Edify — Learn what's next",
  description:
    "Edify is a modern learning platform combining the best of Udemy and Coursera — goal-driven onboarding, personalized recommendations, and an immersive in-course experience.",
  keywords: [
    "Edify",
    "LMS",
    "online courses",
    "learning platform",
    "elearning",
    "Udemy",
    "Coursera",
  ],
  authors: [{ name: "Edify" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "Edify — Learn what's next",
    description:
      "Goal-driven onboarding, personalized recommendations, and an immersive in-course experience.",
    siteName: "Edify",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Edify — Learn what's next",
    description:
      "Goal-driven onboarding, personalized recommendations, and an immersive in-course experience.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${cairo.variable} antialiased bg-background text-foreground min-h-screen`}
      >
        {children}
        <Toaster />
        <SonnerToaster position="top-center" richColors />
      </body>
    </html>
  );
}
