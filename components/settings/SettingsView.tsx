"use client";

import React, { useState, useEffect } from "react";
import {
  Save,
  Building2,
  MapPin,
  Phone,
  Mail,
  Calendar,
  ShieldCheck,
  Check,
  Layers,
  Sliders,
  User,
  Lock,
  Upload,
  Trash2,
} from "lucide-react";
import { ALGERIAN_WILAYAS } from "@/lib/constants/algeria";
import { Locale } from "@/types";

interface SettingsViewProps {
  locale: Locale;
  onLogoChange?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ locale, onLogoChange }) => {
  const isRTL = locale === "ar";
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Form State
  const [institutionName, setInstitutionName] = useState("");
  const [wilayaCode, setWilayaCode] = useState(19);
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [academicYear, setAcademicYear] = useState("2025-2026");
  const [brandColor, setBrandColor] = useState("#E05B3A");
  const [planName, setPlanName] = useState("");

  // Logo State
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoError, setLogoError] = useState("");
  const [logoSuccess, setLogoSuccess] = useState("");

  // User Profile State
  const [userFullName, setUserFullName] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/settings");
      const data = await res.json();

      if (data.institution) {
        setInstitutionName(data.institution.name || "");
        setWilayaCode(data.institution.wilayaCode || 19);
        setAddress(data.institution.address || "");
        setPhone(data.institution.phone || "");
        setEmail(data.institution.email || "");
        setAcademicYear(data.institution.academicYear || "2025-2026");
        setBrandColor(data.institution.brandColor || "#E05B3A");
        setPlanName(data.institution.plan || "");
        setLogoUrl(data.institution.logoUrl || null);
      }

      if (data.user) {
        setUserFullName(data.user.fullName || "");
        setUserPhone(data.user.phone || "");
        setUserEmail(data.user.email || "");
      }
    } catch (err) {
      console.error("Failed to load settings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setLogoError(isRTL ? "حجم الصورة يتجاوز الحد الأقصى (2 ميغابايت)" : "File size exceeds 2MB limit");
      return;
    }

    setUploadingLogo(true);
    setLogoError("");
    setLogoSuccess("");

    try {
      const formData = new FormData();
      formData.append("logo", file);

      const res = await fetch("/api/settings/logo", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        setLogoError(data.error || "فشل رفع الشعار");
      } else {
        setLogoUrl(data.logoUrl);
        setLogoSuccess(isRTL ? "✓ تم تحديث شعار المؤسسة بنجاح" : "✓ Logo updated successfully");
        onLogoChange?.();
        setTimeout(() => setLogoSuccess(""), 4000);
      }
    } catch (err: any) {
      setLogoError(err.message || "حدث خطأ أثناء رفع الشعار");
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleRemoveLogo = async () => {
    if (!confirm(isRTL ? "هل أنت متأكد من حذف شعار المؤسسة والعودة للشعار الافتراضي؟" : "Remove institution logo?")) {
      return;
    }

    setUploadingLogo(true);
    setLogoError("");
    setLogoSuccess("");

    try {
      const res = await fetch("/api/settings/logo", { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        setLogoError(data.error || "فشل حذف الشعار");
      } else {
        setLogoUrl(null);
        setLogoSuccess(isRTL ? "✓ تمت إزالة الشعار بنجاح" : "✓ Logo removed");
        onLogoChange?.();
        setTimeout(() => setLogoSuccess(""), 4000);
      }
    } catch (err: any) {
      setLogoError(err.message || "حدث خطأ أثناء حذف الشعار");
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg("");
    setSavedSuccess(false);

    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: institutionName,
          wilayaCode,
          address,
          phone,
          email,
          academicYear,
          brandColor,
          userFullName,
          userPhone,
          newPassword: newPassword || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "تعذر حفظ الإعدادات");
      }

      setSavedSuccess(true);
      setNewPassword("");
      setTimeout(() => setSavedSuccess(false), 3500);
    } catch (err: any) {
      setErrorMsg(err.message || "حدث خطأ أثناء الحفظ");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400 text-xs">
        {isRTL ? "جاري جلب إعدادات المؤسسة من قاعدة البيانات..." : "Loading settings..."}
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {isRTL ? "إعدادات وتهيئة المؤسسة" : "Institution Settings"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            {isRTL
              ? "بيانات المركز، الشعار المخصص، الولاية، السنة الدراسية، الخطة المفعلة، وحساب المدير"
              : "Institution details, custom logo, Wilaya, academic year, active plan, and admin credentials"}
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 bg-slate-950 hover:bg-slate-800 text-white px-5 py-2.5 rounded-full text-xs font-bold shadow-md transition disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? (isRTL ? "جاري الحفظ..." : "Saving...") : (isRTL ? "حفظ التغييرات" : "Save Changes")}</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{isRTL ? "✓ تم حفظ وتحديث الإعدادات بنجاح في قاعدة البيانات!" : "✓ Settings successfully persisted to database!"}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 1: Institution Details & Branding */}
        <div className="bg-white rounded-[28px] p-6 border border-slate-100 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.03)] space-y-4 text-right rtl:text-right ltr:text-left">
          <div className="flex items-center justify-between pb-2 border-b">
            <div className="flex items-center gap-2.5">
              <Building2 className="w-5 h-5 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">
                {isRTL ? "بيانات وهوية المؤسسة" : "Institution Identity"}
              </h3>
            </div>
            {planName && (
              <span className="text-[11px] font-extrabold px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                {planName}
              </span>
            )}
          </div>

          <div className="space-y-4 text-xs">
            {/* Logo Upload & Preview Section */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
              <label className="block font-bold text-slate-800 text-xs">
                {isRTL ? "شعار المؤسسة المخصص (Custom Logo)" : "Institution Logo"}
              </label>

              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden shrink-0 shadow-xs relative">
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt="Logo preview"
                      className="w-full h-full object-contain p-1"
                    />
                  ) : (
                    <div className="text-center p-2">
                      <Building2 className="w-6 h-6 text-slate-300 mx-auto" />
                    </div>
                  )}
                </div>

                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="cursor-pointer bg-slate-950 hover:bg-slate-800 text-white px-3.5 py-1.5 rounded-full text-xs font-bold transition shadow-xs inline-flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{uploadingLogo ? (isRTL ? "جاري الرفع..." : "Uploading...") : (isRTL ? "رفع شعار جديد" : "Upload Logo")}</span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/webp"
                        onChange={handleLogoUpload}
                        disabled={uploadingLogo}
                        className="hidden"
                      />
                    </label>

                    {logoUrl && (
                      <button
                        type="button"
                        onClick={handleRemoveLogo}
                        disabled={uploadingLogo}
                        className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-3 py-1.5 rounded-full text-xs font-bold transition inline-flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{isRTL ? "إزالة الشعار" : "Remove"}</span>
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {isRTL
                      ? "الصيغ المدعومة: PNG, JPG, WebP. الحد الأقصى للحجم: 2 ميغابايت. يظهر في الترويسة ووصولات الدفع."
                      : "PNG, JPG, WebP up to 2MB. Appears in header and official receipts."}
                  </p>
                </div>
              </div>

              {logoSuccess && (
                <p className="text-xs font-bold text-emerald-600 animate-in fade-in">{logoSuccess}</p>
              )}
              {logoError && (
                <p className="text-xs font-bold text-rose-600 animate-in fade-in">{logoError}</p>
              )}
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {isRTL ? "اسم المؤسسة / المركز *" : "Institution Name *"}
              </label>
              <input
                type="text"
                value={institutionName}
                onChange={(e) => setInstitutionName(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isRTL ? "الولاية *" : "Wilaya *"}
                </label>
                <select
                  value={wilayaCode}
                  onChange={(e) => setWilayaCode(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold focus:outline-none"
                >
                  {ALGERIAN_WILAYAS.map((w) => (
                    <option key={w.code} value={w.code}>
                      {w.code} - {w.nameAr}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isRTL ? "السنة الدراسية *" : "Academic Year *"}
                </label>
                <input
                  type="text"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {isRTL ? "العنوان بالتفصيل" : "Detailed Address"}
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isRTL ? "رقم هاتف المؤسسة" : "Institution Phone"}
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isRTL ? "البريد الإلكتروني الرسمي" : "Official Email"}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Admin Profile & Credentials */}
        <div className="bg-white rounded-[28px] p-6 border border-slate-100 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.03)] space-y-4 text-right rtl:text-right ltr:text-left">
          <div className="flex items-center justify-between pb-2 border-b">
            <div className="flex items-center gap-2.5">
              <User className="w-5 h-5 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">
                {isRTL ? "بيانات حساب المدير" : "Admin Account"}
              </h3>
            </div>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              {isRTL ? "مدير المؤسسة" : "School Admin"}
            </span>
          </div>

          <div className="space-y-3.5 text-xs">
            {/* Manager Avatar Preview */}
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-white border border-slate-200 shadow-xs flex items-center justify-center shrink-0">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt={userFullName || "المدير"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-black text-slate-700 uppercase">
                    {userFullName ? userFullName.trim().charAt(0) : "م"}
                  </span>
                )}
              </div>
              <div>
                <p className="font-bold text-slate-900 text-xs">{userFullName || (isRTL ? "مدير المؤسسة" : "School Admin")}</p>
                <p className="text-[11px] text-slate-500">
                  {logoUrl
                    ? (isRTL ? "شعار المؤسسة معتمد كصورة لحساب المدير وبجانب اسم المركز" : "Logo active as manager picture and next to name")
                    : (isRTL ? "عند رفع شعار المؤسسة، سيظهر تلقائياً كصورة للمدير وبجانب اسم المركز" : "Logo will appear as manager picture once uploaded")}
                </p>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {isRTL ? "الاسم الكامل للمدير" : "Full Name"}
              </label>
              <input
                type="text"
                value={userFullName}
                onChange={(e) => setUserFullName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {isRTL ? "البريد الإلكتروني لتسجيل الدخول" : "Login Email"}
              </label>
              <input
                type="email"
                value={userEmail}
                disabled
                className="w-full bg-slate-100 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {isRTL ? "رقم الهاتف الشخصي" : "Personal Phone"}
              </label>
              <input
                type="text"
                value={userPhone}
                onChange={(e) => setUserPhone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none"
              />
            </div>

            <div className="pt-2 border-t">
              <label className="block font-bold text-slate-700 mb-1">
                {isRTL ? "تغيير كلمة المرور (اتركها فارغة للإبقاء على الحالية)" : "Change Password"}
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};
