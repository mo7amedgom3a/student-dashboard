"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";
import { gsap } from "gsap";

interface StepProgressBarProps {
  current: number; // 0-indexed
  total: number;
  labels?: string[];
  className?: string;
  showPercent?: boolean;
}

/**
 * Stepped progress indicator with GSAP-powered smooth tween transitions.
 * Used across multi-step flows (onboarding student register, quiz, checkout).
 */
export function StepProgressBar({
  current,
  total,
  labels,
  className,
  showPercent = true,
}: StepProgressBarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const continuousBarRef = useRef<HTMLDivElement>(null);
  const pctNumberRef = useRef<HTMLSpanElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const prevStepRef = useRef<number>(current);

  const pct = Math.min(100, Math.max(0, Math.round(((current + 1) / total) * 100)));

  // GSAP animation on step change
  useEffect(() => {
    const ctx = gsap.context(() => {
      const prevStep = prevStepRef.current;
      const isForward = current > prevStep;
      prevStepRef.current = current;

      // 1. Continuous master line animation
      if (continuousBarRef.current) {
        gsap.to(continuousBarRef.current, {
          width: `${pct}%`,
          duration: 0.55,
          ease: "power3.out",
        });
      }

      // 2. Animated percentage counter
      if (pctNumberRef.current) {
        const prevPct = Math.min(
          100,
          Math.max(0, Math.round(((prevStep + 1) / total) * 100))
        );
        const counter = { val: prevPct };
        gsap.to(counter, {
          val: pct,
          duration: 0.55,
          ease: "power2.out",
          onUpdate: () => {
            if (pctNumberRef.current) {
              pctNumberRef.current.textContent = `${Math.round(counter.val)}%`;
            }
          },
        });
      }

      // 3. Smooth label fade/slide transition
      if (labelRef.current) {
        gsap.fromTo(
          labelRef.current,
          { opacity: 0, y: isForward ? 6 : -6 },
          { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" }
        );
      }

      // 4. Segment fills
      for (let i = 0; i < total; i++) {
        const fillEl = containerRef.current?.querySelector(`.step-fill-${i}`);

        if (fillEl) {
          if (i < current) {
            // Completed
            gsap.to(fillEl, {
              width: "100%",
              duration: 0.45,
              ease: "power2.out",
            });
          } else if (i === current) {
            // Active step
            gsap.to(fillEl, {
              width: "100%",
              duration: 0.5,
              ease: "power2.out",
            });
          } else {
            // Upcoming
            gsap.to(fillEl, {
              width: "0%",
              duration: 0.3,
              ease: "power2.inOut",
            });
          }
        }
      }
    }, containerRef);

    return () => ctx.revert();
  }, [current, total, pct]);

  return (
    <div ref={containerRef} className={cn("w-full space-y-2.5", className)}>
      {/* Top row: Label & Numbers */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          {labels && labels[current] && (
            <span
              ref={labelRef}
              className="text-sm font-semibold text-foreground tracking-tight truncate flex items-center gap-1.5"
            >
              <Sparkles className="h-3.5 w-3.5 text-primary shrink-0 animate-pulse" />
              <span>{labels[current]}</span>
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {showPercent && (
            <span
              ref={pctNumberRef}
              className="text-xs font-bold text-primary tabular-nums"
            >
              {pct}%
            </span>
          )}
          <span className="text-xs font-medium text-muted-foreground tabular-nums">
            {current + 1} / {total}
          </span>
        </div>
      </div>

      {/* Segmented bar with inner GSAP-animated fills */}
      <div className="flex items-center gap-1.5">
        {Array.from({ length: total }).map((_, i) => {
          const isDone = i < current;
          const isActive = i === current;
          return (
            <div
              key={i}
              className={cn(
                "relative h-2.5 flex-1 rounded-full overflow-hidden bg-muted/60 dark:bg-muted/40 border transition-colors",
                isActive
                  ? "border-primary/50 ring-1 ring-primary/30 shadow-xs"
                  : isDone
                  ? "border-emerald-500/40"
                  : "border-border/30"
              )}
            >
              <div
                className={cn(
                  `step-fill-${i} h-full rounded-full transition-none`,
                  isDone
                    ? "bg-gradient-to-r from-emerald-600 to-emerald-500 dark:from-emerald-500 dark:to-emerald-400"
                    : isActive
                    ? "bg-gradient-to-r from-primary via-primary to-primary/80"
                    : "bg-transparent"
                )}
                style={{
                  width: isDone || isActive ? "100%" : "0%",
                }}
              />
              {/* Active shimmer highlight */}
              {isActive && (
                <span className="absolute inset-0 bg-white/20 animate-pulse rounded-full pointer-events-none" />
              )}
            </div>
          );
        })}
      </div>

      {/* Continuous underlying progress track */}
      <div className="relative h-1 w-full overflow-hidden rounded-full bg-muted/40 dark:bg-muted/20">
        <div
          ref={continuousBarRef}
          className="h-full rounded-full bg-gradient-to-r from-primary via-brand to-emerald-500 transition-none"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Screen reader percentage */}
      <div className="sr-only" aria-live="polite">
        {pct}% complete
      </div>
    </div>
  );
}
