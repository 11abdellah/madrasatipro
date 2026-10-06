"use client";

import React, { useState } from "react";
import { X, Phone, User, Calendar, CheckCircle, Clock, AlertCircle, FileText, Wallet, CreditCard } from "lucide-react";
import { Student, Locale } from "@/types";
import { formatDZD } from "@/lib/utils";

interface StudentDetailDrawerProps {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
  locale: Locale;
  onViewCard?: (studentId: string) => void;
}

export const StudentDetailDrawer: React.FC<StudentDetailDrawerProps> = ({
  student,
  isOpen,
  onClose,
  locale,
  onViewCard,
}) => {
  const isRTL = locale === "ar";
  const [activeTab, setActiveTab] = useState<"overview" | "attendance" | "grades" | "payments">("overview");

  if (!isOpen || !student) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end animate-in fade-in">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l rtl:border-l-0 rtl:border-r border-slate-200 animate-in slide-in-from-right rtl:slide-in-from-left duration-300">
        {/* Top Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 font-extrabold text-base flex items-center justify-center border border-indigo-200">
              {student.firstName[0]}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {student.firstName} {student.lastName}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {student.academicLevel} • {student.groupName}
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

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-100 px-4 bg-white">
          <button
            onClick={() => setActiveTab("overview")}
            className={`py-3 px-3 text-xs font-bold border-b-2 transition ${
              activeTab === "overview"
                ? "border-slate-950 text-slate-950"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            {isRTL ? "نظرة عامة" : "Overview"}
          </button>
          <button
            onClick={() => setActiveTab("attendance")}
            className={`py-3 px-3 text-xs font-bold border-b-2 transition ${
              activeTab === "attendance"
                ? "border-slate-950 text-slate-950"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            {isRTL ? "الحضور (95%)" : "Attendance"}
          </button>
          <button
            onClick={() => setActiveTab("payments")}
            className={`py-3 px-3 text-xs font-bold border-b-2 transition ${
              activeTab === "payments"
                ? "border-slate-950 text-slate-950"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            {isRTL ? "المالية" : "Payments"}
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs text-right rtl:text-right ltr:text-left">
          {activeTab === "overview" && (
            <div className="space-y-4">
              {/* Student Card Action Banner */}
              {onViewCard && (
                <button
                  type="button"
                  onClick={() => onViewCard(student.id)}
                  className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 border border-orange-200 text-right flex items-center justify-between hover:shadow-md hover:border-orange-300 transition group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#F47A3C] text-white flex items-center justify-center shadow-xs">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-900">بطاقة المتمدرس الرقمية</p>
                      <p className="text-[10px] text-slate-500">معاينة، تحميل وطباعة البطاقة المدرسية</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-[#F47A3C] bg-white px-3 py-1 rounded-full border border-orange-200 shadow-xs group-hover:bg-[#F47A3C] group-hover:text-white transition">
                    عرض البطاقة ←
                  </span>
                </button>
              )}

              {/* Financial Status Summary */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-[11px] text-slate-500">{isRTL ? "الرصيد المستحق" : "Balance Due"}</p>
                  <p className="text-base font-extrabold text-slate-900">
                    {formatDZD(student.balance, locale)}
                  </p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                  student.balance === 0 ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                }`}>
                  {student.balance === 0 ? (isRTL ? "خالص ✓" : "Paid") : (isRTL ? "متأخر ⚠" : "Due")}
                </span>
              </div>

              {/* Information Cards */}
              <div className="space-y-2.5">
                <div className="p-3 rounded-xl border border-slate-100 bg-white">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">{isRTL ? "الهاتف" : "Phone"}</span>
                  <span className="text-slate-900 font-bold">{student.phone}</span>
                </div>
                <div className="p-3 rounded-xl border border-slate-100 bg-white">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">{isRTL ? "الولاية والعنوان" : "Wilaya"}</span>
                  <span className="text-slate-900 font-bold">{student.wilayaName} ({student.address || "وسط المدينة"})</span>
                </div>
                <div className="p-3 rounded-xl border border-slate-100 bg-white">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">{isRTL ? "ولي الأمر" : "Parent"}</span>
                  <span className="text-slate-900 font-bold">{student.parentName} ({student.parentRelationship}) — {student.parentPhone}</span>
                </div>
                <div className="p-3 rounded-xl border border-slate-100 bg-white">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">{isRTL ? "تاريخ التسجيل" : "Enrollment Date"}</span>
                  <span className="text-slate-900 font-bold">{student.enrollmentDate}</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "attendance" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b">
                <span className="font-bold text-slate-800">{isRTL ? "سجل آخر الحصص" : "Recent Attendance"}</span>
                <span className="text-emerald-600 font-bold">95% {isRTL ? "نسبة الحضور" : "Attendance"}</span>
              </div>
              <div className="space-y-2">
                <div className="p-2.5 rounded-xl border border-slate-100 flex items-center justify-between bg-emerald-50/40">
                  <span>الأربعاء 26 فيفري — رياضيات</span>
                  <span className="text-emerald-700 font-bold">حاضر ✓</span>
                </div>
                <div className="p-2.5 rounded-xl border border-slate-100 flex items-center justify-between bg-emerald-50/40">
                  <span>السبت 22 فيفري — فيزياء</span>
                  <span className="text-emerald-700 font-bold">حاضر ✓</span>
                </div>
                <div className="p-2.5 rounded-xl border border-slate-100 flex items-center justify-between bg-rose-50/40">
                  <span>الثلاثاء 18 فيفري — رياضيات</span>
                  <span className="text-rose-700 font-bold">غائب (مبرر)</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "payments" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b">
                <span className="font-bold text-slate-800">{isRTL ? "الفواتير والدفعات" : "Invoices & Payments"}</span>
              </div>
              <div className="space-y-2">
                <div className="p-3 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900">فاتورة شهر فيفري 2026</p>
                    <p className="text-[10px] text-slate-500">FC-2026/0189 • نقدًا</p>
                  </div>
                  <span className="text-emerald-700 font-extrabold">4,000 دج</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
