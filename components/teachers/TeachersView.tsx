"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Phone,
  Mail,
  Clock,
  Wallet,
  CheckCircle,
  Edit2,
  Archive,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { formatDZD } from "@/lib/utils";
import { Locale } from "@/types";
import { AddTeacherModal } from "./AddTeacherModal";
import { EditTeacherModal } from "./EditTeacherModal";
import { ArchiveTeacherDialog } from "./ArchiveTeacherDialog";
import { PayTeacherSalaryModal } from "@/components/finance/PayTeacherSalaryModal";
import { RecordHoursModal } from "./RecordHoursModal";
import { HoursHistoryModal } from "./HoursHistoryModal";

interface TeachersViewProps {
  locale: Locale;
  onOpenTeacherPayroll?: (teacher: any) => void;
}

export const TeachersView: React.FC<TeachersViewProps> = ({
  locale,
  onOpenTeacherPayroll,
}) => {
  const isRTL = locale === "ar";
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ACTIVE");

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<any | null>(null);
  const [archivingTeacher, setArchivingTeacher] = useState<any | null>(null);
  const [payingTeacher, setPayingTeacher] = useState<any | null>(null);
  const [recordingHoursTeacher, setRecordingHoursTeacher] = useState<any | null>(null);
  const [viewingHoursTeacher, setViewingHoursTeacher] = useState<any | null>(null);
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/teachers?status=${statusFilter}&search=${encodeURIComponent(searchTerm)}`);
      const data = await res.json();
      if (data.teachers) {
        setTeachers(data.teachers);
      }
    } catch (err) {
      console.error("Failed to load teachers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTeachers();
  };

  const handleTeacherCreated = (newTeacher: any) => {
    setTeachers((prev) => [newTeacher, ...prev]);
    showToast(isRTL ? "✓ تمت إضافة الأستاذ بنجاح إلى قاعدة البيانات" : "✓ Teacher saved successfully");
  };

  const handleTeacherUpdated = (updated: any) => {
    setTeachers((prev) =>
      prev.map((t) => (t.id === updated.id ? { ...t, ...updated } : t))
    );
    showToast(isRTL ? "✓ تم تحديث بيانات الأستاذ بنجاح" : "✓ Teacher updated successfully");
  };

  const handleTeacherArchived = (id: string) => {
    setTeachers((prev) => prev.filter((t) => t.id !== id));
    showToast(isRTL ? "✓ تمت أرشفة الأستاذ بنجاح" : "✓ Teacher archived");
  };

  // Aggregated Stats from real database records
  const totalTeachersCount = teachers.length;
  const totalCompletedHours = teachers.reduce((acc, t) => acc + (t.completedHoursThisMonth || 0), 0);
  const totalPayrollDue = teachers.reduce((acc, t) => acc + (t.totalDueThisMonth || 0), 0);
  const totalRemainingDue = teachers.reduce((acc, t) => acc + (t.balanceThisMonth || 0), 0);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-slate-950 text-white px-5 py-3 rounded-full text-xs font-bold shadow-2xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-top-4">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {isRTL ? "إدارة هيئة التدريس والأساتذة" : "Faculty & Teachers"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            {isRTL
              ? "متابعة الساعات المنجزة، الأفواج المسندة، وحساب الأتعاب والمستحقات بالدينار الجزائري"
              : "Track completed hours, assigned groups, and teacher payroll calculation in DZD"}
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 bg-slate-950 hover:bg-slate-800 text-white px-5 py-2.5 rounded-full text-xs font-bold shadow-md shadow-slate-950/20 transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>{isRTL ? "+ إضافة أستاذ جديد" : "+ Add Teacher"}</span>
        </button>
      </div>

      {/* Real Aggregated Stats Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <span className="text-[11px] text-slate-500 font-semibold">{isRTL ? "إجمالي الأساتذة النشطين" : "Active Teachers"}</span>
          <p className="text-xl font-extrabold text-slate-900 mt-1">{totalTeachersCount}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <span className="text-[11px] text-slate-500 font-semibold">{isRTL ? "الساعات المنجزة هذا الشهر" : "Completed Hours"}</span>
          <p className="text-xl font-extrabold text-indigo-600 mt-1">{totalCompletedHours} {isRTL ? "ساعة" : "hrs"}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <span className="text-[11px] text-slate-500 font-semibold">{isRTL ? "إجمالي المستحقات" : "Total Payroll"}</span>
          <p className="text-xl font-extrabold text-slate-900 mt-1">{formatDZD(totalPayrollDue, locale)}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <span className="text-[11px] text-slate-500 font-semibold">{isRTL ? "المتبقي للصرف" : "Remaining Due"}</span>
          <p className="text-xl font-extrabold text-rose-600 mt-1">{formatDZD(totalRemainingDue, locale)}</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-[24px] p-4 border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 rtl:right-3.5 ltr:left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={isRTL ? "ابحث بالاسم، المادة، أو رقم الهاتف..." : "Search teacher, subject, phone..."}
            className="w-full bg-slate-50 border border-slate-200 rounded-full py-2 px-9 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
          />
        </form>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-full px-4 py-2 text-xs font-bold text-slate-700 focus:outline-none"
          >
            <option value="ACTIVE">{isRTL ? "الأساتذة النشطون" : "Active"}</option>
            <option value="INACTIVE">{isRTL ? "غير النشطين" : "Inactive"}</option>
            <option value="ARCHIVED">{isRTL ? "الأرشيف" : "Archived"}</option>
            <option value="ALL">{isRTL ? "الجميع" : "All"}</option>
          </select>

          <button
            onClick={fetchTeachers}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-600 transition"
            title="تحديث القائمة"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && teachers.length === 0 && (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          <p className="text-xs font-bold text-slate-500">{isRTL ? "جاري استرجاع بيانات الأساتذة من قاعدة البيانات..." : "Loading teachers from database..."}</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && teachers.length === 0 && (
        <div className="bg-white rounded-[28px] p-12 text-center border border-slate-100 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <Plus className="w-6 h-6" />
          </div>
          <h3 className="text-base font-extrabold text-slate-900">
            {isRTL ? "لا يوجد أساتذة مسجلين حالياً" : "No Teachers Found"}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {isRTL
              ? "أضف أول أستاذ لبدء تنظيم الأفواج الدراسية وحساب الأتعاب والمستحقات."
              : "Add your first teacher to start scheduling classes and payroll."}
          </p>
          <button
            onClick={() => setIsAddOpen(true)}
            className="px-5 py-2.5 rounded-full bg-slate-950 text-white text-xs font-bold shadow-md hover:bg-slate-800 transition"
          >
            {isRTL ? "+ إضافة أستاذ الآن" : "+ Add Teacher"}
          </button>
        </div>
      )}

      {/* Teachers Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {teachers.map((teacher) => {
          const isMonthly = teacher.isMonthly || teacher.wageType === "fixed" || teacher.contractType === "fixed";

          return (
            <div
              key={teacher.id}
              className="bg-white rounded-[26px] p-5 border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] hover:shadow-md transition flex flex-col justify-between space-y-4"
            >
              {/* Header info */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                    {teacher.avatarUrl ? (
                      <img src={teacher.avatarUrl} alt={teacher.fullName} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-base font-extrabold text-indigo-700">
                        {teacher.firstName?.[0] || teacher.fullName?.[0] || "أ"}
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="text-sm font-bold text-slate-900">{teacher.fullName}</h3>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                        {isMonthly ? (isRTL ? "راتب شهري" : "Monthly") : (isRTL ? "بالساعة" : "Hourly")}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      {teacher.subjects && Array.isArray(teacher.subjects) && teacher.subjects.map((sub: string) => (
                        <span key={sub} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                          {sub}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <span
                  className={`w-2.5 h-2.5 rounded-full ring-4 ${
                    teacher.status === "ACTIVE"
                      ? "bg-emerald-500 ring-emerald-50"
                      : teacher.status === "ARCHIVED"
                      ? "bg-slate-400 ring-slate-100"
                      : "bg-amber-500 ring-amber-50"
                  }`}
                  title={teacher.status}
                />
              </div>

              {/* Teaching Load Stats */}
              <div className="bg-slate-50 rounded-2xl p-3 grid grid-cols-3 gap-2 text-center text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 block">{isRTL ? "الأفواج" : "Groups"}</span>
                  <span className="font-bold text-slate-900">{teacher.groupsCount || 0}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">{isRTL ? "الطلاب" : "Students"}</span>
                  <span className="font-bold text-slate-900">{teacher.studentsCount || 0}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">{isRTL ? (isMonthly ? "الراتب" : "سعر الساعة") : (isMonthly ? "Salary" : "Rate/Hr")}</span>
                  <span className="font-bold text-slate-900">{isMonthly ? formatDZD(teacher.fixedSalary, locale) : `${teacher.hourlyRate} دج`}</span>
                </div>
              </div>

              {/* Differentiated Section: Monthly vs Hourly */}
              {isMonthly ? (
                /* Monthly Teacher Payroll Section */
                <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 space-y-1.5 text-xs">
                  <div className="flex justify-between items-center text-slate-600">
                    <span className="text-[10px] text-slate-500 font-bold">{isRTL ? "تاريخ بداية العمل:" : "Start Date:"}</span>
                    <span className="font-bold text-slate-800">{teacher.startDate || teacher.joinDate || "—"}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span className="text-[10px] text-slate-500 font-bold">{isRTL ? "آخر دفعة مسجلة:" : "Last Payment:"}</span>
                    <span className="font-bold text-slate-800">{teacher.lastPaymentDate || (isRTL ? "لم تسجل بعد" : "None")}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span className="text-[10px] text-slate-500 font-bold">{isRTL ? "الدفعة القادمة:" : "Next Payment:"}</span>
                    <span className="font-black text-indigo-700">{teacher.nextPaymentDate || "—"}</span>
                  </div>
                  <div className="flex justify-between items-center pt-1.5 border-t border-slate-200/60">
                    <span className="text-[10px] text-slate-500 font-bold">{isRTL ? "حالة الراتب:" : "Status:"}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${teacher.payrollStatus?.badgeClass || "bg-slate-100 text-slate-700"}`}>
                      {teacher.payrollStatus?.labelAr || "ساري"}
                    </span>
                  </div>
                </div>
              ) : (
                /* Hourly Teacher Hours Breakdown Section */
                <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-600">{isRTL ? "الساعات المسجلة هذا الشهر:" : "Logged Hours This Month:"}</span>
                    <span className="text-xs font-black text-indigo-700">
                      {teacher.manualHours ?? teacher.totalHours ?? 0} {isRTL ? "ساعة" : "hrs"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-200/60">
                    <span className="text-[9px] text-slate-400">{isRTL ? "المستحق عن الساعات:" : "Total Hours Due:"}</span>
                    <span className="font-extrabold text-slate-800">
                      {formatDZD((teacher.manualHours ?? teacher.totalHours ?? 0) * (teacher.hourlyRate || 0), locale)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 pt-1">
                    <button
                      onClick={() => setRecordingHoursTeacher(teacher)}
                      className="flex-1 py-1.5 px-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold text-[10px] transition text-center shadow-xs active:scale-95"
                    >
                      {isRTL ? "+ تسجيل ساعات" : "+ Log Hours"}
                    </button>
                    <button
                      onClick={() => setViewingHoursTeacher(teacher)}
                      className="py-1.5 px-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-[10px] transition text-center shadow-xs active:scale-95"
                    >
                      {isRTL ? "السجل والتعديل" : "History & Edit"}
                    </button>
                  </div>
                </div>
              )}

              {/* Financial Status for Month */}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>{isRTL ? "الهاتف والتواصل:" : "Phone:"}</span>
                  <span className="font-bold text-slate-900">{teacher.phone}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>{isRTL ? "المستحق الكلي:" : "Total Due:"}</span>
                  <span className="font-bold text-slate-900">{formatDZD(teacher.totalDueThisMonth || 0, locale)}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span className="text-slate-700">{isRTL ? "المتبقي للصرف:" : "Remaining:"}</span>
                  <span className={(teacher.balanceThisMonth || 0) > 0 ? "text-rose-600" : "text-emerald-600"}>
                    {formatDZD(teacher.balanceThisMonth || 0, locale)}
                  </span>
                </div>
              </div>

              {/* Actions: Edit, Archive, Call, Payroll */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5">
                <a
                  href={`tel:${teacher.phone}`}
                  className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                  title={teacher.phone}
                >
                  <Phone className="w-3.5 h-3.5" />
                </a>

                <button
                  onClick={() => setEditingTeacher(teacher)}
                  className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                  title={isRTL ? "تعديل بيانات الأستاذ" : "Edit Teacher"}
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => setArchivingTeacher(teacher)}
                  className="p-2 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-600 transition"
                  title={isRTL ? "أرشفة الأستاذ" : "Archive Teacher"}
                >
                  <Archive className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => setPayingTeacher(teacher)}
                  className="flex-1 py-2 px-3 rounded-full bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold transition text-center shadow-xs active:scale-95"
                >
                  {isRTL ? "صرف الراتب" : "Payroll"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Teacher Modal */}
      <AddTeacherModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        locale={locale}
        onTeacherCreated={handleTeacherCreated}
      />

      {/* Edit Teacher Modal */}
      <EditTeacherModal
        isOpen={Boolean(editingTeacher)}
        teacher={editingTeacher}
        onClose={() => setEditingTeacher(null)}
        locale={locale}
        onTeacherUpdated={handleTeacherUpdated}
      />

      {/* Archive Teacher Confirmation Dialog */}
      <ArchiveTeacherDialog
        isOpen={Boolean(archivingTeacher)}
        teacher={archivingTeacher}
        onClose={() => setArchivingTeacher(null)}
        locale={locale}
        onTeacherArchived={handleTeacherArchived}
      />

      {/* Pay Teacher Salary Modal */}
      <PayTeacherSalaryModal
        teacher={payingTeacher}
        isOpen={Boolean(payingTeacher)}
        onClose={() => setPayingTeacher(null)}
        locale={locale}
        onPaymentRecorded={() => {
          fetchTeachers();
          showToast(isRTL ? "✓ تم صرف الراتب وإدراجه في المصاريف" : "✓ Salary payment recorded");
        }}
      />

      {/* Record Manual Hours Modal */}
      <RecordHoursModal
        teacher={recordingHoursTeacher}
        isOpen={Boolean(recordingHoursTeacher)}
        onClose={() => setRecordingHoursTeacher(null)}
        locale={locale}
        onHoursRecorded={() => {
          fetchTeachers();
          showToast(isRTL ? "✓ تم تسجيل ساعات العمل بنجاح" : "✓ Hours recorded successfully");
        }}
      />

      {/* Hours History Modal */}
      <HoursHistoryModal
        teacher={viewingHoursTeacher}
        isOpen={Boolean(viewingHoursTeacher)}
        onClose={() => setViewingHoursTeacher(null)}
        locale={locale}
        onOpenRecordHours={() => setRecordingHoursTeacher(viewingHoursTeacher)}
        onHoursUpdated={() => {
          fetchTeachers();
          showToast(isRTL ? "✓ تم تحديث سجل الساعات وإعادة حساب المستحقات" : "✓ Hours log updated successfully");
        }}
      />
    </div>
  );
};
