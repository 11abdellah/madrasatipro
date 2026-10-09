"use client";

import React, { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle2,
  GraduationCap,
  ArrowLeft,
  Compass,
  Calculator,
  BookOpen,
  Loader2,
} from "lucide-react";

function LoginForm() {
  const searchParams = useSearchParams();
  const resetParam = searchParams.get("reset");
  const registeredParam = searchParams.get("registered");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (resetParam === "success") {
      setSuccessMsg("تم تغيير كلمة المرور بنجاح! يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة.");
    } else if (registeredParam === "free") {
      setSuccessMsg("تم إنشاء حساب مؤسستك وتفعيله بنجاح! يمكنك الآن تسجيل الدخول مباشرة.");
    }
  }, [resetParam, registeredParam]);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "فشل تسجيل الدخول");
      }

      // Check role & institution status for redirection
      if (data.user?.role === "SUPER_ADMIN") {
        window.location.href = "/super-admin";
        return;
      }

      if (data.user?.institution?.status === "PENDING_APPROVAL") {
        window.location.href = "/pending-approval";
        return;
      }

      // Default active institution admin
      window.location.href = "/dashboard";
    } catch (err: any) {
      setErrorMsg(err.message || "حدث خطأ أثناء تسجيل الدخول");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-orange-100/90 rounded-3xl p-6 sm:p-10 shadow-xl shadow-orange-950/5 relative">
      <div className="text-center mb-6">
        <div className="relative h-12 sm:h-13 w-48 sm:w-56 mx-auto mb-2 lg:hidden">
          <Image
            src="/logo-transparent.png"
            alt="MadrasatiPro Logo"
            fill
            className="object-contain"
          />
        </div>
        {/* Mobile Educational Illustration: Compact, non-intrusive, transparent */}
        <div className="lg:hidden my-2 max-w-[140px] aspect-square mx-auto flex items-center justify-center">
          <Image
            src="/happy-student-rafiki.png"
            alt="تلاميذ مدرستي برو"
            width={140}
            height={140}
            priority
            className="w-full h-auto object-contain select-none pointer-events-none drop-shadow-xs"
          />
        </div>
        <h2 className="text-2xl font-black text-[#17191D] mb-1.5">تسجيل الدخول إلى حسابك</h2>
        <p className="text-xs text-slate-500">
          أدخل بريدك الإلكتروني وكلمة المرور للوصول إلى لوحة التحكم
        </p>
      </div>

      {successMsg && (
        <div className="mb-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            البريد الإلكتروني
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@institution.dz"
              className="w-full bg-[#FFF9F5] border border-orange-200/80 rounded-xl py-3 px-10 text-xs text-[#17191D] placeholder-slate-400 focus:outline-none focus:border-[#F47A3C] focus:bg-white transition"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            كلمة المرور
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#FFF9F5] border border-orange-200/80 rounded-xl py-3 px-10 text-xs text-[#17191D] placeholder-slate-400 focus:outline-none focus:border-[#F47A3C] focus:bg-white transition"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between text-xs pt-1">
          <label className="flex items-center gap-2 cursor-pointer text-slate-600 select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-[#F47A3C] focus:ring-[#F47A3C]"
            />
            <span>تذكرني على هذا الجهاز</span>
          </label>

          <Link
            href="/forgot-password"
            className="text-[#F47A3C] font-semibold hover:underline"
          >
            نسيت كلمة المرور؟
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#F47A3C] hover:bg-[#d36128] text-white font-black py-3.5 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 transition disabled:opacity-50 mt-3 cursor-pointer"
        >
          <span>{loading ? "جارٍ تسجيل الدخول..." : "دخول إلى النظام"}</span>
          <ArrowRight className="w-4 h-4 rtl:rotate-180" />
        </button>
      </form>

      <div className="mt-6 text-center text-xs text-slate-600 border-t border-slate-100 pt-5">
        ليس لديك حساب بعد؟{" "}
        <Link href="/register" className="text-[#F47A3C] font-black hover:underline">
          سجّل مؤسستك التعليمية الآن مجاناً
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div
      dir="rtl"
      className="min-h-screen bg-[#FFF9F5] text-[#17191D] flex flex-col font-sans relative overflow-hidden"
    >
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
        <div className="absolute bottom-20 left-[14%] opacity-20 animate-float-gentle">
          <Calculator className="w-9 h-9 text-[#F47A3C]" />
        </div>
        <div className="absolute top-28 right-[15%] opacity-20 animate-float-sway">
          <BookOpen className="w-8 h-8 text-[#F6C84A]" />
        </div>
      </div>

      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between max-w-7xl mx-auto w-full z-10">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative h-12 sm:h-13 w-48 sm:w-56">
            <Image
              src="/logo-transparent.png"
              alt="MadrasatiPro Logo"
              fill
              priority
              className="object-contain object-right"
            />
          </div>
        </Link>

        <Link
          href="/"
          className="text-xs text-slate-600 hover:text-[#F47A3C] transition font-bold flex items-center gap-1.5"
        >
          <span>العودة للرئيسية</span>
          <ArrowLeft className="w-3.5 h-3.5" />
        </Link>
      </header>

      {/* Main Container: Two-column layout on desktop */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8 z-10">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Side 1: Brand & Value Column */}
          <div className="hidden lg:flex lg:col-span-5 flex-col space-y-4 text-right pr-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-orange-200/80 text-xs font-bold text-[#F47A3C] shadow-sm w-fit">
              <span className="w-2 h-2 rounded-full bg-[#F47A3C] animate-pulse" />
              <span>بوابة الدخول الموحدة لمدرستي برو</span>
            </div>

            <div className="space-y-1.5">
              <h1 className="text-2xl xl:text-3xl font-black text-[#17191D] leading-tight">
                مرحبًا بعودتك إلى منصتك
              </h1>
              <p className="text-xs text-slate-600 leading-relaxed">
                أدر مؤسستك التعليمية، أفواجك، جداولك، والمالية بالدينار الجزائري بكل بساطة وموثوقية من مكان واحد.
              </p>
            </div>

            {/* Educational Illustration: Happy Students (Storyset / Rafiki style) */}
            <div className="my-1 relative flex items-center justify-center">
              <div className="relative w-full max-w-[280px] aspect-square flex items-center justify-center">
                <Image
                  src="/happy-student-rafiki.png"
                  alt="تلاميذ مدرستي برو سعداء بالتفوق والتعليم المنظم"
                  width={280}
                  height={280}
                  priority
                  className="w-full h-auto object-contain select-none pointer-events-none drop-shadow-sm"
                />
              </div>
            </div>

            {/* Feature Points */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center gap-2.5 text-xs text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-[#18B89C] shrink-0" />
                <span className="font-semibold">لوحة تحكم فورية وشاملة لمدرستك</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-[#18B89C] shrink-0" />
                <span className="font-semibold">جداول توقيت وحصص ذكية بدون تضارب</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-[#18B89C] shrink-0" />
                <span className="font-semibold">كشف الحضور اللحظي ومتابعة المدفوعات DZD</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-orange-100 shadow-sm flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-orange-100 text-[#F47A3C] flex items-center justify-center shrink-0">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#17191D]">متوافق 100% مع التعليم الجزائري</p>
                <p className="text-[10px] text-slate-500">تحضير البكالوريا (BAC) وشهادة التعليم المتوسط (BEM)</p>
              </div>
            </div>
          </div>

          {/* Side 2: Login Card */}
          <div className="lg:col-span-7">
            <Suspense
              fallback={
                <div className="bg-white rounded-3xl p-10 flex flex-col items-center justify-center space-y-3">
                  <Loader2 className="w-8 h-8 animate-spin text-[#F47A3C]" />
                </div>
              }
            >
              <LoginForm />
            </Suspense>
          </div>

        </div>
      </main>

      {/* Footer Note */}
      <footer className="py-4 text-center text-[11px] text-slate-400 z-10">
        منصة مدرستي برو للتقنيات التعليمية (MadrasatiPro EdTech DZ) • جميع الحقوق محفوظة 2026
      </footer>
    </div>
  );
}
