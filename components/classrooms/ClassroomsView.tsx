"use client";

import React, { useState, useEffect } from "react";
import {
  DoorOpen,
  Plus,
  Search,
  Users,
  Calendar,
  Layers,
  Edit2,
  Trash2,
  Loader2,
  RefreshCw,
  Sparkles,
  CheckCircle,
  Building2,
  Hash,
} from "lucide-react";
import { Locale } from "@/types";
import { AddClassroomModal } from "./AddClassroomModal";
import { EditClassroomModal } from "./EditClassroomModal";
import { DeleteClassroomDialog } from "./DeleteClassroomDialog";

interface ClassroomsViewProps {
  locale: Locale;
}

export const ClassroomsView: React.FC<ClassroomsViewProps> = ({ locale }) => {
  const isRTL = locale === "ar";
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({
    totalRooms: 0,
    totalCapacity: 0,
    activeRooms: 0,
  });

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<any | null>(null);
  const [deletingRoom, setDeletingRoom] = useState<any | null>(null);
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const fetchClassrooms = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/classrooms?search=${encodeURIComponent(searchTerm)}`);
      const data = await res.json();
      if (data.classrooms) {
        setClassrooms(data.classrooms);
      }
      if (data.stats) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error("Failed to load classrooms:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClassrooms();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchClassrooms();
  };

  const handleClassroomCreated = (newRoom: any) => {
    setClassrooms((prev) => [newRoom, ...prev]);
    setStats((prev) => ({
      ...prev,
      totalRooms: prev.totalRooms + 1,
      totalCapacity: prev.totalCapacity + (newRoom.capacity || 0),
    }));
    showToast(isRTL ? "✓ تمت إضافة القاعة الدراسية بنجاح" : "✓ Classroom created successfully");
  };

  const handleClassroomUpdated = (updatedRoom: any) => {
    setClassrooms((prev) =>
      prev.map((r) => (r.id === updatedRoom.id ? { ...r, ...updatedRoom } : r))
    );
    showToast(isRTL ? "✓ تم تحديث بيانات القاعة بنجاح" : "✓ Classroom updated successfully");
  };

  const handleClassroomDeleted = (deletedId: string) => {
    const deleted = classrooms.find((r) => r.id === deletedId);
    setClassrooms((prev) => prev.filter((r) => r.id !== deletedId));
    setStats((prev) => ({
      ...prev,
      totalRooms: Math.max(0, prev.totalRooms - 1),
      totalCapacity: Math.max(0, prev.totalCapacity - (deleted?.capacity || 0)),
    }));
    showToast(isRTL ? "✓ تم حذف القاعة الدراسية" : "✓ Classroom deleted");
  };

  const averageCapacity = stats.totalRooms > 0 ? Math.round(stats.totalCapacity / stats.totalRooms) : 0;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-slate-950 text-white px-5 py-3 rounded-full text-xs font-bold shadow-2xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-top-4">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {isRTL ? "قاعات التدريس والفضاءات التعليمية" : "Teaching Rooms & Classrooms"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            {isRTL
              ? "إدارة القاعات الدراسية، الطاقة الاستيعابية، وربطها بالحصص والأفواج لتفادي أي تضارب في المواعيد"
              : "Manage classrooms, capacities, and link them to schedules to prevent booking conflicts"}
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 bg-slate-950 hover:bg-slate-800 text-white px-5 py-2.5 rounded-full text-xs font-bold shadow-md shadow-slate-950/20 transition active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{isRTL ? "+ إضافة قاعة جديدة" : "+ Add Classroom"}</span>
        </button>
      </div>

      {/* KPI Stats Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <span className="text-[11px] text-slate-500 font-semibold">
            {isRTL ? "إجمالي القاعات" : "Total Rooms"}
          </span>
          <p className="text-xl font-extrabold text-slate-900 mt-1">{stats.totalRooms}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <span className="text-[11px] text-slate-500 font-semibold">
            {isRTL ? "الطاقة الاستيعابية الإجمالية" : "Total Seat Capacity"}
          </span>
          <p className="text-xl font-extrabold text-indigo-600 mt-1">
            {stats.totalCapacity} {isRTL ? "مقعد" : "seats"}
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <span className="text-[11px] text-slate-500 font-semibold">
            {isRTL ? "القاعات النشطة بجدول التوقيت" : "Active in Schedule"}
          </span>
          <p className="text-xl font-extrabold text-emerald-600 mt-1">{stats.activeRooms}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <span className="text-[11px] text-slate-500 font-semibold">
            {isRTL ? "متوسط سعة القاعة" : "Average Capacity"}
          </span>
          <p className="text-xl font-extrabold text-slate-900 mt-1">
            {averageCapacity} {isRTL ? "مقعد" : "seats"}
          </p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-[24px] p-4 border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 rtl:right-3.5 ltr:left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={isRTL ? "ابحث باسم القاعة أو الرمز..." : "Search room name or code..."}
            className="w-full bg-slate-50 border border-slate-200 rounded-full py-2 px-9 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#F47A3C] focus:bg-white transition"
          />
        </form>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchClassrooms}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-600 transition"
            title={isRTL ? "تحديث القائمة" : "Refresh"}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && classrooms.length === 0 && (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          <p className="text-xs font-bold text-slate-500">
            {isRTL ? "جاري تحميل بيانات القاعات الدراسية..." : "Loading classrooms..."}
          </p>
        </div>
      )}

      {/* Empty State */}
      {!loading && classrooms.length === 0 && (
        <div className="bg-white rounded-[28px] p-12 text-center border border-slate-100 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#F47A3C] flex items-center justify-center mx-auto">
            <DoorOpen className="w-6 h-6" />
          </div>
          <h3 className="text-base font-extrabold text-slate-900">
            {isRTL ? "لا توجد قاعات تدريس مسجلة حالياً" : "No Classrooms Found"}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {isRTL
              ? "أضف أول قاعة أو فضاء تعليمي في مدرستك لربطها بجدول الحصص الأسبوعية ومنع تضارب المواعيد."
              : "Add your first classroom to schedule sessions and prevent timetable collisions."}
          </p>
          <button
            onClick={() => setIsAddOpen(true)}
            className="px-5 py-2.5 rounded-full bg-slate-950 text-white text-xs font-bold shadow-md hover:bg-slate-800 transition"
          >
            {isRTL ? "+ إضافة قاعة الآن" : "+ Add Classroom"}
          </button>
        </div>
      )}

      {/* Classrooms Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {classrooms.map((room) => (
          <div
            key={room.id}
            className="bg-white rounded-[26px] p-5 border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] hover:shadow-md transition flex flex-col justify-between space-y-4"
          >
            {/* Header info */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#F47A3C] shrink-0">
                  <DoorOpen className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black text-slate-900">{room.name}</h3>
                    {room.roomCode && (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                        {room.roomCode}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {room.branchName || "المقر الرئيسي"}
                  </p>
                </div>
              </div>

              <span className="text-xs font-black px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>{room.capacity} {isRTL ? "مقعد" : "seats"}</span>
              </span>
            </div>

            {/* Description if present */}
            {room.description && (
              <p className="text-xs text-slate-600 bg-slate-50/70 p-2.5 rounded-xl border border-slate-100 leading-relaxed">
                {room.description}
              </p>
            )}

            {/* Schedule & Groups Stats */}
            <div className="bg-slate-50 rounded-2xl p-3 grid grid-cols-2 gap-2 text-center text-xs border border-slate-100/60">
              <div>
                <span className="text-[10px] text-slate-500 font-bold block">
                  {isRTL ? "الحصص المجدولة" : "Scheduled Sessions"}
                </span>
                <span className="font-extrabold text-slate-900 mt-0.5 block">
                  {room.sessionsCount} {isRTL ? "حصة" : "sessions"}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold block">
                  {isRTL ? "الأفواج المرتبطة" : "Assigned Groups"}
                </span>
                <span className="font-extrabold text-slate-900 mt-0.5 block">
                  {room.groupsCount} {isRTL ? "فوج" : "groups"}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                onClick={() => setEditingRoom(room)}
                className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>{isRTL ? "تعديل" : "Edit"}</span>
              </button>
              <button
                onClick={() => setDeletingRoom(room)}
                className="py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95"
                title={isRTL ? "حذف القاعة" : "Delete Room"}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isRTL ? "حذف" : "Delete"}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      <AddClassroomModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        locale={locale}
        onClassroomCreated={handleClassroomCreated}
      />

      {/* Edit Modal */}
      <EditClassroomModal
        classroom={editingRoom}
        isOpen={Boolean(editingRoom)}
        onClose={() => setEditingRoom(null)}
        locale={locale}
        onClassroomUpdated={handleClassroomUpdated}
      />

      {/* Delete Dialog */}
      <DeleteClassroomDialog
        classroom={deletingRoom}
        isOpen={Boolean(deletingRoom)}
        onClose={() => setDeletingRoom(null)}
        locale={locale}
        onClassroomDeleted={handleClassroomDeleted}
      />
    </div>
  );
};
