"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  X,
  Printer,
  Download,
  Building2,
  GraduationCap,
  Calendar,
  Phone,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  User,
  Share2,
} from "lucide-react";
import { Locale } from "@/types";

interface StudentCardData {
  studentId: string;
  studentNumber: string;
  fullName: string;
  firstName: string;
  lastName: string;
  photoUrl: string | null;
  gender: string;
  dateOfBirth: string | null;
  academicLevel: string;
  stream: string | null;
  groupName: string | null;
  phone: string;
  studentWilaya: string;
  enrollmentDate: string | null;
  status: string;

  institutionId: string;
  institutionName: string;
  institutionLogo: string | null;
  institutionWilaya: string;
  institutionAddress: string | null;
  institutionPhone: string | null;
  academicYear: string;
}

interface StudentCardModalProps {
  studentId: string | null;
  isOpen: boolean;
  onClose: () => void;
  locale?: Locale;
}

export const StudentCardModal: React.FC<StudentCardModalProps> = ({
  studentId,
  isOpen,
  onClose,
  locale = "ar",
}) => {
  const isRTL = locale === "ar";
  const [card, setCard] = useState<StudentCardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (isOpen && studentId) {
      setLoading(true);
      setErrorMsg("");
      fetch(`/api/students/${studentId}/card`)
        .then((res) => {
          if (!res.ok) throw new Error("تعذر تحميل بيانات بطاقة التلميذ");
          return res.json();
        })
        .then((data) => {
          if (data.card) {
            setCard(data.card);
          } else {
            throw new Error("بيانات البطاقة غير متوفرة");
          }
        })
        .catch((err) => {
          console.error("Error loading student card:", err);
          setErrorMsg(err.message || "حدث خطأ أثناء تحميل بطاقة التلميذ");
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setCard(null);
    }
  }, [isOpen, studentId]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      {/* Dedicated Print Style Override */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #student-card-print-area,
          #student-card-print-area * {
            visibility: visible !important;
          }
          #student-card-print-area {
            position: fixed !important;
            left: 50% !important;
            top: 50% !important;
            transform: translate(-50%, -50%) !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: 1.5px solid #cbd5e1 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            background-color: white !important;
          }
          @page {
            size: auto;
            margin: 10mm;
          }
        }
      `}</style>

      <div
        dir="rtl"
        className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in"
      >
        <div className="bg-white rounded-[32px] w-full max-w-xl border border-slate-100 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
          {/* Top Modal Header */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-orange-100 text-[#F47A3C] flex items-center justify-center">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">بطاقة المتمدرس الرسمية</h2>
                <p className="text-[11px] text-slate-500">معاينة وطباعة بطاقة التعريف المدرسية للطالب</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 overflow-y-auto flex-1 flex flex-col items-center justify-center bg-slate-50/40">
            {loading ? (
              <div className="py-16 flex flex-col items-center justify-center space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-[#F47A3C]" />
                <p className="text-xs text-slate-500 font-bold">جارٍ تجهيز بطاقة المتمدرس...</p>
              </div>
            ) : errorMsg ? (
              <div className="p-6 text-center space-y-2">
                <p className="text-sm font-bold text-rose-600">{errorMsg}</p>
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition"
                >
                  إغلاق
                </button>
              </div>
            ) : card ? (
              <div className="w-full flex flex-col items-center space-y-5">
                {/* Visual Student Card Container */}
                <div
                  id="student-card-print-area"
                  className="w-full max-w-[460px] aspect-[1.586/1] bg-white rounded-2xl border-2 border-slate-200 shadow-xl overflow-hidden flex flex-col justify-between text-right relative select-none font-sans"
                  style={{
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)",
                  }}
                >
                  {/* Subtle Background Pattern & Watermark */}
                  <div className="absolute inset-0 pointer-events-none opacity-[0.03] flex items-center justify-center">
                    <GraduationCap className="w-72 h-72 text-slate-900" />
                  </div>

                  {/* Card Header Band: Institution Identity */}
                  <div className="bg-gradient-to-r from-slate-900 via-[#1e293b] to-slate-900 text-white px-4 py-3 flex items-center justify-between relative z-10 border-b-2 border-[#F47A3C]">
                    <div className="flex items-center gap-2.5">
                      {/* Institution Logo Priority */}
                      <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center shrink-0 shadow-sm overflow-hidden border border-slate-200">
                        {card.institutionLogo ? (
                          <img
                            src={card.institutionLogo}
                            alt={card.institutionName}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <Building2 className="w-5 h-5 text-[#F47A3C]" />
                        )}
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-xs font-black tracking-tight leading-tight text-white line-clamp-1">
                          {card.institutionName}
                        </p>
                        <p className="text-[10px] text-slate-300 font-medium flex items-center gap-1.5">
                          <span>{card.institutionWilaya}</span>
                          <span>•</span>
                          <span className="text-orange-300 font-bold">{card.academicYear}</span>
                        </p>
                      </div>
                    </div>

                    <div className="text-left shrink-0">
                      <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#F47A3C] text-white text-[10px] font-black tracking-wide shadow-xs">
                        بطاقة متمدرس
                      </span>
                    </div>
                  </div>

                  {/* Card Middle: Photo + Student Details */}
                  <div className="p-4 flex items-center gap-4 flex-1 relative z-10">
                    {/* Student Photo / Avatar */}
                    <div className="shrink-0 flex flex-col items-center">
                      <div className="w-24 h-28 rounded-xl border-2 border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center shadow-inner relative">
                        {card.photoUrl ? (
                          <img
                            src={card.photoUrl}
                            alt={card.fullName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-orange-50 to-orange-100 text-[#F47A3C]">
                            <User className="w-10 h-10 mb-1 opacity-80" />
                            <span className="text-[10px] font-black uppercase text-slate-700">
                              {card.firstName.slice(0, 1)}.{card.lastName.slice(0, 1)}
                            </span>
                          </div>
                        )}
                      </div>
                      <span className="text-[9px] font-bold text-slate-500 mt-1">تلميذ مسجل</span>
                    </div>

                    {/* Student Bio Details */}
                    <div className="flex-1 space-y-1.5 text-slate-800">
                      {/* Name */}
                      <div>
                        <span className="text-[9px] text-slate-400 font-bold block">الاسم واللقب</span>
                        <h3 className="text-sm sm:text-base font-black text-slate-900 leading-tight">
                          {card.fullName}
                        </h3>
                      </div>

                      {/* Registration ID Number */}
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] text-slate-400 font-bold">رقم القيد:</span>
                        <span className="font-mono text-xs font-black text-[#F47A3C] bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200/60">
                          {card.studentNumber}
                        </span>
                      </div>

                      {/* Level & Group */}
                      <div className="grid grid-cols-2 gap-2 pt-0.5 text-xs">
                        <div>
                          <span className="text-[9px] text-slate-400 font-bold block">المستوى الدراسي:</span>
                          <span className="font-extrabold text-slate-900 text-[11px]">
                            {card.academicLevel} {card.stream ? `• ${card.stream}` : ""}
                          </span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 font-bold block">الفوج:</span>
                          <span className="font-extrabold text-[#18B89C] text-[11px] line-clamp-1">
                            {card.groupName || "فوج عام"}
                          </span>
                        </div>
                      </div>

                      {/* Date of Birth or Phone if available */}
                      <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-600 pt-0.5">
                        {card.dateOfBirth && (
                          <div>
                            <span className="text-slate-400 font-bold">الميلاد: </span>
                            <span className="font-semibold text-slate-800">{card.dateOfBirth}</span>
                          </div>
                        )}
                        {card.phone && (
                          <div>
                            <span className="text-slate-400 font-bold">الهاتف: </span>
                            <span className="font-mono font-semibold text-slate-800">{card.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom Footer: QR & Official Watermark */}
                  <div className="bg-slate-50 border-t border-slate-200 px-4 py-2 flex items-center justify-between text-[9px] text-slate-500 relative z-10">
                    <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>بطاقة معتمدة للموسم الدراسي {card.academicYear}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 text-[8px] font-mono">MadrasatiPro ERP</span>
                      <div className="w-5 h-5 rounded bg-white border border-slate-300 flex items-center justify-center p-0.5">
                        <QrCode className="w-full h-full text-slate-700" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Print Advice Note */}
                <p className="text-[11px] text-slate-500 text-center">
                  💡 نصيحة: يمكنك طباعة هذه البطاقة مباشرة بصيغة PVC أو ورق مقوى للطلاب لاستخدامها في تسجيل الحضور ودخول القاعات.
                </p>
              </div>
            ) : null}
          </div>

          {/* Modal Footer Action Buttons */}
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-full border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              إغلاق
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                disabled={!card || loading}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#18B89C] hover:bg-[#149B83] text-white text-xs font-black shadow-md shadow-teal-600/20 transition cursor-pointer disabled:opacity-50"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة البطاقة</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
