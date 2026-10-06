"use client";

import React from "react";
import { X, Printer, CheckCircle, FileText, Download } from "lucide-react";
import { formatDZD } from "@/lib/utils";
import { Locale } from "@/types";

interface InvoiceReceiptModalProps {
  invoice: any | null;
  payment?: any | null;
  isOpen: boolean;
  onClose: () => void;
  locale: Locale;
}

export const InvoiceReceiptModal: React.FC<InvoiceReceiptModalProps> = ({
  invoice,
  payment,
  isOpen,
  onClose,
  locale,
}) => {
  const isRTL = locale === "ar";
  if (!isOpen || (!invoice && !payment)) return null;

  const handlePrint = () => {
    window.print();
  };

  const invoiceNumber = invoice?.invoiceNumber || (payment?.invoiceId ? `INV-${payment.invoiceId.slice(-6).toUpperCase()}` : "—");
  const receiptNumber = payment?.receiptNumber || "—";
  const studentName = invoice?.studentName || payment?.studentName || "طالب مسجل";
  const amount = payment?.amount || invoice?.amountPaid || invoice?.finalTotal || 0;
  const paymentDate = payment?.paymentDate || invoice?.issueDate || new Date().toISOString().split("T")[0];
  const paymentMethod = payment?.method || "CASH";

  const methodLabel = {
    CASH: isRTL ? "نقداً (Cash)" : "Cash",
    BARIDIMOB: isRTL ? "بريديموب (BaridiMob)" : "BaridiMob",
    CCP: isRTL ? "حوالة بريدية (CCP)" : "CCP",
    BANK_TRANSFER: isRTL ? "تحويل بنكي" : "Bank Transfer",
    OTHER: isRTL ? "أخرى" : "Other",
  }[paymentMethod as string] || paymentMethod;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 md:p-8 space-y-5 text-right rtl:text-right ltr:text-left print:p-0 print:shadow-none print:border-none print:m-0">
        {/* Header Actions */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 print:hidden">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">
                {isRTL ? "وصل سداد وفاتورة رسمية" : "Official Receipt & Invoice"}
              </h3>
              <p className="text-[10px] text-slate-500 font-medium">MadrasatiPro Cloud ERP</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{isRTL ? "طباعة الوصل" : "Print"}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Receipt Body */}
        <div className="space-y-4 print:space-y-3">
          {/* Institution Header */}
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h2 className="text-base font-black text-slate-900">مدرستي برو (MadrasatiPro)</h2>
              <p className="text-[10px] text-slate-500">إيصال سداد رسوم تعليمية معتمد</p>
            </div>
            <div className="text-left rtl:text-left ltr:text-right text-[11px]">
              <span className="font-bold text-slate-800 block">رقم الفاتورة: <span className="font-mono text-indigo-700">{invoiceNumber}</span></span>
              {receiptNumber !== "—" && (
                <span className="text-[10px] text-slate-500 block">رقم الوصل: <span className="font-mono">{receiptNumber}</span></span>
              )}
            </div>
          </div>

          {/* Student & Date Info */}
          <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-100 grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 block font-bold">اسم الطالب:</span>
              <span className="font-extrabold text-slate-900 text-sm">{studentName}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-bold">تاريخ الدفع:</span>
              <span className="font-bold text-slate-800">{paymentDate}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-bold">طريقة الدفع:</span>
              <span className="font-bold text-slate-800">{methodLabel}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-bold">حالة الفاتورة:</span>
              <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
                {isRTL ? "تم السداد (PAID)" : "PAID"}
              </span>
            </div>
          </div>

          {/* Line Items */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
            <table className="w-full text-right">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] font-bold">
                <tr>
                  <th className="py-2 px-3">البيان / الوصف</th>
                  <th className="py-2 px-3 text-left rtl:text-left ltr:text-right">المبلغ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-2.5 px-3 font-medium text-slate-800">
                    {invoice?.items?.[0]?.description || "اشتراك شهري ورسوم تعليمية مستحقة"}
                  </td>
                  <td className="py-2.5 px-3 text-left rtl:text-left ltr:text-right font-black text-slate-900">
                    {formatDZD(amount, locale)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Total Due & Paid */}
          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 flex items-center justify-between">
            <span className="font-black text-emerald-950 text-xs">إجمالي المبلغ المدفوع:</span>
            <span className="text-xl font-black text-emerald-700">{formatDZD(amount, locale)}</span>
          </div>

          {/* Stamp Note */}
          <div className="pt-2 text-center text-[10px] text-slate-400 font-medium">
            <p>تم تحصيل هذا المبلغ وتسجيله في سجلات المؤسسة التعليمية عبر نظام مدرستي برو.</p>
            <p className="mt-0.5 font-mono text-[9px]">Receipt Token: {receiptNumber !== "—" ? receiptNumber : invoiceNumber}</p>
          </div>
        </div>

        {/* Modal Close Button */}
        <div className="pt-2 flex items-center justify-end print:hidden">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl font-bold bg-slate-950 hover:bg-slate-800 text-white text-xs transition"
          >
            {isRTL ? "إغلاق النافذة" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
};
