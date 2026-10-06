"use client";

import React, { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  ShieldCheck,
  Loader2,
} from "lucide-react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [verifying, setVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [tokenError, setTokenError] = useState("");
  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setVerifying(false);
      setTokenValid(false);
      setTokenError("رابط استعادة كلمة المرور غير صالح أو مفقود.");
      return;
    }

    // Verify token
    fetch(`/api/auth/reset-password?token=${encodeURIComponent(token)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.valid) {
          setTokenValid(true);
          setEmail(data.email || "");
        } else {
          setTokenValid(false);
          setTokenError(data.error || "رابط استعادة كلمة المرور غير صالح أو منتهي الصلاحية.");
        }
      })
      .catch(() => {
        setTokenValid(false);
        setTokenError("تعذر التحقق من صلاحية الرابط.");
      })
      .finally(() => {
        setVerifying(false);
      });
  }, [token]);

  // Password Strength Calculation
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: "", color: "" };
    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd) || /[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (score <= 1) return { score: 1, label: "ضعيفة", color: "bg-rose-500" };
    if (score === 2) return { score: 2, label: "متوسطة", color: "bg-amber-500" };
    return { score: 3, label: "قوية جداً", color: "bg-emerald-500" };
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (password.length < 6) {
      setErrorMsg("كلمة المرور يجب أن لا تقل عن 6 أحرف أو أرقام");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("كلمتا المرور غير متطابقتين");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "تعذر إعادة تعيين كلمة المرور");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/login?reset=success");
      }, 2500);
    } catch (err: any) {
      setErrorMsg(err.message || "حدث خطأ أثناء حفظ كلمة المرور");
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white border border-orange-100 rounded-3xl p-6 sm:p-8 shadow-xl shadow-orange-950/5">
      <div className="text-center mb-6">
        <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-100 text-[#F47A3C] flex items-center justify-center mx-auto mb-3">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-black text-[#17191D] mb-1.5">تعيين كلمة مرور جديدة</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          {email ? `للحساب: ${email}` : "أنشئ كلمة مرور جديدة وقوية لتأمين حسابك"}
        </p>
      </div>

      {verifying ? (
        <div className="py-12 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#F47A3C]" />
          <p className="text-xs font-bold text-slate-500">جاري التحقق من صلاحية الرابط...</p>
        </div>
      ) : !tokenValid ? (
        <div className="space-y-4 text-center">
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 space-y-2">
            <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
            <h3 className="font-extrabold text-sm">الرابط غير صالح</h3>
            <p className="text-xs leading-relaxed">{tokenError}</p>
          </div>
          <Link
            href="/forgot-password"
            className="w-full bg-[#F47A3C] hover:bg-[#d36128] text-white font-bold py-3 rounded-2xl text-xs flex items-center justify-center gap-2 transition"
          >
            <span>طلب رابط استعادة جديد</span>
            <ArrowRight className="w-4 h-4 rtl:rotate-180" />
          </Link>
        </div>
      ) : success ? (
        <div className="space-y-4 text-center">
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <h3 className="font-extrabold text-sm">تم تغيير كلمة المرور بنجاح!</h3>
            <p className="text-xs text-emerald-700 leading-relaxed">
              تم تحديث كلمة المرور الخاصة بك بنجاح. جاري نقلك تلقائياً إلى صفحة تسجيل الدخول...
            </p>
          </div>
          <Link
            href="/login?reset=success"
            className="w-full bg-[#17191D] hover:bg-slate-800 text-white font-bold py-3 rounded-2xl text-xs flex items-center justify-center gap-2 transition"
          >
            <span>الانتقال لتسجيل الدخول فوراً</span>
            <ArrowRight className="w-4 h-4 rtl:rotate-180" />
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              كلمة المرور الجديدة
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="6 أحرف أو أكثر..."
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

            {/* Password strength meter */}
            {password && (
              <div className="mt-2 space-y-1">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-500">قوة كلمة المرور:</span>
                  <span className="font-bold text-slate-800">{strength.label}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex gap-1">
                  <div
                    className={`h-full transition-all duration-300 ${strength.color}`}
                    style={{ width: `${(strength.score / 3) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              تأكيد كلمة المرور الجديدة
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showConfirm ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="أعد إدخال كلمة المرور..."
                className="w-full bg-[#FFF9F5] border border-orange-200/80 rounded-xl py-3 px-10 text-xs text-[#17191D] placeholder-slate-400 focus:outline-none focus:border-[#F47A3C] focus:bg-white transition"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#F47A3C] hover:bg-[#d36128] text-white font-black py-3.5 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 transition disabled:opacity-50 mt-3 cursor-pointer"
          >
            <span>{loading ? "جارٍ الحفظ والتحديث..." : "حفظ كلمة المرور الجديدة"}</span>
            <ArrowRight className="w-4 h-4 rtl:rotate-180" />
          </button>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div
      dir="rtl"
      className="min-h-screen bg-[#FFF9F5] text-[#17191D] flex flex-col font-sans relative overflow-hidden"
    >
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
          <span>تسجيل الدخول</span>
          <ArrowLeft className="w-3.5 h-3.5" />
        </Link>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8 z-10">
        <Suspense
          fallback={
            <div className="w-full max-w-md bg-white rounded-3xl p-8 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-[#F47A3C] mx-auto" />
            </div>
          }
        >
          <ResetPasswordForm />
        </Suspense>
      </main>

      <footer className="py-4 text-center text-[11px] text-slate-400 z-10">
        منصة مدرستي برو للتقنيات التعليمية (MadrasatiPro EdTech DZ) • جميع الحقوق محفوظة 2026
      </footer>
    </div>
  );
}
