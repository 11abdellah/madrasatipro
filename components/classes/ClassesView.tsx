"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Users,
  Clock,
  MapPin,
  BookOpen,
  Layers,
  CheckCircle2,
  X,
  AlertTriangle,
  Sparkles,
  Edit2,
  Trash2,
  Loader2,
} from "lucide-react";
import { formatDZD } from "@/lib/utils";
import { Locale } from "@/types";

interface ClassesViewProps {
  locale: Locale;
  onNavigateToAttendance?: (groupId: string) => void;
  onNavigateToTimetable?: () => void;
}

export const ClassesView: React.FC<ClassesViewProps> = ({
  locale,
  onNavigateToAttendance,
  onNavigateToTimetable,
}) => {
  const isRTL = locale === "ar";
  const [groups, setGroups] = useState<any[]>([]);
  const [metadata, setMetadata] = useState<{ teachers: any[]; subjects: any[]; classrooms: any[] }>({
    teachers: [],
    subjects: [],
    classrooms: [],
  });
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isAddGroupOpen, setIsAddGroupOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [toastMsg, setToastMsg] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    academicLevel: "3AS",
    stream: "علوم تجريبية",
    subjectId: "",
    teacherId: "",
    classroomId: "",
    maxCapacity: 20,
    monthlyFee: 4000,
    startTime: "08:30",
    endTime: "10:00",
  });

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/classes");
      const data = await res.json();
      if (data.groups) {
        setGroups(data.groups);
      }
      if (data.metadata) {
        setMetadata(data.metadata);
        if (data.metadata.subjects?.[0] && !formData.subjectId) {
          setFormData((prev) => ({
            ...prev,
            subjectId: data.metadata.subjects[0].id,
            teacherId: data.metadata.teachers?.[0]?.id || "",
            classroomId: data.metadata.classrooms?.[0]?.id || "",
          }));
        }
      }
    } catch (err) {
      console.error("Failed to load classes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "تعذر إنشاء الفوج");
      }

      setIsAddGroupOpen(false);
      setToastMsg(isRTL ? "✓ تم إنشاء الفوج الدراسي بنجاح" : "✓ Group created successfully");
      setTimeout(() => setToastMsg(""), 3500);
      fetchGroups();
    } catch (err: any) {
      setErrorMessage(err.message || "حدث خطأ أثناء حفظ الفوج");
    } finally {
      setSaving(false);
    }
  };

  const [editingGroup, setEditingGroup] = useState<any | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    academicLevel: "3AS",
    stream: "علوم تجريبية",
    subjectId: "",
    teacherId: "",
    classroomId: "",
    maxCapacity: 20,
    monthlyFee: 4000,
    startTime: "08:30",
    endTime: "10:00",
  });
  const [editSaving, setEditSaving] = useState(false);
  const [editErrorMessage, setEditErrorMessage] = useState("");

  const [deletingGroup, setDeletingGroup] = useState<any | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleOpenEdit = (group: any) => {
    setEditingGroup(group);
    setEditErrorMessage("");
    const parts = (group.scheduleDesc || "08:30 - 10:00").split(" - ");
    setEditFormData({
      name: group.name,
      academicLevel: group.academicLevel || "3AS",
      stream: group.stream || "",
      subjectId: group.subjectId || "",
      teacherId: group.teacherId || "",
      classroomId: group.classroomId || "",
      maxCapacity: group.maxCapacity || 20,
      monthlyFee: group.monthlyFee || 4000,
      startTime: parts[0]?.trim() || "08:30",
      endTime: parts[1]?.trim() || "10:00",
    });
  };

  const handleUpdateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGroup) return;
    setEditSaving(true);
    setEditErrorMessage("");
    try {
      const res = await fetch(`/api/classes/${editingGroup.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editFormData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "تعذر تحديث الفوج");
      setEditingGroup(null);
      setToastMsg(isRTL ? "✓ تم تحديث بيانات الفوج بنجاح" : "✓ Group updated successfully");
      setTimeout(() => setToastMsg(""), 3500);
      fetchGroups();
    } catch (err: any) {
      setEditErrorMessage(err.message || "حدث خطأ أثناء تحديث الفوج");
    } finally {
      setEditSaving(false);
    }
  };

  const handleDeleteGroup = async () => {
    if (!deletingGroup) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/classes/${deletingGroup.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "تعذر حذف الفوج");
      setDeletingGroup(null);
      setToastMsg(isRTL ? "✓ تم حذف الفوج وجميع بياناته المرتبطة بأمان" : "✓ Group deleted safely");
      setTimeout(() => setToastMsg(""), 3500);
      fetchGroups();
    } catch (err: any) {
      alert(err.message || "تعذر حذف الفوج");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Toast */}
      {toastMsg && (
        <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {isRTL ? "الأقسام والأفواج الدراسية" : "Classes & Groups"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            {isRTL
              ? "تنظيم الأفواج، السعة الاستيعابية، القاعات، والاشتراكات الشهرية"
              : "Organize student groups, classroom capacities, and monthly fees"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onNavigateToTimetable}
            className="flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 px-4 py-2.5 rounded-full text-xs font-bold shadow-sm transition"
          >
            <Clock className="w-4 h-4 text-indigo-600" />
            <span>{isRTL ? "عرض الجدول الأسبوعي" : "Weekly Timetable"}</span>
          </button>

          <button
            onClick={() => {
              setErrorMessage("");
              setIsAddGroupOpen(true);
            }}
            className="flex items-center gap-2 bg-slate-950 hover:bg-slate-800 text-white px-4 py-2.5 rounded-full text-xs font-bold shadow-md transition"
          >
            <Plus className="w-4 h-4" />
            <span>{isRTL ? "إنشاء فوج جديد" : "Create Group"}</span>
          </button>
        </div>
      </div>

      {/* Class Groups Grid */}
      {loading ? (
        <div className="text-center py-16 bg-white rounded-[28px] border border-slate-100 text-slate-400 text-xs">
          {isRTL ? "جاري تحميل الأفواج الدراسية..." : "Loading groups..."}
        </div>
      ) : groups.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-[28px] border border-slate-100 space-y-3">
          <Layers className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-700">
            {isRTL ? "لا توجد أفواج دراسية مسجلة حالياً" : "No class groups found"}
          </h3>
          <p className="text-xs text-slate-400">
            {isRTL ? "اضغط على زر 'إنشاء فوج جديد' لإضافة أول فوج" : "Click 'Create Group' to add your first group"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5">
          {groups.map((group) => {
            const occupancyRate = Math.round((group.studentsCount / group.maxCapacity) * 100);

            return (
              <div
                key={group.id}
                className="bg-white rounded-[28px] p-6 border border-slate-100 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.03)] hover:shadow-md transition space-y-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="text-xs font-bold px-3 py-1 rounded-full text-white"
                      style={{ backgroundColor: group.subjectColor || "#6366F1" }}
                    >
                      {group.subjectName}
                    </span>
                    <span className="text-xs font-extrabold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full">
                      {group.academicLevel} {group.stream ? `— ${group.stream}` : ""}
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-slate-900 mt-2">
                    {group.name}
                  </h3>

                  <div className="grid grid-cols-2 gap-3 mt-4 text-xs">
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100/80">
                      <span className="text-slate-400 block text-[10px] font-bold">
                        {isRTL ? "الأستاذ المشرف" : "Teacher"}
                      </span>
                      <span className="font-bold text-slate-800">{group.teacherName}</span>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100/80">
                      <span className="text-slate-400 block text-[10px] font-bold">
                        {isRTL ? "القاعة الدراسية" : "Classroom"}
                      </span>
                      <span className="font-bold text-slate-800">{group.classroomName}</span>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100/80">
                      <span className="text-slate-400 block text-[10px] font-bold">
                        {isRTL ? "الاشتراك الشهري" : "Monthly Fee"}
                      </span>
                      <span className="font-bold text-indigo-700">
                        {formatDZD(group.monthlyFee, locale)}
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100/80">
                      <span className="text-slate-400 block text-[10px] font-bold">
                        {isRTL ? "التوقيت الأسبوعي" : "Schedule"}
                      </span>
                      <span className="font-bold text-slate-800">{group.scheduleDesc}</span>
                    </div>
                  </div>

                  {/* Capacity Bar */}
                  <div className="mt-4 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-semibold">
                        {isRTL ? "السعة والامتلاء" : "Occupancy"}
                      </span>
                      <span className="font-extrabold text-slate-800">
                        {group.studentsCount} / {group.maxCapacity} {isRTL ? "طالب" : "students"} ({occupancyRate}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          occupancyRate >= 90
                            ? "bg-rose-500"
                            : occupancyRate >= 70
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                        }`}
                        style={{ width: `${Math.min(100, occupancyRate)}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(group)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition shadow-xs active:scale-95"
                      title={isRTL ? "تعديل الفوج" : "Edit Group"}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingGroup(group)}
                      className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition shadow-xs active:scale-95"
                      title={isRTL ? "حذف الفوج" : "Delete Group"}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => onNavigateToAttendance?.(group.id)}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition flex items-center gap-1"
                  >
                    <span>{isRTL ? "تسجيل الحضور ←" : "Mark Attendance →"}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Group Modal */}
      {isAddGroupOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setIsAddGroupOpen(false)}
        >
          <div
            className="bg-white rounded-[28px] w-full max-w-lg border border-slate-100 shadow-2xl p-6 text-right rtl:text-right ltr:text-left space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-extrabold text-slate-900">
                {isRTL ? "إنشاء فوج دراسي جديد" : "Create New Class Group"}
              </h2>
              <button
                onClick={() => setIsAddGroupOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-start gap-2.5 animate-in fade-in">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleCreateGroup} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isRTL ? "اسم الفوج *" : "Group Name *"}
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="مثال: 3AS علوم تجريبية (فوج النخبة)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isRTL ? "المستوى الدراسي *" : "Academic Level *"}
                  </label>
                  <select
                    value={formData.academicLevel}
                    onChange={(e) => setFormData({ ...formData, academicLevel: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                  >
                    <option value="3AS">3AS (بكالوريا)</option>
                    <option value="2AS">2AS (ثانية ثانوي)</option>
                    <option value="1AS">1AS (أولى ثانوي)</option>
                    <option value="4AM">4AM (شهادة BEM)</option>
                    <option value="3AM">3AM (ثالثة متوسط)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isRTL ? "الشعبة" : "Stream"}
                  </label>
                  <input
                    type="text"
                    value={formData.stream}
                    onChange={(e) => setFormData({ ...formData, stream: e.target.value })}
                    placeholder="علوم تجريبية / رياضيات / عام"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isRTL ? "المادة الدراسية *" : "Subject *"}
                  </label>
                  <select
                    value={formData.subjectId}
                    onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                  >
                    <option value="">{isRTL ? "-- اختر المادة --" : "-- Select Subject --"}</option>
                    {metadata.subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.nameAr}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isRTL ? "الأستاذ المشرف *" : "Teacher *"}
                  </label>
                  <select
                    value={formData.teacherId}
                    onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                  >
                    <option value="">{isRTL ? "-- اختر الأستاذ --" : "-- Select Teacher --"}</option>
                    {metadata.teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.fullName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isRTL ? "القاعة" : "Room"}
                  </label>
                  <select
                    value={formData.classroomId}
                    onChange={(e) => setFormData({ ...formData, classroomId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                  >
                    <option value="">{isRTL ? "-- بدون --" : "-- None --"}</option>
                    {metadata.classrooms.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isRTL ? "السعة القصوى" : "Max Capacity"}
                  </label>
                  <input
                    type="number"
                    value={formData.maxCapacity}
                    onChange={(e) => setFormData({ ...formData, maxCapacity: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isRTL ? "الاشتراك (دج)" : "Fee (DZD)"}
                  </label>
                  <input
                    type="number"
                    value={formData.monthlyFee}
                    onChange={(e) => setFormData({ ...formData, monthlyFee: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddGroupOpen(false)}
                  className="px-4 py-2 rounded-full border border-slate-200 text-slate-600 font-bold hover:bg-slate-50"
                >
                  {isRTL ? "إلغاء" : "Cancel"}
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-full bg-slate-950 hover:bg-slate-800 text-white font-bold transition disabled:opacity-50"
                >
                  {saving ? (isRTL ? "جاري الإنشاء..." : "Creating...") : (isRTL ? "حفظ الفوج" : "Create Group")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Group Modal */}
      {editingGroup && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setEditingGroup(null)}
        >
          <div
            className="bg-white rounded-[28px] w-full max-w-lg border border-slate-100 shadow-2xl p-6 text-right rtl:text-right ltr:text-left space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-extrabold text-slate-900">
                {isRTL ? `تعديل بيانات الفوج: ${editingGroup.name}` : `Edit Group: ${editingGroup.name}`}
              </h2>
              <button
                onClick={() => setEditingGroup(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {editErrorMessage && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-start gap-2.5 animate-in fade-in">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{editErrorMessage}</span>
              </div>
            )}

            <form onSubmit={handleUpdateGroup} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isRTL ? "اسم الفوج *" : "Group Name *"}
                </label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isRTL ? "المستوى الدراسي" : "Level"}
                  </label>
                  <select
                    value={editFormData.academicLevel}
                    onChange={(e) => setEditFormData({ ...editFormData, academicLevel: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                  >
                    <option value="3AS">{isRTL ? "3 ثانوي (بكالوريا)" : "3AS (Bac)"}</option>
                    <option value="2AS">{isRTL ? "2 ثانوي" : "2AS"}</option>
                    <option value="1AS">{isRTL ? "1 ثانوي" : "1AS"}</option>
                    <option value="4AM">{isRTL ? "4 متوسط (بيام)" : "4AM (BEM)"}</option>
                    <option value="3AM">{isRTL ? "3 متوسط" : "3AM"}</option>
                    <option value="2AM">{isRTL ? "2 متوسط" : "2AM"}</option>
                    <option value="1AM">{isRTL ? "1 متوسط" : "1AM"}</option>
                    <option value="PRIMARY">{isRTL ? "ابتدائي" : "Primary"}</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isRTL ? "الشعبة (اختياري)" : "Stream"}
                  </label>
                  <input
                    type="text"
                    value={editFormData.stream}
                    onChange={(e) => setEditFormData({ ...editFormData, stream: e.target.value })}
                    placeholder="علوم تجريبية، رياضيات..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isRTL ? "المادة الدراسية *" : "Subject *"}
                  </label>
                  <select
                    value={editFormData.subjectId}
                    onChange={(e) => setEditFormData({ ...editFormData, subjectId: e.target.value })}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                  >
                    <option value="">{isRTL ? "اختر المادة" : "Select Subject"}</option>
                    {metadata.subjects?.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.nameAr}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isRTL ? "الأستاذ المشرف *" : "Teacher *"}
                  </label>
                  <select
                    value={editFormData.teacherId}
                    onChange={(e) => setEditFormData({ ...editFormData, teacherId: e.target.value })}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                  >
                    <option value="">{isRTL ? "اختر الأستاذ" : "Select Teacher"}</option>
                    {metadata.teachers?.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.fullName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isRTL ? "وقت البداية" : "Start Time"}
                  </label>
                  <input
                    type="time"
                    value={editFormData.startTime}
                    onChange={(e) => setEditFormData({ ...editFormData, startTime: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isRTL ? "وقت النهاية" : "End Time"}
                  </label>
                  <input
                    type="time"
                    value={editFormData.endTime}
                    onChange={(e) => setEditFormData({ ...editFormData, endTime: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isRTL ? "الاشتراك (دج)" : "Fee (DZD)"}
                  </label>
                  <input
                    type="number"
                    value={editFormData.monthlyFee}
                    onChange={(e) => setEditFormData({ ...editFormData, monthlyFee: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingGroup(null)}
                  className="px-4 py-2 rounded-full border border-slate-200 text-slate-600 font-bold hover:bg-slate-50"
                >
                  {isRTL ? "إلغاء" : "Cancel"}
                </button>

                <button
                  type="submit"
                  disabled={editSaving}
                  className="px-5 py-2 rounded-full bg-slate-950 hover:bg-slate-800 text-white font-bold transition disabled:opacity-50 flex items-center gap-1.5"
                >
                  {editSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>{isRTL ? "جاري الحفظ..." : "Saving..."}</span>
                    </>
                  ) : (
                    <span>{isRTL ? "حفظ التعديلات" : "Save Changes"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Group Confirmation Modal */}
      {deletingGroup && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setDeletingGroup(null)}
        >
          <div
            className="bg-white rounded-[28px] w-full max-w-md border border-slate-100 shadow-2xl p-6 text-right rtl:text-right ltr:text-left space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-extrabold text-slate-900">
                {isRTL ? "تأكيد حذف الفوج الدراسي" : "Delete Class Group"}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {isRTL
                  ? `هل أنت متأكد من حذف الفوج "${deletingGroup.name}"؟`
                  : `Are you sure you want to delete "${deletingGroup.name}"?`}
              </p>
            </div>

            <div className="bg-rose-50/60 border border-rose-100 rounded-2xl p-3 text-[11px] text-rose-800 font-semibold space-y-1">
              <p>• {isRTL ? `سيتم إلغاء تسجيل ${deletingGroup.studentsCount || 0} طالب مرتبط بهذا الفوج.` : `Unenrolls ${deletingGroup.studentsCount || 0} students.`}</p>
              <p>• {isRTL ? `سيتم تنظيف حصص الحضور والامتحانات التابعة له دون المساس ببيانات الطلاب والأساتذة.` : `Cleans up sessions and attendances safely.`}</p>
            </div>

            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeletingGroup(null)}
                className="px-5 py-2.5 rounded-full border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 text-xs"
              >
                {isRTL ? "إلغاء التراجع" : "Cancel"}
              </button>
              <button
                type="button"
                onClick={handleDeleteGroup}
                disabled={deleteLoading}
                className="px-6 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-md transition disabled:opacity-50 flex items-center gap-1.5"
              >
                {deleteLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{isRTL ? "جاري الحذف..." : "Deleting..."}</span>
                  </>
                ) : (
                  <span>{isRTL ? "نعم، حذف الفوج" : "Yes, Delete Group"}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
