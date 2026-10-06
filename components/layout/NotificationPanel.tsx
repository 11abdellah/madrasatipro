"use client";

import React, { useState, useEffect } from "react";
import { X, Bell, Check, ClipboardCheck, Wallet, Calendar } from "lucide-react";
import { Locale } from "@/types";

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  locale: Locale;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  isOpen,
  onClose,
  locale,
}) => {
  const isRTL = locale === "ar";
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      if (data.notifications) {
        setNotifications(data.notifications);
      }
    } catch (err) {
      console.error("Failed to load notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const handleMarkAllRead = async () => {
    try {
      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true }),
      });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      }
    } catch (err) {
      console.error("Mark all read failed:", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-slate-900/30 backdrop-blur-xs flex justify-end animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-white h-full shadow-2xl flex flex-col border-l rtl:border-l-0 rtl:border-r border-slate-200 animate-in slide-in-from-right rtl:slide-in-from-left duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-900">
              {isRTL ? "مركز الإشعارات والتنبيهات" : "Notifications"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Notifications List */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3 text-xs text-right rtl:text-right ltr:text-left">
          {loading ? (
            <div className="text-center py-10 text-slate-400">
              {isRTL ? "جاري تحميل التنبيهات..." : "Loading notifications..."}
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <Bell className="w-8 h-8 mx-auto text-slate-300" />
              <p className="font-semibold">{isRTL ? "لا توجد إشعارات جديدة" : "No new notifications"}</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`p-3 rounded-2xl border transition ${
                  !n.isRead ? "bg-indigo-50/40 border-indigo-100" : "bg-white border-slate-100"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-900">{n.title}</span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <p className="text-slate-600 leading-relaxed text-[11px]">{n.message}</p>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <button
            onClick={handleMarkAllRead}
            className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 transition"
          >
            {isRTL ? "تحديد الكل كمقروء" : "Mark all as read"}
          </button>
          <span className="text-[10px] text-slate-400">
            {notifications.filter((n) => !n.isRead).length} {isRTL ? "غير مقروءة" : "unread"}
          </span>
        </div>
      </div>
    </div>
  );
};
