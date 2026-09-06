# Build Prompt: LMS Student Workflow MVP Prototype

## Role
You are a senior frontend product engineer. Build a **clickable, high-fidelity MVP prototype** (no real backend required — mock/local data is fine) that simulates the **student-side workflow** of a modern LMS platform, combining the best of **Udemy** (in-course consumption experience) and **Coursera** (goal-driven onboarding & curriculum structure).

This is a prototype for demonstration and validation — prioritize visual polish, realistic interactions, and smooth flows over backend correctness. Use mock JSON data, local component state, and localStorage-free in-memory state (no browser storage APIs).

---

## Design System

**Tone:** Clean, modern, trustworthy, "edtech" feel — similar to Udemy/Coursera, not generic SaaS.

**Colors:**
- Primary: deep violet/indigo (`#5624D0`-ish, Udemy-inspired) OR Coursera blue (`#0056D2`) — pick one as primary brand color, use the other as an accent.
- Neutral grays for backgrounds/text (`#1C1D1F`, `#6A6F73`, `#F7F9FA`).
- Success green for completion/progress (`#1E7F45` / `#2ECC71`).
- Warning/rating gold (`#F5C518` style star rating color).
- Ensure AA contrast; support light mode (dark mode optional nice-to-have).

**Typography:**
- Latin: a widely-used LMS-style font — e.g. **"Source Sans Pro"**, **"Inter"**, or **"Nunito Sans"** for body; a slightly heavier weight for headings.
- Arabic: pair with **"Cairo"**, **"IBM Plex Sans Arabic"**, or **"Tajawal"** — these are the standard, highly legible fonts used across Arabic edtech/product UIs.
- Font sizes: clear hierarchy (H1 28–32px, H2 22–24px, body 15–16px, captions 13px).

**Components:** rounded-md cards (not overly rounded), soft shadows, clear primary/secondary button styles, skeleton loaders for async states.

---

## Internationalization (i18n) Requirement — Important

The platform must support **Arabic**, including **regional dialect tone in copy** (not just MSA/Fusha):
- Provide a language switcher (EN / AR) in the header.
- When Arabic is active, apply **RTL layout** (mirror nav, sidebars, icons, progress bars, breadcrumbs).
- Provide **two Arabic tone variants** the AI can generate copy for (can be a simple content toggle or just documented in code comments/mock data):
  - **Saudi dialect** tone for onboarding/marketing microcopy (e.g., "يلا نبدأ" style friendliness).
  - **Egyptian (Cairo) dialect** tone as an alternate variant.
- Keep Arabic UI strings in a separate i18n dictionary/mock file so tone/dialect can be swapped easily.
- Numbers, dates, and course durations should format correctly for the active locale.

---

## Global Multi-Step Flow Pattern (apply everywhere a flow has multiple steps)

Anywhere the platform has a multi-step process — **onboarding, quizzes, exams, checkout** — implement this **shared pattern**:
1. A **persistent progress bar** (or stepped indicator, e.g. "Step 2 of 5") at the top of the flow.
2. Each step is its **own sub-page/screen** (not one long scrolling form) with Back/Next navigation.
3. Smooth transition animation between steps (slide/fade).
4. On successful completion of the flow (onboarding finished, quiz submitted & passed, exam completed):
   - Trigger a **confetti animation** (canvas-confetti or CSS-based) over a "Completion" screen.
   - Show a celebratory summary (e.g., "You're all set!" / score achieved / recommended next action + CTA button).
5. Allow users to exit/save-and-continue-later where appropriate (onboarding especially).

---

## Feature Scope

### 1. Authentication / Entry
- Simple mock Sign Up / Log In screens (email + password, or "Continue as demo student").
- New accounts route into the **Onboarding Flow** below; returning accounts route to **Home**.

### 2. Onboarding Flow (Coursera-inspired, multi-step per pattern above)
Steps (each its own screen, with the shared progress bar + confetti on finish):
1. **Learning style / intent** — "Are you here to improve existing skills or learn something new?"
2. **Role / field of interest** — browsable + searchable list of roles/fields (e.g., "Data Analyst", "Frontend Developer") with search input.
3. **Skills to improve** — dynamic list generated based on the role selected in step 2 (multi-select chips).
4. **Education level** — highest level of education (dropdown or selectable cards).
5. **Completion screen** — confetti + "Building your personalized path..." → reveal a **personalized recommended courses** list generated from the onboarding answers.

### 3. Home Page (Udemy-inspired discovery + Coursera-inspired goal orientation)
Sections (horizontally scrollable course-card carousels):
- **What to Learn Next** — based on mock "student history."
- **Recommended For You** — based on onboarding answers (career goal/skills).
- **Trending Courses** — mock popularity/demand indicator.
- Each course card: thumbnail, title, instructor, rating (stars + count), level, duration, price/enrolled badge.

### 4. Search & Discovery (Coursera-inspired semantic search)
- Search bar supporting both **keyword search** (e.g., "SQL") and **conceptual/role-based queries** (e.g., "courses in relational databases", "become a data analyst") — mock this with a simple keyword-to-topic mapping table to simulate "semantic" matching.
- Results page with filters (level, duration, rating, language) and role/category browsing.

### 5. Course Landing Page (pre-enrollment) — merge both platforms' strengths
- Header: title, short description, rating, number of students, hours, level, language.
- **"Skills You Will Gain"** section (Coursera-style competency mapping).
- Syllabus/modules breakdown (collapsible, Coursera-style).
- Instructor profile card (photo, bio, rating, # students).
- Content details: what's included (videos, downloadable resources, articles).
- Similar/related course recommendations.
- Testimonials/reviews section with star breakdown.
- FAQ accordion section.
- Sticky enroll/add-to-cart CTA with price.

### 6. Course Player / In-Course Experience (Udemy-inspired, primary focus area)
- **Auto-resume:** on entering a course, automatically load the last uncompleted lesson's video (mock via stored "progress" state).
- Video player (mock video, can be a placeholder player UI) with a **"Mark as Complete"** action (Coursera-style explicit tracking) as well as automatic progress logging.
- **Right sidebar:** collapsible **course sections/curriculum list**, showing completed vs. incomplete lessons with checkmarks/progress indicators; current lesson highlighted.
- **Context-aware AI Assistant panel** (in sidebar or as a toggleable chat drawer): a chat UI that "answers based on course content and student history" — mock this with a canned/simulated response system (no real LLM call needed, or you may wire a real API if the environment supports it) referencing the current lesson's title/transcript.
- Below the video, tabbed sections:
  - **Overview** (title, description, language, rating, views, duration, enrolled count)
  - **Q&A** (list of mock questions/answers + "ask a question" input)
  - **Notes** (personal note-taking textarea, timestamped notes list tied to video position)
  - **Reviews** (student reviews + rating breakdown)
- Also surface **transcript** and **downloadable materials/files** per lesson (Coursera-style bundling) — a small "Resources" tab or panel alongside Overview/Q&A/Notes/Reviews.

### 7. My Learning Page
- Grid/list of all enrolled courses with **progress bars** (% complete).
- Separate tab/section for **Saved/Wishlist courses**.
- Separate tab/section for **Certificates earned** (mock certificate cards, viewable/downloadable placeholder).
- Continue-learning CTA per course routes directly into the auto-resumed lesson.

### 8. Cart & Checkout (Udemy-inspired e-commerce)
- Cart page listing selected courses (thumbnail, title, price, remove action).
- Order summary with mock total, promo code input (optional), and a "Checkout" button leading to a simple mock payment confirmation screen (this can also use the multi-step pattern: Cart → Payment → Confirmation, with confetti on success).

### 9. Quiz / Exam Flow (apply the shared multi-step pattern)
- A short in-course quiz (3–5 mock questions, multiple choice) accessible from a lesson.
- Progress bar across questions, one question per screen.
- Results/completion screen with score + confetti if passed, and a "Retry" option if failed.

---

## Non-Functional / UX Requirements
- Fully responsive (desktop-first, but usable on tablet/mobile).
- Skeleton/loading states for course lists and the AI assistant's "typing" response.
- Empty states designed (e.g., empty cart, no saved courses, no certificates yet).
- All interactive flows should feel real (state changes persist across navigation within the session, e.g., cart count, progress %, onboarding answers feeding into Home recommendations).
- Use realistic mock data (at least 12–15 varied mock courses across a few categories) — do not use lorem ipsum for course titles/descriptions.

## Deliverable
A working prototype covering all pages/flows above, connected with real navigation (not static screenshots), using mock data seeded in the project, ready to click through end-to-end as: **Sign up → Onboarding (with confetti) → Home → Search → Course Landing → Enroll/Cart → Checkout (with confetti) → Course Player (AI assistant, notes, Q&A) → Quiz (with confetti) → My Learning (progress + certificate).**
