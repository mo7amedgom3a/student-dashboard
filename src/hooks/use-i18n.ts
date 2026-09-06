"use client";

import { useAppStore } from "@/lib/store";
import {
  translate,
  formatNumber,
  formatPrice,
  formatDate,
  formatDuration,
} from "@/lib/i18n";

/**
 * i18n hook — returns a `t` function bound to the active locale + dialect,
 * plus locale-aware formatters. Use this in any client component.
 */
export function useI18n() {
  const locale = useAppStore((s) => s.locale);
  const dialect = useAppStore((s) => s.dialect);

  const t = (key: string, params?: Record<string, string | number>) =>
    translate(key, locale, dialect, params);

  return {
    t,
    locale,
    dialect,
    dir: locale === "ar" ? "rtl" : "ltr",
    isRTL: locale === "ar",
    formatNumber: (n: number) => formatNumber(n, locale),
    formatPrice: (amount: number) => formatPrice(amount, locale, dialect),
    formatDate: (d: string | Date) => formatDate(d, locale),
    formatDuration: (min: number) => formatDuration(min, locale, dialect),
  };
}
