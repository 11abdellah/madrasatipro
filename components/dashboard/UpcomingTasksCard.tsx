"use client";

import React from "react";
import { ChevronLeft, ChevronRight, PenTool, BookOpen, AlertCircle, CheckCircle } from "lucide-react";

interface QuickTask {
  id: string;
  title: string;
  category: string;
  timeframe: string;
  iconType: "pen" | "book" | "alert" | "check";
  linkTab?: string;
}

interface UpcomingTasksCardProps {
  locale?: string;
  onViewAll?: () => void;
  onSelectTask?: (id: string) => void;
  tasks?: QuickTask[];
}

export const UpcomingTasksCard: React.FC<UpcomingTasksCardProps> = ({
  locale = "ar",
  onViewAll,
  onSelectTask,
  tasks,
}) => {
  const isRTL = locale === "ar";

  const defaultSetupTasks: QuickTask[] = [
    {
      id: "setup-1",
      title: isRTL ? "إضافة أول فوج دراسي للمؤسسة" : "Create first class group",
      category: isRTL ? "الأقسام والمجموعات" : "Classes",
      timeframe: isRTL ? "خطوة أولى" : "Step 1",
      iconType: "book",
    },
    {
      id: "setup-2",
      title: isRTL ? "تسجيل أستاذ في المنصة" : "Add teaching staff",
      category: isRTL ? "الأساتذة" : "Teachers",
      timeframe: isRTL ? "فريق العمل" : "Staff",
      iconType: "pen",
    },
    {
      id: "setup-3",
      title: isRTL ? "رفع شعار وهوية المؤسسة" : "Upload institution logo",
      category: isRTL ? "الإعدادات" : "Settings",
      timeframe: isRTL ? "الهوية" : "Branding",
      iconType: "alert",
    },
  ];

  const displayTasks = tasks || defaultSetupTasks;

  const renderIcon = (type: "pen" | "book" | "alert" | "check") => {
    switch (type) {
      case "pen":
        return (
          <div className="w-10 h-10 rounded-full bg-[#EDE9FE] text-indigo-600 flex items-center justify-center shrink-0">
            <PenTool className="w-4 h-4" />
          </div>
        );
      case "book":
        return (
          <div className="w-10 h-10 rounded-full bg-[#FFEDD5] text-orange-600 flex items-center justify-center shrink-0">
            <BookOpen className="w-4 h-4" />
          </div>
        );
      case "check":
        return (
          <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle className="w-4 h-4" />
          </div>
        );
      case "alert":
      default:
        return (
          <div className="w-10 h-10 rounded-full bg-[#FFE4E6] text-rose-600 flex items-center justify-center shrink-0">
            <AlertCircle className="w-4 h-4" />
          </div>
        );
    }
  };

  return (
    <div className="bg-white rounded-[28px] p-5 border border-slate-100 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.03)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-3.5">
        <h3 className="text-base font-bold text-slate-900 tracking-tight">
          {isRTL ? "القادم والمهام العاجلة" : "Upcoming & Urgent"}
        </h3>
        <button
          onClick={onViewAll}
          className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition flex items-center gap-0.5"
        >
          <span>{isRTL ? "عرض الكل" : "View All"}</span>
          {isRTL ? (
            <ChevronLeft className="w-3.5 h-3.5" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {/* Task Items */}
      <div className="space-y-2.5">
        {displayTasks.map((task) => (
          <div
            key={task.id}
            onClick={() => onSelectTask?.(task.id)}
            className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/80 transition cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              {renderIcon(task.iconType)}
              <div>
                <p className="text-xs font-bold text-slate-900 leading-snug group-hover:text-indigo-600 transition">
                  {task.title}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[11px] text-slate-500 font-medium">
                    {task.category}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-[11px] text-indigo-600 font-semibold">
                    {task.timeframe}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-slate-400 group-hover:text-slate-700 transition">
              {isRTL ? (
                <ChevronLeft className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
