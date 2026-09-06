"use client";

import { useAppStore } from "@/lib/store";
import { useI18n } from "@/hooks/use-i18n";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  GraduationCap,
  Search,
  Home,
  ShoppingCart,
  User,
  Globe,
  LogOut,
  Heart,
  Check,
  Sparkles,
  CalendarRange,
  Bot,
  ChevronDown,
  Award,
  Users,
  Target,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import type { RouteName } from "@/lib/types";

export function Header() {
  const { t, locale, dialect, isRTL } = useI18n();
  const navigate = useAppStore((s) => s.navigate);
  const route = useAppStore((s) => s.route);
  const user = useAppStore((s) => s.user);
  const cartCount = useAppStore((s) => s.cart.length);
  const savedCount = useAppStore((s) => s.savedCourseIds.length);
  const logOut = useAppStore((s) => s.logOut);
  const setLocale = useAppStore((s) => s.setLocale);
  const setDialect = useAppStore((s) => s.setDialect);
  const isMobile = useIsMobile();

  // Don't render header on auth screen — that's a full-screen entry.
  if (route.name === "auth") return null;

  const isSavedActive = route.name === "my-learning" && route.params?.tab === "saved";
  const isLearningActive = route.name === "my-learning" && route.params?.tab !== "saved";

  // Primary navigation links: Core student items that remain accessible across screens
  const primaryNavItems = [
    {
      name: "home" as RouteName,
      label: t("nav.home"),
      icon: Home,
      onClick: () => navigate("home"),
      active: route.name === "home",
    },
    {
      name: "search" as RouteName,
      label: t("nav.search"),
      icon: Search,
      onClick: () => navigate("search"),
      active: route.name === "search",
    },
    {
      name: "my-learning" as RouteName,
      label: t("nav.myLearning"),
      icon: GraduationCap,
      onClick: () => navigate("my-learning"),
      active: isLearningActive,
    },
    {
      name: "my-plan" as RouteName,
      label: t("nav.myPlan"),
      icon: Target,
      onClick: () => navigate("my-plan"),
      active: route.name === "my-plan",
    },
  ];

  // Secondary items: Displayed inline on wide desktops (xl+), collapsed into "More" on tablet/laptop (md-lg)
  const secondaryNavItems = [
    {
      name: "consultations" as RouteName,
      label: t("nav.consultations"),
      icon: Users,
      onClick: () => navigate("consultations"),
      active: route.name === "consultations",
    },
    {
      name: "certifications" as RouteName,
      label: t("nav.certifications"),
      icon: Award,
      onClick: () => navigate("certifications"),
      active: route.name === "certifications",
    },
  ];

  const aiTools: { name: RouteName; label: string; icon: typeof Home; desc: string }[] = [
    { name: "ai-planner", label: t("nav.aiPlanner"), icon: CalendarRange, desc: t("aiPlanner.navDesc") },
    { name: "ai-coach", label: t("nav.aiCoach"), icon: Bot, desc: t("aiCoach.navDesc") },
  ];

  const aiRouteNames = ["ai-planner", "ai-coach"];
  const aiActive = aiRouteNames.includes(route.name);
  const isSecondaryActive = secondaryNavItems.some((item) => item.active);

  return (
    <header className="sticky top-2 sm:top-3 z-50 w-full px-3 sm:px-6 lg:px-8 pointer-events-none transition-all duration-200">
      {/* Contained Floating Island with Glassmorphism */}
      <div className="mx-auto max-w-7xl h-16 rounded-2xl border border-border/60 dark:border-white/10 bg-background/80 dark:bg-card/75 backdrop-blur-xl shadow-lg shadow-black/5 dark:shadow-black/25 supports-[backdrop-filter]:bg-background/65 px-3 sm:px-4 flex items-center justify-between gap-2 sm:gap-4 pointer-events-auto">
        
        {/* Brand Logo Lockup */}
        <button
          onClick={() => navigate("home")}
          className="flex items-center gap-2.5 shrink-0 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg p-0.5"
          aria-label="Edify home"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary via-primary to-neon-violet-600 text-primary-foreground flex items-center justify-center font-bold text-lg shadow-sm shadow-primary/25 group-hover:scale-105 transition-transform">
            E
          </div>
          <div className="hidden sm:flex flex-col items-start leading-none">
            <span className="font-bold text-base tracking-tight text-foreground group-hover:text-primary transition-colors">
              {t("brand.name")}
            </span>
            <span className="text-[10px] text-muted-foreground font-medium">
              {t("brand.tagline")}
            </span>
          </div>
        </button>

        {/* Desktop & Tablet Navigation (Adaptive to strictly avoid overflow) */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-1.5 min-w-0" aria-label="Primary">
          {/* Primary Core Links */}
          {primaryNavItems.map((item) => {
            const active = item.active;
            return (
              <Button
                key={item.name}
                variant={active ? "secondary" : "ghost"}
                size="sm"
                className={cn(
                  "h-9 px-2.5 lg:px-3 text-xs lg:text-sm font-medium rounded-xl transition-all",
                  active
                    ? "bg-primary/15 text-primary hover:bg-primary/20 hover:text-primary font-semibold shadow-xs"
                    : "text-foreground/80 hover:text-foreground hover:bg-accent/60"
                )}
                onClick={item.onClick}
                aria-current={active ? "page" : undefined}
                title={item.label}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                <span className="ms-1.5 hidden lg:inline">{item.label}</span>
              </Button>
            );
          })}

          {/* Secondary Links: Shown directly on xl+ screens (1280px+) */}
          <div className="hidden xl:flex items-center gap-1 lg:gap-1.5">
            {secondaryNavItems.map((item) => {
              const active = item.active;
              return (
                <Button
                  key={item.name}
                  variant={active ? "secondary" : "ghost"}
                  size="sm"
                  className={cn(
                    "h-9 px-2.5 lg:px-3 text-xs lg:text-sm font-medium rounded-xl transition-all",
                    active
                      ? "bg-primary/15 text-primary hover:bg-primary/20 hover:text-primary font-semibold shadow-xs"
                      : "text-foreground/80 hover:text-foreground hover:bg-accent/60"
                  )}
                  onClick={item.onClick}
                  aria-current={active ? "page" : undefined}
                  title={item.label}
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  <span className="ms-1.5">{item.label}</span>
                </Button>
              );
            })}
          </div>

          {/* Explore AI Tools Dropdown Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant={aiActive ? "secondary" : "ghost"}
                size="sm"
                className={cn(
                  "h-9 px-2.5 lg:px-3 text-xs lg:text-sm gap-1.5 rounded-xl transition-all",
                  aiActive
                    ? "bg-primary/15 text-primary hover:bg-primary/20 hover:text-primary font-semibold shadow-xs"
                    : "text-foreground/80 hover:text-foreground hover:bg-accent/60"
                )}
                aria-label={t("nav.explore")}
                title={t("nav.explore")}
              >
                <Sparkles className="w-4 h-4 text-primary shrink-0" />
                <span className="hidden lg:inline">{t("nav.explore")}</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-60 shrink-0" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align={isRTL ? "start" : "end"}
              className="w-64 rounded-xl border border-border/60 bg-card/90 backdrop-blur-xl shadow-xl p-1.5"
            >
              <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground px-2 py-1">
                {t("nav.explore")}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {aiTools.map((tool) => {
                const toolActive = route.name === tool.name;
                return (
                  <DropdownMenuItem
                    key={tool.name}
                    onClick={() => navigate(tool.name)}
                    className={cn(
                      "gap-2.5 py-2 px-2.5 rounded-lg cursor-pointer transition-colors",
                      toolActive && "bg-primary/10 text-primary font-medium"
                    )}
                  >
                    <div className="w-7 h-7 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <tool.icon className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <div className="text-sm font-medium text-foreground flex items-center justify-between">
                        {tool.label}
                        {toolActive && <Check className="w-3.5 h-3.5 text-primary ms-1" />}
                      </div>
                      <div className="text-[11px] text-muted-foreground line-clamp-1">{tool.desc}</div>
                    </div>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* "More" Overflow Dropdown: Compact menu for secondary items on md & lg screens */}
          <div className="hidden md:flex xl:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant={isSecondaryActive ? "secondary" : "ghost"}
                  size="sm"
                  className={cn(
                    "h-9 px-2.5 text-xs lg:text-sm gap-1 rounded-xl transition-all",
                    isSecondaryActive
                      ? "bg-primary/15 text-primary hover:bg-primary/20 hover:text-primary font-semibold shadow-xs"
                      : "text-foreground/80 hover:text-foreground hover:bg-accent/60"
                  )}
                  aria-label={t("nav.more")}
                  title={t("nav.more")}
                >
                  <span className="hidden lg:inline">{t("nav.more")}</span>
                  <ChevronDown className="w-3.5 h-3.5 opacity-60 shrink-0" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align={isRTL ? "start" : "end"}
                className="w-56 rounded-xl border border-border/60 bg-card/90 backdrop-blur-xl shadow-xl p-1.5"
              >
                <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground px-2 py-1">
                  {t("nav.more")}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {secondaryNavItems.map((item) => (
                  <DropdownMenuItem
                    key={item.name}
                    onClick={item.onClick}
                    className={cn(
                      "gap-2.5 py-2 px-2.5 rounded-lg cursor-pointer",
                      item.active && "bg-primary/10 text-primary font-medium"
                    )}
                  >
                    <item.icon className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-sm">{item.label}</span>
                    {item.active && <Check className="w-3.5 h-3.5 ms-auto text-primary" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </nav>

        {/* Right Toolbar: Actions, Switcher, Wishlist, Cart & Profile */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          
          {/* Mobile Quick Navigation Buttons (< md) */}
          <div className="flex md:hidden items-center gap-0.5">
            <Button
              variant={route.name === "home" ? "secondary" : "ghost"}
              size="icon"
              className={cn(
                "h-9 w-9 rounded-xl",
                route.name === "home" && "bg-primary/15 text-primary"
              )}
              onClick={() => navigate("home")}
              aria-label={t("nav.home")}
            >
              <Home className="w-4 h-4" />
            </Button>
            <Button
              variant={route.name === "search" ? "secondary" : "ghost"}
              size="icon"
              className={cn(
                "h-9 w-9 rounded-xl",
                route.name === "search" && "bg-primary/15 text-primary"
              )}
              onClick={() => navigate("search")}
              aria-label={t("nav.search")}
            >
              <Search className="w-4 h-4" />
            </Button>
          </div>

          {/* Language / Dialect Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-9 px-2 sm:px-2.5 gap-1.5 rounded-xl hover:bg-accent/60 text-xs sm:text-sm font-medium transition-all"
                title={t("nav.language")}
              >
                <Globe className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs font-semibold">
                  {locale === "en" ? "EN" : "ع"}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align={isRTL ? "start" : "end"}
              className="w-56 rounded-xl border border-border/60 bg-card/90 backdrop-blur-xl shadow-xl p-1.5"
            >
              <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground px-2 py-1">
                {t("nav.language")}
              </DropdownMenuLabel>
              <DropdownMenuGroup>
                <DropdownMenuItem
                  onClick={() => setLocale("en")}
                  className="flex items-center justify-between rounded-lg cursor-pointer"
                >
                  <span>English</span>
                  {locale === "en" && <Check className="w-4 h-4 text-primary" />}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setLocale("ar")}
                  className="flex items-center justify-between rounded-lg cursor-pointer"
                >
                  <span>العربية</span>
                  {locale === "ar" && <Check className="w-4 h-4 text-primary" />}
                </DropdownMenuItem>
              </DropdownMenuGroup>

              {locale === "ar" && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground px-2 py-1">
                    {t("nav.dialect")}
                  </DropdownMenuLabel>
                  <DropdownMenuGroup>
                    <DropdownMenuItem
                      onClick={() => setDialect("sa")}
                      className="flex items-center justify-between rounded-lg cursor-pointer"
                    >
                      <span>{t("nav.dialect.sa")} — السعودي</span>
                      {dialect === "sa" && <Check className="w-4 h-4 text-primary" />}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setDialect("eg")}
                      className="flex items-center justify-between rounded-lg cursor-pointer"
                    >
                      <span>{t("nav.dialect.eg")} — المصري</span>
                      {dialect === "eg" && <Check className="w-4 h-4 text-primary" />}
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Saved Courses / Wishlist Button */}
          <Button
            variant={isSavedActive ? "secondary" : "ghost"}
            size="icon"
            className={cn(
              "h-9 w-9 relative rounded-xl hover:bg-accent/60 transition-all",
              isSavedActive && "bg-rose-500/15 text-rose-500"
            )}
            onClick={() => navigate("my-learning", { tab: "saved" })}
            aria-label={t("nav.savedCourses")}
            title={t("nav.savedCourses")}
          >
            <Heart className={cn("w-4 h-4", savedCount > 0 && "text-rose-500 fill-rose-500/20")} />
            {savedCount > 0 && (
              <Badge className="absolute -top-1 -end-1 h-4 min-w-4 px-1 text-[9px] bg-rose-500 text-white hover:bg-rose-500 flex items-center justify-center font-bold rounded-full border-2 border-background">
                {savedCount}
              </Badge>
            )}
          </Button>

          {/* Shopping Cart Button */}
          <Button
            variant={route.name === "cart" ? "secondary" : "ghost"}
            size="icon"
            className={cn(
              "h-9 w-9 relative rounded-xl hover:bg-accent/60 transition-all",
              route.name === "cart" && "bg-primary/15 text-primary"
            )}
            onClick={() => navigate("cart")}
            aria-label={t("nav.cart")}
            title={t("nav.cart")}
          >
            <ShoppingCart className="w-4 h-4" />
            {cartCount > 0 && (
              <Badge className="absolute -top-1 -end-1 h-4 min-w-4 px-1 text-[9px] bg-primary text-primary-foreground flex items-center justify-center font-bold rounded-full border-2 border-background">
                {cartCount}
              </Badge>
            )}
          </Button>

          {/* User Profile or Sign In */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 gap-2 ps-1 pe-2 rounded-xl hover:bg-accent/60 transition-all"
                >
                  <div className="w-7 h-7 rounded-lg bg-primary/15 text-primary flex items-center justify-center text-xs font-bold ring-1 ring-primary/25">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  {!isMobile && (
                    <span className="text-xs font-semibold max-w-[100px] truncate text-foreground/90">
                      {user.name}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align={isRTL ? "start" : "end"}
                className="w-56 rounded-xl border border-border/60 bg-card/90 backdrop-blur-xl shadow-xl p-1.5"
              >
                <DropdownMenuLabel className="font-normal px-2 py-1.5">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-semibold text-foreground">{user.name}</span>
                    <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("my-learning")} className="rounded-lg cursor-pointer">
                  <GraduationCap className="w-4 h-4 me-2 text-primary" /> {t("nav.myLearning")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("my-learning", { tab: "saved" })} className="rounded-lg cursor-pointer">
                  <Heart className="w-4 h-4 me-2 text-rose-500" /> {t("nav.savedCourses")}
                  {savedCount > 0 && (
                    <Badge variant="secondary" className="ms-auto text-[10px] px-1.5 py-0 bg-rose-500/10 text-rose-500">
                      {savedCount}
                    </Badge>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("my-plan")} className="rounded-lg cursor-pointer">
                  <Target className="w-4 h-4 me-2 text-primary" /> {t("nav.myPlan")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("consultations")} className="rounded-lg cursor-pointer">
                  <Users className="w-4 h-4 me-2 text-primary" /> {t("nav.consultations")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("certifications")} className="rounded-lg cursor-pointer">
                  <Award className="w-4 h-4 me-2 text-primary" /> {t("nav.certifications")}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logOut} className="text-destructive focus:text-destructive rounded-lg cursor-pointer">
                  <LogOut className="w-4 h-4 me-2" /> {t("nav.logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button size="sm" className="h-9 px-3 rounded-xl text-xs font-semibold shadow-xs" onClick={() => navigate("auth")}>
              <User className="w-3.5 h-3.5" /> <span className="ms-1.5">{t("nav.signIn")}</span>
            </Button>
          )}

          {/* Mobile Overflow Menu Button (< md) */}
          <div className="flex md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-xl hover:bg-accent/60"
                  aria-label={t("nav.more")}
                >
                  <Menu className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align={isRTL ? "start" : "end"}
                className="w-60 rounded-xl border border-border/60 bg-card/95 backdrop-blur-xl shadow-2xl p-1.5"
              >
                <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground px-2 py-1">
                  {t("brand.name")}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("my-learning")} className="gap-2.5 py-2 rounded-lg cursor-pointer">
                  <GraduationCap className="w-4 h-4 text-primary" /> {t("nav.myLearning")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("my-learning", { tab: "saved" })} className="gap-2.5 py-2 rounded-lg cursor-pointer">
                  <Heart className="w-4 h-4 text-rose-500" /> {t("nav.savedCourses")}
                  {savedCount > 0 && (
                    <Badge variant="secondary" className="ms-auto text-[10px] px-1.5 py-0 bg-rose-500/10 text-rose-500">
                      {savedCount}
                    </Badge>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("my-plan")} className="gap-2.5 py-2 rounded-lg cursor-pointer">
                  <Target className="w-4 h-4 text-primary" /> {t("nav.myPlan")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("consultations")} className="gap-2.5 py-2 rounded-lg cursor-pointer">
                  <Users className="w-4 h-4 text-primary" /> {t("nav.consultations")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("certifications")} className="gap-2.5 py-2 rounded-lg cursor-pointer">
                  <Award className="w-4 h-4 text-primary" /> {t("nav.certifications")}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground px-2 py-1">
                  AI Tools
                </DropdownMenuLabel>
                <DropdownMenuItem onClick={() => navigate("ai-planner")} className="gap-2.5 py-2 rounded-lg cursor-pointer">
                  <CalendarRange className="w-4 h-4 text-primary" /> {t("nav.aiPlanner")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("ai-coach")} className="gap-2.5 py-2 rounded-lg cursor-pointer">
                  <Bot className="w-4 h-4 text-primary" /> {t("nav.aiCoach")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

        </div>
      </div>
    </header>
  );
}
