"use client";

import React, { useState, useEffect } from "react";
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Send,
  Check,
  Users,
  Calendar,
  Layers,
} from "lucide-react";
import { AttendanceStatus, Locale } from "@/types";

interface AttendanceViewProps {
  locale: Locale;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({ locale }) => {
  const isRTL = locale === "ar";
  const [groups, setGroups] = useState<any[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [students, setStudents] = useState<any[]>([]);
  const [attendanceState, setAttendanceState] = useState<Record<string, AttendanceStatus>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // 1. Fetch available groups
  useEffect(() => {
    fetch("/api/classes")
      .then((res) => res.json())
      .then((data) => {
        if (data.groups && data.groups.length > 0) {
          setGroups(data.groups);
          setSelectedGroupId(data.groups[0].id);
        }
      })
      .catch((err) => console.error("Error loading groups:", err));
  }, []);

  // 2. Fetch students and attendance for selected group & date
  useEffect(() => {
    if (!selectedGroupId) return;

    setLoading(true);
    fetch(`/api/attendance?groupId=${selectedGroupId}&date=${selectedDate}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.students) {
          setStudents(data.students);
          const initialMap: Record<string, AttendanceStatus> = {};
          data.students.forEach((s: any) => {
            initialMap[s.id] = (s.status as AttendanceStatus) || "present";
          });
          setAttendanceState(initialMap);
        }
      })
      .catch((err) => console.error("Error loading attendance:", err))
      .finally(() => setLoading(false));
  }, [selectedGroupId, selectedDate]);

  const handleMarkAllPresent = () => {
    const updated: Record<string, AttendanceStatus> = {};
    students.forEach((s) => {
      updated[s.id] = "present";
    });
    setAttendanceState(updated);
  };

  const setStatus = (studentId: string, status: AttendanceStatus) => {
    setAttendanceState((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const handleSave = async () => {
    if (!selectedGroupId) return;
    setSaving(true);
    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupId: selectedGroupId,
          date: selectedDate,
          records: attendanceState,
        }),
      });

      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Attendance save failed:", err);
    } finally {
      setSaving(false);
    }
  };

  const presentCount = Object.values(attendanceState).filter((s) => s === "present").length;
  const absentCount = Object.values(attendanceState).filter((s) => s === "absent").length;
  const lateCount = Object.values(attendanceState).filter((s) => s === "late").length;
  const excusedCount = Object.values(attendanceState).filter((s) => s === "excused").length;

  const currentGroup = groups.find((g) => g.id === selectedGroupId);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {isRTL ? "تسجيل الحضور والغياب" : "Attendance Management"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            {isRTL
              ? "تسجيل حضور أفواج اليوم، رصد الغيابات، وحفظ السجلات في قاعدة البيانات"
              : "Mark daily student attendance, absences, and update records in the database"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleMarkAllPresent}
            className="flex items-center gap-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-4 py-2.5 rounded-full text-xs font-bold shadow-sm transition"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{isRTL ? "تحديد الكل كحاضر" : "Mark All Present"}</span>
          </button>

          <button
            onClick={handleSave}
            disabled={saving || students.length === 0}
            className="flex items-center gap-2 bg-slate-950 hover:bg-slate-800 text-white px-5 py-2.5 rounded-full text-xs font-bold shadow-md transition disabled:opacity-50"
          >
            {saving ? (
              <span>{isRTL ? "جاري الحفظ..." : "Saving..."}</span>
            ) : (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>{isRTL ? "حفظ سجل الحضور" : "Save Attendance"}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{isRTL ? "✓ تم حفظ سجل الحضور والغياب بنجاح في قاعدة البيانات!" : "✓ Attendance saved to database!"}</span>
        </div>
      )}

      {groups.length === 0 ? (
        <div className="bg-white rounded-[28px] p-12 text-center border border-slate-100 shadow-sm text-slate-400">
          <Layers className="w-10 h-10 mx-auto mb-3 text-slate-300" />
          <h3 className="text-sm font-bold text-slate-700">
            {isRTL ? "لا توجد أفواج دراسية مسجلة بعد" : "No class groups found"}
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {isRTL
              ? "قم بإنشاء أفواج دراسية من تبويب 'الأقسام والمجموعات' لتتمكن من رصد وتسجيل الحضور والغياب للطلاب."
              : "Create class groups from the Classes tab to track and record attendance."}
          </p>
        </div>
      ) : (
        <>
          {/* Selectors Bar */}
          <div className="bg-white rounded-[24px] p-4 border border-slate-100 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              {/* Group Selector */}
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-slate-400" />
                <select
                  value={selectedGroupId}
                  onChange={(e) => setSelectedGroupId(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl px-3 py-2 text-slate-900 focus:outline-none"
                >
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name} ({g.subjectName} — {g.teacherName})
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Selector */}
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl px-3 py-2 text-slate-900 focus:outline-none"
                />
              </div>
            </div>

            {/* Counter Badges */}
            <div className="flex items-center gap-2 text-xs font-bold">
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                {isRTL ? `حاضر: ${presentCount}` : `Present: ${presentCount}`}
              </span>
              <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                {isRTL ? `غائب: ${absentCount}` : `Absent: ${absentCount}`}
              </span>
              <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                {isRTL ? `متأخر: ${lateCount}` : `Late: ${lateCount}`}
              </span>
              <span className="px-3 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                {isRTL ? `مبرر: ${excusedCount}` : `Excused: ${excusedCount}`}
              </span>
            </div>
          </div>

          {/* Students Attendance List */}
          {loading ? (
            <div className="text-center py-16 bg-white rounded-[28px] border border-slate-100 text-slate-400 text-xs">
              {isRTL ? "جاري تحميل قائمة الطلاب المسجلين في هذا الفوج..." : "Loading students..."}
            </div>
          ) : students.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-[28px] border border-slate-100 space-y-2">
              <Users className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-700">
                {isRTL ? "لا يوجد طلاب مسجلون في هذا الفوج بعد" : "No enrolled students in this group"}
              </h3>
              <p className="text-xs text-slate-400">
                {isRTL ? "يمكنك تسجيل وقبول الطلاب في الفوج من تبويب الطلاب" : "Enroll students in this group from Students module"}
              </p>
            </div>
          ) : (
        <div className="bg-white rounded-[28px] border border-slate-100 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.03)] overflow-hidden">
          <div className="divide-y divide-slate-100">
            {students.map((student, index) => {
              const currentStatus = attendanceState[student.id] || "present";

              return (
                <div
                  key={student.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-400 w-6 text-center">
                      #{index + 1}
                    </span>
                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-700 font-extrabold flex items-center justify-center text-sm">
                      {student.firstName[0]}
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                        {student.fullName}
                      </h4>
                      <p className="text-[11px] text-slate-500 font-medium">
                        {student.phone} • {student.academicLevel}
                      </p>
                    </div>
                  </div>

                  {/* 4 Status Pill Buttons */}
                  <div className="flex items-center gap-1.5 self-end sm:self-center">
                    <button
                      onClick={() => setStatus(student.id, "present")}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1 ${
                        currentStatus === "present"
                          ? "bg-emerald-600 text-white shadow-sm"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{isRTL ? "حاضر" : "Present"}</span>
                    </button>

                    <button
                      onClick={() => setStatus(student.id, "absent")}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1 ${
                        currentStatus === "absent"
                          ? "bg-rose-600 text-white shadow-sm"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>{isRTL ? "غائب" : "Absent"}</span>
                    </button>

                    <button
                      onClick={() => setStatus(student.id, "late")}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1 ${
                        currentStatus === "late"
                          ? "bg-amber-500 text-white shadow-sm"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>{isRTL ? "متأخر" : "Late"}</span>
                    </button>

                    <button
                      onClick={() => setStatus(student.id, "excused")}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1 ${
                        currentStatus === "excused"
                          ? "bg-sky-600 text-white shadow-sm"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{isRTL ? "مبرر" : "Excused"}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      </>
      )}
    </div>
  );
};
