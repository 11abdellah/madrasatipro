"use client";

import React from "react";
import { LucideIcon, BookOpen, GraduationCap, Users, Wallet } from "lucide-react";

export type StatVariant = "purple" | "sky" | "mint" | "peach" | "emerald" | "rose" | "indigo";

interface StatCardProps {
  title: string;
  value: string | number;
  trendText: string;
  icon: LucideIcon;
  variant: StatVariant;
  watermarkType: "book" | "cap" | "teachers" | "coins";
}

const variantStyles: Record<
  StatVariant,
  { bg: string; border: string; iconBg: string; textColor: string; badgeBg: string }
> = {
  purple: {
    bg: "bg-[#ECE9FE]",
    border: "border-purple-200/60",
    iconBg: "bg-slate-900 text-white",
    textColor: "text-slate-900",
    badgeBg: "bg-slate-900 text-white",
  },
  sky: {
    bg: "bg-[#E0F2FE]",
    border: "border-sky-200/60",
    iconBg: "bg-slate-900 text-white",
    textColor: "text-slate-900",
    badgeBg: "bg-slate-900 text-white",
  },
  mint: {
    bg: "bg-[#DCFCE7]",
    border: "border-emerald-200/60",
    iconBg: "bg-slate-900 text-white",
    textColor: "text-slate-900",
    badgeBg: "bg-slate-900 text-white",
  },
  peach: {
    bg: "bg-[#FFEDD5]",
    border: "border-orange-200/60",
    iconBg: "bg-slate-900 text-white",
    textColor: "text-slate-900",
    badgeBg: "bg-slate-900 text-white",
  },
  emerald: {
    bg: "bg-[#DCFCE7]",
    border: "border-emerald-200/60",
    iconBg: "bg-slate-900 text-white",
    textColor: "text-slate-900",
    badgeBg: "bg-slate-900 text-white",
  },
  rose: {
    bg: "bg-[#FFE4E6]",
    border: "border-rose-200/60",
    iconBg: "bg-slate-900 text-white",
    textColor: "text-slate-900",
    badgeBg: "bg-slate-900 text-white",
  },
  indigo: {
    bg: "bg-[#EEF2FF]",
    border: "border-indigo-200/60",
    iconBg: "bg-slate-900 text-white",
    textColor: "text-slate-900",
    badgeBg: "bg-slate-900 text-white",
  },
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  trendText,
  icon: Icon,
  variant,
  watermarkType,
}) => {
  const style = variantStyles[variant];

  // Render decorative faint background illustration matching reference image
  const renderWatermark = () => {
    switch (watermarkType) {
      case "book":
        return (
          <svg
            className="absolute -bottom-2 -left-2 rtl:-left-auto rtl:-right-2 w-32 h-32 opacity-15 pointer-events-none text-slate-800"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
          >
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            <line x1="8" y1="6" x2="16" y2="6" />
            <line x1="8" y1="10" x2="14" y2="10" />
          </svg>
        );
      case "cap":
        return (
          <svg
            className="absolute -bottom-1 -left-1 rtl:-left-auto rtl:-right-1 w-32 h-32 opacity-15 pointer-events-none text-slate-800"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
          >
            <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
            <path d="M6 12v5c3 3 9 3 12 0v-5" />
          </svg>
        );
      case "teachers":
        return (
          <svg
            className="absolute -bottom-2 -left-2 rtl:-left-auto rtl:-right-2 w-32 h-32 opacity-15 pointer-events-none text-slate-800"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
          >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        );
      case "coins":
        return (
          <svg
            className="absolute -bottom-2 -left-2 rtl:-left-auto rtl:-right-2 w-32 h-32 opacity-15 pointer-events-none text-slate-800"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
          >
            <circle cx="8" cy="8" r="6" />
            <path d="M18.09 10.37A6 6 0 1 1 10.34 18" />
            <path d="M7 6h1v4" />
            <path d="M16.5 13.5h.5v3" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={`relative overflow-hidden rounded-[26px] p-5 border ${style.bg} ${style.border} shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] flex flex-col justify-between h-[155px] transition-all duration-200 hover:shadow-md hover:-translate-y-0.5`}
    >
      {/* Background Watermark Art */}
      {renderWatermark()}

      {/* Top Header: Dark Icon Badge + Title */}
      <div className="relative z-10 flex items-center gap-2.5">
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center ${style.iconBg} shadow-sm`}
        >
          <Icon className="w-4 h-4 text-white" />
        </div>
        <span className="text-xs font-semibold text-slate-700 tracking-wide">
          {title}
        </span>
      </div>

      {/* Big Value Number */}
      <div className="relative z-10 my-auto">
        <h3 className="text-3xl font-extrabold tracking-tight text-slate-900 leading-none">
          {value}
        </h3>
      </div>

      {/* Black Pill Badge with Trend (Exact reference element) */}
      <div className="relative z-10 flex items-center">
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold tracking-tight ${style.badgeBg} shadow-sm`}
        >
          <span className="text-emerald-400 font-bold">▲</span>
          <span>{trendText}</span>
        </span>
      </div>
    </div>
  );
};
