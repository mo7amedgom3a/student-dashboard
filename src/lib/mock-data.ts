import type { Course, Instructor, Role, Skill, Quiz, ConsultationInstructor, ScheduledConsultation } from "./types";

/**
 * Mock data for the Edify LMS MVP prototype.
 * 15 realistic courses across Data, Web Dev, Design, Product, Marketing.
 * No lorem ipsum — real, varied titles/descriptions.
 */

// ---------- Skills ----------
export const skills: Skill[] = [
  { id: "sql", label: "SQL", labelAr: "SQL" },
  { id: "python", label: "Python", labelAr: "بايثون" },
  { id: "data-analysis", label: "Data Analysis", labelAr: "تحليل البيانات" },
  { id: "data-viz", label: "Data Visualization", labelAr: "تصور البيانات" },
  { id: "statistics", label: "Statistics", labelAr: "الإحصاء" },
  { id: "ml", label: "Machine Learning", labelAr: "التعلّم الآلي" },
  { id: "tableau", label: "Tableau", labelAr: "تابلو" },
  { id: "excel", label: "Excel", labelAr: "إكسل" },
  { id: "html-css", label: "HTML & CSS", labelAr: "HTML و CSS" },
  { id: "javascript", label: "JavaScript", labelAr: "جافاسكربت" },
  { id: "react", label: "React", labelAr: "رياكت" },
  { id: "node", label: "Node.js", labelAr: "نود.جي‌إس" },
  { id: "typescript", label: "TypeScript", labelAr: "تايبسكربت" },
  { id: "rest-api", label: "REST APIs", labelAr: "واجهات REST" },
  { id: "figma", label: "Figma", labelAr: "فيجما" },
  { id: "ux-research", label: "UX Research", labelAr: "بحث تجربة المستخدم" },
  { id: "ui-design", label: "UI Design", labelAr: "تصميم الواجهات" },
  { id: "prototyping", label: "Prototyping", labelAr: "النماذج الأولية" },
  { id: "product", label: "Product Strategy", labelAr: "استراتيجية المنتج" },
  { id: "roadmap", label: "Roadmapping", labelAr: "خارطة الطريق" },
  { id: "agile", label: "Agile", labelAr: "أجايل" },
  { id: "analytics", label: "Product Analytics", labelAr: "تحليلات المنتج" },
  { id: "seo", label: "SEO", labelAr: "تحسين محركات البحث" },
  { id: "content", label: "Content Marketing", labelAr: "تسويق المحتوى" },
  { id: "ads", label: "Paid Ads", labelAr: "الإعلانات المدفوعة" },
  { id: "branding", label: "Branding", labelAr: "الهوية البصرية" },
  { id: "copywriting", label: "Copywriting", labelAr: "كتابة الإعلانات" },
];

// ---------- Roles ----------
export const roles: Role[] = [
  {
    id: "data-analyst",
    label: "Data Analyst",
    labelAr: "محلل بيانات",
    skillIds: ["sql", "python", "data-analysis", "data-viz", "excel", "tableau", "statistics"],
    recommendedCourseIds: ["c-sql", "c-python-data", "c-tableau", "c-statistics"],
    icon: "BarChart3",
  },
  {
    id: "frontend-dev",
    label: "Frontend Developer",
    labelAr: "مطوّر واجهات أمامية",
    skillIds: ["html-css", "javascript", "react", "typescript"],
    recommendedCourseIds: ["c-html-css", "c-js", "c-react", "c-ts"],
    icon: "Code2",
  },
  {
    id: "fullstack-dev",
    label: "Full-Stack Developer",
    labelAr: "مطوّر_full_ستاك",
    skillIds: ["javascript", "react", "node", "typescript", "rest-api"],
    recommendedCourseIds: ["c-js", "c-react", "c-node", "c-ts"],
    icon: "Layers",
  },
  {
    id: "ux-designer",
    label: "UX Designer",
    labelAr: "مصمم تجربة مستخدم",
    skillIds: ["ux-research", "figma", "ui-design", "prototyping"],
    recommendedCourseIds: ["c-ux-research", "c-figma", "c-ui-design", "c-prototyping"],
    icon: "PenTool",
  },
  {
    id: "product-manager",
    label: "Product Manager",
    labelAr: "مدير منتج",
    skillIds: ["product", "roadmap", "agile", "analytics"],
    recommendedCourseIds: ["c-pm", "c-roadmap", "c-agile", "c-product-analytics"],
    icon: "Briefcase",
  },
  {
    id: "digital-marketer",
    label: "Digital Marketer",
    labelAr: "مسوّق رقمي",
    skillIds: ["seo", "content", "ads", "branding", "copywriting"],
    recommendedCourseIds: ["c-seo", "c-content", "c-paid-ads", "c-branding", "c-copywriting"],
    icon: "Megaphone",
  },
  {
    id: "ml-engineer",
    label: "ML Engineer",
    labelAr: "مهندس تعلّم آلي",
    skillIds: ["python", "ml", "statistics", "data-analysis"],
    recommendedCourseIds: ["c-python-data", "c-ml", "c-statistics"],
    icon: "BrainCircuit",
  },
  {
    id: "data-viz-specialist",
    label: "Data Visualization Specialist",
    labelAr: "أخصائي تصور بيانات",
    skillIds: ["tableau", "data-viz", "data-analysis", "excel"],
    recommendedCourseIds: ["c-tableau", "c-data-viz", "c-excel", "c-python-data"],
    icon: "PieChart",
  },
];

// ---------- Instructors ----------
export const instructors: Instructor[] = [
  {
    id: "i-1",
    name: "Dr. Amira Khalil",
    nameAr: "د. أميرة خليل",
    title: "Senior Data Scientist, ex-Google",
    titleAr: "عالمة بيانات أولى، سابقاً في جوجل",
    bio: "Amira has spent 12 years turning messy data into decisions. She teaches SQL, Python and storytelling with data — with a focus on practical, project-based learning.",
    bioAr: "أميرة قضت 12 سنة بتحويل البيانات لقرارات. بتدرّس SQL وبايثون وسرد القصص بالبيانات — بتركيز على التعلّم العملي القائم على المشاريع.",
    avatar: "https://i.pravatar.cc/200?img=47",
    rating: 4.8,
    students: 184320,
    coursesCount: 7,
  },
  {
    id: "i-2",
    name: "Omar Farouk",
    nameAr: "عمر فاروق",
    title: "Staff Engineer, ex-Stripe",
    titleAr: "مهندس ستاف، سابقاً في سترايب",
    bio: "Omar builds delightful front-ends at scale. He's obsessed with performance, accessibility, and teaching beginners to think like engineers.",
    bioAr: "عمر بيبني واجهات ممتازة على نطاق واسع. مهتم بالأداء وإتاحة الوصول وتعليم المبتدئين يفكّروا كمهندسين.",
    avatar: "https://i.pravatar.cc/200?img=12",
    rating: 4.9,
    students: 221040,
    coursesCount: 9,
  },
  {
    id: "i-3",
    name: "Lina Haddad",
    nameAr: "لينا حداد",
    title: "Principal Designer, ex-Airbnb",
    titleAr: "مصممة رئيسية، سابقاً في إيربي‌إن‌بي",
    bio: "Lina leads design systems and product UX. She teaches research-driven design that ships — not just pretty pixels.",
    bioAr: "لينا بقيّد أنظمة التصميم وتجربة المنتج. بتدرّس تصميم مبني على البحث بيتشحن — مش بس بكسلز حلوة.",
    avatar: "https://i.pravatar.cc/200?img=32",
    rating: 4.7,
    students: 96210,
    coursesCount: 5,
  },
  {
    id: "i-4",
    name: "Karim Mansour",
    nameAr: "كريم منصور",
    title: "Director of Product, ex-Meta",
    titleAr: "مدير منتج، سابقاً في ميتا",
    bio: "Karim has launched products used by 100M+ people. He teaches product thinking, roadmapping, and stakeholder alignment.",
    bioAr: "كريم أطلق منتجات بيستخدمها أكتر من 100 مليون شخص. بيدرّس التفكير المنتجي وخرائط الطريق وتنسيق أصحاب المصلحة.",
    avatar: "https://i.pravatar.cc/200?img=15",
    rating: 4.6,
    students: 64880,
    coursesCount: 4,
  },
  {
    id: "i-5",
    name: "Sara Nabil",
    nameAr: "سارة نبيل",
    title: "Growth Lead, ex-Shopify",
    titleAr: "قائدة نمو، سابقاً في شوبيفاي",
    bio: "Sara has scaled DTC brands from 0 to 7 figures. She teaches SEO, paid acquisition, and content engines that compound.",
    bioAr: "سارة كبرّت علامات DTC من الصفر لـ7 أرقام. بتدرّس SEO والإعلانات المدفوعة ومحرّكات المحتوى اللي بتتراكم.",
    avatar: "https://i.pravatar.cc/200?img=45",
    rating: 4.7,
    students: 78320,
    coursesCount: 6,
  },
];

// ---------- Courses ----------
// Helper to build a section with lessons quickly.
function sec(id: string, title: string, titleAr: string, lessons: Course["sections"][number]["lessons"]): Course["sections"][number] {
  return { id, title, titleAr, lessons };
}
function vid(
  id: string,
  title: string,
  titleAr: string,
  durationMin: number,
  transcript: string,
  transcriptAr: string,
  description: string,
  descriptionAr?: string,
  resources?: Course["sections"][number]["lessons"][number]["resources"]
): Course["sections"][number]["lessons"][number] {
  return { id, title, titleAr, durationMin, type: "video", transcript, transcriptAr, description, descriptionAr, resources };
}
function read(
  id: string,
  title: string,
  titleAr: string,
  durationMin: number,
  description: string,
  descriptionAr?: string,
  transcript = "",
  transcriptAr = ""
): Course["sections"][number]["lessons"][number] {
  return { id, title, titleAr, durationMin, type: "reading", description, descriptionAr, transcript: transcript || description, transcriptAr: transcriptAr || descriptionAr || "" };
}

// Common review sets
const baseReviews = (courseId: string): Course["reviews"] => [
  { id: `${courseId}-r1`, studentName: "Mona A.", rating: 5, date: "2024-11-12", comment: "Crystal-clear explanations and the projects were genuinely portfolio-worthy. Highly recommend.", commentAr: "شروحات واضحة جداً والمشاريع تستاهل توضع بالبورتفوليو. أنصح بشدة." },
  { id: `${courseId}-r2`, studentName: "Yousef K.", rating: 4, date: "2024-10-02", comment: "Great pacing. Some sections felt a bit long but the exercises made it stick.", commentAr: "إيقاع ممتاز. بعض الأقسام طويلة شوية لكن التمارين بتثبّت المعلومة." },
  { id: `${courseId}-r3`, studentName: "Hala M.", rating: 5, date: "2024-09-21", comment: "Best course I've taken on this topic. The instructor actually answers Q&A.", commentAr: "أحسن كورس أخدته في الموضوع ده. المحاضر بيرد فعلاً على الأسئلة." },
  { id: `${courseId}-r4`, studentName: "Tariq S.", rating: 4, date: "2024-08-14", comment: "Solid content. Would love more advanced bonus material.", commentAr: "محتوى قوي. كنت حابب ملفات متقدمة زيادة." },
];

const baseQA = (courseId: string): Course["qa"] => [
  { id: `${courseId}-q1`, question: "Do I need any prior experience?", questionAr: "هل محتاج خبرة قبل كده؟", answer: "No — the first section walks you through setup from scratch.", answerAr: "لا — أول قسم بيمشي معاك من الصفر.", studentName: "Reem A.", upvotes: 24, date: "2024-11-01" },
  { id: `${courseId}-q2`, question: "How long does it take to finish?", questionAr: "بياخد وقت قد إيه عشان أخلص؟", answer: "Most learners finish in 4–6 weeks at ~5 hours/week.", answerAr: "أغلب الطلاب بيتخلصوا في 4–6 أسابيع بمعدل 5 ساعات أسبوعياً.", studentName: "Ziad M.", upvotes: 18, date: "2024-10-19" },
  { id: `${courseId}-q3`, question: "Is there a certificate at the end?", questionAr: "في شهادة بالنهاية؟", answer: "Yes, a certificate of completion is issued automatically.", answerAr: "أيوا، شهادة إتمام بتتصدر أوتوماتيك.", studentName: "Nora F.", upvotes: 11, date: "2024-09-30" },
];

const baseFaqs = (): Course["faqs"] => [
  { id: "f1", question: "When does the course start and end?", questionAr: "إمتى الكورس يبدأ وينتهي؟", answer: "It's self-paced — start anytime and keep access forever.", answerAr: "التعلم ذاتي السرعة — ابدأ أي وقت والوصول دائم." },
  { id: "f2", question: "How long do I have access?", questionAr: "ليه مدة الوصول قد إيه؟", answer: "Lifetime access, including future updates.", answerAr: "وصول مدى الحياة شاملاً التحديثات الجاية." },
  { id: "f3", question: "What if I'm not satisfied?", questionAr: "لو مش مقتنع؟", answer: "30-day money-back guarantee, no questions asked.", answerAr: "ضمان استرجاع المبلغ خلال 30 يوم بدون أسئلة." },
  { id: "f4", question: "Is there a community?", questionAr: "في مجتمع؟", answer: "Yes — a moderated Q&A board and monthly live office hours.", answerAr: "أيوا — لوحة أسئلة بإشراف وساعات مكتبية شهرية مباشرة." },
];

export const courses: Course[] = [
  // 1. SQL
  {
    id: "c-sql",
    title: "SQL for Data Analysis: From Zero to Confident",
    titleAr: "SQL لتحليل البيانات: من الصفر للثقة",
    subtitle: "Query real databases, write analytics-grade SQL, and ace take-home interviews.",
    subtitleAr: "استعلم على قواعد بيانات حقيقية، اكتب SQL بمعايير المحللين، واجتاز اختبارات التوظيف.",
    description:
      "A project-driven SQL course for analysts. You'll query a mock e-commerce database, build cohorts, compute retention, and write the kind of SQL hiring managers actually look for.",
    descriptionAr:
      "كورس SQL قائم على المشاريع للمحللين. هتستعلم على قاعدة بيانات متجر، تبني كوهورتس، تحسب الاحتفاظ، وتكتب SQL من النوع اللي بيدوّر عليه أصحاب الشغل.",
    category: "Data",
    categoryAr: "البيانات",
    level: "Beginner",
    language: "English",
    thumbnail: "",
    accent: "from-violet-500 to-indigo-600",
    price: 84.99,
    originalPrice: 199.99,
    rating: 4.8,
    ratingCount: 14820,
    enrolledCount: 64210,
    totalHours: 14,
    totalLessons: 42,
    lastUpdated: "2024-11-01",
    instructorId: "i-1",
    skills: ["SQL", "Joins", "Window Functions", "Cohort Analysis", "Query Optimization"],
    skillsAr: ["SQL", "الجداول المرتبطة", "الدوال النوافذية", "تحليل الكوهورتس", "تحسين الاستعلامات"],
    includes: { hoursOfVideo: 14, articles: 8, downloadableResources: 6, mobileAccess: true, certificate: true },
    tags: ["sql", "database", "query", "data", "analyst", "relational databases", "db", "queries"],
    sections: [
      sec("s1", "Foundations", "الأساسيات", [
        vid("l1", "Why SQL matters for analysts", "ليه SQL مهمة للمحللين", 8, "We cover the role SQL plays in modern analytics stacks and where it fits vs Python/BI tools.", "نتكلم عن دور SQL في منظومات التحليل الحديثة وإزاى تكمل مع بايثون وأدوات الـ BI.", "Overview of where SQL fits in the analytics stack and why it's still the #1 skill for analysts."),
        vid("l2", "Setting up your environment", "تجهيز بيئة العمل", 12, "Install a local Postgres or use the in-browser playground. Connect your first database.", "نثبّت Postgres محلياً أو نستخدم البيئة بالمتصفح. نربط أول قاعدة بيانات.", "Get your SQL environment running in under 10 minutes."),
        vid("l3", "SELECT, FROM, WHERE", "SELECT و FROM و WHERE", 18, "Your first queries: selecting columns, filtering rows, and ordering results.", "أول استعلاماتك: اختيار الأعمدة، تصفية الصفوف، وترتيب النتائج.", "The three clauses that power every query.", "الجمل الثلاثة اللي بتشغّل كل استعلام.", [
          { name: "cheatsheet-sql-basics.pdf", type: "pdf" },
        ]),
        read("l4", "Reading: SQL style guide", "قراءة: دليل أسلوب SQL", 6, "A quick read on writing readable SQL.", "قراءة سريعة عن كتابة SQL مقروءة."),
      ]),
      sec("s2", "Joins & Aggregations", "الربط والتجميع", [
        vid("l5", "INNER vs LEFT JOIN", "INNER مقابل LEFT JOIN", 22, "Deep dive on joins with a Venn-style mental model and real query examples.", "غوص في الربط بنموذج ذهني بأسلوب فن وأمثلة استعلامات حقيقية.", "When to use which join — with concrete examples."),
        vid("l6", "GROUP BY & HAVING", "GROUP BY و HAVING", 20, "Aggregate rows and filter on aggregated values.", "جمّع الصفوف وصفّي على القيم المجمّعة.", "Aggregating data the right way."),
        vid("l7", "Subqueries vs CTEs", "الاستعلامات الفرعية مقابل CTE", 24, "Write readable, debuggable SQL using CTEs.", "اكتب SQL مقروءة وقابلة للتنقيح باستخدام CTE.", "Why CTEs beat nested subqueries."),
        vid("l8", "Window functions demystified", "تفكيك الدوال النوافذية", 26, "ROW_NUMBER, RANK, LAG, LEAD and running totals — the analyst's secret weapon.", "ROW_NUMBER و RANK و LAG و LEAD والمجاميع الجارية — سلاح المحلل السري.", "The feature that separates senior from junior SQL."),
      ]),
      sec("s3", "Analytics patterns", "أنماط التحليل", [
        vid("l9", "Cohort retention analysis", "تحليل الاحتفاظ بالكوهورتس", 28, "Build a monthly retention cohort from raw event logs.", "ابني كوهورت احتفاظ شهري من سجلات الأحداث الخام.", "The single most-asked interview question for analysts."),
        vid("l10", "Funnel & conversion analysis", "تحليل القمع والتحويل", 24, "Compute step-by-step conversion and drop-off.", "احسب التحويل خطوة بخطوة ومعدلات التسرب.", "Measure how users move through your product."),
        vid("l11", "RFM segmentation", "تقسيم RFM", 22, "Segment customers by Recency, Frequency, Monetary value.", "قسّم العملاء حسب الحداثة والتكرار والقيمة المالية.", "A practical segmentation framework."),
        read("l12", "Reading: Query performance", "قراءة: أداء الاستعلام", 8, "EXPLAIN ANALYZE and how to read query plans.", "EXPLAIN ANALYZE وإزاى تقرأ خطط الاستعلام."),
      ]),
      sec("s4", "Capstone project", "مشروع الختام", [
        vid("l13", "Capstone brief", "ملخص المشروع", 10, "You'll analyze a mock store's full year of data and write a 1-page memo.", "هتحلل بيانات سنة كاملة لمتجر وتكتب مذكرة صفحة واحدة.", "The final project — and what we expect."),
        vid("l14", "Solution walkthrough", "مراجعة الحل", 30, "A full walkthrough of the capstone solution.", "مراجعة كاملة لحل المشروع الختامي.", "Compare your solution to the reference."),
      ]),
    ],
    reviews: baseReviews("c-sql"),
    qa: baseQA("c-sql"),
    faqs: baseFaqs(),
  },
  // 2. Python for Data
  {
    id: "c-python-data",
    title: "Python for Data Analysis with pandas",
    titleAr: "بايثون لتحليل البيانات مع pandas",
    subtitle: "Master pandas, NumPy and the workflow real analysts use every day.",
    subtitleAr: "أتقن pandas و NumPy وسير عمل المحللين الحقيقيين كل يوم.",
    description:
      "From notebooks to insights. You'll wrangle messy CSVs, build reusable pipelines, and produce charts that drive decisions — all in Python.",
    descriptionAr:
      "من النوت بوك للرؤى. هتنظّف ملفات CSV الفوضوية، تبني خطوط قابلة لإعادة الاستخدام، وتنتج رسوم تقود القرارات — كله ببايثون.",
    category: "Data",
    categoryAr: "البيانات",
    level: "Intermediate",
    language: "English",
    thumbnail: "",
    accent: "from-emerald-500 to-teal-600",
    price: 94.99,
    originalPrice: 219.99,
    rating: 4.7,
    ratingCount: 9821,
    enrolledCount: 41020,
    totalHours: 18,
    totalLessons: 48,
    lastUpdated: "2024-10-15",
    instructorId: "i-1",
    skills: ["Python", "pandas", "NumPy", "Data Cleaning", "EDA", "Matplotlib"],
    skillsAr: ["بايثون", "pandas", "NumPy", "تنظيف البيانات", "التحليل الاستكشافي", "Matplotlib"],
    includes: { hoursOfVideo: 18, articles: 10, downloadableResources: 8, mobileAccess: true, certificate: true },
    tags: ["python", "pandas", "data", "analysis", "numpy", "data analysis", "analyst"],
    sections: [
      sec("s1", "Python refresher", "مراجعة بايثون", [
        vid("l1", "Setting up Jupyter", "تجهيز جوبيتر", 10, "Install JupyterLab and the data science stack.", "تثبيت JupyterLab وحزمة علوم البيانات.", "Get your notebook environment ready."),
        vid("l2", "Python essentials for data", "أساسيات بايثون للبيانات", 20, "Just enough Python to be productive in pandas.", "قدر كافي من بايثون لتكون منتجاً في pandas.", "The 20% of Python that drives 80% of analysis."),
      ]),
      sec("s2", "pandas deep dive", "غوص في pandas", [
        vid("l3", "DataFrames & Series", "DataFrames و Series", 22, "The two core data structures in pandas.", "هياكل البيانات الأساسية في pandas.", "The building blocks of every pandas workflow."),
        vid("l4", "Indexing & selection", "الفهرسة والاختيار", 24, ".loc, .iloc and boolean masks explained.", "شرح .loc و .iloc والأقنعة البولية.", "Selecting data without tears."),
        vid("l5", "GroupBy & aggregations", "GroupBy والتجميعات", 26, "Split-apply-combine in practice.", "تقسيم-تطبيق-دمج عملياً.", "The most-used pandas pattern."),
        vid("l6", "Merging & joining", "الدمج والربط", 24, "Combine datasets with merge/join/concat.", "ادمج مجموعات البيانات بـ merge/join/concat.", "Putting datasets together."),
      ]),
      sec("s3", "Real-world wrangling", "التنظيف في الواقع", [
        vid("l7", "Cleaning messy data", "تنظيف البيانات الفوضوية", 28, "Handle missing values, types, and duplicates.", "تعامل مع القيم المفقودة والأنواع والمكررات.", "The unglamorous 80% of analysis."),
        vid("l8", "Time series basics", "أساسيات السلاسل الزمنية", 26, "Resampling, rolling windows, and date handling.", "إعادة المعاينة والنوافذ المتداخلة والتعامل مع التواريخ.", "Working with dates the pandas way."),
      ]),
      sec("s4", "Capstone", "مشروع الختام", [
        vid("l9", "Capstone: store analytics", "المشروع: تحليل متجر", 32, "End-to-end analysis of a retail dataset.", "تحليل شامل لمجموعة بيانات تجزئة.", "A realistic end-to-end analysis."),
      ]),
    ],
    reviews: baseReviews("c-python-data"),
    qa: baseQA("c-python-data"),
    faqs: baseFaqs(),
  },
  // 3. Tableau
  {
    id: "c-tableau",
    title: "Tableau Desktop: Dashboards That Get Shared",
    titleAr: "Tableau Desktop: لوحات يتشاركونها",
    subtitle: "Build dashboards stakeholders actually open — not just pretty charts.",
    subtitleAr: "ابنِ لوحات بيفتحوها أصحاب المصلحة فعلاً — مش مجرد رسوم حلوة.",
    description:
      "A practical Tableau course focused on what gets dashboards used: clear KPIs, smart layouts, and the small details that build trust.",
    descriptionAr:
      "كورس Tableau عملي بيركّز على إيه اللي بيخلّي اللوحات تُستخدم: مؤشرات واضحة، تخطيطات ذكية، والتفاصيل الصغيرة اللي بتبني الثقة.",
    category: "Data",
    categoryAr: "البيانات",
    level: "Beginner",
    language: "English",
    thumbnail: "",
    accent: "from-rose-500 to-pink-600",
    price: 79.99,
    originalPrice: 189.99,
    rating: 4.6,
    ratingCount: 6210,
    enrolledCount: 28940,
    totalHours: 11,
    totalLessons: 32,
    lastUpdated: "2024-09-28",
    instructorId: "i-1",
    skills: ["Tableau", "Dashboards", "Data Visualization", "Storytelling", "KPI Design"],
    skillsAr: ["Tableau", "اللوحات", "تصور البيانات", "سرد القصص", "تصميم المؤشرات"],
    includes: { hoursOfVideo: 11, articles: 6, downloadableResources: 4, mobileAccess: false, certificate: true },
    tags: ["tableau", "dashboard", "visualization", "viz", "bi", "analytics"],
    sections: [
      sec("s1", "Tableau basics", "أساسيات Tableau", [
        vid("l1", "Tour of the UI", "جولة في الواجهة", 14, "Where everything lives and the workflow from data to dashboard.", "إيه فين وسير العمل من البيانات للوحة.", "Get oriented in 15 minutes."),
        vid("l2", "Connecting to data", "الربط بالبيانات", 18, "Live vs extract connections and when to use each.", "الاتصالات الحية مقابل المستخرجة وإمتى تستخدم كل واحدة.", "The decision that affects everything downstream."),
        vid("l3", "Your first chart", "أول رسم لك", 20, "Build a basic bar chart from scratch.", "ابني رسم أعمدة بسيط من الصفر.", "From zero to first chart."),
      ]),
      sec("s2", "Dashboards that ship", "لوحات بتتشحن", [
        vid("l4", "Layout & containers", "التخطيط والحاويات", 24, "Use containers to make dashboards responsive.", "استخدم الحاويات لتخلّي اللوحات متجاوبة.", "The key to dashboards that look good anywhere."),
        vid("l5", "KPI design", "تصميم المؤشرات", 22, "Pick the right metrics and present them with confidence.", "اختار المقاييس الصح واعرضها بثقة.", "Less is more."),
        vid("l6", "Actions & interactivity", "الإجراءات والتفاعل", 26, "Filters, highlights, and URL actions.", "المرشّحات والتمييزات وإجراءات URL.", "Make dashboards explorable, not static."),
      ]),
      sec("s3", "Capstone", "مشروع الختام", [
        vid("l7", "Capstone: exec dashboard", "المشروع: لوحة تنفيذية", 30, "Build a 1-page exec dashboard end-to-end.", "ابني لوحة تنفيذية بصفحة واحدة من البداية للنهاية.", "The full project."),
      ]),
    ],
    reviews: baseReviews("c-tableau"),
    qa: baseQA("c-tableau"),
    faqs: baseFaqs(),
  },
  // 4. Statistics
  {
    id: "c-statistics",
    title: "Practical Statistics for Analysts",
    titleAr: "إحصاء عملي للمحللين",
    subtitle: "The 20% of statistics you'll use 80% of the time — without the math anxiety.",
    subtitleAr: "٢٠٪ من الإحصاء اللي هتستخدمه ٨٠٪ من الوقت — بدون رهاب الرياضيات.",
    description:
      "A friendly, intuition-first stats course. You'll learn distributions, sampling, hypothesis testing, and regression — with a focus on what each tool is actually for.",
    descriptionAr:
      "كورس إحصاء ودود يبدأ بالحدس. هتتعلّم التوزيعات والعينات واختبارات الفرضيات والانحدار — بتركيز على غرض كل أداة فعلاً.",
    category: "Data",
    categoryAr: "البيانات",
    level: "Intermediate",
    language: "English",
    thumbnail: "",
    accent: "from-amber-500 to-orange-600",
    price: 89.99,
    originalPrice: 209.99,
    rating: 4.7,
    ratingCount: 5120,
    enrolledCount: 19820,
    totalHours: 13,
    totalLessons: 36,
    lastUpdated: "2024-08-30",
    instructorId: "i-1",
    skills: ["Statistics", "Hypothesis Testing", "A/B Testing", "Regression", "Probability"],
    skillsAr: ["الإحصاء", "اختبار الفرضيات", "اختبارات A/B", "الانحدار", "الاحتمالات"],
    includes: { hoursOfVideo: 13, articles: 12, downloadableResources: 5, mobileAccess: true, certificate: true },
    tags: ["statistics", "probability", "hypothesis", "regression", "ab testing", "math", "data"],
    sections: [
      sec("s1", "Intuition first", "الحدس أولاً", [
        vid("l1", "What statistics is really for", "إحصاء لإيه بجد", 12, "Three questions stats helps you answer.", "ثلاث أسئلة الإحصاء بيساعدك تجاوبها.", "The mental model that ties everything together."),
        vid("l2", "Distributions", "التوزيعات", 22, "Why shape matters more than averages.", "ليه الشكل أهم من المتوسطات.", "Why the average lies."),
        vid("l3", "Sampling & bias", "العينات والتحيّز", 20, "How bad samples ruin good analysis.", "إيه العينات السيئة بتفسد التحليل الجيد.", "The #1 cause of wrong conclusions."),
      ]),
      sec("s2", "Hypothesis testing", "اختبار الفرضيات", [
        vid("l4", "p-values, finally explained", "p-values أخيراً اتشرحت", 26, "What a p-value is and isn't.", "إيه الـ p-value وإيه لأ.", "The most misunderstood concept in stats."),
        vid("l5", "A/B testing in practice", "A/B testing عملياً", 28, "Design, run, and read an A/B test.", "صمّم ونفّذ واقرأ اختبار A/B.", "The workflow behind every experiment."),
        vid("l6", "Common pitfalls", "أخطاء شائعة", 22, "Peeking, multiple comparisons, and survivorship bias.", "اللقطة، المقارنات المتعددة، وانحياز الناجين.", "Avoid the classic mistakes."),
      ]),
      sec("s3", "Regression", "الانحدار", [
        vid("l7", "Linear regression intuition", "حدس الانحدار الخطي", 24, "What a line of best fit is really doing.", "إيه خط الملاءمة الأفضل بيعمل بجد.", "The workhorse of analytics."),
        vid("l8", "Interpreting coefficients", "تفسير المعاملات", 22, "What those numbers actually mean.", "إيه الأرقام دي بتعني بجد.", "Where most people get it wrong."),
      ]),
    ],
    reviews: baseReviews("c-statistics"),
    qa: baseQA("c-statistics"),
    faqs: baseFaqs(),
  },
  // 5. HTML/CSS
  {
    id: "c-html-css",
    title: "HTML & CSS: Modern Layouts with Flexbox & Grid",
    titleAr: "HTML و CSS: تخطيطات حديثة بـ Flexbox و Grid",
    subtitle: "Build responsive, accessible layouts you'll be proud to ship.",
    subtitleAr: "ابنِ تخطيطات متجاوبة وقابلة للوصول تستاهل تطلعها للإنتاج.",
    description:
      "A hands-on HTML & CSS course. You'll build three real layouts — a landing page, a dashboard, and a marketing site — using modern Flexbox and Grid.",
    descriptionAr:
      "كورس HTML و CSS عملي. هتبني ثلاث تخطيطات حقيقية — صفحة هبوط، لوحة تحكم، وموقع تسويقي — بـ Flexbox و Grid.",
    category: "Web Dev",
    categoryAr: "تطوير الويب",
    level: "Beginner",
    language: "English",
    thumbnail: "",
    accent: "from-sky-500 to-blue-600",
    price: 69.99,
    originalPrice: 159.99,
    rating: 4.8,
    ratingCount: 22410,
    enrolledCount: 102300,
    totalHours: 12,
    totalLessons: 38,
    lastUpdated: "2024-11-10",
    instructorId: "i-2",
    skills: ["HTML5", "CSS3", "Flexbox", "CSS Grid", "Responsive Design", "Accessibility"],
    skillsAr: ["HTML5", "CSS3", "Flexbox", "CSS Grid", "التصميم المتجاوب", "إتاحة الوصول"],
    includes: { hoursOfVideo: 12, articles: 8, downloadableResources: 10, mobileAccess: true, certificate: true },
    tags: ["html", "css", "flexbox", "grid", "layout", "responsive", "frontend", "web design"],
    sections: [
      sec("s1", "Foundations", "الأساسيات", [
        vid("l1", "How the web actually works", "إزاي الويب بيشتغل بجد", 14, "A 14-minute mental model of the browser.", "نموذج ذهني ١٤ دقيقة للمتصفح.", "The mental model that makes everything click."),
        vid("l2", "Semantic HTML", "HTML الدلالية", 18, "Tags that mean something — for accessibility and SEO.", "وسوم بمعنى — للوصول وSEO.", "Why <article> beats <div class='article'>."),
        vid("l3", "The CSS box model", "نموذج الصندوق في CSS", 16, "Margin, border, padding, content — and how they stack.", "الهامش والحد والحشو والمحتوى — وإزاي يتراكموا.", "The model behind every layout."),
      ]),
      sec("s2", "Modern layouts", "تخطيطات حديثة", [
        vid("l4", "Flexbox fundamentals", "أساسيات Flexbox", 24, "1D layouts the right way.", "تخطيطات أحادية البعد بالطريقة الصح.", "The layout tool you'll use every day."),
        vid("l5", "CSS Grid mastery", "إتقان CSS Grid", 26, "2D layouts for the complex stuff.", "تخطيطات ثنائية البعض للحاجات المعقدة.", "When Grid beats Flexbox."),
        vid("l6", "Responsive design", "التصميم المتجاوب", 22, "Media queries, fluid units, and container queries.", "استعلامات الوسائط والوحدات السائلة واستعلامات الحاوية.", "Make it work on any screen."),
      ]),
      sec("s3", "Projects", "مشاريع", [
        vid("l7", "Project 1: landing page", "مشروع ١: صفحة هبوط", 30, "Build a complete hero + features section.", "ابني قسم بطل وميزات كامل.", "Your first shippable layout."),
        vid("l8", "Project 2: dashboard layout", "مشروع ٢: تخطيط لوحة", 28, "Sidebar, topbar, and content area.", "الشريط الجانبي والشريط العلوي ومنطقة المحتوى.", "A classic dashboard structure."),
      ]),
    ],
    reviews: baseReviews("c-html-css"),
    qa: baseQA("c-html-css"),
    faqs: baseFaqs(),
  },
  // 6. JavaScript
  {
    id: "c-js",
    title: "Modern JavaScript: From Foundations to Async",
    titleAr: "جافاسكربت الحديثة: من الأساسيات للـ Async",
    subtitle: "The JavaScript every frontend dev needs — taught with real examples.",
    subtitleAr: "جافاسكربت اللي محتاجها كل مطوّر واجهات — بأمثلة حقيقية.",
    description:
      "From variables to async/await. You'll learn the language itself — not frameworks — with a focus on the patterns you'll see in every codebase.",
    descriptionAr:
      "من المتغيرات لـ async/await. هتتعلّم اللغة نفسها — مش الأطر — بتركيز على الأنماط اللي هتشوفها بكل كود بيز.",
    category: "Web Dev",
    categoryAr: "تطوير الويب",
    level: "Intermediate",
    language: "English",
    thumbnail: "",
    accent: "from-yellow-500 to-amber-600",
    price: 99.99,
    originalPrice: 229.99,
    rating: 4.9,
    ratingCount: 31240,
    enrolledCount: 142800,
    totalHours: 22,
    totalLessons: 56,
    lastUpdated: "2024-11-20",
    instructorId: "i-2",
    skills: ["JavaScript", "ES6+", "Async/Await", "DOM", "Fetch API", "Modules"],
    skillsAr: ["جافاسكربت", "ES6+", "Async/Await", "DOM", "Fetch API", "الوحدات"],
    includes: { hoursOfVideo: 22, articles: 14, downloadableResources: 12, mobileAccess: true, certificate: true },
    tags: ["javascript", "js", "es6", "async", "frontend", "programming", "web"],
    sections: [
      sec("s1", "Language fundamentals", "أساسيات اللغة", [
        vid("l1", "Variables, types & scope", "المتغيرات والأنواع والنطاق", 24, "let, const, var and why it matters.", "let و const و var وليه مهتم.", "The foundation everything sits on."),
        vid("l2", "Functions & closures", "الدوال والإغلاقات", 26, "First-class functions and the closure 'aha' moment.", "الدوال كمواطنين أولين ولحظة الإغلاق.", "The concept that unlocks everything else."),
        vid("l3", "Objects & arrays", "الكائنات والمصفوفات", 22, "Reference vs value, and the methods you'll use daily.", "المرجع مقابل القيمة، والطرق اللي هتستخدمها يومياً.", "The two data structures of JS."),
      ]),
      sec("s2", "Modern features", "ميزات حديثة", [
        vid("l4", "Destructuring & spread", "التفكيك والانتشار", 18, "Concise, readable data extraction.", "استخراج بيانات موجز ومقروء.", "Less code, fewer bugs."),
        vid("l5", "Promises explained", "شرح الـ Promises", 24, "Why promises exist and how to read them.", "ليه الـ promises موجودة وإزاي تقرأها.", "The bridge to async/await."),
        vid("l6", "Async/await in depth", "Async/await بعمق", 26, "Writing async code that reads like sync.", "كتابة كود async يقرأ كأنه sync.", "The modern way to do async."),
      ]),
      sec("s3", "In the browser", "في المتصفح", [
        vid("l7", "DOM manipulation", "التلاعب بالـ DOM", 22, "Selecting, creating, and updating elements.", "اختيار وإنشاء وتحديث العناصر.", "Make pages interactive."),
        vid("l8", "Fetch & APIs", "Fetch وواجهات API", 24, "Talking to a backend the right way.", "التحدث مع الباك-إند بالطريقة الصح.", "How real apps get their data."),
      ]),
      sec("s4", "Capstone", "مشروع الختام", [
        vid("l9", "Capstone: weather app", "المشروع: تطبيق طقس", 32, "Build a small SPA that fetches live weather.", "ابني SPA صغير بيجيب الطقس الحي.", "Bring it all together."),
      ]),
    ],
    reviews: baseReviews("c-js"),
    qa: baseQA("c-js"),
    faqs: baseFaqs(),
  },
  // 7. React
  {
    id: "c-react",
    title: "React 19 from Scratch: Components, Hooks, Patterns",
    titleAr: "React 19 من الصفر: مكوّنات وهوكات وأنماط",
    subtitle: "Build production-grade React apps with hooks, context, and modern patterns.",
    subtitleAr: "ابنِ تطبيقات React بإنتاجية عالية بالهوكات والكونتكست والأنماط الحديثة.",
    description:
      "A project-based React course. You'll build a real app, learn how to think in components, and master hooks — including the new use() and Suspense patterns.",
    descriptionAr:
      "كورس React قائم على المشاريع. هتبني تطبيق حقيقي، تتعلم تفكّر بالمكوّنات، وتتقن الهوكات — بما فيها use() الجديدة وأنماط Suspense.",
    category: "Web Dev",
    categoryAr: "تطوير الويب",
    level: "Intermediate",
    language: "English",
    thumbnail: "",
    accent: "from-cyan-500 to-sky-600",
    price: 109.99,
    originalPrice: 249.99,
    rating: 4.8,
    ratingCount: 18520,
    enrolledCount: 88200,
    totalHours: 24,
    totalLessons: 62,
    lastUpdated: "2024-11-25",
    instructorId: "i-2",
    skills: ["React", "Hooks", "JSX", "State Management", "Context", "Suspense", "Patterns"],
    skillsAr: ["React", "الهوكات", "JSX", "إدارة الحالة", "الكونتكست", "Suspense", "الأنماط"],
    includes: { hoursOfVideo: 24, articles: 12, downloadableResources: 14, mobileAccess: true, certificate: true },
    tags: ["react", "hooks", "jsx", "frontend", "spa", "components", "ui"],
    sections: [
      sec("s1", "Thinking in components", "التفكير بالمكوّنات", [
        vid("l1", "What is React, really?", "إيه React بجد؟", 16, "The mental model behind the library.", "النموذج الذهني ورا المكتبة.", "Why React feels different."),
        vid("l2", "Your first component", "أول مكوّن لك", 18, "JSX, props, and rendering.", "JSX والـ props والرندر.", "Hello, React."),
        vid("l3", "State with useState", "الحالة بـ useState", 22, "The hook you'll use most.", "الهوك اللي هتستخدمه أكتر.", "Making components interactive."),
      ]),
      sec("s2", "Hooks deep dive", "غوص في الهوكات", [
        vid("l4", "useEffect done right", "useEffect صح", 26, "Dependencies, cleanup, and when not to use it.", "التبعيات والتنظيف وإمتى تجنّبه.", "The most-misused hook."),
        vid("l5", "useMemo & useCallback", "useMemo و useCallback", 22, "Performance, and the cost of premature optimization.", "الأداء، وتكلفة التحسين المبكر.", "When to memoize — and when not to."),
        vid("l6", "Custom hooks", "الهوكات المخصصة", 24, "Extract logic into reusable hooks.", "استخرج المنطق بهوكات قابلة لإعادة الاستخدام.", "The pattern that scales."),
        vid("l7", "Context & state", "Context والحالة", 26, "Avoid prop drilling without a library.", "تجنّب حفر الـ props بدون مكتبة.", "Lightweight state management."),
      ]),
      sec("s3", "Modern patterns", "أنماط حديثة", [
        vid("l8", "Suspense & data fetching", "Suspense وجلب البيانات", 24, "The new way to load async data.", "الطريقة الجديدة لتحميل البيانات async.", "The future of data fetching."),
        vid("l9", "Server components intro", "مقدمة مكوّنات السيرفر", 18, "What RSCs change about how you build.", "إيه اللي بيغيّره مكوّنات السيرفر.", "A gentle intro to RSCs."),
      ]),
      sec("s4", "Capstone", "مشروع الختام", [
        vid("l10", "Capstone: task app", "المشروع: تطبيق مهام", 36, "Build a full task manager with persistence.", "ابني مدير مهام كامل مع حفظ.", "A realistic React app."),
      ]),
    ],
    reviews: baseReviews("c-react"),
    qa: baseQA("c-react"),
    faqs: baseFaqs(),
  },
  // 8. TypeScript
  {
    id: "c-ts",
    title: "TypeScript for App Developers",
    titleAr: "TypeScript لمطوّري التطبيقات",
    subtitle: "Add types to your JavaScript without slowing down.",
    subtitleAr: "ضيف أنواع لجافاسكربت بدون ما تبطّأ.",
    description:
      "A pragmatic TypeScript course. You'll learn the types you'll actually use, how to migrate a JS project, and how to read the error messages that used to scare you.",
    descriptionAr:
      "كورس TypeScript عملي. هتتعلّم الأنواع اللي هتستخدمها فعلاً، إزاي تهاجر مشروع JS، وإزاي تقرأ رسائل الأخطاء اللي كانت بتخوّفك.",
    category: "Web Dev",
    categoryAr: "تطوير الويب",
    level: "Intermediate",
    language: "English",
    thumbnail: "",
    accent: "from-blue-500 to-indigo-600",
    price: 89.99,
    originalPrice: 199.99,
    rating: 4.7,
    ratingCount: 7820,
    enrolledCount: 34100,
    totalHours: 14,
    totalLessons: 40,
    lastUpdated: "2024-10-05",
    instructorId: "i-2",
    skills: ["TypeScript", "Types", "Generics", "Tooling", "Migration"],
    skillsAr: ["TypeScript", "الأنواع", "الجنيريك", "الأدوات", "الترحيل"],
    includes: { hoursOfVideo: 14, articles: 8, downloadableResources: 6, mobileAccess: true, certificate: true },
    tags: ["typescript", "ts", "types", "javascript", "frontend", "tooling"],
    sections: [
      sec("s1", "Why TypeScript", "ليه TypeScript", [
        vid("l1", "The case for types", "الحجّة للأنواع", 14, "What types buy you and what they don't.", "إيه اللي بيدفعه الأنواع وإيه لأ.", "Setting realistic expectations."),
        vid("l2", "Setup & tsconfig", "الإعداد و tsconfig", 18, "A sane starter config and why.", "إعداد بداية معقول وليه.", "The config that grows with you."),
      ]),
      sec("s2", "Types in practice", "الأنواع عملياً", [
        vid("l3", "Primitive & object types", "الأنواع الأولية والكائنية", 20, "The 90% you'll use daily.", "الـ ٩٠٪ اللي هتستخدمه يومياً.", "The everyday types."),
        vid("l4", "Unions & narrowing", "الاتحادات والتضييق", 22, "Model real-world variation safely.", "نمذجة التغيّر الواقعي بأمان.", "The pattern that prevents bugs."),
        vid("l5", "Generics without fear", "الجنيريك بدون خوف", 26, "Reusable, type-safe abstractions.", "تجريدات قابلة لإعادة الاستخدام وآمنة بالأنواع.", "Generics demystified."),
      ]),
      sec("s3", "Real-world TS", "TypeScript في الواقع", [
        vid("l6", "Migrating a JS project", "ترحيل مشروع JS", 24, "AllowJs, loose, then strict — a path that works.", "allowJs ثم فضفاض ثم صارم — مسار يشتغل.", "Adopting TS without rewriting."),
        vid("l7", "Reading error messages", "قراءة رسائل الأخطاء", 18, "Decode the scary red squiggles.", "فك شيفرة الخطوط الحمراء المخيفة.", "From fear to fluency."),
      ]),
    ],
    reviews: baseReviews("c-ts"),
    qa: baseQA("c-ts"),
    faqs: baseFaqs(),
  },
  // 9. Node.js
  {
    id: "c-node",
    title: "Node.js & APIs: Build a Real Backend",
    titleAr: "Node.js وواجهات API: ابنِ باك-إند حقيقي",
    subtitle: "Build, structure, and ship a production-style Node API with Express.",
    subtitleAr: "ابنِ ونظّم وأطلق واجهة Node بإنتاجية عالية بـ Express.",
    description:
      "A backend course for frontend devs. You'll build an Express API with auth, validation, errors, and tests — the things tutorials skip.",
    descriptionAr:
      "كورس باك-إند لمطوّري الواجهات. هتبني واجهة Express بمصادقة وتحقق وأخطاء واختبارات — الحاجات اللي التوتوريالات بتتجنبها.",
    category: "Web Dev",
    categoryAr: "تطوير الويب",
    level: "Intermediate",
    language: "English",
    thumbnail: "",
    accent: "from-green-500 to-emerald-600",
    price: 94.99,
    originalPrice: 219.99,
    rating: 4.6,
    ratingCount: 6420,
    enrolledCount: 27800,
    totalHours: 16,
    totalLessons: 44,
    lastUpdated: "2024-09-12",
    instructorId: "i-2",
    skills: ["Node.js", "Express", "REST", "Auth", "Testing", "API Design"],
    skillsAr: ["Node.js", "Express", "REST", "المصادقة", "الاختبار", "تصميم API"],
    includes: { hoursOfVideo: 16, articles: 6, downloadableResources: 8, mobileAccess: false, certificate: true },
    tags: ["node", "node.js", "express", "backend", "api", "rest", "server"],
    sections: [
      sec("s1", "Node fundamentals", "أساسيات Node", [
        vid("l1", "The event loop, briefly", "حلقة الأحداث باختصار", 18, "Why Node is fast, and where it isn't.", "ليه Node سريع، وفين لأ.", "The model behind Node."),
        vid("l2", "Modules & npm", "الوحدات و npm", 16, "CommonJS vs ESM and the package.json.", "CommonJS مقابل ESM و package.json.", "Managing dependencies."),
      ]),
      sec("s2", "Building the API", "بناء الواجهة", [
        vid("l3", "Express app structure", "هيكل تطبيق Express", 22, "A maintainable layout for real apps.", "هيكل قابل للصيانة للتطبيقات الحقيقية.", "How to structure Express."),
        vid("l4", "Routing & middleware", "التوجيه والوسائط", 24, "The middleware pipeline explained.", "شرح خط الوسائط.", "The pattern that powers Express."),
        vid("l5", "Validation & errors", "التحقق والأخطاء", 22, "Zod schemas and a central error handler.", "مخططات Zod ومعالج أخطاء مركزي.", "Robust APIs without boilerplate."),
        vid("l6", "Auth with JWT", "المصادقة بـ JWT", 26, "Issue, verify, and protect routes.", "إصدار وتحقق وحماية المسارات.", "The standard auth pattern."),
      ]),
      sec("s3", "Productionizing", "للإنتاج", [
        vid("l7", "Tests with Vitest", "اختبارات بـ Vitest", 22, "Unit + integration tests for your API.", "اختبارات وحدة وتكامل لواجهتك.", "Confidence to ship."),
        vid("l8", "Logging & observability", "التسجيل والمراقبة", 18, "Structured logs you can search.", "سجلات مهيكلة تقدر تبحثها.", "What to log, and what not to."),
      ]),
    ],
    reviews: baseReviews("c-node"),
    qa: baseQA("c-node"),
    faqs: baseFaqs(),
  },
  // 10. UX Research
  {
    id: "c-ux-research",
    title: "UX Research Methods That Actually Ship",
    titleAr: "مناهج بحث UX بتطلع للإنتاج",
    subtitle: "Interviews, usability tests, and surveys — the methods that change products.",
    subtitleAr: "مقابلات واختبارات قابلية واستبيانات — المناهج اللي بتغيّر المنتجات.",
    description:
      "A practical UX research course. You'll learn when to use each method, how to run them cheaply, and how to present findings that get acted on.",
    descriptionAr:
      "كورس بحث UX عملي. هتتعلّم إمتى تستخدم كل منهج، إزاي تشغّله رخيص، وإزاي تعرض نتائج بتتُنفّذ.",
    category: "Design",
    categoryAr: "التصميم",
    level: "Beginner",
    language: "English",
    thumbnail: "",
    accent: "from-fuchsia-500 to-purple-600",
    price: 74.99,
    originalPrice: 169.99,
    rating: 4.7,
    ratingCount: 4980,
    enrolledCount: 18920,
    totalHours: 10,
    totalLessons: 30,
    lastUpdated: "2024-08-18",
    instructorId: "i-3",
    skills: ["UX Research", "Interviews", "Usability Testing", "Surveys", "Synthesis"],
    skillsAr: ["بحث UX", "المقابلات", "اختبار القابلية", "الاستبيانات", "التوليف"],
    includes: { hoursOfVideo: 10, articles: 8, downloadableResources: 6, mobileAccess: true, certificate: true },
    tags: ["ux", "research", "user research", "interviews", "usability", "design"],
    sections: [
      sec("s1", "Why research", "ليه البحث", [
        vid("l1", "The research mindset", "عقلية البحث", 14, "Curiosity before methodology.", "الفضول قبل المنهجية.", "Where good research starts."),
        vid("l2", "Picking the right method", "اختيار المنهج الصح", 18, "A decision tree for common situations.", "شجرة قرار للمواقف الشائعة.", "Method that matches the question."),
      ]),
      sec("s2", "Core methods", "المناهج الأساسية", [
        vid("l3", "User interviews", "مقابلات المستخدم", 24, "Ask questions that surface truth.", "اسأل أسئلة بتظهر الحقيقة.", "The art of the interview."),
        vid("l4", "Usability tests", "اختبارات القابلية", 22, "Run a lean moderated test in a day.", "نفّذ اختبار منظم خفيف في يوم.", "Find real problems, fast."),
        vid("l5", "Surveys that work", "استبيانات بتشتغل", 20, "Avoid biased questions and bad samples.", "تجنّب الأسئلة المتحيّزة والعينات السيئة.", "The survey that doesn't lie."),
      ]),
      sec("s3", "Synthesis & action", "التوليف والتنفيذ", [
        vid("l6", "Affinity mapping", "الخريطة التجانسية", 18, "Turn messy notes into themes.", "حوّل الملاحظات الفوضوية لمواضيع.", "Make sense of qualitative data."),
        vid("l7", "Presenting findings", "عرض النتائج", 20, "Insights that stakeholders act on.", "رؤى بينفذها أصحاب المصلحة.", "The report that gets read."),
      ]),
    ],
    reviews: baseReviews("c-ux-research"),
    qa: baseQA("c-ux-research"),
    faqs: baseFaqs(),
  },
  // 11. Figma
  {
    id: "c-figma",
    title: "Figma for Product Designers",
    titleAr: "Figma لمصممي المنتجات",
    subtitle: "From first frame to design system — the Figma workflow pros use.",
    subtitleAr: "من أول فريم لنظام تصميم — سير عمل Figma اللي ب يستخدمه المحترفين.",
    description:
      "A hands-on Figma course. You'll learn auto-layout, components, variants, and how to ship a small design system your team will actually use.",
    descriptionAr:
      "كورس Figma عملي. هتتعلّم auto-layout والمكوّنات والـ variants، وإزاي تطلق نظام تصميم صغير فريقك هيستخدمه فعلاً.",
    category: "Design",
    categoryAr: "التصميم",
    level: "Beginner",
    language: "English",
    thumbnail: "",
    accent: "from-pink-500 to-rose-600",
    price: 79.99,
    originalPrice: 179.99,
    rating: 4.8,
    ratingCount: 11240,
    enrolledCount: 52300,
    totalHours: 13,
    totalLessons: 36,
    lastUpdated: "2024-10-22",
    instructorId: "i-3",
    skills: ["Figma", "Auto Layout", "Components", "Variants", "Design Systems", "Prototyping"],
    skillsAr: ["Figma", "Auto Layout", "المكوّنات", "الـ variants", "أنظمة التصميم", "النماذج الأولية"],
    includes: { hoursOfVideo: 13, articles: 4, downloadableResources: 12, mobileAccess: false, certificate: true },
    tags: ["figma", "design", "ui", "design system", "prototyping", "components"],
    sections: [
      sec("s1", "Figma basics", "أساسيات Figma", [
        vid("l1", "Tour & shortcuts", "جولة واختصارات", 14, "The 20% of shortcuts that save hours.", "الـ ٢٠٪ من الاختصارات اللي بتوفّر ساعات.", "Move at the speed of thought."),
        vid("l2", "Frames & auto layout", "الفريمز و auto layout", 22, "Responsive components the right way.", "مكوّنات متجاوبة بالطريقة الصح.", "The feature that changed Figma."),
      ]),
      sec("s2", "Components & systems", "المكوّنات والأنظمة", [
        vid("l3", "Components & variants", "المكوّنات والـ variants", 24, "Build a button that adapts to any state.", "ابني زر يتكيّف بأي حالة.", "The pattern behind every system."),
        vid("l4", "Design tokens", "رموز التصميم", 20, "Color, spacing, and typography as tokens.", "اللون والمسافات والطباعة كرموز.", "The single source of truth."),
        vid("l5", "Libraries & publishing", "المكتبات والنشر", 18, "Share a library across files.", "شارك مكتبة عبر الملفات.", "How teams stay in sync."),
      ]),
      sec("s3", "Prototyping", "النماذج الأولية", [
        vid("l6", "Interactive prototypes", "نماذج تفاعلية", 22, "Smart animate and interactions.", "الأنيميشن الذكي والتفاعلات.", "Show, don't tell."),
      ]),
    ],
    reviews: baseReviews("c-figma"),
    qa: baseQA("c-figma"),
    faqs: baseFaqs(),
  },
  // 12. UI Design
  {
    id: "c-ui-design",
    title: "UI Design Foundations: Visual Hierarchy & Systems",
    titleAr: "أساسيات تصميم الواجهات: التسلسل البصري والأنظمة",
    subtitle: "The visual design principles that make interfaces feel professional.",
    subtitleAr: "مبادئ التصميم البصري اللي بتخلّي الواجهات تحس احترافية.",
    description:
      "A design principles course. You'll learn hierarchy, spacing, color, and typography — the invisible rules that separate good UI from great.",
    descriptionAr:
      "كورس مبادئ تصميم. هتتعلّم التسلسل والمسافات واللون والطباعة — القواعد الخفية اللي بتفصل بين الواجهة الجيدة والممتازة.",
    category: "Design",
    categoryAr: "التصميم",
    level: "Beginner",
    language: "English",
    thumbnail: "",
    accent: "from-purple-500 to-fuchsia-600",
    price: 69.99,
    originalPrice: 159.99,
    rating: 4.6,
    ratingCount: 5210,
    enrolledCount: 21400,
    totalHours: 9,
    totalLessons: 26,
    lastUpdated: "2024-07-30",
    instructorId: "i-3",
    skills: ["Visual Design", "Color Theory", "Typography", "Layout", "Hierarchy"],
    skillsAr: ["التصميم البصري", "نظرية اللون", "الطباعة", "التخطيط", "التسلسل"],
    includes: { hoursOfVideo: 9, articles: 10, downloadableResources: 4, mobileAccess: true, certificate: true },
    tags: ["ui", "design", "visual", "color", "typography", "layout"],
    sections: [
      sec("s1", "Seeing like a designer", "أن ترى كمصمم", [
        vid("l1", "Visual hierarchy", "التسلسل البصري", 18, "Guide the eye without the user noticing.", "وجّه العين بدون ما المستخدم يحس.", "The skill behind every good screen."),
        vid("l2", "Spacing & rhythm", "المسافات والإيقاع", 16, "Why 8px grids make designs feel calm.", "ليه شبكات ٨px بتخلّي التصميم هادئ.", "The invisible grid."),
      ]),
      sec("s2", "Color & type", "اللون والطباعة", [
        vid("l3", "Color for interfaces", "اللون للواجهات", 20, "Beyond palettes: meaning and contrast.", "أكثر من الباليت: المعنى والتباين.", "Color with intent."),
        vid("l4", "Typography basics", "أساسيات الطباعة", 22, "Type scales, line height, and pairing.", "مقاييس الطباعة وارتفاع السطر والمزاوجة.", "Type that reads well."),
      ]),
    ],
    reviews: baseReviews("c-ui-design"),
    qa: baseQA("c-ui-design"),
    faqs: baseFaqs(),
  },
  // 13. Product Management
  {
    id: "c-pm",
    title: "Product Management: From Idea to Launch",
    titleAr: "إدارة المنتج: من الفكرة للإطلاق",
    subtitle: "The end-to-end PM workflow — discovery, framing, shipping, and learning.",
    subtitleAr: "سير عمل إدارة المنتج من البداية للنهاية — اكتشاف وتأطير وإطلاق وتعلّم.",
    description:
      "A practical PM course. You'll learn the discovery → framing → delivery loop, with templates and examples from real B2B and B2C products.",
    descriptionAr:
      "كورس PM عملي. هتتعلّم حلقة الاكتشاف → التأطير → التسليم، بقوالب وأمثلة من منتجات B2B و B2C حقيقية.",
    category: "Product",
    categoryAr: "المنتج",
    level: "Intermediate",
    language: "English",
    thumbnail: "",
    accent: "from-indigo-500 to-violet-600",
    price: 119.99,
    originalPrice: 269.99,
    rating: 4.7,
    ratingCount: 5210,
    enrolledCount: 24600,
    totalHours: 15,
    totalLessons: 38,
    lastUpdated: "2024-09-05",
    instructorId: "i-4",
    skills: ["Product Discovery", "Framing", "Prioritization", "Roadmapping", "Stakeholder Mgmt"],
    skillsAr: ["اكتشاف المنتج", "التأطير", "الأولوية", "خارطة الطريق", "إدارة أصحاب المصلحة"],
    includes: { hoursOfVideo: 15, articles: 14, downloadableResources: 10, mobileAccess: true, certificate: true },
    tags: ["product", "pm", "product management", "roadmap", "discovery", "strategy"],
    sections: [
      sec("s1", "What PMs actually do", "إيه اللي بيعمله مدير المنتج بجد", [
        vid("l1", "The PM role, demystified", "دور الـ PM بوضوح", 16, "What PMs own — and what they don't.", "إيه اللي بيمتلكه الـ PM — وإيه لأ.", "Clearing up common myths."),
        vid("l2", "Discovery in practice", "الاكتشاف عملياً", 22, "Customer interviews that surface real problems.", "مقابلات عميل بتظهر المشاكل الحقيقية.", "Finding problems worth solving."),
      ]),
      sec("s2", "Framing & prioritizing", "التأطير والأولوية", [
        vid("l3", "Writing product briefs", "كتابة ملخصات المنتج", 20, "A template that aligns teams.", "قالب بيوحّد الفرق.", "The one-page artifact that prevents chaos."),
        vid("l4", "Prioritization frameworks", "أطر الأولوية", 22, "RICE, ICE, and when to use each.", "RICE و ICE وإمتى تستخدم كل واحد.", "Choosing what not to build."),
      ]),
      sec("s3", "Delivery & learning", "التسليم والتعلّم", [
        vid("l5", "Working with engineering", "الشغل مع الهندسة", 22, "Specs that don't waste time.", "مواصفات بتضيّع وقتك.", "The spec as a conversation, not a contract."),
        vid("l6", "Launch & post-launch", "الإطلاق وما بعده", 24, "What to measure after you ship.", "إيه تقيس بعد الإطلاق.", "Learning loops that compound."),
      ]),
    ],
    reviews: baseReviews("c-pm"),
    qa: baseQA("c-pm"),
    faqs: baseFaqs(),
  },
  // 14. Roadmapping
  {
    id: "c-roadmap",
    title: "Roadmapping That Aligns Stakeholders",
    titleAr: "خرائط الطريق اللي بتوحّد أصحاب المصلحة",
    subtitle: "Build roadmaps that survive contact with reality.",
    subtitleAr: "ابنِ خرائط طريق تصمد أمام الواقع.",
    description:
      "A focused course on the most-political PM artifact. You'll learn the now/next/later format, theme-based roadmaps, and how to say 'no' gracefully.",
    descriptionAr:
      "كورس مركّز على أكثر وثيقة PM سياسية. هتتعلّم صيغة now/next/later وخرائط الطريق الموضوعية، وإزاي تقول 'لا' بأدب.",
    category: "Product",
    categoryAr: "المنتج",
    level: "Intermediate",
    language: "English",
    thumbnail: "",
    accent: "from-violet-500 to-purple-600",
    price: 69.99,
    originalPrice: 159.99,
    rating: 4.5,
    ratingCount: 2210,
    enrolledCount: 9820,
    totalHours: 7,
    totalLessons: 20,
    lastUpdated: "2024-06-20",
    instructorId: "i-4",
    skills: ["Roadmapping", "Stakeholder Mgmt", "Communication", "Strategy"],
    skillsAr: ["خارطة الطريق", "إدارة أصحاب المصلحة", "التواصل", "الاستراتيجية"],
    includes: { hoursOfVideo: 7, articles: 6, downloadableResources: 8, mobileAccess: true, certificate: true },
    tags: ["roadmap", "product", "pm", "stakeholder", "strategy"],
    sections: [
      sec("s1", "Roadmap fundamentals", "أساسيات خارطة الطريق", [
        vid("l1", "What a roadmap is (and isn't)", "إيه خارطة الطريق (وإيه لأ)", 14, "It's a communication tool, not a Gantt chart.", "هي أداة تواصل، مش مخطط جانت.", "The most common roadmap mistake."),
        vid("l2", "Now / Next / Later", "الآن / التالي / لاحقاً", 18, "The format that scales.", "الصيغة اللي بتتكبّر.", "Why this beats date-driven roadmaps."),
      ]),
      sec("s2", "Building & maintaining", "البناء والصيانة", [
        vid("l3", "Theme-based roadmaps", "خرائط موضوعية", 20, "Outcomes over features.", "النتائج فوق الميزات.", "The roadmap that adapts."),
        vid("l4", "Saying no, gracefully", "قول لا بأدب", 18, "A framework for declining asks.", "إطار لرفض الطلبات.", "The PM's most-used skill."),
      ]),
    ],
    reviews: baseReviews("c-roadmap"),
    qa: baseQA("c-roadmap"),
    faqs: baseFaqs(),
  },
  // 15. SEO
  {
    id: "c-seo",
    title: "Modern SEO: From Keywords to Topical Authority",
    titleAr: "SEO الحديث: من الكلمات المفتاحية للسلطة الموضوعية",
    subtitle: "Rank in the age of AI search — content, technical, and links that work in 2025.",
    subtitleAr: "ترتّب في عصر بحث الـ AI — محتوى وتقني وروابط بتشتغل في ٢٠٢٥.",
    description:
      "An up-to-date SEO course. You'll learn keyword research, on-page optimization, technical SEO, and how to build topical authority — with checklists you can reuse.",
    descriptionAr:
      "كورس SEO محدّث. هتتعلّم بحث الكلمات وتحسين الصفحات وSEO التقني وإزاي تبني سلطة موضوعية — بقوائم تقدر تعيد استخدامها.",
    category: "Marketing",
    categoryAr: "التسويق",
    level: "Beginner",
    language: "English",
    thumbnail: "",
    accent: "from-teal-500 to-cyan-600",
    price: 79.99,
    originalPrice: 189.99,
    rating: 4.6,
    ratingCount: 6820,
    enrolledCount: 31400,
    totalHours: 11,
    totalLessons: 32,
    lastUpdated: "2024-11-01",
    instructorId: "i-5",
    skills: ["SEO", "Keyword Research", "Technical SEO", "Content Strategy", "Link Building"],
    skillsAr: ["SEO", "بحث الكلمات", "SEO التقني", "استراتيجية المحتوى", "بناء الروابط"],
    includes: { hoursOfVideo: 11, articles: 12, downloadableResources: 8, mobileAccess: true, certificate: true },
    tags: ["seo", "marketing", "search", "content", "keywords", "organic"],
    sections: [
      sec("s1", "SEO in 2025", "SEO في ٢٠٢٥", [
        vid("l1", "How search has changed", "إزاي البحث اتغيّر", 16, "AI overviews, zero-click, and what still works.", "نظرات الـ AI والنقرات الصفرية وإيه اللي لسه بيشتغل.", "Where SEO is now."),
        vid("l2", "Keyword research that works", "بحث الكلمات اللي بيشتغل", 22, "Intent-first keyword strategy.", "استراتيجية كلمات بالنية أولاً.", "Find terms that actually convert."),
      ]),
      sec("s2", "On-page & technical", "على الصفحة والتقني", [
        vid("l3", "On-page optimization", "تحسين على الصفحة", 24, "Titles, headers, and internal links.", "العناوين والترويسات والروابط الداخلية.", "The on-page checklist."),
        vid("l4", "Technical SEO basics", "أساسيات SEO التقني", 22, "Crawlability, speed, and structured data.", "قابلية الزحف والسرعة والبيانات المهيكلة.", "Make Google's job easy."),
      ]),
      sec("s3", "Authority & links", "السلطة والروابط", [
        vid("l5", "Topical authority", "السلطة الموضوعية", 20, "Build content clusters that rank.", "ابنِ عناقيد محتوى بترتّب.", "The strategy that compounds."),
        vid("l6", "Link building, modern", "بناء الروابط بالحديث", 18, "Earn links without spammy tactics.", "اكسب روابط بدون تكتيكات سبام.", "Links that move the needle."),
      ]),
    ],
    reviews: baseReviews("c-seo"),
    qa: baseQA("c-seo"),
    faqs: baseFaqs(),
  },
];

// Courses 16-18 (a few extra for richer browsing) - shorter
const moreCourses: Course[] = [
  {
    id: "c-content",
    title: "Content Marketing Engines for B2B",
    titleAr: "محرّكات تسويق المحتوى للـ B2B",
    subtitle: "Turn content into a predictable pipeline — not a vanity metric.",
    subtitleAr: "حوّل المحتوى لخط أنابيب متوقع — مش مجرد رقم شكلي.",
    description: "A B2B content course. You'll build a content engine that compounds, with templates for SEO articles, webinars, and reuse.",
    descriptionAr: "كورس محتوى B2B. هتبني محرّك محتوى بيتراكم، بقوالب لمقالات SEO والويبينارز وإعادة الاستخدام.",
    category: "Marketing", categoryAr: "التسويق", level: "Intermediate", language: "English",
    thumbnail: "", accent: "from-orange-500 to-red-600",
    price: 89.99, originalPrice: 199.99, rating: 4.6, ratingCount: 3210, enrolledCount: 12400, totalHours: 10, totalLessons: 28,
    lastUpdated: "2024-08-08", instructorId: "i-5",
    skills: ["Content Marketing", "SEO", "Repurposing", "Webinars", "Distribution"],
    skillsAr: ["تسويق المحتوى", "SEO", "إعادة الاستخدام", "الويبينارز", "التوزيع"],
    includes: { hoursOfVideo: 10, articles: 16, downloadableResources: 8, mobileAccess: true, certificate: true },
    tags: ["content", "marketing", "b2b", "seo", "blog"],
    sections: [
      sec("s1", "The content engine", "محرّك المحتوى", [
        vid("l1", "What a content engine is", "إيه محرّك المحتوى", 14, "Why most content fails.", "ليه أغلب المحتوى بيفشل.", "The model that works."),
        vid("l2", "Pillar & cluster strategy", "استراتيجية الركن والعنقود", 18, "Structure content for SEO and reuse.", "نظّم المحتوى لـ SEO وإعادة الاستخدام.", "A scalable structure."),
      ]),
      sec("s2", "Production & distribution", "الإنتاج والتوزيع", [
        vid("l3", "Writing articles that rank", "كتابة مقالات بترتّب", 22, "A repeatable article template.", "قالب مقال قابل للتكرار.", "From brief to publish."),
        vid("l4", "Repurposing playbook", "كتيب إعادة الاستخدام", 18, "One idea → 10 assets.", "فكرة واحدة → ١٠ أصول.", "Get more from less."),
      ]),
    ],
    reviews: baseReviews("c-content"), qa: baseQA("c-content"), faqs: baseFaqs(),
  },
  {
    id: "c-paid-ads",
    title: "Paid Ads: Meta & Google Without Burning Cash",
    titleAr: "الإعلانات المدفوعة: ميتا وجوجل بدون حرق فلوس",
    subtitle: "Set up, test, and scale profitable paid campaigns — even on small budgets.",
    subtitleAr: "أعدّ واختبر وكبّر حملات مدفوعة رابحة — حتى بالميزانيات الصغيرة.",
    description: "A practical paid media course. You'll structure campaigns, write ads that convert, and read the metrics that actually matter.",
    descriptionAr: "كورس إعلانات مدفوعة عملي. هتنظّم الحملات وتكتب إعلانات بتحوّل وتقرأ المقاييس اللي بتجيب نتيجة.",
    category: "Marketing", categoryAr: "التسويق", level: "Intermediate", language: "English",
    thumbnail: "", accent: "from-red-500 to-rose-600",
    price: 99.99, originalPrice: 229.99, rating: 4.5, ratingCount: 4120, enrolledCount: 18200, totalHours: 12, totalLessons: 34,
    lastUpdated: "2024-10-12", instructorId: "i-5",
    skills: ["Paid Ads", "Meta Ads", "Google Ads", "Conversion", "Tracking"],
    skillsAr: ["الإعلانات المدفوعة", "إعلانات ميتا", "إعلانات جوجل", "التحويل", "التتبع"],
    includes: { hoursOfVideo: 12, articles: 6, downloadableResources: 6, mobileAccess: false, certificate: true },
    tags: ["ads", "paid", "meta", "google", "marketing", "facebook"],
    sections: [
      sec("s1", "Foundations", "الأساسيات", [
        vid("l1", "Campaign structure", "هيكل الحملة", 20, "The structure that scales.", "الهيكل اللي بيتكبّر.", "Avoid the #1 beginner mistake."),
        vid("l2", "Tracking that works", "تتبع بيشتغل", 22, "Pixel, conversions API, and attribution.", "البكسل وواجهة التحويل والإسناد.", "Trust your numbers."),
      ]),
      sec("s2", "Creative & scaling", "الإبداع والتكبير", [
        vid("l3", "Ad creative that converts", "إعلان بيحوّل", 22, "Hooks, angles, and formats.", "الخطافات والزوايا والصيغ.", "The creative is the targeting."),
        vid("l4", "Scaling profitably", "تكبير مربح", 24, "When to scale, and when to kill.", "إمتى تكبّر وإمتى توقف.", "The scaling decision tree."),
      ]),
    ],
    reviews: baseReviews("c-paid-ads"), qa: baseQA("c-paid-ads"), faqs: baseFaqs(),
  },
  {
    id: "c-branding",
    title: "Brand Strategy for Modern Companies",
    titleAr: "استراتيجية العلامة للشركات الحديثة",
    subtitle: "Build brands with meaning — beyond the logo.",
    subtitleAr: "ابنِ علامات بمعنى — أبعد من الشعار.",
    description: "A brand strategy course. You'll learn positioning, voice, and the artifact set every brand needs — with case studies from real companies.",
    descriptionAr: "كورس استراتيجية علامة. هتتعلّم التموضع والصوت ومجموعة الوثائق اللي كل علامة محتاجاها — بدراسات حالة من شركات حقيقية.",
    category: "Design", categoryAr: "التصميم", level: "Beginner", language: "English",
    thumbnail: "", accent: "from-amber-500 to-yellow-600",
    price: 74.99, originalPrice: 169.99, rating: 4.7, ratingCount: 2810, enrolledCount: 11200, totalHours: 8, totalLessons: 22,
    lastUpdated: "2024-07-15", instructorId: "i-3",
    skills: ["Branding", "Positioning", "Voice", "Identity", "Strategy"],
    skillsAr: ["الهوية", "التموضع", "الصوت", "الهوية البصرية", "الاستراتيجية"],
    includes: { hoursOfVideo: 8, articles: 8, downloadableResources: 6, mobileAccess: true, certificate: true },
    tags: ["brand", "branding", "strategy", "identity", "design"],
    sections: [
      sec("s1", "Strategy", "الاستراتيجية", [
        vid("l1", "Positioning that sticks", "تموضع يلصق", 20, "Own a word in the customer's mind.", "امتلك كلمة بذهن العميل.", "The artifact that anchors everything."),
        vid("l2", "Brand voice", "صوت العلامة", 18, "Write like you, on purpose.", "اكتب كأنك، عن قصد.", "Voice that scales."),
      ]),
      sec("s2", "Identity", "الهوية", [
        vid("l3", "Visual identity basics", "أساسيات الهوية البصرية", 22, "Logo, color, type — and when to invest.", "الشعار واللون والطباعة — وإمتى تستثمر.", "Beyond the logo."),
      ]),
    ],
    reviews: baseReviews("c-branding"), qa: baseQA("c-branding"), faqs: baseFaqs(),
  },
];
courses.push(...moreCourses);

// ---------- Quizzes ----------
export const quizzes: Quiz[] = [
  {
    id: "q-sql",
    title: "SQL Foundations Quiz",
    titleAr: "اختبار أساسيات SQL",
    courseId: "c-sql",
    sectionId: "s2",
    lessonId: "l8",
    passingScore: 60,
    questions: [
      {
        id: "q1",
        question: "Which JOIN returns all rows from the left table even when there's no match in the right?",
        questionAr: "أي JOIN بيرجّع كل صفوف الجدول اليسار حتى لو مفيش تطابق باليمين؟",
        options: ["INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "CROSS JOIN"],
        optionsAr: ["INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "CROSS JOIN"],
        correctIndex: 1,
        explanation: "LEFT JOIN keeps every row from the left table; unmatched right-side columns are NULL.",
        explanationAr: "LEFT JOIN بيحتفظ بكل صف من الجدول اليسار؛ الأعمدة غير المطابقة باليمين بـ NULL.",
      },
      {
        id: "q2",
        question: "Which clause filters rows after GROUP BY aggregation?",
        questionAr: "أي جملة بتصفّي الصفوف بعد تجميع GROUP BY؟",
        options: ["WHERE", "HAVING", "FILTER", "AFTER"],
        optionsAr: ["WHERE", "HAVING", "FILTER", "AFTER"],
        correctIndex: 1,
        explanation: "HAVING filters on aggregated values; WHERE filters rows before aggregation.",
        explanationAr: "HAVING بتصفّي على القيم المجمّعة؛ WHERE بتصفّي الصفوف قبل التجميع.",
      },
      {
        id: "q3",
        question: "What does ROW_NUMBER() do in a window function?",
        questionAr: "إيه اللي بيعمله ROW_NUMBER() بدالة نوافذية؟",
        options: [
          "Counts total rows in the table",
          "Assigns a unique sequential integer to each row in its partition",
          "Returns the number of a column",
          "Counts NULL values",
        ],
        optionsAr: [
          "بيعدّ كل الصفوف بالجدول",
          "بيعيّن رقم تسلسلي فريد لكل صف بقسمه",
          "بيرجّع رقم عمود",
          "بيعدّ قيم الـ NULL",
        ],
        correctIndex: 1,
        explanation: "ROW_NUMBER() assigns 1, 2, 3… within each partition, ordered by the ORDER BY clause.",
        explanationAr: "ROW_NUMBER() بيعيّن ١، ٢، ٣… داخل كل قسم، مرتبة بجملة ORDER BY.",
      },
      {
        id: "q4",
        question: "Which is the recommended way to write complex queries for readability?",
        questionAr: "إيه الطريقة الموصى بيها لكتابة استعلامات معقدة بشكل مقروء؟",
        options: ["Nested subqueries", "Multiple JOINs in one line", "CTEs (WITH clauses)", "Stored procedures"],
        optionsAr: ["استعلامات فرعية متداخلة", "JOINs متعددة بسطر واحد", "CTEs (جمل WITH)", "إجراءات مخزّنة"],
        correctIndex: 2,
        explanation: "CTEs let you name intermediate result sets, making queries much easier to read and debug.",
        explanationAr: "CTEs بتخلّيك تسمّي مجموعات النتائج الوسيطة، فبتسهّل القراءة والتنقيح.",
      },
      {
        id: "q5",
        question: "In cohort retention analysis, what does a 'cohort' typically represent?",
        questionAr: "بتحليل الاحتفاظ بالكوهورتس، إيه اللي بيمثله «الكوهورت» عادةً؟",
        options: ["A single user", "A group of users who share a common characteristic in a time period", "A type of SQL join", "A database index"],
        optionsAr: ["مستخدم واحد", "مجموعة مستخدمين بسمة مشتركة بفترة زمنية", "نوع من JOIN", "فهرس قاعدة بيانات"],
        correctIndex: 1,
        explanation: "A cohort is a group with a shared characteristic (e.g., signup month) tracked over time.",
        explanationAr: "الكوهورت مجموعة بسمة مشتركة (مثل شهر التسجيل) بتُتابع عبر الزمن.",
      },
    ],
  },
];

// ---------- Helpers ----------
export function getCourse(id: string): Course | undefined {
  return courses.find((c) => c.id === id);
}

export function getInstructor(id: string): Instructor | undefined {
  return instructors.find((i) => i.id === id);
}

export function getQuizForCourse(courseId: string): Quiz | undefined {
  return quizzes.find((q) => q.courseId === courseId);
}

export function getRole(id: string): Role | undefined {
  return roles.find((r) => r.id === id);
}

export function getSkill(id: string): Skill | undefined {
  return skills.find((s) => s.id === id);
}

export function getAllLessons(course: Course) {
  return course.sections.flatMap((s) => s.lessons.map((l) => ({ ...l, sectionId: s.id })));
}

export function getLessonById(course: Course, lessonId: string) {
  for (const s of course.sections) {
    const l = s.lessons.find((x) => x.id === lessonId);
    if (l) return { lesson: l, section: s };
  }
  return undefined;
}

/** Mock "semantic" search: map free-text queries to topic tags. */
const semanticMap: { match: string[]; tags: string[]; role?: string }[] = [
  { match: ["sql", "database", "databases", "relational", "query", "queries"], tags: ["sql", "database", "query"], role: "data-analyst" },
  { match: ["data analyst", "analyst", "analytics", "become a data analyst"], tags: ["data", "analyst", "sql", "tableau"], role: "data-analyst" },
  { match: ["python", "pandas", "numpy"], tags: ["python", "pandas", "data"], role: "data-analyst" },
  { match: ["tableau", "dashboard", "viz", "visualization"], tags: ["tableau", "dashboard", "viz"], role: "data-viz-specialist" },
  { match: ["statistics", "stats", "probability", "ab testing", "a/b"], tags: ["statistics", "probability", "hypothesis"], role: "data-analyst" },
  { match: ["html", "css", "layout", "responsive", "flexbox", "grid"], tags: ["html", "css", "layout", "responsive"], role: "frontend-dev" },
  { match: ["javascript", "js", "es6", "async"], tags: ["javascript", "js", "frontend"], role: "frontend-dev" },
  { match: ["react", "hooks", "jsx", "spa"], tags: ["react", "hooks", "frontend"], role: "frontend-dev" },
  { match: ["typescript", "ts", "types"], tags: ["typescript", "types"], role: "frontend-dev" },
  { match: ["node", "node.js", "express", "backend", "api", "rest"], tags: ["node", "express", "backend", "api"], role: "fullstack-dev" },
  { match: ["fullstack", "full stack", "full-stack"], tags: ["node", "react", "javascript"], role: "fullstack-dev" },
  { match: ["ux", "research", "usability", "interview"], tags: ["ux", "research", "usability"], role: "ux-designer" },
  { match: ["figma", "design system", "components", "prototyping"], tags: ["figma", "design", "ui"], role: "ux-designer" },
  { match: ["ui", "visual design", "color", "typography"], tags: ["ui", "design", "visual"], role: "ux-designer" },
  { match: ["product manager", "pm", "product management", "roadmap", "discovery"], tags: ["product", "pm", "roadmap"], role: "product-manager" },
  { match: ["seo", "search", "organic", "keywords"], tags: ["seo", "marketing", "content"], role: "digital-marketer" },
  { match: ["content", "content marketing", "blog", "b2b"], tags: ["content", "marketing", "b2b"], role: "digital-marketer" },
  { match: ["ads", "paid", "meta ads", "google ads", "facebook ads"], tags: ["ads", "paid", "marketing"], role: "digital-marketer" },
  { match: ["brand", "branding", "identity"], tags: ["brand", "branding", "design"], role: "ux-designer" },
  { match: ["machine learning", "ml", "ai"], tags: ["python", "ml", "data"], role: "ml-engineer" },
];

export interface SearchResult {
  course: Course;
  score: number;
  matchedRole?: string;
}

export function searchCourses(query: string): SearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return courses.map((c) => ({ course: c, score: 0 }));

  // Tag matches
  const tagMatches = new Set<string>();
  let matchedRole: string | undefined;
  for (const entry of semanticMap) {
    if (entry.match.some((m) => q.includes(m))) {
      entry.tags.forEach((t) => tagMatches.add(t));
      if (entry.role && !matchedRole) matchedRole = entry.role;
    }
  }

  const results: SearchResult[] = courses
    .map((c) => {
      const text = `${c.title} ${c.titleAr} ${c.subtitle} ${c.category} ${c.tags.join(" ")} ${c.skills.join(" ")}`.toLowerCase();
      let score = 0;
      // direct keyword includes
      if (text.includes(q)) score += 5;
      // word-level matches
      const words = q.split(/\s+/);
      for (const w of words) {
        if (w.length > 2 && text.includes(w)) score += 1;
      }
      // tag/role semantic boost
      for (const t of c.tags) {
        if (tagMatches.has(t)) score += 2;
      }
      for (const s of c.skills) {
        const sl = s.toLowerCase();
        if (tagMatches.has(sl)) score += 2;
      }
      return { course: c, score, matchedRole };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);

  return results;
}

// Mock "student history" — courses the demo student has touched.
export const demoHistoryCourseIds = ["c-html-css", "c-js"];

// Promo codes for cart
export const promoCodes: Record<string, number> = {
  EDIFY10: 0.1,
  WELCOME25: 0.25,
  MVP50: 0.5,
};

// ---------- Consultation Categories ----------
export const consultationCategories = [
  { id: "all", label: "All Fields", labelAr: "كل المجالات" },
  { id: "software", label: "Software Engineering", labelAr: "هندسة البرمجيات" },
  { id: "data-ai", label: "Data & AI", labelAr: "البيانات والذكاء الاصطناعي" },
  { id: "design", label: "UI/UX Design", labelAr: "تصميم وتجربة المستخدم" },
  { id: "product", label: "Product Management", labelAr: "إدارة المنتجات" },
  { id: "marketing", label: "Digital Marketing", labelAr: "التسويق الرقمي" },
  { id: "cloud-devops", label: "Cloud & DevOps", labelAr: "السحابة والديف أوبس" },
  { id: "career", label: "Career Coaching", labelAr: "الإرشاد المهني" },
];

// ---------- Consultation Instructors ----------
export const consultationInstructors: ConsultationInstructor[] = [
  {
    id: "ci-1",
    name: "Dr. Amira Khalil",
    nameAr: "د. أميرة خليل",
    title: "Senior Data Scientist, ex-Google",
    titleAr: "عالمة بيانات أولى، سابقاً في جوجل",
    bio: "Specializing in Data Strategy, Machine Learning roadmaps, and career transitions into AI & Analytics. Mentored 300+ students globally.",
    bioAr: "متخصصة في استراتيجيات البيانات وخارطة طريق التعلّم الآلي والتحول المهني نحو الذكاء الاصطناعي وتحليل البيانات. درّبت أكثر من 300 طالب.",
    avatar: "https://i.pravatar.cc/200?img=47",
    rating: 4.95,
    reviewsCount: 142,
    field: "data-ai",
    fieldAr: "البيانات والذكاء الاصطناعي",
    category: "Data & AI",
    categoryAr: "البيانات والذكاء الاصطناعي",
    pricePerSession: 65,
    sessionDurationMin: 45,
    availableDays: ["Monday", "Wednesday", "Saturday"],
    availableDaysAr: ["الإثنين", "الأربعاء", "السبت"],
    timeSlots: ["10:00 AM", "02:00 PM", "05:00 PM", "07:30 PM"],
    specialties: ["Data Science Strategy", "Python & SQL Roadmaps", "AI Career Switch", "Resume Review"],
    specialtiesAr: ["استراتيجية علم البيانات", "خطة بايثون و SQL", "التحول لمجال الذكاء الاصطناعي", "مراجعة السيرة الذاتية"],
    languages: ["Arabic", "English"],
    languagesAr: ["العربية", "الإنجليزية"],
    experienceYears: 12,
  },
  {
    id: "ci-2",
    name: "Omar Farouk",
    nameAr: "عمر فاروق",
    title: "Staff Frontend Architect, ex-Stripe",
    titleAr: "مهندس واجهات ستاف، سابقاً في سترايب",
    bio: "Expert in frontend architecture, React & Next.js ecosystem, code reviews, and mock technical system design interviews.",
    bioAr: "خبير في هندسة الواجهات الأمامية وبيئة عمل React و Next.js ومراجعة الأكواد ومقابلات التصميم الهندسي التقني التجريبية.",
    avatar: "https://i.pravatar.cc/200?img=12",
    rating: 4.92,
    reviewsCount: 189,
    field: "software",
    fieldAr: "هندسة البرمجيات",
    category: "Software Engineering",
    categoryAr: "هندسة البرمجيات",
    pricePerSession: 75,
    sessionDurationMin: 45,
    availableDays: ["Tuesday", "Thursday", "Sunday"],
    availableDaysAr: ["الثلاثاء", "الخميس", "الأحد"],
    timeSlots: ["11:00 AM", "03:00 PM", "06:00 PM", "08:00 PM"],
    specialties: ["React & TypeScript Architecture", "Code Review & Refactoring", "Frontend Interview Prep", "Performance Optimization"],
    specialtiesAr: ["معمارية رياكت وتايبسكربت", "مراجعة الكود وإعادة الهيكلة", "التحضير للمقابلات التقنية", "تحسين الأداء"],
    languages: ["Arabic", "English"],
    languagesAr: ["العربية", "الإنجليزية"],
    experienceYears: 10,
  },
  {
    id: "ci-3",
    name: "Lina Haddad",
    nameAr: "لينا حداد",
    title: "Principal Product Designer, ex-Airbnb",
    titleAr: "مصممة منتجات رئيسية، سابقاً في إيربي‌إن‌بي",
    bio: "Offers hands-on UX portfolio critiques, design system guidance, and product discovery methods for aspiring and senior designers.",
    bioAr: "تقدم نقداً عملياً لمعارض أعمال تجربة المستخدم (Portfolio)، وإرشادات أنظمة التصميم، وأساليب اكتشاف المنتجات للمصممين.",
    avatar: "https://i.pravatar.cc/200?img=32",
    rating: 4.88,
    reviewsCount: 96,
    field: "design",
    fieldAr: "تصميم وتجربة المستخدم",
    category: "UI/UX Design",
    categoryAr: "تصميم وتجربة المستخدم",
    pricePerSession: 60,
    sessionDurationMin: 45,
    availableDays: ["Monday", "Tuesday", "Thursday"],
    availableDaysAr: ["الإثنين", "الثلاثاء", "الخميس"],
    timeSlots: ["01:00 PM", "04:00 PM", "06:30 PM"],
    specialties: ["Portfolio Critique", "Figma Design Systems", "UX Research Tactics", "Design Interview Prep"],
    specialtiesAr: ["نقد معرض الأعمال", "أنظمة التصميم في فيجما", "أساليب أبحاث تجربة المستخدم", "التحضير لمقابلات التصميم"],
    languages: ["Arabic", "English", "French"],
    languagesAr: ["العربية", "الإنجليزية", "الفرنسية"],
    experienceYears: 9,
  },
  {
    id: "ci-4",
    name: "Karim Mansour",
    nameAr: "كريم منصور",
    title: "Director of Product, ex-Meta",
    titleAr: "مدير منتج تنفيذي، سابقاً في ميتا",
    bio: "Helps product managers master roadmap prioritization, metric-driven execution, and executive stakeholder alignment.",
    bioAr: "يساعد مديري المنتجات على إتقان تحديد أولويات خرائط الطريق، والتنفيذ القائم على المقاييس، والتنسيق مع القيادات التنفيذية.",
    avatar: "https://i.pravatar.cc/200?img=15",
    rating: 4.86,
    reviewsCount: 112,
    field: "product",
    fieldAr: "إدارة المنتجات",
    category: "Product Management",
    categoryAr: "إدارة المنتجات",
    pricePerSession: 80,
    sessionDurationMin: 45,
    availableDays: ["Wednesday", "Friday", "Saturday"],
    availableDaysAr: ["الأربعاء", "الجمعة", "السبت"],
    timeSlots: ["10:30 AM", "02:30 PM", "05:00 PM"],
    specialties: ["Product Strategy & PRDs", "Metrics & OKRs", "PM Mock Interviews", "Transition to Product"],
    specialtiesAr: ["استراتيجية المنتج والوثائق", "المقاييس و OKRs", "مقابلات إدارة المنتجات التجريبية", "التحول لإدارة المنتجات"],
    languages: ["Arabic", "English"],
    languagesAr: ["العربية", "الإنجليزية"],
    experienceYears: 13,
  },
  {
    id: "ci-5",
    name: "Sara Nabil",
    nameAr: "سارة نبيل",
    title: "Growth Marketing Lead, ex-Shopify",
    titleAr: "قائدة التسويق والنمو، سابقاً في شوبيفاي",
    bio: "Consulting on organic SEO engines, paid performance campaigns, retention loops, and brand storytelling that scales.",
    bioAr: "استشارات في محركات تحسين الظهور المجاني (SEO)، وحملات الإعلانات المدفوعة، وحلقات الاحتفاظ بالعملاء وبناء العلامات التجارية.",
    avatar: "https://i.pravatar.cc/200?img=45",
    rating: 4.90,
    reviewsCount: 84,
    field: "marketing",
    fieldAr: "التسويق الرقمي",
    category: "Digital Marketing",
    categoryAr: "التسويق الرقمي",
    pricePerSession: 55,
    sessionDurationMin: 45,
    availableDays: ["Sunday", "Tuesday", "Thursday"],
    availableDaysAr: ["الأحد", "الثلاثاء", "الخميس"],
    timeSlots: ["12:00 PM", "03:30 PM", "07:00 PM"],
    specialties: ["Growth Loops & Funnels", "Paid Ads Strategy", "SEO Scaling", "Content Engine Setup"],
    specialtiesAr: ["مسارات النمو والتحويل", "استراتيجية الإعلانات المدفوعة", "توسيع الـ SEO", "بناء محركات المحتوى"],
    languages: ["Arabic", "English"],
    languagesAr: ["العربية", "الإنجليزية"],
    experienceYears: 8,
  },
  {
    id: "ci-6",
    name: "Dr. Tariq Al-Ghamdi",
    nameAr: "د. طارق الغامدي",
    title: "Principal Cloud & DevOps Architect, ex-AWS",
    titleAr: "مهندس سحابي رئيسي وديف أوبس، سابقاً في AWS",
    bio: "Guidance on AWS architectures, Kubernetes cluster optimization, CI/CD automation pipelines, and cloud cost containment.",
    bioAr: "إرشاد في معمارية AWS السحابية، وتحسين بيئات كوبرنيتس، وأتمتة خطوط CI/CD، وتقليص تكاليف البنية السحابية.",
    avatar: "https://i.pravatar.cc/200?img=68",
    rating: 4.97,
    reviewsCount: 76,
    field: "cloud-devops",
    fieldAr: "السحابة والديف أوبس",
    category: "Cloud & DevOps",
    categoryAr: "السحابة والديف أوبس",
    pricePerSession: 85,
    sessionDurationMin: 45,
    availableDays: ["Monday", "Wednesday", "Sunday"],
    availableDaysAr: ["الإثنين", "الأربعاء", "الأحد"],
    timeSlots: ["02:00 PM", "04:30 PM", "08:00 PM"],
    specialties: ["AWS Cloud Architecture", "Kubernetes & Docker", "CI/CD Pipelines", "Cloud Security"],
    specialtiesAr: ["معمارية AWS السحابية", "كوبرنيتس ودوكر", "أنابيب النشر المستمر", "أمن السحابة"],
    languages: ["Arabic", "English"],
    languagesAr: ["العربية", "الإنجليزية"],
    experienceYears: 14,
  },
  {
    id: "ci-7",
    name: "Rania Al-Sayed",
    nameAr: "رانيا السيد",
    title: "Senior Tech Career Coach & Talent Partner",
    titleAr: "مستشارة مهنية تقنية وشريكة استقطاب مواهب",
    bio: "Helping engineers and digital professionals craft high-converting CVs, ace behavioral interviews, and negotiate senior salaries.",
    bioAr: "تساعد المهندسين والمهنيين التقنيين على صياغة سير ذاتية مميزة، واجتياز المقابلات السلوكية، والتفاوض على الرواتب المرتفعة.",
    avatar: "https://i.pravatar.cc/200?img=28",
    rating: 4.96,
    reviewsCount: 220,
    field: "career",
    fieldAr: "الإرشاد المهني",
    category: "Career Coaching",
    categoryAr: "الإرشاد المهني",
    pricePerSession: 50,
    sessionDurationMin: 45,
    availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday"],
    availableDaysAr: ["الإثنين", "الثلاثاء", "الأربعاء", "الخميس"],
    timeSlots: ["10:00 AM", "01:00 PM", "04:00 PM", "06:00 PM"],
    specialties: ["Tech Resume Makeover", "LinkedIn Optimization", "Salary Negotiation", "Mock Behavioral Interview"],
    specialtiesAr: ["تطوير السيرة الذاتية التقنية", "تحسين ملف لينكد إن", "التفاوض على الراتب", "مقابلات سلوكية تجريبية"],
    languages: ["Arabic", "English"],
    languagesAr: ["العربية", "الإنجليزية"],
    experienceYears: 11,
  },
];

export function getConsultationInstructor(id: string): ConsultationInstructor | undefined {
  return consultationInstructors.find((ci) => ci.id === id);
}

/**
 * Recommends consultation instructors based on the student's profile (roleId, skillIds, enrolled courses).
 */
export function getRecommendedConsultationInstructors(params: {
  roleId?: string;
  skillIds?: string[];
  enrolledCourseIds?: string[];
}): ConsultationInstructor[] {
  const { roleId, skillIds = [] } = params;

  // Role to field mapping
  const roleFieldMap: Record<string, string> = {
    "frontend-dev": "software",
    "fullstack-dev": "software",
    "data-analyst": "data-ai",
    "ml-engineer": "data-ai",
    "data-viz-specialist": "data-ai",
    "ux-designer": "design",
    "product-manager": "product",
    "digital-marketer": "marketing",
  };

  const targetField = roleId ? roleFieldMap[roleId] : undefined;

  const scored = consultationInstructors.map((ci) => {
    let score = 0;
    if (targetField && ci.field === targetField) score += 10;
    if (roleId && (ci.field === "career" || ci.id === "ci-7")) score += 3; // Career coach is always relevant
    // Match against student's skills
    for (const skill of skillIds) {
      const s = skill.toLowerCase();
      if (ci.specialties.some((sp) => sp.toLowerCase().includes(s))) score += 2;
    }
    // High rating boost
    score += ci.rating;
    return { instructor: ci, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.map((s) => s.instructor);
}

// Pre-seeded demo scheduled consultations
export const demoScheduledConsultations: ScheduledConsultation[] = [
  {
    id: "sc-demo-1",
    instructorId: "ci-2",
    studentName: "Layla Hassan",
    studentEmail: "layla@edify.demo",
    topic: "React Architecture & Next.js Performance Review",
    date: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10), // in 2 days
    timeSlot: "03:00 PM",
    durationMin: 45,
    price: 75,
    status: "upcoming",
    meetingUrl: "https://meet.google.com/edf-tech-ses",
    notes: "Reviewing state management choices and bundle size optimization for portfolio project.",
    createdAt: Date.now() - 86400000,
  },
  {
    id: "sc-demo-2",
    instructorId: "ci-7",
    studentName: "Layla Hassan",
    studentEmail: "layla@edify.demo",
    topic: "Tech CV & LinkedIn Positioning for Frontend Roles",
    date: new Date(Date.now() - 86400000 * 5).toISOString().slice(0, 10), // 5 days ago
    timeSlot: "01:00 PM",
    durationMin: 45,
    price: 50,
    status: "completed",
    meetingUrl: "https://meet.google.com/edf-car-ses",
    notes: "Action items: emphasize TypeScript projects and highlight real performance metrics.",
    createdAt: Date.now() - 86400000 * 7,
  },
];

