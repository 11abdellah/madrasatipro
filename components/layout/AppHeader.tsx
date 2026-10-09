"use client";

import React from "react";
import Image from "next/image";
import {
  Home,
  GraduationCap,
  Users,
  Layers,
  CalendarDays,
  ClipboardCheck,
  Wallet,
  Bell,
  Search,
  ChevronDown,
  Globe,
  Building2,
  Command,
  Sliders,
  LogOut,
  DoorOpen,
} from "lucide-react";
import { Locale } from "@/types";

interface AppHeaderProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  locale: Locale;
  onLocaleChange: (loc: Locale) => void;
  onOpenSearch: () => void;
  onOpenNotifications: () => void;
  unreadCount?: number;
  institutionName?: string;
  wilayaName?: string;
  adminName?: string;
  institutionLogo?: string | null;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  currentTab,
  onTabChange,
  locale,
  onLocaleChange,
  onOpenSearch,
  onOpenNotifications,
  unreadCount = 0,
  institutionName = "",
  wilayaName = "",
  adminName = "",
  institutionLogo = null,
}) => {
  const isRTL = locale === "ar";

  const navItems = [
    { id: "dashboard", label: isRTL ? "الرئيسية" : "Dashboard", icon: Home },
    { id: "students", label: isRTL ? "الطلاب" : "Students", icon: GraduationCap },
    { id: "teachers", label: isRTL ? "الأساتذة" : "Teachers", icon: Users },
    { id: "classes", label: isRTL ? "الأقسام والمجموعات" : "Classes", icon: Layers },
    { id: "classrooms", label: isRTL ? "قاعات التدريس" : "Classrooms", icon: DoorOpen },
    { id: "timetable", label: isRTL ? "الجدول" : "Timetable", icon: CalendarDays },
    { id: "attendance", label: isRTL ? "الحضور" : "Attendance", icon: ClipboardCheck },
    { id: "finance", label: isRTL ? "المالية" : "Finance", icon: Wallet },
    { id: "settings", label: isRTL ? "الإعدادات" : "Settings", icon: Sliders },
  ];

  return (
    <header className="w-full pt-4 pb-2 px-4 md:px-8 max-w-[1560px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
      {/* Brand & Institution Info */}
      <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
        <div className="flex items-center gap-3">
          {/* Platform SaaS Brand Logo (Slightly enlarged for crisp prominence) */}
          <a href="/" className="relative h-12 sm:h-13 w-48 sm:w-56 block shrink-0" title="MadrasatiPro">
            <Image
              src="/logo-transparent.png"
              alt="MadrasatiPro Logo"
              fill
              className="object-contain object-right"
              priority
            />
          </a>

          {/* Institution Info & Institution Logo next to its name */}
          {institutionName ? (
            <div className="border-r border-slate-200 pr-3 hidden sm:flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl overflow-hidden border border-slate-200 bg-white shadow-xs flex items-center justify-center shrink-0">
                {institutionLogo ? (
                  <img
                    src={institutionLogo}
                    alt={institutionName}
                    className="w-full h-full object-contain p-0.5"
                  />
                ) : (
                  <div className="w-full h-full bg-orange-50 flex items-center justify-center text-[#F47A3C]">
                    <Building2 className="w-4 h-4" />
                  </div>
                )}
              </div>
              <div className="text-right rtl:text-right ltr:text-left">
                {wilayaName && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-orange-50 text-[#F47A3C] border border-orange-100">
                      {wilayaName}
                    </span>
                  </div>
                )}
                <p className="text-[12px] text-slate-800 font-bold truncate max-w-[200px] sm:max-w-none leading-tight">
                  {institutionName}
                </p>
              </div>
            </div>
          ) : null}
        </div>

        {/* Mobile controls for search */}
        <button
          onClick={onOpenSearch}
          className="md:hidden p-2 rounded-full bg-white border border-slate-200 text-slate-600 shadow-sm"
          title="بحث سريع"
        >
          <Search className="w-4 h-4" />
        </button>
      </div>

      {/* Floating Center Pill Navigation */}
      <nav className="bg-white/95 backdrop-blur-md px-2.5 py-1.5 rounded-full border border-slate-200/90 shadow-[0_8px_30px_rgb(0,0,0,0.06)] flex items-center gap-1.5 overflow-x-auto max-w-full">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              title={item.label}
              className={`relative flex items-center justify-center transition-all duration-200 ${
                isActive
                  ? "bg-slate-950 text-white rounded-full px-4 py-2 h-10 shadow-sm"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-100/80 rounded-full w-10 h-10"
              }`}
            >
              <Icon className="w-4 h-4" />
              {isActive && (
                <span className="text-xs font-semibold whitespace-nowrap ml-1.5 mr-1.5">
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Right User Controls: Search, Lang, Notifications, Avatar, Logout */}
      <div className="flex items-center gap-2.5">
        {/* Quick Search Shortcut */}
        <button
          onClick={onOpenSearch}
          className="hidden lg:flex items-center gap-2 bg-white/90 hover:bg-white text-slate-500 hover:text-slate-900 px-3 py-2 rounded-full border border-slate-200 text-xs shadow-sm transition"
        >
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <span>{isRTL ? "بحث سريع..." : "Search..."}</span>
          <kbd className="bg-slate-100 text-slate-500 text-[10px] font-mono px-1.5 py-0.5 rounded border border-slate-200 flex items-center gap-0.5">
            <Command className="w-2.5 h-2.5" /> K
          </kbd>
        </button>

        {/* Language Switcher */}
        <div className="relative group">
          <button className="flex items-center gap-1 px-2.5 py-2 rounded-full bg-white border border-slate-200 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50">
            <Globe className="w-3.5 h-3.5 text-indigo-600" />
            <span>{locale === "ar" ? "عربي" : locale === "fr" ? "FR" : "EN"}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>
          <div className="absolute left-0 rtl:left-auto rtl:right-0 mt-1.5 w-28 bg-white rounded-2xl shadow-lg border border-slate-100 py-1 hidden group-hover:block z-50 animate-in fade-in">
            <button
              onClick={() => onLocaleChange("ar")}
              className={`w-full text-right px-3 py-1.5 text-xs hover:bg-indigo-50 font-medium ${
                locale === "ar" ? "text-indigo-600 bg-indigo-50/50" : "text-slate-700"
              }`}
            >
              العربية (الجزائر)
            </button>
            <button
              onClick={() => onLocaleChange("fr")}
              className={`w-full text-left px-3 py-1.5 text-xs hover:bg-indigo-50 font-medium ${
                locale === "fr" ? "text-indigo-600 bg-indigo-50/50" : "text-slate-700"
              }`}
            >
              Français
            </button>
            <button
              onClick={() => onLocaleChange("en")}
              className={`w-full text-left px-3 py-1.5 text-xs hover:bg-indigo-50 font-medium ${
                locale === "en" ? "text-indigo-600 bg-indigo-50/50" : "text-slate-700"
              }`}
            >
              English
            </button>
          </div>
        </div>

        {/* Notifications Icon */}
        <button
          onClick={onOpenNotifications}
          className="relative w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-sm hover:bg-slate-50 transition"
          title={isRTL ? "الإشعارات" : "Notifications"}
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
          )}
        </button>

        {/* User Profile Avatar (Manager / Admin Picture) */}
        <div className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full bg-white border border-slate-200 shadow-sm">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
            {institutionLogo ? (
              <img
                src={institutionLogo}
                alt={adminName || "صورة المدير"}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-xs font-black text-slate-700 uppercase">
                {adminName ? adminName.trim().charAt(0) : "م"}
              </span>
            )}
          </div>
          <div className="hidden sm:block text-right rtl:text-right ltr:text-left pr-1">
            <p className="text-xs font-bold text-slate-900 leading-tight">{adminName || (isRTL ? "المدير" : "Admin")}</p>
            <p className="text-[10px] text-slate-500 font-medium">{isRTL ? "مدير المؤسسة" : "School Admin"}</p>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={async () => {
            await fetch("/api/auth/logout", { method: "POST" });
            window.location.href = "/login";
          }}
          className="w-10 h-10 rounded-full bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 flex items-center justify-center text-slate-500 hover:text-rose-600 shadow-sm transition"
          title={isRTL ? "تسجيل الخروج" : "Logout"}
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
