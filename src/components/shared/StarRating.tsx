"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  value: number; // 0..5
  size?: number;
  className?: string;
  showValue?: boolean;
  count?: number;
}

/** Gold star rating with partial-fill support via overlay. */
export function StarRating({ value, size = 16, className, showValue, count }: StarRatingProps) {
  const clamped = Math.max(0, Math.min(5, value));
  const pct = (clamped / 5) * 100;
  return (
    <div className={cn("inline-flex items-center gap-1.5", className)}>
      <div className="relative inline-flex" style={{ width: size * 5, height: size }} aria-label={`${clamped.toFixed(1)} out of 5`}>
        {/* base (gray) */}
        <div className="absolute inset-0 flex">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={size} className="text-muted-foreground/30" strokeWidth={0} fill="currentColor" />
          ))}
        </div>
        {/* gold overlay clipped to pct */}
        <div className="absolute inset-0 flex overflow-hidden" style={{ width: `${pct}%` }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={size} className="text-gold shrink-0" strokeWidth={0} fill="currentColor" />
          ))}
        </div>
      </div>
      {showValue && (
        <span className="text-sm font-bold text-foreground tabular-nums">{clamped.toFixed(1)}</span>
      )}
      {typeof count === "number" && (
        <span className="text-xs text-muted-foreground">({count.toLocaleString()})</span>
      )}
    </div>
  );
}
