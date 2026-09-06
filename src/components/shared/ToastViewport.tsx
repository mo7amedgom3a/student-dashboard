"use client";

import { useAppStore } from "@/lib/store";
import { useI18n } from "@/hooks/use-i18n";
import { X, CheckCircle2, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

/** Lightweight toast viewport bound to the store's `toasts` array. */
export function ToastViewport() {
  const toasts = useAppStore((s) => s.toasts);
  const dismiss = useAppStore((s) => s.dismissToast);
  const { isRTL } = useI18n();

  return (
    <div
      className={cn(
        "fixed bottom-4 z-[150] flex flex-col gap-2 max-w-sm w-[calc(100vw-2rem)]",
        isRTL ? "left-4" : "right-4"
      )}
      role="region"
      aria-label="Notifications"
    >
      {toasts.map((t) => {
        const Icon =
          t.variant === "success" ? CheckCircle2 : t.variant === "destructive" ? AlertCircle : Info;
        const accent =
          t.variant === "success"
            ? "text-success"
            : t.variant === "destructive"
            ? "text-destructive"
            : "text-primary";
        return (
          <div
            key={t.id}
            className="bg-card border border-border rounded-lg shadow-lg p-3 pe-9 flex items-start gap-3 animate-in slide-in-from-bottom-2 duration-200"
            role="status"
          >
            <Icon className={cn("w-5 h-5 shrink-0 mt-0.5", accent)} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">{t.title}</p>
              {t.description && (
                <p className="text-xs text-muted-foreground mt-0.5">{t.description}</p>
              )}
            </div>
            <button
              onClick={() => dismiss(t.id)}
              className="absolute top-2 end-2 text-muted-foreground hover:text-foreground"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
