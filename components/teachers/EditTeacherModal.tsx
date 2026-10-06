"use client";

import React, { useState, useEffect } from "react";
import { X, Check, Loader2 } from "lucide-react";
import { ALGERIAN_WILAYAS } from "@/lib/constants/algeria";
import { Locale } from "@/types";

interface EditTeacherModalProps {
  isOpen: boolean;
  teacher: any | null;
  onClose: () => void;
  locale: Locale;
  onTeacherUpdated: (updated: any) => void;
}

export const EditTeacherModal: React.FC<EditTeacherModalProps> = ({
  isOpen,
  teacher,
  onClose,
  locale,
  onTeacherUpdated,
}) => {
  const isRTL = locale === "ar";
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [hourlyRate, setHourlyRate] = useState(2000);
  const [fixedSalary, setFixedSalary] = useState(0);
  const [wageType, setWageType] = useState<"hourly" | "fixed">("hourly");
  const [startDate, setStartDate] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [status, setStatus] = useState("ACTIVE");

  useEffect(() => {
    if (teacher) {
      setPhone(teacher.phone || "");
      setEmail(teacher.email || "");
      setHourlyRate(teacher.hourlyRate || 2000);
      setFixedSalary(teacher.fixedSalary || 0);
      setWageType(teacher.wageType === "fixed" || teacher.contractType === "fixed" ? "fixed" : "hourly");
      setStartDate(teacher.startDate || teacher.joinDate || "");
      setSpecialization(teacher.specialization || "");
      setStatus(teacher.status || "ACTIVE");
    }
  }, [teacher]);

  if (!isOpen || !teacher) return null;

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const res = await fetch(`/api/teachers/${teacher.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          email,
          hourlyRate: Number(hourlyRate),
          fixedSalary: Number(fixedSalary),
          wageType,
          startDate,
          joinDate: startDate,
          specialization,
          status,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "تعذر تحديث بيانات الأستاذ");
      }

      onTeacherUpdated(data.teacher);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "حدث خطأ أثناء حفظ التعديلات");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-[32px] w-full max-w-lg border border-slate-100 shadow-2xl p-6 space-y-4 text-right rtl:text-right ltr:text-left">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">
              {isRTL ? `تعديل بيانات: ${teacher.fullName}` : `Edit Teacher: ${teacher.fullName}`}
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              {isRTL ? "تحديث الهاتف، طريقة الدفع، تاريخ البداية، أو الراتب" : "Update phone, pay type, start date, or rate"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-3.5 text-xs">
          {/* Pay Type Toggle */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              {isRTL ? "طريقة الدفع *" : "Payment Method *"}
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl border border-slate-200">
              <button
                type="button"
                onClick={() => setWageType("hourly")}
                className={`py-2 px-3 rounded-xl text-xs font-extrabold transition-all ${
                  wageType === "hourly"
                    ? "bg-slate-950 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {isRTL ? "بالساعة (Hourly)" : "Hourly Rate"}
              </button>
              <button
                type="button"
                onClick={() => setWageType("fixed")}
                className={`py-2 px-3 rounded-xl text-xs font-extrabold transition-all ${
                  wageType === "fixed"
                    ? "bg-slate-950 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {isRTL ? "راتب شهري (Monthly)" : "Monthly Salary"}
              </button>
            </div>
          </div>

          {/* Start Date */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              {isRTL ? "تاريخ بداية العمل *" : "Start Date *"}
            </label>
            <input
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">
              {isRTL ? "يستخدم لتحديد مواعيد استحقاق الدفعات القادمة شهرياً" : "Used to compute next payment dates"}
            </span>
          </div>

          {/* Pay Rate or Salary */}
          {wageType === "hourly" ? (
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {isRTL ? "سعر الساعة (دج) *" : "Hourly Rate (DZD) *"}
              </label>
              <input
                type="number"
                min="0"
                required
                value={hourlyRate}
                onChange={(e) => setHourlyRate(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          ) : (
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {isRTL ? "الراتب الشهري الثابت (دج) *" : "Monthly Salary (DZD) *"}
              </label>
              <input
                type="number"
                min="0"
                required
                value={fixedSalary}
                onChange={(e) => setFixedSalary(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {isRTL ? "رقم الهاتف الجزائري" : "Phone Number"} *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {isRTL ? "البريد الإلكتروني" : "Email"} *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {isRTL ? "التخصص / المؤهل" : "Specialization"}
              </label>
              <input
                type="text"
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {isRTL ? "الحالة" : "Status"}
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900"
              >
                <option value="ACTIVE">{isRTL ? "نشط" : "Active"}</option>
                <option value="INACTIVE">{isRTL ? "غير نشط" : "Inactive"}</option>
                <option value="ARCHIVED">{isRTL ? "مؤرشف" : "Archived"}</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full border border-slate-200 font-bold text-slate-700 hover:bg-slate-50"
            >
              {isRTL ? "إلغاء" : "Cancel"}
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-slate-950 hover:bg-slate-800 text-white font-bold transition disabled:opacity-50"
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
