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
  Compass,
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

  const navItems = [
    { name: "home" as RouteName, label: t("nav.home"), icon: Home, onClick: () => navigate("home"), active: route.name === "home" },
    { name: "search" as RouteName, label: t("nav.search"), icon: Search, onClick: () => navigate("search"), active: route.name === "search" },
    { name: "my-learning" as RouteName, label: t("nav.myLearning"), icon: GraduationCap, onClick: () => navigate("my-learning"), active: isLearningActive },
    { name: "saved" as RouteName, label: t("nav.savedCourses"), icon: Heart, onClick: () => navigate("my-learning", { tab: "saved" }), active: isSavedActive, count: savedCount },
    { name: "my-plan" as RouteName, label: t("nav.myPlan"), icon: Target, onClick: () => navigate("my-plan"), active: route.name === "my-plan" },
    { name: "consultations" as RouteName, label: t("nav.consultations"), icon: Users, onClick: () => navigate("consultations"), active: route.name === "consultations" },
    { name: "certifications" as RouteName, label: t("nav.certifications"), icon: Award, onClick: () => navigate("certifications"), active: route.name === "certifications" },
  ];

  const aiTools: { name: RouteName; label: string; icon: typeof Home; desc: string }[] = [
    { name: "ai-planner", label: t("nav.aiPlanner"), icon: CalendarRange, desc: t("aiPlanner.navDesc") },
    { name: "ai-coach", label: t("nav.aiCoach"), icon: Bot, desc: t("aiCoach.navDesc") },
  ];

  const aiRouteNames = ["ai-planner", "ai-coach"];
  const aiActive = aiRouteNames.includes(route.name);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center gap-3">
        {/* Logo */}
        <button
          onClick={() => navigate("home")}
          className="flex items-center gap-2 shrink-0"
          aria-label="Edify home"
        >
          <div className="w-9 h-9 rounded-md bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
            E
          </div>
          <div className="hidden sm:flex flex-col items-start leading-none">
            <span className="font-bold text-base text-foreground">{t("brand.name")}</span>
            <span className="text-[10px] text-muted-foreground">{t("brand.tagline")}</span>
          </div>
        </button>

        {/* Desktop & Tablet nav */}
        <nav className="hidden md:flex items-center gap-0.5 lg:gap-1 mx-1 lg:mx-2" aria-label="Primary">
          {navItems.map((item) => {
            const active = item.active;
            return (
              <Button
                key={item.name}
                variant={active ? "secondary" : "ghost"}
                size="sm"
                className={cn(
                  "h-9 lg:h-10 px-2 lg:px-2.5 text-xs lg:text-sm font-medium",
                  active && "font-semibold"
                )}
                onClick={item.onClick}
                aria-current={active ? "page" : undefined}
                title={item.label}
              >
                <item.icon className={cn("w-4 h-4 shrink-0", item.name === "saved" && item.count !== undefined && item.count > 0 && "text-rose-500 fill-rose-500/20")} />
                <span className="ms-1.5 hidden lg:inline">{item.label}</span>
                {item.count !== undefined && item.count > 0 && (
                  <span className="ms-1 hidden lg:inline-flex items-center justify-center h-4 min-w-4 px-1 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400">
                    {item.count}
                  </span>
                )}
              </Button>
            );
          })}

          {/* AI Tools dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant={aiActive ? "secondary" : "ghost"}
                size="sm"
                className="h-9 lg:h-10 px-2 lg:px-2.5 text-xs lg:text-sm gap-1.5"
                aria-label={t("nav.explore")}
                title={t("nav.explore")}
              >
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="hidden lg:inline">{t("nav.explore")}</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={isRTL ? "start" : "end"} className="w-64">
              <DropdownMenuLabel>{t("nav.explore")}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {aiTools.map((tool) => {
                const toolActive = route.name === tool.name;
                return (
                  <DropdownMenuItem
                    key={tool.name}
                    onClick={() => navigate(tool.name)}
                    className="gap-2.5 py-2 cursor-pointer"
                  >
                    <tool.icon className="w-4 h-4 text-primary shrink-0" />
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <div className="text-sm font-medium text-foreground flex items-center justify-between">
                        {tool.label}
                        {toolActive && <Check className="w-3.5 h-3.5 text-primary" />}
                      </div>
                      <div className="text-xs text-muted-foreground line-clamp-1">{tool.desc}</div>
                    </div>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        {/* Mobile quick nav + menu */}
        <div className="flex md:hidden items-center gap-1">
          <Button
            variant={route.name === "home" ? "secondary" : "ghost"}
            size="icon"
            className="h-9 w-9"
            onClick={() => navigate("home")}
            aria-label={t("nav.home")}
          >
            <Home className="w-4 h-4" />
          </Button>
          <Button
            variant={route.name === "search" ? "secondary" : "ghost"}
            size="icon"
            className="h-9 w-9"
            onClick={() => navigate("search")}
            aria-label={t("nav.search")}
          >
            <Search className="w-4 h-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant={["my-learning", "my-plan", "consultations", "certifications", "ai-planner", "ai-coach"].includes(route.name) ? "secondary" : "ghost"}
                size="icon"
                className="h-9 w-9"
                aria-label={t("nav.more")}
              >
                <Menu className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={isRTL ? "start" : "end"} className="w-56">
              <DropdownMenuLabel>{t("brand.name")}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("my-learning")} className="gap-2">
                <GraduationCap className="w-4 h-4 text-primary" /> {t("nav.myLearning")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("my-learning", { tab: "saved" })} className="gap-2">
                <Heart className="w-4 h-4 text-rose-500" /> {t("nav.savedCourses")}
                {savedCount > 0 && (
                  <Badge variant="secondary" className="ms-auto text-[10px] px-1.5 py-0 bg-rose-500/10 text-rose-500">
                    {savedCount}
                  </Badge>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("my-plan")} className="gap-2">
                <Target className="w-4 h-4 text-primary" /> {t("nav.myPlan")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("consultations")} className="gap-2">
                <Users className="w-4 h-4 text-primary" /> {t("nav.consultations")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("certifications")} className="gap-2">
                <Award className="w-4 h-4 text-primary" /> {t("nav.certifications")}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-xs text-muted-foreground">AI Tools</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => navigate("ai-planner")} className="gap-2">
                <CalendarRange className="w-4 h-4 text-primary" /> {t("nav.aiPlanner")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("ai-coach")} className="gap-2">
                <Bot className="w-4 h-4 text-primary" /> {t("nav.aiCoach")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex-1" />

        {/* Language switcher */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-10 gap-1.5">
              <Globe className="w-4 h-4" />
              <span className="hidden sm:inline text-sm font-medium">
                {locale === "en" ? "EN" : "ع"}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align={isRTL ? "start" : "end"} className="w-56">
            <DropdownMenuLabel>{t("nav.language")}</DropdownMenuLabel>
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={() => setLocale("en")}
                className="flex items-center justify-between"
              >
                <span>English</span>
                {locale === "en" && <Check className="w-4 h-4 text-primary" />}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setLocale("ar")}
                className="flex items-center justify-between"
              >
                <span>العربية</span>
                {locale === "ar" && <Check className="w-4 h-4 text-primary" />}
              </DropdownMenuItem>
            </DropdownMenuGroup>
            {locale === "ar" && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>{t("nav.dialect")}</DropdownMenuLabel>
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    onClick={() => setDialect("sa")}
                    className="flex items-center justify-between"
                  >
                    <span>{t("nav.dialect.sa")} — السعودي</span>
                    {dialect === "sa" && <Check className="w-4 h-4 text-primary" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setDialect("eg")}
                    className="flex items-center justify-between"
                  >
                    <span>{t("nav.dialect.eg")} — المصري</span>
                    {dialect === "eg" && <Check className="w-4 h-4 text-primary" />}
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Saved Courses / Wishlist */}
        <Button
          variant={isSavedActive ? "secondary" : "ghost"}
          size="icon"
          className="h-10 w-10 relative"
          onClick={() => navigate("my-learning", { tab: "saved" })}
          aria-label={t("nav.savedCourses")}
          title={t("nav.savedCourses")}
        >
          <Heart className={cn("w-5 h-5", savedCount > 0 && "text-rose-500 fill-rose-500/20")} />
          {savedCount > 0 && (
            <Badge className="absolute -top-0.5 -end-0.5 h-5 min-w-5 px-1 text-[10px] bg-rose-500 text-white hover:bg-rose-500 flex items-center justify-center font-bold">
              {savedCount}
            </Badge>
          )}
        </Button>

        {/* Cart */}
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 relative"
          onClick={() => navigate("cart")}
          aria-label={t("nav.cart")}
        >
          <ShoppingCart className="w-5 h-5" />
          {cartCount > 0 && (
            <Badge className="absolute -top-0.5 -end-0.5 h-5 min-w-5 px-1 text-[10px] bg-primary text-primary-foreground flex items-center justify-center">
              {cartCount}
            </Badge>
          )}
        </Button>

        {/* User */}
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-10 gap-2 ps-1.5">
                <div className="w-7 h-7 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-xs font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                {!isMobile && (
                  <span className="text-sm font-medium max-w-[120px] truncate">{user.name}</span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={isRTL ? "start" : "end"} className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold">{user.name}</span>
                  <span className="text-xs text-muted-foreground">{user.email}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("my-learning")}>
                <GraduationCap className="w-4 h-4 me-2" /> {t("nav.myLearning")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("my-learning", { tab: "saved" })}>
                <Heart className="w-4 h-4 me-2 text-rose-500" /> {t("nav.savedCourses")}
                {savedCount > 0 && (
                  <Badge variant="secondary" className="ms-auto text-[10px] px-1.5 py-0 bg-rose-500/10 text-rose-500">
                    {savedCount}
                  </Badge>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("my-plan")}>
                <Target className="w-4 h-4 me-2" /> {t("nav.myPlan")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("consultations")}>
                <Users className="w-4 h-4 me-2" /> {t("nav.consultations")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("certifications")}>
                <Award className="w-4 h-4 me-2" /> {t("nav.certifications")}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logOut} className="text-destructive focus:text-destructive">
                <LogOut className="w-4 h-4 me-2" /> {t("nav.logout")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button size="sm" className="h-10" onClick={() => navigate("auth")}>
            <User className="w-4 h-4" /> <span className="ms-1.5">{t("nav.signIn")}</span>
          </Button>
        )}
      </div>
    </header>
  );
}
