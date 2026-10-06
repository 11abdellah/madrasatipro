"use client";

import React, { useState, useEffect } from "react";
import { X, DoorOpen, Users, Hash, FileText, Loader2, Save } from "lucide-react";
import { Locale } from "@/types";

interface EditClassroomModalProps {
  classroom: any | null;
  isOpen: boolean;
  onClose: () => void;
  locale: Locale;
  onClassroomUpdated: (classroom: any) => void;
}

export const EditClassroomModal: React.FC<EditClassroomModalProps> = ({
  classroom,
  isOpen,
  onClose,
  locale,
  onClassroomUpdated,
}) => {
  const isRTL = locale === "ar";
  const [name, setName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [capacity, setCapacity] = useState("25");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (classroom) {
      setName(classroom.name || "");
      setRoomCode(classroom.roomCode || "");
      setCapacity(String(classroom.capacity || "25"));
      setDescription(classroom.description || "");
      setErrorMsg("");
    }
  }, [classroom]);

  if (!isOpen || !classroom) return null;

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
      const res = await fetch(`/api/classrooms/${classroom.id}`, {
        method: "PATCH",
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
        throw new Error(data.error || "فشل تعديل القاعة");
      }

      onClassroomUpdated(data.classroom);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "حدث خطأ أثناء تعديل بيانات القاعة");
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
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
              <DoorOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                {isRTL ? "تعديل بيانات القاعة" : "Edit Classroom"}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {classroom.name} {classroom.roomCode ? `(${classroom.roomCode})` : ""}
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
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-10 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                {isRTL ? "رمز / رقم القاعة" : "Room Code / Number"}
              </label>
              <div className="relative">
                <Hash className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-10 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                {isRTL ? "السعة الاستيعابية (مقاعد)" : "Capacity (Seats)"} *
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-10 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
              {isRTL ? "الوصف والتجهيزات" : "Description"}
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-10 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition resize-none"
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
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold flex items-center gap-2 shadow-md transition active:scale-95 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{isRTL ? "تحديث التعديلات" : "Update Changes"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
