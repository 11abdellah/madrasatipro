"use client";

import React, { useState } from "react";
import { X, Check, TrendingDown, AlertCircle, Loader2 } from "lucide-react";
import { getAlgiersTodayStr } from "@/lib/utils";
import { Locale } from "@/types";

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  locale: Locale;
  onExpenseAdded: () => void;
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen,
  onClose,
  locale,
  onExpenseAdded,
}) => {
  const isRTL = locale === "ar";
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("RENT");
  const [amount, setAmount] = useState<number | "">("");
  const [expenseDate, setExpenseDate] = useState(getAlgiersTodayStr());
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const categories = [
    { value: "RENT", labelAr: "كراء المقر", labelEn: "Rent" },
    { value: "UTILITIES", labelAr: "كهرباء، ماء، غاز (سونلغاز)", labelEn: "Utilities" },
    { value: "INTERNET", labelAr: "اشتراك الإنترنت والهاتف", labelEn: "Internet & Telecom" },
    { value: "MAINTENANCE", labelAr: "صيانة وتصليحات", labelEn: "Maintenance" },
    { value: "EQUIPMENT", labelAr: "تجهيزات وأدوات ومطبوعات", labelEn: "Equipment & Supplies" },
    { value: "MARKETING", labelAr: "تسويق وإعلانات", labelEn: "Marketing" },
    { value: "CLEANING", labelAr: "نظافة ومواد تعقيم", labelEn: "Cleaning" },
    { value: "OTHER", labelAr: "مصاريف تشغيلية أخرى", labelEn: "Other" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!description.trim()) {
      setErrorMsg(isRTL ? "يرجى كتابة وصف للمصروف" : "Description is required");
      return;
    }

    if (!amount || Number(amount) <= 0) {
      setErrorMsg(isRTL ? "يرجى كتابة مبلغ صحيح أكبر من الصفر" : "Amount must be greater than zero");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/finance/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: description.trim(),
          category,
          amount: Number(amount),
          expenseDate,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "تعذر تسجيل المصروف");
      }

      setDescription("");
      setAmount("");
      onExpenseAdded();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "حدث خطأ أثناء حفظ المصروف");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                {isRTL ? "تسجيل مصروف جديد" : "Record New Expense"}
              </h3>
              <p className="text-xs text-slate-500">
                {isRTL ? "المصاريف التشغيلية والجانبية للمؤسسة" : "Operational and side expenses"}
              </p>
            </div>
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

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {isRTL ? "وصف المصروف" : "Description"} *
            </label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={isRTL ? "مثال: فاتورة الغاز والكهرباء لشهر فيفري" : "e.g. Electricity bill"}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {isRTL ? "تصنيف المصروف" : "Category"}
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              {categories.map((c) => (
                <option key={c.value} value={c.value}>
                  {isRTL ? c.labelAr : c.labelEn}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isRTL ? "المبلغ (دج)" : "Amount (DZD)"} *
              </label>
              <input
                type="number"
                required
                min={1}
                value={amount}
                onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : "")}
                placeholder="0"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isRTL ? "تاريخ المصروف" : "Date"}
              </label>
              <input
                type="date"
                required
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
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
              className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-sm flex items-center gap-1.5 transition-all disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{isRTL ? "جاري التسجيل..." : "Saving..."}</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>{isRTL ? "تسجيل المصروف" : "Record Expense"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
