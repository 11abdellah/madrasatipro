import { prisma } from "@/lib/prisma";

export interface CanonicalSubject {
  code: string;
  nameAr: string;
  nameFr: string;
  color: string;
}

export const CANONICAL_ALGERIAN_SUBJECTS: CanonicalSubject[] = [
  { code: "MATH", nameAr: "الرياضيات", nameFr: "Mathématiques", color: "#6366F1" },
  { code: "PHYS", nameAr: "العلوم الفيزيائية", nameFr: "Physique-Chimie", color: "#0EA5E9" },
  { code: "SCI", nameAr: "علوم الطبيعة والحياة", nameFr: "Sciences Naturelles", color: "#10B981" },
  { code: "ARA", nameAr: "اللغة العربية وآدابها", nameFr: "Langue Arabe", color: "#8B5CF6" },
  { code: "FRA", nameAr: "اللغة الفرنسية", nameFr: "Français", color: "#EC4899" },
  { code: "ENG", nameAr: "اللغة الإنجليزية", nameFr: "Anglais", color: "#F59E0B" },
  { code: "HIST_GEO", nameAr: "التاريخ والجغرافيا", nameFr: "Histoire-Géographie", color: "#D97706" },
  { code: "ISLAMIC", nameAr: "العلوم الإسلامية", nameFr: "Sciences Islamiques", color: "#059669" },
  { code: "PHIL", nameAr: "الفلسفة", nameFr: "Philosophie", color: "#64748B" },
  { code: "INFO", nameAr: "الإعلام الآلي", nameFr: "Informatique", color: "#0284C7" },
  { code: "ECO", nameAr: "الاقتصاد والمناجمنت", nameFr: "Économie & Management", color: "#4F46E5" },
  { code: "LAW", nameAr: "القانون", nameFr: "Droit", color: "#7C3AED" },
  { code: "CIVIL", nameAr: "الهندسة المدنية", nameFr: "Génie Civil", color: "#EA580C" },
  { code: "ELEC", nameAr: "الهندسة الكهربائية", nameFr: "Génie Électrique", color: "#E11D48" },
  { code: "MECH", nameAr: "الهندسة الميكانيكية", nameFr: "Génie Mécanique", color: "#475569" },
  { code: "METHOD", nameAr: "هندسة الطرائق", nameFr: "Génie des Procédés", color: "#0D9488" },
  { code: "AMAZIGH", nameAr: "اللغة الأمازيغية", nameFr: "Langue Amazighe", color: "#EAB308" },
  { code: "ITALIAN", nameAr: "اللغة الإيطالية", nameFr: "Italien", color: "#16A34A" },
  { code: "GERMAN", nameAr: "اللغة الألمانية", nameFr: "Allemand", color: "#DC2626" },
  { code: "SPANISH", nameAr: "اللغة الإسبانية", nameFr: "Espagnol", color: "#CA8A04" },
];

/**
 * Ensures that an institution has all standard Algerian curriculum subjects available.
 * Does NOT duplicate existing subjects.
 */
export async function ensureInstitutionSubjects(institutionId: string, customPrisma?: any) {
  const db = customPrisma || prisma;
  if (!institutionId) return [];

  const existing = await db.subject.findMany({
    where: { institutionId },
    select: { id: true, code: true, nameAr: true, color: true, active: true },
  });

  const existingCodes = new Set(existing.map((s: any) => s.code.toUpperCase()));
  const existingNames = new Set(existing.map((s: any) => s.nameAr.trim()));

  const missing = CANONICAL_ALGERIAN_SUBJECTS.filter(
    (s) => !existingCodes.has(s.code.toUpperCase()) && !existingNames.has(s.nameAr.trim())
  );

  if (missing.length > 0) {
    for (const sub of missing) {
      await db.subject.create({
        data: {
          institutionId,
          code: sub.code,
          nameAr: sub.nameAr,
          nameFr: sub.nameFr,
          color: sub.color,
          active: true,
        },
      });
    }

    return await db.subject.findMany({
      where: { institutionId, active: true },
      orderBy: { nameAr: "asc" },
      select: { id: true, code: true, nameAr: true, color: true },
    });
  }

  return existing;
}
