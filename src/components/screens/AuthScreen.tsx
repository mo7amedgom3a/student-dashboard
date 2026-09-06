"use client";

import { useId, useMemo, useState } from "react";
import {
  Award,
  Eye,
  EyeOff,
  GraduationCap,
  Globe,
  Sparkles,
  Star,
  Target,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { useI18n } from "@/hooks/use-i18n";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type AuthTab = "signup" | "login";

type FieldErrors = {
  name?: string;
  email?: string;
  password?: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * AuthScreen — full-viewport entry screen.
 *
 * Left (desktop) / top (mobile): violet brand hero with logo, tagline, and
 * three trust bullets. Right / bottom: an auth card with Sign up / Log in
 * tabs, inline validation, a prominent "Continue as demo student" CTA, and a
 * terms footer. A small EN / ع language switcher sits in the top-end corner.
 *
 * All routing is handled by the Zustand store:
 *   - signUp(name, email)  → onboarding
 *   - logIn(email)         → home (with seeded demo progress)
 *   - loginAsDemo()        → home (pre-seeded enrolled + saved + progress)
 */
export function AuthScreen() {
  const { t, locale } = useI18n();
  const signUp = useAppStore((s) => s.signUp);
  const logIn = useAppStore((s) => s.logIn);
  const loginAsDemo = useAppStore((s) => s.loginAsDemo);
  const setLocale = useAppStore((s) => s.setLocale);

  const [tab, setTab] = useState<AuthTab>("signup");

  // Form fields (shared across tabs — only the ones relevant to each tab are
  // validated and submitted).
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  // Stable field IDs for label association.
  const nameId = useId();
  const emailId = useId();
  const passwordId = useId();

  const validate = (mode: AuthTab): boolean => {
    const next: FieldErrors = {};
    const emailTrim = email.trim();
    if (mode === "signup" && !name.trim()) {
      next.name = t("auth.error.nameRequired");
    }
    if (!emailTrim) {
      next.email = t("auth.error.emailRequired");
    } else if (!EMAIL_RE.test(emailTrim)) {
      next.email = t("auth.error.emailInvalid");
    }
    if (password.length < 4) {
      next.password = t("auth.error.passwordShort");
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSignup = () => {
    if (!validate("signup")) return;
    signUp(name.trim(), email.trim());
  };

  const handleLogin = () => {
    if (!validate("login")) return;
    logIn(email.trim());
  };

  const handleTabChange = (value: string) => {
    setTab(value as AuthTab);
    // Clear field errors when switching tabs so stale messages don't linger.
    setErrors({});
  };

  const trustItems = useMemo(
    () => [
      {
        icon: Target,
        title: t("auth.trust.goals"),
        desc: t("auth.trust.goalsDesc"),
      },
      {
        icon: Sparkles,
        title: t("auth.trust.ai"),
        desc: t("auth.trust.aiDesc"),
      },
      {
        icon: Award,
        title: t("auth.trust.certificates"),
        desc: t("auth.trust.certificatesDesc"),
      },
    ],
    [t],
  );

  return (
    <div className="view-enter relative flex min-h-screen w-full flex-col bg-background lg:flex-row">
      {/* Language switcher — top-end corner, works over both panels */}
      <LanguageSwitcher locale={locale} onLocaleChange={setLocale} ariaLabel={t("auth.languageToggle")} />

      {/* ───────────────────────── Brand hero ───────────────────────── */}
      <section
        aria-label={t("brand.name")}
        className="relative flex shrink-0 flex-col justify-between overflow-hidden p-6 text-white sm:p-10 lg:flex-1 lg:min-h-screen lg:p-14"
        style={{
          background:
            "linear-gradient(135deg, #a617e8 0%, #8512ba 45%, #42095d 100%)",
        }}
      >
        {/* Soft dot-pattern overlay */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.14]"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.85) 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        />
        {/* Glow accent */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -end-24 size-72 rounded-full bg-white/10 blur-3xl"
        />

        {/* Logo + brand name */}
        <div className="relative z-10 flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-lg bg-white/15 ring-1 ring-white/25 backdrop-blur">
            <GraduationCap className="size-5" />
          </span>
          <span className="text-xl font-bold tracking-tight">
            {t("brand.name")}
          </span>
        </div>

        {/* Hero copy */}
        <div className="relative z-10 mt-8 max-w-md lg:mt-0">
          <h1 className="text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
            {t("auth.title")}
          </h1>
          <p className="mt-3 text-base text-white/85 sm:text-lg">
            {t("auth.subtitle")}
          </p>
          <p className="mt-2 text-sm font-medium uppercase tracking-wide text-white/60">
            {t("brand.tagline")}
          </p>
        </div>

        {/* Trust bullets */}
        <ul className="relative z-10 mt-8 space-y-3.5">
          {trustItems.map((item) => (
            <li key={item.title} className="flex items-start gap-3">
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-white/15 ring-1 ring-white/20">
                <item.icon className="size-4" />
              </span>
              <span className="flex flex-col">
                <span className="text-sm font-semibold leading-tight">
                  {item.title}
                </span>
                <span className="text-xs leading-snug text-white/70">
                  {item.desc}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* ───────────────────────── Auth card ───────────────────────── */}
      <main className="flex flex-1 items-center justify-center bg-muted/40 p-4 sm:p-6 lg:p-8">
        <Card className="w-full max-w-md border-border shadow-lg">
          <CardContent className="flex flex-col gap-5 px-5 py-6 sm:px-7 sm:py-8">
            {/* Compact brand lockup inside the card */}
            <div className="flex items-center gap-2.5">
              <span className="grid size-9 place-items-center rounded-lg bg-primary text-primary-foreground shadow-sm">
                <GraduationCap className="size-5" />
              </span>
              <div className="flex flex-col leading-tight">
                <span className="text-sm font-bold text-foreground">
                  {t("brand.name")}
                </span>
                <span className="text-xs text-muted-foreground">
                  {t("brand.tagline")}
                </span>
              </div>
            </div>

            <Tabs value={tab} onValueChange={handleTabChange} className="gap-4">
              <TabsList
                className="grid h-10 w-full grid-cols-2"
                aria-label={t("auth.tabsLabel")}
              >
                <TabsTrigger value="signup" className="text-sm font-medium">
                  {t("auth.signupTab")}
                </TabsTrigger>
                <TabsTrigger value="login" className="text-sm font-medium">
                  {t("auth.loginTab")}
                </TabsTrigger>
              </TabsList>

              {/* ───── Sign up form ───── */}
              <TabsContent value="signup" className="mt-1 outline-none">
                <form
                  className="flex flex-col gap-3.5"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSignup();
                  }}
                  noValidate
                >
                  <Field
                    id={nameId}
                    label={t("auth.name")}
                    error={errors.name}
                  >
                    <Input
                      id={nameId}
                      type="text"
                      autoComplete="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={t("auth.namePlaceholder")}
                      aria-label={t("auth.name")}
                      aria-invalid={!!errors.name}
                      aria-describedby={errors.name ? `${nameId}-error` : undefined}
                    />
                  </Field>

                  <Field
                    id={emailId}
                    label={t("auth.email")}
                    error={errors.email}
                  >
                    <Input
                      id={emailId}
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t("auth.emailPlaceholder")}
                      aria-label={t("auth.email")}
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? `${emailId}-error` : undefined}
                    />
                  </Field>

                  <Field
                    id={passwordId}
                    label={t("auth.password")}
                    error={errors.password}
                  >
                    <PasswordInput
                      id={passwordId}
                      value={password}
                      onChange={setPassword}
                      placeholder={t("auth.passwordPlaceholder")}
                      ariaLabel={t("auth.password")}
                      showLabel={t("auth.showPassword")}
                      hideLabel={t("auth.hidePassword")}
                      show={showPassword}
                      onToggle={() => setShowPassword((v) => !v)}
                      invalid={!!errors.password}
                      describedBy={errors.password ? `${passwordId}-error` : undefined}
                    />
                  </Field>

                  <Button type="submit" size="lg" className="mt-1 w-full">
                    {t("auth.signupCta")}
                  </Button>
                </form>
              </TabsContent>

              {/* ───── Log in form ───── */}
              <TabsContent value="login" className="mt-1 outline-none">
                <form
                  className="flex flex-col gap-3.5"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleLogin();
                  }}
                  noValidate
                >
                  <Field
                    id={emailId}
                    label={t("auth.email")}
                    error={errors.email}
                  >
                    <Input
                      id={emailId}
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t("auth.emailPlaceholder")}
                      aria-label={t("auth.email")}
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? `${emailId}-error` : undefined}
                    />
                  </Field>

                  <Field
                    id={passwordId}
                    label={t("auth.password")}
                    error={errors.password}
                  >
                    <PasswordInput
                      id={passwordId}
                      value={password}
                      onChange={setPassword}
                      placeholder={t("auth.passwordPlaceholder")}
                      ariaLabel={t("auth.password")}
                      showLabel={t("auth.showPassword")}
                      hideLabel={t("auth.hidePassword")}
                      show={showPassword}
                      onToggle={() => setShowPassword((v) => !v)}
                      invalid={!!errors.password}
                      describedBy={errors.password ? `${passwordId}-error` : undefined}
                    />
                  </Field>

                  <Button type="submit" size="lg" className="mt-1 w-full">
                    {t("auth.loginCta")}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            {/* "or" divider */}
            <div className="relative flex items-center py-0.5" aria-hidden="true">
              <span className="w-full border-t border-border" />
              <span className="bg-card px-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {t("auth.or")}
              </span>
              <span className="w-full border-t border-border" />
            </div>

            {/* Demo CTA — prominent */}
            <div className="flex flex-col items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-gold/15 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-300">
                <Star className="size-3 fill-current" />
                {t("auth.demoBadge")}
              </span>
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={loginAsDemo}
                className="w-full border-2 border-primary/40 bg-primary/5 text-primary hover:bg-primary/10 hover:border-primary/60 font-semibold"
              >
                <Sparkles className="size-4" />
                {t("auth.demoCta")}
              </Button>
              <p className="text-center text-xs leading-relaxed text-muted-foreground">
                {t("auth.demoHelper")}
              </p>
            </div>

            {/* Terms footer */}
            <p className="text-center text-xs leading-relaxed text-muted-foreground">
              {t("auth.terms")}
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

/* ─────────────────────────── Sub-components ─────────────────────────── */

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </Label>
      {children}
      {error ? (
        <p
          id={`${id}-error`}
          role="alert"
          className="text-xs font-medium text-destructive"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}

function PasswordInput({
  id,
  value,
  onChange,
  placeholder,
  ariaLabel,
  showLabel,
  hideLabel,
  show,
  onToggle,
  invalid,
  describedBy,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  ariaLabel: string;
  showLabel: string;
  hideLabel: string;
  show: boolean;
  onToggle: () => void;
  invalid: boolean;
  describedBy?: string;
}) {
  return (
    <div className="relative">
      <Input
        id={id}
        type={show ? "text" : "password"}
        autoComplete="current-password"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
        aria-invalid={invalid}
        aria-describedby={describedBy}
        className="pe-10"
      />
      <button
        type="button"
        onClick={onToggle}
        aria-label={show ? hideLabel : showLabel}
        className="absolute inset-y-0 end-0 flex w-10 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
      >
        {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
}

function LanguageSwitcher({
  locale,
  onLocaleChange,
  ariaLabel,
}: {
  locale: "en" | "ar";
  onLocaleChange: (l: "en" | "ar") => void;
  ariaLabel: string;
}) {
  return (
    <div
      className="absolute end-3 top-3 z-30 sm:end-5 sm:top-5"
      role="group"
      aria-label={ariaLabel}
    >
      <div className="flex items-center gap-0.5 rounded-full border border-border bg-card/85 p-1 shadow-sm backdrop-blur">
        <Globe className="ms-1.5 size-3.5 text-muted-foreground" aria-hidden="true" />
        <SwitchButton
          active={locale === "en"}
          onClick={() => onLocaleChange("en")}
          label="English"
        >
          EN
        </SwitchButton>
        <SwitchButton
          active={locale === "ar"}
          onClick={() => onLocaleChange("ar")}
          label="العربية"
        >
          ع
        </SwitchButton>
      </div>
    </div>
  );
}

function SwitchButton({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={label}
      title={label}
      className={
        "min-w-8 rounded-full px-2.5 py-1 text-xs font-bold transition-colors " +
        (active
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground")
      }
    >
      {children}
    </button>
  );
}
