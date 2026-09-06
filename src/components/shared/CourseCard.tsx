"use client";

import { cn } from "@/lib/utils";
import type { Course } from "@/lib/types";
import { CourseThumb } from "./CourseThumb";
import { StarRating } from "./StarRating";
import { useI18n } from "@/hooks/use-i18n";
import { useAppStore } from "@/lib/store";
import { getInstructor } from "@/lib/mock-data";
import { Clock, PlayCircle, Heart, ShoppingCart, Check, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface CourseCardProps {
  course: Course;
  variant?: "default" | "compact" | "wide";
  className?: string;
  /** show wishlist heart + add-to-cart inline actions */
  showActions?: boolean;
  onClick?: () => void;
}

export function CourseCard({
  course,
  variant = "default",
  className,
  showActions = false,
  onClick,
}: CourseCardProps) {
  const { t, locale, isRTL, formatNumber, formatPrice } = useI18n();
  const navigate = useAppStore((s) => s.navigate);
  const isInCart = useAppStore((s) => s.isInCart(course.id));
  const addToCart = useAppStore((s) => s.addToCart);
  const isSaved = useAppStore((s) => s.isSaved(course.id));
  const toggleSaved = useAppStore((s) => s.toggleSaved);
  const isEnrolled = useAppStore((s) => s.isEnrolled(course.id));
  const pushToast = useAppStore((s) => s.pushToast);

  const instructor = getInstructor(course.instructorId);
  const title = locale === "ar" ? course.titleAr : course.title;
  const subtitle = locale === "ar" ? course.subtitleAr : course.subtitle;
  const instructorName = instructor ? (locale === "ar" ? instructor.nameAr ?? instructor.name : instructor.name) : "";
  const category = locale === "ar" ? course.categoryAr : course.category;

  const go = () => {
    if (onClick) onClick();
    else navigate("course-landing", { courseId: course.id });
  };

  if (variant === "compact") {
    return (
      <button
        onClick={go}
        className={cn(
          "group flex gap-3 text-start w-full p-2 rounded-md hover:bg-muted/60 transition-colors",
          className
        )}
      >
        <div className="w-28 shrink-0">
          <CourseThumb course={course} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold line-clamp-2 group-hover:text-primary">{title}</h4>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{instructorName}</p>
          <div className="flex items-center gap-1 mt-1">
            <span className="text-xs font-bold">{course.rating.toFixed(1)}</span>
            <StarRating value={course.rating} size={11} />
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm font-bold text-foreground">{formatPrice(course.price)}</span>
            {course.originalPrice && (
              <span className="text-xs text-muted-foreground line-through">{formatPrice(course.originalPrice)}</span>
            )}
          </div>
        </div>
      </button>
    );
  }

  return (
    <div
      className={cn(
        "group relative bg-card border border-border rounded-lg overflow-hidden flex flex-col hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer",
        variant === "wide" && "sm:flex-row",
        className
      )}
      onClick={go}
    >
      <div className={cn(variant === "wide" && "sm:w-72 shrink-0")}>
        <CourseThumb course={course} />
      </div>
      <div className="flex-1 p-4 flex flex-col">
        <div className="flex items-start justify-between gap-2 mb-1">
          <Badge variant="secondary" className="text-[10px] font-semibold uppercase tracking-wide">
            {category}
          </Badge>
          <div className="flex items-center gap-1">
            {course.bestseller && (
              <Badge className="bg-gold text-black hover:bg-gold text-[10px] font-bold">
                {t("card.bestseller")}
              </Badge>
            )}
          </div>
        </div>
        <h3 className="font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{subtitle}</p>
        <p className="text-xs text-muted-foreground mt-2">{instructorName}</p>
        <div className="flex items-center gap-1.5 mt-2">
          <span className="text-sm font-bold text-foreground">{course.rating.toFixed(1)}</span>
          <StarRating value={course.rating} size={13} />
          <span className="text-xs text-muted-foreground">({formatNumber(course.ratingCount)})</span>
        </div>
        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> {t("card.hours", { n: course.totalHours })}
          </span>
          <span className="inline-flex items-center gap-1">
            <PlayCircle className="w-3.5 h-3.5" /> {t("card.lessons", { n: course.totalLessons })}
          </span>
          <span className="inline-flex items-center gap-1">
            {course.level}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2 mt-3 pt-3 border-t border-border/60">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold text-foreground">{formatPrice(course.price)}</span>
            {course.originalPrice && (
              <span className="text-xs text-muted-foreground line-through">{formatPrice(course.originalPrice)}</span>
            )}
          </div>
          {isEnrolled ? (
            <Badge className="bg-success text-success-foreground hover:bg-success gap-1">
              <Check className="w-3 h-3" /> {t("card.enrolled")}
            </Badge>
          ) : showActions ? (
            <div className="flex items-center gap-1">
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSaved(course.id);
                  pushToast({
                    title: isSaved ? "Removed from saved" : "Saved to wishlist",
                    variant: isSaved ? "default" : "success",
                  });
                }}
                aria-label="Toggle wishlist"
              >
                <Heart className={cn("w-4 h-4", isSaved && "fill-rose-500 text-rose-500")} />
              </Button>
              <Button
                size="sm"
                variant={isInCart ? "secondary" : "default"}
                className="h-8"
                onClick={(e) => {
                  e.stopPropagation();
                  addToCart(course.id);
                  pushToast({
                    title: isInCart ? "Already in cart" : "Added to cart",
                    variant: isInCart ? "default" : "success",
                  });
                }}
              >
                {isInCart ? (
                  <>
                    <Check className="w-3.5 h-3.5" /> {t("card.inCart")}
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-3.5 h-3.5" /> {t("card.addToCart")}
                  </>
                )}
              </Button>
            </div>
          ) : null}
        </div>

        {isEnrolled && (
          <div className="absolute top-2 right-2 bg-success text-success-foreground text-[10px] font-bold px-1.5 py-0.5 rounded inline-flex items-center gap-1">
            <BadgeCheck className="w-3 h-3" /> {t("card.enrolled")}
          </div>
        )}
      </div>
    </div>
  );
}

