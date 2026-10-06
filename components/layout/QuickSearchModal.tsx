"use client";

import React, { useState, useEffect } from "react";
import { Search, X, GraduationCap, Users, Layers, FileText, ArrowRight, ArrowLeft } from "lucide-react";
import { Locale } from "@/types";

interface QuickSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  locale: Locale;
  onSelectResult: (type: string, id: string) => void;
}

export const QuickSearchModal: React.FC<QuickSearchModalProps> = ({
  isOpen,
  onClose,
  locale,
  onSelectResult,
}) => {
  const isRTL = locale === "ar";
  const [query, setQuery] = useState("");

  const [students, setStudents] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query.trim()) {
      setStudents([]);
      setTeachers([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setStudents(data.students || []);
        setTeachers(data.teachers || []);
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const filteredStudents = students;
  const filteredTeachers = teachers;

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-start justify-center pt-20 p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-[28px] w-full max-w-xl border border-slate-100 shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              isRTL
                ? "ابحث عن طالب، أستاذ، فوج، أو فاتورة... (مثال: محمد)"
                : "Search students, teachers, groups... (e.g. Mohamed)"
            }
            className="w-full text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent"
          />
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Results Body */}
        <div className="p-4 max-h-80 overflow-y-auto space-y-4 text-xs text-right rtl:text-right ltr:text-left">
          {query.trim() === "" ? (
            <div className="text-center py-8 text-slate-400 space-y-1">
              <p className="font-semibold">{isRTL ? "البحث السريع في نظام مدرستي برو" : "Quick Search — MadrasatiPro"}</p>
              <p className="text-[11px]">{isRTL ? "اكتب اسم طالب، أستاذ، أو رقم هاتف..." : "Type a name or phone number..."}</p>
            </div>
          ) : (
            <>
              {filteredStudents.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    {isRTL ? "الطلاب" : "Students"}
                  </span>
                  <div className="space-y-1">
                    {filteredStudents.map((s) => (
                      <div
                        key={s.id}
                        onClick={() => {
                          onSelectResult("student", s.id);
                          onClose();
                        }}
                        className="p-2.5 rounded-xl hover:bg-slate-50 flex items-center justify-between cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <GraduationCap className="w-4 h-4 text-indigo-600" />
                          <span className="font-bold text-slate-900">{s.firstName} {s.lastName}</span>
                          <span className="text-[11px] text-slate-400">({s.academicLevel})</span>
                        </div>
                        <span className="text-[11px] text-slate-500">{s.phone}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {filteredTeachers.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    {isRTL ? "الأساتذة" : "Teachers"}
                  </span>
                  <div className="space-y-1">
                    {filteredTeachers.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => {
                          onSelectResult("teacher", t.id);
                          onClose();
                        }}
                        className="p-2.5 rounded-xl hover:bg-slate-50 flex items-center justify-between cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-emerald-600" />
                          <span className="font-bold text-slate-900">{t.fullName}</span>
                        </div>
                        <span className="text-[11px] text-slate-500">{t.subjects[0]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {filteredStudents.length === 0 && filteredTeachers.length === 0 && (
                <div className="text-center py-6 text-slate-400">
                  {isRTL ? "لم يتم العثور على نتائج مطابقة" : "No results found"}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
