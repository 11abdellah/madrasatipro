"use client";

import React, { useState, useEffect } from "react";
import { X, Check, ArrowRight, ArrowLeft, User, BookOpen, HeartHandshake, Wallet, CheckCircle2, AlertCircle, Loader2, CreditCard } from "lucide-react";
import { ALGERIAN_WILAYAS, DEFAULT_ACADEMIC_CYCLES, ACADEMIC_STREAMS } from "@/lib/constants/algeria";
import { Locale } from "@/types";

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  locale: Locale;
  onSave: (data: any) => void;
  onViewCard?: (studentId: string) => void;
}

export const AddStudentModal: React.FC<AddStudentModalProps> = ({
  isOpen,
  onClose,
  locale,
  onSave,
  onViewCard,
}) => {
  const isRTL = locale === "ar";
  const [currentStep, setCurrentStep] = useState(1);
  const [realGroups, setRealGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [createdStudent, setCreatedStudent] = useState<any | null>(null);

  // Form State
  const initialForm = {
    firstName: "",
    lastName: "",
    gender: "male",
    dateOfBirth: "",
    phone: "",
    email: "",
    wilayaCode: 19, // Sétif default
    address: "",
    academicLevel: "3AS",
    stream: "علوم تجريبية",
    groupId: "",
    parentName: "",
    parentPhone: "",
    parentRelationship: "الأب",
    registrationFee: 2000,
    monthlyFee: 4000,
    discount: 0,
    paymentMethod: "cash",
  };

  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    if (isOpen) {
      setErrorMsg("");
      setCurrentStep(1);
      fetch("/api/classes")
        .then((res) => res.json())
        .then((data) => {
          if (data.groups && Array.isArray(data.groups)) {
            setRealGroups(data.groups);
          }
        })
        .catch((err) => console.error("Error fetching class groups:", err));
    }
  }, [isOpen]);

  const steps = [
    { number: 1, title: isRTL ? "البيانات الشخصية" : "Personal", icon: User },
    { number: 2, title: isRTL ? "الدراسة والفوج" : "Academic", icon: BookOpen },
    { number: 3, title: isRTL ? "ولي الأمر" : "Parent", icon: HeartHandshake },
    { number: 4, title: isRTL ? "الاشتراك والرسوم" : "Financial", icon: Wallet },
    { number: 5, title: isRTL ? "التأكيد" : "Confirmation", icon: CheckCircle2 },
  ];

  const handleNext = () => {
    setErrorMsg("");
    if (currentStep === 1) {
      if (!formData.firstName.trim() || formData.firstName.trim().length < 2) {
        setErrorMsg("يرجى إدخال اسم الطالب (حرفين على الأقل)");
        return;
      }
      if (!formData.lastName.trim() || formData.lastName.trim().length < 2) {
        setErrorMsg("يرجى إدخال لقب الطالب (حرفين على الأقل)");
        return;
      }
    } else if (currentStep === 3) {
      if (!formData.parentName.trim() || formData.parentName.trim().length < 2) {
        setErrorMsg("يرجى إدخال اسم ولي الأمر الكامل");
        return;
      }
      const cleanPhone = formData.parentPhone.replace(/[\s-]/g, "");
      if (!cleanPhone || cleanPhone.length < 9) {
        setErrorMsg("يرجى إدخال رقم هاتف ولي الأمر (9 أرقام على الأقل)");
        return;
      }
    }

    if (currentStep < 5) setCurrentStep(currentStep + 1);
  };

  const handlePrev = () => {
    setErrorMsg("");
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleClose = () => {
    setErrorMsg("");
    setFormData(initialForm);
    setCreatedStudent(null);
    setCurrentStep(1);
    onClose();
  };

  const handleFinish = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          gender: formData.gender,
          dateOfBirth: formData.dateOfBirth || undefined,
          phone: formData.phone?.trim() || undefined,
          email: formData.email?.trim() || undefined,
          wilayaCode: formData.wilayaCode,
          address: formData.address?.trim() || undefined,
          academicLevel: formData.academicLevel,
          stream: formData.stream,
          groupId: formData.groupId || undefined,
          parentName: formData.parentName.trim(),
          parentPhone: formData.parentPhone.trim(),
          parentRelationship: formData.parentRelationship,
          monthlyFee: Number(formData.monthlyFee) || 0,
          registrationFee: Number(formData.registrationFee) || 0,
          discount: Number(formData.discount) || 0,
          paymentMethod: formData.paymentMethod,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "لم نتمكن من إضافة التلميذ. يرجى التحقق من البيانات والمحاولة مرة أخرى.");
      }

      onSave(data.student);
      setCreatedStudent(data.student);
    } catch (err: any) {
      setErrorMsg(err.message || "لم نتمكن من إضافة التلميذ. يرجى التحقق من البيانات والمحاولة مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-[32px] w-full max-w-2xl border border-slate-100 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Top Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {isRTL ? "إضافة طالب جديد للمؤسسة" : "Register New Student"}
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              {isRTL ? "الخطوة " + currentStep + " من 5" : "Step " + currentStep + " of 5"}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error Alert Banner */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        {createdStudent ? (
          <div className="p-8 text-center space-y-6 animate-in fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md shadow-emerald-500/10">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-xl font-black text-slate-900">تم تسجيل التلميذ بنجاح!</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                تم حفظ بيانات التلميذ وتوليد بطاقة المتمدرس الخاصة به بنجاح.
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 max-w-md mx-auto text-right space-y-2.5 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-200">
                <span className="text-slate-500 font-bold">اسم التلميذ:</span>
                <span className="font-black text-slate-900">
                  {createdStudent.firstName} {createdStudent.lastName}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200">
                <span className="text-slate-500 font-bold">رقم القيد / البطاقة:</span>
                <span className="font-mono font-black text-[#F47A3C] bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                  {createdStudent.studentNumber}
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500 font-bold">المستوى والفوج:</span>
                <span className="font-bold text-slate-800">
                  {createdStudent.academicLevel} • {createdStudent.groupName || "فوج عام"}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
              {onViewCard && (
                <button
                  type="button"
                  onClick={() => {
                    const sid = createdStudent.id;
                    handleClose();
                    onViewCard(sid);
                  }}
                  className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#18B89C] hover:bg-[#149B83] text-white text-xs font-black shadow-md shadow-teal-600/20 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>عرض بطاقة المتمدرس</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleClose}
                className="w-full sm:w-auto px-6 py-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
              >
                إغلاق وإنهاء
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Stepper Progress Bar */}
            <div className="px-6 pt-4 pb-2 border-b border-slate-100 flex items-center justify-between">
          {steps.map((step) => {
            const isCompleted = currentStep > step.number;
            const isCurrent = currentStep === step.number;
            const Icon = step.icon;

            return (
              <div key={step.number} className="flex flex-col items-center gap-1 flex-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isCompleted
                      ? "bg-emerald-500 text-white shadow-sm"
                      : isCurrent
                      ? "bg-slate-950 text-white shadow-md scale-105"
                      : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : <Icon className="w-3.5 h-3.5" />}
                </div>
                <span
                  className={`text-[10px] font-semibold text-center hidden sm:block ${
                    isCurrent ? "text-slate-900 font-bold" : "text-slate-400"
                  }`}
                >
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>

        {/* Modal Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 text-right rtl:text-right ltr:text-left">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-in fade-in">
              <h3 className="text-sm font-bold text-slate-900 border-b pb-2">
                {isRTL ? "المعلومات الشخصية للطالب" : "Personal Information"}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isRTL ? "الاسم" : "First Name"} *
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder={isRTL ? "مثال: أيوب" : "e.g. Ayoub"}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isRTL ? "اللقب" : "Last Name"} *
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    placeholder={isRTL ? "مثال: قرفي" : "e.g. Guerfi"}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isRTL ? "الجنس" : "Gender"}
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs"
                  >
                    <option value="male">{isRTL ? "ذكر" : "Male"}</option>
                    <option value="female">{isRTL ? "أنثى" : "Female"}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isRTL ? "تاريخ الميلاد" : "Date of Birth"}
                  </label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isRTL ? "رقم هاتف الطالب (اختياري)" : "Student Phone (Optional)"}
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="0550 00 00 00"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs"
                  />
                </div>

                {/* 58 Algerian Wilayas Dropdown */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isRTL ? "الولاية (58 ولاية)" : "Wilaya"} *
                  </label>
                  <select
                    value={formData.wilayaCode}
                    onChange={(e) => setFormData({ ...formData, wilayaCode: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs"
                  >
                    {ALGERIAN_WILAYAS.map((w) => (
                      <option key={w.code} value={w.code}>
                        {w.code} - {isRTL ? w.nameAr : w.nameFr}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Academic & Group Selection */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-in fade-in">
              <h3 className="text-sm font-bold text-slate-900 border-b pb-2">
                {isRTL ? "المعلومات الدراسية واختيار الفوج" : "Academic Group"}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isRTL ? "المستوى الدراسي" : "Academic Level"} *
                  </label>
                  <select
                    value={formData.academicLevel}
                    onChange={(e) => setFormData({ ...formData, academicLevel: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs"
                  >
                    <option value="3AS">{isRTL ? "3 ثانوي (BAC)" : "3AS (BAC)"}</option>
                    <option value="2AS">{isRTL ? "2 ثانوي" : "2AS"}</option>
                    <option value="1AS">{isRTL ? "1 ثانوي" : "1AS"}</option>
                    <option value="4AM">{isRTL ? "4 متوسط (BEM)" : "4AM (BEM)"}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isRTL ? "الشعبة (للثانوي)" : "Academic Stream"}
                  </label>
                  <select
                    value={formData.stream}
                    onChange={(e) => setFormData({ ...formData, stream: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs"
                  >
                    {ACADEMIC_STREAMS.map((s) => (
                      <option key={s.id} value={s.nameAr}>
                        {isRTL ? s.nameAr : s.nameFr}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isRTL ? "الفوج المتاح" : "Class Group"}
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {/* Option: Unassigned */}
                  <label
                    className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition ${
                      !formData.groupId || formData.groupId === ""
                        ? "border-indigo-600 bg-indigo-50/50 shadow-sm"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="groupId"
                        checked={!formData.groupId || formData.groupId === ""}
                        onChange={() => setFormData({ ...formData, groupId: "" })}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <div>
                        <p className="text-xs font-bold text-slate-900">
                          {isRTL ? "بدون فوج حالياً (تسجيل عام)" : "No group assigned yet"}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {isRTL ? "يمكن إلحاق الطالب بفوج دراسي لاحقاً" : "Assign group later"}
                        </p>
                      </div>
                    </div>
                  </label>

                  {/* Real Dynamic Groups */}
                  {realGroups.map((grp) => (
                    <label
                      key={grp.id}
                      className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition ${
                        formData.groupId === grp.id
                          ? "border-indigo-600 bg-indigo-50/50 shadow-sm"
                          : "border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="groupId"
                          checked={formData.groupId === grp.id}
                          onChange={() => setFormData({ ...formData, groupId: grp.id })}
                          className="text-indigo-600 focus:ring-indigo-500"
                        />
                        <div>
                          <p className="text-xs font-bold text-slate-900">{grp.name}</p>
                          <p className="text-[11px] text-slate-500">
                            {grp.teacher?.user?.fullName || grp.teacherName || (isRTL ? "أستاذ المادة" : "Teacher")} • {grp.subject?.nameAr || (isRTL ? "مادة دراسية" : "Subject")}
                          </p>
                        </div>
                      </div>
                      <span className="text-[11px] font-bold text-indigo-700 bg-indigo-100/70 px-2 py-0.5 rounded-full">
                        {grp.enrolledCount ?? grp._count?.enrollments ?? 0} / {grp.maxCapacity || 25} {isRTL ? "طالب" : "students"}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Parent Information */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-in fade-in">
              <h3 className="text-sm font-bold text-slate-900 border-b pb-2">
                {isRTL ? "معلومات ولي الأمر والتواصل" : "Parent Details"}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isRTL ? "اسم ولي الأمر" : "Parent Full Name"} *
                  </label>
                  <input
                    type="text"
                    value={formData.parentName}
                    onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                    placeholder={isRTL ? "مثال: كمال قرفي" : "e.g. Kamel Guerfi"}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isRTL ? "صلة القرابة" : "Relationship"}
                  </label>
                  <select
                    value={formData.parentRelationship}
                    onChange={(e) => setFormData({ ...formData, parentRelationship: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs"
                  >
                    <option value="الأب">{isRTL ? "الأب" : "Father"}</option>
                    <option value="الأم">{isRTL ? "الأم" : "Mother"}</option>
                    <option value="الولي الشرعي">{isRTL ? "الولي الشرعي" : "Legal Guardian"}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isRTL ? "رقم هاتف الولي (لتلقي إشعارات الحضور والغياب)" : "Parent Phone (SMS/WhatsApp)"} *
                </label>
                <input
                  type="tel"
                  value={formData.parentPhone}
                  onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                  placeholder="0660 00 00 00"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs"
                />
              </div>
            </div>
          )}

          {/* Step 4: Financial Fees & DZD */}
          {currentStep === 4 && (
            <div className="space-y-4 animate-in fade-in">
              <h3 className="text-sm font-bold text-slate-900 border-b pb-2">
                {isRTL ? "الرسوم المالية والاشتراك بالدينار الجزائري" : "Fees & Pricing"}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isRTL ? "رسوم التسجيل السنوية (دج)" : "Annual Registration Fee (DZD)"}
                  </label>
                  <input
                    type="number"
                    value={formData.registrationFee}
                    onChange={(e) => setFormData({ ...formData, registrationFee: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isRTL ? "الاشتراك الشهري (دج)" : "Monthly Fee (DZD)"}
                  </label>
                  <input
                    type="number"
                    value={formData.monthlyFee}
                    onChange={(e) => setFormData({ ...formData, monthlyFee: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isRTL ? "طريقة الدفع الأولية" : "Initial Payment Method"}
                  </label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs"
                  >
                    <option value="cash">{isRTL ? "نقدًا (Espèce)" : "Cash"}</option>
                    <option value="baridimob">{isRTL ? "بريدي موب (BaridiMob)" : "BaridiMob"}</option>
                    <option value="ccp">{isRTL ? "حوالة بريدية (CCP)" : "CCP"}</option>
                    <option value="bank_transfer">{isRTL ? "تحويل بنكي" : "Bank Transfer"}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isRTL ? "قيمة الخصم (دج إن وجد)" : "Discount (DZD)"}
                  </label>
                  <input
                    type="number"
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Summary & Confirmation */}
          {currentStep === 5 && (
            <div className="space-y-4 animate-in fade-in">
              <h3 className="text-sm font-bold text-slate-900 border-b pb-2">
                {isRTL ? "تأكيد معلومات التسجيل" : "Review Registration"}
              </h3>

              <div className="bg-slate-50 rounded-2xl p-4 space-y-2 text-xs border border-slate-100">
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">{isRTL ? "الطالب:" : "Student:"}</span>
                  <span className="font-bold text-slate-900">
                    {formData.firstName || "محمد"} {formData.lastName || "قرفي"}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">{isRTL ? "المستوى والفوج:" : "Level & Group:"}</span>
                  <span className="font-bold text-slate-900">{formData.academicLevel} - {formData.stream}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">{isRTL ? "الولي ورقم الهاتف:" : "Parent:"}</span>
                  <span className="font-bold text-slate-900">{formData.parentName || "كمال"} ({formData.parentPhone || "0660..."})</span>
                </div>
                <div className="flex justify-between py-1 text-indigo-700 font-bold">
                  <span>{isRTL ? "المبلغ المستحق الأول:" : "Initial Due:"}</span>
                  <span>{formData.monthlyFee + formData.registrationFee - formData.discount} دج</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
          {currentStep > 1 ? (
            <button
              onClick={handlePrev}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
            >
              {isRTL ? <ArrowRight className="w-3.5 h-3.5" /> : <ArrowLeft className="w-3.5 h-3.5" />}
              <span>{isRTL ? "السابق" : "Back"}</span>
            </button>
          ) : (
            <div />
          )}

          {currentStep < 5 ? (
            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-slate-950 text-white hover:bg-slate-800 text-xs font-bold shadow-md transition"
            >
              <span>{isRTL ? "التالي" : "Continue"}</span>
              {isRTL ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
            </button>
          ) : (
            <button
              onClick={handleFinish}
              disabled={loading}
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{isRTL ? "جارٍ حفظ الطالب..." : "Saving Student..."}</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>{isRTL ? "إتمام التسجيل وحفظ الطالب" : "Complete Registration"}</span>
                </>
              )}
            </button>
          )}
        </div>
          </>
        )}
      </div>
    </div>
  );
};
