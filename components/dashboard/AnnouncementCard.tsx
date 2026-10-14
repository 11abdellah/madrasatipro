"use client";

import React from "react";
import { Megaphone, GraduationCap, ArrowRight, ArrowLeft } from "lucide-react";

interface AnnouncementCardProps {
  locale?: string;
  onAction?: () => void;
}

export const AnnouncementCard: React.FC<AnnouncementCardProps> = ({
  locale = "ar",
  onAction,
}) => {
  const isRTL = locale === "ar";

  return (
    <div className="relative overflow-hidden rounded-[28px] p-5 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white shadow-xl">
      {/* Decorative background glow & illustration */}
      <div className="absolute -top-12 -right-12 w-36 h-36 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-500/15 rounded-full blur-xl pointer-events-none" />

      {/* Top row with Megaphone icon badge + currency/sparkle tag (Matching reference) */}
      <div className="flex items-center justify-between mb-3.5 relative z-10">
        <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
          <Megaphone className="w-5 h-5" />
        </div>

        <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-white/10 text-indigo-200 border border-white/10 flex items-center gap-1">
          <GraduationCap className="w-3 h-3 text-amber-400" />
          <span>{isRTL ? "BAC 2026" : "Exam Prep"}</span>
        </span>
      </div>

      {/* Title & Description */}
      <div className="relative z-10 mb-4">
        <h3 className="text-base font-bold text-white tracking-tight mb-1">
          {isRTL ? "دورات المراجعة النهائية للبكالوريا" : "Final BAC Revision Camps"}
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed font-normal">
          {isRTL
            ? "تم فتح التسجيلات لـ 12 فوج مكثف مع نخبة المفتشين والأساتذة. نسبة التسجيل بلغت 85%."
            : "Registration open for 12 intensive revision groups. Current occupancy at 85%."}
        </p>
      </div>

      {/* CTA Button */}
      <button
        onClick={onAction}
        className="relative z-10 w-full py-2.5 px-4 rounded-xl bg-white text-slate-950 hover:bg-slate-100 text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
      >
        <span>{isRTL ? "إدارة الأفواج والتسجيلات" : "Manage Groups & Registrations"}</span>
        {isRTL ? (
          <ArrowLeft className="w-3.5 h-3.5" />
        ) : (
          <ArrowRight className="w-3.5 h-3.5" />
        )}
      </button>
    </div>
  );
};
