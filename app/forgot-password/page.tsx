"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Mail,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  Compass,
  Calculator,
} from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [devToken, setDevToken] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "تعذر إرسال طلب الاستعادة");
      }

      setSubmitted(true);
      if (data.devResetToken) {
        setDevToken(data.devResetToken);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "حدث خطأ أثناء معالجة الطلب");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-[#FFF9F5] text-[#17191D] flex flex-col font-sans relative overflow-hidden"
    >
      {/* Background Floating Educational Objects */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
        <div className="absolute top-16 left-[10%] opacity-20">
          <KeyRound className="w-10 h-10 text-[#F47A3C]" />
        </div>
        <div className="absolute top-[60%] right-[8%] opacity-20">
          <Compass className="w-10 h-10 text-[#18B89C]" />
        </div>
        <div className="absolute bottom-20 left-[14%] opacity-20">
          <Calculator className="w-9 h-9 text-[#F47A3C]" />
        </div>
      </div>

      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between max-w-7xl mx-auto w-full z-10">
        <Link href="/" className="flex items-center gap-2.5">
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
          href="/login"
          className="text-xs text-slate-600 hover:text-[#F47A3C] transition font-bold flex items-center gap-1.5"
        >
          <span>العودة لتسجيل الدخول</span>
          <ArrowLeft className="w-3.5 h-3.5" />
        </Link>
      </header>

      {/* Main Form Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8 z-10">
        <div className="w-full max-w-md bg-white border border-orange-100 rounded-3xl p-6 sm:p-8 shadow-xl shadow-orange-950/5">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-100 text-[#F47A3C] flex items-center justify-center mx-auto mb-3">
              <KeyRound className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black text-[#17191D] mb-1.5">استعادة كلمة المرور</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              أدخل بريدك الإلكتروني المسجل وسنرسل لك رابطاً آمناً لإنشاء كلمة مرور جديدة
            </p>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {submitted ? (
            <div className="space-y-4 text-center">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h3 className="font-extrabold text-sm">تم إرسال الطلب بنجاح</h3>
                <p className="text-xs text-emerald-700 leading-relaxed">
                  إذا كان هذا البريد مسجلاً لدينا، فستتلقى رابطاً لإعادة تعيين كلمة المرور خلال لحظات.
                </p>
              </div>

              {devToken && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 text-right">
                  <p className="font-bold mb-1">🔗 رابط الاستعادة المباشر (بيئة التطوير / الاختبار):</p>
                  <Link
                    href={`/reset-password?token=${devToken}`}
                    className="text-indigo-600 font-extrabold hover:underline break-all block"
                  >
                    /reset-password?token={devToken}
                  </Link>
                </div>
              )}

              <Link
                href="/login"
                className="w-full bg-[#17191D] hover:bg-slate-800 text-white font-bold py-3 rounded-2xl text-xs flex items-center justify-center gap-2 transition"
              >
                <span>العودة لصفحة تسجيل الدخول</span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  البريد الإلكتروني المسجل
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

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#F47A3C] hover:bg-[#d36128] text-white font-black py-3.5 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 transition disabled:opacity-50 mt-2 cursor-pointer"
              >
                <span>{loading ? "جارٍ إرسال الرابط..." : "إرسال رابط الاستعادة"}</span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </button>

              <div className="text-center pt-2">
                <Link
                  href="/login"
                  className="text-xs text-slate-500 hover:text-slate-800 font-medium"
                >
                  تذكرت كلمة المرور؟ <span className="text-[#F47A3C] font-bold">تسجيل الدخول</span>
                </Link>
              </div>
            </form>
          )}
        </div>
      </main>

      <footer className="py-4 text-center text-[11px] text-slate-400 z-10">
        منصة مدرستي برو للتقنيات التعليمية (MadrasatiPro EdTech DZ) • جميع الحقوق محفوظة 2026
      </footer>
    </div>
  );
}
