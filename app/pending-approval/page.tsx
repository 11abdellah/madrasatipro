"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Clock,
  Phone,
  Mail,
  LogOut,
  RefreshCw,
  Compass,
  MessageCircle,
} from "lucide-react";
import { ALGERIAN_WILAYAS } from "@/lib/constants/algeria";

export default function PendingApprovalPage() {
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [institution, setInstitution] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [platformSettings, setPlatformSettings] = useState<{
    supportPhone: string;
    supportEmail: string;
    whatsapp: string;
  }>({
    supportPhone: "0550 12 34 56",
    supportEmail: "support@madrasatipro.dz",
    whatsapp: "213550123456",
  });

  const checkStatus = async () => {
    setChecking(true);
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();

      if (!data.authenticated) {
        window.location.href = "/login";
        return;
      }

      // If active, redirect straight to dashboard
      if (data.institution?.status === "ACTIVE") {
        window.location.href = "/dashboard";
        return;
      }

      setInstitution(data.institution);
      setUser(data.user);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setChecking(false);
    }
  };

  useEffect(() => {
    checkStatus();
    fetch("/api/platform/settings")
      .then((res) => res.json())
      .then((d) => {
        if (d.settings) {
          setPlatformSettings({
            supportPhone: d.settings.supportPhone || d.settings.mainPhone || "0550 12 34 56",
            supportEmail: d.settings.supportEmail || d.settings.mainEmail || "support@madrasatipro.dz",
            whatsapp: d.settings.whatsapp || "213550123456",
          });
        }
      })
      .catch((e) => console.error("Failed to load platform settings:", e));
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  };

  const wilayaName = institution
    ? ALGERIAN_WILAYAS.find((w) => w.code === institution.wilayaCode)?.nameAr || `ولاية ${institution.wilayaCode}`
    : "سطيف";

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF9F5] text-[#17191D] flex flex-col items-center justify-center p-6">
        <div className="w-10 h-10 border-4 border-[#F47A3C] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs font-bold text-slate-500">جارٍ التحقق من حالة اعتماد المؤسسة...</p>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-[#FFF9F5] text-[#17191D] flex flex-col font-sans relative overflow-hidden">
      {/* Background Floating Educational Objects */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
        <div className="absolute top-16 left-[10%] opacity-20 animate-float-pencil">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#F47A3C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
            <path d="m15 5 4 4"/>
          </svg>
        </div>
        <div className="absolute top-[60%] right-[8%] opacity-20 animate-float-ruler">
          <Compass className="w-10 h-10 text-[#18B89C]" />
        </div>
      </div>

      {/* Top Header with MadrasatiPro Logo */}
      <header className="border-b border-slate-200/80 bg-white/95 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.03)] backdrop-blur-md px-6 py-4 flex items-center justify-between z-10">
        <a href="/" className="flex items-center gap-2.5">
          <div className="relative h-12 sm:h-13 w-48 sm:w-56">
            <Image
              src="/logo-transparent.png"
              alt="MadrasatiPro Logo"
              fill
              priority
              className="object-contain object-right"
            />
          </div>
        </a>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 hover:border-orange-200 text-slate-700 text-xs font-bold transition cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>تسجيل الخروج</span>
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 z-10">
        <div className="w-full max-w-xl bg-white border border-orange-100/90 rounded-3xl p-6 sm:p-8 shadow-xl shadow-orange-950/5 text-center space-y-6">
          {/* Animated Status Icon */}
          <div className="w-20 h-20 rounded-full bg-orange-100 border-2 border-orange-300 text-[#F47A3C] flex items-center justify-center mx-auto relative shadow-sm">
            <Clock className="w-10 h-10 animate-pulse" />
          </div>

          <div>
            <span className="text-xs font-black px-3.5 py-1.5 rounded-full bg-orange-100 text-[#F47A3C] border border-orange-200 inline-block mb-3">
              حساب قيد المراجعة والتدقيق
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-[#17191D]">
              طلب اعتماد المؤسسة قيد المعالجة
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
              شكراً لتسجيلك في منصة مدرستي برو (MadrasatiPro). يقوم فريق إدارة المنصة حالياً بالتحقق من بيانات المدرسة واعتماد خطة الاشتراك الخاصة بك.
            </p>
          </div>

          {/* Institution Summary Box */}
          <div className="bg-[#FFF9F5] border border-orange-100 rounded-2xl p-5 text-right text-xs space-y-3">
            <div className="flex items-center justify-between border-b border-orange-200/60 pb-2.5">
              <span className="text-slate-500">اسم المؤسسة المسجلة:</span>
              <span className="font-extrabold text-[#17191D] text-sm">{institution?.name || "مدرستي"}</span>
            </div>
            <div className="flex items-center justify-between border-b border-orange-200/60 pb-2.5">
              <span className="text-slate-500">الولاية:</span>
              <span className="font-bold text-slate-700">{wilayaName}</span>
            </div>
            <div className="flex items-center justify-between border-b border-orange-200/60 pb-2.5">
              <span className="text-slate-500">حساب المشرف:</span>
              <span className="font-bold text-slate-700">{user?.fullName || "المدير"} ({user?.email})</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">خطة الاشتراك المختارة:</span>
              <span className="font-extrabold text-[#F47A3C]">
                {institution?.subscription?.plan?.name || "Professional"}
              </span>
            </div>
          </div>

          {/* Stepper Timeline */}
          <div className="space-y-3 pt-2 text-right">
            <div className="flex items-center gap-3 text-xs">
              <div className="w-6 h-6 rounded-full bg-[#18B89C] text-white flex items-center justify-center font-bold text-[10px]">
                ✓
              </div>
              <span className="text-slate-700 font-semibold">1. إرسال طلب الانضمام وبيانات المؤسسة (مكتمل)</span>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <div className="w-6 h-6 rounded-full bg-[#F47A3C] text-white flex items-center justify-center font-black text-[10px] animate-pulse">
                2
              </div>
              <span className="text-[#F47A3C] font-bold">2. مراجعة الإدارة والتحقق من الدفع (قيد المعالجة)</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center font-bold text-[10px]">
                3
              </div>
              <span>3. تفعيل الحساب والوصول الكامل للوحة التحكم</span>
            </div>
          </div>

          {/* Refresh Action */}
          <div className="pt-2">
            <button
              onClick={checkStatus}
              disabled={checking}
              className="w-full bg-[#F47A3C] hover:bg-[#d36128] text-white font-bold py-3.5 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 transition disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${checking ? "animate-spin" : ""}`} />
              <span>{checking ? "جارٍ التحقق..." : "تحقق من التفعيل الآن (Refresh)"}</span>
            </button>
          </div>

          {/* Centralized Support & Contact Info */}
          <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500 space-y-2">
            <p className="font-bold text-slate-700">هل تحتاج إلى مساعدة أو لتسريع اعتماد الحساب؟</p>
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-slate-700 font-bold text-[11px] sm:text-xs">
              {platformSettings.supportPhone && (
                <a
                  href={`tel:${platformSettings.supportPhone.replace(/\s+/g, "")}`}
                  className="hover:text-[#F47A3C] transition flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/80"
                >
                  <Phone className="w-3.5 h-3.5 text-[#F47A3C]" />
                  <span>الدعم: {platformSettings.supportPhone}</span>
                </a>
              )}
              {platformSettings.supportEmail && (
                <a
                  href={`mailto:${platformSettings.supportEmail}`}
                  className="hover:text-[#F47A3C] transition flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/80"
                >
                  <Mail className="w-3.5 h-3.5 text-[#18B89C]" />
                  <span>البريد: {platformSettings.supportEmail}</span>
                </a>
              )}
              {platformSettings.whatsapp && (
                <a
                  href={`https://wa.me/${platformSettings.whatsapp.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-700 transition flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 text-emerald-800"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>WhatsApp: {platformSettings.whatsapp}</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
