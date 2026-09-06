"use client";

import { useAppStore } from "@/lib/store";
import { useI18n } from "@/hooks/use-i18n";
import { GraduationCap } from "lucide-react";

export function Footer() {
  const { t } = useI18n();
  const navigate = useAppStore((s) => s.navigate);
  const route = useAppStore((s) => s.route);

  // No footer on auth screen (full-screen entry).
  if (route.name === "auth") return null;

  const year = new Date().getFullYear();

  const columns: { title: string; links: { label: string; onClick?: () => void }[] }[] = [
    {
      title: t("brand.name"),
      links: [
        { label: t("footer.about") },
        { label: t("footer.careers") },
        { label: t("footer.blog") },
      ],
    },
    {
      title: t("nav.myLearning"),
      links: [
        { label: t("myLearning.tab.inProgress"), onClick: () => navigate("my-learning") },
        { label: t("myLearning.tab.saved"), onClick: () => navigate("my-learning") },
        { label: t("myLearning.tab.certificates"), onClick: () => navigate("my-learning") },
      ],
    },
    {
      title: t("footer.help"),
      links: [
        { label: t("footer.terms") },
        { label: t("footer.privacy") },
        { label: t("footer.help") },
      ],
    },
  ];

  return (
    <footer className="mt-auto border-t border-border bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-md bg-primary text-primary-foreground flex items-center justify-center font-bold">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="font-bold text-foreground">{t("brand.name")}</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{t("footer.builtWith")}</p>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-xs font-semibold uppercase tracking-wide text-foreground mb-3">
                {col.title}
              </h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <button
                      onClick={link.onClick}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors text-start"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">{t("footer.rights", { year })}</p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>EN</span>
            <span className="text-border">•</span>
            <span>عربي (SA / EG)</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
