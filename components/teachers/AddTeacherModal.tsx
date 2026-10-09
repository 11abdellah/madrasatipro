"use client";

import React, { useState } from "react";
import { X, Check, User, Briefcase, Wallet, FileText, Loader2, GraduationCap } from "lucide-react";
import { ALGERIAN_WILAYAS } from "@/lib/constants/algeria";
import { Locale, Teacher } from "@/types";

interface AddTeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  locale: Locale;
  onTeacherCreated: (teacher: any) => void;
}

export const AddTeacherModal: React.FC<AddTeacherModalProps> = ({
  isOpen,
  onClose,
  locale,
  onTeacherCreated,
}) => {
  const isRTL = locale === "ar";
  const [activeTab, setActiveTab] = useState<"personal" | "professional" | "financial" | "notes">("personal");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "male" as "male" | "female",
    wilayaCode: 19,
    address: "",

    specialization: "",
    selectedSubjects: ["الرياضيات"],
    yearsExperience: 5,
    contractType: "hourly" as "hourly" | "fixed" | "percentage",
    joinDate: new Date().toISOString().split("T")[0],

    wageType: "hourly" as "hourly" | "fixed" | "percentage",
    hourlyRate: 2000,
    fixedSalary: 0,
    percentageShare: 0,

    status: "ACTIVE" as "ACTIVE" | "INACTIVE" | "ARCHIVED",
    notes: "",
  });

  if (!isOpen) return null;

  const toggleSubject = (subName: string) => {
    if (formData.selectedSubjects.includes(subName)) {
      if (formData.selectedSubjects.length > 1) {
        setFormData({
          ...formData,
          selectedSubjects: formData.selectedSubjects.filter((s) => s !== subName),
        });
      }
    } else {
      setFormData({
        ...formData,
        selectedSubjects: [...formData.selectedSubjects, subName],
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    // Client Validation
    if (!formData.firstName.trim()) {
      setErrorMsg(isRTL ? "الاسم مطلوب" : "First name is required");
      setActiveTab("personal");
      return;
    }
    if (!formData.lastName.trim()) {
      setErrorMsg(isRTL ? "اللقب مطلوب" : "Last name is required");
      setActiveTab("personal");
      return;
    }
    if (!formData.phone.trim()) {
      setErrorMsg(isRTL ? "رقم الهاتف مطلوب" : "Phone number is required");
      setActiveTab("personal");
      return;
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      setErrorMsg(isRTL ? "البريد الإلكتروني غير صالح" : "Valid email is required");
      setActiveTab("personal");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/teachers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          dateOfBirth: formData.dateOfBirth || undefined,
          gender: formData.gender,
          wilayaCode: formData.wilayaCode,
          address: formData.address || undefined,
          specialization: formData.specialization || undefined,
          subjects: formData.selectedSubjects,
          yearsExperience: Number(formData.yearsExperience) || 0,
          contractType: formData.contractType,
          joinDate: formData.joinDate,
          wageType: formData.wageType,
          hourlyRate: Number(formData.hourlyRate) || 0,
          fixedSalary: Number(formData.fixedSalary) || 0,
          percentageShare: Number(formData.percentageShare) || 0,
          status: formData.status,
          notes: formData.notes || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || (isRTL ? "تعذر حفظ البيانات" : "Failed to save teacher"));
      }

      onTeacherCreated(data.teacher);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || (isRTL ? "حدث خطأ أثناء حفظ الأستاذ" : "Error saving teacher"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-[32px] w-full max-w-2xl border border-slate-100 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-950 text-white flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                {isRTL ? "إضافة أستاذ جديد للهيئة التدريسية" : "Add New Teacher"}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {isRTL ? "تسجيل بيانات الأستاذ، التخصص، والمستحقات بالدينار الجزائري" : "Register teacher profile and rates in DZD"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Section Tabs */}
        <div className="flex border-b border-slate-100 px-6 bg-white overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab("personal")}
            className={`py-3 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === "personal"
                ? "border-slate-950 text-slate-950 font-extrabold"
                : "border-transparent text-slate-400 hover:text-slate-700"
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>{isRTL ? "المعلومات الشخصية" : "Personal"}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("professional")}
            className={`py-3 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === "professional"
                ? "border-slate-950 text-slate-950 font-extrabold"
                : "border-transparent text-slate-400 hover:text-slate-700"
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>{isRTL ? "المعلومات المهنية" : "Professional"}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("financial")}
            className={`py-3 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === "financial"
                ? "border-slate-950 text-slate-950 font-extrabold"
                : "border-transparent text-slate-400 hover:text-slate-700"
            }`}
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>{isRTL ? "المستحقات والأجر" : "Financial"}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("notes")}
            className={`py-3 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === "notes"
                ? "border-slate-950 text-slate-950 font-extrabold"
                : "border-transparent text-slate-400 hover:text-slate-700"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{isRTL ? "ملاحظات إضافية" : "Notes"}</span>
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold animate-in fade-in">
            {errorMsg}
          </div>
        )}

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1 text-right rtl:text-right ltr:text-left">
          {/* Tab 1: Personal Info */}
          {activeTab === "personal" && (
            <div className="space-y-4 animate-in fade-in">
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
                    placeholder={isRTL ? "مثال: عبد القادر" : "e.g. Abdelkader"}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white"
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
                    placeholder={isRTL ? "مثال: بوعلام" : "e.g. Boualem"}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isRTL ? "البريد الإلكتروني" : "Email"} *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="a.boualem@madrasatipro.dz"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isRTL ? "رقم الهاتف الجزائري" : "Algerian Phone"} *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="0550 12 34 56"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isRTL ? "الولاية (58 ولاية)" : "Wilaya"}
                  </label>
                  <select
                    value={formData.wilayaCode}
                    onChange={(e) => setFormData({ ...formData, wilayaCode: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-medium"
                  >
                    {ALGERIAN_WILAYAS.map((w) => (
                      <option key={w.code} value={w.code}>
                        {w.code} - {isRTL ? w.nameAr : w.nameFr}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isRTL ? "الجنس" : "Gender"}
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs"
                  >
                    <option value="male">{isRTL ? "ذكر" : "Male"}</option>
                    <option value="female">{isRTL ? "أنثى" : "Female"}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isRTL ? "تاريخ الميلاد" : "Date of Birth"}
                  </label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Professional Info */}
          {activeTab === "professional" && (
            <div className="space-y-4 animate-in fade-in">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isRTL ? "المواد التي يدرسها الأستاذ (حدد المواد):" : "Subjects Taught:"} *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {["الرياضيات", "العلوم الفيزيائية", "علوم الطبيعة والحياة", "اللغة الإنجليزية", "اللغة الفرنسية", "اللغة العربية", "الفلسفة", "الإعلام الآلي"].map((sub) => {
                    const isChecked = formData.selectedSubjects.includes(sub);
                    return (
                      <button
                        type="button"
                        key={sub}
                        onClick={() => toggleSubject(sub)}
                        className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-between ${
                          isChecked
                            ? "bg-slate-950 text-white border-slate-950 shadow-xs"
                            : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        <span>{sub}</span>
                        {isChecked && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isRTL ? "التخصص / الشهادة" : "Specialization / Degree"}
                  </label>
                  <input
                    type="text"
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    placeholder={isRTL ? "مثال: أستاذ مبرز في الرياضيات" : "e.g. Master in Mathematics"}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isRTL ? "سنوات الخبرة" : "Years of Experience"}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.yearsExperience}
                    onChange={(e) => setFormData({ ...formData, yearsExperience: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isRTL ? "نوع التعاقد" : "Contract Type"}
                </label>
                <select
                  value={formData.contractType}
                  onChange={(e) => setFormData({ ...formData, contractType: e.target.value as any })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold"
                >
                  <option value="hourly">{isRTL ? "بالساعة (Taux Horaire)" : "Hourly"}</option>
                  <option value="fixed">{isRTL ? "راتب شهري ثابت" : "Fixed Monthly"}</option>
                  <option value="percentage">{isRTL ? "نسبة من مداخيل الفوج" : "Percentage Share"}</option>
                </select>
              </div>
            </div>
          )}

          {/* Tab 3: Financial Info */}
          {activeTab === "financial" && (
            <div className="space-y-4 animate-in fade-in">
              {/* Pay Type Toggle */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {isRTL ? "طريقة الدفع *" : "Payment Method *"}
                </label>
                <div className="grid grid-cols-2 gap-3 p-1 bg-slate-100 rounded-2xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        wageType: "hourly",
                        contractType: "hourly",
                      })
                    }
                    className={`py-2 px-4 rounded-xl text-xs font-extrabold transition-all ${
                      formData.wageType === "hourly"
                        ? "bg-slate-950 text-white shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {isRTL ? "بالساعة (Hourly)" : "Hourly Rate"}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        wageType: "fixed",
                        contractType: "fixed",
                      })
                    }
                    className={`py-2 px-4 rounded-xl text-xs font-extrabold transition-all ${
                      formData.wageType === "fixed"
                        ? "bg-slate-950 text-white shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {isRTL ? "راتب شهري (Monthly)" : "Monthly Salary"}
                  </button>
                </div>
              </div>

              {/* Start Date Field - Essential for payroll calculations */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isRTL ? "تاريخ بداية العمل *" : "Start Date *"}
                </label>
                <input
                  type="date"
                  required
                  value={formData.joinDate}
                  onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  {isRTL
                    ? "التاريخ التجاري الفعلي لبداية العمل (يستخدم لحساب مواعيد الاستحقاق والدفعة القادمة)"
                    : "Actual work start date used for salary schedule and next payment calculation"}
                </span>
              </div>

              {/* Conditional Inputs based on Pay Type */}
              {formData.wageType === "hourly" ? (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isRTL ? "سعر الساعة (دج) *" : "Hourly Rate (DZD) *"}
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.hourlyRate}
                    onChange={(e) => setFormData({ ...formData, hourlyRate: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500"
                    placeholder="مثال: 1500"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    {isRTL ? "يحسب المستحق الشهري تلقائياً: (ساعات الحصص + الساعات المسجلة) × سعر الساعة" : "Total due = (session hours + manual hours) × hourly rate"}
                  </span>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isRTL ? "الراتب الشهري الثابت (دج) *" : "Monthly Salary (DZD) *"}
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.fixedSalary}
                    onChange={(e) => setFormData({ ...formData, fixedSalary: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500"
                    placeholder="مثال: 40000"
                  />
                  <span className="text-[10px] text-indigo-600 mt-1 block font-medium">
                    {isRTL
                      ? "✓ سيتم تحديد موعد استحقاق الراتب تلقائياً مع الحفاظ على يوم بداية العمل شهرياً"
                      : "✓ Monthly salary schedule is calculated automatically preserving start day of month"}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Tab 4: Notes & Status */}
          {activeTab === "notes" && (
            <div className="space-y-4 animate-in fade-in">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isRTL ? "حالة الأستاذ" : "Status"}
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold"
                >
                  <option value="ACTIVE">{isRTL ? "نشط (متاح للتدريس)" : "Active"}</option>
                  <option value="INACTIVE">{isRTL ? "غير نشط (في عطلة)" : "Inactive"}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isRTL ? "ملاحظات إدارية" : "Administrative Notes"}
                </label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder={isRTL ? "أية تفاصيل إضافية حول توفر الأستاذ أو متطلباته..." : "Additional notes..."}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs"
                />
              </div>
            </div>
          )}

          {/* Modal Footer Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
            >
              {isRTL ? "إلغاء" : "Cancel"}
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold shadow-md transition disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{isRTL ? "جاري الحفظ..." : "Saving..."}</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>{isRTL ? "حفظ الأستاذ في قاعدة البيانات" : "Save Teacher"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
