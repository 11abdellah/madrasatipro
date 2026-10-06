"use client";

import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Filter,
  Plus,
  ShieldCheck,
  AlertTriangle,
  Clock,
  X,
  Trash2,
  CheckCircle2,
  Building2,
  Users,
} from "lucide-react";
import { Locale } from "@/types";

interface TimetableViewProps {
  locale: Locale;
}

export const TimetableView: React.FC<TimetableViewProps> = ({ locale }) => {
  const isRTL = locale === "ar";
  const [sessions, setSessions] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [metadataLoading, setMetadataLoading] = useState(false);

  // Filters
  const [selectedTeacher, setSelectedTeacher] = useState("all");
  const [selectedGroup, setSelectedGroup] = useState("all");
  const [selectedClassroom, setSelectedClassroom] = useState("all");

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successToast, setSuccessToast] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    groupId: "",
    subjectId: "",
    teacherId: "",
    classroomId: "",
    sessionDate: new Date().toISOString().split("T")[0],
    startTime: "08:30",
    endTime: "10:00",
    notes: "",
  });

  const fetchTimetable = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (selectedTeacher !== "all") query.set("teacherId", selectedTeacher);
      if (selectedGroup !== "all") query.set("groupId", selectedGroup);
      if (selectedClassroom !== "all") query.set("classroomId", selectedClassroom);

      const res = await fetch(`/api/timetable?${query.toString()}`);
      const data = await res.json();
      if (data.sessions) {
        setSessions(data.sessions);
      }
    } catch (err) {
      console.error("Failed to load timetable:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMetadata = async () => {
    setMetadataLoading(true);
    try {
      const res = await fetch("/api/classes");
      const data = await res.json();
      if (data.groups) setGroups(data.groups);
      if (data.metadata?.teachers) setTeachers(data.metadata.teachers);
      if (data.metadata?.classrooms) setClassrooms(data.metadata.classrooms);
      if (data.metadata?.subjects) setSubjects(data.metadata.subjects);

      if (data.groups?.[0]) {
        setFormData((prev) => ({
          ...prev,
          groupId: prev.groupId || data.groups[0].id,
          subjectId: prev.subjectId || data.groups[0].subjectId || (data.metadata?.subjects?.[0]?.id || ""),
          teacherId: prev.teacherId || data.groups[0].teacherId || (data.metadata?.teachers?.[0]?.id || ""),
          classroomId: prev.classroomId || data.groups[0].classroomId || (data.metadata?.classrooms?.[0]?.id || ""),
        }));
      }
    } catch (err) {
      console.error("Failed to load metadata:", err);
    } finally {
      setMetadataLoading(false);
    }
  };

  useEffect(() => {
    fetchMetadata();
  }, []);

  useEffect(() => {
    fetchTimetable();
  }, [selectedTeacher, selectedGroup, selectedClassroom]);

  const handleGroupChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const gId = e.target.value;
    const selected = groups.find((g) => g.id === gId);
    setFormData((prev) => ({
      ...prev,
      groupId: gId,
      subjectId: selected?.subjectId || prev.subjectId,
      teacherId: selected?.teacherId || prev.teacherId,
      classroomId: selected?.classroomId || prev.classroomId,
    }));
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/timetable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "تعذر حفظ الحصة");
      }

      setIsAddModalOpen(false);
      setSuccessToast(isRTL ? "✓ تمت إضافة الحصة إلى الجدول بنجاح" : "✓ Session added successfully");
      setTimeout(() => setSuccessToast(""), 3500);
      fetchTimetable();
    } catch (err: any) {
      setErrorMessage(err.message || "حدث خطأ أثناء حفظ الحصة");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSession = async (id: string) => {
    if (!confirm(isRTL ? "هل أنت متأكد من حذف هذه الحصة من الجدول؟" : "Delete session?")) return;

    try {
      const res = await fetch(`/api/timetable/${id}`, { method: "DELETE" });
      if (res.ok) {
        setSuccessToast(isRTL ? "✓ تم حذف الحصة" : "✓ Session deleted");
        setTimeout(() => setSuccessToast(""), 3000);
        fetchTimetable();
      }
    } catch (err) {
      console.error("Failed to delete session:", err);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {successToast && (
        <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {isRTL ? "الجدول الأسبوعي للحصص" : "Weekly Timetable"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            {isRTL
              ? "مخطط الحصص الأسبوعية مع كشف تلقائي فوري لتضارب القاعات أو الأساتذة"
              : "Class schedule with real-time room and teacher conflict prevention"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>{isRTL ? "فحص التضارب نشط ومفعل" : "Conflict Check Active"}</span>
          </div>

          <button
            onClick={() => {
              setErrorMessage("");
              fetchMetadata();
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-2 bg-slate-950 hover:bg-slate-800 text-white px-4 py-2.5 rounded-full text-xs font-bold shadow-md transition"
          >
            <Plus className="w-4 h-4" />
            <span>{isRTL ? "إضافة حصة للجدول" : "Add Session"}</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-[24px] p-4 border border-slate-100 shadow-sm flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
          <Filter className="w-4 h-4 text-slate-400" />
          <span>{isRTL ? "تصفية حسب:" : "Filter by:"}</span>
        </div>

        {/* Teacher Filter */}
        <select
          value={selectedTeacher}
          onChange={(e) => setSelectedTeacher(e.target.value)}
          className="bg-slate-50 border border-slate-200 text-xs font-medium rounded-xl px-3 py-2 focus:outline-none"
        >
          <option value="all">{isRTL ? "جميع الأساتذة" : "All Teachers"}</option>
          {teachers.map((t) => (
            <option key={t.id} value={t.id}>
              {t.fullName}
            </option>
          ))}
        </select>

        {/* Group Filter */}
        <select
          value={selectedGroup}
          onChange={(e) => setSelectedGroup(e.target.value)}
          className="bg-slate-50 border border-slate-200 text-xs font-medium rounded-xl px-3 py-2 focus:outline-none"
        >
          <option value="all">{isRTL ? "جميع الأفواج" : "All Groups"}</option>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>

        {/* Classroom Filter */}
        <select
          value={selectedClassroom}
          onChange={(e) => setSelectedClassroom(e.target.value)}
          className="bg-slate-50 border border-slate-200 text-xs font-medium rounded-xl px-3 py-2 focus:outline-none"
        >
          <option value="all">{isRTL ? "جميع القاعات" : "All Rooms"}</option>
          {classrooms.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Sessions Grid */}
      {loading ? (
        <div className="text-center py-16 bg-white rounded-[28px] border border-slate-100 text-slate-400 text-xs">
          {isRTL ? "جاري تحميل جدول الحصص..." : "Loading timetable..."}
        </div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-[28px] border border-slate-100 space-y-3">
          <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-700">
            {isRTL ? "لا توجد حصص مبرمجة في هذا التاريخ أو المعايير" : "No scheduled sessions found"}
          </h3>
          <p className="text-xs text-slate-400">
            {isRTL ? "انقر على زر 'إضافة حصة للجدول' لبرمجة حصة جديدة" : "Click 'Add Session' to schedule a class"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="bg-white rounded-[24px] p-5 border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] hover:shadow-md transition flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className="text-[11px] font-bold px-2.5 py-0.5 rounded-full text-white"
                    style={{ backgroundColor: session.subject?.color || "#6366F1" }}
                  >
                    {session.subject?.nameAr || "مادة دراسية"}
                  </span>

                  <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                    {session.sessionDate}
                  </span>
                </div>

                <h3 className="text-sm font-extrabold text-slate-900 leading-snug">
                  {session.group.name}
                </h3>

                <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-bold text-slate-800">{session.timeRange}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>{session.teacher.fullName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>{session.classroom?.name || "القاعة غير محددة"}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-emerald-600 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full">
                  {session.status === "completed" ? "مكتملة" : "مبرمجة"}
                </span>

                <button
                  onClick={() => handleDeleteSession(session.id)}
                  className="text-slate-400 hover:text-rose-600 p-1 rounded-lg transition"
                  title="حذف الحصة"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Session Modal */}
      {isAddModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setIsAddModalOpen(false)}
        >
          <div
            className="bg-white rounded-[28px] w-full max-w-lg border border-slate-100 shadow-2xl p-6 text-right rtl:text-right ltr:text-left space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-extrabold text-slate-900">
                {isRTL ? "إضافة وبرمجة حصة جديدة في الجدول" : "Schedule New Class Session"}
              </h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Error Message with conflict details */}
            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-start gap-2.5 animate-in fade-in">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleCreateSession} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isRTL ? "الفوج الدراسي *" : "Class Group *"}
                </label>
                {groups.length === 0 ? (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold">
                    {isRTL
                      ? "⚠️ لا توجد أفواج دراسية مسجلة حالياً. يرجى إنشاء فوج دراسي أولاً من تبويب 'الأقسام والمجموعات' لتتمكن من إضافة حصص."
                      : "⚠️ No class groups found. Please create a group first to schedule sessions."}
                  </div>
                ) : (
                  <select
                    value={formData.groupId}
                    onChange={handleGroupChange}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">{isRTL ? "-- اختر الفوج --" : "-- Select Group --"}</option>
                    {groups.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name} ({g.academicLevel})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isRTL ? "المادة الدراسية *" : "Subject *"}
                  </label>
                  <select
                    value={formData.subjectId}
                    onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">{isRTL ? "-- اختر المادة --" : "-- Select Subject --"}</option>
                    {subjects.map((s) => (
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">{isRTL ? "-- اختر الأستاذ --" : "-- Select Teacher --"}</option>
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.fullName} ({t.specialization})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isRTL ? "القاعة الدراسية (اختياري)" : "Classroom (Optional)"}
                </label>
                <select
                  value={formData.classroomId}
                  onChange={(e) => setFormData({ ...formData, classroomId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold focus:outline-none focus:border-indigo-500"
                >
                  <option value="">{isRTL ? "-- بدون تحديد قاعة --" : "-- No Classroom --"}</option>
                  {classrooms.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} (السعة: {c.capacity})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isRTL ? "اليوم / التاريخ *" : "Date *"}
                  </label>
                  <input
                    type="date"
                    value={formData.sessionDate}
                    onChange={(e) => setFormData({ ...formData, sessionDate: e.target.value })}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isRTL ? "وقت البداية *" : "Start Time *"}
                  </label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isRTL ? "وقت النهاية *" : "End Time *"}
                  </label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isRTL ? "ملاحظات وتفاصيل الحصة (اختياري)" : "Session Notes (Optional)"}
                </label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder={isRTL ? "مثال: مراجعة شاملة للوحدة الأولى / حل تمارين بكالوريا" : "e.g. Revision / Exam prep"}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold focus:outline-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-slate-200 text-slate-600 font-bold hover:bg-slate-50"
                >
                  {isRTL ? "إلغاء" : "Cancel"}
                </button>

                <button
                  type="submit"
                  disabled={saving || groups.length === 0}
                  className="px-5 py-2 rounded-full bg-slate-950 hover:bg-slate-800 text-white font-bold transition disabled:opacity-50"
                >
                  {saving ? (isRTL ? "جاري الفحص والحفظ..." : "Validating...") : (isRTL ? "حفظ الحصة في الجدول" : "Save Session")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
