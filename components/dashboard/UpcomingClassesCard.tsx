"use client";

import React from "react";
import { Clock } from "lucide-react";

interface UpcomingClassesCardProps {
  locale?: string;
  sessions?: any[];
  onOpenSession?: (id: string) => void;
}

export const UpcomingClassesCard: React.FC<UpcomingClassesCardProps> = ({
  locale = "ar",
  sessions = [],
  onOpenSession,
}) => {
  const isRTL = locale === "ar";

  return (
    <div className="bg-white rounded-[28px] p-5 border border-slate-100 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.03)] flex flex-col justify-between h-[340px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-bold text-slate-900 tracking-tight">
          {isRTL ? "الحصص المبرمجة اليوم" : "Today's Scheduled Classes"}
        </h3>
        <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
          {sessions.length} {isRTL ? "حصص اليوم" : "Sessions"}
        </span>
      </div>

      {/* Class Schedule Blocks */}
      <div className="space-y-2.5 overflow-y-auto pr-1 flex-1">
        {sessions.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4 text-slate-400 space-y-1">
            <Clock className="w-7 h-7 text-slate-300" />
            <p className="text-xs font-bold text-slate-600">
              {isRTL ? "لا توجد حصص مجدولة لليوم" : "No sessions today"}
            </p>
            <p className="text-[10px] text-slate-400">
              {isRTL ? "يمكنك إضافة حصص من تبويب الجدول" : "Schedule sessions in Timetable"}
            </p>
          </div>
        ) : (
          sessions.map((session) => (
            <div
              key={session.id}
              className="flex items-center justify-between p-2 rounded-2xl hover:bg-slate-50 transition border border-slate-100/80 bg-white"
            >
              {/* Accent Line + Time & Title */}
              <div className="flex items-center gap-3">
                <div
                  className="w-1 h-9 rounded-full shrink-0"
                  style={{ backgroundColor: session.accentColor || "#6366F1" }}
                />

                <div>
                  <p className="text-[11px] font-bold text-slate-500">
                    {session.timeRange}
                  </p>
                  <p className="text-xs font-bold text-slate-900 leading-tight">
                    {session.title}
                  </p>
                  <p className="text-[10px] text-slate-600 font-medium">
                    {session.room} • {session.teacher}
                  </p>
                </div>
              </div>

              {/* Pill Action Button */}
              <button
                onClick={() => onOpenSession?.(session.id)}
                className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-full transition shrink-0"
              >
                {isRTL ? "عرض" : "View"}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
