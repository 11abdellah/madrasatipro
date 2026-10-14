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
  Building2,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  X,
  Play,
  Layers,
} from "lucide-react";

interface FeatureSlide {
  id: string;
  name: string;
  title: string;
  badge: string;
  desc: string;
  accentColor: string;
  icon: React.ElementType;
  ctaText: string;
  image: string;
}

interface ProductShowcaseProps {
  inModal?: boolean;
  onClose?: () => void;
}

export const ProductShowcaseSection: React.FC<ProductShowcaseProps> = ({
  inModal = false,
  onClose,
}) => {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const AUTOPLAY_DELAY = 6000;

  const slides: FeatureSlide[] = [
    {
      id: "dashboard",
      name: "لوحة التحكم",
      title: "لوحة التحكم الرئيسية والتحليلات",
      badge: "إشراف تنفيذي وإحصائيات حية",
      desc: "لوحة قيادة شاملة تعرض إحصائيات الطلاب والأساتذة والأفواج، مداخيل ومصاريف الشهر بالدينار، ومتابعة فورية لنشاط المؤسسة.",
      accentColor: "#18B89C",
      icon: Building2,
      ctaText: "استكشف لوحة التحكم",
      image: "/screenshots/dashboard-main.png",
    },
    {
      id: "teachers",
      name: "إدارة الأساتذة",
      title: "إدارة هيئة التدريس والأساتذة",
      badge: "متابعة الساعات والمستحقات",
      desc: "كشف كامل للأساتذة والمؤطرين، تتبع الساعات المنجزة والأفواج المسندة، حساب الأتعاب آلياً، وصرف الرواتب بالدينار الجزائري.",
      accentColor: "#F59E0B",
      icon: GraduationCap,
      ctaText: "نظّم أتعاب وجداول الأساتذة",
      image: "/screenshots/teachers-management.png",
    },
    {
      id: "students",
      name: "إدارة الطلاب",
      title: "إدارة الطلاب والأفواج الدراسية",
      badge: "متابعة شاملة وحالة الدفع",
      desc: "إدارة قوائم الطلاب في كل طور (4AM, 3AS...)، توزيعهم على الأفواج، كشف أرقام هواتف الأولياء، وتتبع حالة تسديد الاشتراكات.",
      accentColor: "#38BDF8",
      icon: Users,
      ctaText: "سجّل طلابك وأفواجك",
      image: "/screenshots/students-management.png",
    },
    {
      id: "card",
      name: "بطاقة المتمدرس",
      title: "بطاقة المتمدرس الرسمية مع الباركود و QR",
      badge: "معاينة وطباعة PVC فورية",
      desc: "إصدار فوري لبطاقة التعريف المدرسية للطالب برقم قيد فريد وشفرة QR، معتمدة وجاهزة للطباعة المباشرة على كروت PVC.",
      accentColor: "#F47A3C",
      icon: DoorOpen,
      ctaText: "اطبع بطاقات طلابك الآن",
      image: "/screenshots/student-card-modal.png",
    },
    {
      id: "attendance",
      name: "تسجيل الحضور",
      title: "تسجيل الحضور والغياب الذكي",
      badge: "رصد الحضور وحفظ السجلات",
      desc: "تسجيل حضور أفواج اليوم، رصد الغيابات في ثوانٍ، وتحديد الكل كحاضر بضغطة زر مع حفظ آلي فوري في قاعدة البيانات.",
      accentColor: "#10B981",
      icon: ClipboardCheck,
      ctaText: "اضبط انضباط الحصص",
      image: "/screenshots/attendance-recording.png",
    },
  ];

  const nextSlide = useCallback(() => {
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveIdx((prev) => (prev + 1) % slides.length);
      setIsTransitioning(false);
    }, 180);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveIdx((prev) => (prev - 1 + slides.length) % slides.length);
      setIsTransitioning(false);
    }, 180);
  }, [slides.length]);

  const selectSlide = (idx: number) => {
    if (idx === activeIdx) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveIdx(idx);
      setIsTransitioning(false);
    }, 180);
  };

  // Autoplay Effect
  useEffect(() => {
    if (isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      nextSlide();
    }, AUTOPLAY_DELAY);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, nextSlide]);

  // Tab Visibility Listener
  useEffect(() => {
    const handleVisibility = () => {
      setIsPaused(document.hidden);
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  // Touch Swipe Handlers for Mobile (RTL)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    setIsPaused(true);
  };

  const handleTouchMove = () => {
    // Normal scroll preserved via touch-action: pan-y
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setIsPaused(false);
    if (touchStartX.current === null || touchStartY.current === null) return;

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaX = touchStartX.current - touchEndX;
    const deltaY = touchStartY.current - touchEndY;

    if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }

    touchStartX.current = null;
    touchStartY.current = null;
  };

  const currentSlide = slides[activeIdx];

  return (
    <div
      className={`relative w-full ${
        inModal
          ? "p-2 sm:p-5 text-white"
          : "py-14 sm:py-20 lg:py-24 bg-gradient-to-b from-[#061224] via-[#091D3A] to-[#040D1B] text-white overflow-hidden"
      }`}
    >
      {/* Background glow effects */}
      {!inModal && (
        <>
          <div
            className="absolute top-1/4 right-1/4 w-[380px] sm:w-[520px] h-[380px] sm:h-[520px] rounded-full blur-[140px] pointer-events-none opacity-30 transition-all duration-700"
            style={{ backgroundColor: currentSlide.accentColor }}
          />
          <div className="absolute bottom-10 left-10 w-[320px] sm:w-[420px] h-[320px] sm:h-[420px] bg-teal-500/10 rounded-full blur-[130px] pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(rgba(244,122,60,0.06)_1px,transparent_1px)] [background-size:32px_32px] opacity-25 pointer-events-none" />
        </>
      )}

      <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6">
        
        {/* Modal Header / Section Header */}
        {inModal ? (
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#F47A3C] text-white flex items-center justify-center shadow-md">
                <Play className="w-4 h-4 fill-current ml-0.5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white">
                  شاهد كيف يعمل النظام • واجهات حقيقية من الداشبورد
                </h3>
                <p className="text-[10px] sm:text-xs text-slate-400">
                  لقطات حية توضح قوة وسلاسة منصة مدرستي برو في إدارة المدارس والمراكز
                </p>
              </div>
            </div>

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer transition active:scale-95"
                aria-label="إغلاق"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : (
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-teal-300 border border-white/15 text-xs font-bold shadow-md">
              <Layers className="w-3.5 h-3.5 text-teal-400" />
              <span>المنظومة السحابية الموحدة</span>
            </div>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
              كل ما تحتاجه لإدارة مدرستك في مكان واحد
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-slate-300 leading-relaxed font-normal">
              واجهات حقيقية مخصصة لكل دور داخل المؤسسة لضمان تجربة سلسة، سريعة، وعالية الكفاءة.
            </p>
          </div>
        )}

        {/* Feature Category Tabs */}
        <div
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="flex items-center justify-start sm:justify-center overflow-x-auto no-scrollbar gap-1.5 sm:gap-2 pb-1 -mx-2 px-2 sm:mx-0 sm:px-0"
        >
          {slides.map((s, idx) => {
            const Icon = s.icon;
            const isActive = idx === activeIdx;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => selectSlide(idx)}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-300 cursor-pointer active:scale-95 shrink-0 ${
                  isActive
                    ? "bg-gradient-to-r from-[#F47A3C] to-[#d36128] text-white shadow-lg shadow-orange-500/30 ring-2 ring-orange-400/50 scale-102"
                    : "bg-white/10 text-slate-300 hover:bg-white/15 hover:text-white border border-white/10 backdrop-blur-md"
                }`}
                aria-label={`عرض: ${s.name}`}
              >
                <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                <span>{s.name}</span>
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping mr-1" />}
              </button>
            );
          })}
        </div>

        {/* ============================================================== */}
        {/* CENTERPIECE DEVICE DASHBOARD STAGE                             */}
        {/* ============================================================== */}
        <div
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{ touchAction: "pan-y" }}
          className="relative max-w-4xl mx-auto select-none"
        >
          {/* Main Dashboard Window Container */}
          <div className="bg-slate-900/95 backdrop-blur-2xl rounded-2xl sm:rounded-3xl border border-white/20 shadow-2xl overflow-hidden transition-all duration-300">
            
            {/* Window Top Titlebar */}
            <div className="flex items-center justify-between px-3 sm:px-5 py-2 sm:py-2.5 border-b border-slate-800 bg-slate-950/70">
              {/* macOS Window Controls */}
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              </div>

              {/* Center App Title */}
              <div className="text-center">
                <p className="text-[11px] sm:text-xs font-bold text-white tracking-wide truncate max-w-[200px] sm:max-w-none">
                  مدرستي برو • {currentSlide.title}
                </p>
              </div>

              {/* Live Status */}
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="hidden sm:inline">سحابي 100%</span>
              </div>
            </div>

            {/* Inner Dashboard Body: The Real Dashboard Screenshot */}
            <div className="p-2 sm:p-4 bg-slate-950/90">
              <div
                key={currentSlide.id}
                className={`transition-all duration-300 ${
                  isTransitioning
                    ? "opacity-0 translate-y-1 scale-[0.99]"
                    : "opacity-100 translate-y-0 scale-100"
                }`}
              >
                {/* Real Screenshot Container with Browser Header Cropped */}
                <div className="w-full overflow-hidden rounded-xl bg-slate-900 border border-slate-700/80 shadow-2xl relative aspect-[1024/556]">
                  <div className="relative w-full h-[115%] -mt-[8.2%]">
                    <Image
                      src={currentSlide.image}
                      alt={currentSlide.title}
                      fill
                      priority
                      className="object-cover object-top select-none pointer-events-none"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1024px"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Container White/Light Footer (Feature Title Below Screen) */}
            <div className="bg-white text-slate-900 p-4 sm:p-5 border-t border-slate-200 text-center space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-orange-50 border border-orange-200 text-[#F47A3C] text-[10px] sm:text-[11px] font-black">
                <span>{currentSlide.badge}</span>
              </div>
              <h3 className="text-base sm:text-xl font-black text-[#17191D] tracking-tight">
                {currentSlide.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed font-normal">
                {currentSlide.desc}
              </p>
              
              <div className="pt-1.5 flex items-center justify-center gap-3">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 px-5 sm:px-6 py-2 rounded-full bg-[#18B89C] hover:bg-[#149B83] text-white font-bold text-xs sm:text-sm shadow-md shadow-teal-600/20 transition active:scale-95"
                >
                  <span>{currentSlide.ctaText}</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

          </div>

          {/* Previous / Next Desktop Quick Buttons */}
          <button
            type="button"
            onClick={prevSlide}
            className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/95 text-slate-800 shadow-xl border border-slate-200 items-center justify-center hover:bg-white hover:scale-105 transition cursor-pointer z-30"
            aria-label="الشريحة السابقة"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={nextSlide}
            className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/95 text-slate-800 shadow-xl border border-slate-200 items-center justify-center hover:bg-white hover:scale-105 transition cursor-pointer z-30"
            aria-label="الشريحة التالية"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Minimalist Dot Indicators */}
        <div className="flex items-center justify-center gap-2 pt-1">
          {slides.map((_, dotIdx) => (
            <button
              key={dotIdx}
              type="button"
              onClick={() => selectSlide(dotIdx)}
              className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                activeIdx === dotIdx
                  ? "w-8 bg-[#18B89C] shadow-md shadow-teal-500/40"
                  : "w-2.5 bg-white/20 hover:bg-white/40"
              }`}
              aria-label={`الانتقال إلى الشريحة ${dotIdx + 1}`}
            />
          ))}
        </div>

      </div>
    </div>
  );
};
