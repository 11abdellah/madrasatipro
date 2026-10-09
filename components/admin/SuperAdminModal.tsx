"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Building2,
  Users,
  CheckCircle2,
  AlertTriangle,
  X,
  Plus,
  RefreshCw,
  Wallet,
  ExternalLink,
} from "lucide-react";
import { formatDZD } from "@/lib/utils";
import { Locale } from "@/types";

interface SuperAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  locale: Locale;
  currentInstitutionId: string;
  onSwitchTenant: (instId: string) => void;
}

export const SuperAdminModal: React.FC<SuperAdminModalProps> = ({
  isOpen,
  onClose,
  locale,
  currentInstitutionId,
  onSwitchTenant,
}) => {
  const isRTL = locale === "ar";
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState<string | null>(null);

  // New Institution Form
  const [isCreating, setIsCreating] = useState(false);
  const [newInst, setNewInst] = useState({
    name: "",
    code: "",
    wilayaCode: 16,
    planId: "",
    adminName: "",
    adminEmail: "",
    adminPhone: "0550 00 00 00",
  });
  const [createMsg, setCreateMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const fetchSuperAdminData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/super-admin/institutions");
      const json = await res.json();
      setData(json);
      if (json.plans?.[0] && !newInst.planId) {
        setNewInst((prev) => ({ ...prev, planId: json.plans[0].id }));
      }
    } catch (err) {
      console.error("Super Admin fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchSuperAdminData();
    }
  }, [isOpen]);

  const handleSwitch = async (instId: string) => {
    setSwitching(instId);
    try {
      const res = await fetch("/api/auth/switch-tenant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ institutionId: instId }),
      });
      if (res.ok) {
        onSwitchTenant(instId);
        onClose();
        window.location.reload();
      }
    } catch (err) {
      console.error("Switch failed:", err);
    } finally {
      setSwitching(null);
    }
  };

  const handleCreateInstitution = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setCreateMsg("");

    try {
      const res = await fetch("/api/super-admin/institutions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newInst),
      });
      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || "تعذر إنشاء المؤسسة");
      }
      setCreateMsg(resData.message);
      setIsCreating(false);
      fetchSuperAdminData();
    } catch (err: any) {
      setErrorMsg(err.message || "حدث خطأ");
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[28px] w-full max-w-3xl border border-slate-100 shadow-2xl p-6 text-right rtl:text-right ltr:text-left space-y-5 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-950 text-amber-400 flex items-center justify-center shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                {isRTL ? "لوحة المشرف العام لمنصة مدرستي برو (MadrasatiPro Super Admin)" : "MadrasatiPro Super Admin Portal"}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {isRTL
                  ? "إدارة المؤسسات التعليمية، الخطط والاشتراكات، والتبديل المباشر بين المؤسسات"
                  : "Manage multi-tenant institutions, subscription limits, and live tenant switching"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {createMsg && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{createMsg}</span>
          </div>
        )}

        {/* Global SaaS Metrics Bar */}
        {data?.stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block text-[11px] font-bold">
                {isRTL ? "إجمالي المؤسسات" : "Total Institutions"}
              </span>
              <span className="text-lg font-extrabold text-slate-900">
                {data.stats.totalInstitutions}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block text-[11px] font-bold">
                {isRTL ? "الطلاب عبر المنصة" : "Total Students"}
              </span>
              <span className="text-lg font-extrabold text-indigo-700">
                {data.stats.totalStudentsAcrossSaaS}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block text-[11px] font-bold">
                {isRTL ? "الأساتذة عبر المنصة" : "Total Teachers"}
              </span>
              <span className="text-lg font-extrabold text-emerald-700">
                {data.stats.totalTeachersAcrossSaaS}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block text-[11px] font-bold">
                {isRTL ? "الإيرادات الشهرية للـ SaaS" : "Monthly MRR"}
              </span>
              <span className="text-sm font-extrabold text-amber-700">
                {formatDZD(data.stats.estimatedMonthlyMRR, locale)}
              </span>
            </div>
          </div>
        )}

        {/* Action button to Onboard new institution */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-slate-900">
            {isRTL ? "المؤسسات التعليمية المشتركة (Tenants)" : "Active Tenant Institutions"}
          </h3>

          <button
            onClick={() => setIsCreating(!isCreating)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-950 text-white text-xs font-bold hover:bg-slate-800 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isRTL ? "إضافة مؤسسة جديدة" : "Onboard Institution"}</span>
          </button>
        </div>

        {/* Create Form */}
        {isCreating && (
          <form
            onSubmit={handleCreateInstitution}
            className="p-4 rounded-2xl border border-indigo-100 bg-indigo-50/40 space-y-3 text-xs"
          >
            <h4 className="font-bold text-indigo-950">
              {isRTL ? "تسجيل وتهيئة مؤسسة جديدة" : "New Institution Setup"}
            </h4>

            {errorMsg && (
              <p className="text-rose-600 font-bold text-xs">{errorMsg}</p>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">اسم المؤسسة *</label>
                <input
                  type="text"
                  required
                  value={newInst.name}
                  onChange={(e) => setNewInst({ ...newInst, name: e.target.value })}
                  placeholder="مثال: مدرسة المستقبل الخاصة"
                  className="w-full bg-white border border-slate-200 rounded-xl p-2 font-bold focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">خطة الاشتراك *</label>
                <select
                  value={newInst.planId}
                  onChange={(e) => setNewInst({ ...newInst, planId: e.target.value })}
                  required
                  className="w-full bg-white border border-slate-200 rounded-xl p-2 font-bold"
                >
                  {data?.plans?.map((p: any) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.priceDZD} دج/شهر - حد {p.maxStudents} طالب)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">اسم المدير المسئول *</label>
                <input
                  type="text"
                  required
                  value={newInst.adminName}
                  onChange={(e) => setNewInst({ ...newInst, adminName: e.target.value })}
                  placeholder="مثال: سفيان طهاري"
                  className="w-full bg-white border border-slate-200 rounded-xl p-2 font-bold focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">البريد الإلكتروني للدخول *</label>
                <input
                  type="email"
                  required
                  value={newInst.adminEmail}
                  onChange={(e) => setNewInst({ ...newInst, adminEmail: e.target.value })}
                  placeholder="soufiane@ecole.dz"
                  className="w-full bg-white border border-slate-200 rounded-xl p-2 font-bold focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-3 py-1.5 rounded-full border border-slate-200 text-slate-600 font-bold"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-full bg-indigo-600 text-white font-bold hover:bg-indigo-700"
              >
                تفعيل المؤسسة فورياً
              </button>
            </div>
          </form>
        )}

        {/* Institutions List Cards */}
        <div className="space-y-3">
          {data?.institutions?.map((inst: any) => {
            const isCurrent = inst.id === currentInstitutionId;
            const plan = inst.subscription?.plan;

            return (
              <div
                key={inst.id}
                className={`p-4 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isCurrent
                    ? "bg-indigo-50/50 border-indigo-300 ring-2 ring-indigo-200"
                    : "bg-white border-slate-100 hover:border-slate-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold shadow-sm"
                    style={{ backgroundColor: inst.brandColor || "#6366F1" }}
                  >
                    <Building2 className="w-5 h-5" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-sm text-slate-900">{inst.name}</h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        ولاية {inst.wilayaCode}
                      </span>
                      {isCurrent && (
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-600 text-white">
                          المؤسسة الحالية
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium">
                      الخطة: <strong className="text-slate-800">{plan?.name || "الأساسية"}</strong> • {inst._count.students} طالب • {inst._count.teachers} أستاذ • {inst._count.classGroups} فوج
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  {!isCurrent ? (
                    <button
                      onClick={() => handleSwitch(inst.id)}
                      disabled={switching === inst.id}
                      className="px-3.5 py-1.5 rounded-full bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center gap-1.5"
                    >
                      {switching === inst.id ? (
                        <span>جاري التبديل...</span>
                      ) : (
                        <>
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>التبديل إلى هذه المؤسسة</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                      جلسة نشطة
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
