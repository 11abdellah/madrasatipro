"use client";

import React, { useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Locale } from "@/types";

interface ArchiveTeacherDialogProps {
  isOpen: boolean;
  teacher: any | null;
  onClose: () => void;
  locale: Locale;
  onTeacherArchived: (id: string) => void;
}

export const ArchiveTeacherDialog: React.FC<ArchiveTeacherDialogProps> = ({
  isOpen,
  teacher,
  onClose,
  locale,
  onTeacherArchived,
}) => {
  const isRTL = locale === "ar";
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen || !teacher) return null;

  const handleArchive = async () => {
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch(`/api/teachers/${teacher.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "تعذر أرشفة الأستاذ");
      }

      onTeacherArchived(teacher.id);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "حدث خطأ أثناء أرشفة الأستاذ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-[32px] w-full max-w-md border border-slate-100 shadow-2xl p-6 space-y-4 text-right rtl:text-right ltr:text-left">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-2">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <div className="text-center space-y-1">
          <h3 className="text-base font-extrabold text-slate-900">
            {isRTL ? "هل أنت متأكد من أرشفة هذا الأستاذ؟" : "Archive Teacher?"}
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            {isRTL
              ? `سيتم نقل الأستاذ "${teacher.fullName}" إلى الأرشيف ولن يظهر في قائمة التدريس النشطة مع الاحتفاظ بسجل الحصص والأتعاب السابقة.`
              : `Teacher "${teacher.fullName}" will be archived and hidden from active lists while preserving historical data.`}
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold text-center">
            {errorMsg}
          </div>
        )}

        <div className="pt-3 border-t flex items-center justify-between gap-3">
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="flex-1 py-2.5 rounded-full border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
          >
            {isRTL ? "إلغاء" : "Cancel"}
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={handleArchive}
            className="flex-1 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md shadow-rose-600/20"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>{isRTL ? "جاري الأرشفة..." : "Archiving..."}</span>
              </>
            ) : (
              <span>{isRTL ? "تأكيد الأرشفة" : "Confirm Archive"}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
