import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDZD(amount: number, locale: string = "ar"): string {
  const formatted = new Intl.NumberFormat(locale === "ar" ? "ar-DZ" : "fr-DZ", {
    maximumFractionDigits: 0,
  }).format(amount);

  if (locale === "ar") {
    return `${formatted} دج`;
  }
  return `${formatted} DZD`;
}

export function formatPercentage(val: number): string {
  return `${val}%`;
}

const ARABIC_MONTHS = [
  "جانفي", "فيفري", "مارس", "أفريل", "ماي", "جوان",
  "جويلية", "أوت", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
];

const ARABIC_DAYS = [
  "الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"
];

/**
 * Returns current date string in Africa/Algiers timezone (YYYY-MM-DD)
 */
export function getAlgiersTodayStr(): string {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Algiers",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(now); // outputs YYYY-MM-DD
}

/**
 * Returns current month-year string in Africa/Algiers timezone (YYYY-MM)
 */
export function getAlgiersCurrentMonth(): string {
  return getAlgiersTodayStr().slice(0, 7);
}

/**
 * Format any date into clear Algerian Arabic format
 * e.g. "الأحد، 27 سبتمبر 2026" or "27 سبتمبر 2026"
 */
export function formatDateAlgiers(
  dateInput: string | Date | null | undefined,
  includeDayName: boolean = false
): string {
  if (!dateInput) return "—";

  try {
    let dateObj: Date;
    if (typeof dateInput === "string") {
      // If YYYY-MM-DD, append T12:00:00 to avoid UTC midnight shifts
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
        dateObj = new Date(`${dateInput}T12:00:00Z`);
      } else {
        dateObj = new Date(dateInput);
      }
    } else {
      dateObj = dateInput;
    }

    if (isNaN(dateObj.getTime())) return String(dateInput);

    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "Africa/Algiers",
      year: "numeric",
      month: "numeric",
      day: "numeric",
    }).formatToParts(dateObj);

    const year = parts.find((p) => p.type === "year")?.value || "";
    const monthNum = parseInt(parts.find((p) => p.type === "month")?.value || "1", 10);
    const day = parts.find((p) => p.type === "day")?.value || "";
    const dayOfWeek = dateObj.getDay();

    const monthName = ARABIC_MONTHS[monthNum - 1] || "";
    const dayName = ARABIC_DAYS[dayOfWeek] || "";

    if (includeDayName) {
      return `${dayName}، ${day} ${monthName} ${year}`;
    }
    return `${day} ${monthName} ${year}`;
  } catch {
    return String(dateInput);
  }
}

/**
 * Normalizes dates from formats like DD/MM/YYYY or YYYY-MM-DD into canonical YYYY-MM-DD
 */
export function normalizeDateStr(dateStr?: string | null): string {
  if (!dateStr) return getAlgiersTodayStr();
  const trimmed = dateStr.trim();
  // If DD/MM/YYYY or DD-MM-YYYY
  const dmyMatch = trimmed.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (dmyMatch) {
    const day = dmyMatch[1].padStart(2, "0");
    const month = dmyMatch[2].padStart(2, "0");
    const year = dmyMatch[3];
    return `${year}-${month}-${day}`;
  }
  // If YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }
  return trimmed;
}

/**
 * Calculates next monthly payment date using calendar-month arithmetic.
 * Preserves anchor day of month and handles month-end edge cases (e.g. Jan 31 -> Feb 28 -> Mar 31).
 */
export function calculateNextMonthlyPaymentDate(
  startDateStr?: string | null,
  lastPaidMonthOrDate?: string | null
): string {
  const normalizedStart = normalizeDateStr(startDateStr || getAlgiersTodayStr());
  const [startYear, startMonth, startDay] = normalizedStart.split("-").map(Number);
  const anchorDay = startDay || 1;

  if (!lastPaidMonthOrDate) {
    // 1st payment is due 1 calendar month after start date
    let targetMonth = startMonth + 1;
    let targetYear = startYear;
    if (targetMonth > 12) {
      targetMonth = 1;
      targetYear += 1;
    }
    const daysInTargetMonth = new Date(targetYear, targetMonth, 0).getDate();
    const safeDay = Math.min(anchorDay, daysInTargetMonth);
    return `${targetYear}-${String(targetMonth).padStart(2, "0")}-${String(safeDay).padStart(2, "0")}`;
  }

  // If a payment was made, determine target month following the last paid period
  const normalizedPaid = normalizeDateStr(lastPaidMonthOrDate);
  const [paidYear, paidMonth] = normalizedPaid.split("-").map(Number);

  let targetMonth = paidMonth + 1;
  let targetYear = paidYear;
  if (targetMonth > 12) {
    targetMonth = 1;
    targetYear += 1;
  }

  const daysInTargetMonth = new Date(targetYear, targetMonth, 0).getDate();
  const safeDay = Math.min(anchorDay, daysInTargetMonth);
  return `${targetYear}-${String(targetMonth).padStart(2, "0")}-${String(safeDay).padStart(2, "0")}`;
}

/**
 * Determines teacher payroll status based on due date in Africa/Algiers timezone
 */
export function getTeacherPayrollStatus(
  salary: number,
  nextPaymentDateStr: string,
  algiersTodayStr?: string
): {
  code: "DUE_SOON" | "OVERDUE" | "PAID";
  labelAr: string;
  badgeClass: string;
} {
  const today = algiersTodayStr || getAlgiersTodayStr();
  if (!nextPaymentDateStr) {
    return {
      code: "PAID",
      labelAr: "مدفوع",
      badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    };
  }

  if (today >= nextPaymentDateStr) {
    return {
      code: "OVERDUE",
      labelAr: "متأخر",
      badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
    };
  }

  const todayMs = new Date(`${today}T00:00:00Z`).getTime();
  const nextMs = new Date(`${nextPaymentDateStr}T00:00:00Z`).getTime();
  const diffDays = Math.ceil((nextMs - todayMs) / (1000 * 60 * 60 * 24));

  if (diffDays <= 7) {
    return {
      code: "DUE_SOON",
      labelAr: "مستحق قريباً",
      badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
    };
  }

  return {
    code: "PAID",
    labelAr: "مدفوع",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
  };
}
