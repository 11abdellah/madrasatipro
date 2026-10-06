"use client";

import React, { useState } from "react";
import {
  Search,
  Plus,
  Filter,
  Download,
  MoreVertical,
  GraduationCap,
  Phone,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Eye,
  Pencil,
  Trash2,
  AlertCircle,
  Loader2,
  CreditCard,
} from "lucide-react";
import { Student, Locale } from "@/types";
import { formatDZD } from "@/lib/utils";
import { ALGERIAN_WILAYAS } from "@/lib/constants/algeria";
import { EditStudentModal } from "./EditStudentModal";

interface StudentsViewProps {
  locale: Locale;
  onOpenAddModal: () => void;
  onSelectStudent: (student: Student) => void;
  onViewCard?: (studentId: string) => void;
  refreshKey?: number;
}

export const StudentsView: React.FC<StudentsViewProps> = ({
  locale,
  onOpenAddModal,
  onSelectStudent,
  onViewCard,
  refreshKey = 0,
}) => {
  const isRTL = locale === "ar";
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit & Delete States
  const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/students?level=${selectedLevel}&status=${selectedStatus}&search=${encodeURIComponent(searchTerm)}`
      );
      const data = await res.json();
      if (data.students) {
        setStudents(data.students);
      }
    } catch (err) {
      console.error("Failed to load students:", err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchStudents();
  }, [selectedLevel, selectedStatus, refreshKey]);

  const handleDeleteConfirm = async () => {
    if (!studentToDelete) return;
    setIsDeleting(true);
    setDeleteError("");

    try {
      const res = await fetch(`/api/students/${studentToDelete.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "تعذر حذف الطالب");
      }

      setStudentToDelete(null);
      await fetchStudents();
    } catch (err: any) {
      setDeleteError(err.message || "حدث خطأ أثناء محاولة حذف الطالب");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredStudents = students.filter((student) => {
    const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
    return (
      fullName.includes(searchTerm.toLowerCase()) ||
      student.phone.includes(searchTerm) ||
      (student.groupName && student.groupName.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            {isRTL ? "نشط" : "Active"}
          </span>
        );
      case "suspended":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            {isRTL ? "معلق" : "Suspended"}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  const getPaymentBadge = (balance: number) => {
    if (balance === 0) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>{isRTL ? "مدفوع بالكامل" : "Paid"}</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700">
        <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
        <span>{formatDZD(balance, locale)}</span>
      </span>
    );
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {isRTL ? "إدارة الطلاب المسجلين" : "Student Directory"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            {isRTL
              ? "متابعة الطلاب، الأفواج الدراسية، الحضور والغياب والمستحقات المالية"
              : "Manage student enrollments, groups, attendance, and account balances"}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-2 bg-slate-950 hover:bg-slate-800 text-white px-4 py-2.5 rounded-full text-xs font-bold shadow-md shadow-slate-950/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>{isRTL ? "إضافة طالب جديد" : "Add Student"}</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-[24px] p-4 border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 rtl:right-3.5 ltr:left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={
              isRTL
                ? "ابحث بالاسم، اللقب، الهاتف، الفوج..."
                : "Search name, phone, group..."
            }
            className="w-full bg-slate-50 border border-slate-200 rounded-full py-2 px-9 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          {/* Level Filter */}
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-full px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none"
          >
            <option value="all">{isRTL ? "جميع المستويات" : "All Levels"}</option>
            <option value="3AS">{isRTL ? "3 ثانوي (BAC)" : "3AS (BAC)"}</option>
            <option value="2AS">{isRTL ? "2 ثانوي" : "2AS"}</option>
            <option value="1AS">{isRTL ? "1 ثانوي" : "1AS"}</option>
            <option value="4AM">{isRTL ? "4 متوسط (BEM)" : "4AM (BEM)"}</option>
            <option value="3AM">{isRTL ? "3 متوسط" : "3AM"}</option>
            <option value="2AM">{isRTL ? "2 متوسط" : "2AM"}</option>
            <option value="1AM">{isRTL ? "1 متوسط" : "1AM"}</option>
            <option value="PRIMARY">{isRTL ? "ابتدائي" : "Primary"}</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-full px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none"
          >
            <option value="all">{isRTL ? "جميع الحالات" : "All Statuses"}</option>
            <option value="ACTIVE">{isRTL ? "نشط" : "Active"}</option>
            <option value="SUSPENDED">{isRTL ? "معلق" : "Suspended"}</option>
          </select>

          <span className="text-xs text-slate-600 font-semibold px-2">
            {isRTL ? `${filteredStudents.length} طالب` : `${filteredStudents.length} students`}
          </span>
        </div>
      </div>

      {/* Modern Data Table */}
      <div className="bg-white rounded-[28px] border border-slate-100 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right rtl:text-right ltr:text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3.5 px-5">{isRTL ? "الطالب" : "Student"}</th>
                <th className="py-3.5 px-4">{isRTL ? "الهاتف والولاية" : "Phone & Wilaya"}</th>
                <th className="py-3.5 px-4">{isRTL ? "المستوى والشعبة" : "Level & Stream"}</th>
                <th className="py-3.5 px-4">{isRTL ? "الفوج" : "Group"}</th>
                <th className="py-3.5 px-4">{isRTL ? "الحضور" : "Attendance"}</th>
                <th className="py-3.5 px-4">{isRTL ? "الحالة" : "Status"}</th>
                <th className="py-3.5 px-4">{isRTL ? "الرصيد المالي" : "Balance"}</th>
                <th className="py-3.5 px-5 text-center">{isRTL ? "الإجراءات" : "Actions"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-14 text-center text-slate-400">
                    <GraduationCap className="w-9 h-9 mx-auto mb-2 text-slate-300" />
                    <p className="text-xs font-bold text-slate-700">
                      {isRTL ? "لا يوجد طلاب مسجلون بعد" : "No students registered yet"}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">
                      {isRTL
                        ? "ابدأ بتسجيل أول طالب في مؤسستك بالضغط على زر 'إضافة طالب جديد' أعلاه"
                        : "Start registering students by clicking 'Add Student' above"}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr
                    key={student.id}
                    className="hover:bg-slate-50/80 transition group"
                  >
                    {/* Student Avatar & Name */}
                    <td
                      onClick={() => onSelectStudent(student)}
                      className="py-3.5 px-5 cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">
                          {student.firstName[0]}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 group-hover:text-indigo-600 transition">
                            {student.firstName} {student.lastName}
                          </p>
                          <p className="text-[11px] text-slate-600">
                            {isRTL ? `الولي: ${student.parentName}` : `Parent: ${student.parentName}`}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Phone & Wilaya */}
                    <td
                      onClick={() => onSelectStudent(student)}
                      className="py-3.5 px-4 text-slate-600 cursor-pointer"
                    >
                      <p className="font-medium text-slate-900">{student.phone}</p>
                      <p className="text-[11px] text-slate-600">{student.wilayaName}</p>
                    </td>

                    {/* Level & Stream */}
                    <td
                      onClick={() => onSelectStudent(student)}
                      className="py-3.5 px-4 cursor-pointer"
                    >
                      <span className="font-bold text-slate-800">{student.academicLevel}</span>
                      {student.stream && (
                        <p className="text-[11px] text-slate-600">{student.stream}</p>
                      )}
                    </td>

                    {/* Group */}
                    <td
                      onClick={() => onSelectStudent(student)}
                      className="py-3.5 px-4 text-slate-700 font-medium cursor-pointer"
                    >
                      {student.groupName}
                    </td>

                    {/* Attendance Rate */}
                    <td
                      onClick={() => onSelectStudent(student)}
                      className="py-3.5 px-4 cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800">{student.attendanceRate}%</span>
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${student.attendanceRate}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td
                      onClick={() => onSelectStudent(student)}
                      className="py-3.5 px-4 cursor-pointer"
                    >
                      {getStatusBadge(student.status)}
                    </td>

                    {/* Balance */}
                    <td
                      onClick={() => onSelectStudent(student)}
                      className="py-3.5 px-4 cursor-pointer"
                    >
                      {getPaymentBadge(student.balance)}
                    </td>

                    {/* Actions: View, Edit, Delete */}
                    <td className="py-3.5 px-5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onViewCard) onViewCard(student.id);
                          }}
                          className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-600 hover:text-emerald-800 transition"
                          title={isRTL ? "بطاقة المتمدرس" : "Student Card"}
                        >
                          <CreditCard className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => onSelectStudent(student)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition"
                          title={isRTL ? "عرض الملف" : "View Profile"}
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setStudentToEdit(student)}
                          className="p-1.5 rounded-lg hover:bg-indigo-50 text-indigo-600 hover:text-indigo-800 transition"
                          title={isRTL ? "تعديل البيانات" : "Edit Student"}
                        >
                          <Pencil className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setStudentToDelete(student)}
                          className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-500 hover:text-rose-700 transition"
                          title={isRTL ? "حذف الطالب" : "Delete Student"}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Student Modal */}
      <EditStudentModal
        student={studentToEdit}
        isOpen={Boolean(studentToEdit)}
        onClose={() => setStudentToEdit(null)}
        locale={locale}
        onSaved={fetchStudents}
      />

      {/* Delete Confirmation Modal */}
      {studentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-extrabold text-slate-900">
                {isRTL ? "تأكيد حذف الطالب" : "Confirm Student Deletion"}
              </h3>
              <p className="text-xs text-slate-500">
                {isRTL ? (
                  <>
                    هل أنت متأكد من حذف التلميذ{" "}
                    <span className="font-bold text-slate-800">
                      {studentToDelete.firstName} {studentToDelete.lastName}
                    </span>{" "}
                    نهائياً؟ سيتم حذف جميع الفواتير والدرجات وسجلات الحضور التابعة له.
                  </>
                ) : (
                  `Are you sure you want to permanently delete ${studentToDelete.firstName} ${studentToDelete.lastName}?`
                )}
              </p>
            </div>

            {deleteError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{deleteError}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setStudentToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                {isRTL ? "إلغاء" : "Cancel"}
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-sm flex items-center gap-1.5 transition-all disabled:opacity-60"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{isRTL ? "جاري الحذف..." : "Deleting..."}</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{isRTL ? "نعم، حذف نهائي" : "Delete"}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
