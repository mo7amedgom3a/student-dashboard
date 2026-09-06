"use client";

import { cn } from "@/lib/utils";
import type { Course } from "@/lib/types";
import { PlayCircle, BookOpen } from "lucide-react";

interface CourseThumbProps {
  course: Course;
  className?: string;
  showPlay?: boolean;
}

/**
 * Gradient-based course thumbnail placeholder (no real image assets in MVP).
 * Uses the course's `accent` gradient and category icon.
 */
export function CourseThumb({ course, className, showPlay }: CourseThumbProps) {
  return (
    <div
      className={cn(
        "relative w-full aspect-video overflow-hidden bg-gradient-to-br flex items-center justify-center",
        course.accent,
        className
      )}
    >
      {/* subtle pattern overlay */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 30%, rgba(255,255,255,0.4) 0, transparent 40%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.3) 0, transparent 40%)",
        }}
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-3 text-center">
        {showPlay ? (
          <PlayCircle className="w-12 h-12 mb-2 drop-shadow-lg" strokeWidth={1.5} />
        ) : (
          <BookOpen className="w-8 h-8 mb-2 opacity-80" strokeWidth={1.5} />
        )}
        <span className="text-[11px] font-semibold uppercase tracking-wider opacity-90">
          {course.category}
        </span>
        <span className="text-sm font-bold line-clamp-2 max-w-[80%] drop-shadow">
          {course.title}
        </span>
      </div>
      {/* level chip */}
      <span className="absolute top-2 left-2 bg-white/95 text-foreground text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded">
        {course.level}
      </span>
    </div>
  );
}
