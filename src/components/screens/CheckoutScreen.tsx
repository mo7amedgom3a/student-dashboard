"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Lock,
  ArrowLeft,
  ArrowRight,
  Loader2,
  CreditCard,
  ShoppingCart,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { useI18n } from "@/hooks/use-i18n";
import { getCourse } from "@/lib/mock-data";
import type { Course } from "@/lib/types";
import { StepProgressBar } from "@/components/shared/StepProgressBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

interface FormState {
  name: string;
  cardNumber: string;
  expiry: string;
  cvc: string;
}

interface FormErrors {
  name?: string;
  cardNumber?: string;
  expiry?: string;
  cvc?: string;
}

const STEP_LABELS_EN = ["Cart", "Payment", "Done"];
const STEP_LABELS_AR = ["السلة", "الدفع", "تم"];

/** Format a card number input with a space every 4 digits (max 16 digits). */
function formatCardNumber(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(.{4})/g, "$1 ").trim();
}

/** Format an expiry input as MM/YY (max 4 digits). */
function formatExpiry(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

/** Generate a 6-char alphanumeric order id (uppercase). */
function generateOrderId(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

export function CheckoutScreen() {
  const { t, locale, isRTL, formatPrice } = useI18n();
  const cart = useAppStore((s) => s.cart);
  const navigate = useAppStore((s) => s.navigate);

  const [form, setForm] = useState<FormState>({
    name: "",
    cardNumber: "",
    expiry: "",
    cvc: "",
  });
  const [touched, setTouched] = useState<Record<keyof FormState, boolean>>({
    name: false,
    cardNumber: false,
    expiry: false,
    cvc: false,
  });
  const [processing, setProcessing] = useState(false);
  // payToken is a counter that flips to trigger the setTimeout effect. We
  // never set it to 0 after the first bump.
  const [payToken, setPayToken] = useState(0);

  const stepLabels = locale === "ar" ? STEP_LABELS_AR : STEP_LABELS_EN;

  const cartRows = useMemo<{ courseId: string; course: Course }[]>(() => {
    const out: { courseId: string; course: Course }[] = [];
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
  // Per spec: keep it simple — total at checkout = subtotal (no promo applied).
  const total = subtotal;

  // ----- validation -----
  const errors = useMemo<FormErrors>(() => {
    const e: FormErrors = {};
    if (!form.name.trim()) e.name = t("checkout.cardName");
    const digits = form.cardNumber.replace(/\s/g, "");
    if (!digits) e.cardNumber = t("checkout.cardNumber");
    else if (digits.length < 12)
      e.cardNumber = `${t("checkout.cardNumber")} — 12+`;
    if (!form.expiry) e.expiry = t("checkout.expiry");
    else if (!/^\d{2}\/\d{2}$/.test(form.expiry))
      e.expiry = `${t("checkout.expiry")} — MM/YY`;
    else {
      const month = parseInt(form.expiry.slice(0, 2), 10);
      if (month < 1 || month > 12) e.expiry = `${t("checkout.expiry")} — MM/YY`;
    }
    if (!form.cvc) e.cvc = t("checkout.cvc");
    else if (!/^\d{3,4}$/.test(form.cvc)) e.cvc = `${t("checkout.cvc")} — 3-4`;
    return e;
  }, [form, t]);

  const isValid = Object.keys(errors).length === 0;

  // ----- processing delay (setTimeout inside useEffect, setState only in
  // the timeout callback — satisfies react-hooks/set-state-in-effect). The
  // closure captures `total` at the moment payToken flips to non-zero; the
  // button is disabled while processing so the cart (and therefore total)
  // stays stable across the 1.2s wait. -----
  useEffect(() => {
    if (payToken === 0) return;
    const amount = String(total);
    const handle = window.setTimeout(() => {
      const state = useAppStore.getState();
      const items = state.cart;
      for (const item of items) {
        state.enroll(item.courseId);
        // Issue a certificate if the course is already 100% complete (e.g.
        // a re-purchase of a finished course in the demo flow).
        if (state.getCourseProgress(item.courseId) >= 100) {
          state.issueCertificate(item.courseId);
        }
      }
      const orderId = generateOrderId();
      state.clearCart();
      state.navigate("checkout-confirmation", { orderId, amount });
      setProcessing(false);
    }, 1200);
    return () => window.clearTimeout(handle);
  }, [payToken]);

  const handlePay = () => {
    setTouched({
      name: true,
      cardNumber: true,
      expiry: true,
      cvc: true,
    });
    if (!isValid || processing || cartRows.length === 0) return;
    setProcessing(true);
    setPayToken((n) => n + 1);
  };

  const BackIcon = isRTL ? ArrowRight : ArrowLeft;
  const ForwardIcon = isRTL ? ArrowLeft : ArrowRight;

  // ----- empty-cart guard (only when not mid-processing) -----
  if (cartRows.length === 0 && !processing) {
    return (
      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-8 sm:py-12">
        <Card>
          <CardContent className="pt-6 flex flex-col items-center text-center gap-4">
            <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
              <ShoppingCart className="w-7 h-7 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">{t("cart.empty")}</p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate("cart")}>
                <BackIcon className="w-4 h-4 me-1.5" />
                {t("checkout.back")}
              </Button>
              <Button onClick={() => navigate("search")}>
                {t("cart.browse")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-6 sm:py-8">
      {/* Step progress (3 steps: Cart → Payment → Done, current = Payment) */}
      <div
        className="mb-6"
        role="progressbar"
        aria-valuenow={2}
        aria-valuemin={1}
        aria-valuemax={3}
        aria-label={t("checkout.title")}
      >
        <StepProgressBar current={1} total={3} labels={stepLabels} />
      </div>

      <div className="flex flex-col gap-2 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
          {t("checkout.title")}
        </h1>
        <p className="text-sm text-muted-foreground">{t("checkout.subtitle")}</p>
        <Button
          variant="link"
          className="self-start p-0 h-auto text-sm text-muted-foreground hover:text-primary"
          onClick={() => navigate("cart")}
        >
          <BackIcon className="w-4 h-4 me-1" />
          {t("checkout.back")}
        </Button>
      </div>

      {/* Secure-notice banner */}
      <div className="mb-6 flex items-center gap-2 rounded-md bg-primary/5 border border-primary/20 px-3 py-2 text-sm text-foreground">
        <Lock className="w-4 h-4 text-primary shrink-0" />
        <span>{t("checkout.secure")}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 lg:gap-8 items-start">
        {/* Payment form (LEFT on desktop) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              {t("checkout.title")}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {/* Name on card */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ck-name">{t("checkout.cardName")}</Label>
              <Input
                id="ck-name"
                value={form.name}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, name: e.target.value }))
                }
                onBlur={() =>
                  setTouched((prev) => ({ ...prev, name: true }))
                }
                autoComplete="cc-name"
                aria-invalid={touched.name && !!errors.name}
                aria-describedby={
                  touched.name && errors.name ? "ck-name-err" : undefined
                }
              />
              {touched.name && errors.name && (
                <p
                  id="ck-name-err"
                  role="alert"
                  className="text-xs text-destructive"
                >
                  {errors.name}
                </p>
              )}
            </div>

            {/* Card number */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ck-card">{t("checkout.cardNumber")}</Label>
              <Input
                id="ck-card"
                value={form.cardNumber}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    cardNumber: formatCardNumber(e.target.value),
                  }))
                }
                onBlur={() =>
                  setTouched((prev) => ({ ...prev, cardNumber: true }))
                }
                inputMode="numeric"
                autoComplete="cc-number"
                placeholder="0000 0000 0000 0000"
                maxLength={19}
                aria-invalid={touched.cardNumber && !!errors.cardNumber}
                aria-describedby={
                  touched.cardNumber && errors.cardNumber
                    ? "ck-card-err"
                    : undefined
                }
              />
              {touched.cardNumber && errors.cardNumber && (
                <p
                  id="ck-card-err"
                  role="alert"
                  className="text-xs text-destructive"
                >
                  {errors.cardNumber}
                </p>
              )}
            </div>

            {/* Expiry + CVC */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="ck-exp">{t("checkout.expiry")}</Label>
                <Input
                  id="ck-exp"
                  value={form.expiry}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      expiry: formatExpiry(e.target.value),
                    }))
                  }
                  onBlur={() =>
                    setTouched((prev) => ({ ...prev, expiry: true }))
                  }
                  inputMode="numeric"
                  autoComplete="cc-exp"
                  placeholder="MM/YY"
                  maxLength={5}
                  aria-invalid={touched.expiry && !!errors.expiry}
                  aria-describedby={
                    touched.expiry && errors.expiry
                      ? "ck-exp-err"
                      : undefined
                  }
                />
                {touched.expiry && errors.expiry && (
                  <p
                    id="ck-exp-err"
                    role="alert"
                    className="text-xs text-destructive"
                  >
                    {errors.expiry}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="ck-cvc">{t("checkout.cvc")}</Label>
                <Input
                  id="ck-cvc"
                  value={form.cvc}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      cvc: e.target.value.replace(/\D/g, "").slice(0, 4),
                    }))
                  }
                  onBlur={() =>
                    setTouched((prev) => ({ ...prev, cvc: true }))
                  }
                  inputMode="numeric"
                  autoComplete="cc-csc"
                  placeholder="123"
                  maxLength={4}
                  aria-invalid={touched.cvc && !!errors.cvc}
                  aria-describedby={
                    touched.cvc && errors.cvc ? "ck-cvc-err" : undefined
                  }
                />
                {touched.cvc && errors.cvc && (
                  <p
                    id="ck-cvc-err"
                    role="alert"
                    className="text-xs text-destructive"
                  >
                    {errors.cvc}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order summary (RIGHT on desktop, bottom on mobile) */}
        <div className="lg:sticky lg:top-20">
          <Card>
            <CardHeader>
              <CardTitle>{t("cart.total")}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <ul className="flex flex-col gap-2 text-sm">
                {cartRows.map(({ course }) => {
                  const title = locale === "ar" ? course.titleAr : course.title;
                  return (
                    <li
                      key={course.id}
                      className="flex items-start justify-between gap-2"
                    >
                      <span className="text-foreground line-clamp-2 flex-1">
                        {title}
                      </span>
                      <span className="text-muted-foreground font-medium whitespace-nowrap">
                        {formatPrice(course.price)}
                      </span>
                    </li>
                  );
                })}
              </ul>

              <Separator />

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {t("cart.subtotal")}
                </span>
                <span className="text-foreground font-medium">
                  {formatPrice(subtotal)}
                </span>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground">
                  {t("cart.total")}
                </span>
                <span className="text-lg font-bold text-foreground">
                  {formatPrice(total)}
                </span>
              </div>

              <Button
                size="lg"
                className="w-full"
                disabled={processing}
                onClick={handlePay}
                aria-busy={processing}
              >
                {processing ? (
                  <>
                    <Loader2 className="w-4 h-4 me-1.5 animate-spin" />
                    {locale === "ar" ? "جارٍ المعالجة…" : "Processing…"}
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 me-1.5" />
                    {t("checkout.pay", { amount: formatPrice(total) })}
                    <ForwardIcon className="w-4 h-4 ms-1.5" />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
