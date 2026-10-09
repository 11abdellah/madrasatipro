"use client";

import React, { useState, useEffect } from "react";
import { AppHeader } from "@/components/layout/AppHeader";
import { DashboardView } from "@/components/dashboard/DashboardView";
import { StudentsView } from "@/components/students/StudentsView";
import { TeachersView } from "@/components/teachers/TeachersView";
import { ClassesView } from "@/components/classes/ClassesView";
import { ClassroomsView } from "@/components/classrooms/ClassroomsView";
import { TimetableView } from "@/components/classes/TimetableView";
import { AttendanceView } from "@/components/attendance/AttendanceView";
import { FinanceView } from "@/components/finance/FinanceView";
import { SettingsView } from "@/components/settings/SettingsView";
import { AddStudentModal } from "@/components/students/AddStudentModal";
import { StudentDetailDrawer } from "@/components/students/StudentDetailDrawer";
import { StudentCardModal } from "@/components/students/StudentCardModal";
import { QuickSearchModal } from "@/components/layout/QuickSearchModal";
import { NotificationPanel } from "@/components/layout/NotificationPanel";
import { Locale, Student } from "@/types";
import { ALGERIAN_WILAYAS } from "@/lib/constants/algeria";
import { ArrowRight, ShieldCheck, AlertTriangle } from "lucide-react";

export default function DashboardPage() {
  const [currentTab, setCurrentTab] = useState("dashboard");
  const [locale, setLocale] = useState<Locale>("ar");

  // Modals & Panels state
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [cardStudentId, setCardStudentId] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [refreshStudentsKey, setRefreshStudentsKey] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Tenant / Auth info
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isSuspended, setIsSuspended] = useState(false);
  const [tenantInfo, setTenantInfo] = useState<{
    institutionId: string;
    name: string;
    wilaya: string;
    adminName: string;
    brandColor?: string;
    logoUrl?: string | null;
  }>({
    institutionId: "",
    name: "",
    wilaya: "",
    adminName: "",
    logoUrl: null,
  });

  const isRTL = locale === "ar";

  const fetchAuthInfo = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (!res.ok) {
        window.location.href = "/login";
        return;
      }
      const data = await res.json();

      if (!data.authenticated) {
        window.location.href = "/login";
        return;
      }

      // If pending approval, redirect to status page
      if (data.institution?.status === "PENDING_APPROVAL") {
        window.location.href = "/pending-approval";
        return;
      }

      if (data.institution?.status === "SUSPENDED") {
        setIsSuspended(true);
      }

      setIsSuperAdmin(Boolean(data.isSuperAdmin || data.session?.role === "SUPER_ADMIN"));

      if (data.institution) {
        const wilaya = ALGERIAN_WILAYAS.find((w) => w.code === data.institution.wilayaCode)?.nameAr || `ولاية ${data.institution.wilayaCode}`;
        setTenantInfo({
          institutionId: data.institution.id,
          name: data.institution.name || "",
          wilaya,
          adminName: data.user?.fullName || "",
          brandColor: data.institution.brandColor,
          logoUrl: data.institution.logoUrl || null,
        });
      }
    } catch (e) {
      console.error("Failed to fetch tenant info:", e);
    }
  };

  useEffect(() => {
    fetchAuthInfo();
  }, []);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSelectStudentById = async (id: string) => {
    try {
      const res = await fetch(`/api/students/${id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.student) {
          const s = data.student;
          setSelectedStudent({
            id: s.id,
            firstName: s.firstName,
            lastName: s.lastName,
            dateOfBirth: s.dateOfBirth || "2007-01-01",
            gender: (s.gender as any) || "male",
            academicLevel: s.academicLevel,
            stream: s.stream || undefined,
            phone: s.phone,
            parentId: s.parentId || "",
            parentName: s.parent?.fullName || "ولي الأمر",
            parentPhone: s.parent?.phone || "0550000000",
            parentRelationship: s.parent?.relationship || "الأب",
            status: (s.status.toLowerCase() as any) || "active",
            groupName: s.enrollments?.[0]?.group?.name || "الفوج العام",
            groupId: s.enrollments?.[0]?.group?.id || "",
            monthlyFee: s.monthlyFee || 3500,
            attendanceRate: 92,
            averageGrade: 14.5,
            totalDue: s.invoices?.[0]?.finalTotal || 0,
            totalPaid: s.invoices?.[0]?.amountPaid || 0,
            balance: (s.invoices?.[0]?.finalTotal || 0) - (s.invoices?.[0]?.amountPaid || 0),
            wilayaCode: s.wilayaCode || 19,
            wilayaName: tenantInfo.wilaya,
            enrollmentDate: s.enrollmentDate || "2026-09-01",
          });
          return;
        }
      }
    } catch (e) {
      console.error("Failed to fetch student details:", e);
    }
  };

  const handleSelectSearchResult = (type: string, id: string) => {
    if (type === "student") {
      handleSelectStudentById(id);
      setCurrentTab("students");
    } else if (type === "teacher") {
      setCurrentTab("teachers");
    }
  };

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="min-h-screen flex flex-col font-sans transition-colors duration-200 bg-[#f8fafc]"
    >
      {/* Super Admin Impersonation / Support Mode Banner */}
      {isSuperAdmin && (
        <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 font-bold px-4 md:px-8 py-2 text-xs flex items-center justify-between shadow-sm border-b border-amber-600/20 sticky top-0 z-50">
          <div className="flex items-center gap-2">
            <span className="bg-slate-950 text-amber-300 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">
              وضع الدعم الفني
            </span>
            <span>
              أنت تتصفح حالياً حساب مؤسسة: <strong className="font-extrabold">{tenantInfo.name}</strong> كمسؤول للمنصة
            </span>
          </div>
          <a
            href="/super-admin"
            className="flex items-center gap-1.5 bg-slate-950 hover:bg-slate-900 text-white px-3 py-1 rounded-full text-[11px] font-extrabold shadow-sm transition"
          >
            <span>العودة للوحة الإدارة العامة Super Admin</span>
            <ArrowRight className="w-3 h-3 rtl:rotate-180" />
          </a>
        </div>
      )}

      {/* Top Floating App Header (Zero Super Admin buttons) */}
      <AppHeader
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        locale={locale}
        onLocaleChange={setLocale}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        institutionName={tenantInfo.name}
        wilayaName={tenantInfo.wilaya}
        adminName={tenantInfo.adminName}
        institutionLogo={tenantInfo.logoUrl}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-[1560px] mx-auto px-4 md:px-8 pt-4 pb-12">
        {isSuspended && !isSuperAdmin ? (
          <div className="flex items-center justify-center py-20 px-4">
            <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-rose-200 shadow-xl text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-black text-slate-900">
                {isRTL ? "تم تعليق حساب المؤسسة" : "Account Suspended"}
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                {isRTL
                  ? "تم تعليق الوصول إلى لوحة تحكم مؤسستك التعليمية مؤقتاً بسبب انتهاء صلاحية الاشتراك أو مراجعة إدارية. يرجى التواصل مع إدارة منصة مدرستي برو لإعادة التفعيل."
                  : "Access to your institution dashboard has been temporarily suspended. Please contact MadrasatiPro support."}
              </p>
              <div className="pt-2 flex flex-col gap-2">
                <a
                  href="mailto:contact@madrasatipro.dz"
                  className="w-full py-3 rounded-2xl bg-[#F47A3C] hover:bg-[#d36128] text-white text-xs font-bold transition shadow-sm"
                >
                  {isRTL ? "التواصل مع الدعم الفني" : "Contact Support"}
                </a>
                <button
                  onClick={async () => {
                    await fetch("/api/auth/logout", { method: "POST" });
                    window.location.href = "/login";
                  }}
                  className="w-full py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
                >
                  {isRTL ? "تسجيل الخروج" : "Log Out"}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {currentTab === "dashboard" && (
              <DashboardView
                locale={locale}
                userName={tenantInfo.adminName}
                onNavigateTab={setCurrentTab}
                onSelectStudent={(id) => handleSelectStudentById(id)}
                onOpenAddStudent={() => setIsAddStudentOpen(true)}
              />
            )}

            {currentTab === "students" && (
              <StudentsView
                locale={locale}
                onOpenAddModal={() => setIsAddStudentOpen(true)}
                onSelectStudent={(stu) => setSelectedStudent(stu)}
                onViewCard={(id) => setCardStudentId(id)}
                refreshKey={refreshStudentsKey}
              />
            )}

            {currentTab === "teachers" && (
              <TeachersView
                locale={locale}
                onOpenTeacherPayroll={() => setCurrentTab("finance")}
              />
            )}

            {currentTab === "classes" && (
              <ClassesView
                locale={locale}
                onNavigateToAttendance={() => setCurrentTab("attendance")}
                onNavigateToTimetable={() => setCurrentTab("timetable")}
              />
            )}

            {currentTab === "classrooms" && <ClassroomsView locale={locale} />}

            {currentTab === "timetable" && <TimetableView locale={locale} />}

            {currentTab === "attendance" && <AttendanceView locale={locale} />}

            {currentTab === "finance" && <FinanceView locale={locale} />}

            {currentTab === "settings" && (
              <SettingsView
                locale={locale}
                onLogoChange={() => fetchAuthInfo()}
              />
            )}
          </>
        )}
      </main>

      {/* 5-Step Add Student Wizard */}
      <AddStudentModal
        isOpen={isAddStudentOpen}
        onClose={() => setIsAddStudentOpen(false)}
        locale={locale}
        onViewCard={(id) => setCardStudentId(id)}
        onSave={(data) => {
          setSelectedStudent(data);
          setRefreshStudentsKey((prev) => prev + 1);
          setToastMessage(`تمت إضافة التلميذ ${data.firstName} ${data.lastName} بنجاح`);
          setTimeout(() => setToastMessage(null), 5000);
          setCurrentTab("students");
        }}
      />

      {/* Student Profile Drawer */}
      <StudentDetailDrawer
        student={selectedStudent}
        isOpen={Boolean(selectedStudent)}
        onClose={() => setSelectedStudent(null)}
        onViewCard={(id) => setCardStudentId(id)}
        locale={locale}
      />

      {/* Student ID Card Modal */}
      <StudentCardModal
        studentId={cardStudentId}
        isOpen={Boolean(cardStudentId)}
        onClose={() => setCardStudentId(null)}
        locale={locale}
      />

      {/* Cmd+K Global Search Modal */}
      <QuickSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        locale={locale}
        onSelectResult={handleSelectSearchResult}
      />

      {/* Slide-out Notification Drawer */}
      <NotificationPanel
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        locale={locale}
      />

      {/* Success Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 bg-emerald-600 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5">
          <div className="w-6 h-6 rounded-full bg-emerald-500/80 flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-bold">✓</span>
          </div>
          <span className="text-xs font-bold">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-white/70 hover:text-white mr-2 text-xs"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
