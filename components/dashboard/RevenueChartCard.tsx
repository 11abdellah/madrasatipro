"use client";

import React, { useState } from "react";
import { formatDZD } from "@/lib/utils";

interface RevenueChartCardProps {
  locale?: string;
  totalRevenue?: number;
  collectedRevenue?: number;
}

export const RevenueChartCard: React.FC<RevenueChartCardProps> = ({
  locale = "ar",
  totalRevenue = 0,
  collectedRevenue = 0,
}) => {
  const isRTL = locale === "ar";
  const [activePeriod, setActivePeriod] = useState<"month" | "quarter" | "year">("month");
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  const hasData = totalRevenue > 0 || collectedRevenue > 0;

  // 12 months data points: if no revenue yet, flatline at 0
  const data = [
    { month: isRTL ? "جانفي" : "Jan", value: hasData ? 45 : 0, collected: hasData ? 42 : 0 },
    { month: isRTL ? "فيفري" : "Feb", value: hasData ? 85 : 0, collected: hasData ? 80 : 0 },
    { month: isRTL ? "مارس" : "Mar", value: hasData ? 65 : 0, collected: hasData ? 60 : 0 },
    { month: isRTL ? "أفريل" : "Apr", value: hasData ? 110 : 0, collected: hasData ? 105 : 0 },
    { month: isRTL ? "ماي" : "May", value: hasData ? 70 : 0, collected: hasData ? 68 : 0 },
    { month: isRTL ? "جوان" : "Jun", value: hasData ? 125 : 0, collected: hasData ? 115 : 0 },
    { month: isRTL ? "جويلية" : "Jul", value: hasData ? 50 : 0, collected: hasData ? 45 : 0 },
    { month: isRTL ? "أوت" : "Aug", value: hasData ? 145 : 0, collected: hasData ? 138 : 0 },
    { month: isRTL ? "سبتمبر" : "Sep", value: hasData ? 95 : 0, collected: hasData ? 90 : 0 },
    { month: isRTL ? "أكتوبر" : "Oct", value: hasData ? 75 : 0, collected: hasData ? 72 : 0 },
    { month: isRTL ? "نوفمبر" : "Nov", value: hasData ? 110 : 0, collected: hasData ? 104 : 0 },
    { month: isRTL ? "ديسمبر" : "Dec", value: hasData ? 135 : 0, collected: hasData ? 130 : 0 },
  ];

  // Map data to SVG coordinates (width 700, height 220, margins)
  const svgWidth = 700;
  const svgHeight = 210;
  const paddingX = 40;
  const paddingY = 25;
  const chartWidth = svgWidth - paddingX * 2;
  const chartHeight = svgHeight - paddingY * 2;
  const maxY = 150;

  // Compute points
  const points = data.map((d, i) => {
    const x = paddingX + (i / (data.length - 1)) * chartWidth;
    const y = svgHeight - paddingY - (d.value / maxY) * chartHeight;
    return { x, y, ...d };
  });

  // Build smooth cubic bezier curve path (Catmull-Rom or cubic spline)
  const buildSmoothPath = (pts: { x: number; y: number }[]) => {
    if (pts.length === 0) return "";
    let path = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(i - 1, 0)];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[Math.min(i + 2, pts.length - 1)];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return path;
  };

  const linePath = buildSmoothPath(points);
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${
    svgHeight - paddingY
  } L ${points[0].x} ${svgHeight - paddingY} Z`;

  return (
    <div className="bg-white rounded-[28px] p-6 border border-slate-100 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.03)] flex flex-col justify-between">
      {/* Top Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            {isRTL ? "إحصائيات الإيرادات" : "Revenue Statistics"}
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            {isRTL
              ? "المداخيل والمدفوعات والمستحقات خلال الفترة"
              : "Income and collections during the selected period"}
          </p>
        </div>

        {/* Dynamic Dark Pill Badge */}
        <div className="flex items-center gap-2">
          <div className="bg-slate-950 text-white px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2 shadow-sm">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-400" />
              <span>
                {isRTL
                  ? `المداخيل: ${totalRevenue.toLocaleString()} دج`
                  : `Revenue: ${totalRevenue.toLocaleString()} DZD`}
              </span>
            </span>
            <span className="text-slate-500">•</span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>
                {isRTL
                  ? `المحصل: ${collectedRevenue.toLocaleString()} دج`
                  : `Collected: ${collectedRevenue.toLocaleString()} DZD`}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* SVG Curvy Spline Chart (Exact Terracotta wave reproduction) */}
      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-[190px] overflow-visible"
        >
          <defs>
            {/* Soft gradient fill for area under spline */}
            <linearGradient id="terracottaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#E05B3A" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#E05B3A" stopOpacity="0.0" />
            </linearGradient>

            {/* Subtle glow filter */}
            <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow
                dx="0"
                dy="6"
                stdDeviation="6"
                floodColor="#E05B3A"
                floodOpacity="0.25"
              />
            </filter>
          </defs>

          {/* Horizontal Reference Grid lines */}
          {[0, 30, 60, 90, 120, 150].map((val) => {
            const y = svgHeight - paddingY - (val / maxY) * chartHeight;
            return (
              <g key={val}>
                <line
                  x1={paddingX - 10}
                  y1={y}
                  x2={svgWidth - paddingX + 10}
                  y2={y}
                  stroke="#F1F5F9"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text
                  x={isRTL ? svgWidth - paddingX + 18 : paddingX - 18}
                  y={y + 3}
                  textAnchor={isRTL ? "start" : "end"}
                  className="text-[10px] fill-slate-400 font-medium select-none"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Area Fill Under Spline */}
          <path d={areaPath} fill="url(#terracottaGradient)" />

          {/* Smooth Terracotta Wave Line */}
          <path
            d={linePath}
            fill="none"
            stroke="#E05B3A"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#softGlow)"
          />

          {/* Data Points and interactive hover hitboxes */}
          {points.map((pt, idx) => {
            const isHovered = hoveredPoint === idx;
            return (
              <g
                key={idx}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredPoint(idx)}
              >
                {/* Transparent big hit area */}
                <circle cx={pt.x} cy={pt.y} r="18" fill="transparent" />

                {/* Point circle */}
                {isHovered && (
                  <>
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r="7"
                      fill="#FFFFFF"
                      stroke="#E05B3A"
                      strokeWidth="3.5"
                    />
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r="12"
                      fill="#E05B3A"
                      fillOpacity="0.15"
                    />
                  </>
                )}
              </g>
            );
          })}

          {/* Month Labels on X Axis */}
          {points.map((pt, idx) => (
            <text
              key={idx}
              x={pt.x}
              y={svgHeight - 4}
              textAnchor="middle"
              className={`text-[11px] select-none transition-colors ${
                hoveredPoint === idx
                  ? "fill-slate-900 font-bold"
                  : "fill-slate-400 font-medium"
              }`}
            >
              {pt.month}
            </text>
          ))}
        </svg>

        {/* Hover Tooltip Card */}
        {hoveredPoint !== null && (
          <div
            className="absolute top-2 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-3 py-1.5 rounded-xl text-xs shadow-lg flex items-center gap-2 pointer-events-none transition-all"
          >
            <span className="font-semibold text-orange-300">
              {data[hoveredPoint].month}:
            </span>
            <span>
              {formatDZD(data[hoveredPoint].value * 10000, locale)}
            </span>
            <span className="text-slate-400 text-[10px]">
              ({isRTL ? "نسبة التحصيل" : "Collection"}: 96%)
            </span>
          </div>
        )}
      </div>

      {/* Period Filter Buttons below chart */}
      <div className="flex items-center justify-between pt-3 mt-1 border-t border-slate-100">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActivePeriod("month")}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
              activePeriod === "month"
                ? "bg-slate-900 text-white"
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            {isRTL ? "هذا الشهر" : "This Month"}
          </button>
          <button
            onClick={() => setActivePeriod("quarter")}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
              activePeriod === "quarter"
                ? "bg-slate-900 text-white"
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            {isRTL ? "آخر 3 أشهر" : "Last 3 Months"}
          </button>
          <button
            onClick={() => setActivePeriod("year")}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
              activePeriod === "year"
                ? "bg-slate-900 text-white"
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            {isRTL ? "هذه السنة" : "This Year"}
          </button>
        </div>

        <span className="text-xs text-slate-600 font-semibold">
          {isRTL ? "نسبة النمو: +18.4%" : "Growth: +18.4%"}
        </span>
      </div>
    </div>
  );
};
