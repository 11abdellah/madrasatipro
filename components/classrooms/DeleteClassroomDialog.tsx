"use client";

import React, { useState } from "react";
import { AlertTriangle, Trash2, X, Loader2, Calendar, Layers } from "lucide-react";
import { Locale } from "@/types";

interface DeleteClassroomDialogProps {
  classroom: any | null;
  isOpen: boolean;
  onClose: () => void;
  locale: Locale;
  onClassroomDeleted: (id: string) => void;
}

export const DeleteClassroomDialog: React.FC<DeleteClassroomDialogProps> = ({
  classroom,
  isOpen,
  onClose,
  locale,
  onClassroomDeleted,
}) => {
  const isRTL = locale === "ar";
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen || !classroom) return null;

  const hasUsage = (classroom.sessionsCount > 0) || (classroom.groupsCount > 0);

  const handleDelete = async () => {
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch(`/api/classrooms/${classroom.id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "فشل حذف القاعة");
      }

      onClassroomDeleted(classroom.id);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "حدث خطأ أثناء محاولة الحذف");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 space-y-4 text-center">
        {/* Warning Icon */}
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto ${
          hasUsage ? "bg-amber-50 text-amber-600 border border-amber-200" : "bg-rose-50 text-rose-600 border border-rose-200"
        }`}>
          <AlertTriangle className="w-7 h-7" />
        </div>

        <div>
          <h3 className="text-base font-extrabold text-slate-900">
            {isRTL ? "تأكيد حذف القاعة الدراسية" : "Delete Classroom"}
          </h3>
          <p className="text-xs text-slate-600 mt-1 font-bold">
            «{classroom.name}» {classroom.roomCode ? `(${classroom.roomCode})` : ""}
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold text-right rtl:text-right ltr:text-left">
            {errorMsg}
          </div>
        )}

        {hasUsage ? (
          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-right space-y-2 text-xs text-amber-900">
            <p className="font-bold flex items-center gap-1.5 text-amber-800">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>لا يمكن حذف هذه القاعة حالياً:</span>
            </p>
            <p className="text-[11px] leading-relaxed text-amber-800">
              هذه القاعة مرتبطة بـ <strong className="font-extrabold">{classroom.sessionsCount} حصة مجدولة</strong> و <strong className="font-extrabold">{classroom.groupsCount} فوج دراسي</strong>.
            </p>
            <p className="text-[11px] text-amber-700 leading-relaxed">
              لحماية السجلات التاريخية للجدول، يرجى إعادة تعيين أو نقل الحصص والأفواج المرتبطة بهذه القاعة أولاً لتتمكن من حذفها.
            </p>
          </div>
        ) : (
          <p className="text-xs text-slate-500 leading-relaxed">
            {isRTL
              ? "هل أنت متأكد من رغبتك في حذف هذه القاعة الدراسية؟ سيتم إزالتها نهائياً من قائمة القاعات المتاحة."
              : "Are you sure you want to permanently delete this classroom?"}
          </p>
        )}

        <div className="flex items-center justify-center gap-2.5 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition"
          >
            {isRTL ? "إلغاء" : "Cancel"}
          </button>
          {!hasUsage && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-sm transition active:scale-95 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              <span>{isRTL ? "نعم، حذف القاعة" : "Yes, Delete"}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
