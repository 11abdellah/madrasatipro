"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Calendar,
  Clock,
  DollarSign,
  Loader2,
  Trash2,
  Edit2,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
} from "lucide-react";
import { formatDZD } from "@/lib/utils";
import { Locale } from "@/types";

interface HoursHistoryModalProps {
  teacher: any | null;
  isOpen: boolean;
  onClose: () => void;
  locale: Locale;
  onOpenRecordHours?: () => void;
  onHoursUpdated?: () => void;
}

export const HoursHistoryModal: React.FC<HoursHistoryModalProps> = ({
  teacher,
  isOpen,
  onClose,
  locale,
  onOpenRecordHours,
  onHoursUpdated,
}) => {
  const isRTL = locale === "ar";
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any>({
    monthlyManualHours: 0,
    monthlyManualTotalDue: 0,
    totalLogsCount: 0,
  });

  // Edit State
  const [editingLog, setEditingLog] = useState<any | null>(null);
  const [editWorkDate, setEditWorkDate] = useState("");
  const [editHours, setEditHours] = useState("");
  const [editHourlyRate, setEditHourlyRate] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState("");

  // Delete State
  const [deletingLog, setDeletingLog] = useState<any | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchHours = async () => {
    if (!teacher) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/teachers/${teacher.id}/hours`);
      const data = await res.json();
      if (data.logs) {
        setLogs(data.logs);
      }
      if (data.summary) {
        setSummary(data.summary);
      }
    } catch (err) {
      console.error("Failed to load hours history:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && teacher) {
      fetchHours();
      setEditingLog(null);
      setDeletingLog(null);
      setConfirmDelete(false);
    }
  }, [isOpen, teacher]);

  const startEdit = (log: any) => {
    setEditingLog(log);
    setEditWorkDate(log.workDate || "");
    setEditHours(String(log.hours || ""));
    setEditHourlyRate(String(log.hourlyRate || teacher?.hourlyRate || ""));
    setEditNotes(log.notes || "");
    setEditError("");
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLog || !teacher) return;

    const numHours = parseFloat(editHours);
    const numRate = parseFloat(editHourlyRate);

    if (!editWorkDate || isNaN(numHours) || numHours <= 0) {
      setEditError(isRTL ? "يرجى إدخال تاريخ صالح وساعات أكبر من 0" : "Please enter a valid date and hours > 0");
      return;
    }

    setSavingEdit(true);
    setEditError("");

    try {
      const res = await fetch(`/api/teachers/${teacher.id}/hours`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          logId: editingLog.id,
          workDate: editWorkDate,
          hours: numHours,
          hourlyRate: isNaN(numRate) ? editingLog.hourlyRate : numRate,
          notes: editNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update log");
      }

      setEditingLog(null);
      await fetchHours();
      onHoursUpdated?.();
    } catch (err: any) {
      setEditError(err.message || "حدث خطأ أثناء تعديل السجل");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingLog || !teacher) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/teachers/${teacher.id}/hours?logId=${deletingLog.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete log");
      }
      setDeletingLog(null);
      setConfirmDelete(false);
      await fetchHours();
      onHoursUpdated?.();
    } catch (err: any) {
      alert(err.message || "حدث خطأ أثناء حذف السجل");
    } finally {
      setDeleting(false);
    }
  };

  if (!isOpen || !teacher) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-150 p-6 space-y-4 flex flex-col max-h-[90vh] text-right rtl:text-right ltr:text-left">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">
              {isRTL ? "سجل الساعات المسجلة للأستاذ" : "Teaching Hours History"}
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

        {/* Top Summary Banner */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-[10px] text-slate-500 font-bold block">
                {isRTL ? "إجمالي الساعات المسجلة هذا الشهر" : "Manual Hours This Month"}
              </span>
              <span className="text-base font-black text-indigo-700">
                {summary.monthlyManualHours} {isRTL ? "ساعة" : "hrs"}
              </span>
            </div>
            <div className="h-7 w-[1px] bg-slate-200" />
            <div>
              <span className="text-[10px] text-slate-500 font-bold block">
                {isRTL ? "المستحق عن الساعات هذا الشهر" : "Total Amount Due"}
              </span>
              <span className="text-base font-black text-slate-900">
                {formatDZD(summary.monthlyManualTotalDue, locale)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchHours}
              className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 transition"
              title={isRTL ? "تحديث السجل" : "Refresh"}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            </button>
            {onOpenRecordHours && (
              <button
                onClick={() => {
                  onClose();
                  onOpenRecordHours();
                }}
                className="px-4 py-2 rounded-xl text-xs font-extrabold bg-slate-950 text-white hover:bg-slate-800 transition active:scale-95 shadow-sm"
              >
                {isRTL ? "+ تسجيل ساعات جديدة" : "+ Log Hours"}
              </button>
            )}
          </div>
        </div>

        {/* History Table */}
        <div className="flex-1 overflow-y-auto min-h-[240px]">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-2">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
              <p className="text-xs text-slate-400 font-bold">{isRTL ? "جاري تحميل السجل..." : "Loading history..."}</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <Clock className="w-8 h-8 text-slate-300 mx-auto" />
              <h4 className="text-xs font-bold text-slate-700">{isRTL ? "لا توجد ساعات مسجلة يدوياً حتى الآن" : "No hours logged yet"}</h4>
              <p className="text-[11px] text-slate-400">
                {isRTL ? "اضغط على زر '+ تسجيل ساعات جديدة' لتسجيل حصص التدريس الفعلية." : "Click '+ Log Hours' to record teaching hours."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-bold text-[11px] bg-slate-50/50">
                    <th className="py-2.5 px-3">{isRTL ? "التاريخ" : "Date"}</th>
                    <th className="py-2.5 px-3">{isRTL ? "الفوج / المادة" : "Group / Subject"}</th>
                    <th className="py-2.5 px-3">{isRTL ? "الساعات" : "Hours"}</th>
                    <th className="py-2.5 px-3">{isRTL ? "سعر الساعة" : "Rate"}</th>
                    <th className="py-2.5 px-3">{isRTL ? "المبلغ المحسوب" : "Total"}</th>
                    <th className="py-2.5 px-3">{isRTL ? "ملاحظة" : "Notes"}</th>
                    <th className="py-2.5 px-3 text-center">{isRTL ? "الإجراءات" : "Actions"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-2.5 px-3 font-bold text-slate-800">
                        {log.workDate}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">
                        <div className="flex flex-col gap-0.5">
                          {log.groupName !== "—" && (
                            <span className="font-bold text-slate-800 text-[11px]">
                              {log.groupName}
                            </span>
                          )}
                          {log.subjectName !== "—" && (
                            <span className="text-[10px] text-indigo-600 font-medium">
                              {log.subjectName}
                            </span>
                          )}
                          {log.groupName === "—" && log.subjectName === "—" && "—"}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 font-extrabold text-indigo-700">
                        {log.hours} {isRTL ? "س" : "h"}
                      </td>
                      <td className="py-2.5 px-3 text-slate-700 font-medium">
                        {log.hourlyRate} دج
                      </td>
                      <td className="py-2.5 px-3 font-black text-slate-900">
                        {formatDZD(log.totalAmount, locale)}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 max-w-[140px] truncate" title={log.notes}>
                        {log.notes || "—"}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => startEdit(log)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition"
                            title={isRTL ? "تعديل السجل" : "Edit Log"}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setDeletingLog(log);
                              setConfirmDelete(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                            title={isRTL ? "حذف السجل" : "Delete Log"}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-400 font-medium">
            {isRTL ? `إجمالي السجلات: ${logs.length}` : `Total records: ${logs.length}`}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
          >
            {isRTL ? "إغلاق" : "Close"}
          </button>
        </div>
      </div>

      {/* Edit Log Sub-Modal */}
      {editingLog && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-5 border border-slate-200 shadow-2xl space-y-4 text-right rtl:text-right ltr:text-left">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="text-sm font-extrabold text-slate-900">
                {isRTL ? "تعديل سجل ساعات العمل" : "Edit Hours Entry"}
              </h4>
              <button
                onClick={() => setEditingLog(null)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {editError && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
                {editError}
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  {isRTL ? "تاريخ الحصة" : "Date"} *
                </label>
                <input
                  type="date"
                  value={editWorkDate}
                  onChange={(e) => setEditWorkDate(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    {isRTL ? "عدد الساعات" : "Hours"} *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.25"
                    max="24"
                    value={editHours}
                    onChange={(e) => setEditHours(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    {isRTL ? "سعر الساعة (دج)" : "Hourly Rate (DZD)"} *
                  </label>
                  <input
                    type="number"
                    step="50"
                    min="0"
                    value={editHourlyRate}
                    onChange={(e) => setEditHourlyRate(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Calculated Preview */}
              <div className="bg-indigo-50/70 p-2.5 rounded-xl border border-indigo-100 flex items-center justify-between text-xs">
                <span className="text-slate-600 font-bold">{isRTL ? "المبلغ الإجمالي المحسوب:" : "Total Calculated:"}</span>
                <span className="font-black text-indigo-700">
                  {formatDZD((parseFloat(editHours) || 0) * (parseFloat(editHourlyRate) || 0), locale)}
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  {isRTL ? "ملاحظات وتفاصيل إضافية" : "Notes"}
                </label>
                <input
                  type="text"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder={isRTL ? "مثال: حصة تعويضية أو مراجعة نهائية..." : "e.g., makeup session..."}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingLog(null)}
                  disabled={savingEdit}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50"
                >
                  {isRTL ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold flex items-center gap-1.5 shadow-sm active:scale-95 transition"
                >
                  {savingEdit ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>{isRTL ? "حفظ التعديل" : "Save Changes"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {confirmDelete && deletingLog && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 border border-slate-200 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-slate-900">
                {isRTL ? "تأكيد حذف سجل الساعات" : "Confirm Delete Hours Log"}
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                {isRTL
                  ? `هل أنت متأكد من حذف حصة ${deletingLog.workDate} (${deletingLog.hours} ساعات) بقيمة ${formatDZD(deletingLog.totalAmount, locale)}؟ سيتم خصم هذا المبلغ من مستحقات الأستاذ فوراً.`
                  : `Are you sure you want to delete this log (${deletingLog.hours} hrs)?`}
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setConfirmDelete(false);
                  setDeletingLog(null);
                }}
                disabled={deleting}
                className="flex-1 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                {isRTL ? "إلغاء" : "Cancel"}
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-extrabold text-white flex items-center justify-center gap-1 shadow-sm transition active:scale-95"
              >
                {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>{isRTL ? "نعم، حذف السجل" : "Yes, Delete"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
