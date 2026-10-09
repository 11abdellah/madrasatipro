"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  CalendarCheck,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  CalendarDays,
  Users,
  Wallet,
  GraduationCap,
  ShieldCheck,
  ChevronDown,
  Clock,
  Building2,
  Check,
  Phone,
  Mail,
  BarChart3,
  Award,
  RotateCw,
  Play,
  Zap,
  BookOpen,
  Smartphone,
  FileText,
  Lock,
  Layers,
  CheckCircle,
  HelpCircle,
  Calculator,
  Compass,
  MessageCircle,
  Globe,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { formatDZD } from "@/lib/utils";
import { ProductShowcaseSection } from "@/components/landing/ProductShowcaseSection";

export default function LandingPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annual">("monthly");
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activePlanMobileIdx, setActivePlanMobileIdx] = useState(0);
  const plansScrollRef = React.useRef<HTMLDivElement>(null);
  const [faqOpen, setFaqOpen] = useState<number | null>(0);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [platformSettings, setPlatformSettings] = useState<any>({
    mainPhone: "0550 12 34 56",
    supportPhone: "0770 98 76 54",
    salesPhone: "0550 12 34 56",
    mainEmail: "contact@madrasatipro.dz",
    supportEmail: "support@madrasatipro.dz",
    salesEmail: "sales@madrasatipro.dz",
    whatsapp: "213550123456",
    facebookUrl: "",
    instagramUrl: "",
    linkedinUrl: "",
    youtubeUrl: "",
    tiktokUrl: "",
    address: "الجزائر العاصمة • سطيف • وهران • قسنطينة",
  });

  // Fetch real subscription plans from database
  useEffect(() => {
    fetch("/api/super-admin/plans")
      .then((res) => res.json())
      .then((data) => {
        if (data.plans && data.plans.length > 0) {
          const activePlans = data.plans.filter((p: any) => p.isActive !== false);
          setPlans(activePlans);
        } else {
          setPlans(defaultPlans.filter((p: any) => p.isActive !== false));
        }
      })
      .catch(() => {
        setPlans(defaultPlans.filter((p: any) => p.isActive !== false));
      })
      .finally(() => {
        setLoadingPlans(false);
      });
  }, []);

  // Fetch platform settings from database
  useEffect(() => {
    fetch("/api/platform/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) {
          setPlatformSettings(data.settings);
        }
      })
      .catch((err) => {
        console.error("Failed to load platform settings:", err);
      });
  }, []);

  // Scroll Reveal Observer for Storytelling & Smooth Motion
  useEffect(() => {
    const observerCallback: IntersectionObserverCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-revealed");
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, {
      threshold: 0.1,
      rootMargin: "0px 0px -30px 0px",
    });

    const elements = document.querySelectorAll(
      ".reveal-on-scroll, .reveal-left, .reveal-right, .reveal-scale"
    );
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [loadingPlans]);

  const defaultPlans = [
    {
      id: "free",
      name: "الخطة التجريبية المجانية (Free Trial)",
      slug: "free",
      description: "تجربة مجانية كاملة لجميع وظائف المنصة لاستكشاف القوة التشغيلية",
      priceDZD: 0,
      annualPriceDZD: 0,
      maxStudents: 20,
      maxTeachers: 5,
      maxBranches: 1,
      storageLimitGB: 2,
      features: [
        "إدارة حتى 20 تلميذ",
        "تسجيل حتى 5 أساتذة",
        "فرع ومقر تعليمي واحد",
        "تجربة مجانية 0 دج بدون بطاقة بنكية",
        "لوحة تحكم كاملة ومتجاوبة",
        "مساحة سحابية 2 GB",
      ],
    },
    {
      id: "starter",
      name: "الخطة الأساسية (Starter)",
      slug: "starter",
      description: "مثالية للأساتذة الأحرار والمراكز والمكاتب التعليمية الناشئة",
      priceDZD: 5000,
      annualPriceDZD: 48000,
      maxStudents: 50,
      maxTeachers: 10,
      maxBranches: 1,
      storageLimitGB: 10,
      features: [
        "إدارة حتى 50 تلميذ",
        "تسجيل حتى 10 أساتذة",
        "فرع ومقر تعليمي واحد",
        "كشف الحضور والغياب اللحظي",
        "طباعة فواتير ووصولات DZD",
        "مساحة سحابية 10 GB",
      ],
    },
    {
      id: "pro",
      name: "الخطة الاحترافية (Professional)",
      slug: "pro",
      description: "الخيار الأفضل لمدارس الدعم المتوسطة ومعاهد اللغات المتنامية",
      priceDZD: 15000,
      annualPriceDZD: 144000,
      maxStudents: 300,
      maxTeachers: 25,
      maxBranches: 3,
      storageLimitGB: 20,
      features: [
        "إدارة حتى 300 تلميذ",
        "تسجيل حتى 25 أستاذ",
        "إدارة حتى 3 فروع مستقلة",
        "محرك منع تضارب القاعات الذكي",
        "كشف الحضور والغياب ورموز QR",
        "حساب رواتب ونسب الأساتذة آلياً",
        "تقارير وإحصائيات متقدمة",
        "مساحة سحابية 20 GB",
      ],
    },
    {
      id: "business",
      name: "خطة المؤسسات الكبرى (Business)",
      slug: "business",
      description: "للمجمعات التعليمية الضخمة ومراكز الامتياز متعددة الفروع",
      priceDZD: 35000,
      annualPriceDZD: 336000,
      maxStudents: 1000,
      maxTeachers: 100,
      maxBranches: 10,
      storageLimitGB: 100,
      features: [
        "إدارة حتى 1000 تلميذ",
        "تسجيل حتى 100 أستاذ",
        "إدارة حتى 10 فروع تعليمية",
        "جميع مميزات النظام السحابي بالكامل",
        "محرك الجداول والتحليلات المتطورة",
        "أولوية قصوى في الدعم الفني 24/7",
        "تصدير واستيراد قواعد البيانات بمرونة",
        "مساحة سحابية 100 GB",
      ],
    },
  ];

  const toggleFlip = (planId: string) => {
    setFlippedCards((prev) => ({
      ...prev,
      [planId]: !prev[planId],
    }));
  };

  const activePlans = plans.filter((p: any) => p.isActive !== false);

  const handlePlansScroll = () => {
    if (!plansScrollRef.current) return;
    const el = plansScrollRef.current;
    const scrollLeft = Math.abs(el.scrollLeft);
    const cardWidth = el.scrollWidth / (activePlans.length || 1);
    const activeIdx = Math.round(scrollLeft / cardWidth);
    setActivePlanMobileIdx(Math.min(Math.max(0, activeIdx), Math.max(0, activePlans.length - 1)));
  };

  const scrollToPlan = (idx: number) => {
    if (plansScrollRef.current) {
      const el = plansScrollRef.current;
      const children = el.children;
      if (children[idx]) {
        (children[idx] as HTMLElement).scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
        setActivePlanMobileIdx(idx);
      }
    }
  };


  const roles = [
    {
      title: "مدير ومالك المؤسسة",
      badge: "تحكم وإشراف شامل",
      desc: "رؤية مركزية لكل الفروع، القاعات، المدفوعات، ورواتب الأساتذة مع تقارير أداء فورية تساعدك على مضاعفة أرباحك وتوسيع نشاطك.",
      icon: Building2,
      color: "from-amber-500/10 to-orange-500/10 border-amber-200 text-amber-700",
      iconBg: "bg-amber-500 text-white",
    },
    {
      title: "الأساتذة والمؤطرون",
      badge: "تركيز كامل على التدريس",
      desc: "وصول سهل لجدول الحصص الأسبوعي، قوائم التلاميذ، تسجيل الحضور في ثوانٍ، وتتبع مستحقاتهم المالية بكل شفافية ووضوح.",
      icon: GraduationCap,
      color: "from-teal-500/10 to-emerald-500/10 border-teal-200 text-teal-700",
      iconBg: "bg-teal-600 text-white",
    },
    {
      title: "الطلاب والتلاميذ",
      badge: "انضباط ونتائج ممتازة",
      desc: "معرفة مواعيد الحصص والقاعات بدقة، بطاقة رقمية موحدة، والتأكد من التسجيل في الشعبة والمستوى الصحيح لتحقيق أعلى معدل.",
      icon: BookOpen,
      color: "from-blue-500/10 to-indigo-500/10 border-blue-200 text-blue-700",
      iconBg: "bg-blue-600 text-white",
    },
    {
      title: "أولياء الأمور",
      badge: "راحة بال ومتابعة مستمرة",
      desc: "متابعة فورية لحضور وغياب الابن، استلام وصولات الدفع بالدينار الجزائري، والاطمئنان التام على المسار التعليمي دون الحاجة للتنقل.",
      icon: ShieldCheck,
      color: "from-purple-500/10 to-pink-500/10 border-purple-200 text-purple-700",
      iconBg: "bg-purple-600 text-white",
    },
  ];

  const faqs = [
    {
      q: "ما هي منصة مدرستي برو (MadrasatiPro) وكيف تختلف عن باقي الحلول؟",
      a: "مدرستي برو (MadrasatiPro) هي المنصة السحابية الجزائرية الأولى المصممة خصيصاً لمدارس الدروس الخصوصية ومراكز الدعم المدرسي ومعاهد اللغات في الجزائر. تجمع المنصة بين البنية السحابية الحديثة المعزولة تماماً (Multi-Tenant)، والتوافق الدقيق مع نظام التعليم الجزائري (شعب البكالوريا وشهادة التعليم المتوسط)، وتوفر محركاً ذكياً لمنع تضارب القاعات، مع فوترة متوافقة 100% مع الدينار الجزائري.",
    },
    {
      q: "ما هي وسائل الدفع المعتمدة لتجديد الاشتراك؟",
      a: "نوفر لجميع المؤسسات والأساتذة في الجزائر خيارات دفع مريحة وموثوقة تشمل: تطبيق بريدي موب (Baridimob)، الحساب الجاري البريدي (CCP)، أو التحويل البنكي المباشر. كما يحصل المشترك على فاتورة رسمية معتمدة لكل عملية اشتراك.",
    },
    {
      q: "هل النظام يدعم جميع أطوار ومناهج التعليم الجزائري؟",
      a: "نعم بالتأكيد. المنصة مهيأة مسبقاً بجميع الأطوار الجزائرية: الابتدائي، المتوسط (1AM إلى 4AM تحضير BEM)، والثانوي (1AS، 2AS، و 3AS البكالوريا بجميع شعبها: علوم تجريبية، رياضيات، تقني رياضي، تسيير واقتصاد، آداب وفلسفة، ولغات أجنبية).",
    },
    {
      q: "كيف يمنع مدرستي برو تضارب القاعات والأساتذة؟",
      a: "يحتوي مدرستي برو على خوارزمية ذكية تفحص في الوقت الفعلي توفر الأستاذ، توفر القاعة، وسعة الفوج قبل تأكيد أي حصة، مما يقضي تماماً على تداخل الحصص خاصة في أوقات الذروة يومي الجمعة والسبت.",
    },
    {
      q: "كم يستغرق تجهيز وإطلاق النظام لمدرستي؟",
      a: "أقل من دقيقتين! بمجرد التسجيل واختيار خطتك، تصبح لوحة التحكم الخاصة بك جاهزة فوراً. يمكنك إضافة قاعاتك، أفواجك، وتسجيل طلابك بسهولة بالغة وبواجهة عربية مريحة وواضحة جداً.",
    },
  ];

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-[#FFF9F5] text-[#17191D] font-sans selection:bg-[#F47A3C] selection:text-white relative overflow-x-hidden"
    >
      {/* Background Floating Educational Objects (Subtle Ambient) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
        {/* Floating Pencil */}
        <div className="absolute top-24 left-[8%] opacity-25 animate-float-pencil">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#F47A3C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
            <path d="m15 5 4 4"/>
          </svg>
        </div>

        {/* Floating Ruler */}
        <div className="absolute top-[45%] right-[5%] opacity-20 animate-float-ruler">
          <Compass className="w-12 h-12 text-[#18B89C]" />
        </div>

        {/* Floating Math Symbol: Pi */}
        <div className="absolute top-[68%] left-[6%] opacity-25 animate-float-slow font-serif font-black text-3xl text-[#8B7CFF]">
          π
        </div>

        {/* Floating Math Symbol: Square Root */}
        <div className="absolute top-[32%] right-[10%] opacity-20 animate-float-reverse font-serif font-black text-3xl text-[#F6C84A]">
          √x
        </div>

        {/* Floating Calculator */}
        <div className="absolute top-[82%] right-[12%] opacity-20 animate-float-gentle">
          <Calculator className="w-10 h-10 text-[#F47A3C]" />
        </div>

        {/* Floating Educational Symbol */}
        <div className="absolute top-[18%] right-[22%] opacity-20 animate-float-sway">
          <BookOpen className="w-8 h-8 text-[#F6C84A]" />
        </div>
      </div>

      {/* Sticky Header with Official MadrasatiPro Logo */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.03)] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between">
          
          {/* Official Brand Logo */}
          <a href="/" className="flex items-center gap-2 sm:gap-3 group focus:outline-none">
            <div className="relative h-[44px] sm:h-[60px] w-44 sm:w-64">
              <Image
                src="/logo-transparent.png"
                alt="MadrasatiPro — مدرستي برو"
                fill
                priority
                className="object-contain object-right"
              />
            </div>
          </a>

          {/* Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-8 text-xs font-bold text-slate-700">
            <a href="#features" className="hover:text-[#F47A3C] transition">المميزات الرئيسية</a>
            <a href="#roles" className="hover:text-[#F47A3C] transition">تجارب المستخدمين</a>
            <a href="#pricing" className="hover:text-[#F47A3C] transition">خطط الأسعار</a>
            <a href="#faq" className="hover:text-[#F47A3C] transition">الأسئلة الشائعة</a>
          </nav>

          {/* Action CTAs + Mobile Menu Toggle Button */}
          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href="/login"
              className="hidden sm:inline-flex px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full text-xs font-bold text-slate-700 hover:text-[#17191D] hover:bg-orange-100/60 transition"
            >
              تسجيل الدخول
            </a>
            <a
              href="/register"
              className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-[#18B89C] hover:bg-[#149B83] text-white font-black text-xs shadow-md shadow-teal-500/20 hover:shadow-teal-500/30 transition flex items-center gap-1.5 group active:scale-95"
            >
              <span>ابدأ مجاناً</span>
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            </a>

            {/* Mobile Menu Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-2xl bg-orange-50 hover:bg-orange-100 text-[#F47A3C] border border-orange-200/80 transition flex items-center justify-center cursor-pointer shadow-xs active:scale-95"
              aria-label="القائمة الرئيسية"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-orange-100 bg-white/98 backdrop-blur-xl shadow-2xl animate-in slide-in-from-top duration-200">
            <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
              <nav className="flex flex-col space-y-1 text-xs sm:text-sm font-bold text-slate-700">
                <a
                  href="#features"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-3 rounded-2xl hover:bg-orange-50 hover:text-[#F47A3C] transition active:scale-98"
                >
                  <span className="flex items-center gap-2.5">
                    <Layers className="w-4 h-4 text-[#F47A3C]" />
                    <span>المميزات الرئيسية</span>
                  </span>
                  <ArrowLeft className="w-3.5 h-3.5 text-slate-400" />
                </a>
                <a
                  href="#roles"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-3 rounded-2xl hover:bg-orange-50 hover:text-[#F47A3C] transition active:scale-98"
                >
                  <span className="flex items-center gap-2.5">
                    <Users className="w-4 h-4 text-[#18B89C]" />
                    <span>تجارب المستخدمين والأدوار</span>
                  </span>
                  <ArrowLeft className="w-3.5 h-3.5 text-slate-400" />
                </a>
                <a
                  href="#pricing"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-3 rounded-2xl hover:bg-orange-50 hover:text-[#F47A3C] transition active:scale-98"
                >
                  <span className="flex items-center gap-2.5">
                    <Wallet className="w-4 h-4 text-amber-500" />
                    <span>خطط الأسعار والاشتراك</span>
                  </span>
                  <ArrowLeft className="w-3.5 h-3.5 text-slate-400" />
                </a>
                <a
                  href="#faq"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-3 rounded-2xl hover:bg-orange-50 hover:text-[#F47A3C] transition active:scale-98"
                >
                  <span className="flex items-center gap-2.5">
                    <HelpCircle className="w-4 h-4 text-indigo-500" />
                    <span>الأسئلة الشائعة</span>
                  </span>
                  <ArrowLeft className="w-3.5 h-3.5 text-slate-400" />
                </a>
              </nav>

              <div className="pt-3 border-t border-slate-100 flex flex-col gap-2.5">
                <a
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-3 rounded-2xl border border-slate-200 text-slate-800 text-center text-xs font-black hover:bg-slate-50 transition active:scale-95"
                >
                  تسجيل الدخول إلى حسابك
                </a>
                <a
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-3 rounded-2xl bg-[#F47A3C] hover:bg-[#d36128] text-white text-center text-xs font-black shadow-lg shadow-orange-500/25 transition active:scale-95 flex items-center justify-center gap-2"
                >
                  <span>سجّل مؤسستك الآن مجاناً</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Support Contacts */}
              <div className="pt-2 text-center text-[11px] text-slate-500 flex items-center justify-center gap-3">
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3 text-[#18B89C]" />
                  <span>{platformSettings.supportPhone || "0550 12 34 56"}</span>
                </span>
                <span>•</span>
                <span className="text-[#18B89C] font-bold">دعم تقني 24/7 في الجزائر</span>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section: Story 1 — What is MadrasatiPro? */}
      <section className="relative pt-6 sm:pt-10 lg:pt-14 pb-8 sm:pb-14 lg:pb-20 overflow-hidden bg-gradient-to-b from-[#FFF5EE] via-[#FFF9F5] to-white border-b border-orange-100/40 z-10">
        {/* Soft Decorative Ambient Background */}
        <div className="absolute top-6 right-1/4 w-[450px] h-[300px] bg-orange-300/15 rounded-full blur-[130px] pointer-events-none" />
        <div className="absolute top-12 left-10 w-[400px] h-[300px] bg-teal-300/15 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-12 items-center">
            
            {/* Content Column (Text & Call to Actions in RTL) */}
            <div className="lg:col-span-7 space-y-4 sm:space-y-6 text-right reveal-on-scroll">
              
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-orange-200/80 text-[11px] sm:text-xs font-bold text-[#F47A3C] shadow-xs">
                <span className="w-2 h-2 rounded-full bg-[#F47A3C] animate-pulse" />
                <span>أول منصة متقدمة لإدارة المدارس ومراكز الدعم في الجزائر</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-2xl sm:text-4xl lg:text-[50px] font-black text-[#17191D] tracking-tight leading-[1.25] sm:leading-[1.2]">
                أدر مدرستك ومراكز الدعم التعليمي{" "}
                <span className="relative inline-block text-[#F47A3C]">
                  بأعلى كفاءة
                  <svg
                    className="absolute -bottom-1.5 right-0 w-full text-orange-300/70"
                    height="8"
                    viewBox="0 0 100 8"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M0 7 C 20 0, 80 0, 100 7"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                    />
                  </svg>
                </span>{" "}
                مع مدرستي برو
              </h1>

              {/* Subheadline */}
              <p className="text-xs sm:text-sm lg:text-base text-slate-600 leading-relaxed max-w-2xl font-normal">
                وداعاً للسجلات الورقية وجداول الإكسل المعقدة. مدرستي برو (MadrasatiPro) تجمع لك إدارة الطلاب، الأفواج، جداول التوقيت الذكية، الحضور والغياب، والمحاسبة بالدينار الجزائري (DZD) في منصة سحابية واحدة فائقة السرعة والأمان.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3.5 pt-1 sm:pt-2">
                <a
                  href="/register"
                  className="px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl bg-[#18B89C] hover:bg-[#149B83] text-white font-black text-xs sm:text-sm shadow-xl shadow-teal-600/25 hover:shadow-teal-600/35 transition flex items-center justify-center gap-2 group cursor-pointer animate-cta-attention active:scale-95 focus:ring-4 focus:ring-teal-500/30 outline-none"
                >
                  <span>ابدأ تجربتك الآن</span>
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                </a>

                <button
                  type="button"
                  onClick={() => setVideoModalOpen(true)}
                  className="px-5 sm:px-6 py-3 sm:py-4 rounded-2xl bg-white hover:bg-orange-50/80 text-slate-800 border border-orange-200/80 font-bold text-xs sm:text-sm shadow-xs transition flex items-center justify-center gap-2.5 cursor-pointer group active:scale-95"
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#F47A3C] text-white flex items-center justify-center shadow-md shadow-orange-500/30 group-hover:scale-110 transition-transform">
                    <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current ml-0.5" />
                  </div>
                  <span>شاهد كيف يعمل النظام</span>
                </button>
              </div>

              {/* Quick Trust Highlights */}
              <div className="pt-3 sm:pt-5 grid grid-cols-3 gap-2 sm:gap-4 border-t border-orange-100 max-w-lg text-slate-600 text-[11px] sm:text-xs">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#18B89C] shrink-0" />
                  <span className="font-semibold">تغطية 58 ولاية</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#18B89C] shrink-0" />
                  <span className="font-semibold">منع تضارب القاعات</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#18B89C] shrink-0" />
                  <span className="font-semibold">فوترة بالدينار DZD</span>
                </div>
              </div>
            </div>

            {/* Right Visual Composition (Complete Uncropped Hero Illustration + Floating Badges) */}
            <div className="lg:col-span-5 relative flex items-center justify-center reveal-scale delay-200 mt-4 lg:mt-0">
              <div className="relative w-full max-w-[340px] sm:max-w-[400px] lg:max-w-[460px] mx-auto flex items-center justify-center">
                
                {/* Soft Ambient Radial Halo behind the illustration */}
                <div className="absolute inset-0 w-[85%] h-[85%] mx-auto my-auto rounded-full bg-gradient-to-tr from-orange-300/25 via-teal-200/20 to-amber-200/25 blur-3xl pointer-events-none" />

                {/* Complete, Uncropped Student Hero Image */}
                <div className="relative z-10 w-full flex items-center justify-center">
                  <Image
                    src="/hero-student.jpg"
                    alt="طالبة جزائرية تستخدم منصة مدرستي برو لإدارة المدارس ومراكز الدعم"
                    width={896}
                    height={1200}
                    priority
                    className="w-auto h-auto max-h-[380px] sm:max-h-[460px] lg:max-h-[520px] max-w-full object-contain mx-auto drop-shadow-md select-none"
                  />
                </div>

                {/* Floating UI Badge 1: New Students */}
                <div className="absolute top-2 right-1 sm:-top-3 sm:-right-3 bg-white/95 backdrop-blur-md border border-slate-100 rounded-2xl p-2.5 sm:p-3 shadow-lg shadow-black/5 animate-float-slow z-20 flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-black">
                    <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1 sm:gap-1.5">
                      <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 animate-ping" />
                      <p className="text-[11px] sm:text-xs font-extrabold text-[#17191D]">+28 طالب جديد</p>
                    </div>
                    <p className="text-[9px] sm:text-[10px] text-slate-500">تم تسجيلهم هذا الأسبوع</p>
                  </div>
                </div>

                {/* Floating UI Badge 2: Attendance Rate */}
                <div className="absolute bottom-2 left-1 sm:bottom-4 sm:-left-4 bg-white/95 backdrop-blur-md border border-slate-100 rounded-2xl p-2.5 sm:p-3.5 shadow-lg shadow-black/5 animate-float-reverse z-20 flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-orange-500/10 text-[#F47A3C] flex items-center justify-center font-black">
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-[11px] font-bold text-slate-500">نسبة الحضور اليوم</p>
                    <p className="text-xs sm:text-sm font-black text-[#17191D]">94.8% — انضباط عالٍ</p>
                  </div>
                </div>

                {/* Floating UI Badge 3: Invoicing / Finance (Shown on sm+) */}
                <div className="hidden sm:flex absolute top-28 -left-6 bg-white/95 backdrop-blur-md border border-slate-100 rounded-2xl p-2.5 shadow-lg shadow-black/5 animate-float-gentle z-20 items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-600 flex items-center justify-center">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-500">المدفوعات المحصلة</p>
                    <p className="text-xs font-black text-emerald-600">+ 84,000 دج</p>
                  </div>
                </div>

                {/* Floating Educational 3D Object 1: Graduation Cap */}
                <div className="absolute bottom-2 right-4 sm:-bottom-3 sm:right-8 bg-gradient-to-tr from-[#17191D] to-[#2F3442] text-white p-2 sm:p-2.5 rounded-2xl shadow-xl animate-float-sway z-20">
                  <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
                </div>

                {/* Floating Educational 3D Object 2: Academic Excellence Award Badge (Replaced Sparkle) */}
                <div className="absolute top-1/3 -right-2 sm:-right-4 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-tr from-[#F47A3C] to-amber-500 text-white flex items-center justify-center shadow-lg animate-float-gentle z-20">
                  <Award className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Trust Bar & Numbers: Story 2 — Refined Educational Metrics Showcase */}
      <section className="py-8 sm:py-12 bg-white border-y border-slate-150 z-10 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6 text-right">
            
            {/* Stat Card 1: Students */}
            <div className="group p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border border-slate-150 shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between active:scale-98 relative overflow-hidden">
              {/* Top hairline accent bar */}
              <div className="absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-teal-500 to-emerald-400" />
              
              <div className="flex items-center justify-between mb-3 text-slate-500">
                <span className="text-xs font-bold text-slate-500 tracking-wide">قاعدة البيانات</span>
                <Users className="w-5 h-5 text-teal-600 transition-transform group-hover:scale-110" />
              </div>
              
              <div className="space-y-0.5">
                <p className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
                  +15,000
                </p>
                <p className="text-sm font-bold text-slate-800 pt-1">تلميذ مسجل بالنظام</p>
                <p className="text-xs text-slate-500 font-normal leading-relaxed">
                  يديرون اشتراكاتهم وحصصهم يومياً
                </p>
              </div>
            </div>

            {/* Stat Card 2: Coverage */}
            <div className="group p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border border-slate-150 shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between active:scale-98 relative overflow-hidden">
              {/* Top hairline accent bar */}
              <div className="absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-[#F47A3C] to-amber-400" />

              <div className="flex items-center justify-between mb-3 text-slate-500">
                <span className="text-xs font-bold text-slate-500 tracking-wide">الانتشار الجغرافي</span>
                <Building2 className="w-5 h-5 text-[#F47A3C] transition-transform group-hover:scale-110" />
              </div>

              <div className="space-y-0.5">
                <p className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
                  58 ولاية
                </p>
                <p className="text-sm font-bold text-slate-800 pt-1">تغطية وطنية شاملة</p>
                <p className="text-xs text-slate-500 font-normal leading-relaxed">
                  جاهز للعمل في كل المراكز والولايات
                </p>
              </div>
            </div>

            {/* Stat Card 3: Zero Collision */}
            <div className="group p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border border-slate-150 shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between active:scale-98 relative overflow-hidden">
              {/* Top hairline accent bar */}
              <div className="absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-purple-500 to-indigo-500" />

              <div className="flex items-center justify-between mb-3 text-slate-500">
                <span className="text-xs font-bold text-slate-500 tracking-wide">محرك الجدولة</span>
                <CalendarCheck className="w-5 h-5 text-[#8B7CFF] transition-transform group-hover:scale-110" />
              </div>

              <div className="space-y-0.5">
                <p className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
                  0 تضارب
                </p>
                <p className="text-sm font-bold text-slate-800 pt-1">في القاعات والأساتذة</p>
                <p className="text-xs text-slate-500 font-normal leading-relaxed">
                  بفضل محرك الجدولة الذكي الآلي
                </p>
              </div>
            </div>

            {/* Stat Card 4: Uptime & Cloud */}
            <div className="group p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border border-slate-150 shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between active:scale-98 relative overflow-hidden">
              {/* Top hairline accent bar */}
              <div className="absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-amber-500 to-yellow-400" />

              <div className="flex items-center justify-between mb-3 text-slate-500">
                <span className="text-xs font-bold text-slate-500 tracking-wide">الجاهزية السحابية</span>
                <ShieldCheck className="w-5 h-5 text-amber-600 transition-transform group-hover:scale-110" />
              </div>

              <div className="space-y-0.5">
                <p className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
                  99.9%
                </p>
                <p className="text-sm font-bold text-slate-800 pt-1">جاهزية واستقرار سحابي</p>
                <p className="text-xs text-slate-500 font-normal leading-relaxed">
                  سهولة وسرعة الوصول دون انقطاع
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Product Storytelling & Visual Feature Showcase */}
      <ProductShowcaseSection />

      {/* Role-Based Tailored Experiences: Story 5, 6, 7, 8 — What does each role get? */}
      <section id="roles" className="py-20 bg-white border-b border-slate-100 z-10 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-3 reveal-on-scroll">
            <span className="text-xs font-black px-4 py-1.5 rounded-full bg-teal-50 text-[#18B89C] border border-teal-200/80 inline-block">
              تجربة مستخدم مخصصة
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#17191D]">
              منصة واحدة تجمع كل أطراف العملية التعليمية
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              واجهات متوافقة وسهلة الاستخدام لكل دور داخل وخارج المؤسسة
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {roles.map((role, idx) => {
              const Icon = role.icon;
              const delayClass =
                idx === 0
                  ? "delay-100"
                  : idx === 1
                  ? "delay-200"
                  : idx === 2
                  ? "delay-300"
                  : "delay-400";

              return (
                <div
                  key={idx}
                  className={`rounded-3xl p-6 border bg-gradient-to-b ${role.color} flex flex-col justify-between hover:shadow-lg transition-all duration-300 hover:-translate-y-1 reveal-on-scroll ${delayClass}`}
                >
                  <div className="space-y-4">
                    <div className={`w-12 h-12 rounded-2xl ${role.iconBg} flex items-center justify-center shadow-md`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider block mb-1">
                        {role.badge}
                      </span>
                      <h3 className="text-lg font-black text-[#17191D]">{role.title}</h3>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed font-normal">
                      {role.desc}
                    </p>
                  </div>

                  <div className="pt-6 border-t border-black/5 mt-4">
                    <a
                      href="/register"
                      className="text-xs font-bold text-slate-900 hover:text-[#F47A3C] flex items-center gap-1.5 transition"
                    >
                      <span>استكشف صلاحيات {role.title.split(" ")[0]}</span>
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* Dynamic 3D Flip Card Pricing Section: Story 9 — What are the plans? */}
      <section id="pricing" className="py-24 bg-[#FFF9F5] border-b border-orange-100/60 z-10 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
          
          {/* Header & Annual Toggle */}
          <div className="text-center max-w-2xl mx-auto space-y-4 reveal-on-scroll">
            <span className="text-xs font-black px-4 py-1.5 rounded-full bg-orange-100 text-[#F47A3C] border border-orange-200/80 inline-block">
              أسعار شفافة بالدينار الجزائري DZD
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#17191D]">
              خطط اشتراك مرنة تناسب حجم نشاطك
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              ادفع شهرياً أو سنوياً عبر بريدي موب (Baridimob) أو الحساب البريدي (CCP) دون أي التزامات خفية
            </p>

            {/* Monthly / Annual Switcher */}
            <div className="pt-4 flex items-center justify-center gap-3">
              <span className={`text-xs font-bold ${billingPeriod === "monthly" ? "text-[#17191D]" : "text-slate-500"}`}>
                دفع شهري
              </span>
              
              <button
                type="button"
                onClick={() => setBillingPeriod(billingPeriod === "monthly" ? "annual" : "monthly")}
                className="w-14 h-7 rounded-full bg-[#17191D] p-1 flex items-center transition cursor-pointer"
              >
                <div
                  className={`w-5 h-5 rounded-full bg-[#F47A3C] shadow-md transform transition-transform duration-300 ${
                    billingPeriod === "annual" ? "-translate-x-7" : "translate-x-0"
                  }`}
                />
              </button>

              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold ${billingPeriod === "annual" ? "text-[#17191D]" : "text-slate-500"}`}>
                  دفع سنوي
                </span>
                <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  وفر شهرين مجاناً 🎁
                </span>
              </div>
            </div>
            
            <p className="text-[11px] text-slate-500 font-medium">
              💡 مرر الماوس على البطاقة أو اضغط على الزر لعرض كامل المميزات في عرض 3D التفاعلي
            </p>
          </div>

          {/* Mobile Swipe Hint & Controls */}
          <div className="flex md:hidden items-center justify-between px-3 py-2.5 text-xs font-bold text-slate-700 bg-orange-100/60 rounded-2xl border border-orange-200/70 shadow-xs">
            <div className="flex items-center gap-1.5 text-[#F47A3C]">
              <span>👈 اسحب أفقياً لاستعراض الخطط ({activePlans.length})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => scrollToPlan(Math.max(0, activePlanMobileIdx - 1))}
                disabled={activePlanMobileIdx === 0}
                className="p-1.5 rounded-xl bg-white border border-orange-200 text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed shadow-xs active:scale-95 transition"
                aria-label="الخطة السابقة"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => scrollToPlan(Math.min(activePlans.length - 1, activePlanMobileIdx + 1))}
                disabled={activePlanMobileIdx === activePlans.length - 1}
                className="p-1.5 rounded-xl bg-white border border-orange-200 text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed shadow-xs active:scale-95 transition"
                aria-label="الخطة التالية"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Pricing Container: Horizontal swipe carousel on mobile, clean responsive grid on desktop */}
          <div
            ref={plansScrollRef}
            onScroll={handlePlansScroll}
            className={`flex md:grid overflow-x-auto md:overflow-visible pb-6 md:pb-0 pt-2 px-4 md:px-0 gap-5 md:gap-6 snap-x snap-mandatory scroll-smooth no-scrollbar -mx-4 sm:mx-0 ${
              activePlans.length <= 3 ? "md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto" : "md:grid-cols-2 lg:grid-cols-4"
            }`}
          >
            {activePlans.map((p, idx) => {
              const isFree = (p.priceDZD ?? 0) === 0 || p.slug === "free";
              const isPopular = p.slug === "pro" || (!isFree && idx === 2);
              const isFlipped = !!flippedCards[p.id];

              // Price calculations: single source of truth, 0 DZD is valid and must never fallback to 5000 DZD
              const monthlyPrice = p.priceDZD ?? 0;
              const annualPrice = isFree ? 0 : (p.annualPriceDZD ?? Math.round(monthlyPrice * 10));
              const displayPrice = billingPeriod === "annual" ? annualPrice : monthlyPrice;
              const delayClass = `delay-${((idx % 4) + 1) * 100}`;

              return (
                <div
                  key={p.id}
                  className={`flip-card-perspective h-[580px] w-[84vw] max-w-[340px] shrink-0 snap-center md:w-full md:max-w-none md:shrink flip-card-container group reveal-on-scroll ${delayClass}`}
                >
                  <div
                    className={`flip-card-inner h-full ${isFlipped ? "is-flipped manual-flip" : ""}`}
                  >
                    
                    {/* FRONT SIDE OF 3D CARD */}
                    <div
                      className={`flip-card-front h-full p-6 sm:p-8 flex flex-col justify-between bg-white border rounded-3xl shadow-lg transition-all ${
                        isPopular
                          ? "border-[#F47A3C] ring-2 ring-orange-500/20 shadow-orange-500/10"
                          : "border-slate-200"
                      }`}
                    >
                      {/* Popular Badge */}
                      {isPopular && (
                        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#F47A3C] text-white text-[10px] font-black uppercase tracking-wider py-1 px-4 rounded-full shadow-md">
                          الخيار الأكثر طلباً واشتراكاً
                        </div>
                      )}

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xl font-black text-[#17191D]">{p.name}</h3>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-orange-50 text-[#F47A3C]">
                            {isFree ? "مجاني" : p.slug === "starter" ? "أساسي" : p.slug === "pro" ? "موصى به" : "شامل"}
                          </span>
                        </div>

                        <p className="text-xs text-slate-500 leading-relaxed min-h-[36px]">
                          {p.description || "خطة شاملة لإدارة وتطوير مدرستك ومضاعفة كفاءة العمل الإداري."}
                        </p>

                        {/* Price */}
                        <div className="p-4 rounded-2xl bg-[#FFF9F5] border border-orange-100">
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-3xl sm:text-4xl font-black text-[#17191D]">
                              {displayPrice === 0 ? "مجاناً (0 دج)" : formatDZD(displayPrice, "ar")}
                            </span>
                            {displayPrice > 0 && (
                              <span className="text-xs text-slate-500">
                                / {billingPeriod === "annual" ? "سنوياً" : "شهرياً"}
                              </span>
                            )}
                          </div>
                          {displayPrice === 0 ? (
                            <p className="text-[10px] text-emerald-600 font-bold mt-1">
                              فترة تجريبية مجانية 100% بدون أي التزام مالي أو دفع مسبق
                            </p>
                          ) : billingPeriod === "annual" ? (
                            <p className="text-[10px] text-emerald-600 font-bold mt-1">
                              ما يعادل {formatDZD(Math.round(annualPrice / 12), "ar")} فقط كل شهر
                            </p>
                          ) : null}
                        </div>

                        {/* Main Quotas */}
                        <div className="space-y-2.5 pt-2 text-xs text-slate-700">
                          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
                            <span className="text-slate-500">الحد الأقصى للطلاب:</span>
                            <strong className="text-slate-900 font-black">{p.maxStudents} طالب</strong>
                          </div>
                          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
                            <span className="text-slate-500">عدد الأساتذة:</span>
                            <strong className="text-slate-900 font-black">{p.maxTeachers} أستاذ</strong>
                          </div>
                          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
                            <span className="text-slate-500">عدد الفروع والمقرات:</span>
                            <strong className="text-slate-900 font-black">{p.maxBranches} مقر</strong>
                          </div>
                          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
                            <span className="text-slate-500">المساحة السحابية:</span>
                            <strong className="text-slate-900 font-black">{p.storageLimitGB || 10} GB</strong>
                          </div>
                        </div>
                      </div>

                      {/* Front Bottom Actions */}
                      <div className="space-y-2 pt-4">
                        <button
                          type="button"
                          onClick={() => toggleFlip(p.id)}
                          className="w-full py-2.5 rounded-xl border border-orange-200 text-[#F47A3C] hover:bg-orange-50 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-98"
                        >
                          <RotateCw className="w-3.5 h-3.5" />
                          <span>اقلب البطاقة للتفاصيل والمميزات (3D)</span>
                        </button>

                        <a
                          href={`/register?plan=${p.id}&billing=${billingPeriod}`}
                          className={`w-full py-3.5 rounded-2xl text-xs font-black flex items-center justify-center gap-2 transition cursor-pointer active:scale-98 ${
                            isPopular
                              ? "bg-[#F47A3C] hover:bg-[#d36128] text-white shadow-lg shadow-orange-500/25"
                              : displayPrice === 0
                              ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20"
                              : "bg-[#17191D] hover:bg-slate-800 text-white"
                          }`}
                        >
                          <span>{displayPrice === 0 ? "ابدأ التجربة المجانية الآن" : `اشترك في خطة ${p.name.split(" ")[0]}`}</span>
                          <ArrowLeft className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>

                    {/* BACK SIDE OF 3D CARD */}
                    <div
                      className="flip-card-back h-full p-6 sm:p-8 flex flex-col justify-between bg-slate-900 text-white border border-slate-800 rounded-3xl shadow-2xl"
                    >
                      <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                          <h4 className="text-lg font-black text-white">مميزات {p.name}</h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400">
                            تفاصيل الخطة
                          </span>
                        </div>

                        <p className="text-xs text-slate-400">
                          تشمل هذه الخطة البنية السحابية المعزولة وكافة المزايا التالية:
                        </p>

                        {/* Features Checklist */}
                        <ul className="space-y-3 text-xs text-slate-300 max-h-[280px] overflow-y-auto pr-1">
                          {(Array.isArray(p.features) ? p.features : [
                            "عزل سحابي تام للبيانات Multi-Tenant",
                            "محرك الجدولة الذكي ومنع التضارب",
                            "كشف الحضور والغياب وبطاقات QR",
                            "فوترة رسمية ووصولات بالدينار الجزائري",
                            "نسخ احتياطي يومي تلقائي مشفر",
                            "دعم فني وتدريب مخصص عبر الهاتف والواتساب",
                          ]).map((feat: string, fIdx: number) => (
                            <li key={fIdx} className="flex items-start gap-2.5">
                              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Back Bottom Actions */}
                      <div className="space-y-2 pt-4 border-t border-slate-800">
                        <button
                          type="button"
                          onClick={() => toggleFlip(p.id)}
                          className="w-full py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-98"
                        >
                          <RotateCw className="w-3.5 h-3.5" />
                          <span>⟲ العودة إلى واجهة السعر</span>
                        </button>

                        <a
                          href={`/register?plan=${p.id}&billing=${billingPeriod}`}
                          className="w-full py-3.5 rounded-2xl bg-[#18B89C] hover:bg-[#149B83] text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-teal-500/25 transition cursor-pointer active:scale-98"
                        >
                          <span>تأكيد الاشتراك في الخطة</span>
                          <ArrowLeft className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>

          {/* Mobile Carousel Pagination Dots */}
          <div className="flex md:hidden items-center justify-center gap-2 pt-1">
            {activePlans.map((planItem, dIdx) => (
              <button
                key={planItem.id}
                type="button"
                onClick={() => scrollToPlan(dIdx)}
                className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                  activePlanMobileIdx === dIdx
                    ? "w-8 bg-[#F47A3C] shadow-sm shadow-orange-500/50"
                    : "w-2.5 bg-slate-300 hover:bg-slate-400"
                }`}
                aria-label={`الانتقال إلى خطة ${planItem.name}`}
              />
            ))}
          </div>

        </div>
      </section>

      {/* FAQ Accordion Section: Story 10 — Questions & Answers */}
      <section id="faq" className="py-20 bg-white border-b border-slate-100 z-10 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-10">
          
          <div className="text-center space-y-3 reveal-on-scroll">
            <span className="text-xs font-black px-4 py-1.5 rounded-full bg-orange-100 text-[#F47A3C] border border-orange-200/80 inline-block">
              إجابات واضحة
            </span>
            <h2 className="text-3xl font-black text-[#17191D]">الأسئلة الشائعة</h2>
            <p className="text-xs sm:text-sm text-slate-600">
              كل ما تحتاج لمعرفته حول الاشتراك وإدارة مركزك عبر مدرستي برو
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = faqOpen === idx;
              const delayClass = idx === 0 ? "delay-100" : idx === 1 ? "delay-200" : "delay-300";

              return (
                <div
                  key={idx}
                  className={`bg-[#FFF9F5] border border-orange-100/80 rounded-2xl overflow-hidden shadow-sm transition reveal-on-scroll ${delayClass}`}
                >
                  <button
                    type="button"
                    onClick={() => setFaqOpen(isOpen ? null : idx)}
                    className="w-full p-5 text-right flex items-center justify-between gap-4 font-bold text-sm text-[#17191D] hover:text-[#F47A3C] transition cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform ${
                        isOpen ? "rotate-180 text-[#F47A3C]" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* High-Impact Final Call to Action: Story 10 — Start Now */}
      <section className="py-20 bg-gradient-to-b from-[#FFF9F5] to-[#FFF0E5] text-center z-10 relative">
        <div className="max-w-3xl mx-auto px-4 space-y-6 reveal-scale">
          
          <div className="relative h-14 w-44 mx-auto">
            <Image
              src="/logo-transparent.png"
              alt="MadrasatiPro Logo"
              fill
              className="object-contain"
            />
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-[#17191D] tracking-tight">
            جاهز لتطوير إدارة مدرستك ومضاعفة كفاءتها مع مدرستي برو؟
          </h2>

          <p className="text-xs sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
            انضم الآن إلى المدارس ومراكز الدعم الرائدة في الجزائر التي تعتمد يومياً على مدرستي برو لتنظيم آلاف الحصص وتوفير مئات الساعات من العمل الإداري.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <a
              href="/register"
              className="w-full sm:w-auto px-9 py-4 rounded-2xl bg-[#18B89C] hover:bg-[#149B83] text-white font-black text-sm shadow-xl shadow-teal-600/25 hover:shadow-teal-600/35 transition flex items-center justify-center gap-2 group cursor-pointer animate-cta-attention"
            >
              <span>سجّل مؤسستك الآن مجاناً</span>
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            </a>

            <a
              href={`tel:${(platformSettings.salesPhone || platformSettings.mainPhone || "0550123456").replace(/\s+/g, "")}`}
              className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-white hover:bg-orange-50 text-slate-800 border border-orange-200 font-bold text-sm shadow-sm transition flex items-center justify-center gap-2"
            >
              <Phone className="w-4 h-4 text-[#F47A3C]" />
              <span>تحدث مع مستشار تعليمي: {platformSettings.salesPhone || platformSettings.mainPhone || "0550 12 34 56"}</span>
            </a>
            {platformSettings.whatsapp && (
              <a
                href={`https://wa.me/${platformSettings.whatsapp.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-sm shadow-sm transition flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>واتساب: {platformSettings.whatsapp}</span>
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Dark Footer with MadrasatiPro Branding */}
      <footer className="border-t border-slate-800 bg-[#17191D] py-14 text-xs text-slate-400 z-10 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            {/* Col 1: Brand Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="relative h-12 w-48 sm:w-52">
                  <Image
                    src="/logo-white.png"
                    alt="MadrasatiPro Logo"
                    fill
                    className="object-contain object-right"
                  />
                </div>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                المنصة السحابية الجزائرية المتكاملة لإدارة مدارس الدروس الخصوصية ومراكز الدعم التعليمي ومعاهد اللغات في 58 ولاية.
              </p>
            </div>

            {/* Col 2: Navigation */}
            <div className="space-y-3">
              <p className="text-white font-bold text-sm">روابط سريعة</p>
              <ul className="space-y-2 text-xs">
                <li><a href="#features" className="hover:text-white transition">المميزات الرئيسية</a></li>
                <li><a href="#roles" className="hover:text-white transition">تجارب المستخدمين</a></li>
                <li><a href="#pricing" className="hover:text-white transition">خطط الأسعار</a></li>
                <li><a href="#faq" className="hover:text-white transition">الأسئلة الشائعة</a></li>
              </ul>
            </div>

            {/* Col 3: Portal Links */}
            <div className="space-y-3">
              <p className="text-white font-bold text-sm">الدخول والتسجيل</p>
              <ul className="space-y-2 text-xs">
                <li><a href="/login" className="hover:text-white transition">تسجيل الدخول إلى النظام</a></li>
                <li><a href="/register" className="hover:text-white transition">سجّل مدرستك أو مركزك</a></li>
                <li><a href="#faq" className="hover:text-white transition">الأسئلة المتكررة</a></li>
              </ul>
            </div>

            {/* Col 4: Contact */}
            <div className="space-y-3">
              <p className="text-white font-bold text-sm">الدعم والاتصال</p>
              <ul className="space-y-2 text-xs">
                <li className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-[#F47A3C] shrink-0" />
                  <a
                    href={`tel:${(platformSettings.mainPhone || "0550123456").replace(/\s+/g, "")}`}
                    className="hover:text-white transition"
                  >
                    {platformSettings.mainPhone || "0550 12 34 56"}
                    {platformSettings.supportPhone && ` / ${platformSettings.supportPhone}`}
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-[#F47A3C] shrink-0" />
                  <a
                    href={`mailto:${platformSettings.mainEmail || "contact@madrasatipro.dz"}`}
                    className="hover:text-white transition"
                  >
                    {platformSettings.mainEmail || "contact@madrasatipro.dz"}
                  </a>
                </li>
                {platformSettings.whatsapp && (
                  <li className="flex items-center gap-2">
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <a
                      href={`https://wa.me/${platformSettings.whatsapp.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-emerald-300 transition"
                    >
                      واتساب: {platformSettings.whatsapp}
                    </a>
                  </li>
                )}
                <li>{platformSettings.address || "الجزائر العاصمة • سطيف • وهران • قسنطينة"}</li>
              </ul>

              {/* Social Links if present */}
              {(platformSettings.facebookUrl || platformSettings.instagramUrl || platformSettings.linkedinUrl || platformSettings.youtubeUrl || platformSettings.tiktokUrl) && (
                <div className="pt-2 flex items-center gap-2 text-slate-400">
                  {platformSettings.facebookUrl && (
                    <a href={platformSettings.facebookUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg bg-slate-800 hover:text-white transition">
                      <span className="sr-only">Facebook</span>
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                    </a>
                  )}
                  {platformSettings.instagramUrl && (
                    <a href={platformSettings.instagramUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg bg-slate-800 hover:text-white transition">
                      <span className="sr-only">Instagram</span>
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                    </a>
                  )}
                  {platformSettings.linkedinUrl && (
                    <a href={platformSettings.linkedinUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg bg-slate-800 hover:text-white transition">
                      <span className="sr-only">LinkedIn</span>
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                    </a>
                  )}
                  {platformSettings.youtubeUrl && (
                    <a href={platformSettings.youtubeUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg bg-slate-800 hover:text-white transition">
                      <span className="sr-only">YouTube</span>
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                    </a>
                  )}
                  {platformSettings.tiktokUrl && (
                    <a href={platformSettings.tiktokUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg bg-slate-800 hover:text-white transition">
                      <span className="sr-only">TikTok</span>
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 2.89 3.5 2.77 1.81-.02 3.24-1.54 3.25-3.35.03-4.52.01-9.04.01-13.56z"/></svg>
                    </a>
                  )}
                </div>
              )}
            </div>

          </div>

          <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
            <p>© 2026 جميع الحقوق محفوظة لمنصة مدرستي برو للتقنيات التعليمية (MadrasatiPro EdTech DZ).</p>
            <div className="flex items-center gap-4">
              <span>مصمم بمعايير SaaS العالمية للتعليم الجزائري</span>
            </div>
          </div>

        </div>
      </footer>

      {/* Video Modal Preview */}
      {videoModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-2xl w-full text-right space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Play className="w-4 h-4 text-[#F47A3C] fill-current" />
                <span>جولة تعريفية في نظام مدرستي برو لإدارة المدارس</span>
              </h3>
              <button
                type="button"
                onClick={() => setVideoModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="aspect-video bg-slate-950 rounded-2xl flex flex-col items-center justify-center text-center p-6 border border-slate-800">
              <div className="w-16 h-16 rounded-full bg-[#F47A3C] text-white flex items-center justify-center shadow-lg shadow-orange-500/30 mb-4 animate-bounce">
                <Play className="w-8 h-8 fill-current ml-1" />
              </div>
              <p className="text-sm font-bold text-white mb-1">
                عرض تجريبي تفاعلي لنظام مدرستي برو 2026
              </p>
              <p className="text-xs text-slate-400 max-w-md">
                يمكنك الدخول مباشرة إلى لوحة التحكم واستكشاف كافة أدوات الجدولة، إضافة الطلاب، وطباعة الفواتير بنفسك.
              </p>
              <a
                href="/register"
                className="mt-4 px-6 py-2.5 rounded-xl bg-[#18B89C] text-white font-bold text-xs hover:bg-[#149B83] transition"
              >
                ابدأ التجربة المجانية الفورية
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
