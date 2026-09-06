"use client";

import { useMemo, useState } from "react";
import {
  ShoppingCart,
  Trash2,
  ArrowRight,
  ArrowLeft,
  Tag,
  CheckCircle2,
  X,
  Heart,
  ShieldCheck,
  Award,
  Zap,
  Star,
  Clock,
  BookOpen,
  Sparkles,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { useI18n } from "@/hooks/use-i18n";
import { courses, getCourse, getInstructor, promoCodes } from "@/lib/mock-data";
import type { Course } from "@/lib/types";
import { CourseThumb } from "@/components/shared/CourseThumb";
import { CourseCard } from "@/components/shared/CourseCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface CartRow {
  courseId: string;
  course: Course;
}

export function CartScreen() {
  const { t, locale, isRTL, formatPrice, formatNumber } = useI18n();
  const cart = useAppStore((s) => s.cart);
  const removeFromCart = useAppStore((s) => s.removeFromCart);
  const clearCart = useAppStore((s) => s.clearCart);
  const toggleSaved = useAppStore((s) => s.toggleSaved);
  const isSaved = useAppStore((s) => s.isSaved);
  const navigate = useAppStore((s) => s.navigate);
  const pushToast = useAppStore((s) => s.pushToast);

  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    discountFraction: number;
  } | null>(null);

  const cartRows = useMemo<CartRow[]>(() => {
    const out: CartRow[] = [];
    for (const item of cart) {
      const course = getCourse(item.courseId);
      if (course) out.push({ courseId: item.courseId, course });
    }
    return out;
  }, [cart]);

  const subtotal = useMemo(
    () => cartRows.reduce((sum, row) => sum + row.course.price, 0),
    [cartRows]
  );

  const discountFraction = appliedPromo?.discountFraction ?? 0;
  const discountAmount = subtotal * discountFraction;
  const total = subtotal - discountAmount;

  // Recommended courses (excluding current items in cart)
  const cartIds = useMemo(() => new Set(cart.map((c) => c.courseId)), [cart]);
  const recommendedCourses = useMemo(() => {
    return courses
      .filter((c) => !cartIds.has(c.id))
      .slice(0, 4);
  }, [cartIds]);

  const handleApplyPromo = (e?: React.FormEvent, directCode?: string) => {
    if (e) e.preventDefault();
    const code = (directCode || promoInput).trim().toUpperCase();
    if (!code) return;
    if (code in promoCodes) {
      setAppliedPromo({ code, discountFraction: promoCodes[code] });
      setPromoInput(code);
      pushToast({
        title: t("cart.promoApplied", { code }),
        variant: "success",
      });
    } else {
      setAppliedPromo(null);
      pushToast({ title: t("cart.promoInvalid"), variant: "destructive" });
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoInput("");
  };

  const handleRemove = (courseId: string, title: string) => {
    removeFromCart(courseId);
    const removedLabel =
      locale === "ar" ? "اتشال من السلة" : "Removed from cart";
    pushToast({ title: `${title} — ${removedLabel}`, variant: "default" });
  };

  const handleSaveForLater = (course: Course) => {
    if (!isSaved(course.id)) {
      toggleSaved(course.id);
    }
    removeFromCart(course.id);
    pushToast({
      title: locale === "ar" ? "تم الحفظ لوقت لاحق" : "Saved for later",
      description: locale === "ar" ? course.titleAr : course.title,
      variant: "success",
    });
  };

  const ForwardIcon = isRTL ? ArrowLeft : ArrowRight;

  // ---------- Empty state ----------
  if (cartRows.length === 0) {
    return (
      <div className="view-enter max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 lg:py-10 space-y-10">
        {/* Header */}
        <header className="space-y-1">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-semibold">
            <ShoppingCart className="h-3.5 w-3.5" />
            {t("cart.title")}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {t("cart.title")}
          </h1>
        </header>

        {/* Empty Card */}
        <Card className="border border-border">
          <CardContent className="py-12">
            <EmptyState
              icon={ShoppingCart}
              title={t("cart.empty")}
              description={
                locale === "ar"
                  ? "سلتك فارغة حالياً. استكشف آلاف الدورات المتميزة وابدأ رحلتك التعليمية الآن."
                  : "Your cart is currently empty. Explore our courses and start learning today."
              }
              action={
                <Button onClick={() => navigate("search")} className="gap-2 mt-2">
                  <BookOpen className="w-4 h-4" />
                  {t("myLearning.browse")}
                </Button>
              }
            />
          </CardContent>
        </Card>

        {/* Recommended courses full width */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-foreground">
                {locale === "ar" ? "دورات مقترحة لك" : "Recommended courses"}
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {locale === "ar"
                  ? "أبرز الدورات الأكثر طلباً هذا الأسبوع"
                  : "Top picks to kickstart your learning journey"}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("search")}
              className="gap-1.5"
            >
              <span>{t("home.viewAll")}</span>
              <ForwardIcon className="w-3.5 h-3.5" />
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendedCourses.map((c) => (
              <CourseCard key={c.id} course={c} variant="default" showActions />
            ))}
          </div>
        </section>
      </div>
    );
  }

  // ---------- Non-empty Cart ----------
  return (
    <div className="view-enter max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 lg:py-10 space-y-10">
      {/* Header bar */}
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 pb-2 border-b border-border">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-semibold">
            <ShoppingCart className="h-3.5 w-3.5" />
            {t("cart.title")}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {t("cart.title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("cart.itemCount", { n: cartRows.length })}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("search")}
            className="text-xs sm:text-sm"
          >
            {t("cart.continueShopping")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              clearCart();
              pushToast({
                title: locale === "ar" ? "تم إفراغ السلة" : "Cart cleared",
              });
            }}
            className="text-xs text-muted-foreground hover:text-destructive gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{locale === "ar" ? "تفريغ السلة" : "Clear cart"}</span>
          </Button>
        </div>
      </header>

      {/* Main 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Cart items list (8 cols on desktop) */}
        <div className="lg:col-span-8 space-y-4">
          {cartRows.map(({ course }) => {
            const instructor = getInstructor(course.instructorId);
            const title = locale === "ar" ? course.titleAr : course.title;
            const instructorName = instructor
              ? locale === "ar"
                ? instructor.nameAr ?? instructor.name
                : instructor.name
              : "";
            const isAlreadySaved = isSaved(course.id);

            return (
              <Card
                key={course.id}
                className="overflow-hidden border border-border hover:shadow-md transition-all"
              >
                <CardContent className="p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row gap-4 items-start">
                    {/* Course Thumb */}
                    <div className="w-full sm:w-44 lg:w-48 aspect-video shrink-0 rounded-lg overflow-hidden bg-muted">
                      <button
                        type="button"
                        onClick={() =>
                          navigate("course-landing", { courseId: course.id })
                        }
                        className="block w-full h-full text-start focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        aria-label={title}
                      >
                        <CourseThumb course={course} />
                      </button>
                    </div>

                    {/* Course Details */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch space-y-2.5">
                      <div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <Badge variant="secondary" className="text-[10px] font-normal">
                            {course.category}
                          </Badge>
                          <Badge variant="outline" className="text-[10px]">
                            {course.level}
                          </Badge>
                          {course.bestseller && (
                            <Badge className="bg-amber-500 text-black text-[10px] font-bold">
                              {t("card.bestseller")}
                            </Badge>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            navigate("course-landing", { courseId: course.id })
                          }
                          className="text-start focus:outline-none focus-visible:underline"
                        >
                          <h3 className="font-bold text-base sm:text-lg text-foreground leading-snug line-clamp-2 hover:text-primary transition-colors">
                            {title}
                          </h3>
                        </button>

                        <p className="text-xs text-muted-foreground mt-0.5">
                          {instructorName}
                        </p>
                      </div>

                      {/* Meta stats */}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1 font-semibold text-amber-500">
                          <Star className="w-3.5 h-3.5 fill-amber-500" />
                          {course.rating.toFixed(1)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                          {t("card.hours", { n: course.totalHours })}
                        </span>
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-3.5 h-3.5 text-muted-foreground" />
                          {t("card.lessons", { n: course.totalLessons })}
                        </span>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-3 pt-2 border-t border-border/60">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground gap-1.5"
                          onClick={() => handleSaveForLater(course)}
                        >
                          <Heart
                            className={cn(
                              "w-3.5 h-3.5",
                              isAlreadySaved && "fill-destructive text-destructive"
                            )}
                          />
                          <span>
                            {isAlreadySaved
                              ? locale === "ar"
                                ? "محفوظ بالمفضلة"
                                : "Saved"
                              : locale === "ar"
                              ? "حفظ لوقت لاحق"
                              : "Save for later"}
                          </span>
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-xs text-destructive hover:bg-destructive/10 gap-1.5"
                          onClick={() => handleRemove(course.id, title)}
                          aria-label={`${t("cart.remove")} — ${title}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>{t("cart.remove")}</span>
                        </Button>
                      </div>
                    </div>

                    {/* Price column */}
                    <div className="sm:text-end shrink-0 pt-1 sm:pt-0">
                      <div className="text-xl font-bold text-foreground">
                        {formatPrice(course.price)}
                      </div>
                      {course.originalPrice && (
                        <div className="flex items-center sm:justify-end gap-1.5 text-xs text-muted-foreground">
                          <span className="line-through">
                            {formatPrice(course.originalPrice)}
                          </span>
                          <span className="text-success font-semibold">
                            {Math.round(
                              ((course.originalPrice - course.price) /
                                course.originalPrice) *
                                100
                            )}
                            % {locale === "ar" ? "خصم" : "off"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Order summary sidebar (4 cols on desktop) */}
        <aside className="lg:col-span-4 lg:sticky lg:top-20 space-y-4">
          <Card className="border border-border shadow-sm">
            <CardHeader className="p-5 pb-3">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-primary" />
                {t("cart.total")}
              </CardTitle>
            </CardHeader>

            <CardContent className="p-5 pt-0 space-y-4">
              {/* Promo Code input & quick pills */}
              <div className="space-y-2.5">
                <form onSubmit={(e) => handleApplyPromo(e)} className="flex flex-col gap-2">
                  <Label htmlFor="cart-promo" className="text-xs font-semibold text-muted-foreground">
                    {t("cart.promo")}
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="cart-promo"
                      value={promoInput}
                      onChange={(e) =>
                        setPromoInput(e.target.value.toUpperCase().slice(0, 20))
                      }
                      placeholder="WELCOME25"
                      className="flex-1 uppercase tracking-wide text-xs"
                      autoComplete="off"
                    />
                    <Button type="submit" variant="secondary" size="sm">
                      {t("cart.promoApply")}
                    </Button>
                  </div>
                </form>

                {/* Applied promo pill */}
                {appliedPromo && (
                  <div className="flex items-center justify-between rounded-md bg-success/10 border border-success/30 px-3 py-2 text-xs">
                    <span className="inline-flex items-center gap-1.5 text-success font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {t("cart.promoApplied", { code: appliedPromo.code })}
                    </span>
                    <button
                      type="button"
                      onClick={handleRemovePromo}
                      aria-label={t("cart.remove")}
                      className="text-success/70 hover:text-success"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* 1-Click promo suggestions */}
                <div className="space-y-1">
                  <span className="text-[11px] text-muted-foreground block">
                    {locale === "ar" ? "كوبونات متوفرة للتطبيق الفوري:" : "Available promo codes:"}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(promoCodes).map(([code, frac]) => (
                      <button
                        key={code}
                        type="button"
                        onClick={() => handleApplyPromo(undefined, code)}
                        className="inline-flex items-center gap-1 text-[10px] font-semibold border border-dashed border-primary/40 bg-primary/5 hover:bg-primary/10 text-primary px-2 py-0.5 rounded transition-colors"
                      >
                        <Tag className="w-2.5 h-2.5" />
                        {code} ({Math.round(frac * 100)}%)
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Price Breakdown */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{t("cart.subtotal")}</span>
                  {appliedPromo ? (
                    <span className="text-muted-foreground line-through">
                      {formatPrice(subtotal)}
                    </span>
                  ) : (
                    <span className="text-foreground font-semibold">
                      {formatPrice(subtotal)}
                    </span>
                  )}
                </div>

                {appliedPromo && (
                  <div className="flex items-center justify-between text-success">
                    <span className="inline-flex items-center gap-1 font-medium">
                      <Tag className="w-3 h-3" />
                      {appliedPromo.code} ({Math.round(appliedPromo.discountFraction * 100)}%)
                    </span>
                    <span className="font-bold">−{formatPrice(discountAmount)}</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-muted-foreground">
                  <span>{locale === "ar" ? "الضرائب المشمولة" : "Taxes included"}</span>
                  <span className="text-foreground font-medium">$0.00</span>
                </div>
              </div>

              <Separator />

              {/* Total & Checkout */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold text-foreground">
                    {t("cart.total")}
                  </span>
                  <span className="text-2xl font-extrabold text-foreground">
                    {formatPrice(total)}
                  </span>
                </div>

                <Button
                  size="lg"
                  className="w-full text-base font-bold gap-2 shadow-md"
                  onClick={() => navigate("checkout")}
                >
                  <span>{t("cart.checkout")}</span>
                  <ForwardIcon className="w-4 h-4" />
                </Button>

                <p className="text-[11px] text-center text-muted-foreground">
                  {locale === "ar"
                    ? "ضمان استرجاع الأموال لمدة 30 يوماً"
                    : "30-Day Money-Back Guarantee"}
                </p>
              </div>

              <Separator />

              {/* Trust badges */}
              <div className="space-y-2 text-xs text-muted-foreground pt-1">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                  <span>
                    {locale === "ar"
                      ? "دفع آمن ومشفّر 100%"
                      : "Secure and encrypted checkout"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary shrink-0" />
                  <span>
                    {locale === "ar"
                      ? "وصول فوري لجميع الدروس والمحتوى"
                      : "Instant lifetime access to all lessons"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-primary shrink-0" />
                  <span>
                    {locale === "ar"
                      ? "شهادة إتمام معتمدة قابلة للمشاركة"
                      : "Shareable Certificate of Completion"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>

      {/* Full-width cross-sell / recommendations section */}
      {recommendedCourses.length > 0 && (
        <section className="space-y-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-foreground">
                {locale === "ar" ? "قد يعجبك أيضاً" : "You might also like"}
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {locale === "ar"
                  ? "دورات يشتريها الطلاب عادةً مع هذه المحتويات"
                  : "Learners often add these courses to expand their skills"}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("search")}
              className="gap-1.5"
            >
              <span>{t("home.viewAll")}</span>
              <ForwardIcon className="w-3.5 h-3.5" />
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendedCourses.map((c) => (
              <CourseCard key={c.id} course={c} variant="default" showActions />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
