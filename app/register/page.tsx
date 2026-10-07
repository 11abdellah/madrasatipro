"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  User,
  Building2,
  Layers,
  CreditCard,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Check,
  Compass,
  Calculator,
  AlertCircle,
} from "lucide-react";
import { ALGERIAN_WILAYAS } from "@/lib/constants/algeria";
import { formatDZD } from "@/lib/utils";

export default function RegisterPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [plans, setPlans] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [formData, setFormData] = useState({
    // Step 1: Admin Owner
    adminName: "",
    adminEmail: "",
    adminPhone: "",
    password: "",

    // Step 2: Institution
    name: "",
    code: "",
    wilayaCode: 16, // Alger
    commune: "",
    address: "",
    type: "support_school", // support_school, languages, prep, tutoring

    // Step 3: Plan
    planId: "",

    // Step 4: Payment Method
    paymentMethod: "", // dynamic from DB
    transferReference: "",
  });

  // Read URL search params on mount & fetch plans + payment methods
  useEffect(() => {
    fetch("/api/super-admin/plans")
      .then((res) => res.json())
      .then((data) => {
        if (data.plans && data.plans.length > 0) {
          const activePlans = data.plans.filter((p: any) => p.isActive !== false);
          setPlans(activePlans);
          const params = new URLSearchParams(window.location.search);
          const requestedPlan = params.get("plan");

          if (requestedPlan) {
            const found = activePlans.find(
              (p: any) =>
                p.slug?.toLowerCase() === requestedPlan.toLowerCase() ||
                p.name.toLowerCase().includes(requestedPlan.toLowerCase()) ||
                p.id.toLowerCase() === requestedPlan.toLowerCase()
            );
            if (found) {
              setFormData((prev) => ({ ...prev, planId: found.id }));
              return;
            }
          }
          // Default to middle or first active plan
          if (activePlans.length > 0) {
            setFormData((prev) => ({
              ...prev,
              planId: activePlans[1]?.id || activePlans[0].id,
            }));
          }
        }
      })
      .catch((e) => console.error("Failed to load plans:", e));

    // Fetch active payment methods from single source of truth
    fetch("/api/payment-methods")
      .then((res) => res.json())
      .then((data) => {
        if (data.paymentMethods && data.paymentMethods.length > 0) {
          setPaymentMethods(data.paymentMethods);
          setFormData((prev) => ({
            ...prev,
            paymentMethod: prev.paymentMethod || data.paymentMethods[0].code,
          }));
        }
      })
      .catch((e) => console.error("Failed to load payment methods:", e));
  }, []);

  const steps = [
    { num: 1, title: "بيانات المدير", icon: User },
    { num: 2, title: "بيانات المؤسسة", icon: Building2 },
    { num: 3, title: "اختيار الخطة", icon: Layers },
    { num: 4, title: "طريقة الدفع والتأكيد", icon: CreditCard },
  ];

  const handleNext = () => {
    setErrorMsg("");
    if (currentStep === 1) {
      if (!formData.adminName.trim() || !formData.adminEmail.trim() || !formData.password) {
        setErrorMsg("يرجى ملء جميع الحقول الإلزامية لحساب المدير");
        return;
      }
      if (formData.password.length < 6) {
        setErrorMsg("كلمة المرور يجب أن تتكون من 6 أحرف على الأقل");
        return;
      }
    } else if (currentStep === 2) {
      if (!formData.name.trim()) {
        setErrorMsg("اسم المؤسسة التعليمية مطلوب");
        return;
      }
    }
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const generatedCode =
        formData.code ||
        formData.name
          .toLowerCase()
          .replace(/[^\w\s-]/g, "")
          .trim()
          .replace(/\s+/g, "-") ||
        `inst-${Date.now().toString().slice(-5)}`;

      const selectedMethodObj = paymentMethods.find((m) => m.code === formData.paymentMethod) || paymentMethods[0];

      const res = await fetch("/api/super-admin/institutions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          code: generatedCode,
          wilayaCode: formData.wilayaCode,
          address: `${formData.commune} — ${formData.address}`.trim(),
          planId: formData.planId,
          adminName: formData.adminName,
          adminEmail: formData.adminEmail,
          adminPhone: formData.adminPhone || "0550000000",
          password: formData.password,
          status: isFreePlan ? "ACTIVE" : "PENDING_APPROVAL",
          paymentMethodId: isFreePlan ? null : selectedMethodObj?.id,
          paymentMethod: isFreePlan ? null : (selectedMethodObj?.code || formData.paymentMethod),
          paymentMethodName: isFreePlan ? null : (selectedMethodObj?.name || selectedMethodObj?.displayName),
          transferReference: isFreePlan ? null : formData.transferReference,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "تعذر إرسال طلب التسجيل");
      }

      if (isFreePlan || data.institution?.status === "ACTIVE") {
        window.location.href = "/login?registered=free";
      } else {
        window.location.href = "/pending-approval";
      }
    } catch (err: any) {
      setErrorMsg(err.message || "حدث خطأ أثناء التسجيل");
      setLoading(false);
    }
  };

  const selectedPlanObj = plans.find((p) => p.id === formData.planId) || plans[0];
  const isFreePlan = (selectedPlanObj?.priceDZD === 0) || (selectedPlanObj?.slug === "free");
  const selectedMethodObj = paymentMethods.find((m) => m.code === formData.paymentMethod || m.id === formData.paymentMethod) || paymentMethods[0];

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-[#FFF9F5] text-[#17191D] flex flex-col font-sans relative overflow-x-hidden"
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
      </div>

      {/* Header with Official Logo */}
      <header className="px-6 py-4 border-b border-slate-200/80 bg-white/95 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.03)] backdrop-blur-md z-10">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <a href="/" className="flex items-center gap-2.5 group">
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
          <div className="flex items-center gap-3 text-xs font-semibold">
            <span className="text-slate-600 hidden sm:inline">لديك حساب مسجل مسبقاً؟</span>
            <a
              href="/login"
              className="text-[#F47A3C] hover:text-[#d36128] font-bold underline"
            >
              تسجيل الدخول
            </a>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-8 flex flex-col justify-center z-10">
        {/* Title */}
        <div className="text-center mb-8">
          <span className="text-xs font-black px-3.5 py-1.5 rounded-full bg-orange-100 text-[#F47A3C] border border-orange-200/80 inline-block mb-2">
            ابدأ مؤسستك التعليمية مع مدرستي برو
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-[#17191D]">
            أنشئ حسابك وابدأ إدارة مؤسستك في دقائق
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-lg mx-auto">
            خطوات بسيطة لتسجيل مدرستك والحصول على النظام السحابي المتكامل لإدارة الطلاب والأفواج
          </p>
        </div>

        {/* Stepper Wizard Progress */}
        <div className="bg-white border border-orange-100/90 rounded-3xl p-4 sm:p-6 mb-8 shadow-sm">
          <div className="flex items-center justify-between relative">
            {steps.map((s) => {
              const isPast = currentStep > s.num;
              const isCurrent = currentStep === s.num;
              const Icon = s.icon;

              return (
                <div key={s.num} className="flex-1 flex flex-col items-center relative z-10">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isPast
                        ? "bg-[#18B89C] text-white shadow-md shadow-teal-500/20"
                        : isCurrent
                        ? "bg-[#F47A3C] text-white shadow-lg shadow-orange-500/25 scale-110 ring-4 ring-orange-100"
                        : "bg-slate-100 text-slate-400 border border-slate-200"
                    }`}
                  >
                    {isPast ? <Check className="w-5 h-5" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <span
                    className={`text-[11px] font-bold mt-2 text-center hidden sm:block ${
                      isCurrent ? "text-[#F47A3C]" : isPast ? "text-[#18B89C]" : "text-slate-400"
                    }`}
                  >
                    {s.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white border border-orange-100/90 rounded-3xl p-6 sm:p-8 shadow-xl shadow-orange-950/5">
          {errorMsg && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* STEP 1: ADMIN OWNER */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-black text-[#17191D] mb-1">بيانات المشرف / صاحب المؤسسة</h3>
                <p className="text-xs text-slate-500">
                  هذه البيانات ستكون حسابك الرئيسي للدخول وإدارة النظام
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    الاسم واللقب الكامل *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.adminName}
                    onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                    placeholder="مثال: عبد القادر بن عيسى"
                    className="w-full bg-[#FFF9F5] border border-orange-200/80 rounded-xl p-3 text-xs text-[#17191D] placeholder-slate-400 focus:outline-none focus:border-[#F47A3C] focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    رقم الهاتف (الجزائر) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.adminPhone}
                    onChange={(e) => setFormData({ ...formData, adminPhone: e.target.value })}
                    placeholder="0550 12 34 56"
                    className="w-full bg-[#FFF9F5] border border-orange-200/80 rounded-xl p-3 text-xs text-[#17191D] placeholder-slate-400 focus:outline-none focus:border-[#F47A3C] focus:bg-white transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    البريد الإلكتروني للدخول *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.adminEmail}
                    onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                    placeholder="director@school.dz"
                    className="w-full bg-[#FFF9F5] border border-orange-200/80 rounded-xl p-3 text-xs text-[#17191D] placeholder-slate-400 focus:outline-none focus:border-[#F47A3C] focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    كلمة المرور *
                  </label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="6 أحرف أو أرقام على الأقل"
                    className="w-full bg-[#FFF9F5] border border-orange-200/80 rounded-xl p-3 text-xs text-[#17191D] placeholder-slate-400 focus:outline-none focus:border-[#F47A3C] focus:bg-white transition"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: INSTITUTION DETAILS */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-black text-[#17191D] mb-1">بيانات المدرسة أو المركز التعليمي</h3>
                <p className="text-xs text-slate-500">
                  المعلومات الرسمية التي ستظهر في كشوفات الحضور، الجداول ووصولات الدفع للطلاب
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    اسم المؤسسة أو المركز التعليمي *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="مثال: مدرسة التميز للدعم المدرسي واللغات"
                    className="w-full bg-[#FFF9F5] border border-orange-200/80 rounded-xl p-3 text-xs text-[#17191D] placeholder-slate-400 focus:outline-none focus:border-[#F47A3C] focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    نوع النشاط التعليمي *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full bg-[#FFF9F5] border border-orange-200/80 rounded-xl p-3 text-xs text-[#17191D] focus:outline-none focus:border-[#F47A3C] transition"
                  >
                    <option value="support_school">مدرسة دروس الدعم والتقوية</option>
                    <option value="languages">معهد / مركز تعليم اللغات الحية</option>
                    <option value="prep_bac">مركز التحضير لامتحان البكالوريا و BEM</option>
                    <option value="tutoring">أستاذ حر / مجموعة تدريس مستقلة</option>
                    <option value="training">مركز تدريب وتكوين مهني خاص</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    الولاية (58 ولاية جزائرية) *
                  </label>
                  <select
                    value={formData.wilayaCode}
                    onChange={(e) => setFormData({ ...formData, wilayaCode: Number(e.target.value) })}
                    className="w-full bg-[#FFF9F5] border border-orange-200/80 rounded-xl p-3 text-xs text-[#17191D] focus:outline-none focus:border-[#F47A3C] transition"
                  >
                    {ALGERIAN_WILAYAS.map((w) => (
                      <option key={w.code} value={w.code}>
                        {w.code} - {w.nameAr}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    البلدية والمقر
                  </label>
                  <input
                    type="text"
                    value={formData.commune}
                    onChange={(e) => setFormData({ ...formData, commune: e.target.value })}
                    placeholder="مثال: باب الزوار"
                    className="w-full bg-[#FFF9F5] border border-orange-200/80 rounded-xl p-3 text-xs text-[#17191D] placeholder-slate-400 focus:outline-none focus:border-[#F47A3C] focus:bg-white transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  العنوان التفصيلي للمقر
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="شارع الاستقلال، مقابل محطة الترامواي"
                  className="w-full bg-[#FFF9F5] border border-orange-200/80 rounded-xl p-3 text-xs text-[#17191D] placeholder-slate-400 focus:outline-none focus:border-[#F47A3C] focus:bg-white transition"
                />
              </div>
            </div>
          )}

          {/* STEP 3: PLAN SELECTION */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-black text-[#17191D] mb-1">اختر الخطة الشهرية المناسبة</h3>
                <p className="text-xs text-slate-500">
                  يمكنك ترقية أو تعديل خطتك في أي وقت لاحقاً مع نمو عدد طلابك
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                {plans.map((p) => {
                  const isSelected = formData.planId === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => setFormData({ ...formData, planId: p.id })}
                      className={`rounded-2xl p-5 border cursor-pointer transition-all flex flex-col justify-between ${
                        isSelected
                          ? "bg-orange-50/50 border-[#F47A3C] shadow-lg shadow-orange-500/15 ring-2 ring-orange-500/30"
                          : "bg-white border-slate-200 hover:border-orange-200"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-black text-[#17191D] text-base">{p.name}</h4>
                          <div
                            className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                              isSelected
                                ? "bg-[#F47A3C] border-[#F47A3C] text-white"
                                : "border-slate-300"
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3" />}
                          </div>
                        </div>

                        <div className="my-3">
                          <span className="text-2xl font-black text-[#17191D]">
                            {formatDZD(p.priceDZD, "ar")}
                          </span>
                          <span className="text-[11px] text-slate-500 mr-1.5">/ شهر</span>
                        </div>

                        <ul className="text-xs text-slate-600 space-y-2 border-t border-slate-100 pt-3">
                          <li className="flex items-center gap-1.5">
                            <span className="text-[#18B89C] font-bold">✓</span>
                            <span>حتى {p.maxStudents} طالب</span>
                          </li>
                          <li className="flex items-center gap-1.5">
                            <span className="text-[#18B89C] font-bold">✓</span>
                            <span>حتى {p.maxTeachers} أستاذ</span>
                          </li>
                          <li className="flex items-center gap-1.5">
                            <span className="text-[#18B89C] font-bold">✓</span>
                            <span>{p.maxBranches} فرع رئيسي</span>
                          </li>
                          <li className="flex items-center gap-1.5">
                            <span className="text-[#18B89C] font-bold">✓</span>
                            <span>مساحة {p.storageLimitGB} GB</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: PAYMENT METHOD & CONFIRMATION */}
          {currentStep === 4 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-lg font-black text-[#17191D] mb-1">
                  {isFreePlan ? "تأكيد وبدء التجربة المجانية" : "طريقة الدفع وتأكيد الطلب"}
                </h3>
                <p className="text-xs text-slate-500">
                  {isFreePlan
                    ? "الخطة التجريبية مجانية 100% ولا تتطلب أي وسيلة دفع أو تحويل بريدي."
                    : "اختر وسيلة الدفع المفضلة لديك بالدينار الجزائري لتفعيل الاشتراك"}
                </p>
              </div>

              {/* Order Summary Box */}
              <div className="bg-[#FFF9F5] border border-orange-100 rounded-2xl p-4 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">المؤسسة:</span>
                  <span className="font-bold text-[#17191D]">{formData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">الخطة المختارة:</span>
                  <span className="font-bold text-[#F47A3C]">{selectedPlanObj?.name || "الخطة التجريبية"}</span>
                </div>
                <div className="flex justify-between text-sm border-t border-orange-200/60 pt-2 font-black">
                  <span className="text-slate-700">المبلغ المستحق:</span>
                  <span className="text-[#18B89C]">
                    {isFreePlan ? "0 دج (مجاناً تماماً 🎁)" : formatDZD(selectedPlanObj?.priceDZD ?? 0, "ar")}
                  </span>
                </div>
              </div>

              {isFreePlan ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>تفعيل فوري تلقائي — بدون أي دفع مالي</span>
                  </div>
                  <p className="text-xs text-emerald-700 leading-relaxed">
                    تم اختيار الخطة التجريبية المجانية. سيتم إنشاء لوحة تحكم مدرستك وتفعيل حسابك فوراً بمجرد الضغط على الزر أدناه لتتمكن من تجربة المنصة بالكامل.
                  </p>
                </div>
              ) : (
                <>
                  {/* Database-Backed Active Payment Methods */}
                  <div className="space-y-3">
                    <label className="block text-xs font-bold text-slate-700">
                      وسيلة الدفع المتاحة في الجزائر:
                    </label>
                    {paymentMethods.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {paymentMethods.map((m) => {
                          const isSelected = formData.paymentMethod === m.code;
                          return (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => setFormData({ ...formData, paymentMethod: m.code })}
                              className={`p-3.5 rounded-2xl border text-right transition cursor-pointer ${
                                isSelected
                                  ? "border-[#F47A3C] bg-orange-50 text-[#F47A3C] font-bold shadow-xs"
                                  : "border-slate-200 bg-white text-slate-600 hover:border-orange-200"
                              }`}
                            >
                              <p className="text-xs font-extrabold">{m.name || m.displayName}</p>
                              {m.description && (
                                <p className="text-[10px] opacity-75 mt-0.5 line-clamp-1">{m.description}</p>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-500 text-center">
                        جارٍ تحميل وسائل الدفع المعتمدة...
                      </div>
                    )}
                  </div>

                  {/* Dynamic Instructions & Account Details */}
                  {selectedMethodObj && (
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 space-y-1.5 leading-relaxed">
                      <p className="font-bold text-[#17191D]">
                        معلومات الدفع المباشر ({selectedMethodObj.name}):
                      </p>
                      {selectedMethodObj.accountNumber && (
                        <p>
                          رقم الحساب / RIP:{" "}
                          <span className="font-mono font-bold text-amber-950 bg-amber-100/60 px-2 py-0.5 rounded-md">
                            {selectedMethodObj.accountNumber}
                          </span>
                        </p>
                      )}
                      {selectedMethodObj.accountName && (
                        <p>
                          صاحب الحساب:{" "}
                          <span className="font-bold text-amber-950">
                            {selectedMethodObj.accountName}
                          </span>
                        </p>
                      )}
                      {selectedMethodObj.instructions && (
                        <p className="text-[11px] text-amber-800 pt-0.5">
                          {selectedMethodObj.instructions}
                        </p>
                      )}
                      <div className="pt-2 border-t border-amber-200/60">
                        <label className="block text-[11px] font-bold text-amber-900 mb-1">
                          رقم الحوالة أو إشعار التحويل البريدي / البنكي (اختياري):
                        </label>
                        <input
                          type="text"
                          value={formData.transferReference}
                          onChange={(e) =>
                            setFormData({ ...formData, transferReference: e.target.value })
                          }
                          placeholder="مثال: رقم العملية في بريدي موب أو رقم وصل CCP"
                          className="w-full bg-white border border-amber-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium placeholder:text-slate-400 focus:outline-hidden focus:border-[#F47A3C]"
                        />
                      </div>
                      <p className="text-[10px] text-amber-700 pt-1">
                        بعد إرسال طلبك، سيقوم فريق الدعم بمراجعة بيانات المؤسسة والتواصل معك عبر الهاتف لتفعيل حسابك فورياً.
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Stepper Bottom Controls */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-6">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handlePrev}
                className="px-5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                <ArrowRight className="w-4 h-4" />
                <span>السابق</span>
              </button>
            ) : (
              <div />
            )}

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2.5 rounded-2xl bg-[#F47A3C] hover:bg-[#d36128] text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-orange-500/25 transition cursor-pointer"
              >
                <span>متابعة</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={loading}
                onClick={handleSubmit}
                className="px-8 py-3 rounded-2xl bg-[#18B89C] hover:bg-[#149B83] text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-teal-500/25 transition disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <span>جارٍ تفعيل الحساب...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isFreePlan ? "تفعيل الحساب والبدء فوراً (مجاناً)" : "تأكيد وإرسال طلب الاشتراك"}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </main>

      <footer className="py-4 text-center text-[11px] text-slate-400 z-10">
        منصة مدرستي برو للتقنيات التعليمية (MadrasatiPro EdTech DZ) • جميع الحقوق محفوظة 2026
      </footer>
    </div>
  );
}
