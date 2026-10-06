"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Download,
  Printer,
  CheckCircle2,
  Clock,
  AlertTriangle,
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  DollarSign,
  Wallet,
  TrendingDown,
  Users,
  Receipt,
  Building,
  RefreshCw,
  Loader2,
  Calendar,
} from "lucide-react";
import { formatDZD, formatDateAlgiers, getAlgiersCurrentMonth } from "@/lib/utils";
import { Invoice, Locale } from "@/types";
import { PayTeacherSalaryModal } from "./PayTeacherSalaryModal";
import { AddExpenseModal } from "./AddExpenseModal";
import { InvoiceReceiptModal } from "./InvoiceReceiptModal";

interface FinanceViewProps {
  locale: Locale;
}

export const FinanceView: React.FC<FinanceViewProps> = ({ locale }) => {
  const isRTL = locale === "ar";
  const [activeTab, setActiveTab] = useState<"invoices" | "salaries" | "expenses">("invoices");

  // Invoices & Payments State
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [payAmount, setPayAmount] = useState(4000);
  const [payMethod, setPayMethod] = useState("CASH");
  const [payNotes, setPayNotes] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [receiptModalData, setReceiptModalData] = useState<{ invoice: any; payment?: any } | null>(null);

  // Teacher Salaries State
  const [salariesData, setSalariesData] = useState<{
    teachers: any[];
    summary: { totalGross: number; totalPaid: number; totalRemaining: number; teachersCount: number };
  }>({
    teachers: [],
    summary: { totalGross: 0, totalPaid: 0, totalRemaining: 0, teachersCount: 0 },
  });
  const [selectedTeacherForPay, setSelectedTeacherForPay] = useState<any | null>(null);

  // Side Expenses State
  const [expenses, setExpenses] = useState<any[]>([]);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [showExpenseModal, setShowExpenseModal] = useState(false);

  // Global Loading & Toast
  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3500);
  };

  const fetchInvoices = async () => {
    try {
      const res = await fetch("/api/finance/invoices");
      const data = await res.json();
      if (data.invoices) setInvoices(data.invoices);
    } catch (err) {
      console.error("Failed to load invoices:", err);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await fetch("/api/students");
      const data = await res.json();
      if (data.students) {
        setStudents(data.students);
        if (data.students.length > 0 && !selectedStudentId) {
          const first = data.students[0];
          setSelectedStudentId(first.id);
          setPayAmount(first.monthlyFee || 4000);
        }
      }
    } catch (err) {
      console.error("Failed to load students:", err);
    }
  };

  const fetchSalaries = async () => {
    try {
      const res = await fetch("/api/finance/salaries");
      const data = await res.json();
      if (data && data.teachers) {
        setSalariesData({
          teachers: data.teachers,
          summary: data.summary || { totalGross: 0, totalPaid: 0, totalRemaining: 0, teachersCount: 0 },
        });
      }
    } catch (err) {
      console.error("Failed to load salaries:", err);
    }
  };

  const fetchExpenses = async () => {
    try {
      const res = await fetch("/api/finance/expenses");
      const data = await res.json();
      if (data && data.expenses) {
        // Filter side expenses (exclude SALARIES which are shown in salaries tab)
        const side = data.expenses.filter((e: any) => e.category !== "SALARIES");
        setExpenses(side);
        const sum = side.reduce((acc: number, e: any) => acc + (e.amount || 0), 0);
        setTotalExpenses(sum);
      }
    } catch (err) {
      console.error("Failed to load expenses:", err);
    }
  };

  const refreshAll = async () => {
    setLoading(true);
    await Promise.all([fetchInvoices(), fetchSalaries(), fetchExpenses()]);
    setLoading(false);
  };

  useEffect(() => {
    refreshAll();
  }, []);

  useEffect(() => {
    if (showPaymentModal) {
      setPaymentError("");
      fetchStudents();
    }
  }, [showPaymentModal]);

  const handleRecordPayment = async () => {
    setPaymentError("");
    if (!selectedStudentId) {
      setPaymentError(isRTL ? "يرجى اختيار الطالب" : "Please select a student");
      return;
    }
    if (!payAmount || Number(payAmount) <= 0) {
      setPaymentError(isRTL ? "يرجى إدخال مبلغ صحيح أكبر من الصفر" : "Please enter a valid amount");
      return;
    }

    setPaymentLoading(true);
    try {
      const matchingInv = invoices.find(
        (inv) => inv.studentId === selectedStudentId && inv.status !== "paid"
      );
      const res = await fetch("/api/finance/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: selectedStudentId,
          invoiceId: matchingInv?.id || undefined,
          amount: Number(payAmount),
          method: payMethod,
          notes: payNotes || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "فشل تسجيل الدفعة");
      }

      setShowPaymentModal(false);
      setPayNotes("");
      await refreshAll();
      showToast(isRTL ? "✓ تم تحصيل الدفعة وربط الفاتورة الرسمية بنجاح" : "✓ Payment & invoice recorded successfully");
      if (data.invoice || data.payment) {
        setReceiptModalData({ invoice: data.invoice, payment: data.payment });
      }
    } catch (err: any) {
      setPaymentError(err.message || "فشل تسجيل الدفعة");
    } finally {
      setPaymentLoading(false);
    }
  };

  // Metrics
  const totalCollected = invoices.reduce((acc, inv) => acc + (inv.amountPaid || 0), 0);
  const totalPayrollPaid = salariesData.summary.totalPaid;
  const totalAllExpenses = totalPayrollPaid + totalExpenses;
  const netFinancialResult = totalCollected - totalAllExpenses;

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case "RENT":
        return isRTL ? "كراء المقر" : "Rent";
      case "UTILITIES":
        return isRTL ? "كهرباء وماء وغاز" : "Utilities";
      case "INTERNET":
        return isRTL ? "إنترنت وهاتف" : "Internet";
      case "MAINTENANCE":
        return isRTL ? "صيانة وتصليح" : "Maintenance";
      case "EQUIPMENT":
        return isRTL ? "تجهيزات ومطبوعات" : "Equipment";
      case "MARKETING":
        return isRTL ? "تسويق وإعلانات" : "Marketing";
      case "CLEANING":
        return isRTL ? "نظافة ومواد تعقيم" : "Cleaning";
      default:
        return isRTL ? "مصروف عام" : "Other";
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-slate-950 text-white px-5 py-3 rounded-full text-xs font-bold shadow-2xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {isRTL ? "المركز المالي والحسابات" : "Financial Center & Accounts"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            {isRTL
              ? "إدارة المقبوضات، رواتب الأساتذة، والمصاريف التشغيلية بالدينار الجزائري"
              : "Manage student fees, teacher salaries, and operational expenses in DZD"}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowExpenseModal(true)}
            className="flex items-center gap-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-4 py-2.5 rounded-full text-xs font-bold shadow-sm transition"
          >
            <TrendingDown className="w-4 h-4" />
            <span>{isRTL ? "+ إضافة مصروف" : "+ Add Expense"}</span>
          </button>

          <button
            onClick={() => setShowPaymentModal(true)}
            className="flex items-center gap-2 bg-slate-950 hover:bg-slate-800 text-white px-4 py-2.5 rounded-full text-xs font-bold shadow-md transition"
          >
            <Plus className="w-4 h-4" />
            <span>{isRTL ? "+ تسجيل دفعة طالب" : "+ Record Payment"}</span>
          </button>
        </div>
      </div>

      {/* Top 4 Real Financial Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Collected Revenue */}
        <div className="bg-white p-5 rounded-[24px] border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-bold">{isRTL ? "المدفوعات المحصلة" : "Collected Revenue"}</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Wallet className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-600 my-2">{formatDZD(totalCollected, locale)}</p>
          <span className="text-[11px] text-slate-500 font-medium">
            {totalCollected > 0 ? (isRTL ? "مقبوضات مسجلة في النظام" : "Total collected") : (isRTL ? "0 دج محصلة" : "0 DZD")}
          </span>
        </div>

        {/* 2. Teacher Salaries Paid */}
        <div className="bg-white p-5 rounded-[24px] border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-bold">{isRTL ? "رواتب الأساتذة المصروفة" : "Teacher Payroll Paid"}</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-600 my-2">{formatDZD(totalPayrollPaid, locale)}</p>
          <span className="text-[11px] text-slate-500 font-medium">
            {isRTL ? `المتبقي للصرف: ${formatDZD(salariesData.summary.totalRemaining, locale)}` : `Remaining: ${formatDZD(salariesData.summary.totalRemaining, locale)}`}
          </span>
        </div>

        {/* 3. Side Expenses */}
        <div className="bg-white p-5 rounded-[24px] border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-bold">{isRTL ? "المصاريف الجانبية" : "Side Expenses"}</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <TrendingDown className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-rose-600 my-2">{formatDZD(totalExpenses, locale)}</p>
          <span className="text-[11px] text-slate-500 font-medium">
            {isRTL ? `${expenses.length} مصاريف مسجلة` : `${expenses.length} expense items`}
          </span>
        </div>

        {/* 4. Net Result */}
        <div
          className={`p-5 rounded-[24px] border shadow-sm flex flex-col justify-between ${
            netFinancialResult >= 0 ? "bg-white border-slate-100" : "bg-red-50/50 border-red-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-bold">{isRTL ? "الصافي المالي" : "Net Balance"}</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
          </div>
          <p
            className={`text-2xl font-black my-2 ${
              netFinancialResult >= 0 ? "text-indigo-600" : "text-red-600"
            }`}
          >
            {formatDZD(netFinancialResult, locale)}
          </p>
          <span className="text-[11px] text-slate-500 font-medium">
            {netFinancialResult >= 0 ? (isRTL ? "فائض إيجابي" : "Net surplus") : (isRTL ? "عجز مالي مؤقت" : "Net deficit")}
          </span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab("invoices")}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
            activeTab === "invoices"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Receipt className="w-3.5 h-3.5" />
          <span>{isRTL ? "المداخيل وسندات القبض" : "Invoices & Revenue"}</span>
        </button>

        <button
          onClick={() => setActiveTab("salaries")}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
            activeTab === "salaries"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>{isRTL ? "رواتب الأساتذة" : "Teacher Payroll"}</span>
        </button>

        <button
          onClick={() => setActiveTab("expenses")}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
            activeTab === "expenses"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <TrendingDown className="w-3.5 h-3.5" />
          <span>{isRTL ? "المصاريف الجانبية" : "Side Expenses"}</span>
        </button>
      </div>

      {/* TAB 1: Invoices & Receipts */}
      {activeTab === "invoices" && (
        <div className="bg-white rounded-[28px] border border-slate-100 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.03)] overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-base font-extrabold text-slate-900">
              {isRTL ? "سجل الفواتير وسندات القبض" : "Official Invoices & Receipts"}
            </h2>
            <span className="text-xs font-semibold text-slate-500">
              {isRTL ? "العملة: الدينار الجزائري (دج)" : "Currency: DZD"}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right rtl:text-right ltr:text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-3.5 px-5">{isRTL ? "رقم السند" : "Invoice #"}</th>
                  <th className="py-3.5 px-4">{isRTL ? "التلميذ" : "Student"}</th>
                  <th className="py-3.5 px-4">{isRTL ? "التاريخ" : "Date"}</th>
                  <th className="py-3.5 px-4">{isRTL ? "المبلغ الإجمالي" : "Total"}</th>
                  <th className="py-3.5 px-4">{isRTL ? "المدفوع" : "Paid"}</th>
                  <th className="py-3.5 px-4">{isRTL ? "المتبقي" : "Remaining"}</th>
                  <th className="py-3.5 px-4">{isRTL ? "الحالة" : "Status"}</th>
                  <th className="py-3.5 px-4 text-center">{isRTL ? "الفاتورة" : "Invoice"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-14 text-center text-slate-400">
                      <Receipt className="w-9 h-9 mx-auto mb-2 text-slate-300" />
                      <p className="text-xs font-bold text-slate-700">
                        {isRTL ? "لا توجد فواتير أو مقبوضات مسجلة بعد" : "No invoices recorded yet"}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        {isRTL ? "اضغط على زر '+ تسجيل دفعة طالب' أعلاه لتسجيل أول مدفوعة" : "Click '+ Record Payment' above"}
                      </p>
                    </td>
                  </tr>
                ) : (
                  invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-5 font-mono font-bold text-slate-900">
                        {inv.invoiceNumber}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-800">
                        {inv.studentName}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                        {inv.issueDate}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {formatDZD(inv.finalTotal, locale)}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-emerald-600">
                        {formatDZD(inv.amountPaid, locale)}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-rose-600">
                        {formatDZD(inv.remainingBalance, locale)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            inv.status === "paid"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : inv.status === "partially_paid"
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-rose-50 text-rose-700 border border-rose-200"
                          }`}
                        >
                          {inv.status === "paid" && (isRTL ? "خالص ✓" : "Paid")}
                          {inv.status === "partially_paid" && (isRTL ? "مدفوع جزئياً" : "Partial")}
                          {inv.status === "unpaid" && (isRTL ? "غير مسدد" : "Unpaid")}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => setReceiptModalData({ invoice: inv })}
                          className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                          title={isRTL ? "عرض وطباعة الفاتورة والوصل" : "View Invoice Receipt"}
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Teacher Payroll */}
      {activeTab === "salaries" && (
        <div className="bg-white rounded-[28px] border border-slate-100 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.03)] overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                {isRTL ? "كشف رواتب ومستحقات هيئة التدريس" : "Teacher Payroll Records"}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {isRTL
                  ? "حساب الساعات المنجزة أسبوعياً وشهرياً والمستحقات بالدينار الجزائري"
                  : "Calculation of weekly/monthly hours and remuneration in DZD"}
              </p>
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 font-mono">
              شهر {getAlgiersCurrentMonth()}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right rtl:text-right ltr:text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-3.5 px-5">{isRTL ? "الأستاذ" : "Teacher"}</th>
                  <th className="py-3.5 px-4">{isRTL ? "الأفواج والساعات" : "Groups & Hours"}</th>
                  <th className="py-3.5 px-4">{isRTL ? "سعر الساعة / الراتب" : "Rate / Base"}</th>
                  <th className="py-3.5 px-4">{isRTL ? "المستحق الإجمالي" : "Gross Due"}</th>
                  <th className="py-3.5 px-4">{isRTL ? "المصروف (المدفوع)" : "Paid"}</th>
                  <th className="py-3.5 px-4">{isRTL ? "المتبقي" : "Remaining"}</th>
                  <th className="py-3.5 px-4">{isRTL ? "الحالة" : "Status"}</th>
                  <th className="py-3.5 px-5 text-center">{isRTL ? "الإجراء" : "Action"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {salariesData.teachers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-14 text-center text-slate-400">
                      <Users className="w-9 h-9 mx-auto mb-2 text-slate-300" />
                      <p className="text-xs font-bold text-slate-700">
                        {isRTL ? "لا يوجد أساتذة مسجلين حالياً" : "No teachers registered"}
                      </p>
                    </td>
                  </tr>
                ) : (
                  salariesData.teachers.map((t) => (
                    <tr key={t.teacherId} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-5">
                        <p className="font-bold text-slate-900">{t.fullName}</p>
                        <p className="text-[11px] text-slate-500">{t.specialization || "هيئة التدريس"}</p>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">
                        <span className="font-bold">{t.groupsCount} أفواج</span>
                        <span className="text-[11px] text-slate-500 block">
                          {t.monthlyHours} ساعة / شهر
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-800">
                        {t.wageType === "fixed" ? (
                          <span>{formatDZD(t.fixedSalary || 0, locale)} (ثابت)</span>
                        ) : (
                          <span>{formatDZD(t.hourlyRate || 0, locale)} / س</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {formatDZD(t.grossSalary, locale)}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-emerald-600">
                        {formatDZD(t.amountPaid, locale)}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-rose-600">
                        {formatDZD(t.remaining, locale)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            t.status === "PAID"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : t.status === "PARTIAL"
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-rose-50 text-rose-700 border border-rose-200"
                          }`}
                        >
                          {t.status === "PAID" && (isRTL ? "خالص ✓" : "Paid")}
                          {t.status === "PARTIAL" && (isRTL ? "مدفوع جزئياً" : "Partial")}
                          {t.status === "UNPAID" && (isRTL ? "غير مدفوع" : "Unpaid")}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-center">
                        <button
                          onClick={() => setSelectedTeacherForPay(t)}
                          className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold transition shadow-sm"
                        >
                          {isRTL ? "صرف الراتب" : "Pay Salary"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Side Expenses */}
      {activeTab === "expenses" && (
        <div className="bg-white rounded-[28px] border border-slate-100 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.03)] overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                {isRTL ? "سجل المصاريف الجانبية والتشغيلية" : "Operating & Side Expenses"}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {isRTL
                  ? "كراء المقر، فواتير الكهرباء والماء (سونلغاز)، اشتراكات الإنترنت، النظافة، والصيانة"
                  : "Rent, utilities, internet, cleaning, and maintenance"}
              </p>
            </div>
            <button
              onClick={() => setShowExpenseModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isRTL ? "تسجيل مصروف جديد" : "Add Expense"}</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right rtl:text-right ltr:text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-3.5 px-5">{isRTL ? "الوصف والبيان" : "Description"}</th>
                  <th className="py-3.5 px-4">{isRTL ? "التصنيف" : "Category"}</th>
                  <th className="py-3.5 px-4">{isRTL ? "التاريخ" : "Date"}</th>
                  <th className="py-3.5 px-5 text-left rtl:text-left ltr:text-right">{isRTL ? "المبلغ" : "Amount"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {expenses.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-14 text-center text-slate-400">
                      <TrendingDown className="w-9 h-9 mx-auto mb-2 text-slate-300" />
                      <p className="text-xs font-bold text-slate-700">
                        {isRTL ? "لا توجد مصاريف جانبية مسجلة بعد" : "No side expenses recorded"}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        {isRTL ? "اضغط على زر '+ إضافة مصروف' لتسجيل كراء، كهرباء، إنترنت..." : "Click '+ Add Expense' to record rent, bills..."}
                      </p>
                    </td>
                  </tr>
                ) : (
                  expenses.map((e) => (
                    <tr key={e.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-5 font-bold text-slate-900">
                        {e.description}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
                          {getCategoryLabel(e.category)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                        {e.expenseDate}
                      </td>
                      <td className="py-3.5 px-5 font-bold text-rose-600 text-left rtl:text-left ltr:text-right font-mono">
                        {formatDZD(e.amount, locale)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Record Student Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Receipt className="w-4 h-4" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900">
                  {isRTL ? "تسجيل دفعة طالب" : "Record Student Payment"}
                </h3>
              </div>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            {paymentError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{paymentError}</span>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isRTL ? "اختر الطالب" : "Select Student"} *
                </label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.firstName} {s.lastName} ({s.academicLevel} - {s.groupName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isRTL ? "المبلغ المدفوع (دج)" : "Amount (DZD)"} *
                </label>
                <input
                  type="number"
                  min={1}
                  value={payAmount}
                  onChange={(e) => setPayAmount(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isRTL ? "طريقة الدفع" : "Payment Method"}
                </label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="CASH">{isRTL ? "نقدًا (Cash)" : "Cash"}</option>
                  <option value="BARIDIMOB">{isRTL ? "بريديموب (BaridiMob)" : "BaridiMob"}</option>
                  <option value="CCP">{isRTL ? "تحويل بريدي (CCP)" : "CCP"}</option>
                  <option value="BANK_TRANSFER">{isRTL ? "تحويل بنكي" : "Bank Transfer"}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isRTL ? "ملاحظات السند" : "Notes"}
                </label>
                <input
                  type="text"
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  placeholder={isRTL ? "مثال: اشتراك شهر فيفري 2026..." : "e.g. February 2026 subscription"}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                {isRTL ? "إلغاء" : "Cancel"}
              </button>
              <button
                type="button"
                onClick={handleRecordPayment}
                disabled={paymentLoading}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-950 hover:bg-slate-800 text-white shadow-sm flex items-center gap-1.5 transition-all disabled:opacity-60"
              >
                {paymentLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{isRTL ? "جاري التسجيل..." : "Processing..."}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isRTL ? "تأكيد واستخراج السند" : "Confirm & Save"}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pay Teacher Salary Modal */}
      <PayTeacherSalaryModal
        teacher={selectedTeacherForPay}
        isOpen={Boolean(selectedTeacherForPay)}
        onClose={() => setSelectedTeacherForPay(null)}
        locale={locale}
        onPaymentRecorded={() => {
          showToast(isRTL ? "✓ تم صرف الراتب وإدراجه في المصاريف" : "✓ Salary payment recorded");
          refreshAll();
        }}
      />

      {/* Add Side Expense Modal */}
      <AddExpenseModal
        isOpen={showExpenseModal}
        onClose={() => setShowExpenseModal(false)}
        locale={locale}
        onExpenseAdded={() => {
          showToast(isRTL ? "✓ تم تسجيل المصروف بنجاح" : "✓ Expense recorded successfully");
          refreshAll();
        }}
      />

      {/* Invoice Receipt Printable Modal */}
      <InvoiceReceiptModal
        isOpen={Boolean(receiptModalData)}
        invoice={receiptModalData?.invoice || null}
        payment={receiptModalData?.payment || null}
        onClose={() => setReceiptModalData(null)}
        locale={locale}
      />
    </div>
  );
};
