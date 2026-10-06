"use client";

import React, { useState } from "react";
import { X, Check, Sparkles, Zap, ArrowLeft, ArrowRight, ShieldCheck, Building2 } from "lucide-react";
import { formatDZD } from "@/lib/utils";

interface UpgradePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlanSlug?: string;
  usage?: {
    students: number;
    teachers: number;
    groups: number;
  };
}

export const UpgradePlanModal: React.FC<UpgradePlanModalProps> = ({
  isOpen,
  onClose,
  currentPlanSlug = "free",
  usage,
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<"monthly" | "annual">("monthly");
  const [isSuccess, setIsSuccess] = useState(false);
  const [apiPlans, setApiPlans] = useState<any[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);

  React.useEffect(() => {
    if (!isOpen) return;
    setLoadingPlans(true);
    fetch("/api/super-admin/plans")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.plans) && data.plans.length > 0) {
          setApiPlans(data.plans);
        }
      })
      .catch((err) => {
        console.error("Failed to load plans from DB:", err);
      })
      .finally(() => {
        setLoadingPlans(false);
      });
  }, [isOpen]);

  if (!isOpen) return null;

  const defaultPlans = [
    {
      slug: "free",
      name: "الخطة المجانية التجريبية",
      badge: "الحالية",
      popular: false,
      priceMonthly: 0,
      priceAnnual: 0,
      description: "لتجربة MadrasatiPro بدون أي التزام مالي",
      limits: { students: 30, teachers: 5, groups: 5, branches: 1 },
      features: [
        "إدارة حتى 30 تلميذاً",
        "حتى 5 أساتذة و 5 أفواج",
        "تسجيل الحضور والغياب",
        "إدارة الفواتير والمدفوعات",
      ],
    },
    {
      slug: "starter",
      name: "الخطة الأساسية (Starter)",
      badge: "للمراكز الصاعدة",
      popular: false,
      priceMonthly: 5000,
      priceAnnual: 48000,
      description: "مثالية للأساتذة الأحرار والمراكز والمكاتب التعليمية الناشئة",
      limits: { students: 50, teachers: 10, groups: 10, branches: 1 },
      features: [
        "إدارة حتى 50 تلميذاً",
        "حتى 10 أساتذة و 10 أفواج",
        "فرع ومقر تعليمي واحد",
        "تسجيل الحضور والغياب اللحظي",
        "إدارة الفواتير ووصولات DZD",
      ],
    },
    {
      slug: "pro",
      name: "الخطة الاحترافية (Professional)",
      badge: "الأكثر طلباً",
      popular: true,
      priceMonthly: 15000,
      priceAnnual: 144000,
      description: "الخيار الأفضل لمدارس الدعم المتوسطة ومعاهد اللغات المتنامية",
      limits: { students: 300, teachers: 25, groups: 50, branches: 3 },
      features: [
        "إدارة حتى 300 تلميذ",
        "حتى 25 أستاذاً و 50 فوجاً",
        "إدارة حتى 3 فروع مستقلة",
        "محرك منع تضارب القاعات الذكي",
        "حساب رواتب ونسب الأساتذة آلياً",
        "تقارير وإحصائيات متقدمة",
      ],
    },
    {
      slug: "business",
      name: "خطة الأعمال والمؤسسات (Business)",
      badge: "المؤسسات الكبرى",
      popular: false,
      priceMonthly: 35000,
      priceAnnual: 336000,
      description: "للمجمعات التعليمية الضخمة ومراكز الامتياز متعددة الفروع",
      limits: { students: 1000, teachers: 100, groups: 200, branches: 10 },
      features: [
        "إدارة حتى 1000 تلميذ",
        "حتى 100 أستاذ و 200 فوج",
        "إدارة حتى 10 فروع تعليمية",
        "جميع مميزات النظام السحابي بالكامل",
        "محرك الجداول والتحليلات المتطورة",
        "أولوية قصوى في الدعم الفني 24/7",
      ],
    },
  ];

  const plans = apiPlans.length > 0
    ? apiPlans.map((p) => {
        const slug = p.slug || "";
        const isPro = slug === "pro" || slug === "professional";
        const isFree = slug === "free" || p.priceDZD === 0;
        const isStarter = slug === "starter";
        const badge = isFree
          ? "الحالية"
          : isPro
          ? "الأكثر طلباً"
          : isStarter
          ? "للمراكز الصاعدة"
          : "المؤسسات الكبرى";

        let featuresList: string[] = [];
        if (Array.isArray(p.features) && p.features.length > 0) {
          featuresList = p.features.map((f: string) => {
            const map: Record<string, string> = {
              students: `إدارة حتى ${p.maxStudents} تلميذاً`,
              teachers: `حتى ${p.maxTeachers} أستاذاً`,
              groups: `حتى ${p.maxGroups || 10} أفواج تعليمية`,
              attendance: "تسجيل الحضور والغياب",
              invoicing: "إدارة الفواتير والوصولات الرسمية",
              payroll: "كشوف الرواتب ومستحقات الأساتذة",
              sms: "بوابة الرسائل والتنبيهات",
              multi_branch: `إدارة حتى ${p.maxBranches || 1} فروع`,
              all_features: "كافة صلاحيات ومميزات المنصة",
              priority_support: "أولوية قصوى في الدعم الفني 24/7",
              custom_domain: "نطاق مخصص وهوية كاملة",
              api_access: "ربط تقني API وتصدير كامل",
            };
            return map[f] || f;
          });
        } else {
          featuresList = [
            `إدارة حتى ${p.maxStudents} تلميذاً`,
            `حتى ${p.maxTeachers} أستاذاً`,
            `حتى ${p.maxBranches || 1} مقر أو فرع`,
            "مساحة سحابية سريعة وآمنة",
          ];
        }

        return {
          slug: p.slug,
          name: p.name,
          badge,
          popular: isPro,
          priceMonthly: p.priceDZD,
          priceAnnual: p.annualPriceDZD || p.priceDZD * 10,
          description: p.description || (isPro ? "الخيار الأفضل لمدارس الدعم ومعاهد اللغات المتنامية" : isStarter ? "المثالية للمدارس الصاعدة ومراكز الدعم الناشئة" : "للمجمعات التعليمية الكبرى ومراكز الامتياز"),
          limits: {
            students: p.maxStudents,
            teachers: p.maxTeachers,
            groups: p.maxGroups || 10,
            branches: p.maxBranches || 1,
          },
          features: featuresList,
        };
      })
    : defaultPlans;

  const handleRequestUpgrade = (planName: string, planPrice: number) => {
    const priceText = planPrice === 0 ? "مجاناً" : `${formatDZD(planPrice)} / ${selectedPeriod === "annual" ? "سنوياً" : "شهرياً"}`;
    const message = encodeURIComponent(
      `السلام عليكم، أرغب في ترقية اشتراك مدرستي في MadrasatiPro إلى (${planName}) بنظام الدفع ${
        selectedPeriod === "annual" ? "السنوي" : "الشهري"
      } (${priceText}).`
    );
    window.open(`https://wa.me/213550000000?text=${message}`, "_blank");
    setIsSuccess(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl max-h-[92vh] overflow-y-auto bg-white rounded-3xl shadow-2xl border border-slate-150 p-6 md:p-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 left-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center max-w-xl mx-auto mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ترقية خطة الاشتراك</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            اختر الخطة المناسبة لحجم مؤسستك
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            جميع الخطط تشمل دعماً فنياً جزائرياً وضمان عمل متواصل 24/7
          </p>

          {/* Billing Switcher (Monthly / Annual) */}
          <div className="mt-4 inline-flex items-center p-1 bg-slate-100 rounded-full border border-slate-200">
            <button
              onClick={() => setSelectedPeriod("monthly")}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                selectedPeriod === "monthly"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              دفع شهري
            </button>
            <button
              onClick={() => setSelectedPeriod("annual")}
              className={`px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${
                selectedPeriod === "annual"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>دفع سنوي</span>
              <span className="text-[10px] bg-amber-400 text-slate-900 font-extrabold px-1.5 py-0.5 rounded-full">
                وفر شهرين!
              </span>
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {plans.map((p) => {
            const isCurrent = currentPlanSlug.toLowerCase().includes(p.slug);
            const price = selectedPeriod === "annual" ? p.priceAnnual : p.priceMonthly;

            return (
              <div
                key={p.slug}
                className={`relative flex flex-col justify-between rounded-2xl p-5 border transition-all duration-200 ${
                  p.popular
                    ? "border-indigo-600 bg-indigo-50/20 shadow-md ring-2 ring-indigo-500/20"
                    : isCurrent
                    ? "border-emerald-500 bg-emerald-50/20"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                {/* Header & Badges */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                        p.popular
                          ? "bg-indigo-600 text-white"
                          : isCurrent
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {p.badge}
                    </span>
                    {isCurrent && (
                      <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                        <Check className="w-3 h-3" /> خطتك الحالية
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-slate-900">{p.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 min-h-[32px]">
                    {p.description}
                  </p>

                  {/* Price */}
                  <div className="my-4 pb-4 border-b border-slate-100">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-slate-900">
                        {price === 0 ? "0 دج" : formatDZD(price)}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        / {selectedPeriod === "annual" ? "سنة" : "شهر"}
                      </span>
                    </div>
                  </div>

                  {/* Features List */}
                  <ul className="space-y-2 mb-6">
                    {p.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
                        <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action CTA */}
                <div>
                  {isCurrent ? (
                    <button
                      disabled
                      className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-100 text-slate-400 cursor-not-allowed text-center"
                    >
                      الخطة الحالية
                    </button>
                  ) : (
                    <button
                      onClick={() => handleRequestUpgrade(p.name, price)}
                      className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 shadow-sm ${
                        p.popular
                          ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                          : "bg-slate-900 hover:bg-slate-800 text-white"
                      }`}
                    >
                      <span>ترقية إلى هذه الخطة</span>
                      <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-0 rotate-180" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Note with BaridiMob / CCP details */}
        <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>الدفع متوفر عبر بريديموب (BaridiMob)، تحويل CCP أو نقداً مع فاتورة رسمية.</span>
          </div>
          <div className="font-semibold text-slate-700">
            للاستفسار المباشر: <span dir="ltr" className="font-mono text-indigo-600">0550 00 00 00</span>
          </div>
        </div>
      </div>
    </div>
  );
};
