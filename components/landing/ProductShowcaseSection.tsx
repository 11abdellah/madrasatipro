"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Users,
  GraduationCap,
  CalendarDays,
  DoorOpen,
  ClipboardCheck,
  Award,
  FileText,
  Wallet,
  BarChart3,
  Sliders,
  Check,
  ArrowLeft,
  Printer,
  Sparkles,
  Clock,
  Search,
  Building2,
  TrendingUp,
  DollarSign,
  ShieldCheck,
  Share2,
  CheckCircle2,
  Hash,
  QrCode,
} from "lucide-react";

export const ProductShowcaseSection: React.FC = () => {
  return (
    <section id="features" className="py-24 bg-[#FFF9F5] border-b border-orange-100/60 z-10 relative overflow-hidden">
      {/* Background Soft Glows */}
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-orange-200/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-0 w-[500px] h-[500px] bg-teal-200/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-24 relative z-10">
        
        {/* Main Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 reveal-on-scroll">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-100/90 text-[#F47A3C] border border-orange-200 text-xs font-black shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>جولة بصرية في النظام</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#17191D] tracking-tight leading-tight">
            كل ما تحتاجه لإدارة مدرستك
          </h2>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            من إدارة التلاميذ والأساتذة إلى الحضور والفواتير والرواتب، كل أدوات مؤسستك في مكان واحد.
          </p>
        </div>

        {/* ============================================================== */}
        {/* 1. STUDENTS SHOWCASE (Text Right / Visual Left) */}
        {/* ============================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center reveal-on-scroll">
          {/* Text Column */}
          <div className="lg:col-span-5 space-y-5 text-right rtl:text-right ltr:text-left order-1 lg:order-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 text-[#F47A3C] border border-orange-200 text-xs font-black">
              <span>01</span>
              <span>•</span>
              <span>ملفات التلاميذ الرقمية</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-[#17191D] leading-snug">
              إدارة التلاميذ بسهولة
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              أنشئ ملفات التلاميذ وتابع التسجيلات والمدفوعات والحضور من مكان واحد.
            </p>
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center gap-2.5 text-xs text-slate-700">
                <div className="w-5 h-5 rounded-full bg-teal-50 text-[#18B89C] flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>ملف رقمي شامل لكل تلميذ يتضمن ولي الأمر والمدفوعات</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-700">
                <div className="w-5 h-5 rounded-full bg-teal-50 text-[#18B89C] flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>توزيع فوري على الأفواج حسب المستوى والشعبة (BAC و BEM)</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-700">
                <div className="w-5 h-5 rounded-full bg-teal-50 text-[#18B89C] flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>متابعة حالة الاشتراك (خالص، متبقي، أو مؤجل) بلمح البصر</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-700">
                <div className="w-5 h-5 rounded-full bg-teal-50 text-[#18B89C] flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span className="font-bold text-slate-900">إصدار وطباعة فورية لـ <strong>"بطاقة المتمدرس"</strong> الرسمية مع الباركود</span>
              </div>
            </div>
            <div className="pt-2">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 text-xs font-black text-[#F47A3C] hover:text-[#d36128] transition group"
              >
                <span>ابدأ بتسجيل طلابك الآن</span>
                <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Visual Column: Miniature Student Management UI */}
          <div className="lg:col-span-7 order-2 lg:order-2">
            <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-xl shadow-slate-900/5 space-y-4">
              {/* Mini App Bar */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-orange-100 text-[#F47A3C] flex items-center justify-center font-bold">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900">سجل الطلاب المسجلين</h4>
                    <span className="text-[10px] text-slate-400">تحديث لحظي لقاعدة البيانات</span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black border border-emerald-100">
                  +12 طالب هذا الأسبوع
                </span>
              </div>

              {/* Mini Search & Filter */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    readOnly
                    value="فوج 3AS علوم تجريبية"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-1.5 px-8 text-[11px] text-slate-700 font-bold"
                  />
                </div>
                <span className="text-[10px] font-bold px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600">
                  24 / 25 مقعد
                </span>
              </div>

              {/* Mini Students Rows */}
              <div className="space-y-2">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-150 flex items-center justify-between text-xs hover:bg-slate-100/70 transition">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-extrabold flex items-center justify-center text-xs">
                      أ
                    </div>
                    <div>
                      <p className="font-extrabold text-slate-900 text-xs">أمينة بلقاسم</p>
                      <p className="text-[10px] text-slate-500">3AS علوم تجريبية • ولي الأمر: 0661 ** ** 12</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      خالص (4,000 دج)
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-150 flex items-center justify-between text-xs hover:bg-slate-100/70 transition">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-orange-100 text-[#F47A3C] font-extrabold flex items-center justify-center text-xs">
                      م
                    </div>
                    <div>
                      <p className="font-extrabold text-slate-900 text-xs">محمد ياسين بن عيسى</p>
                      <p className="text-[10px] text-slate-500">3AS رياضيات • ولي الأمر: 0550 ** ** 88</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      خالص (4,000 دج)
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-150 flex items-center justify-between text-xs hover:bg-slate-100/70 transition">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-extrabold flex items-center justify-center text-xs">
                      س
                    </div>
                    <div>
                      <p className="font-extrabold text-slate-900 text-xs">سارة حداد</p>
                      <p className="text-[10px] text-slate-500">4AM تحضير BEM • ولي الأمر: 0770 ** ** 44</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                      متبقي: 1,000 دج
                    </span>
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                  </div>
                </div>
              </div>

              {/* Visual Preview: بطاقة المتمدرس الرسمية */}
              <div className="pt-3 border-t border-slate-150">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                    <QrCode className="w-3.5 h-3.5 text-[#F47A3C]" />
                    <span>معاينة واقعية: بطاقة المتمدرس الرسمية</span>
                  </div>
                  <span className="text-[10px] font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Printer className="w-3 h-3" />
                    <span>جاهزة للطباعة والباركود</span>
                  </span>
                </div>

                <div className="rounded-2xl border-2 border-slate-200/90 bg-gradient-to-br from-white via-slate-50 to-orange-50/20 p-3.5 shadow-sm relative overflow-hidden">
                  <div className="bg-slate-900 text-white -m-3.5 mb-3 px-3 py-2 flex items-center justify-between border-b-2 border-[#F47A3C]">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-white p-0.5 flex items-center justify-center">
                        <Building2 className="w-4 h-4 text-[#F47A3C]" />
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black leading-tight text-white">مدرسة النخبة للدروس الخصوصية</p>
                        <p className="text-[8px] text-slate-300">الجزائر العاصمة • بطاقة التلميذ الرسمية</p>
                      </div>
                    </div>
                    <span className="text-[9px] font-black text-orange-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
                      2025 / 2026
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3 text-right">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-900">أمينة بلقاسم</span>
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                          3AS علوم تجريبية
                        </span>
                      </div>
                      <p className="text-[10px] font-bold text-slate-600">
                        رقم التلميذ: <span className="font-mono text-slate-900 font-black">MP-2026-ALG-0128</span>
                      </p>
                      <p className="text-[9px] text-slate-500">
                        الفوج: <span className="font-bold text-slate-700">فوج التفوق (A1)</span> • ولي الأمر: <span className="font-mono">0661 ** ** 12</span>
                      </p>
                    </div>

                    <div className="text-center shrink-0 pl-1">
                      <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 p-1 flex items-center justify-center shadow-xs">
                        <QrCode className="w-full h-full text-slate-800" />
                      </div>
                      <span className="text-[7px] font-mono text-slate-400 block mt-0.5">ALG-0128</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 2. TEACHERS & PAYROLL SHOWCASE (Visual Right / Text Left) */}
        {/* ============================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center reveal-on-scroll">
          {/* Visual Column: Mini Teacher & Payroll UI */}
          <div className="lg:col-span-7 order-2 lg:order-1">
            <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-xl shadow-slate-900/5 space-y-4">
              {/* Teacher Card Header */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center font-extrabold text-indigo-700 text-base">
                    س
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-extrabold text-slate-900">أ. سعيد براهيمي</h4>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                        بالساعة
                      </span>
                    </div>
                    <p className="text-[11px] text-indigo-600 font-bold mt-0.5">
                      العلوم الفيزيائية (شعبة علوم تجريبية ورياضيات)
                    </p>
                  </div>
                </div>
                <span className="text-xs font-black text-slate-900 bg-slate-100 px-2.5 py-1 rounded-xl">
                  1,800 دج / ساعة
                </span>
              </div>

              {/* Manual Hours Single Source Summary Banner */}
              <div className="bg-[#FFF9F5] rounded-2xl p-4 border border-orange-100 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-600">الساعات المسجلة هذا الشهر:</span>
                  <span className="font-black text-indigo-700 text-sm">18.0 ساعة</span>
                </div>
                <div className="flex items-center justify-between text-xs border-t border-orange-200/60 pt-2">
                  <span className="font-bold text-slate-600">المستحق الإجمالي عن الساعات:</span>
                  <span className="font-black text-slate-900 text-sm">32,400 دج</span>
                </div>
                <div className="flex items-center justify-between text-xs border-t border-orange-200/60 pt-2">
                  <span className="font-bold text-slate-600">المتبقي للصرف:</span>
                  <span className="font-black text-rose-600 text-sm">32,400 دج</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1 text-xs">
                <div className="flex-1 py-2 px-3 rounded-xl bg-indigo-50 text-indigo-700 font-extrabold text-center text-[11px] border border-indigo-100">
                  + تسجيل ساعات عمل جديدة
                </div>
                <div className="py-2 px-3 rounded-xl bg-slate-100 text-slate-700 font-bold text-center text-[11px]">
                  السجل والتعديل
                </div>
                <div className="py-2 px-4 rounded-xl bg-slate-950 text-white font-extrabold text-center text-[11px]">
                  صرف الراتب
                </div>
              </div>
            </div>
          </div>

          {/* Text Column */}
          <div className="lg:col-span-5 space-y-5 text-right rtl:text-right ltr:text-left order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-black">
              <span>02</span>
              <span>•</span>
              <span>رواتب وأتعاب الأساتذة</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-[#17191D] leading-snug">
              إدارة الأساتذة والرواتب
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              تابع الأساتذة وسجّل ساعات العمل يدوياً واحسب المستحقات والرواتب بسهولة.
            </p>
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center gap-2.5 text-xs text-slate-700">
                <div className="w-5 h-5 rounded-full bg-teal-50 text-[#18B89C] flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>تسجيل الساعات المنجزة فعلياً يدوياً بدون أي حسابات تلقائية غير دقيقة</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-700">
                <div className="w-5 h-5 rounded-full bg-teal-50 text-[#18B89C] flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>دعم نظام الأساتذة بالساعة أو الأساتذة بالراتب الشهري الثابت</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-700">
                <div className="w-5 h-5 rounded-full bg-teal-50 text-[#18B89C] flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>سجل كامل قابل للتعديل والحذف مع إعادة حساب المستحقات فورياً</span>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 3. GROUPS & SCHEDULE SHOWCASE (Text Right / Visual Left) */}
        {/* ============================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center reveal-on-scroll">
          {/* Text Column */}
          <div className="lg:col-span-5 space-y-5 text-right rtl:text-right ltr:text-left order-1 lg:order-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-[#18B89C] border border-teal-200 text-xs font-black">
              <span>03</span>
              <span>•</span>
              <span>التنظيم الزمني الأسبوعي</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-[#17191D] leading-snug">
              الأفواج والحصص والبرنامج
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              نظّم الأفواج والمواد والحصص والبرنامج الأسبوعي بطريقة واضحة.
            </p>
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center gap-2.5 text-xs text-slate-700">
                <div className="w-5 h-5 rounded-full bg-teal-50 text-[#18B89C] flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>ربط كل فوج بالمادة، الأستاذ، القاعة، وتوقيت الحصة بدقة</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-700">
                <div className="w-5 h-5 rounded-full bg-teal-50 text-[#18B89C] flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>جدول توقيت أسبوعي تفاعلي واضح بدون أي تضارب زمني</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-700">
                <div className="w-5 h-5 rounded-full bg-teal-50 text-[#18B89C] flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>تصفية فورية حسب الأستاذ، الفوج الدراسي، أو القاعة</span>
              </div>
            </div>
          </div>

          {/* Visual Column: Mini Timetable Schedule UI */}
          <div className="lg:col-span-7 order-2 lg:order-2">
            <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-xl shadow-slate-900/5 space-y-3.5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-[#18B89C]" />
                  <span className="text-xs font-black text-slate-900">جدول الحصص — يوم السبت</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  3 حصص مجدولة
                </span>
              </div>

              {/* Sessions Cards */}
              <div className="space-y-2.5">
                <div className="p-3.5 rounded-2xl bg-orange-50/60 border border-orange-200/80 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] font-black text-[#F47A3C] bg-white px-2 py-0.5 rounded-md border border-orange-200">
                      08:30 – 10:30
                    </span>
                    <h5 className="font-extrabold text-slate-900 text-xs mt-1.5">
                      الرياضيات — فوج بكالوريا 3AS
                    </h5>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      أ. نور الدين عمارة • <strong className="text-slate-700">قاعة 02</strong> (24 طالب)
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
                    مؤكدة
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-teal-50/60 border border-teal-200/80 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] font-black text-[#18B89C] bg-white px-2 py-0.5 rounded-md border border-teal-200">
                      10:45 – 12:45
                    </span>
                    <h5 className="font-extrabold text-slate-900 text-xs mt-1.5">
                      العلوم الطبيعية والحياة — 3AS علوم
                    </h5>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      أ. بلحاج • <strong className="text-slate-700">المدرج A</strong> (32 طالب)
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
                    مؤكدة
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-200/80 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] font-black text-indigo-700 bg-white px-2 py-0.5 rounded-md border border-indigo-200">
                      14:00 – 16:00
                    </span>
                    <h5 className="font-extrabold text-slate-900 text-xs mt-1.5">
                      العلوم الفيزيائية — 2AS تقني رياضي
                    </h5>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      أ. سعيد براهيمي • <strong className="text-slate-700">قاعة 01</strong> (20 طالب)
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
                    مؤكدة
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 4. CLASSROOMS SHOWCASE (Visual Right / Text Left) */}
        {/* ============================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center reveal-on-scroll">
          {/* Visual Column: Mini Classrooms Management UI */}
          <div className="lg:col-span-7 order-2 lg:order-1">
            <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-xl shadow-slate-900/5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-orange-100 text-[#F47A3C] flex items-center justify-center font-bold">
                    <DoorOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900">قاعات التدريس والفضاءات</h4>
                    <span className="text-[10px] text-slate-400">إجمالي 3 قاعات مجهزة</span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-black border border-indigo-100">
                  منع التضارب نشط ✓
                </span>
              </div>

              {/* Classroom Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-right space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-white text-slate-700 border border-slate-200">
                      ق-01
                    </span>
                    <span className="text-[10px] font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
                      20 مقعد
                    </span>
                  </div>
                  <h5 className="font-extrabold text-xs text-slate-900">قاعة 01</h5>
                  <p className="text-[10px] text-slate-500 leading-tight">مجهزة بداتاشو ومكيف هواء</p>
                  <span className="text-[9px] font-bold text-emerald-700 block">4 حصص مجدولة</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-right space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-white text-slate-700 border border-slate-200">
                      ق-02
                    </span>
                    <span className="text-[10px] font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
                      15 مقعد
                    </span>
                  </div>
                  <h5 className="font-extrabold text-xs text-slate-900">قاعة 02</h5>
                  <p className="text-[10px] text-slate-500 leading-tight">سبورة ذكية تفاعلية</p>
                  <span className="text-[9px] font-bold text-emerald-700 block">3 حصص مجدولة</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-right space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-white text-slate-700 border border-slate-200">
                      م-01
                    </span>
                    <span className="text-[10px] font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
                      45 مقعد
                    </span>
                  </div>
                  <h5 className="font-extrabold text-xs text-slate-900">المدرج A</h5>
                  <p className="text-[10px] text-slate-500 leading-tight">مدرج رئيسي ومكبر صوت</p>
                  <span className="text-[9px] font-bold text-emerald-700 block">5 حصص مجدولة</span>
                </div>
              </div>

              {/* Conflict Prevention Notification */}
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>حماية ذكية: النظام يرفض برمجياً أي حجز مزدوج لنفس القاعة في نفس الوقت.</span>
              </div>
            </div>
          </div>

          {/* Text Column */}
          <div className="lg:col-span-5 space-y-5 text-right rtl:text-right ltr:text-left order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 text-[#F47A3C] border border-orange-200 text-xs font-black">
              <span>04</span>
              <span>•</span>
              <span>الفضاءات والقاعات</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-[#17191D] leading-snug">
              قاعات التدريس
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              أنشئ قاعات التدريس واربطها بالحصص لتنظيم استعمال المساحات وتجنب التعارضات.
            </p>
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center gap-2.5 text-xs text-slate-700">
                <div className="w-5 h-5 rounded-full bg-teal-50 text-[#18B89C] flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>ضبط طاقة استيعاب كل قاعة بدقة لتفادي تسجيل طلاب فوق الحد</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-700">
                <div className="w-5 h-5 rounded-full bg-teal-50 text-[#18B89C] flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>كشف التضارب آلياً مع رسالة واضحة: «هذه القاعة محجوزة في هذا الوقت»</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-700">
                <div className="w-5 h-5 rounded-full bg-teal-50 text-[#18B89C] flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>حذف آمن ومحمي يمنع إزالة القاعات المرتبطة بحصص حالية</span>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 5. ATTENDANCE SHOWCASE (Text Right / Visual Left) */}
        {/* ============================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center reveal-on-scroll">
          {/* Text Column */}
          <div className="lg:col-span-5 space-y-5 text-right rtl:text-right ltr:text-left order-1 lg:order-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-black">
              <span>05</span>
              <span>•</span>
              <span>الانضباط المدرسي</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-[#17191D] leading-snug">
              الحضور والغياب
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              سجّل حضور التلاميذ وغيابهم بسرعة واحتفظ بسجل منظم.
            </p>
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center gap-2.5 text-xs text-slate-700">
                <div className="w-5 h-5 rounded-full bg-teal-50 text-[#18B89C] flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>تسجيل لحظي وسريع للحضور والغياب والتأخر خلال ثوانٍ</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-700">
                <div className="w-5 h-5 rounded-full bg-teal-50 text-[#18B89C] flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>سجل تاريخي كامل لكل تلميذ لمتابعة الانضباط الفصلي</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-700">
                <div className="w-5 h-5 rounded-full bg-teal-50 text-[#18B89C] flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>حساب نسبة الحضور العامة لكل فوج ولكل أستاذ آلياً</span>
              </div>
            </div>
          </div>

          {/* Visual Column: Mini Attendance UI */}
          <div className="lg:col-span-7 order-2 lg:order-2">
            <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-xl shadow-slate-900/5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h4 className="text-xs font-black text-slate-900">جلسة الحضور — مادة الرياضيات (3AS)</h4>
                  <p className="text-[10px] text-slate-500">السبت 30 سبتمبر • أ. نور الدين</p>
                </div>
                <div className="text-left">
                  <span className="text-xs font-black text-emerald-700">نسبة الحضور: 95.8%</span>
                  <p className="text-[10px] text-slate-400">23 حاضر • 1 غائب</p>
                </div>
              </div>

              {/* Student Attendance List */}
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <span className="font-bold text-slate-900">أمينة بلقاسم</span>
                  <div className="flex items-center gap-1.5">
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-extrabold text-[10px]">
                      حاضر ✓
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-white text-slate-400 text-[10px]">
                      غائب
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <span className="font-bold text-slate-900">محمد ياسين بن عيسى</span>
                  <div className="flex items-center gap-1.5">
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-extrabold text-[10px]">
                      حاضر ✓
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-white text-slate-400 text-[10px]">
                      غائب
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-rose-50/60 border border-rose-200/80 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900">كريم سلطاني</span>
                    <span className="text-[10px] text-rose-600 mr-2">(غياب غير مبرر)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="px-2.5 py-1 rounded-lg bg-white text-slate-400 text-[10px]">
                      حاضر
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-extrabold text-[10px]">
                      غائب ✕
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 6. EXAMS AND GRADES SHOWCASE (Visual Right / Text Left) */}
        {/* ============================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center reveal-on-scroll">
          {/* Visual Column: Mini Grades Table UI */}
          <div className="lg:col-span-7 order-2 lg:order-1">
            <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-xl shadow-slate-900/5 space-y-3.5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-black text-slate-900">
                    امتحان تحضيري للبكالوريا (BAC Blanc) — مادة الرياضيات
                  </span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                  معدل الفوج: 15.3 / 20
                </span>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-bold text-[10px] bg-slate-50">
                      <th className="p-2">التلميذ</th>
                      <th className="p-2">الشعبة</th>
                      <th className="p-2">العلامة / 20</th>
                      <th className="p-2">التقدير</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="p-2 font-bold text-slate-900">أمينة بلقاسم</td>
                      <td className="p-2 text-slate-500">3AS علوم تجريبية</td>
                      <td className="p-2 font-black text-emerald-700">18.5</td>
                      <td className="p-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          ممتاز 🌟
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2 font-bold text-slate-900">محمد ياسين بن عيسى</td>
                      <td className="p-2 text-slate-500">3AS رياضيات</td>
                      <td className="p-2 font-black text-indigo-700">16.0</td>
                      <td className="p-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                          جيد جداً
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2 font-bold text-slate-900">إيناس بوغرارة</td>
                      <td className="p-2 text-slate-500">3AS علوم تجريبية</td>
                      <td className="p-2 font-black text-slate-800">14.5</td>
                      <td className="p-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          جيد
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Text Column */}
          <div className="lg:col-span-5 space-y-5 text-right rtl:text-right ltr:text-left order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-black">
              <span>06</span>
              <span>•</span>
              <span>التقييم والتحصيل</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-[#17191D] leading-snug">
              الامتحانات والنقاط
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              أنشئ الاختبارات وسجّل النقاط وتابع نتائج التلاميذ.
            </p>
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center gap-2.5 text-xs text-slate-700">
                <div className="w-5 h-5 rounded-full bg-teal-50 text-[#18B89C] flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>تسجيل نقاط الامتحانات التجريبية والفروض الفصلية بدقة</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-700">
                <div className="w-5 h-5 rounded-full bg-teal-50 text-[#18B89C] flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>حساب المعدلات العامة لكل فوج وتحديد نقاط الضعف والقوة</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-700">
                <div className="w-5 h-5 rounded-full bg-teal-50 text-[#18B89C] flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>كشوف نقاط منظمة جاهزة للطباعة والتسليم للأولياء</span>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 7. PAYMENTS & INVOICES SHOWCASE (Text Right / Visual Left) */}
        {/* ============================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center reveal-on-scroll">
          {/* Text Column */}
          <div className="lg:col-span-5 space-y-5 text-right rtl:text-right ltr:text-left order-1 lg:order-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-[#18B89C] border border-teal-200 text-xs font-black">
              <span>07</span>
              <span>•</span>
              <span>الفوترة والوصولات DZD</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-[#17191D] leading-snug">
              المدفوعات والفواتير
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              سجّل دفعات التلاميذ، أنشئ الفواتير واطبعها بسهولة.
            </p>
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center gap-2.5 text-xs text-slate-700">
                <div className="w-5 h-5 rounded-full bg-teal-50 text-[#18B89C] flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>طباعة وصولات دفع وفواتير رسمية متوافقة مع الدينار الجزائري</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-700">
                <div className="w-5 h-5 rounded-full bg-teal-50 text-[#18B89C] flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>تتبع ديون واشتراكات كل تلميذ مع حساب المتبقي آلياً</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-700">
                <div className="w-5 h-5 rounded-full bg-teal-50 text-[#18B89C] flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>دعم الدفع نقداً، بريدي موب (Baridimob)، أو الحوالة البريدية CCP</span>
              </div>
            </div>
          </div>

          {/* Visual Column: Miniature Printable Invoice */}
          <div className="lg:col-span-7 order-2 lg:order-2">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xl shadow-slate-900/10 space-y-4 max-w-lg mx-auto">
              {/* Invoice Top Header */}
              <div className="flex items-start justify-between border-b border-slate-200 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#F47A3C]" />
                    <span className="font-black text-sm text-slate-900">مدرستي برو • MadrasatiPro</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">مركز النخبة للدعم المدرسي واللغات</p>
                </div>
                <div className="text-left">
                  <span className="text-xs font-mono font-bold text-slate-700 block">وصل استلام رسمي</span>
                  <span className="text-[10px] font-mono text-slate-400">#INV-2026-0842</span>
                </div>
              </div>

              {/* Invoice Details */}
              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-150">
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold">اسم التلميذ:</span>
                  <span className="font-extrabold text-slate-900">أمينة بلقاسم</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold">الفوج الدراسي:</span>
                  <span className="font-extrabold text-slate-900">3AS علوم تجريبية (فوج أ)</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold">التاريخ:</span>
                  <span className="font-bold text-slate-700">2026/09/28</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold">طريقة الدفع:</span>
                  <span className="font-bold text-slate-700">بريدي موب (Baridimob)</span>
                </div>
              </div>

              {/* Financial Amount */}
              <div className="flex items-center justify-between p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200">
                <div>
                  <span className="text-[10px] text-emerald-800 font-bold block">المبلغ المدفوع بالدينار:</span>
                  <span className="text-xl font-black text-emerald-700">4,000 دج</span>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-600 text-white font-black text-[10px]">
                  خالص بالكامل ✓
                </span>
              </div>

              {/* Print Action Button */}
              <div className="pt-1 flex items-center justify-between">
                <button
                  type="button"
                  className="w-full py-2.5 rounded-xl bg-slate-950 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>طباعة الفاتورة والوصل PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 8. FINANCES SHOWCASE (Visual Right / Text Left) */}
        {/* ============================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center reveal-on-scroll">
          {/* Visual Column: Mini Financial Dashboard */}
          <div className="lg:col-span-7 order-2 lg:order-1">
            <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-xl shadow-slate-900/5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-black text-slate-900">الملخص المالي لشهر سبتمبر</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                  نمو إيجابي
                </span>
              </div>

              {/* 4 Financial Tiles */}
              <div className="grid grid-cols-2 gap-3 text-right">
                <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100 space-y-1">
                  <span className="text-[10px] text-emerald-700 font-bold block">إجمالي المداخيل</span>
                  <p className="text-lg font-black text-emerald-800">480,000 دج</p>
                  <span className="text-[9px] text-emerald-600 block">اشتراكات الطلاب الشهرية</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 space-y-1">
                  <span className="text-[10px] text-indigo-700 font-bold block">رواتب الأساتذة</span>
                  <p className="text-lg font-black text-indigo-800">190,000 دج</p>
                  <span className="text-[9px] text-indigo-600 block">ساعات ورواتب مستحقة</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-100 space-y-1">
                  <span className="text-[10px] text-rose-700 font-bold block">مصاريف التسيير</span>
                  <p className="text-lg font-black text-rose-800">65,000 دج</p>
                  <span className="text-[9px] text-rose-600 block">إيجار، كهرباء، وطباعة</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#FFF9F5] border border-orange-200 space-y-1">
                  <span className="text-[10px] text-[#F47A3C] font-black block">الصافي المحقق</span>
                  <p className="text-lg font-black text-[#F47A3C]">+ 225,000 دج</p>
                  <span className="text-[9px] text-slate-500 block">فائض تشغيلي صافي</span>
                </div>
              </div>
            </div>
          </div>

          {/* Text Column */}
          <div className="lg:col-span-5 space-y-5 text-right rtl:text-right ltr:text-left order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-black">
              <span>08</span>
              <span>•</span>
              <span>الخزينة والربحية</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-[#17191D] leading-snug">
              المداخيل والمصاريف
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              تابع مداخيل مؤسستك ورواتب الأساتذة والمصاريف في مكان واحد.
            </p>
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center gap-2.5 text-xs text-slate-700">
                <div className="w-5 h-5 rounded-full bg-teal-50 text-[#18B89C] flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>كشف فوري ودقيق للمداخيل والمصاريف دون الحاجة لمحاسب خارجي</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-700">
                <div className="w-5 h-5 rounded-full bg-teal-50 text-[#18B89C] flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>تصنيف منظم لمصاريف التسيير: الإيجار، التجهيزات، والفواتير</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-700">
                <div className="w-5 h-5 rounded-full bg-teal-50 text-[#18B89C] flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>حساب الصافي المالي الشهري بضغطة زر واحدة بالدينار الجزائري</span>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 9. REPORTS SHOWCASE (Text Right / Visual Left) */}
        {/* ============================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center reveal-on-scroll">
          {/* Text Column */}
          <div className="lg:col-span-5 space-y-5 text-right rtl:text-right ltr:text-left order-1 lg:order-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-black">
              <span>09</span>
              <span>•</span>
              <span>الرؤية والتحليل</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-[#17191D] leading-snug">
              التقارير
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              احصل على رؤية واضحة حول بيانات مؤسستك وسير نشاطها.
            </p>
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center gap-2.5 text-xs text-slate-700">
                <div className="w-5 h-5 rounded-full bg-teal-50 text-[#18B89C] flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>إحصائيات دورية حول نسبة التحصيل، استيعاب القاعات، والغيابات</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-700">
                <div className="w-5 h-5 rounded-full bg-teal-50 text-[#18B89C] flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>تصدير التقارير إلى ملفات PDF وإكسل (Excel) بمرونة وسرعة</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-700">
                <div className="w-5 h-5 rounded-full bg-teal-50 text-[#18B89C] flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>مؤشرات أداء واضحة تساعدك على اتخاذ القرارات الإدارية الناجحة</span>
              </div>
            </div>
          </div>

          {/* Visual Column: Mini Reporting Interface */}
          <div className="lg:col-span-7 order-2 lg:order-2">
            <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-xl shadow-slate-900/5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-black text-slate-900">مؤشرات النشاط والأداء العام</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  تصدير تقرير شامل
                </span>
              </div>

              {/* Reporting Metric Bars */}
              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between font-bold text-slate-700 mb-1">
                    <span>نسبة تحصيل مستحقات التلاميذ</span>
                    <span className="text-emerald-700 font-black">92.4%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: "92.4%" }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-bold text-slate-700 mb-1">
                    <span>معدل انضباط وحضور الطلاب</span>
                    <span className="text-indigo-700 font-black">94.8%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-600 rounded-full" style={{ width: "94.8%" }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-bold text-slate-700 mb-1">
                    <span>نسبة إشغال القاعات في أوقات الذروة</span>
                    <span className="text-[#F47A3C] font-black">88.0%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#F47A3C] rounded-full" style={{ width: "88%" }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 10. SETTINGS SHOWCASE (Visual Right / Text Left) */}
        {/* ============================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center reveal-on-scroll">
          {/* Visual Column: Mini Settings & Branding UI */}
          <div className="lg:col-span-7 order-2 lg:order-1">
            <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-xl shadow-slate-900/5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-slate-700" />
                  <span className="text-xs font-black text-slate-900">إعدادات المؤسسة والعلامة</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-100">
                  الحساب نشط ومعتمد ✓
                </span>
              </div>

              {/* Institution Identity Card */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-[#F47A3C]">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h5 className="font-extrabold text-sm text-slate-900">مركز النخبة للتميز والتفوق</h5>
                    <p className="text-[11px] text-slate-500">ولاية سطيف (19) • المشرف: أحمد بن سالم</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-slate-500 bg-white px-2.5 py-1 rounded-xl border border-slate-200">
                  تغيير الشعار
                </span>
              </div>

              {/* Subscription Plan Quotas */}
              <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
                <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                  <span className="text-[10px] text-slate-400 block font-bold">الخطة الحالية</span>
                  <span className="font-extrabold text-[#F47A3C]">Professional</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                  <span className="text-[10px] text-slate-400 block font-bold">المساحة السحابية</span>
                  <span className="font-extrabold text-slate-800">4.5 GB / 20 GB</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                  <span className="text-[10px] text-slate-400 block font-bold">نظام العزل</span>
                  <span className="font-extrabold text-emerald-700">سحابي معزول 100%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Text Column */}
          <div className="lg:col-span-5 space-y-5 text-right rtl:text-right ltr:text-left order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-800 border border-slate-200 text-xs font-black">
              <span>10</span>
              <span>•</span>
              <span>التحكم والهوية</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-[#17191D] leading-snug">
              مؤسستك تحت سيطرتك
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              تحكم في إعدادات مؤسستك وشعارها واشتراكها وحسابك من مكان واحد.
            </p>
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center gap-2.5 text-xs text-slate-700">
                <div className="w-5 h-5 rounded-full bg-teal-50 text-[#18B89C] flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>تخصيص شعار المدرسة وبياناتها لتظهر في كل الوصولات والتقارير</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-700">
                <div className="w-5 h-5 rounded-full bg-teal-50 text-[#18B89C] flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>إدارة الصلاحيات وحسابات المشرفين بأمان تام وموثوقية</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-700">
                <div className="w-5 h-5 rounded-full bg-teal-50 text-[#18B89C] flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>ترقية خطة الاشتراك ومتابعة استهلاك الحصص السحابية بمرونة</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
