"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface StepProgressBarProps {
  current: number; // 0-indexed
  total: number;
  labels?: string[];
  className?: string;
}

/** Stepped progress indicator used by all multi-step flows (onboarding, quiz, checkout). */
export function StepProgressBar({ current, total, labels, className }: StepProgressBarProps) {
  const pct = ((current + 1) / total) * 100;
  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {labels && labels[current] && (
            <span className="text-sm font-medium text-foreground">{labels[current]}</span>
          )}
        </div>
        <span className="text-xs font-medium text-muted-foreground tabular-nums">
          {current + 1} / {total}
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        {Array.from({ length: total }).map((_, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <div
              key={i}
              className={cn(
                "h-2 flex-1 rounded-full transition-all duration-300",
                done && "bg-success",
                active && "bg-primary",
                !done && !active && "bg-muted-foreground/20"
              )}
            >
              {done && (
                <span className="sr-only">
                  <Check />
                </span>
              )}
            </div>
          );
        })}
      </div>
      {/* Also expose a continuous bar percentage for accessibility */}
      <div className="sr-only">{Math.round(pct)}%</div>
    </div>
  );
}
