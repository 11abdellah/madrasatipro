"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  ShieldCheck,
  Building2,
  Users,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Plus,
  RefreshCw,
  Wallet,
  Sparkles,
  ExternalLink,
  Search,
  Filter,
  ArrowRight,
  LogOut,
  Layers,
  ChevronDown,
  Lock,
  Edit3,
  Sliders,
  X,
  Clock,
  CreditCard,
  Phone,
  Mail,
  Trash2,
  Save,
  MessageSquare,
  Check,
  Globe,
} from "lucide-react";
import { formatDZD } from "@/lib/utils";
import { ALGERIAN_WILAYAS } from "@/lib/constants/algeria";

export default function SuperAdminPage() {
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  // Data state
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"pending" | "institutions" | "plans" | "create" | "payments" | "contact">("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [alertMsg, setAlertMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Payment Methods State
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [editingPaymentMethod, setEditingPaymentMethod] = useState<any | null>(null);
  const [paymentForm, setPaymentForm] = useState({
    name: "",
    displayName: "",
    code: "",
    description: "",
    instructions: "",
    accountName: "",
    accountNumber: "",
    isActive: true,
    sortOrder: 0,
  });

  // Platform Contact & Social Settings State
  const [platformForm, setPlatformForm] = useState({
    mainPhone: "",
    supportPhone: "",
    salesPhone: "",
    mainEmail: "",
    supportEmail: "",
    salesEmail: "",
    whatsapp: "",
    facebookUrl: "",
    instagramUrl: "",
    linkedinUrl: "",
    youtubeUrl: "",
    tiktokUrl: "",
    address: "",
  });
  const [loadingSettings, setLoadingSettings] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

  // Edit Plan State
  const [editingPlan, setEditingPlan] = useState<any | null>(null);
  const [planForm, setPlanForm] = useState({
    name: "",
    description: "",
    priceDZD: 0,
    annualPriceDZD: 0,
    maxStudents: 50,
    maxTeachers: 10,
    maxBranches: 1,
    maxGroups: 10,
    storageLimitGB: 10,
    featuresText: "",
    isActive: true,
  });

  // Create Institution Form State
  const [newInst, setNewInst] = useState({
    name: "",
    code: "",
    wilayaCode: 16,
    planId: "",
    adminName: "",
    adminEmail: "",
    adminPhone: "0550 00 00 00",
    password: "Madrasati2026!",
  });

  const fetchPaymentMethods = async () => {
    setLoadingPayments(true);
    try {
      const res = await fetch("/api/super-admin/payment-methods");
      const resData = await res.json();
      if (resData.paymentMethods) {
        setPaymentMethods(resData.paymentMethods);
      }
    } catch (err) {
      console.error("Error fetching payment methods:", err);
    } finally {
      setLoadingPayments(false);
    }
  };

  const fetchPlatformSettings = async () => {
    setLoadingSettings(true);
    try {
      const res = await fetch("/api/super-admin/settings");
      const resData = await res.json();
      if (resData.settings) {
        setPlatformForm({
          mainPhone: resData.settings.mainPhone || "",
          supportPhone: resData.settings.supportPhone || "",
          salesPhone: resData.settings.salesPhone || "",
          mainEmail: resData.settings.mainEmail || "",
          supportEmail: resData.settings.supportEmail || "",
          salesEmail: resData.settings.salesEmail || "",
          whatsapp: resData.settings.whatsapp || "",
          facebookUrl: resData.settings.facebookUrl || "",
          instagramUrl: resData.settings.instagramUrl || "",
          linkedinUrl: resData.settings.linkedinUrl || "",
          youtubeUrl: resData.settings.youtubeUrl || "",
          tiktokUrl: resData.settings.tiktokUrl || "",
          address: resData.settings.address || "",
        });
      }
    } catch (err) {
      console.error("Error fetching platform settings:", err);
    } finally {
      setLoadingSettings(false);
    }
  };

  const checkAuthAndFetch = async () => {
    setLoading(true);
    try {
      const meRes = await fetch("/api/auth/me");
      const meData = await meRes.json();

      if (!meData.authenticated || (!meData.isSuperAdmin && meData.session?.role !== "SUPER_ADMIN")) {
        setIsAuthorized(false);
        setLoading(false);
        return;
      }

      setIsAuthorized(true);
      setSessionUser(meData.user);

      const instRes = await fetch("/api/super-admin/institutions");
      const instData = await instRes.json();
      setData(instData);

      if (instData.plans?.[0] && !newInst.planId) {
        setNewInst((prev) => ({ ...prev, planId: instData.plans[0].id }));
      }

      await fetchPaymentMethods();
      await fetchPlatformSettings();
    } catch (e) {
      console.error(e);
      setIsAuthorized(false);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddPayment = () => {
    setEditingPaymentMethod(null);
    setPaymentForm({
      name: "",
      displayName: "",
      code: "",
      description: "",
      instructions: "",
      accountName: "",
      accountNumber: "",
      isActive: true,
      sortOrder: paymentMethods.length + 1,
    });
    setIsPaymentModalOpen(true);
  };

  const handleOpenEditPayment = (method: any) => {
    setEditingPaymentMethod(method);
    setPaymentForm({
      name: method.name || "",
      displayName: method.displayName || "",
      code: method.code || "",
      description: method.description || "",
      instructions: method.instructions || "",
      accountName: method.accountName || "",
      accountNumber: method.accountNumber || "",
      isActive: method.isActive !== false,
      sortOrder: method.sortOrder || 0,
    });
    setIsPaymentModalOpen(true);
  };

  const handleTogglePaymentActive = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/super-admin/payment-methods/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || "فشل تغيير الحالة");
      setAlertMsg({ text: `تم ${!currentStatus ? "تفعيل" : "تعطيل"} وسيلة الدفع بنجاح`, type: "success" });
      await fetchPaymentMethods();
    } catch (err: any) {
      setAlertMsg({ text: err.message || "حدث خطأ", type: "error" });
    }
  };

  const handleSavePaymentMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading("savePayment");
    try {
      const url = editingPaymentMethod
        ? `/api/super-admin/payment-methods/${editingPaymentMethod.id}`
        : "/api/super-admin/payment-methods";
      const method = editingPaymentMethod ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paymentForm),
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || "فشل حفظ وسيلة الدفع");

      setAlertMsg({ text: resData.message || "تم حفظ وسيلة الدفع بنجاح", type: "success" });
      setIsPaymentModalOpen(false);
      await fetchPaymentMethods();
    } catch (err: any) {
      setAlertMsg({ text: err.message || "حدث خطأ أثناء حفظ وسيلة الدفع", type: "error" });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeletePaymentMethod = async (id: string, name: string) => {
    if (!window.confirm(`هل أنت متأكد من حذف وسيلة الدفع "${name}"؟`)) return;
    try {
      const res = await fetch(`/api/super-admin/payment-methods/${id}`, {
        method: "DELETE",
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || "فشل الحذف");
      setAlertMsg({ text: resData.message || "تم حذف وسيلة الدفع بنجاح", type: "success" });
      await fetchPaymentMethods();
    } catch (err: any) {
      setAlertMsg({ text: err.message || "حدث خطأ أثناء حذف وسيلة الدفع", type: "error" });
    }
  };

  const handleSavePlatformSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const res = await fetch("/api/super-admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(platformForm),
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || "فشل حفظ الإعدادات");
      setAlertMsg({ text: "تم حفظ وتحديث إعدادات التواصل الرسمية للمنصة بنجاح", type: "success" });
    } catch (err: any) {
      setAlertMsg({ text: err.message || "حدث خطأ أثناء حفظ الإعدادات", type: "error" });
    } finally {
      setSavingSettings(false);
    }
  };

  useEffect(() => {
    checkAuthAndFetch();
  }, []);

  const handleUpdateStatus = async (institutionId: string, status: string) => {
    setActionLoading(institutionId);
    setAlertMsg(null);
    try {
      const res = await fetch("/api/super-admin/institutions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ institutionId, status }),
      });
      const resJson = await res.json();
      if (!res.ok) throw new Error(resJson.error || "فشل تحديث الحالة");

      setAlertMsg({ text: "تم تحديث حالة المؤسسة بنجاح", type: "success" });
      await checkAuthAndFetch();
    } catch (err: any) {
      setAlertMsg({ text: err.message || "حدث خطأ أثناء تعديل المؤسسة", type: "error" });
    } finally {
      setActionLoading(null);
    }
  };

  const handleChangePlan = async (institutionId: string, planId: string) => {
    setActionLoading(institutionId);
    setAlertMsg(null);
    try {
      const res = await fetch("/api/super-admin/institutions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ institutionId, planId }),
      });
      const resJson = await res.json();
      if (!res.ok) throw new Error(resJson.error || "فشل تعديل الخطة");

      setAlertMsg({ text: "تم تغيير خطة الاشتراك بنجاح", type: "success" });
      await checkAuthAndFetch();
    } catch (err: any) {
      setAlertMsg({ text: err.message || "حدث خطأ أثناء تعديل الخطة", type: "error" });
    } finally {
      setActionLoading(null);
    }
  };

  const handleSupportImpersonate = async (institutionId: string) => {
    setActionLoading(institutionId);
    try {
      const res = await fetch("/api/auth/switch-tenant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ institutionId }),
      });
      if (res.ok) {
        window.location.href = "/dashboard";
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleOpenEditPlan = (plan: any) => {
    setEditingPlan(plan);
    const feats = typeof plan.features === "string" ? JSON.parse(plan.features) : (plan.features || []);
    setPlanForm({
      name: plan.name,
      description: plan.description || "",
      priceDZD: plan.priceDZD,
      annualPriceDZD: plan.annualPriceDZD || plan.priceDZD * 10,
      maxStudents: plan.maxStudents,
      maxTeachers: plan.maxTeachers,
      maxBranches: plan.maxBranches,
      maxGroups: plan.maxGroups || 10,
      storageLimitGB: plan.storageLimitGB || 10,
      featuresText: Array.isArray(feats) ? feats.join("\n") : "",
      isActive: plan.isActive ?? true,
    });
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;
    setActionLoading("savePlan");
    setAlertMsg(null);

    try {
      const featuresArray = planForm.featuresText
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await fetch(`/api/super-admin/plans/${editingPlan.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: planForm.name,
          description: planForm.description,
          priceDZD: Number(planForm.priceDZD),
          annualPriceDZD: planForm.annualPriceDZD ? Number(planForm.annualPriceDZD) : null,
          maxStudents: Number(planForm.maxStudents),
          maxTeachers: Number(planForm.maxTeachers),
          maxBranches: Number(planForm.maxBranches),
          maxGroups: Number(planForm.maxGroups),
          storageLimitGB: Number(planForm.storageLimitGB),
          features: featuresArray,
          isActive: planForm.isActive,
        }),
      });

      const resJson = await res.json();
      if (!res.ok) throw new Error(resJson.error || "فشل تعديل الخطة");

      setAlertMsg({ text: resJson.message || "تم حفظ تعديل الخطة والسعر بنجاح", type: "success" });
      setEditingPlan(null);
      await checkAuthAndFetch();
    } catch (err: any) {
      setAlertMsg({ text: err.message || "حدث خطأ أثناء تعديل الخطة", type: "error" });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeletePlan = async (id: string, name: string) => {
    if (!window.confirm(`هل أنت متأكد من حذف أو إلغاء تفعيل خطة "${name}"؟`)) return;
    setActionLoading("deletePlan-" + id);
    setAlertMsg(null);
    try {
      const res = await fetch(`/api/super-admin/plans/${id}`, {
        method: "DELETE",
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || "فشل حذف الخطة");
      setAlertMsg({ text: resData.message || "تم حذف/إلغاء الخطة بنجاح", type: "success" });
      setEditingPlan(null);
      await checkAuthAndFetch();
    } catch (err: any) {
      setAlertMsg({ text: err.message || "حدث خطأ أثناء حذف الخطة", type: "error" });
    } finally {
      setActionLoading(null);
    }
  };

  const handleTogglePlanActive = async (plan: any) => {
    const newActiveState = !plan.isActive;
    setActionLoading("togglePlan-" + plan.id);
    setAlertMsg(null);
    try {
      const res = await fetch(`/api/super-admin/plans/${plan.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: newActiveState }),
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || "فشل تغيير حالة الخطة");
      setAlertMsg({
        text: `تم ${newActiveState ? "تفعيل وإظهار" : "إلغاء وتعتيم"} خطة "${plan.name}" بنجاح في الموقع والداشبورد`,
        type: "success",
      });
      await checkAuthAndFetch();
    } catch (err: any) {
      setAlertMsg({ text: err.message || "حدث خطأ أثناء تعديل حالة الخطة", type: "error" });
    } finally {
      setActionLoading(null);
    }
  };


  const handleCreateInstitution = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading("create");
    setAlertMsg(null);
    try {
      const res = await fetch("/api/super-admin/institutions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newInst),
      });
      const resJson = await res.json();
      if (!res.ok) throw new Error(resJson.error || "تعذر إنشاء المؤسسة");

      setAlertMsg({ text: resJson.message || "تم إنشاء المؤسسة بنجاح", type: "success" });
      setNewInst({
        name: "",
        code: "",
        wilayaCode: 16,
        planId: data?.plans?.[0]?.id || "",
        adminName: "",
        adminEmail: "",
        adminPhone: "0550 00 00 00",
        password: "Madrasati2026!",
      });
      setActiveTab("institutions");
      await checkAuthAndFetch();
    } catch (err: any) {
      setAlertMsg({ text: err.message || "حدث خطأ أثناء إنشاء المؤسسة", type: "error" });
    } finally {
      setActionLoading(null);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6">
        <div className="w-12 h-12 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin mb-4" />
        <p className="font-bold text-slate-300">جارٍ التحقق من صلاحيات المالك Super Admin...</p>
      </div>
    );
  }

  if (isAuthorized === false) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 rounded-3xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mb-6">
          <Lock className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-extrabold mb-3">غير مصرح لك بالوصول (403 Forbidden)</h1>
        <p className="text-slate-400 max-w-md mb-8">
          هذه المنطقة مخصصة حصرياً للمالك العام لمنصة مدرستي برو (Super Admin: superadmin@madrasatipro.dz). المؤسسات والمدارس التعليمية لا تملك صلاحية الوصول إلى هنا.
        </p>
        <div className="flex items-center gap-4">
          <a
            href="/dashboard"
            className="px-6 py-3 rounded-full bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm transition"
          >
            الذهاب للوحة تحكم مدرستي
          </a>
          <a
            href="/login"
            className="px-6 py-3 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition"
          >
            تسجيل الدخول كـ Super Admin
          </a>
        </div>
      </div>
    );
  }

  const institutions = data?.institutions || [];
  const plans = data?.plans || [];
  const stats = data?.stats || {
    totalInstitutions: 0,
    activeInstitutions: 0,
    pendingInstitutions: 0,
    suspendedInstitutions: 0,
    totalStudentsAcrossSaaS: 0,
    totalTeachersAcrossSaaS: 0,
    estimatedMonthlyMRR: 0,
  };

  const pendingList = institutions.filter((i: any) => i.status === "PENDING_APPROVAL");

  const filteredInstitutions = institutions.filter((inst: any) => {
    const matchesSearch =
      inst.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inst.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inst.users?.[0]?.fullName && inst.users[0].fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (inst.users?.[0]?.email && inst.users[0].email.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === "ALL" || inst.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div dir="rtl" className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative h-11 w-44 bg-white p-1 rounded-xl">
              <Image
                src="/logo-transparent.png"
                alt="MadrasatiPro Logo"
                fill
                className="object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl text-white">MadrasatiPro Platform</span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  لوحة المالك العام (Super Admin)
                </span>
              </div>
              <p className="text-xs text-slate-400">إدارة البنية التحتية، المؤسسات التعليمية، والاشتراكات الوطنية</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-xs text-slate-300">
              {sessionUser?.email || "superadmin@madrasatipro.dz"}
            </div>
            <a
              href="/"
              className="px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition"
            >
              الصفحة الرئيسية
            </a>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-bold transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>خروج</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Notification Alert Banner */}
        {alertMsg && (
          <div
            className={`p-4 rounded-2xl flex items-center justify-between gap-3 text-sm font-semibold border ${
              alertMsg.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : "bg-rose-500/10 border-rose-500/30 text-rose-400"
            }`}
          >
            <span>{alertMsg.text}</span>
            <button onClick={() => setAlertMsg(null)} className="text-xs opacity-80 hover:opacity-100">
              إغلاق
            </button>
          </div>
        )}

        {/* Platform Overview Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400">إجمالي المؤسسات</span>
              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-white mb-1">{stats.totalInstitutions}</div>
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span className="text-emerald-400 font-bold">{stats.activeInstitutions} نشطة</span>
              <span>•</span>
              <span className="text-amber-400 font-bold">{stats.pendingInstitutions} قيد المراجعة</span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400">الإيراد الشهري (MRR)</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-white mb-1">
              {formatDZD(stats.estimatedMonthlyMRR, "ar")}
            </div>
            <div className="text-[11px] text-emerald-400 font-semibold">من الاشتراكات النشطة شهرياً</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400">الطلاب عبر المنصة</span>
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-white mb-1">{stats.totalStudentsAcrossSaaS}</div>
            <div className="text-[11px] text-slate-400">طالب في مختلف الولايات</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400">الأساتذة النشطون</span>
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-white mb-1">{stats.totalTeachersAcrossSaaS}</div>
            <div className="text-[11px] text-slate-400">أستاذ مسجل في الأفواج</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
          <button
            onClick={() => setActiveTab("pending")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition ${
              activeTab === "pending"
                ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>طلبات الانضمام الجديدة</span>
            {pendingList.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-slate-950 text-amber-400 text-[10px] flex items-center justify-center font-black">
                {pendingList.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("institutions")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition ${
              activeTab === "institutions"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>جميع المدارس والمؤسسات</span>
            <span className="text-[11px] opacity-80">({institutions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("plans")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition ${
              activeTab === "plans"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>خطط الاشتراكات والأسعار</span>
          </button>

          <button
            onClick={() => setActiveTab("create")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition ${
              activeTab === "create"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>إضافة مدرسة يدوياً</span>
          </button>

          <button
            onClick={() => setActiveTab("payments")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition ${
              activeTab === "payments"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>طرق الدفع</span>
            <span className="text-[11px] opacity-80">({paymentMethods.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("contact")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition ${
              activeTab === "contact"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <Phone className="w-4 h-4" />
            <span>إعدادات التواصل</span>
          </button>
        </div>

        {/* TAB 1: PENDING APPROVAL REQUESTS */}
        {activeTab === "pending" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">طلبات التسجيل بانتظار المراجعة والاعتماد</h2>
                <p className="text-xs text-slate-400">
                  المؤسسات التي سجلت عبر صفحة التسجيل العامة وتنتظر تفعيل حساباتها
                </p>
              </div>
              <button
                onClick={checkAuthAndFetch}
                className="p-2 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition"
                title="تحديث"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {pendingList.length === 0 ? (
              <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                <h3 className="font-bold text-lg text-white mb-1">لا توجد طلبات معلقة حالياً</h3>
                <p className="text-xs text-slate-400">جميع المؤسسات المسجلة تمت معالجتها واعتمادها.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingList.map((inst: any) => {
                  const admin = inst.users?.[0];
                  const wilaya = ALGERIAN_WILAYAS.find((w) => w.code === inst.wilayaCode)?.nameAr || `ولاية ${inst.wilayaCode}`;
                  return (
                    <div
                      key={inst.id}
                      className="bg-slate-900 border border-amber-500/30 rounded-3xl p-6 shadow-xl space-y-4"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 mb-2 inline-block">
                            طلب تسجيل جديد
                          </span>
                          <h3 className="text-lg font-extrabold text-white">{inst.name}</h3>
                          <p className="text-xs text-slate-400">{wilaya} • الرمز: {inst.code}</p>
                        </div>
                        <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                          خطة {inst.subscription?.plan?.name || "Starter"}
                        </span>
                      </div>

                      <div className="bg-slate-950/60 rounded-2xl p-4 text-xs space-y-2 border border-slate-800/80">
                        <div className="flex justify-between">
                          <span className="text-slate-400">المدير المسؤول:</span>
                          <span className="font-bold text-slate-200">{admin?.fullName || "—"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">البريد الإلكتروني:</span>
                          <span className="font-bold text-slate-200">{admin?.email || "—"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">الهاتف:</span>
                          <span className="font-bold text-indigo-300">{admin?.phone || "0550000000"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">تاريخ الطلب:</span>
                          <span className="text-slate-400">{new Date(inst.createdAt).toLocaleDateString("ar-DZ")}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2">
                        <button
                          disabled={actionLoading === inst.id}
                          onClick={() => handleUpdateStatus(inst.id, "ACTIVE")}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>موافقة وتفعيل المؤسسة الآن</span>
                        </button>
                        <button
                          disabled={actionLoading === inst.id}
                          onClick={() => handleUpdateStatus(inst.id, "REJECTED")}
                          className="px-4 py-2.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold transition disabled:opacity-50"
                        >
                          رفض
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ALL INSTITUTIONS */}
        {activeTab === "institutions" && (
          <div className="space-y-4">
            {/* Search and Filters */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="ابحث باسم المدرسة، المدير، البريد..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-full py-2 px-9 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto">
                <Filter className="w-4 h-4 text-slate-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-full px-4 py-2 text-xs font-semibold text-slate-300 focus:outline-none"
                >
                  <option value="ALL">جميع الحالات</option>
                  <option value="ACTIVE">النشطة فقط</option>
                  <option value="PENDING_APPROVAL">قيد المراجعة</option>
                  <option value="SUSPENDED">المعلقة مؤقتاً</option>
                </select>
                <span className="text-xs text-slate-400 font-semibold px-2">
                  {filteredInstitutions.length} مؤسسة
                </span>
              </div>
            </div>

            {/* Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                      <th className="py-4 px-5">المؤسسة التعليمية</th>
                      <th className="py-4 px-4">الولاية والمقر</th>
                      <th className="py-4 px-4">المدير المسؤول</th>
                      <th className="py-4 px-4">الخطة الحالية</th>
                      <th className="py-4 px-4">الطلاب / الأساتذة</th>
                      <th className="py-4 px-4">الحالة</th>
                      <th className="py-4 px-5 text-center">الإجراءات والتحكم</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {filteredInstitutions.map((inst: any) => {
                      const admin = inst.users?.[0];
                      const wilaya = ALGERIAN_WILAYAS.find((w) => w.code === inst.wilayaCode)?.nameAr || `ولاية ${inst.wilayaCode}`;
                      const isPending = inst.status === "PENDING_APPROVAL";
                      const isActive = inst.status === "ACTIVE";
                      const isSuspended = inst.status === "SUSPENDED";

                      return (
                        <tr key={inst.id} className="hover:bg-slate-800/40 transition">
                          <td className="py-4 px-5">
                            <div>
                              <p className="font-extrabold text-white text-sm">{inst.name}</p>
                              <p className="text-[11px] text-slate-500 font-mono">id: {inst.code}</p>
                            </div>
                          </td>

                          <td className="py-4 px-4">
                            <span className="inline-block px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-[11px] font-semibold">
                              {wilaya}
                            </span>
                          </td>

                          <td className="py-4 px-4">
                            <p className="font-bold text-slate-200">{admin?.fullName || "—"}</p>
                            <p className="text-[11px] text-slate-400">{admin?.email}</p>
                          </td>

                          <td className="py-4 px-4">
                            <select
                              value={inst.subscription?.planId || ""}
                              onChange={(e) => handleChangePlan(inst.id, e.target.value)}
                              className="bg-slate-950 border border-slate-800 rounded-xl px-2 py-1 text-xs text-indigo-400 font-bold focus:outline-none"
                            >
                              {plans.map((p: any) => (
                                <option key={p.id} value={p.id}>
                                  {p.name} ({p.priceDZD} د.ج)
                                </option>
                              ))}
                            </select>
                          </td>

                          <td className="py-4 px-4">
                            <span className="font-bold text-white">{inst._count?.students || 0}</span> طالب •{" "}
                            <span className="font-bold text-white">{inst._count?.teachers || 0}</span> أستاذ
                          </td>

                          <td className="py-4 px-4">
                            {isActive && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                نشط
                              </span>
                            )}
                            {isPending && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                قيد المراجعة
                              </span>
                            )}
                            {isSuspended && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                                معلق
                              </span>
                            )}
                          </td>

                          <td className="py-4 px-5 text-center">
                            <div className="flex items-center justify-center gap-2">
                              {/* Impersonate / Support Login Button */}
                              <button
                                onClick={() => handleSupportImpersonate(inst.id)}
                                disabled={actionLoading === inst.id}
                                className="px-3 py-1.5 rounded-full bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 font-bold text-xs flex items-center gap-1 transition"
                                title="الدخول بصلاحية الدعم الفني لمساعدة المؤسسة"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span>دعم المؤسسة</span>
                              </button>

                              {/* Status Toggle Action */}
                              {isPending && (
                                <button
                                  onClick={() => handleUpdateStatus(inst.id, "ACTIVE")}
                                  className="px-3 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition"
                                >
                                  قبول
                                </button>
                              )}

                              {isActive && (
                                <button
                                  onClick={() => handleUpdateStatus(inst.id, "SUSPENDED")}
                                  className="px-3 py-1.5 rounded-full bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 font-bold text-xs transition"
                                >
                                  تعليق
                                </button>
                              )}

                              {isSuspended && (
                                <button
                                  onClick={() => handleUpdateStatus(inst.id, "ACTIVE")}
                                  className="px-3 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition"
                                >
                                  إعادة تفعيل
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SUBSCRIPTION PLANS */}
        {activeTab === "plans" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">خطط الاشتراكات والأسعار — MadrasatiPro SaaS</h2>
              <p className="text-xs text-slate-400">
                تسعير المؤسسات في الجزائر بالدينار الجزائري (DZD) وحدود الاستخدام لكل فئة
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan: any) => {
                const subCount = institutions.filter((i: any) => i.subscription?.planId === plan.id).length;
                return (
                  <div
                    key={plan.id}
                    className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-black text-white">{plan.name}</h3>
                          {plan.isActive ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              ✓ نشطة ومعروضة
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                              ✕ معطلة ومخفية
                            </span>
                          )}
                        </div>
                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                          {subCount} مؤسسة مشتركة
                        </span>
                      </div>

                      <div className="mb-6">
                        <span className="text-3xl font-extrabold text-white">
                          {formatDZD(plan.priceDZD, "ar")}
                        </span>
                        <span className="text-xs text-slate-400 mr-2">/ شهرياً</span>
                      </div>

                      <div className="space-y-3 text-xs text-slate-300 border-t border-slate-800 pt-4 mb-6">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">الحد الأقصى للطلاب:</span>
                          <span className="font-bold text-white">{plan.maxStudents} طالب</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">الحد الأقصى للأساتذة:</span>
                          <span className="font-bold text-white">{plan.maxTeachers} أستاذ</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">الفروع المتاحة:</span>
                          <span className="font-bold text-white">{plan.maxBranches} مقر</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">المساحة السحابية:</span>
                          <span className="font-bold text-white">{plan.storageLimitGB} GB</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">إشعارات SMS / WhatsApp:</span>
                          <span className="font-bold text-emerald-400">
                            {plan.features?.includes("sms") ? "مفعّلة" : "متاحة"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => handleTogglePlanActive(plan)}
                        disabled={actionLoading === "togglePlan-" + plan.id}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                          plan.isActive
                            ? "bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30"
                            : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        }`}
                      >
                        <span>{plan.isActive ? "تعطيل وإخفاء" : "تفعيل وإظهار"}</span>
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenEditPlan(plan)}
                          className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-sm"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>تعديل الأسعار</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeletePlan(plan.id, plan.name)}
                          disabled={actionLoading === "deletePlan-" + plan.id}
                          title="حذف الخطة"
                          className="p-2 rounded-xl bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 border border-slate-700 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* EDIT PLAN MODAL DIALOG */}
        {editingPlan && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl p-6 sm:p-8 shadow-2xl space-y-5 text-right">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-lg font-black text-white">تعديل خطة: {editingPlan.name}</h3>
                  <p className="text-xs text-slate-400">تحديث الأسعار الشهرية والسنوية وحدود الاستخدام مباشرة في قاعدة البيانات</p>
                </div>
                <button
                  onClick={() => setEditingPlan(null)}
                  className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSavePlan} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">اسم الخطة *</label>
                    <input
                      type="text"
                      required
                      value={planForm.name}
                      onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">السعر الشهري بالدينار (DZD) *</label>
                    <input
                      type="number"
                      required
                      min={0}
                      step={100}
                      value={planForm.priceDZD}
                      onChange={(e) => setPlanForm({ ...planForm, priceDZD: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white font-bold focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">السعر السنوي التقديري (DZD)</label>
                    <input
                      type="number"
                      min={0}
                      step={500}
                      value={planForm.annualPriceDZD}
                      onChange={(e) => setPlanForm({ ...planForm, annualPriceDZD: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">وصف الخطة</label>
                    <input
                      type="text"
                      value={planForm.description}
                      onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
                      placeholder="مثال: الخطة الأكثر طلباً للمدارس ومعاهد اللغات"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">أقصى عدد للطلاب</label>
                    <input
                      type="number"
                      min={1}
                      value={planForm.maxStudents}
                      onChange={(e) => setPlanForm({ ...planForm, maxStudents: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">أقصى عدد للأساتذة</label>
                    <input
                      type="number"
                      min={1}
                      value={planForm.maxTeachers}
                      onChange={(e) => setPlanForm({ ...planForm, maxTeachers: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">عدد الفروع المسموحة</label>
                    <input
                      type="number"
                      min={1}
                      value={planForm.maxBranches}
                      onChange={(e) => setPlanForm({ ...planForm, maxBranches: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">مساحة التخزين (GB)</label>
                    <input
                      type="number"
                      min={1}
                      value={planForm.storageLimitGB}
                      onChange={(e) => setPlanForm({ ...planForm, storageLimitGB: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    المميزات (كل ميزة في سطر منفصل)
                  </label>
                  <textarea
                    rows={4}
                    value={planForm.featuresText}
                    onChange={(e) => setPlanForm({ ...planForm, featuresText: e.target.value })}
                    placeholder="إدارة الطلاب والأفواج&#10;الجداول الذكية ومنع التضارب&#10;الفوترة والمدفوعات بالدينار&#10;تقارير الحضور والغياب"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono leading-relaxed"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-300">
                    <input
                      type="checkbox"
                      checked={planForm.isActive}
                      onChange={(e) => setPlanForm({ ...planForm, isActive: e.target.checked })}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>الخطة نشطة ومتاحة للاشتراك في صفحة الهبوط والتسجيل</span>
                  </label>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-slate-800">
                  <button
                    type="submit"
                    disabled={actionLoading === "savePlan"}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold py-3 rounded-2xl text-xs shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
                  >
                    {actionLoading === "savePlan" ? "جارٍ الحفظ في قاعدة البيانات..." : "حفظ التغييرات ومزامنة الأسعار"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeletePlan(editingPlan.id, editingPlan.name)}
                    className="px-4 py-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>حذف الخطة</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingPlan(null)}
                    className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TAB 4: CREATE INSTITUTION MANUALLY */}
        {activeTab === "create" && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-2xl mx-auto shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-2">إضافة واعتماد مؤسسة تعليمية جديدة</h2>
            <p className="text-xs text-slate-400 mb-6">
              إنشاء حساب مدرسة جديدة وربط المدير الرئيسي وتفعيل اشتراكها فورياً
            </p>

            <form onSubmit={handleCreateInstitution} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">اسم المؤسسة التعليمية *</label>
                  <input
                    type="text"
                    required
                    value={newInst.name}
                    onChange={(e) => setNewInst({ ...newInst, name: e.target.value })}
                    placeholder="مثال: أكاديمية النجاح والتفوق"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">رمز فريد للمؤسسة (Code) *</label>
                  <input
                    type="text"
                    value={newInst.code}
                    onChange={(e) => setNewInst({ ...newInst, code: e.target.value })}
                    placeholder="al-najah"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">الولاية الجزائرية *</label>
                  <select
                    value={newInst.wilayaCode}
                    onChange={(e) => setNewInst({ ...newInst, wilayaCode: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none"
                  >
                    {ALGERIAN_WILAYAS.map((w) => (
                      <option key={w.code} value={w.code}>
                        {w.code} - {w.nameAr}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">خطة الاشتراك *</label>
                  <select
                    value={newInst.planId}
                    onChange={(e) => setNewInst({ ...newInst, planId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none"
                  >
                    {plans.map((p: any) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.priceDZD} د.ج/شهر)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="border-t border-slate-800 pt-4">
                <h4 className="text-xs font-extrabold text-indigo-400 mb-3">بيانات حساب المدير المشرف:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">اسم المدير الكامل *</label>
                    <input
                      type="text"
                      required
                      value={newInst.adminName}
                      onChange={(e) => setNewInst({ ...newInst, adminName: e.target.value })}
                      placeholder="أحمد بلحاج"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">البريد الإلكتروني للدخول *</label>
                    <input
                      type="email"
                      required
                      value={newInst.adminEmail}
                      onChange={(e) => setNewInst({ ...newInst, adminEmail: e.target.value })}
                      placeholder="admin@school.dz"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">رقم الهاتف *</label>
                    <input
                      type="tel"
                      value={newInst.adminPhone}
                      onChange={(e) => setNewInst({ ...newInst, adminPhone: e.target.value })}
                      placeholder="0550 00 00 00"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">كلمة المرور المؤقتة *</label>
                    <input
                      type="text"
                      value={newInst.password}
                      onChange={(e) => setNewInst({ ...newInst, password: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={actionLoading === "create"}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-2xl text-xs shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
                >
                  {actionLoading === "create" ? "جارٍ إنشاء المؤسسة والاشتراك..." : "إنشاء المؤسسة وتفعيلها فوراً"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 5: PAYMENT METHODS MANAGEMENT */}
        {activeTab === "payments" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-indigo-400" />
                  <span>طرق ووسائل الدفع لمنصة مدرستي برو</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  التحكم المركزي في حسابات وطرق الدفع المعروضة للمدارس الجديدة أثناء التسجيل وفي صفحات الفوترة
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={fetchPaymentMethods}
                  className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition border border-slate-800"
                  title="تحديث"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={handleOpenAddPayment}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة وسيلة دفع جديدة</span>
                </button>
              </div>
            </div>

            {loadingPayments ? (
              <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center">
                <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mx-auto mb-3" />
                <p className="text-xs text-slate-400 font-bold">جارٍ تحميل طرق الدفع...</p>
              </div>
            ) : paymentMethods.length === 0 ? (
              <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center space-y-3">
                <Wallet className="w-12 h-12 text-slate-600 mx-auto" />
                <h3 className="font-bold text-lg text-white">لا توجد طرق دفع معرفة حالياً</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  أضف وسائل الدفع الجزائرية المعتمدة (بريدي موب، CCP، تحويل بنكي) ليتمكن المشتركون من اختيارها.
                </p>
                <button
                  onClick={handleOpenAddPayment}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
                >
                  إضافة وسيلة دفع الآن
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className={`bg-slate-900 border rounded-3xl p-6 shadow-xl flex flex-col justify-between transition-all ${
                      method.isActive ? "border-slate-800 hover:border-slate-700" : "border-slate-800/60 opacity-60 bg-slate-950/40"
                    }`}
                  >
                    <div className="space-y-4">
                      {/* Top Row: Badge & Status */}
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                          {method.code}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleTogglePaymentActive(method.id, method.isActive)}
                            className={`px-3 py-1 rounded-full text-[10px] font-black border transition ${
                              method.isActive
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                                : "bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700"
                            }`}
                          >
                            {method.isActive ? "نشطة (مفعلة)" : "معطلة (غير معروضة)"}
                          </button>
                        </div>
                      </div>

                      {/* Method Identity */}
                      <div>
                        <h3 className="text-base font-extrabold text-white">{method.displayName || method.name}</h3>
                        <p className="text-xs text-indigo-400 font-semibold">{method.name}</p>
                        {method.description && (
                          <p className="text-xs text-slate-400 mt-1 line-clamp-2">{method.description}</p>
                        )}
                      </div>

                      {/* Account Details Box */}
                      <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-2 text-xs">
                        <div className="flex items-center justify-between text-slate-400">
                          <span>رقم الحساب / RIP:</span>
                          <span className="font-mono font-bold text-slate-200 select-all">
                            {method.accountNumber || "—"}
                          </span>
                        </div>
                        {method.accountName && (
                          <div className="flex items-center justify-between text-slate-400">
                            <span>صاحب الحساب:</span>
                            <span className="font-bold text-slate-200">{method.accountName}</span>
                          </div>
                        )}
                        {method.instructions && (
                          <div className="pt-1.5 border-t border-slate-900 text-[11px] text-amber-400/90 leading-relaxed">
                            {method.instructions}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="pt-4 border-t border-slate-800/80 mt-4 flex items-center justify-between gap-2">
                      <span className="text-[10px] text-slate-500">الترتيب: #{method.sortOrder}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenEditPayment(method)}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>تعديل</span>
                        </button>
                        <button
                          onClick={() => handleDeletePaymentMethod(method.id, method.displayName || method.name)}
                          className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition"
                          title="حذف"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 6: PLATFORM CONTACT & SOCIAL SETTINGS */}
        {activeTab === "contact" && (
          <div className="space-y-6 max-w-4xl">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Phone className="w-5 h-5 text-indigo-400" />
                <span>إعدادات التواصل الرسمية والروابط الاجتماعية</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                المصدر المركزي الموحد لأرقام التواصل، الدعم الفني، وروابط السوشيال ميديا الخاصة بمنصة مدرستي برو
              </p>
            </div>

            {/* Crucial Multi-Tenant Isolation Notice */}
            <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-xs text-indigo-200 leading-relaxed flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-extrabold block text-white mb-0.5">تنبيه العزل والأمان (Multi-Tenant Isolation):</span>
                هذه الإعدادات خاصة بالمنصة ككل وتظهر في الموقع العام، صفحة الانتظار PENDING APPROVAL، وتذييل الموقع الرسمي. لا تختلط هذه البيانات مطلقاً مع هواتف أو إعدادات المدارس والمراكز المشتركة.
              </div>
            </div>

            <form onSubmit={handleSavePlatformSettings} className="space-y-6">
              {/* Category 1: Phone Numbers */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                  <Phone className="w-4 h-4 text-[#F47A3C]" />
                  <span>أرقام الهواتف الرسمية</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">الهاتف الرئيسي للمنصة</label>
                    <input
                      type="text"
                      value={platformForm.mainPhone}
                      onChange={(e) => setPlatformForm({ ...platformForm, mainPhone: e.target.value })}
                      placeholder="0550 12 34 56"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">هاتف الدعم الفني</label>
                    <input
                      type="text"
                      value={platformForm.supportPhone}
                      onChange={(e) => setPlatformForm({ ...platformForm, supportPhone: e.target.value })}
                      placeholder="0770 98 76 54"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">هاتف المبيعات والاستشارات</label>
                    <input
                      type="text"
                      value={platformForm.salesPhone}
                      onChange={(e) => setPlatformForm({ ...platformForm, salesPhone: e.target.value })}
                      placeholder="0550 12 34 56"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Category 2: Emails */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                  <Mail className="w-4 h-4 text-teal-400" />
                  <span>عناوين البريد الإلكتروني</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">البريد الرسمي العام</label>
                    <input
                      type="email"
                      value={platformForm.mainEmail}
                      onChange={(e) => setPlatformForm({ ...platformForm, mainEmail: e.target.value })}
                      placeholder="contact@madrasatipro.dz"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">بريد الدعم الفني</label>
                    <input
                      type="email"
                      value={platformForm.supportEmail}
                      onChange={(e) => setPlatformForm({ ...platformForm, supportEmail: e.target.value })}
                      placeholder="support@madrasatipro.dz"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">بريد المبيعات</label>
                    <input
                      type="email"
                      value={platformForm.salesEmail}
                      onChange={(e) => setPlatformForm({ ...platformForm, salesEmail: e.target.value })}
                      placeholder="sales@madrasatipro.dz"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Category 3: WhatsApp & Location */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                  <span>واتساب والمقر الجغرافي</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      رقم واتساب المباشر (بالصيغة الدولية)
                    </label>
                    <input
                      type="text"
                      value={platformForm.whatsapp}
                      onChange={(e) => setPlatformForm({ ...platformForm, whatsapp: e.target.value })}
                      placeholder="213550123456"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">يُستخدم لتوجيه المحادثات الفورية عبر رابط wa.me</p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">عنوان ومقر المنصة</label>
                    <input
                      type="text"
                      value={platformForm.address}
                      onChange={(e) => setPlatformForm({ ...platformForm, address: e.target.value })}
                      placeholder="الجزائر العاصمة • سطيف • وهران • قسنطينة"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Category 4: Social Media Links */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                  <Globe className="w-4 h-4 text-indigo-400" />
                  <span>روابط منصات التواصل الاجتماعي الرسمية</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">فيسبوك (Facebook)</label>
                    <input
                      type="url"
                      value={platformForm.facebookUrl}
                      onChange={(e) => setPlatformForm({ ...platformForm, facebookUrl: e.target.value })}
                      placeholder="https://facebook.com/madrasatipro"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">إنستغرام (Instagram)</label>
                    <input
                      type="url"
                      value={platformForm.instagramUrl}
                      onChange={(e) => setPlatformForm({ ...platformForm, instagramUrl: e.target.value })}
                      placeholder="https://instagram.com/madrasatipro"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">لينكد إن (LinkedIn)</label>
                    <input
                      type="url"
                      value={platformForm.linkedinUrl}
                      onChange={(e) => setPlatformForm({ ...platformForm, linkedinUrl: e.target.value })}
                      placeholder="https://linkedin.com/company/madrasatipro"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">يوتيوب (YouTube)</label>
                    <input
                      type="url"
                      value={platformForm.youtubeUrl}
                      onChange={(e) => setPlatformForm({ ...platformForm, youtubeUrl: e.target.value })}
                      placeholder="https://youtube.com/@madrasatipro"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">تيك توك (TikTok)</label>
                    <input
                      type="url"
                      value={platformForm.tiktokUrl}
                      onChange={(e) => setPlatformForm({ ...platformForm, tiktokUrl: e.target.value })}
                      placeholder="https://tiktok.com/@madrasatipro"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{savingSettings ? "جارٍ حفظ الإعدادات..." : "حفظ إعدادات التواصل وتحديث الموقع"}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* MODAL: ADD / EDIT PAYMENT METHOD */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full text-right space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-indigo-400" />
                <span>{editingPaymentMethod ? "تعديل وسيلة الدفع" : "إضافة وسيلة دفع جديدة"}</span>
              </h3>
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePaymentMethod} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">اسم وسيلة الدفع (العام) *</label>
                <input
                  type="text"
                  required
                  value={paymentForm.name}
                  onChange={(e) => setPaymentForm({ ...paymentForm, name: e.target.value })}
                  placeholder="بريدي موب (Baridimob)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">الاسم المعروض للمشترك *</label>
                  <input
                    type="text"
                    required
                    value={paymentForm.displayName}
                    onChange={(e) => setPaymentForm({ ...paymentForm, displayName: e.target.value })}
                    placeholder="تطبيق بريدي موب"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">الرمز الفريد (Code)</label>
                  <input
                    type="text"
                    disabled={!!editingPaymentMethod}
                    value={paymentForm.code}
                    onChange={(e) => setPaymentForm({ ...paymentForm, code: e.target.value })}
                    placeholder="baridimob"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono disabled:opacity-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">رقم الحساب البريدي / RIP *</label>
                <input
                  type="text"
                  value={paymentForm.accountNumber}
                  onChange={(e) => setPaymentForm({ ...paymentForm, accountNumber: e.target.value })}
                  placeholder="00799999000123456789"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">صاحب الحساب</label>
                <input
                  type="text"
                  value={paymentForm.accountName}
                  onChange={(e) => setPaymentForm({ ...paymentForm, accountName: e.target.value })}
                  placeholder="SARL MADRASATIPRO EDTECH"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">تعليمات التحويل للمشترك</label>
                <textarea
                  rows={2}
                  value={paymentForm.instructions}
                  onChange={(e) => setPaymentForm({ ...paymentForm, instructions: e.target.value })}
                  placeholder="قم بالتحويل عبر التطبيق وأدخل رقم العملية للتحقق الفوري"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 items-center pt-1">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">الترتيب في القائمة</label>
                  <input
                    type="number"
                    value={paymentForm.sortOrder}
                    onChange={(e) => setPaymentForm({ ...paymentForm, sortOrder: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
                <div className="pt-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={paymentForm.isActive}
                      onChange={(e) => setPaymentForm({ ...paymentForm, isActive: e.target.checked })}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-950 border-slate-800"
                    />
                    <span className="text-xs font-bold text-slate-300">مفعلة وتظهر في التسجيل</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={actionLoading === "savePayment"}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition disabled:opacity-50"
                >
                  {actionLoading === "savePayment" ? "جارٍ الحفظ..." : "حفظ وسيلة الدفع"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
