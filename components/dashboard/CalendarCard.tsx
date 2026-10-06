"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarCardProps {
  locale?: string;
  onSelectDate?: (day: number) => void;
}

export const CalendarCard: React.FC<CalendarCardProps> = ({
  locale = "ar",
  onSelectDate,
}) => {
  const isRTL = locale === "ar";
  const [selectedDay, setSelectedDay] = useState<number>(26); // Default 26 matching reference image!

  // Weekdays matching the reference image layout
  const weekDays = isRTL
    ? ["سب", "أح", "اث", "ثل", "أر", "خم", "جم"]
    : ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  // Days in month: 31 days, starting on a specific day of week (e.g. Sunday offset = 0)
  // Let's create an array of 31 days with event dots on days 8, 12, 19, 26, 28
  const daysWithEvents = [8, 12, 16, 19, 21, 26, 28];

  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className="bg-white rounded-[28px] p-5 border border-slate-100 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.03)]">
      {/* Calendar Header with Navigation Arrows */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">
            {isRTL ? "التقويم" : "Calendar"}
          </h3>
          <p className="text-[11px] text-slate-600 font-semibold">
            {isRTL ? "فيفري 2026" : "February 2026"}
          </p>
        </div>

        <div className="flex items-center gap-1">
          <button
            className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition"
            title="السابق"
          >
            <ChevronRight className="w-3.5 h-3.5 rtl:rotate-0 ltr:rotate-180" />
          </button>
          <button
            className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition"
            title="التالي"
          >
            <ChevronLeft className="w-3.5 h-3.5 rtl:rotate-0 ltr:rotate-180" />
          </button>
        </div>
      </div>

      {/* Weekdays Row */}
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {weekDays.map((d, i) => (
          <span
            key={i}
            className="text-[11px] font-semibold text-slate-600 select-none"
          >
            {d}
          </span>
        ))}
      </div>

      {/* Days Grid (Exact replica of day 26 terracotta circle) */}
      <div className="grid grid-cols-7 gap-y-1.5 gap-x-1 text-center">
        {days.map((day) => {
          const isSelected = selectedDay === day;
          const hasEvent = daysWithEvents.includes(day);

          return (
            <button
              key={day}
              onClick={() => {
                setSelectedDay(day);
                onSelectDate?.(day);
              }}
              className="group relative flex flex-col items-center justify-center h-8 rounded-full transition"
            >
              <span
                className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-semibold select-none transition ${
                  isSelected
                    ? "bg-[#E05B3A] text-white font-bold shadow-md shadow-orange-500/30 scale-105"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                {day}
              </span>

              {/* Event Dot underneath (matching reference) */}
              {hasEvent && !isSelected && (
                <span className="w-1 h-1 rounded-full bg-orange-400 mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
