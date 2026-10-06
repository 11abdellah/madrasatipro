"use client";

import React from "react";
import { MoreHorizontal, Users } from "lucide-react";

interface TopTeachersCardProps {
  locale?: string;
  teachers?: any[];
  onSelectTeacher?: (id: string) => void;
}

export const TopTeachersCard: React.FC<TopTeachersCardProps> = ({
  locale = "ar",
  teachers = [],
  onSelectTeacher,
}) => {
  const isRTL = locale === "ar";

  return (
    <div className="bg-white rounded-[28px] p-5 border border-slate-100 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.03)] flex flex-col justify-between h-[340px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-bold text-slate-900 tracking-tight">
          {isRTL ? "أفضل الأساتذة" : "Top Teachers"}
        </h3>
        <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
          {teachers.length} {isRTL ? "أساتذة" : "Teachers"}
        </span>
      </div>

      {/* Teachers List */}
      <div className="space-y-2.5 overflow-y-auto pr-1 flex-1">
        {teachers.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4 text-slate-400 space-y-1">
            <Users className="w-7 h-7 text-slate-300" />
            <p className="text-xs font-bold text-slate-600">
              {isRTL ? "لا يوجد أساتذة مسجلين بعد" : "No teachers yet"}
            </p>
          </div>
        ) : (
          teachers.map((teacher) => (
            <div
              key={teacher.id}
              onClick={() => onSelectTeacher?.(teacher.id)}
              className="group flex items-center justify-between p-2 rounded-2xl hover:bg-slate-50 transition cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                {/* Avatar */}
                <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-100 ring-2 ring-slate-100 shrink-0">
                  <img
                    src={teacher.avatarUrl}
                    alt={teacher.fullName}
                    className="w-full h-full object-cover group-hover:scale-105 transition"
                  />
                </div>

                {/* Name & Subtitle */}
                <div>
                  <p className="text-xs font-bold text-slate-900 leading-tight">
                    {teacher.fullName}
                  </p>
                  <p className="text-[11px] text-slate-600 font-medium">
                    {teacher.specialization || teacher.subject}
                  </p>
                </div>
              </div>

              {/* Student count pill */}
              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full">
                {teacher.studentsCount} {isRTL ? "طالب" : "students"}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
