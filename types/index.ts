export type Locale = "ar" | "fr" | "en";
export type Direction = "rtl" | "ltr";

export type StudentStatus = "active" | "suspended" | "paused" | "withdrawn" | "graduated";
export type PaymentStatus = "paid" | "partial" | "unpaid" | "overdue";
export type AttendanceStatus = "present" | "absent" | "late" | "excused";
export type InvoiceStatus = "paid" | "partially_paid" | "unpaid" | "overdue" | "cancelled";
export type PaymentMethod = "cash" | "ccp" | "baridimob" | "bank_transfer" | "other";

export interface Student {
  id: string;
  studentNumber?: string;
  firstName: string;
  lastName: string;
  photoUrl?: string;
  avatarUrl?: string;
  phone: string;
  email?: string;
  gender: "male" | "female";
  dateOfBirth: string;
  wilayaCode: number;
  wilayaName: string;
  address?: string;
  academicLevel: string;
  stream?: string;
  groupName: string;
  groupId: string;
  parentId: string;
  parentName: string;
  parentPhone: string;
  parentRelationship: string;
  enrollmentDate: string;
  status: StudentStatus;
  attendanceRate: number;
  averageGrade: number;
  totalDue: number;
  totalPaid: number;
  balance: number;
  monthlyFee: number;
}

export interface Teacher {
  id: string;
  fullName: string;
  avatarUrl?: string;
  phone: string;
  email: string;
  subjects: string[];
  groupsCount: number;
  studentsCount: number;
  hourlyRate: number;
  salaryType: "hourly" | "fixed" | "percentage";
  percentageShare?: number;
  completedHoursThisMonth: number;
  totalDueThisMonth: number;
  totalPaidThisMonth: number;
  balanceThisMonth: number;
  status: "active" | "inactive";
  todayClassesCount: number;
}

export interface Subject {
  id: string;
  code: string;
  nameAr: string;
  nameFr: string;
  color: string;
  active: boolean;
}

export interface ClassGroup {
  id: string;
  name: string;
  academicLevel: string;
  stream?: string;
  subjectId: string;
  subjectName: string;
  subjectColor: string;
  teacherId: string;
  teacherName: string;
  roomName: string;
  studentsCount: number;
  maxCapacity: number;
  scheduleDescription: string;
  dayOfWeek: number; // 0=Sunday, 6=Saturday
  startTime: string;
  endTime: string;
  monthlyFee: number;
}

export interface ClassSession {
  id: string;
  groupId: string;
  groupName: string;
  subjectName: string;
  subjectColor: string;
  teacherName: string;
  roomName: string;
  date: string;
  startTime: string;
  endTime: string;
  status: "scheduled" | "completed" | "cancelled";
  attendanceTaken: boolean;
  presentCount?: number;
  absentCount?: number;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  sessionId: string;
  status: AttendanceStatus;
  note?: string;
  timestamp: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  amount: number;
  discount?: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  studentId: string;
  studentName: string;
  parentId: string;
  parentName: string;
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  discountTotal: number;
  finalTotal: number;
  amountPaid: number;
  remainingBalance: number;
  status: InvoiceStatus;
  academicCycle: string;
  notes?: string;
}

export interface Payment {
  id: string;
  receiptNumber: string;
  invoiceId?: string;
  studentId: string;
  studentName: string;
  amount: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  referenceNumber?: string;
  notes?: string;
  recordedBy: string;
}

export interface Exam {
  id: string;
  title: string;
  type: "quiz" | "exam1" | "exam2" | "exam3" | "bac_blanc" | "bem_blanc";
  groupId: string;
  groupName: string;
  subjectName: string;
  date: string;
  durationMinutes: number;
  maxScore: number;
  averageScore?: number;
  highestScore?: number;
  lowestScore?: number;
}

export interface GradeEntry {
  id: string;
  examId: string;
  studentId: string;
  studentName: string;
  score: number;
  notes?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: "attendance" | "payment" | "exam" | "system";
  isRead: boolean;
}

export interface QuickTask {
  id: string;
  title: string;
  category: string;
  timeframe: string;
  iconType: "pen" | "book" | "alert";
  urgent: boolean;
}
