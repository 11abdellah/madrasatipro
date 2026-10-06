"use client";

import React, { useState, useEffect } from "react";
import {
  GraduationCap,
  Users,
  BookOpen,
  Wallet,
  TrendingDown,
  TrendingUp,
  Sparkles,
  Plus,
  ArrowUpRight,
  Layers,
  Receipt,
  FileSpreadsheet,
  Activity,
  Calendar,
} from "lucide-react";
import { StatCard } from "./StatCard";
import { TopTeachersCard } from "./TopTeachersCard";
import { UpcomingClassesCard } from "./UpcomingClassesCard";
import { UpgradePlanModal } from "@/components/subscription/UpgradePlanModal";
import { formatDateAlgiers, formatDZD, getAlgiersTodayStr } from "@/lib/utils";
import { Locale } from "@/types";

interface DashboardViewProps {
  locale: Locale;
  userName?: string;
  onNavigateTab: (tab: string) => void;
  onSelectStudent?: (id: string) => void;
  onSelectTeacher?: (id: string) => void;
  onOpenAddStudent?: () => void;
  onOpenAddTeacher?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  locale,
  userName,
  onNavigateTab,
  onSelectTeacher,
  onOpenAddStudent,
  onOpenAddTeacher,
}) => {
  const isRTL = locale === "ar";
  const [stats, setStats] = useState<{
    totalStudents: number;
    activeTeachers: number;
    totalGroups: number;
    monthlyRevenue: number;
    monthlyExpenses: number;
    monthlyPayrollExpenses: number;
    monthlySideExpenses: number;
    netMonthlyProfit: number;
    totalBilled: number;
    totalCollected: number;
    dueDebts: number;
    todayAttendanceRate: number;
    todaySessionsCount: number;
    upcomingSessions: any[];
    topTeachers: any[];
    recentActivities: any[];
    subscriptionContext?: any;
    currentMonth?: string;
  }>({
    totalStudents: 0,
    activeTeachers: 0,
    totalGroups: 0,
    monthlyRevenue: 0,
    monthlyExpenses: 0,
    monthlyPayrollExpenses: 0,
    monthlySideExpenses: 0,
    netMonthlyProfit: 0,
    totalBilled: 0,
    totalCollected: 0,
    dueDebts: 0,
    todayAttendanceRate: 0,
    todaySessionsCount: 0,
    upcomingSessions: [],
    topTeachers: [],
    recentActivities: [],
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/dashboard/stats");
      const data = await res.json();
      if (data && !data.error) {
        setStats(data);
      }
    } catch (err) {
      console.error("Dashboard stats fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const sub = stats.subscriptionContext;
  const todayStr = formatDateAlgiers(getAlgiersTodayStr(), true);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Top Welcome Title & Algerian Date Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>{isRTL ? `مرحباً بك${userName ? `، ${userName}` : ""}` : `Welcome${userName ? `, ${userName}` : ""}`}</span>
            <span className="inline-block animate-pulse">👋</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            {isRTL
              ? "لوحة التحكم المركزية — نظرة عامة ومؤشرات حية لمؤسستك التعليمية."
              : "Central Dashboard — Live overview and key performance metrics of your school."}
          </p>
        </div>

        {/* Date & Quick Status */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-slate-700 shadow-sm flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-indigo-600" />
            <span>{todayStr}</span>
          </span>
        </div>
      </div>

      {/* Quick Actions Panel */}
      <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200/80 shadow-sm flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 text-xs font-extrabold text-slate-700">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>{isRTL ? "إجراءات سريعة:" : "Quick Actions:"}</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => (onOpenAddStudent ? onOpenAddStudent() : onNavigateTab("students"))}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isRTL ? "إضافة طالب" : "Add Student"}</span>
          </button>

          <button
            onClick={() => (onOpenAddTeacher ? onOpenAddTeacher() : onNavigateTab("teachers"))}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isRTL ? "إضافة أستاذ" : "Add Teacher"}</span>
          </button>

          <button
            onClick={() => onNavigateTab("classes")}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-sky-50 text-sky-700 hover:bg-sky-100 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isRTL ? "إنشاء فوج" : "New Group"}</span>
          </button>

          <button
            onClick={() => onNavigateTab("finance")}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors"
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>{isRTL ? "تسجيل دفعة" : "Record Payment"}</span>
          </button>

          <button
            onClick={() => onNavigateTab("finance")}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors"
          >
            <TrendingDown className="w-3.5 h-3.5" />
            <span>{isRTL ? "إضافة مصروف" : "Add Expense"}</span>
          </button>
        </div>
      </div>

      {/* Top 6 KPI Pastel Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* 1. Total Students */}
        <StatCard
          title={isRTL ? "إجمالي الطلاب" : "Total Students"}
          value={stats.totalStudents}
          trendText={stats.totalStudents > 0 ? (isRTL ? "تلميذ مسجل" : "Enrolled") : (isRTL ? "0 مسجل" : "0 Students")}
          icon={GraduationCap}
          variant="purple"
          watermarkType="cap"
        />

        {/* 2. Active Teachers */}
        <StatCard
          title={isRTL ? "الأساتذة النشطون" : "Active Teachers"}
          value={stats.activeTeachers}
          trendText={stats.activeTeachers > 0 ? (isRTL ? "أستاذ معتمد" : "Teachers") : (isRTL ? "0 أستاذ" : "0 Teachers")}
          icon={Users}
          variant="mint"
          watermarkType="teachers"
        />

        {/* 3. Class Groups */}
        <StatCard
          title={isRTL ? "الأفواج الدراسية" : "Class Groups"}
          value={stats.totalGroups}
          trendText={stats.totalGroups > 0 ? (isRTL ? "فوج دراسي" : "Groups") : (isRTL ? "0 فوج" : "0 Groups")}
          icon={BookOpen}
          variant="sky"
          watermarkType="book"
        />

        {/* 4. Monthly Revenue */}
        <StatCard
          title={isRTL ? "مداخيل الشهر" : "Monthly Revenue"}
          value={formatDZD(stats.monthlyRevenue)}
          trendText={stats.monthlyRevenue > 0 ? (isRTL ? "مدفوعات محصلة" : "Collected") : (isRTL ? "0 دج محصلة" : "0 DZD")}
          icon={Wallet}
          variant="emerald"
          watermarkType="coins"
        />

        {/* 5. Monthly Expenses */}
        <StatCard
          title={isRTL ? "مصاريف الشهر" : "Monthly Expenses"}
          value={formatDZD(stats.monthlyExpenses)}
          trendText={stats.monthlyExpenses > 0 ? (isRTL ? "رواتب ومصاريف" : "Expenses") : (isRTL ? "0 دج مصاريف" : "0 DZD")}
          icon={TrendingDown}
          variant="rose"
          watermarkType="coins"
        />

        {/* 6. Net Result */}
        <StatCard
          title={isRTL ? "النتيجة الصافية" : "Net Result"}
          value={formatDZD(stats.netMonthlyProfit)}
          trendText={
            stats.netMonthlyProfit >= 0
              ? isRTL ? "فائض إيجابي" : "Net Profit"
              : isRTL ? "عجز مؤقت" : "Net Deficit"
          }
          icon={TrendingUp}
          variant="indigo"
          watermarkType="coins"
        />
      </div>

      {/* Main Content Layout: Left 8 Columns (Financial Overview + Classes + Teachers) / Right 4 Columns (Subscription + Activity) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          {/* Financial Breakdown Card */}
          <div className="bg-white rounded-3xl p-5 md:p-6 border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-indigo-600" />
                  <span>{isRTL ? "الملخص المالي لشهر" : "Financial Summary"} {stats.currentMonth || ""}</span>
                </h3>
                <p className="text-xs text-slate-500">
                  {isRTL
                    ? "تتبع مباشر للتحصيلات مقابل رواتب الأساتذة والمصاريف الجانبية"
                    : "Direct tracking of collections vs teacher salaries and side expenses"}
                </p>
              </div>

              <button
                onClick={() => onNavigateTab("finance")}
                className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 self-start sm:self-auto"
              >
                <span>{isRTL ? "التفاصيل المالية الكاملة" : "Full Finance Details"}</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Financial 4-Pill Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-3">
                <span className="text-[11px] font-bold text-emerald-800 block">
                  {isRTL ? "المدفوعات المحصلة" : "Collected Revenue"}
                </span>
                <span className="text-base font-black text-emerald-900 mt-1 block">
                  {formatDZD(stats.monthlyRevenue)}
                </span>
              </div>

              <div className="bg-amber-50/70 border border-amber-100 rounded-2xl p-3">
                <span className="text-[11px] font-bold text-amber-800 block">
                  {isRTL ? "رواتب الأساتذة" : "Teacher Salaries"}
                </span>
                <span className="text-base font-black text-amber-900 mt-1 block">
                  {formatDZD(stats.monthlyPayrollExpenses)}
                </span>
              </div>

              <div className="bg-rose-50/70 border border-rose-100 rounded-2xl p-3">
                <span className="text-[11px] font-bold text-rose-800 block">
                  {isRTL ? "المصاريف الجانبية" : "Side Expenses"}
                </span>
                <span className="text-base font-black text-rose-900 mt-1 block">
                  {formatDZD(stats.monthlySideExpenses)}
                </span>
              </div>

              <div
                className={`border rounded-2xl p-3 ${
                  stats.netMonthlyProfit >= 0
                    ? "bg-indigo-50/70 border-indigo-100 text-indigo-900"
                    : "bg-red-50/70 border-red-100 text-red-900"
                }`}
              >
                <span className="text-[11px] font-bold block">
                  {isRTL ? "الصافي المالي" : "Net Balance"}
                </span>
                <span className="text-base font-black mt-1 block">
                  {formatDZD(stats.netMonthlyProfit)}
                </span>
              </div>
            </div>

            {/* All-time due debt indicator if any */}
            {stats.dueDebts > 0 && (
              <div className="flex items-center justify-between text-xs bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2.5">
                <span className="text-slate-600 font-medium">
                  {isRTL ? "إجمالي الديون المعلقة غير المحصلة (فواتير):" : "Unpaid debts:"}
                </span>
                <span className="font-extrabold text-rose-600">
                  {formatDZD(stats.dueDebts)}
                </span>
              </div>
            )}
          </div>

          {/* Top Teachers & Upcoming Classes side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <TopTeachersCard
              locale={locale}
              teachers={stats.topTeachers || []}
              onSelectTeacher={(id) => {
                onSelectTeacher?.(id);
                onNavigateTab("teachers");
              }}
            />

            <UpcomingClassesCard
              locale={locale}
              sessions={stats.upcomingSessions || []}
              onOpenSession={() => onNavigateTab("attendance")}
            />
          </div>
        </div>

        {/* Right Column (4 cols): Subscription Plan Card + Recent Activities */}
        <div className="lg:col-span-4 space-y-5">
          {/* Subscription Limits & Usage Card */}
          {sub && (
            <div className="bg-white rounded-3xl p-5 md:p-6 border border-slate-200/90 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900">{sub.plan.name}</h4>
                    <span className="text-[10px] text-slate-500 font-medium">
                      {sub.plan.priceDZD === 0 ? "مجانية (Free Trial)" : `${formatDZD(sub.plan.priceDZD)} / شهر`}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setIsUpgradeOpen(true)}
                  className="px-3 py-1 rounded-full text-xs font-extrabold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all"
                >
                  {isRTL ? "ترقية الخطة" : "Upgrade"}
                </button>
              </div>

              {/* Progress Bars */}
              <div className="space-y-3 pt-2">
                {/* Students Progress */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>{isRTL ? "حد التلاميذ" : "Students"}</span>
                    <span className="font-mono text-indigo-700 font-extrabold">
                      {sub.usage.students} / {sub.limits.students}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, sub.percentages.students)}%` }}
                    />
                  </div>
                </div>

                {/* Teachers Progress */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>{isRTL ? "حد الأساتذة" : "Teachers"}</span>
                    <span className="font-mono text-emerald-700 font-extrabold">
                      {sub.usage.teachers} / {sub.limits.teachers}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, sub.percentages.teachers)}%` }}
                    />
                  </div>
                </div>

                {/* Groups Progress */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>{isRTL ? "حد الأفواج" : "Groups"}</span>
                    <span className="font-mono text-amber-600 font-extrabold">
                      {sub.usage.groups} / {sub.limits.groups}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, sub.percentages.groups)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Recent Activities Audit Log Card */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h4 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-indigo-600" />
                <span>{isRTL ? "آخر العمليات والنشاطات" : "Recent Activities"}</span>
              </h4>
              <span className="text-[10px] text-slate-400 font-medium">مباشر</span>
            </div>

            {stats.recentActivities && stats.recentActivities.length > 0 ? (
              <div className="space-y-2.5">
                {stats.recentActivities.map((act) => (
                  <div
                    key={act.id}
                    className="flex items-start gap-2.5 text-xs p-2 rounded-xl bg-slate-50/70 border border-slate-100"
                  >
                    <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-slate-800 truncate">
                        {act.action === "STUDENT_CREATED" && "تسجيل طالب جديد"}
                        {act.action === "STUDENT_UPDATED" && "تحديث بيانات طالب"}
                        {act.action === "STUDENT_DELETED" && "حذف طالب"}
                        {act.action === "TEACHER_CREATED" && "إضافة أستاذ جديد"}
                        {act.action === "TEACHER_SALARY_PAID" && "صرف راتب أستاذ"}
                        {act.action === "EXPENSE_CREATED" && "تسجيل مصروف"}
                        {act.action === "PAYMENT_RECORDED" && "استلام دفعة مالية"}
                        {![
                          "STUDENT_CREATED",
                          "STUDENT_UPDATED",
                          "STUDENT_DELETED",
                          "TEACHER_CREATED",
                          "TEACHER_SALARY_PAID",
                          "EXPENSE_CREATED",
                          "PAYMENT_RECORDED",
                        ].includes(act.action) && act.action}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {act.details ? act.details.replace(/[{}"]/g, " ") : act.entity}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-slate-400">
                {isRTL ? "لا توجد نشاطات مسجلة بعد" : "No recent activity yet"}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upgrade Plan Modal */}
      <UpgradePlanModal
        isOpen={isUpgradeOpen}
        onClose={() => setIsUpgradeOpen(false)}
        currentPlanSlug={sub?.plan?.slug || "free"}
        usage={sub?.usage}
      />
    </div>
  );
};
