"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Users,
  GraduationCap,
  CalendarDays,
  DoorOpen,
  ClipboardCheck,
  Wallet,
  Building2,
  QrCode,
  ArrowLeft,
  Check,
  Printer,
  ShieldCheck,
  TrendingUp,
  Clock,
  Layers,
  Award,
  BookOpen,
  CalendarCheck,
  UserCheck,
  Receipt,
  CheckCircle2,
} from "lucide-react";

interface RolePillar {
  id: string;
  name: string;
  shortName: string;
  tag: string;
  icon: React.ElementType;
  accentHex: string;
  glowColor: string;
  headline: string;
  desc: string;
  features: string[];
  cta: string;
  scenePreview: React.ReactNode;
}

export const ProductShowcaseSection: React.FC = () => {
  const [activeRoleIdx, setActiveRoleIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const AUTOPLAY_DURATION = 6000;
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      setReducedMotion(mediaQuery.matches);
      const listener = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
      mediaQuery.addEventListener("change", listener);
      return () => mediaQuery.removeEventListener("change", listener);
    }
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsPaused(document.hidden);
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  const pillars: RolePillar[] = [
    {
      id: "director",
      name: "المدير والإدارة",
      shortName: "الإدارة العامة",
      tag: "تحكم وإشراف مركزي",
      icon: Building2,
      accentHex: "#F59E0B",
      glowColor: "rgba(245, 158, 11, 0.28)",
      headline: "إشراف تنفيذي فوري على كافة فروع وقاعات المؤسسة",
      desc: "لوحة تحكم مركزية تمكن الإدارة من متابعة حضور الطلاب، مداخيل الخزينة، أداء الأساتذة، ونسب الإشغال في الوقت الفعلي مع تقارير دقيقة ومؤتمتة.",
      features: [
        "لوحة قيادة مركزية لمتابعة أداء الفروع في الوقت الفعلي",
        "تقارير محاسبية شهرية للمداخيل والمصاريف وصافي الأرباح",
        "تحديد دقيق لصلاحيات المستخدمين والموظفين والأساتذة",
      ],
      cta: "استكشف لوحة تحكم المدير",
      scenePreview: (
        <div className="space-y-3.5 text-right">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">إحصائيات الإدارة العامة</h4>
                <p className="text-[10px] text-slate-400">مقر الجزائر العاصمة • كافة الفروع</p>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
              نشط الآن ✓
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center text-xs">
            <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700">
              <p className="text-[10px] text-slate-400">إجمالي التلاميذ النشطين</p>
              <p className="text-sm font-black text-white mt-0.5">1,240 تلميذ</p>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30">
              <p className="text-[10px] text-emerald-400">مداخيل الشهر الحالي</p>
              <p className="text-sm font-black text-emerald-300 mt-0.5">+ 840,000 دج</p>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span className="text-slate-300 text-[11px]">نسبة نمو التسجيلات:</span>
            </div>
            <strong className="text-emerald-400 font-mono font-bold">+ 18.4%</strong>
          </div>
        </div>
      ),
    },
    {
      id: "reception",
      name: "الاستقبال والتسجيل",
      shortName: "الاستقبال والتسجيل",
      tag: "تسجيل فوري وإصدار البطاقات",
      icon: DoorOpen,
      accentHex: "#F47A3C",
      glowColor: "rgba(244, 122, 60, 0.28)",
      headline: "تسجيل سلس وإصدار فوري لبطاقات المتمدرس PVC",
      desc: "تسجيل الطلاب وتوزيعهم على الأفواج والمستويات في ثوانٍ معدودة، مع طباعة فورية لبطاقات المتمدرس المزودة برمز QR وشفرة الباركود للتعريف السريع.",
      features: [
        "تسجيل سريع للطلاب مع معلومات ولي الأمر وطور التعليم",
        "طباعة فورية لبطاقة المتمدرس مع الباركود بضغطة زر",
        "تحصيل الاشتراكات وإصدار وصولات رسمية بالدينار الجزائري",
      ],
      cta: "سجّل طلابك واطبع البطاقات",
      scenePreview: (
        <div className="space-y-3.5 text-right">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-orange-500/20 text-[#F47A3C] flex items-center justify-center font-bold">
                <DoorOpen className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">بطاقة المتمدرس الرقمية</h4>
                <p className="text-[10px] text-slate-400">جاهزة للطباعة على كروت PVC</p>
              </div>
            </div>
            <span className="flex items-center gap-1 text-[10px] text-[#F47A3C] font-bold">
              <Printer className="w-3.5 h-3.5" />
              <span>طباعة فورية</span>
            </span>
          </div>

          <div className="rounded-xl p-3 bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold text-white">مروان بن صالح</p>
              <p className="text-[10px] text-slate-400">3AS علوم تجريبية • فوج 01</p>
              <p className="text-[9px] font-mono text-orange-300">ID: #ALG-2026-0842</p>
            </div>
            <div className="w-10 h-10 bg-white rounded-lg p-1 flex items-center justify-center">
              <QrCode className="w-full h-full text-slate-900" />
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
            <span>حالة الاشتراك: خالص بالكامل ✓</span>
            <span className="text-emerald-400 font-bold">تم إصدار الوصل #8841</span>
          </div>
        </div>
      ),
    },
    {
      id: "teachers",
      name: "الأساتذة والأقسام",
      shortName: "الأساتذة والجداول",
      tag: "جدولة ذكية ومنع تضارب القاعات",
      icon: GraduationCap,
      accentHex: "#8B7CFF",
      glowColor: "rgba(139, 124, 255, 0.28)",
      headline: "جدولة آلية ذكية تضمن صفر تعارض بين الأساتذة والقاعات",
      desc: "محرك جدولة مرن ينظم الحصص الأسبوعية ويمنع تضارب القاعات آلياً، مع احتساب دقيق لساعات عمل الأساتذة ومستحقاتهم المالية بشفافية تامة.",
      features: [
        "خوارزمية ذكية تمنع تضارب القاعات والأساتذة في أوقات الذروة",
        "احتساب آلي لمستحقات الأستاذ (بالساعة، بالفوج، أو بالنسبة)",
        "جدول توقيت أسبوعي مرن يمكن تعديله بالسحب والإفلات",
      ],
      cta: "نظّم جداول أساتذتك وقاعاتك",
      scenePreview: (
        <div className="space-y-3.5 text-right">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                <CalendarDays className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">محرك الجدولة والشاغرية</h4>
                <p className="text-[10px] text-slate-400">فحص فوري للتعارض</p>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
              0 تضارب نشط ✓
            </span>
          </div>

          <div className="space-y-2">
            <div className="p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-between text-xs">
              <div>
                <p className="font-bold text-white text-[11px]">رياضيات (3AS علوم) • أ. بن عيسى</p>
                <p className="text-[9px] text-indigo-300">الجمعة: 08:30 — 10:30 • قاعة 02 (25 مقعد)</p>
              </div>
              <span className="text-emerald-400 text-[10px] font-bold">مؤكد ✓</span>
            </div>
            <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-500/30 flex items-center justify-between text-xs">
              <div>
                <p className="font-bold text-white text-[11px]">فيزياء (3AS تقني) • أ. لعريبي</p>
                <p className="text-[9px] text-purple-300">الجمعة: 10:45 — 12:45 • قاعة 01 (30 مقعد)</p>
              </div>
              <span className="text-emerald-400 text-[10px] font-bold">مؤكد ✓</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "students",
      name: "التلاميذ والانضباط",
      shortName: "التلاميذ والانضباط",
      tag: "مسح سريع ومتابعة دقيقة",
      icon: Users,
      accentHex: "#18B89C",
      glowColor: "rgba(24, 184, 156, 0.28)",
      headline: "تسجيل حضور وانضباط فوري في أقل من ثانية عبر مسح QR",
      desc: "تتبع الحضور والغيابات والتأخرات آلياً عبر مسح بطاقة التلميذ بالهاتف أو القارئ، مع تنظيم دقيق لسعة الأفواج وتفادي الاكتظاظ داخل القاعات.",
      features: [
        "تسجيل الحضور بمسح باركود بطاقة التلميذ بالهاتف أو الماسح",
        "كشف فوري للتأخرات والغيابات غير المبررة وإشعار الولي",
        "متابعة دقيقة لسعة الفوج وتفادي الاكتظاظ داخل القاعات",
      ],
      cta: "اضبط انضباط طلابك الآن",
      scenePreview: (
        <div className="space-y-3.5 text-right">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-[#18B89C] flex items-center justify-center font-bold">
                <ClipboardCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">جلسة الحضور المباشرة</h4>
                <p className="text-[10px] text-slate-400">فوج الرياضيات 3AS (الجمعة)</p>
              </div>
            </div>
            <div className="text-left">
              <span className="text-sm font-black text-emerald-400">95.8%</span>
              <p className="text-[8px] text-slate-400">نسبة الحضور</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2 rounded-xl bg-emerald-950/50 border border-emerald-500/30 text-emerald-400">
              <p className="text-xs font-black">23</p>
              <p className="text-[9px]">حاضر</p>
            </div>
            <div className="p-2 rounded-xl bg-rose-950/50 border border-rose-500/30 text-rose-400">
              <p className="text-xs font-black">1</p>
              <p className="text-[9px]">غائب</p>
            </div>
            <div className="p-2 rounded-xl bg-amber-950/50 border border-amber-500/30 text-amber-400">
              <p className="text-xs font-black">0</p>
              <p className="text-[9px]">متأخر</p>
            </div>
          </div>

          <div className="p-2 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-between text-xs text-slate-300">
            <span className="text-[11px]">تم تسجيل: ريان حداد (مسح QR)</span>
            <span className="text-[9px] text-emerald-400 font-mono font-bold">08:29 ✓</span>
          </div>
        </div>
      ),
    },
    {
      id: "parents",
      name: "الأولياء والمالية",
      shortName: "الأولياء والمالية",
      tag: "وصولات رسمية وراحة بال",
      icon: Wallet,
      accentHex: "#38BDF8",
      glowColor: "rgba(56, 189, 248, 0.28)",
      headline: "فوترة رسمية بالدينار الجزائري وإشعارات تطمئن العائلات",
      desc: "إصدار وصولات مرقمة ومطبوعة لكافة مدفوعات بريدي موب و CCP والنقد، مع إشعار ولي الأمر فورياً بحضور التلميذ ومواعيد أقساطه دون أي عناء.",
      features: [
        "إصدار وصل رسمي مرقم لكل عملية دفع عبر Baridimob أو CCP",
        "تنبيهات فورية لولي الأمر عند تسجيل غياب أو تأخر التلميذ",
        "شفافية مالية تامة وكشف حساب دقيق لأقساط الاشتراك",
      ],
      cta: "فعّل نظام الإشعارات والوصولات",
      scenePreview: (
        <div className="space-y-3.5 text-right">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold">
                <Wallet className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">وصل دفع رسمي بالدينار</h4>
                <p className="text-[10px] text-slate-400">رقم الوصل #REC-8841</p>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
              مدفوع بالكامل ✓
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-[11px]">المبلغ المحصل:</span>
              <strong className="text-sm font-black text-white font-mono">4,500 دج</strong>
            </div>
            <div className="flex justify-between items-center text-[10px] text-slate-300">
              <span>طريقة الدفع:</span>
              <span className="font-bold text-[#F47A3C]">بريدي موب Baridimob</span>
            </div>
            <div className="flex justify-between items-center text-[10px] text-slate-300">
              <span>التلميذ:</span>
              <span className="font-bold text-white">صابرين قادري (اشتراك أكتوبر)</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
            <span>تم إرسال التأكيد لولي الأمر</span>
            <span className="text-sky-400 font-bold">جاهز للتحميل PDF</span>
          </div>
        </div>
      ),
    },
  ];

  const handleSelectRole = (idx: number) => {
    if (idx === activeRoleIdx) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveRoleIdx(idx);
      setIsTransitioning(false);
    }, 200);
  };

  const nextRole = useCallback(() => {
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveRoleIdx((prev) => (prev + 1) % pillars.length);
      setIsTransitioning(false);
    }, 200);
  }, [pillars.length]);

  useEffect(() => {
    if (reducedMotion || isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      nextRole();
    }, AUTOPLAY_DURATION);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [reducedMotion, isPaused, nextRole]);

  const activePillar = pillars[activeRoleIdx];

  return (
    <section
      id="features"
      className="py-16 sm:py-24 bg-gradient-to-b from-[#061224] via-[#091D3A] to-[#040D1B] text-white z-10 relative overflow-hidden"
      aria-label="المنظومة التعليمية السحابية الشاملة لمدرستي برو"
    >
      {/* Dynamic Ambient Background Lights */}
      <div
        className="absolute top-1/4 right-1/4 w-[420px] sm:w-[560px] h-[420px] sm:h-[560px] rounded-full blur-[140px] pointer-events-none transition-all duration-1000 opacity-40"
        style={{ backgroundColor: activePillar.glowColor }}
      />
      <div className="absolute bottom-10 left-10 w-[380px] sm:w-[480px] h-[380px] sm:h-[480px] bg-teal-500/10 rounded-full blur-[130px] pointer-events-none" />

      {/* Subtle Depth Tech Matrix Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(244,122,60,0.08)_1px,transparent_1px)] [background-size:32px_32px] opacity-30 pointer-events-none" />

      {/* Sweeping Elegant Curved Pathway */}
      <div className="absolute -bottom-28 -left-20 w-[1200px] h-[320px] bg-gradient-to-r from-teal-400/10 via-white/5 to-transparent rounded-[100%] blur-3xl transform -rotate-6 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 space-y-10 sm:space-y-12">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3.5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-teal-300 border border-white/15 text-xs font-bold shadow-md">
            <Layers className="w-3.5 h-3.5 text-teal-400" />
            <span>المنظومة التعليمية السحابية الشاملة</span>
          </div>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
            كل ما تحتاجه لإدارة مدرستك في مكان واحد
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
            مدرستي برو تربط الإدارة، الاستقبال، الأساتذة، التلاميذ، وأولياء الأمور في تدفق عمل متكامل ومصمم خصيصاً للتعليم الجزائري.
          </p>
        </div>

        {/* Interactive Role Navigation Tabs */}
        <div
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="flex items-center justify-start sm:justify-center overflow-x-auto no-scrollbar gap-2 sm:gap-2.5 pb-2 -mx-4 px-4 sm:mx-0 sm:px-0"
        >
          {pillars.map((p, idx) => {
            const Icon = p.icon;
            const isActive = idx === activeRoleIdx;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSelectRole(idx)}
                className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-300 cursor-pointer active:scale-95 shrink-0 ${
                  isActive
                    ? "bg-gradient-to-r from-[#F47A3C] to-[#d36128] text-white shadow-lg shadow-orange-500/30 ring-2 ring-orange-400/50 scale-102"
                    : "bg-white/10 text-slate-300 hover:bg-white/15 hover:text-white border border-white/10 backdrop-blur-md"
                }`}
                aria-label={`استعراض منظومة: ${p.name}`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                <span>{p.name}</span>
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping mr-1" />}
              </button>
            );
          })}
        </div>

        {/* ============================================================== */}
        {/* DIMENSIONAL ECOSYSTEM SHOWCASE STAGE                           */}
        {/* Centerpiece Device Mockup + Orbiting 3D Floating UI Artifacts  */}
        {/* ============================================================== */}
        <div
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="relative max-w-5xl mx-auto min-h-[560px] sm:min-h-[580px] lg:min-h-[600px] flex items-center justify-center py-6 sm:py-8"
        >
          {/* Subtle Ambient Radial Backlight Glow behind the Center Anchor */}
          <div
            className="absolute inset-0 max-w-[500px] max-h-[500px] mx-auto my-auto rounded-full blur-[100px] opacity-40 pointer-events-none transition-all duration-700"
            style={{ backgroundColor: activePillar.glowColor }}
          />

          {/* ============================================================ */}
          {/* FLOATING OBJECT 1: The Official PVC Student Card (Top Right) */}
          {/* ============================================================ */}
          <div className="hidden md:block absolute -top-4 -right-6 lg:-right-10 z-30 pointer-events-none">
            <div className="animate-float-obj-1">
              <div className="w-64 p-3.5 rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-2xl shadow-black/20 text-right text-slate-800 space-y-2">
                <div className="flex items-center justify-between border-b border-slate-150 pb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-slate-500">بطاقة متمدرس 2026</span>
                  </div>
                  <span className="text-[9px] font-mono font-bold text-[#F47A3C]">PVC CARD</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-11 h-12 rounded-xl bg-gradient-to-tr from-slate-800 to-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                    <Users className="w-5 h-5 text-teal-400" />
                  </div>
                  <div className="space-y-0.5 overflow-hidden">
                    <p className="text-xs font-black text-slate-900 truncate">مروان بن صالح</p>
                    <p className="text-[10px] text-slate-500 font-medium">3AS علوم • فوج 01</p>
                    <p className="text-[9px] font-mono text-emerald-700 font-bold">#ALG-2026-0842</p>
                  </div>
                </div>

                <div className="pt-1 flex items-center justify-between border-t border-slate-100 text-[9px] text-slate-500">
                  <span className="flex items-center gap-1 text-emerald-600 font-bold">
                    <CheckCircle2 className="w-3 h-3" /> خالص بالكامل
                  </span>
                  <span className="font-mono text-slate-400">QR ACTIVE ✓</span>
                </div>
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* FLOATING OBJECT 2: Smart Schedule Matrix (Top Left)         */}
          {/* ============================================================ */}
          <div className="hidden md:block absolute -top-4 -left-6 lg:-left-10 z-30 pointer-events-none">
            <div className="animate-float-obj-2">
              <div className="w-64 p-3.5 rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-2xl shadow-black/20 text-right text-slate-800 space-y-2">
                <div className="flex items-center justify-between border-b border-slate-150 pb-2">
                  <span className="text-[10px] font-bold text-slate-500">جدول التوقيت والشاغرية</span>
                  <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[9px] font-bold border border-purple-200">
                    0 تعارض ✓
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-150">
                    <p className="text-[11px] font-bold text-slate-900">رياضيات (3AS) • أ. بن عيسى</p>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">الجمعة: 08:30 — 10:30 • قاعة 02</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[9px] text-slate-500 pt-0.5">
                  <span className="text-indigo-600 font-bold flex items-center gap-1">
                    <Clock className="w-3 h-3" /> فحص آلي فوري
                  </span>
                  <span>25 مقعد متاح</span>
                </div>
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* FLOATING OBJECT 3: Official DZD Receipt Slip (Bottom Right) */}
          {/* ============================================================ */}
          <div className="hidden lg:block absolute -bottom-6 -right-8 z-30 pointer-events-none">
            <div className="animate-float-obj-3">
              <div className="w-60 p-3.5 rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-2xl shadow-black/20 text-right text-slate-800 space-y-1.5">
                <div className="flex items-center justify-between border-b border-slate-150 pb-1.5">
                  <span className="text-[10px] font-bold text-slate-500">وصل تسديد اشتراك</span>
                  <span className="font-mono text-[9px] text-emerald-600 font-bold">#REC-8841</span>
                </div>
                <div className="flex items-baseline justify-between pt-0.5">
                  <span className="text-[10px] text-slate-500">المبلغ المحصل:</span>
                  <span className="text-sm font-black text-slate-900 font-mono">4,500 دج</span>
                </div>
                <p className="text-[10px] text-slate-600">طريقة الدفع: <span className="font-bold text-[#F47A3C]">بريدي موب Baridimob</span></p>
                <div className="pt-1 flex items-center justify-between border-t border-slate-100 text-[9px] text-emerald-700 font-bold">
                  <span>تم إشعار ولي الأمر ✓</span>
                  <span>PDF جاهز</span>
                </div>
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* FLOATING OBJECT 4: Real-time Attendance Stream (Bottom Left) */}
          {/* ============================================================ */}
          <div className="hidden lg:block absolute -bottom-6 -left-8 z-30 pointer-events-none">
            <div className="animate-float-obj-4">
              <div className="w-60 p-3.5 rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-2xl shadow-black/20 text-right text-slate-800 space-y-1.5">
                <div className="flex items-center justify-between border-b border-slate-150 pb-1.5">
                  <span className="text-[10px] font-bold text-slate-500">جلسة الحضور والمسح</span>
                  <span className="font-mono text-[10px] font-bold text-emerald-600">95.8%</span>
                </div>
                <div className="flex items-center justify-between text-xs py-1">
                  <span className="text-[11px] font-bold text-slate-800">23 حاضر • 1 غائب</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold">
                    مسح 0.4 ثانية
                  </span>
                </div>
                <div className="pt-1 flex items-center justify-between border-t border-slate-100 text-[9px] text-slate-500">
                  <span className="text-teal-700 font-bold">تم مسح كارت: ريان حداد</span>
                  <span className="font-mono">08:29 ✓</span>
                </div>
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* FLOATING OBJECT 5: Academic Illustration Anchor (Corner)     */}
          {/* Friendly vector student graphic directly from Reference 1   */}
          {/* ============================================================ */}
          <div className="hidden xl:block absolute -bottom-10 -right-28 w-36 h-36 z-20 pointer-events-none opacity-85">
            <div className="relative w-full h-full">
              <Image
                src="/happy-student-rafiki.png"
                alt="تلاميذ متفوقون في منصة مدرستي برو"
                fill
                className="object-contain drop-shadow-xl"
              />
            </div>
          </div>

          {/* ============================================================ */}
          {/* CENTRAL CORE PLATFORM CANVAS (The Main Focal Point Anchor)  */}
          {/* High-Fidelity MadrasatiPro Software Window                   */}
          {/* ============================================================ */}
          <div className="relative z-20 w-full max-w-xl lg:max-w-2xl bg-slate-900/95 backdrop-blur-2xl rounded-3xl sm:rounded-[36px] border border-white/20 shadow-2xl p-5 sm:p-7 md:p-8 overflow-hidden transition-all duration-500">
            
            {/* Window Title Bar */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              </div>

              <div className="text-center">
                <p className="text-[11px] sm:text-xs font-bold text-white tracking-wide">
                  منصة مدرستي برو • معهد النخبة للدروس واللغات
                </p>
                <p className="text-[9px] text-slate-400">الجزائر العاصمة • النظام السحابي الموحد</p>
              </div>

              <div className="flex items-center gap-1 text-[10px] font-bold text-teal-400">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-ping" />
                <span>سحابي 100%</span>
              </div>
            </div>

            {/* Platform Quick Status Ribbon */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs pb-4 border-b border-slate-800/80 mb-5">
              <div className="p-2 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <span className="text-[10px] text-slate-400 block">التلاميذ النشطون</span>
                <strong className="text-xs sm:text-sm font-black text-white font-mono">1,240</strong>
              </div>
              <div className="p-2 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <span className="text-[10px] text-slate-400 block">الأفواج الجارية</span>
                <strong className="text-xs sm:text-sm font-black text-amber-300 font-mono">48 فوج</strong>
              </div>
              <div className="p-2 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <span className="text-[10px] text-slate-400 block">حالة الجداول</span>
                <strong className="text-xs sm:text-sm font-black text-emerald-400">0 تضارب ✓</strong>
              </div>
            </div>

            {/* Active Workflow Story Stage */}
            <div
              key={activePillar.id}
              className={`transition-all duration-300 ${
                isTransitioning
                  ? "opacity-0 translate-y-2 scale-[0.99]"
                  : "opacity-100 translate-y-0 scale-100"
              }`}
            >
              <div className="space-y-4 text-right">
                
                {/* Active Role Tag & Title */}
                <div>
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-xl bg-white/10 border border-white/20 text-xs font-bold text-orange-300 mb-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F47A3C] animate-pulse" />
                    <span>{activePillar.tag}</span>
                  </div>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-black text-white leading-snug">
                    {activePillar.headline}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal mt-1.5">
                    {activePillar.desc}
                  </p>
                </div>

                {/* Live Real Simulation Preview Screen */}
                <div className="p-3 sm:p-4 rounded-2xl bg-slate-950/80 border border-slate-800 shadow-inner">
                  {activePillar.scenePreview}
                </div>

                {/* Key Feature Checklist */}
                <div className="space-y-2 pt-1 text-xs text-slate-200">
                  {activePillar.features.map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-start gap-2">
                      <div className="w-4 h-4 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3" />
                      </div>
                      <span className="text-xs font-medium text-slate-200 leading-relaxed">{feat}</span>
                    </div>
                  ))}
                </div>

                {/* Direct Action Link */}
                <div className="pt-2 sm:pt-3 flex items-center justify-between">
                  <Link
                    href="/register"
                    className="inline-flex items-center gap-2 px-6 py-2.5 sm:py-3 rounded-2xl bg-gradient-to-r from-[#18B89C] to-[#149B83] text-white font-bold text-xs sm:text-sm shadow-xl shadow-teal-500/25 hover:shadow-teal-500/40 transition active:scale-95 group cursor-pointer focus:ring-4 focus:ring-teal-500/30 outline-none"
                  >
                    <span>{activePillar.cta}</span>
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  </Link>

                  <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
                    تفعيل فوري مع تجربة مجانية
                  </span>
                </div>

              </div>
            </div>

          </div>

        </div>

        {/* Step Indicator Dots */}
        <div className="flex items-center justify-center gap-2 pt-2">
          {pillars.map((_, dotIdx) => (
            <button
              key={dotIdx}
              type="button"
              onClick={() => handleSelectRole(dotIdx)}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                activeRoleIdx === dotIdx
                  ? "w-8 bg-[#F47A3C] shadow-md shadow-orange-500/50"
                  : "w-2 bg-white/20 hover:bg-white/40"
              }`}
              aria-label={`الانتقال للركيزة ${dotIdx + 1}`}
            />
          ))}
        </div>

      </div>
    </section>
  );
};
