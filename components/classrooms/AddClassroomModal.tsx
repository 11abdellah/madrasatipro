"use client";

import React, { useState } from "react";
import { X, DoorOpen, Users, Hash, FileText, Loader2 } from "lucide-react";
import { Locale } from "@/types";

interface AddClassroomModalProps {
  isOpen: boolean;
  onClose: () => void;
  locale: Locale;
  onClassroomCreated: (classroom: any) => void;
}

export const AddClassroomModal: React.FC<AddClassroomModalProps> = ({
  isOpen,
  onClose,
  locale,
  onClassroomCreated,
}) => {
  const isRTL = locale === "ar";
  const [name, setName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [capacity, setCapacity] = useState("25");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg(isRTL ? "يرجى كتابة اسم القاعة" : "Classroom name is required");
      return;
    }

    const numCap = parseInt(capacity, 10);
    if (isNaN(numCap) || numCap <= 0) {
      setErrorMsg(isRTL ? "السعة يجب أن تكون رقماً أكبر من الصفر" : "Capacity must be greater than 0");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/classrooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          roomCode: roomCode.trim() || undefined,
          capacity: numCap,
          description: description.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "فشل إنشاء القاعة");
      }

      onClassroomCreated(data.classroom);
      // Reset form
      setName("");
      setRoomCode("");
      setCapacity("25");
      setDescription("");
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "حدث خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 space-y-5 text-right rtl:text-right ltr:text-left">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-50 border border-orange-100 text-[#F47A3C] flex items-center justify-center">
              <DoorOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                {isRTL ? "إضافة قاعة تدريس جديدة" : "Add New Classroom"}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {isRTL
                  ? "تسجيل قاعة أو فضاء تعليمي جديد لربطه بالحصص وتفادي التضارب"
                  : "Register a teaching space to assign to schedules without conflicts"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
              {isRTL ? "اسم القاعة الدراسية" : "Classroom Name"} *
            </label>
            <div className="relative">
              <DoorOpen className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={isRTL ? "مثال: قاعة 01 أو قاعة ابن خلدون أو المدرج A" : "e.g. Room 01, Lab B..."}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-10 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#F47A3C] focus:bg-white transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                {isRTL ? "رمز / رقم القاعة (اختياري)" : "Room Code / Number"}
              </label>
              <div className="relative">
                <Hash className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value)}
                  placeholder={isRTL ? "مثال: ق-01 أو R102" : "e.g. R01, 102"}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-10 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#F47A3C] focus:bg-white transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                {isRTL ? "السعة الاستيعابية (عدد المقاعد)" : "Capacity (Seats)"} *
              </label>
              <div className="relative">
                <Users className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  required
                  min="1"
                  max="500"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  placeholder="25"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-10 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#F47A3C] focus:bg-white transition"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
              {isRTL ? "الوصف والتجهيزات المتوفرة (اختياري)" : "Description & Equipment"}
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={isRTL ? "مثال: مجهزة بجهاز عرض داتاشو، سبورة ذكية، ومكيف هواء..." : "e.g. Equipped with projector and AC..."}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-10 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#F47A3C] focus:bg-white transition resize-none"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold transition"
            >
              {isRTL ? "إلغاء" : "Cancel"}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-extrabold flex items-center gap-2 shadow-md transition active:scale-95 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <DoorOpen className="w-4 h-4 text-[#F47A3C]" />}
              <span>{isRTL ? "حفظ وتثبيت القاعة" : "Save Classroom"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
