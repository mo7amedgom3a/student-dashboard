"use client";

import { useEffect, useMemo, useState } from "react";
import { Search as SearchIcon, SlidersHorizontal, X, Sparkles } from "lucide-react";
import { useI18n } from "@/hooks/use-i18n";
import { searchCourses, getRole, type SearchResult } from "@/lib/mock-data";
import { CourseCard } from "@/components/shared/CourseCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { CourseLevel } from "@/lib/types";

const CATEGORIES = ["Data", "Web Dev", "Design", "Product", "Marketing"] as const;
const CATEGORY_AR: Record<string, string> = {
  Data: "البيانات",
  "Web Dev": "تطوير الويب",
  Design: "التصميم",
  Product: "المنتج",
  Marketing: "التسويق",
};
const LEVELS: CourseLevel[] = ["Beginner", "Intermediate", "Advanced"];
const LEVEL_AR: Record<CourseLevel, string> = {
  Beginner: "مبتدئ",
  Intermediate: "متوسط",
  Advanced: "متقدم",
};
const SUGGESTED_KEYWORDS = [
  "SQL",
  "React",
  "data analyst",
  "become a data analyst",
  "relational databases",
  "figma",
  "product manager",
  "SEO",
];

type DurationFilter = "any" | "short" | "medium" | "long";
type RatingFilter = "any" | "fourPlus" | "fourFive";

const DEBOUNCE_MS = 250;

export function SearchScreen() {
  const { t, locale, isRTL } = useI18n();

  // --- Search query state ----------------------------------------------------
  const [query, setQuery] = useState("");
  const [committedQuery, setCommittedQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>(() => searchCourses(""));

  // Debounced search (setState only inside the timeout callback → safe vs
  // the react-hooks/set-state-in-effect rule).
  useEffect(() => {
    const handle = window.setTimeout(() => {
      setCommittedQuery(query);
      setResults(searchCourses(query));
    }, DEBOUNCE_MS);
    return () => window.clearTimeout(handle);
  }, [query]);

  // Loading state is *derived* — visible while the user's input hasn't been
  // committed by the debounced timer. Acts as a ~DEBOUNCE_MS skeleton window.
  const loading = query.trim() !== committedQuery.trim();
  const committedTrimmed = committedQuery.trim();
  const isBrowseMode = committedTrimmed === "";

  // --- Filter state ----------------------------------------------------------
  const [levels, setLevels] = useState<CourseLevel[]>([]);
  const [duration, setDuration] = useState<DurationFilter>("any");
  const [rating, setRating] = useState<RatingFilter>("any");
  const [languages, setLanguages] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const toggleLevel = (lvl: CourseLevel) => {
    setLevels((prev) =>
      prev.includes(lvl) ? prev.filter((l) => l !== lvl) : [...prev, lvl]
    );
  };
  const toggleLanguage = (lang: string) => {
    setLanguages((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    );
  };

  const clearFilters = () => {
    setLevels([]);
    setDuration("any");
    setRating("any");
    setLanguages([]);
    setSelectedCategory(null);
  };

  const activeFilterCount =
    levels.length +
    (duration !== "any" ? 1 : 0) +
    (rating !== "any" ? 1 : 0) +
    languages.length +
    (selectedCategory ? 1 : 0);
  const hasActiveFilters = activeFilterCount > 0;

  // --- Apply filters client-side --------------------------------------------
  const filteredResults = useMemo(() => {
    return results.filter((r) => {
      const c = r.course;
      if (levels.length > 0 && !levels.includes(c.level)) return false;
      if (duration === "short" && c.totalHours >= 10) return false;
      if (duration === "medium" && (c.totalHours < 10 || c.totalHours > 20))
        return false;
      if (duration === "long" && c.totalHours <= 20) return false;
      if (rating === "fourPlus" && c.rating < 4.0) return false;
      if (rating === "fourFive" && c.rating < 4.5) return false;
      if (languages.length > 0 && !languages.includes(c.language)) return false;
      if (selectedCategory && c.category !== selectedCategory) return false;
      return true;
    });
  }, [results, levels, duration, rating, languages, selectedCategory]);

  // --- Semantic role banner --------------------------------------------------
  // Use the first *filtered* result so the banner only appears when at least
  // one matching course is actually visible (not filtered out).
  const matchedRoleId = filteredResults[0]?.matchedRole;
  const matchedRole = matchedRoleId ? getRole(matchedRoleId) : undefined;
  const roleLabel = matchedRole
    ? locale === "ar"
      ? matchedRole.labelAr
      : matchedRole.label
    : undefined;

  // --- Helpers ---------------------------------------------------------------
  const categoryLabel = (cat: string) =>
    locale === "ar" ? CATEGORY_AR[cat] ?? cat : cat;
  const levelLabel = (lvl: CourseLevel) =>
    locale === "ar" ? LEVEL_AR[lvl] : lvl;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Commit immediately on explicit submit (debounce timer will no-op).
    setCommittedQuery(query);
    setResults(searchCourses(query));
  };

  // --- Filter panel (rendered both in desktop sidebar and mobile Sheet) -----
  const renderFilterPanel = (prefix: string) => (
    <div className="flex flex-col gap-6">
      {/* Level */}
      <fieldset>
        <legend className="text-sm font-semibold mb-3 text-foreground">
          {t("search.filter.level")}
        </legend>
        <div className="flex flex-col gap-2.5">
          {LEVELS.map((lvl) => {
            const id = `${prefix}-level-${lvl}`;
            const checked = levels.includes(lvl);
            return (
              <div key={lvl} className="flex items-center gap-2">
                <Checkbox
                  id={id}
                  checked={checked}
                  onCheckedChange={() => toggleLevel(lvl)}
                />
                <Label
                  htmlFor={id}
                  className="text-sm font-normal cursor-pointer"
                >
                  {levelLabel(lvl)}
                </Label>
              </div>
            );
          })}
        </div>
      </fieldset>

      <Separator />

      {/* Duration */}
      <fieldset>
        <legend className="text-sm font-semibold mb-3 text-foreground">
          {t("search.filter.duration")}
        </legend>
        <RadioGroup
          name={`${prefix}-duration`}
          value={duration}
          onValueChange={(v) => setDuration(v as DurationFilter)}
          className="gap-2.5"
        >
          {(
            [
              { value: "any", label: t("search.filter.any") },
              { value: "short", label: t("search.filter.short") },
              { value: "medium", label: t("search.filter.medium") },
              { value: "long", label: t("search.filter.long") },
            ] as { value: DurationFilter; label: string }[]
          ).map((opt) => (
            <div key={opt.value} className="flex items-center gap-2">
              <RadioGroupItem id={`${prefix}-dur-${opt.value}`} value={opt.value} />
              <Label
                htmlFor={`${prefix}-dur-${opt.value}`}
                className="text-sm font-normal cursor-pointer"
              >
                {opt.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </fieldset>

      <Separator />

      {/* Rating */}
      <fieldset>
        <legend className="text-sm font-semibold mb-3 text-foreground">
          {t("search.filter.rating")}
        </legend>
        <RadioGroup
          name={`${prefix}-rating`}
          value={rating}
          onValueChange={(v) => setRating(v as RatingFilter)}
          className="gap-2.5"
        >
          {(
            [
              { value: "any", label: t("search.filter.any") },
              { value: "fourPlus", label: t("search.filter.fourPlus") },
              { value: "fourFive", label: t("search.filter.fourFive") },
            ] as { value: RatingFilter; label: string }[]
          ).map((opt) => (
            <div key={opt.value} className="flex items-center gap-2">
              <RadioGroupItem id={`${prefix}-rat-${opt.value}`} value={opt.value} />
              <Label
                htmlFor={`${prefix}-rat-${opt.value}`}
                className="text-sm font-normal cursor-pointer"
              >
                {opt.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </fieldset>

      <Separator />

      {/* Language */}
      <fieldset>
        <legend className="text-sm font-semibold mb-3 text-foreground">
          {t("search.filter.language")}
        </legend>
        <div className="flex flex-col gap-2.5">
          {["English"].map((lang) => {
            const id = `${prefix}-lang-${lang}`;
            const checked = languages.includes(lang);
            return (
              <div key={lang} className="flex items-center gap-2">
                <Checkbox
                  id={id}
                  checked={checked}
                  onCheckedChange={() => toggleLanguage(lang)}
                />
                <Label
                  htmlFor={id}
                  className="text-sm font-normal cursor-pointer"
                >
                  {lang}
                </Label>
              </div>
            );
          })}
        </div>
      </fieldset>

      {hasActiveFilters && (
        <>
          <Separator />
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="justify-start text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" /> {t("search.clear")}
          </Button>
        </>
      )}
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8">
      {/* Heading + search */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
          {t("search.title")}
        </h1>
        <form
          onSubmit={handleSubmit}
          role="search"
          className="relative max-w-2xl"
        >
          <SearchIcon
            className="absolute top-1/2 -translate-y-1/2 start-3.5 w-5 h-5 text-muted-foreground pointer-events-none"
            aria-hidden
          />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("search.placeholder")}
            aria-label={t("search.title")}
            className="h-12 sm:h-14 ps-12 pe-10 text-base sm:text-lg rounded-md shadow-sm"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label={t("search.clear")}
              className="absolute top-1/2 -translate-y-1/2 end-3 w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </form>
      </div>

      <div className="flex gap-6 lg:gap-8">
        {/* Sidebar (desktop) */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
                {t("search.filters")}
              </h2>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-7 text-xs"
                >
                  {t("search.clear")}
                </Button>
              )}
            </div>
            {renderFilterPanel("desktop")}
          </div>
        </aside>

        {/* Main results */}
        <main className="flex-1 min-w-0">
          {/* Mobile filters button */}
          <div className="flex items-center justify-between mb-4 lg:hidden">
            <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <SlidersHorizontal className="w-4 h-4" />
                  {t("search.filters")}
                  {hasActiveFilters && (
                    <Badge className="ms-1 h-5 min-w-5 px-1 text-[10px] bg-primary text-primary-foreground flex items-center justify-center">
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent
                side={isRTL ? "right" : "left"}
                className="w-80 sm:w-96 overflow-y-auto flex flex-col"
              >
                <SheetHeader>
                  <SheetTitle>{t("search.filters")}</SheetTitle>
                  <SheetDescription className="sr-only">
                    {t("search.filters")}
                  </SheetDescription>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto px-4 pb-4">
                  {renderFilterPanel("mobile")}
                </div>
                <div className="border-t border-border p-4 flex gap-2">
                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      onClick={clearFilters}
                      className="flex-1"
                    >
                      {t("search.clear")}
                    </Button>
                  )}
                  <Button
                    onClick={() => setMobileFiltersOpen(false)}
                    className="flex-1"
                  >
                    {t("common.close")}
                  </Button>
                </div>
              </SheetContent>
            </Sheet>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-8 text-xs"
              >
                <X className="w-3.5 h-3.5" /> {t("search.clear")}
              </Button>
            )}
          </div>

          {/* Results area */}
          <div aria-live="polite" aria-busy={loading}>
            {loading ? (
              <ResultsSkeleton />
            ) : isBrowseMode ? (
              <BrowseResults
                filteredResults={filteredResults}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                categoryLabel={categoryLabel}
                countLabel={t("search.count", { n: filteredResults.length })}
                browseLabel={t("search.browse")}
                clearLabel={t("search.clear")}
                noResultsLabel={t("search.noResults")}
              />
            ) : (
              <SearchResults
                filteredResults={filteredResults}
                committedQuery={committedTrimmed}
                matchedRoleLabel={roleLabel}
                t={t}
                onSuggestionClick={(kw) => setQuery(kw)}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Browse mode (empty query): all courses + category chips
// ---------------------------------------------------------------------------
interface BrowseResultsProps {
  filteredResults: SearchResult[];
  selectedCategory: string | null;
  onSelectCategory: (cat: string | null) => void;
  categoryLabel: (cat: string) => string;
  countLabel: string;
  browseLabel: string;
  clearLabel: string;
  noResultsLabel: string;
}

function BrowseResults({
  filteredResults,
  selectedCategory,
  onSelectCategory,
  categoryLabel,
  countLabel,
  browseLabel,
  clearLabel,
  noResultsLabel,
}: BrowseResultsProps) {
  return (
    <div>
      {/* Active category chip */}
      {selectedCategory && (
        <div className="flex items-center gap-2 mb-4">
          <Badge variant="secondary" className="text-sm">
            {categoryLabel(selectedCategory)}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={() => onSelectCategory(null)}
          >
            <X className="w-3.5 h-3.5" /> {clearLabel}
          </Button>
        </div>
      )}

      {/* Browse by category */}
      <div className="mb-6">
        <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground mb-3">
          {browseLabel}
        </h2>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => onSelectCategory(active ? null : cat)}
                aria-pressed={active}
                className={
                  "px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors border " +
                  (active
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-foreground border-border hover:border-primary/50 hover:bg-accent")
                }
              >
                {categoryLabel(cat)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Count */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-muted-foreground">{countLabel}</span>
      </div>

      {filteredResults.length === 0 ? (
        <EmptyState title={noResultsLabel} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredResults.map((r) => (
            <CourseCard
              key={r.course.id}
              course={r.course}
              variant="default"
              showActions
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Search results mode (non-empty query)
// ---------------------------------------------------------------------------
interface SearchResultsProps {
  filteredResults: SearchResult[];
  committedQuery: string;
  matchedRoleLabel?: string;
  t: (key: string, params?: Record<string, string | number>) => string;
  onSuggestionClick: (kw: string) => void;
}

function SearchResults({
  filteredResults,
  committedQuery,
  matchedRoleLabel,
  t,
  onSuggestionClick,
}: SearchResultsProps) {
  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
        <h2 className="text-lg sm:text-xl font-semibold text-foreground">
          {t("search.resultsFor", { q: committedQuery })}
        </h2>
        <span className="text-sm text-muted-foreground">
          {t("search.count", { n: filteredResults.length })}
        </span>
      </div>

      {/* Semantic role banner */}
      {matchedRoleLabel && (
        <div className="mb-4 p-3 rounded-md bg-primary/5 border border-primary/20 flex items-center gap-2.5 text-sm">
          <Sparkles className="w-4 h-4 text-primary shrink-0" aria-hidden />
          <p className="text-foreground leading-snug">
            <span className="text-muted-foreground">{t("search.semantic")}:</span>{" "}
            <span className="font-semibold">{matchedRoleLabel}</span>
          </p>
        </div>
      )}

      {filteredResults.length === 0 ? (
        <EmptyState
          icon={SearchIcon}
          title={t("search.noResults")}
          description={t("search.suggested")}
          action={
            <div className="flex flex-wrap justify-center gap-2 mt-2 max-w-md">
              {SUGGESTED_KEYWORDS.map((kw) => (
                <button
                  key={kw}
                  type="button"
                  onClick={() => onSuggestionClick(kw)}
                  className="px-3 py-1.5 rounded-full text-sm font-medium bg-background border border-border hover:border-primary/50 hover:bg-accent transition-colors"
                >
                  {kw}
                </button>
              ))}
            </div>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredResults.map((r) => (
            <CourseCard
              key={r.course.id}
              course={r.course}
              variant="default"
              showActions
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Skeleton loader (shown during debounce)
// ---------------------------------------------------------------------------
function ResultsSkeleton() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-5 w-20" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="border border-border rounded-lg overflow-hidden bg-card"
          >
            <Skeleton className="aspect-video w-full rounded-none" />
            <div className="p-4 flex flex-col gap-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
              <Skeleton className="h-4 w-1/3 mt-2" />
              <Skeleton className="h-8 w-full mt-2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
