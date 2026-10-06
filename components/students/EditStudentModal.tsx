"use client";

import React, { useState, useEffect } from "react";
import { X, Check, User, BookOpen, HeartHandshake, Loader2, AlertCircle } from "lucide-react";
import { ALGERIAN_WILAYAS, DEFAULT_ACADEMIC_CYCLES, ACADEMIC_STREAMS } from "@/lib/constants/algeria";
import { Student, Locale } from "@/types";

interface EditStudentModalProps {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
  locale: Locale;
  onSaved: () => void;
}

export const EditStudentModal: React.FC<EditStudentModalProps> = ({
  student,
  isOpen,
  onClose,
  locale,
  onSaved,
}) => {
  const isRTL = locale === "ar";
  const [realGroups, setRealGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    gender: "male",
    dateOfBirth: "",
    phone: "",
    email: "",
    wilayaCode: 19,
    address: "",
    academicLevel: "3AS",
    stream: "علوم تجريبية",
    groupId: "",
    monthlyFee: 4000,
    status: "active",
    parentName: "",
    parentPhone: "",
    parentRelationship: "الأب",
  });

  useEffect(() => {
    if (isOpen && student) {
      setErrorMsg("");
      setFormData({
        firstName: student.firstName || "",
        lastName: student.lastName || "",
        gender: student.gender || "male",
        dateOfBirth: student.dateOfBirth || "",
        phone: student.phone || "",
        email: student.email || "",
        wilayaCode: student.wilayaCode || 19,
        address: student.address || "",
        academicLevel: student.academicLevel || "3AS",
        stream: student.stream || "علوم تجريبية",
        groupId: (student as any).groupId || "",
        monthlyFee: (student as any).monthlyFee || 4000,
        status: student.status || "active",
        parentName: student.parentName || "",
        parentPhone: student.parentPhone || "",
        parentRelationship: (student as any).parentRelationship || "الأب",
      });

      // Fetch groups
      fetch("/api/classes")
        .then((res) => res.json())
        .then((data) => {
          if (data.groups && Array.isArray(data.groups)) {
            setRealGroups(data.groups);
          }
        })
        .catch((err) => console.error("Error fetching class groups:", err));
    }
  }, [isOpen, student]);

  if (!isOpen || !student) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setErrorMsg(isRTL ? "يرجى ملء الاسم واللقب" : "First and last name are required");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/students/${student.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "تعذر تحديث بيانات الطالب");
      }

      onSaved();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "حدث خطأ أثناء حفظ التعديلات");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-white rounded-3xl shadow-2xl border border-slate-100 p-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">
              {isRTL ? "تعديل بيانات الطالب" : "Edit Student"}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {student.firstName} {student.lastName} ({student.academicLevel})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-5">
          {/* Section 1: Personal Info */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-indigo-600" />
              <span>{isRTL ? "المعلومات الشخصية" : "Personal Information"}</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isRTL ? "الاسم" : "First Name"} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isRTL ? "اللقب" : "Last Name"} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isRTL ? "رقم الهاتف" : "Phone"}
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isRTL ? "البريد الإلكتروني" : "Email"}
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isRTL ? "الولاية" : "Wilaya"}
                </label>
                <select
                  value={formData.wilayaCode}
                  onChange={(e) => setFormData({ ...formData, wilayaCode: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  {ALGERIAN_WILAYAS.map((w) => (
                    <option key={w.code} value={w.code}>
                      {w.code} - {w.nameAr} ({w.nameFr})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isRTL ? "العنوان بالتفصيل" : "Address"}
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Academic & Group */}
          <div className="pt-2 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
              <span>{isRTL ? "المستوى والدراسة" : "Academic Information"}</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isRTL ? "المستوى الدراسي" : "Academic Level"}
                </label>
                <select
                  value={formData.academicLevel}
                  onChange={(e) => setFormData({ ...formData, academicLevel: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="3AS">3 ثانوي (BAC)</option>
                  <option value="2AS">2 ثانوي</option>
                  <option value="1AS">1 ثانوي</option>
                  <option value="4AM">4 متوسط (BEM)</option>
                  <option value="3AM">3 متوسط</option>
                  <option value="2AM">2 متوسط</option>
                  <option value="1AM">1 متوسط</option>
                  <option value="PRIMARY">ابتدائي</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isRTL ? "الشعبة" : "Stream"}
                </label>
                <select
                  value={formData.stream}
                  onChange={(e) => setFormData({ ...formData, stream: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="علوم تجريبية">علوم تجريبية</option>
                  <option value="رياضيات">رياضيات</option>
                  <option value="تقني رياضي">تقني رياضي</option>
                  <option value="تسيير واقتصاد">تسيير واقتصاد</option>
                  <option value="آداب وفلسفة">آداب وفلسفة</option>
                  <option value="لغات أجنبية">لغات أجنبية</option>
                  <option value="عام">عام</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isRTL ? "الفوج الدراسي" : "Class Group"}
                </label>
                <select
                  value={formData.groupId}
                  onChange={(e) => setFormData({ ...formData, groupId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="">{isRTL ? "— بدون فوج محدد —" : "No specific group"}</option>
                  {realGroups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name} ({g.teacher?.fullName || "أستاذ"})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isRTL ? "الاشتراك الشهري (دج)" : "Monthly Fee (DZD)"}
                </label>
                <input
                  type="number"
                  value={formData.monthlyFee}
                  onChange={(e) => setFormData({ ...formData, monthlyFee: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isRTL ? "حالة الطالب" : "Status"}
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="ACTIVE">{isRTL ? "نشط" : "Active"}</option>
                  <option value="SUSPENDED">{isRTL ? "معلق" : "Suspended"}</option>
                  <option value="ARCHIVED">{isRTL ? "مؤرشف" : "Archived"}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Parent Information */}
          <div className="pt-2 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <HeartHandshake className="w-3.5 h-3.5 text-indigo-600" />
              <span>{isRTL ? "بيانات ولي الأمر" : "Parent Information"}</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isRTL ? "اسم ولي الأمر" : "Parent Name"}
                </label>
                <input
                  type="text"
                  value={formData.parentName}
                  onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isRTL ? "هاتف ولي الأمر" : "Parent Phone"}
                </label>
                <input
                  type="tel"
                  value={formData.parentPhone}
                  onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isRTL ? "صلة القرابة" : "Relationship"}
                </label>
                <select
                  value={formData.parentRelationship}
                  onChange={(e) => setFormData({ ...formData, parentRelationship: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="الأب">الأب</option>
                  <option value="الأم">الأم</option>
                  <option value="الولي الشرعي">الولي الشرعي</option>
                  <option value="الأخ/الأخت">الأخ/الأخت</option>
                  <option value="أخرى">أخرى</option>
                </select>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              {isRTL ? "إلغاء" : "Cancel"}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm flex items-center gap-1.5 transition-all disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{isRTL ? "جاري الحفظ..." : "Saving..."}</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>{isRTL ? "حفظ التعديلات" : "Save Changes"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
