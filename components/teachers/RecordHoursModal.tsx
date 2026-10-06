"use client";

import React, { useState, useEffect } from "react";
import { X, Check, Clock, Calendar, AlertCircle, Loader2, DollarSign } from "lucide-react";
import { formatDZD, getAlgiersTodayStr } from "@/lib/utils";
import { Locale } from "@/types";

interface RecordHoursModalProps {
  teacher: any | null;
  isOpen: boolean;
  onClose: () => void;
  locale: Locale;
  onHoursRecorded: () => void;
}

export const RecordHoursModal: React.FC<RecordHoursModalProps> = ({
  teacher,
  isOpen,
  onClose,
  locale,
  onHoursRecorded,
}) => {
  const isRTL = locale === "ar";
  const [workDate, setWorkDate] = useState<string>(getAlgiersTodayStr());
  const [hours, setHours] = useState<number | "">(2);
  const [hourlyRate, setHourlyRate] = useState<number>(2000);
  const [groupId, setGroupId] = useState<string>("");
  const [subjectId, setSubjectId] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [availableGroups, setAvailableGroups] = useState<any[]>([]);
  const [availableSubjects, setAvailableSubjects] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen && teacher) {
      setWorkDate(getAlgiersTodayStr());
      setHours(2);
      setHourlyRate(teacher.hourlyRate || 2000);
      setNotes("");
      setErrorMsg("");
      setGroupId("");
      setSubjectId("");

      // Fetch teacher's groups and subjects
      fetch("/api/classes")
        .then((res) => res.json())
        .then((data) => {
          if (data.groups) {
            const filtered = data.groups.filter((g: any) => g.teacherId === teacher.id);
            setAvailableGroups(filtered.length > 0 ? filtered : data.groups);
            if (filtered[0]) {
              setGroupId(filtered[0].id);
              if (filtered[0].subjectId) setSubjectId(filtered[0].subjectId);
            }
          }
          if (data.metadata?.subjects) {
            setAvailableSubjects(data.metadata.subjects);
          }
        })
        .catch((e) => console.error("Failed to load groups/subjects:", e));
    }
  }, [isOpen, teacher]);

  if (!isOpen || !teacher) return null;

  const numHours = typeof hours === "number" ? hours : 0;
  const calculatedTotal = Math.round(numHours * hourlyRate);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!numHours || numHours <= 0) {
      setErrorMsg(isRTL ? "يرجى إدخال عدد ساعات صحيح أكبر من الصفر" : "Hours must be greater than zero");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/teachers/${teacher.id}/hours`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workDate,
          hours: numHours,
          hourlyRate,
          groupId: groupId || undefined,
          subjectId: subjectId || undefined,
          notes: notes || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "تعذر تسجيل الساعات");
      }

      onHoursRecorded();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "حدث خطأ أثناء تسجيل الساعات");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 space-y-4 text-right rtl:text-right ltr:text-left">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">
              {isRTL ? "+ تسجيل ساعات عمل إضافية / يدوية" : "+ Log Teaching Hours"}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {teacher.fullName} ({teacher.specialization || "هيئة التدريس"})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Calculation Preview Box */}
        <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
          <div>
            <span className="text-[10px] text-slate-500 block">{isRTL ? "عدد الساعات" : "Hours"}</span>
            <span className="font-extrabold text-slate-900">{numHours} س</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block">{isRTL ? "سعر الساعة" : "Rate/Hr"}</span>
            <span className="font-extrabold text-slate-900">{hourlyRate} دج</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block">{isRTL ? "المبلغ المحسوب" : "Total"}</span>
            <span className="font-extrabold text-indigo-700">{formatDZD(calculatedTotal, locale)}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {isRTL ? "التاريخ *" : "Date *"}
              </label>
              <input
                type="date"
                required
                value={workDate}
                onChange={(e) => setWorkDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {isRTL ? "عدد الساعات *" : "Hours *"}
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                required
                value={hours}
                onChange={(e) => setHours(e.target.value === "" ? "" : Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500"
                placeholder="2"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {isRTL ? "سعر الساعة (دج) *" : "Hourly Rate (DZD) *"}
              </label>
              <input
                type="number"
                min="0"
                required
                value={hourlyRate}
                onChange={(e) => setHourlyRate(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {isRTL ? "الفوج الدراسي (اختياري)" : "Group (Optional)"}
              </label>
              <select
                value={groupId}
                onChange={(e) => {
                  setGroupId(e.target.value);
                  const grp = availableGroups.find((g) => g.id === e.target.value);
                  if (grp?.subjectId) setSubjectId(grp.subjectId);
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">{isRTL ? "بدون فوج محدد" : "None"}</option>
                {availableGroups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              {isRTL ? "المادة الدراسية (اختياري)" : "Subject (Optional)"}
            </label>
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">{isRTL ? "-- بدون مادة محددة --" : "-- None --"}</option>
              {availableSubjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nameAr}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              {isRTL ? "ملاحظات إضافية (اختياري)" : "Notes (Optional)"}
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={isRTL ? "مثال: حصة تعويضية، مراجعة مكثفة..." : "e.g. Extra revision session"}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              {isRTL ? "إلغاء" : "Cancel"}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl font-bold bg-slate-950 hover:bg-slate-800 text-white shadow-sm flex items-center gap-1.5 transition-all disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{isRTL ? "جاري التسجيل..." : "Saving..."}</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>{isRTL ? "تأكيد تسجيل الساعات" : "Confirm Hours"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
