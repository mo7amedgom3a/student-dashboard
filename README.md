# 🎓 Edify Student Dashboard — Design System & Style Guide

A comprehensive specification and reference guide for the **Edify Student Dashboard** design system, style tokens, layout architecture, and UI components. Built with **Next.js 16 (App Router)**, **React 19**, **TypeScript 5**, **Tailwind CSS v4**, and **Radix UI / shadcn/ui** primitives.

---

## 📑 Table of Contents

1. [Overview & Design Philosophy](#overview--design-philosophy)
2. [Design Tokens & Theme Architecture](#design-tokens--theme-architecture)
   - [Palettes (`globals.css`)](#palettes-globalscss)
   - [Semantic Color Tokens](#semantic-color-tokens)
   - [Light vs. Dark Mode Mapping](#light-vs-dark-mode-mapping)
   - [Typography & Font Stacks](#typography--font-stacks)
   - [Border Radii System](#border-radii-system)
   - [Custom Utility Classes & Keyframes](#custom-utility-classes--keyframes)
3. [Layout Architecture & Patterns](#layout-architecture--patterns)
   - [App Shell & Navigation Model](#app-shell--navigation-model)
   - [Navigation Header (`Header.tsx`)](#navigation-header-headertsx)
   - [Global Footer (`Footer.tsx`)](#global-footer-footertsx)
   - [Container & Grid Guidelines](#container--grid-guidelines)
   - [Bi-Directional Layout & RTL Support](#bi-directional-layout--rtl-support)
4. [Component Style Guide](#component-style-guide)
   - [Buttons (`Button`)](#buttons-button)
   - [Cards (`Card`)](#cards-card)
   - [Dashboard Specific Cards](#dashboard-specific-cards)
   - [Badges (`Badge`)](#badges-badge)
   - [Progress Bars & Indicators](#progress-bars--indicators)
   - [Form Controls & Interactive Elements](#form-controls--interactive-elements)
   - [Tabs & Segmented Navigation](#tabs--segmented-navigation)
   - [Modals, Dialogs & Sheets](#modals-dialogs--sheets)
   - [Empty States & Feedback Overlays](#empty-states--feedback-overlays)
   - [Star Ratings & Review Summaries](#star-ratings--review-summaries)
5. [Student Dashboard Screen Inventory](#student-dashboard-screen-inventory)
6. [Implementation Best Practices & Rules](#implementation-best-practices--rules)

---

## 1. Overview & Design Philosophy

The Edify Student Dashboard blends the best aspects of two premier learning paradigms:
- **Udemy-Style Discovery**: Dynamic carousels, rich course cards, clear pricing, ratings, best-seller tags, and fast resume options.
- **Coursera-Style Goal Orientation**: Structured weekly planning, AI tutor coaching, career paths, verifiable certificates, and skill progress tracking.

### Core Visual Principles
- **Vibrant Primary & Warm Neutrals**: Anchored around vivid violet (`neon-violet-500: #a617e8`) and soft lavender (`thistle-50: #f5ecf9`) on warm gray surfaces (`white-smoke-50: #f3f2f2`). Cards remain crisp pure white (`#ffffff`) for sharp layered depth.
- **Micro-Interactions**: Soft hover elevations (`hover:-translate-y-0.5 hover:shadow-lg`), smooth screen transitions (`.view-enter`), slide drawer flows (`.slide-enter`), and animated confetti bursts.
- **First-Class Bi-Directional (LTR & RTL)**: Every component is authored using CSS Logical Properties (`ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`) with native Arabic typography via Cairo.

---

## 2. Design Tokens & Theme Architecture

Defined in `src/app/globals.css` using Tailwind CSS v4 `@theme inline` declarations.

### Palettes (`globals.css`)

All 7 distinct color scales provide a range from `50` (lightest tint) to `950` (deepest dark shade):

| Palette Name | Description | Key Hex (500 / Base) | Primary Usage |
| :--- | :--- | :--- | :--- |
| **`white-smoke`** | Warm-tinted neutral grays | `#857a7a` (500) | Backgrounds, cards, borders, text, muted elements |
| **`neon-violet`** | Vivid violet brand scale | `#a617e8` (500) | Primary CTA buttons, brand badges, active links |
| **`thistle`** | Soft lavender accent scale | `#9d40bf` (500) | Subtle container backgrounds, secondary chips, tags |
| **`mauve`** | Deep dusty purple scale | `#9f2ad5` (500) | Accents, gradients, category tags |
| **`wisteria`** | Floral violet scale | `#a221de` (500) | Decorative illustrations and gradients |
| **`mauve-magic`** | High-saturation purple scale | `#a71ce3` (500) | Visual interest in charts and confetti particles |
| **`hyper-magenta`**| Electric magenta scale | `#a616e9` (500) | Secondary highlight accents and chart data points |

#### Neutral Scale (`white-smoke` Values)
```css
--color-white-smoke-50:  #f3f2f2; /* Default Page Background */
--color-white-smoke-100: #e7e4e4; /* Secondary / Muted background */
--color-white-smoke-200: #cecaca; /* Default Border & Input outline */
--color-white-smoke-300: #b6afaf; /* Disabled text / dividers */
--color-white-smoke-400: #9d9595; /* Secondary text */
--color-white-smoke-500: #857a7a; /* Mid-tone gray */
--color-white-smoke-600: #6a6262; /* Muted foreground text */
--color-white-smoke-700: #504949; /* Dark borders */
--color-white-smoke-800: #353131; /* Dark mode card surface */
--color-white-smoke-900: #1b1818; /* Body text (light mode) / Dark card */
--color-white-smoke-950: #131111; /* Dark mode page background */
```

---

### Semantic Color Tokens

Tokens adapt dynamically between light and dark modes via CSS variables:

| Semantic Token | Light Mode Value | Dark Mode Value | Usage in Student Dashboard |
| :--- | :--- | :--- | :--- |
| `--background` | `#f3f2f2` (`white-smoke-50`) | `#131111` (`white-smoke-950`) | Canvas background for the entire application |
| `--foreground` | `#1b1818` (`white-smoke-900`) | `#f3f2f2` (`white-smoke-50`) | High-contrast body typography |
| `--card` | `#ffffff` (Pure white) | `#1b1818` (`white-smoke-900`) | Course cards, modals, content panels, sidebars |
| `--card-foreground`| `#1b1818` | `#f3f2f2` | Typography inside card containers |
| `--primary` | `#a617e8` (`neon-violet-500`)| `#c77aeb` (`neon-violet-300`)| Primary buttons, resume progress bar, key brand elements |
| `--primary-foreground`| `#ffffff` | `#1b1818` | Text on primary brand buttons and badges |
| `--secondary` | `#e7e4e4` (`white-smoke-100`)| `#353131` (`white-smoke-800`)| Secondary buttons, chip filters, neutral pill tags |
| `--secondary-foreground`| `#1b1818` | `#f3f2f2` | Typography on secondary backgrounds |
| `--accent` | `#f5ecf9` (`thistle-50`) | `#3f194d` (`thistle-800`) | Lavender hover states, soft card highlights, selected chips |
| `--accent-foreground` | `#5e2673` (`thistle-700`) | `#d8b3e6` (`thistle-200`) | Text/icons on lavender accent backgrounds |
| `--muted` | `#e7e4e4` (`white-smoke-100`)| `#353131` (`white-smoke-800`)| Skeleton placeholders, inactive tracks, subtle dividers |
| `--muted-foreground` | `#6a6262` (`white-smoke-600`)| `#b6afaf` (`white-smoke-300`)| Timestamps, lesson counts, subtitles, instructor bio |
| `--border` / `--input`| `#cecaca` (`white-smoke-200`)| `#504949` (`white-smoke-700`)| Card borders, input outlines, table rows, separators |
| `--ring` | `#a617e8` (`neon-violet-500`)| `#c77aeb` (`neon-violet-300`)| Focus outlines (`focus-visible:ring-ring`) |
| `--success` | `#1e7f45` | `#22a559` | Course completion, progress bar fill, quiz passed |
| `--gold` | `#f5c518` | `#f5c518` | Rating stars, bestseller badge, milestones, trophies |
| `--destructive` | `#b91c1c` | `#ef4444` | Delete actions, quiz failures, error alerts |

---

### Typography & Font Stacks

Fonts are loaded with Google Fonts via `next/font/google` in `src/app/layout.tsx`:

- **Latin / Western (LTR)**: **Inter** (`--font-inter`)
  - Crisp readability for UI, tabular numeric metrics, and course titles.
- **Arabic (RTL)**: **Cairo** (`--font-cairo`)
  - Clean geometry optimized for modern Arab typography, headings, and instructional content.
- **Monospace**: **Geist Mono** (`--font-geist-mono`)
  - Code snippets, certificate IDs, and system timestamps.

#### Global Font Layering (`globals.css`)
```css
@layer base {
  body {
    @apply bg-background text-foreground;
    font-feature-settings: "rlig" 1, "calt" 1;
  }
  [dir="ltr"] body {
    font-family: var(--font-inter), sans-serif;
  }
  [dir="rtl"] body {
    font-family: var(--font-cairo), var(--font-inter), sans-serif;
  }
}
```

---

### Border Radii System

Defined with `--radius: 0.625rem` (10px base):

| Utility | CSS Calculation | Exact Value | Common Usage |
| :--- | :--- | :--- | :--- |
| `rounded-sm` | `calc(var(--radius) - 4px)` | **6px** | Small icon badges, nested tags |
| `rounded-md` | `calc(var(--radius) - 2px)` | **8px** | Standard buttons, input fields, dropdown items |
| `rounded-lg` | `var(--radius)` | **10px** | Course cards, dialog windows, alert banners |
| `rounded-xl` | `calc(var(--radius) + 4px)` | **14px** | Feature cards, hero cards, media containers |
| `rounded-full` | `9999px` | **Circle/Pill**| User avatars, notification badges, filter pills |

---

### Custom Utility Classes & Keyframes

```css
/* Custom slim scrollbar for dense curriculum & drawer lists */
.lms-scroll {
  scrollbar-width: thin;
  scrollbar-color: var(--muted-foreground) transparent;
}

/* Hidden scrollbar for horizontal carousels */
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.no-scrollbar::-webkit-scrollbar {
  display: none;
}

/* Star rating & trophy accents */
.text-gold { color: var(--gold); }
.bg-gold   { background-color: var(--gold); }

/* Route transition animations */
.view-enter {
  animation: viewEnter 320ms cubic-bezier(0.22, 1, 0.36, 1);
}
@keyframes viewEnter {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* RTL-aware multi-step slide animation */
.slide-enter {
  animation: slideEnter 280ms cubic-bezier(0.22, 1, 0.36, 1);
}
@keyframes slideEnter {
  from { opacity: 0; transform: translateX(24px); }
  to   { opacity: 1; transform: translateX(0); }
}
[dir="rtl"] .slide-enter {
  animation: slideEnterRtl 280ms cubic-bezier(0.22, 1, 0.36, 1);
}
@keyframes slideEnterRtl {
  from { opacity: 0; transform: translateX(-24px); }
  to   { opacity: 1; transform: translateX(0); }
}

/* AI assistant typing indicator */
.typing-dot {
  animation: typingBounce 1.2s infinite ease-in-out;
}
```

---

## 3. Layout Architecture & Patterns

### App Shell & Navigation Model

The application uses an event-driven SPA router managed through Zustand (`src/lib/store.ts`).

```
+---------------------------------------------------------------+
|  Sticky Header (h-16, Logo, Primary Nav, Search, Cart, User)  |
+---------------------------------------------------------------+
|  <main> Content Area (view-enter transition wrapper)          |
|                                                               |
|  [ Standard Layout: max-w-7xl px-4 sm:px-6 py-6 ]            |
|  - Hero Greeting & Continue Learning Rail                     |
|  - Discovery Carousels / Tabbed Views                         |
|  - Detailed Screen Content & Responsive Grids                |
|                                                               |
+---------------------------------------------------------------+
|  Global Footer (Links, Locale Indicator, Copyright)          |
+---------------------------------------------------------------+
```

#### Chrome Display Rules (`src/app/page.tsx`)
1. **Full-Screen Modes**: `auth` and `onboarding` hide the header and footer for focused account creation and setup.
2. **Immersive Modes**: `course-player` and `quiz` hide the global header/footer and render dedicated video/assessment toolbars.
3. **Standard Dashboard Screens**: Render sticky `Header`, main container with animated transitions, and `Footer`.

---

### Navigation Header (`Header.tsx`)

- **Container**: `sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur` (height `h-16`).
- **Logo Lockup**: Vivid violet initial badge (`w-9 h-9 bg-primary text-primary-foreground font-bold rounded-md`) with platform brand typography.
- **Primary Navigation Links**:
  - `Home` (`Home` icon)
  - `Search / Catalog` (`Search` icon)
  - `My Learning` (`GraduationCap` icon)
  - `Saved Courses` (`Heart` icon + rose counter badge)
  - `My Plan` (`Target` icon)
  - `Consultations` (`Users` icon)
  - `Certifications` (`Award` icon)
- **"Explore" Dropdown Menu**:
  - `AI Learning Planner` (`CalendarRange` icon + description)
  - `AI Learning Coach` (`Bot` icon + description)
- **Utility Actions**:
  - Quick Search Modal Trigger
  - Shopping Cart Trigger with live item badge
  - Language Switcher (`EN` / `عربي - SA/EG`)
  - User Profile Menu with Avatar, Learner Name, and Logout

---

### Global Footer (`Footer.tsx`)

- **Container**: `mt-auto border-t border-border bg-muted/30 py-10`.
- **4-Column Grid**: Brand story, Learning shortcuts, Help & Policies, Social/Regional dialect flags.

---

### Container & Grid Guidelines

Standardized responsive widths across student screens:
- **Full Dashboard Canvas**: `max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8` (Home, Search, My Learning, AI Planner).
- **Focused Detail Layout**: `max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8` (Instructor Profile, Checkout, Certifications).
- **Conversational / Player Center**: `max-w-3xl mx-auto w-full` (AI Coach Screen, Quiz Assessment Container).

---

### Bi-Directional Layout & RTL Support

The dashboard automatically syncs document direction with the selected locale via `<DirSync />` in `src/components/shared/DirSync.tsx`.

#### Writing Direction Guidelines:
1. **Always use CSS Logical Spacing**:
   - Instead of `ml-*` / `mr-*` -> use `ms-*` (margin-inline-start) and `me-*` (margin-inline-end).
   - Instead of `pl-*` / `pr-*` -> use `ps-*` (padding-inline-start) and `pe-*` (padding-inline-end).
   - Instead of `left-*` / `right-*` -> use `start-*` and `end-*`.
   - Instead of `text-left` / `text-right` -> use `text-start` and `text-end`.
2. **Rounded Corners**:
   - Use `rounded-ss-*` (start-start) and `rounded-se-*` (start-end) for directional speech bubbles and tabs.
3. **Directional Icons**:
   - Flip navigational chevrons and arrows conditionally using `isRTL ? ArrowLeft : ArrowRight`.

---

## 4. Component Style Guide

### Buttons (`Button`)

Built upon Radix UI Slot with `class-variance-authority` in `src/components/ui/button.tsx`.

```tsx
<Button variant="default" size="default">Enroll Now</Button>
<Button variant="outline" size="sm">Preview Syllabus</Button>
<Button variant="ghost" size="icon"><Heart className="w-4 h-4" /></Button>
```

#### Variants:
- **`default`**: `bg-primary text-primary-foreground shadow-xs hover:bg-primary/90`
  - High-visibility calls to action (Enroll, Resume, Generate Plan, Save).
- **`outline`**: `border border-border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground`
  - Secondary actions (Add to Cart, View Full Profile, Filter Options).
- **`secondary`**: `bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80`
  - Supportive button actions and navigation tabs.
- **`ghost`**: `hover:bg-accent hover:text-accent-foreground`
  - Quiet navigational triggers, table buttons, icon controls.
- **`destructive`**: `bg-destructive text-white shadow-xs hover:bg-destructive/90`
  - Removing saved courses, canceling booked sessions.
- **`link`**: `text-primary underline-offset-4 hover:underline`
  - Inline text navigation.

#### Sizes:
- **`default`**: `h-9 px-4 py-2 text-sm`
- **`sm`**: `h-8 px-3 text-xs rounded-md`
- **`lg`**: `h-10 px-6 text-base rounded-md`
- **`icon`**: `size-9 p-0 flex items-center justify-center`

---

### Cards (`Card`)

The standard card component provides structured content division:

```tsx
<Card className="rounded-xl border border-border bg-card text-card-foreground shadow-sm">
  <CardHeader>
    <CardTitle>Course Overview</CardTitle>
    <CardDescription>Master Python in 30 Days</CardDescription>
  </CardHeader>
  <CardContent>...</CardContent>
  <CardFooter>...</CardFooter>
</Card>
```

---

### Dashboard Specific Cards

#### 1. Course Card (`CourseCard.tsx`)
Features three variants:
- **`default`**: Vertical grid card with 16:9 thumbnail, category badge, bestseller pill, multi-line title clamp, instructor name, star rating with review count, total hours & lesson icons, price and action controls.
- **`wide`**: Horizontal desktop row for search results and list views.
- **`compact`**: Dense mini card for sidebars and cart dropdowns.

```
+-----------------------------------------+
| [Thumbnail: Course Image / Play Icon]   |
|                                         |
| [CATEGORY BADGE]     [BESTSELLER PILL]  |
| Course Title Line 1                     |
| Course Title Line 2 (Clamped)           |
| Instructor Name                         |
| ★ 4.8 (12,430) • 14.5 hrs • 82 lessons  |
| $19.99  $84.99                          |
| [Wishlist Heart]       [Add to Cart]    |
+-----------------------------------------+
```

#### 2. Continue Learning Card
- Used in the hero rail of `HomeScreen`.
- Includes live percentage badge, progress track (`h-2 bg-muted rounded-full` filled with `bg-success`), and an instant **"Resume"** primary action button.

#### 3. AI Plan Week Card
- Connected via a vertical rail (`absolute top-3 bottom-3 w-px bg-border start-2`).
- Milestone flag badge (`bg-gold text-black`), focus area tags, enrolled course checklist, and hours allocation.

#### 4. Certificate Credential Card
- Bordered frame with official completion seal, student name, instructor signature, completion date, and verification action buttons (Download PDF / View in Modal).

---

### Badges (`Badge`)

Located in `src/components/ui/badge.tsx`.

```tsx
<Badge variant="default">Enrolled</Badge>
<Badge variant="secondary">Web Development</Badge>
<Badge className="bg-gold text-black font-bold">Bestseller</Badge>
<Badge className="bg-success/15 text-success border-success/30">Completed</Badge>
```

| Badge Purpose | Classes / Treatment | Example Context |
| :--- | :--- | :--- |
| **Category Tag** | `variant="secondary" text-[10px] font-semibold uppercase tracking-wide` | Course Cards, Search Filters |
| **Bestseller** | `bg-gold text-black hover:bg-gold font-bold text-[10px]` | Discovery Carousels |
| **Completed** | `bg-success/15 text-success border border-success/30` | My Learning Progress |
| **Level Chip** | `variant="outline" text-muted-foreground` | Beginner, Intermediate, Advanced |

---

### Progress Bars & Indicators

#### 1. Standard Course Progress Bar
```tsx
<div className="w-full bg-muted rounded-full h-2 overflow-hidden">
  <div 
    className="bg-success h-2 rounded-full transition-all duration-300"
    style={{ width: `${percent}%` }}
  />
</div>
```

#### 2. Milestone Stepper (`StepProgressBar.tsx`)
- Multi-step circular badges (`w-8 h-8 rounded-full`) connected by animated line tracks.
- States: **Completed** (Violet with check icon), **Active** (Violet border with pulse ring), **Upcoming** (Muted gray).

---

### Form Controls & Interactive Elements

- **`Input` & `Textarea`**: Warm border (`border-input`), rounded corner (`rounded-md`), subtle background (`bg-transparent` / `bg-card`), and focus ring (`focus-visible:ring-ring`).
- **`Slider`** (AI Planner hours allocation): Primary violet track thumb with live value chip.
- **Interactive Role & Skill Chips**:
  ```tsx
  <button 
    aria-pressed={selected}
    className={cn(
      "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
      selected 
        ? "bg-primary text-primary-foreground border-primary" 
        : "bg-background text-foreground border-border hover:bg-accent"
    )}
  >
    {role.label}
  </button>
  ```

---

### Tabs & Segmented Navigation

In `src/components/ui/tabs.tsx`:
- **Pill Tab List**: `bg-muted p-1 rounded-lg inline-flex items-center gap-1`.
- **Active Trigger**: `data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs font-semibold`.
- Used extensively in:
  - `MyLearningScreen`: In-Progress | Saved Courses | Certificates
  - `ConsultationsScreen`: Explore Mentors | Scheduled Sessions
  - `CoursePlayerScreen`: Overview | Notes | Discussions | Resources

---

### Modals, Dialogs & Sheets

- **`Dialog`** (`src/components/ui/dialog.tsx`): Centered popups with backdrop blur for booking confirmations, certificate views, and video previews.
- **`Sheet`** (`src/components/ui/sheet.tsx`): Slide-over drawer used for the mobile course curriculum menu and filter sheets.

---

### Empty States & Feedback Overlays

#### Empty State (`EmptyState.tsx`)
Reusable centered placeholder component:
- Large icon wrapped in a soft circular container (`w-16 h-16 rounded-full bg-muted/60 text-muted-foreground`).
- Bold heading (`text-lg font-semibold`).
- Informative description with maximum readability width (`max-w-sm text-sm text-muted-foreground`).
- Primary call-to-action button (e.g., "Browse Catalog").

#### Confetti Overlay (`ConfettiOverlay.tsx`)
Particle celebration triggered upon:
- Completing student onboarding.
- Finishing a course and earning a certificate.
- Passing a quiz assessment.
- Generating a customized AI study plan.
- *Particle Palette*: neon-violet-500, thistle-500, mauve-magic-500, gold, success-green.

---

### Star Ratings & Review Summaries

#### `StarRating.tsx`
- Renders 5 SVG stars with precise fractional fill (`width: ${fraction * 100}%`).
- Uses brand gold color (`text-gold` / `#f5c518`).
- Accessible text alternatives for screen readers.

---

## 5. Student Dashboard Screen Inventory

| Screen Name | Route ID | Key Layout Features & Components |
| :--- | :--- | :--- |
| **Home Screen** | `home` | Personalized greeting, continue learning rail with live progress, 3 horizontal discovery carousels. |
| **Search & Catalog** | `search` | Sticky filter bar, category chips, rating dropdown, responsive wide/grid course cards. |
| **Course Landing** | `course-landing` | Sticky checkout card with video teaser, course objectives, syllabus accordion, instructor bio. |
| **Course Player** | `course-player` | Immersive video player, collapsible curriculum drawer, lecture notes, Q&A discussion tab. |
| **My Learning** | `my-learning` | Tabbed dashboard for In-Progress courses, Wishlist/Saved courses, and Earned Certificates. |
| **My Plan** | `my-plan` | Active weekly study roadmap, checkbox progress tracking, and custom study plan creator modal. |
| **AI Study Planner** | `ai-planner` | Goal builder with role chips, weekly hours slider, timeline selector, and generated 12-week roadmap. |
| **AI Learning Coach**| `ai-coach` | Full-viewport conversational chat, bot avatar chips, suggestion prompts, simulated thinking indicator. |
| **Consultations** | `consultations` | 1-on-1 mentor booking directory, mentor bio cards, expertise badges, and slot booking calendar. |
| **Certifications** | `certifications` | Official credential vault, certificate preview dialog, shareable links, and PDF download triggers. |
| **Instructor Profile**| `instructor-profile`| Hero banner with instructor avatar, aggregated student stats, all instructor courses, student review list. |
| **Quiz Assessment** | `quiz` | Immersive question stepper, multiple-choice radio cards, countdown timer, pass/fail celebration screen. |
| **Cart & Checkout** | `cart` / `checkout` | Order summary, promo voucher applicator, payment card selectors, secure checkout trigger. |
| **Checkout Success** | `checkout-confirmation`| Order receipt card, confetti animation, and immediate "Start Learning Now" button. |
| **Auth & Onboarding**| `auth` / `onboarding` | Dual-panel brand hero, demo quick-login, multi-step role selection, and career goal questionnaire. |

---

## 6. Implementation Best Practices & Rules

1. **Strict Logical Properties**: Never author `left-*`, `right-*`, `ml-*`, `mr-*`, `pl-*`, or `pr-*`. All student dashboard components must support seamless RTL mirroring for Arabic users.
2. **Semantic Contrast**: Avoid hardcoded hex colors in React components. Use Tailwind semantic tokens (`bg-background`, `bg-card`, `text-foreground`, `text-muted-foreground`, `border-border`, `bg-primary`, `text-primary-foreground`).
3. **Accessibility Attributes**:
   - Provide `aria-label` for all icon-only buttons.
   - Use `aria-pressed` for toggle chips and filter pills.
   - Tag status regions with `role="status"` or `aria-live="polite"`.
4. **Responsive Strategy**:
   - Mobile-first approach: grids start at `grid-cols-1`, scaling to `sm:grid-cols-2`, `md:grid-cols-3`, `lg:grid-cols-4`.
   - Carousels default to touch-friendly horizontal scroll (`overflow-x-auto no-scrollbar`) on mobile.
