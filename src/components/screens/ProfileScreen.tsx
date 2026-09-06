"use client";

import { useMemo, useState } from "react";
import { useAppStore } from "@/lib/store";
import { useI18n } from "@/hooks/use-i18n";
import {
  roles,
  skills as allSkillsList,
  getRole,
  getSkill,
  getCourse,
} from "@/lib/mock-data";
import type { Role, Skill, Course } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { CourseThumb } from "@/components/shared/CourseThumb";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  User,
  Mail,
  Target,
  Sparkles,
  Award,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Edit3,
  GraduationCap,
  Briefcase,
  Compass,
  ArrowRight,
  ArrowLeft,
  Search,
  Check,
  RotateCcw,
  Zap,
  TrendingUp,
  BrainCircuit,
  BarChart3,
  Code2,
  Layers,
  PenTool,
  Megaphone,
  PieChart,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Map role icon string -> LucideIcon
const ROLE_ICONS: Record<string, LucideIcon> = {
  BarChart3,
  Code2,
  Layers,
  PenTool,
  Briefcase,
  Megaphone,
  BrainCircuit,
  PieChart,
};

// Education levels lookup
const EDUCATION_MAP: Record<string, { en: string; ar: string; descEn: string; descAr: string }> = {
  highschool: {
    en: "High school",
    ar: "ثانوية عامة",
    descEn: "Secondary school graduate",
    descAr: "خريج ثانوية",
  },
  associate: {
    en: "Associate degree",
    ar: "دبلوم",
    descEn: "2-year diploma",
    descAr: "دبلوم سنتين",
  },
  bachelors: {
    en: "Bachelor's degree",
    ar: "بكالوريوس",
    descEn: "4-year university degree",
    descAr: "شهادة جامعية 4 سنوات",
  },
  masters: {
    en: "Master's degree",
    ar: "ماجستير",
    descEn: "Postgraduate degree",
    descAr: "درجة عليا",
  },
  phd: {
    en: "Doctorate (PhD)",
    ar: "دكتوراه",
    descEn: "Doctoral research degree",
    descAr: "درجة الدكتوراه",
  },
  selftaught: {
    en: "Self-taught",
    ar: "متعلّم ذاتياً",
    descEn: "Independent project-driven learning",
    descAr: "تعلّم عملي عبر المشاريع",
  },
};

export function ProfileScreen() {
  const { locale, isRTL, formatNumber } = useI18n();
  const navigate = useAppStore((s) => s.navigate);
  const user = useAppStore((s) => s.user);
  const updateUser = useAppStore((s) => s.updateUser);
  const onboardingAnswers = useAppStore((s) => s.onboardingAnswers);
  const setOnboardingAnswers = useAppStore((s) => s.setOnboardingAnswers);
  const enrolledCourseIds = useAppStore((s) => s.enrolledCourseIds);
  const certificates = useAppStore((s) => s.certificates);
  const getCourseProgress = useAppStore((s) => s.getCourseProgress);
  const pushToast = useAppStore((s) => s.pushToast);
  const fireConfetti = useAppStore((s) => s.fireConfetti);

  const L = (en: string, ar: string) => (locale === "ar" ? ar : en);

  // Fallback defaults if not set
  const currentRoleId = onboardingAnswers.roleId ?? "frontend-dev";
  const currentRole = getRole(currentRoleId) ?? roles[0];
  const userSkills = onboardingAnswers.skillIds ?? [];

  // Completed courses count
  const completedCoursesCount = useMemo(() => {
    return enrolledCourseIds.filter((id) => getCourseProgress(id) >= 100).length;
  }, [enrolledCourseIds, getCourseProgress]);

  // Target role required skills & gap analysis
  const roleSkills = currentRole.skillIds;
  const acquiredRoleSkills = roleSkills.filter((id) => userSkills.includes(id));
  const gapSkillIds = roleSkills.filter((id) => !userSkills.includes(id));

  // Role readiness percentage
  const readinessPercent = roleSkills.length > 0
    ? Math.min(100, Math.round((acquiredRoleSkills.length / roleSkills.length) * 100))
    : 0;

  // Recommended courses for gap skills
  const gapCourses = useMemo(() => {
    return currentRole.recommendedCourseIds
      .map((id) => getCourse(id))
      .filter((c): c is Course => Boolean(c));
  }, [currentRole]);

  // Dialog States
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editName, setEditName] = useState(user?.name ?? "");
  const [editEmail, setEditEmail] = useState(user?.email ?? "");

  const [isChangeRoleOpen, setIsChangeRoleOpen] = useState(false);
  const [isAddSkillOpen, setIsAddSkillOpen] = useState(false);
  const [skillSearchQuery, setSkillSearchQuery] = useState("");

  // Edit Profile Save
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;
    updateUser({ name: editName.trim(), email: editEmail.trim() });
    setIsEditProfileOpen(false);
    pushToast({
      title: L("Profile updated", "تم تحديث الملف الشخصي"),
      description: L("Your details have been saved.", "تم حفظ معلوماتك بنجاح."),
      variant: "success",
    });
  };

  // Change Target Role
  const handleSelectRole = (newRoleId: string) => {
    setOnboardingAnswers({ roleId: newRoleId });
    setIsChangeRoleOpen(false);
    const newRoleObj = getRole(newRoleId);
    pushToast({
      title: L("Target field updated", "تم تحديث المجال المستهدف"),
      description: L(
        `Your target field is now set to ${newRoleObj?.label}.`,
        `تم تغيير مسارك المستهدف إلى ${newRoleObj?.labelAr}.`
      ),
      variant: "success",
    });
  };

  // Add Skill
  const handleAddSkill = (skillId: string) => {
    if (userSkills.includes(skillId)) return;
    const updated = [...userSkills, skillId];
    setOnboardingAnswers({ skillIds: updated });
    setIsAddSkillOpen(false);
    setSkillSearchQuery("");

    // If this skill was a gap skill and now all gap skills are acquired
    const skillObj = getSkill(skillId);
    pushToast({
      title: L("Skill added", "تمت إضافة المهارة"),
      description: L(
        `Added "${skillObj?.label}" to your skills.`,
        `تمت إضافة "${skillObj?.labelAr}" إلى مهاراتك.`
      ),
      variant: "success",
    });

    if (gapSkillIds.length === 1 && gapSkillIds[0] === skillId) {
      fireConfetti();
    }
  };

  // Mark Gap Skill as Acquired
  const handleMarkSkillAcquired = (skillId: string) => {
    handleAddSkill(skillId);
  };

  // Remove Skill
  const handleRemoveSkill = (skillId: string) => {
    const updated = userSkills.filter((id) => id !== skillId);
    setOnboardingAnswers({ skillIds: updated });
    const skillObj = getSkill(skillId);
    pushToast({
      title: L("Skill removed", "تمت إزالة المهارة"),
      description: L(
        `Removed "${skillObj?.label}" from your profile.`,
        `تم حذف "${skillObj?.labelAr}" من ملفك الشخصي.`
      ),
    });
  };

  // Filter skills for Add Skill dialog
  const availableSkillsToAdd = useMemo(() => {
    return allSkillsList
      .filter((s) => !userSkills.includes(s.id))
      .filter((s) => {
        if (!skillSearchQuery.trim()) return true;
        const q = skillSearchQuery.toLowerCase();
        return s.label.toLowerCase().includes(q) || s.labelAr.includes(q);
      });
  }, [userSkills, skillSearchQuery]);

  const RoleIcon = ROLE_ICONS[currentRole.icon] ?? Target;
  const eduInfo = onboardingAnswers.educationLevel
    ? EDUCATION_MAP[onboardingAnswers.educationLevel]
    : EDUCATION_MAP.bachelors;

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 space-y-8">
      {/* Top Breadcrumb Link */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("home")}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          {isRTL ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          <span>{L("Back to Dashboard", "العودة للرئيسية")}</span>
        </button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("onboarding")}
          className="gap-1.5 text-xs rounded-xl"
        >
          <RotateCcw className="w-3.5 h-3.5 text-primary" />
          <span>{L("Retake Onboarding", "إعادة إعداد المسار")}</span>
        </Button>
      </div>

      {/* Hero Profile Card */}
      <Card className="rounded-2xl border-border/70 bg-card/85 backdrop-blur-md shadow-sm overflow-hidden p-0">
        <div className="h-28 sm:h-36 bg-gradient-to-r from-primary/20 via-neon-violet-500/15 to-thistle-200/40 relative">
          <div className="absolute top-4 end-4 flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setEditName(user?.name ?? "");
                setEditEmail(user?.email ?? "");
                setIsEditProfileOpen(true);
              }}
              className="gap-1.5 text-xs font-semibold rounded-xl bg-background/85 backdrop-blur-sm hover:bg-background shadow-xs"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{L("Edit Profile", "تعديل الملف")}</span>
            </Button>
          </div>
        </div>

        <div className="px-6 pb-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 sm:-mt-14 mb-6">
            <div className="flex items-end gap-4">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-primary via-neon-violet-600 to-thistle-600 text-primary-foreground flex items-center justify-center font-extrabold text-3xl sm:text-4xl shadow-md border-4 border-card shrink-0">
                {user?.name ? user.name.charAt(0).toUpperCase() : "M"}
              </div>
              <div className="pb-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                    {user?.name ?? L("Student", "الطالب")}
                  </h1>
                  <Badge variant="secondary" className="text-xs px-2 py-0.5 font-medium bg-primary/10 text-primary border-primary/20">
                    <Sparkles className="w-3 h-3 me-1" />
                    {L("Active Learner", "متعلّم نشط")}
                  </Badge>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
                  <Mail className="w-3.5 h-3.5" />
                  <span>{user?.email ?? "student@mastery.com"}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="px-3 py-1 text-xs font-semibold border-border">
                <Compass className="w-3.5 h-3.5 me-1.5 text-primary" />
                {L("Target", "المسار")}: {locale === "ar" ? currentRole.labelAr : currentRole.label}
              </Badge>
            </div>
          </div>

          {/* Key Metrics Overview Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
            <div className="p-3.5 rounded-xl border border-border/60 bg-muted/20 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <div className="text-lg font-bold text-foreground">{formatNumber(enrolledCourseIds.length)}</div>
                <div className="text-xs text-muted-foreground">{L("Enrolled Courses", "الكورسات المشترك بها")}</div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-border/60 bg-muted/20 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-success/15 text-success flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-lg font-bold text-foreground">{formatNumber(completedCoursesCount)}</div>
                <div className="text-xs text-muted-foreground">{L("Completed Courses", "الكورسات المكتملة")}</div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-border/60 bg-muted/20 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gold/15 text-gold flex items-center justify-center shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <div className="text-lg font-bold text-foreground">{formatNumber(certificates.length)}</div>
                <div className="text-xs text-muted-foreground">{L("Certificates Earned", "الشهادات المكتسبة")}</div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-border/60 bg-muted/20 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-lg font-bold text-foreground flex items-center gap-1">
                  <span>{readinessPercent}%</span>
                  <span className="text-[10px] font-normal text-muted-foreground">
                    ({acquiredRoleSkills.length}/{roleSkills.length})
                  </span>
                </div>
                <div className="text-xs text-muted-foreground truncate">{L("Role Readiness", "الجاهزية للمسار")}</div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Target Field & Career Readiness Banner */}
      <Card className="rounded-2xl border-border/70 bg-gradient-to-br from-card via-card to-primary/5 shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-sm shadow-primary/25">
              <RoleIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {L("Target Field / Career Track", "المجال المستهدف / المسار المهني")}
                </span>
                <Badge className="bg-primary/15 text-primary border-primary/20 text-xs">
                  {readinessPercent}% {L("Prepared", "جاهزية")}
                </Badge>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-foreground mt-0.5">
                {locale === "ar" ? currentRole.labelAr : currentRole.label}
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-xl">
                {L(
                  `You have acquired ${acquiredRoleSkills.length} of ${roleSkills.length} essential competencies for this profession.`,
                  `اكتسبت ${acquiredRoleSkills.length} من أصل ${roleSkills.length} مهارات أساسية مطلوبة لهذا التخصص.`
                )}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsChangeRoleOpen(true)}
              className="gap-1.5 rounded-xl"
            >
              <Compass className="w-4 h-4 text-primary" />
              <span>{L("Change Target Field", "تغيير المجال المستهدف")}</span>
            </Button>
            <Button
              size="sm"
              onClick={() => navigate("ai-planner")}
              className="gap-1.5 rounded-xl shadow-xs"
            >
              <Sparkles className="w-4 h-4" />
              <span>{L("Build AI Study Plan", "إنشاء خطة دراسية")}</span>
            </Button>
          </div>
        </div>

        {/* Readiness Progress Bar */}
        <div className="mt-5 pt-4 border-t border-border/60">
          <div className="flex items-center justify-between text-xs font-medium text-muted-foreground mb-1.5">
            <span>{L("Core Competencies Acquired", "المهارات المكتسبة للمجال")}</span>
            <span className="font-bold text-foreground">{readinessPercent}%</span>
          </div>
          <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-neon-violet-500 rounded-full transition-all duration-500"
              style={{ width: `${readinessPercent}%` }}
            />
          </div>
        </div>
      </Card>

      {/* Skills Analysis Section: Current Skills vs. Gap Skills */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Card 1: Current Skills ("Their Skills") */}
        <Card className="rounded-2xl border-border/70 bg-card shadow-sm flex flex-col p-6">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-success/15 text-success flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-base text-foreground">
                  {L("My Acquired Skills", "مهاراتي الحالية")}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {L(
                    `${userSkills.length} competencies registered in your profile`,
                    `لديك ${userSkills.length} مهارات مسجلة في ملفك`
                  )}
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddSkillOpen(true)}
              className="h-8 gap-1 text-xs rounded-lg border-primary/30 text-primary hover:bg-primary/10"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{L("Add Skill", "إضافة مهارة")}</span>
            </Button>
          </div>

          <Separator className="mb-4" />

          {userSkills.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-muted/20 rounded-xl border border-dashed border-border">
              <Zap className="w-8 h-8 text-muted-foreground mb-2" />
              <p className="text-sm font-medium text-foreground">{L("No skills added yet", "لم يتم إضافة مهارات بعد")}</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                {L("Add skills you already possess to refine your learning recommendations.", "أضف المهارات التي تتقنها بالفعل لضبط التوصيات.")}
              </p>
              <Button size="sm" onClick={() => setIsAddSkillOpen(true)} className="mt-3 gap-1 text-xs rounded-xl">
                <Plus className="w-3.5 h-3.5" /> {L("Add My First Skill", "أضف مهاراتي الآن")}
              </Button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 flex-1 content-start">
              {userSkills.map((skillId) => {
                const sObj = getSkill(skillId);
                const isPartofTargetRole = roleSkills.includes(skillId);
                return (
                  <div
                    key={skillId}
                    className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all group",
                      isPartofTargetRole
                        ? "bg-primary/10 border-primary/30 text-primary"
                        : "bg-muted/40 border-border text-foreground hover:bg-muted"
                    )}
                  >
                    <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>{sObj ? (locale === "ar" ? sObj.labelAr : sObj.label) : skillId}</span>
                    <button
                      onClick={() => handleRemoveSkill(skillId)}
                      className="opacity-40 hover:opacity-100 hover:text-destructive transition-opacity ms-1"
                      title={L("Remove skill", "حذف المهارة")}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Card 2: Gap Skills (Skills to Acquire) */}
        <Card className="rounded-2xl border-border/70 bg-card shadow-sm flex flex-col p-6">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gold/15 text-gold flex items-center justify-center">
                <Target className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-base text-foreground">
                  {L("Gap Skills to Master", "فجوة المهارات المطلوبة")}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {L(
                    `${gapSkillIds.length} skills needed to reach 100% readiness`,
                    `باقي ${gapSkillIds.length} مهارات للوصول للجاهزية الكاملة`
                  )}
                </p>
              </div>
            </div>

            <Badge variant="secondary" className="text-[11px] font-bold bg-gold/15 text-gold border-gold/30">
              {gapSkillIds.length} {L("Remaining", "متبقية")}
            </Badge>
          </div>

          <Separator className="mb-4" />

          {gapSkillIds.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-success/5 rounded-xl border border-success/30">
              <Sparkles className="w-10 h-10 text-success mb-2 animate-bounce" />
              <h4 className="text-sm font-bold text-foreground">
                {L("All Core Skills Mastered! 🎉", "أتقنت جميع المهارات الأساسية! 🎉")}
              </h4>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                {L(
                  `You have acquired all essential competencies for ${currentRole.label}. You are well-positioned for career advancement.`,
                  `لقد أتقنت جميع متطلبات التخصص لـ ${currentRole.labelAr}. أنت مستعد للانطلاق في سوق العمل.`
                )}
              </p>
            </div>
          ) : (
            <div className="space-y-3 flex-1">
              {gapSkillIds.map((skillId) => {
                const sObj = getSkill(skillId);
                const skillLabel = sObj ? (locale === "ar" ? sObj.labelAr : sObj.label) : skillId;
                // Find a matching course teaching this skill
                const relatedCourse = gapCourses.find((c) =>
                  c.skills.includes(sObj?.label ?? "") || c.skillsAr?.includes(sObj?.labelAr ?? "")
                ) ?? gapCourses[0];

                return (
                  <div
                    key={skillId}
                    className="p-3 rounded-xl border border-border/60 bg-muted/15 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:border-primary/40 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-gold/15 text-gold flex items-center justify-center shrink-0">
                        <AlertCircle className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs sm:text-sm font-semibold text-foreground">
                          {skillLabel}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {L("Essential for", "مطلوبة لتخصص")}{" "}
                          {locale === "ar" ? currentRole.labelAr : currentRole.label}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                      {relatedCourse && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate("course-landing", { courseId: relatedCourse.id })}
                          className="h-7 text-xs text-primary hover:bg-primary/10 px-2"
                        >
                          {L("Find Course", "عرض الكورس")}
                        </Button>
                      )}
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleMarkSkillAcquired(skillId)}
                        className="h-7 text-xs gap-1 rounded-lg bg-primary/15 text-primary hover:bg-primary/25 font-semibold"
                      >
                        <Check className="w-3 h-3" />
                        <span>{L("Mark as Acquired", "أتقنتها")}</span>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Onboarding Preferences & Learning Data Summary */}
      <Card className="rounded-2xl border-border/70 bg-card shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-foreground">
                {L("Onboarding Profile & Learning Preferences", "بيانات التسجيل وتفضيلات التعلّم")}
              </h3>
              <p className="text-xs text-muted-foreground">
                {L("Information entered during initial platform setup", "البيانات التي تم إدخالها أثناء الإعداد الأولي")}
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("onboarding")}
            className="text-xs text-primary hover:bg-primary/10 gap-1 rounded-lg"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{L("Update Preferences", "تعديل التفضيلات")}</span>
          </Button>
        </div>

        <Separator className="mb-5" />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Motivation / Intent */}
          <div className="p-4 rounded-xl border border-border/50 bg-muted/20">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              {L("Primary Goal", "الهدف الأساسي")}
            </span>
            <div className="text-sm font-bold text-foreground mt-1">
              {onboardingAnswers.intent === "improve"
                ? L("Skill Improvement in Role", "تطوير المهارات بالوظيفة")
                : L("Career Switch / New Field", "تعلّم مجال جديد كلياً")}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {onboardingAnswers.intent === "improve"
                ? L("Focus on advanced concepts and productivity", "التركيز على المهارات العملية المتقدمة")
                : L("Guided roadmap from fundamentals up", "منهج تدريجي من الصفر للاحتراف")}
            </p>
          </div>

          {/* Target Role */}
          <div className="p-4 rounded-xl border border-border/50 bg-muted/20">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              {L("Target Role", "المسار المهني")}
            </span>
            <div className="text-sm font-bold text-foreground mt-1 flex items-center gap-1.5">
              <RoleIcon className="w-4 h-4 text-primary" />
              <span>{locale === "ar" ? currentRole.labelAr : currentRole.label}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {currentRole.skillIds.length} {L("competencies required", "مهارات مطلوبة")}
            </p>
          </div>

          {/* Educational Background */}
          <div className="p-4 rounded-xl border border-border/50 bg-muted/20">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              {L("Education Level", "المستوى التعليمي")}
            </span>
            <div className="text-sm font-bold text-foreground mt-1 flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-primary" />
              <span>{locale === "ar" ? eduInfo.ar : eduInfo.en}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {locale === "ar" ? eduInfo.descAr : eduInfo.descEn}
            </p>
          </div>

          {/* Learning Commitment */}
          <div className="p-4 rounded-xl border border-border/50 bg-muted/20">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              {L("Study Commitment", "الالتزام الأسبوعي")}
            </span>
            <div className="text-sm font-bold text-foreground mt-1">
              {L("6 - 8 Hours / week", "6 إلى 8 ساعات أسبوعياً")}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {L("Structured for steady, consistent progress", "وتيرة منتظمة ومتوازنة")}
            </p>
          </div>
        </div>
      </Card>

      {/* Recommended Courses to Bridge Gap Skills */}
      {gapCourses.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <span>{L("Recommended Courses for Your Gap Skills", "كورسات مقترحة لتغطية فجواتك")}</span>
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {L(
                  `Curated specifically for mastering ${locale === "ar" ? currentRole.labelAr : currentRole.label}`,
                  `تم اختيارها خصيصاً لمساعدتك على احتراف ${locale === "ar" ? currentRole.labelAr : currentRole.label}`
                )}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("search")}
              className="text-xs rounded-xl"
            >
              {L("Browse Catalog", "تصفح الكتالوج")}
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {gapCourses.slice(0, 4).map((course) => {
              const isEnrolled = enrolledCourseIds.includes(course.id);
              const courseTitle = locale === "ar" ? course.titleAr : course.title;
              return (
                <div
                  key={course.id}
                  onClick={() => navigate("course-landing", { courseId: course.id })}
                  className="group rounded-xl border border-border/60 bg-card overflow-hidden cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col"
                >
                  <CourseThumb course={course} />
                  <div className="p-3.5 flex-1 flex flex-col justify-between">
                    <div>
                      <Badge variant="secondary" className="text-[10px] font-semibold uppercase mb-1">
                        {locale === "ar" ? course.categoryAr : course.category}
                      </Badge>
                      <h4 className="text-sm font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                        {courseTitle}
                      </h4>
                    </div>
                    <div className="mt-3 pt-2 border-t border-border/50 flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground">
                        {isEnrolled ? (
                          <span className="text-success flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> {L("Enrolled", "مشترك")}
                          </span>
                        ) : (
                          `$${course.price}`
                        )}
                      </span>
                      <span className="text-[11px] text-primary font-medium group-hover:underline">
                        {L("View Course", "التفاصيل")}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* DIALOG 1: Edit Profile Name & Email */}
      {/* ========================================================= */}
      <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>{L("Edit Student Profile", "تعديل بيانات الطالب")}</DialogTitle>
            <DialogDescription>
              {L("Update your name and communication email address.", "حدّث اسمك وعنوان بريدك الإلكتروني.")}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveProfile} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="name">{L("Full Name", "الاسم الكامل")}</Label>
              <Input
                id="name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder={L("e.g. Layla Hassan", "مثال: ليلى حسن")}
                required
                className="rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">{L("Email Address", "البريد الإلكتروني")}</Label>
              <Input
                id="email"
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                placeholder="student@example.com"
                required
                className="rounded-xl"
              />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsEditProfileOpen(false)} className="rounded-xl">
                {L("Cancel", "إلغاء")}
              </Button>
              <Button type="submit" className="rounded-xl">
                {L("Save Changes", "حفظ التغييرات")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ========================================================= */}
      {/* DIALOG 2: Change Target Field / Role */}
      {/* ========================================================= */}
      <Dialog open={isChangeRoleOpen} onOpenChange={setIsChangeRoleOpen}>
        <DialogContent className="sm:max-w-xl rounded-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{L("Select Target Field", "اختيار المجال المستهدف")}</DialogTitle>
            <DialogDescription>
              {L(
                "Choose the professional role you want to prepare for. Your skill gap and recommendations will update automatically.",
                "اختر المسار المهني الذي تهدف إليه وسيتم تحديث فجوة المهارات والتوصيات فوراً."
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-3">
            {roles.map((r) => {
              const IconComp = ROLE_ICONS[r.icon] ?? Target;
              const isSelected = r.id === currentRoleId;
              return (
                <button
                  key={r.id}
                  onClick={() => handleSelectRole(r.id)}
                  className={cn(
                    "p-3.5 rounded-xl border text-start flex items-start gap-3 transition-all",
                    isSelected
                      ? "border-primary bg-primary/10 ring-2 ring-primary/20 shadow-xs"
                      : "border-border/60 hover:bg-muted/40"
                  )}
                >
                  <div className={cn(
                    "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                    isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  )}>
                    <IconComp className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold text-foreground">
                      {locale === "ar" ? r.labelAr : r.label}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {r.skillIds.length} {L("required skills", "مهارات مطلوبة")}
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-primary shrink-0 ms-1" />}
                </button>
              );
            })}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsChangeRoleOpen(false)} className="rounded-xl w-full sm:w-auto">
              {L("Close", "إغلاق")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========================================================= */}
      {/* DIALOG 3: Add New Skill to Profile */}
      {/* ========================================================= */}
      <Dialog open={isAddSkillOpen} onOpenChange={setIsAddSkillOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{L("Add Skill to Your Profile", "إضافة مهارة إلى ملفك")}</DialogTitle>
            <DialogDescription>
              {L("Search and add skills you have already acquired.", "ابحث وأضف المهارات التي تتقنها بالفعل.")}
            </DialogDescription>
          </DialogHeader>

          {/* Search input */}
          <div className="relative my-2">
            <Search className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={skillSearchQuery}
              onChange={(e) => setSkillSearchQuery(e.target.value)}
              placeholder={L("Search skills (e.g. React, Python, Figma)...", "ابحث عن مهارة (مثل رياكت، بايثون، فيجما)...")}
              className="ps-9 rounded-xl"
            />
          </div>

          <div className="overflow-y-auto flex-1 max-h-64 py-2 space-y-1">
            {availableSkillsToAdd.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">
                {L("No matching skills found or all skills added.", "لا توجد نتائج مطابقة أو تم إضافة كافة المهارات.")}
              </p>
            ) : (
              availableSkillsToAdd.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleAddSkill(s.id)}
                  className="w-full px-3 py-2 rounded-xl text-start hover:bg-accent/60 flex items-center justify-between text-xs sm:text-sm font-medium transition-colors"
                >
                  <span>{locale === "ar" ? s.labelAr : s.label}</span>
                  <Plus className="w-4 h-4 text-primary" />
                </button>
              ))
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button variant="outline" onClick={() => setIsAddSkillOpen(false)} className="rounded-xl w-full sm:w-auto">
              {L("Done", "تم")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
