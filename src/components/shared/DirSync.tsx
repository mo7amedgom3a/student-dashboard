"use client";

import { useEffect } from "react";
import { useAppStore } from "@/lib/store";

/**
 * Keeps the <html> element's `dir` and `lang` attributes in sync with the
 * active locale. Mount once at the app root.
 */
export function DirSync() {
  const locale = useAppStore((s) => s.locale);
  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute("dir", locale === "ar" ? "rtl" : "ltr");
    html.setAttribute("lang", locale === "ar" ? "ar" : "en");
  }, [locale]);
  return null;
}
