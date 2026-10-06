"use client";

import React, { useState, useEffect } from "react";
import { X, Check, DollarSign, Wallet, Calendar, AlertCircle, Loader2 } from "lucide-react";
import { formatDZD, getAlgiersCurrentMonth, getAlgiersTodayStr } from "@/lib/utils";
import { Locale } from "@/types";

interface PayTeacherSalaryModalProps {
  teacher: any | null;
  isOpen: boolean;
  onClose: () => void;
  locale: Locale;
  onPaymentRecorded: () => void;
}

export const PayTeacherSalaryModal: React.FC<PayTeacherSalaryModalProps> = ({
  teacher,
  isOpen,
  onClose,
  locale,
  onPaymentRecorded,
}) => {
  const isRTL = locale === "ar";
  const [amount, setAmount] = useState<number>(0);
  const [monthYear, setMonthYear] = useState<string>(getAlgiersCurrentMonth());
  const [paymentDate, setPaymentDate] = useState<string>(getAlgiersTodayStr());
  const [method, setMethod] = useState<string>("CASH");
  const [notes, setNotes] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (isOpen && teacher) {
      setErrorMsg("");
      const defaultAmount = teacher.balanceThisMonth !== undefined && teacher.balanceThisMonth > 0
        ? teacher.balanceThisMonth
        : teacher.remaining !== undefined && teacher.remaining > 0
        ? teacher.remaining
        : teacher.grossSalary || teacher.totalDueThisMonth || 10000;
      setAmount(defaultAmount);
      setMonthYear(getAlgiersCurrentMonth());
      setPaymentDate(getAlgiersTodayStr());
      setNotes("");
    }
  }, [isOpen, teacher]);

  if (!isOpen || !teacher) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!amount || amount <= 0) {
      setErrorMsg(isRTL ? "يرجى إدخال مبلغ صحيح أكبر من الصفر" : "Amount must be greater than zero");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/finance/salaries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacherId: teacher.teacherId || teacher.id,
          amount: Number(amount),
          monthYear,
          paymentDate,
          method,
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "تعذر تسجيل دفع الراتب");
      }

      onPaymentRecorded();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "حدث خطأ أثناء صرف الراتب");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900">
              {isRTL ? "تسجيل صرف راتب أستاذ" : "Record Teacher Salary Payment"}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {teacher.fullName} ({teacher.specialization || "هيئة التدريس"})
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
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Calculation Info Box */}
        <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
          <div>
            <span className="text-[10px] text-slate-500 block">
              {teacher.isMonthly || teacher.wageType === "fixed" ? (isRTL ? "نظام العمل" : "Pay Type") : (isRTL ? "الساعات المحسوبة" : "Hours")}
            </span>
            <span className="font-extrabold text-slate-900">
              {teacher.isMonthly || teacher.wageType === "fixed"
                ? (isRTL ? "راتب شهري" : "Monthly")
                : `${teacher.totalHours || teacher.monthlyHours || teacher.completedHoursThisMonth || 0} س`}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block">{isRTL ? "المستحق الإجمالي" : "Gross"}</span>
            <span className="font-extrabold text-slate-900">
              {formatDZD(teacher.fixedSalary || teacher.grossSalary || teacher.totalDueThisMonth || 0, locale)}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block">{isRTL ? "المتبقي للصرف" : "Remaining"}</span>
            <span className="font-extrabold text-rose-600">
              {formatDZD(teacher.remaining !== undefined ? teacher.remaining : teacher.balanceThisMonth || 0, locale)}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isRTL ? "المبلغ المصروف (دج)" : "Amount (DZD)"} *
              </label>
              <input
                type="number"
                required
                min={1}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isRTL ? "عن شهر" : "For Month"}
              </label>
              <input
                type="month"
                required
                value={monthYear}
                onChange={(e) => setMonthYear(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isRTL ? "تاريخ الصرف" : "Payment Date"}
              </label>
              <input
                type="date"
                required
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isRTL ? "طريقة الدفع" : "Method"}
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="CASH">{isRTL ? "نقدًا (Cash)" : "Cash"}</option>
                <option value="BARIDIMOB">{isRTL ? "بريديموب (BaridiMob)" : "BaridiMob"}</option>
                <option value="CCP">{isRTL ? "تحويل بريدي (CCP)" : "CCP"}</option>
                <option value="BANK_TRANSFER">{isRTL ? "تحويل بنكي" : "Bank Transfer"}</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {isRTL ? "ملاحظات (اختياري)" : "Notes (Optional)"}
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={isRTL ? "مثال: دفعة أولى، تسوية شهر فيفري..." : "e.g. First installment"}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
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
              className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-950 hover:bg-slate-800 text-white shadow-sm flex items-center gap-1.5 transition-all disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{isRTL ? "جاري التسجيل..." : "Processing..."}</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>{isRTL ? "تأكيد صرف الراتب" : "Confirm Payment"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
