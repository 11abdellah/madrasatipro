export interface Wilaya {
  code: number;
  nameAr: string;
  nameFr: string;
}

export const ALGERIAN_WILAYAS: Wilaya[] = [
  { code: 1, nameAr: "أدرار", nameFr: "Adrar" },
  { code: 2, nameAr: "الشلف", nameFr: "Chlef" },
  { code: 3, nameAr: "الأغواط", nameFr: "Laghouat" },
  { code: 4, nameAr: "أم البواقي", nameFr: "Oum El Bouaghi" },
  { code: 5, nameAr: "باتنة", nameFr: "Batna" },
  { code: 6, nameAr: "بجاية", nameFr: "Béjaïa" },
  { code: 7, nameAr: "بسكرة", nameFr: "Biskra" },
  { code: 8, nameAr: "بشار", nameFr: "Béchar" },
  { code: 9, nameAr: "البليدة", nameFr: "Blida" },
  { code: 10, nameAr: "البويرة", nameFr: "Bouira" },
  { code: 11, nameAr: "تمنراست", nameFr: "Tamanrasset" },
  { code: 12, nameAr: "تبسة", nameFr: "Tébessa" },
  { code: 13, nameAr: "تلمسان", nameFr: "Tlemcen" },
  { code: 14, nameAr: "تيارت", nameFr: "Tiaret" },
  { code: 15, nameAr: "تيزي وزو", nameFr: "Tizi Ouzou" },
  { code: 16, nameAr: "الجزائر العاصمة", nameFr: "Alger" },
  { code: 17, nameAr: "الجلفة", nameFr: "Djelfa" },
  { code: 18, nameAr: "جيجل", nameFr: "Jijel" },
  { code: 19, nameAr: "سطيف", nameFr: "Sétif" },
  { code: 20, nameAr: "سعيدة", nameFr: "Saïda" },
  { code: 21, nameAr: "سكيكدة", nameFr: "Skikda" },
  { code: 22, nameAr: "سيدي بلعباس", nameFr: "Sidi Bel Abbès" },
  { code: 23, nameAr: "عنابة", nameFr: "Annaba" },
  { code: 24, nameAr: "قالمة", nameFr: "Guelma" },
  { code: 25, nameAr: "قسنطينة", nameFr: "Constantine" },
  { code: 26, nameAr: "المدية", nameFr: "Médéa" },
  { code: 27, nameAr: "مستغانم", nameFr: "Mostaganem" },
  { code: 28, nameAr: "المسيلة", nameFr: "M'Sila" },
  { code: 29, nameAr: "معسكر", nameFr: "Mascara" },
  { code: 30, nameAr: "ورقلة", nameFr: "Ouargla" },
  { code: 31, nameAr: "وهران", nameFr: "Oran" },
  { code: 32, nameAr: "البيض", nameFr: "El Bayadh" },
  { code: 33, nameAr: "إليزي", nameFr: "Illizi" },
  { code: 34, nameAr: "برج بوعريريج", nameFr: "Bordj Bou Arréridj" },
  { code: 35, nameAr: "بومرداس", nameFr: "Boumerdès" },
  { code: 36, nameAr: "الطارف", nameFr: "El Tarf" },
  { code: 37, nameAr: "تندوف", nameFr: "Tindouf" },
  { code: 38, nameAr: "تيسمسيلت", nameFr: "Tissemsilt" },
  { code: 39, nameAr: "الوادي", nameFr: "El Oued" },
  { code: 40, nameAr: "خنشلة", nameFr: "Khenchela" },
  { code: 41, nameAr: "سوق أهراس", nameFr: "Souk Ahras" },
  { code: 42, nameAr: "تيبازة", nameFr: "Tipaza" },
  { code: 43, nameAr: "ميلة", nameFr: "Mila" },
  { code: 44, nameAr: "عين الدفلى", nameFr: "Aïn Defla" },
  { code: 45, nameAr: "النعامة", nameFr: "Naâma" },
  { code: 46, nameAr: "عين تموشنت", nameFr: "Aïn Témouchent" },
  { code: 47, nameAr: "غرداية", nameFr: "Ghardaïa" },
  { code: 48, nameAr: "غليزان", nameFr: "Relizane" },
  { code: 49, nameAr: "تيميمون", nameFr: "Timimoun" },
  { code: 50, nameAr: "برج باجي مختار", nameFr: "Bordj Badji Mokhtar" },
  { code: 51, nameAr: "أولاد جلال", nameFr: "Ouled Djellal" },
  { code: 52, nameAr: "بني عباس", nameFr: "Béni Abbès" },
  { code: 53, nameAr: "عين صالح", nameFr: "In Salah" },
  { code: 54, nameAr: "عين قزام", nameFr: "In Guezzam" },
  { code: 55, nameAr: "تقرت", nameFr: "Touggourt" },
  { code: 56, nameAr: "جانت", nameFr: "Djanet" },
  { code: 57, nameAr: "المغير", nameFr: "El M'Ghair" },
  { code: 58, nameAr: "المنيعة", nameFr: "El Meniaa" },
];

export interface AcademicCycle {
  id: string;
  nameAr: string;
  nameFr: string;
  levels: { id: string; nameAr: string; nameFr: string }[];
}

export const DEFAULT_ACADEMIC_CYCLES: AcademicCycle[] = [
  {
    id: "secondary",
    nameAr: "التعليم الثانوي",
    nameFr: "Enseignement Secondaire",
    levels: [
      { id: "3AS", nameAr: "3 ثانوي (بكالوريا BAC)", nameFr: "3ème Année Secondaire (BAC)" },
      { id: "2AS", nameAr: "2 ثانوي", nameFr: "2ème Année Secondaire" },
      { id: "1AS", nameAr: "1 ثانوي (جذع مشترك)", nameFr: "1ère Année Secondaire" },
    ],
  },
  {
    id: "middle",
    nameAr: "التعليم المتوسط",
    nameFr: "Enseignement Moyen",
    levels: [
      { id: "4AM", nameAr: "4 متوسط (شهادة BEM)", nameFr: "4ème Année Moyenne (BEM)" },
      { id: "3AM", nameAr: "3 متوسط", nameFr: "3ème Année Moyenne" },
      { id: "2AM", nameAr: "2 متوسط", nameFr: "2ème Année Moyenne" },
      { id: "1AM", nameAr: "1 متوسط", nameFr: "1ère Année Moyenne" },
    ],
  },
  {
    id: "primary",
    nameAr: "التعليم الابتدائي",
    nameFr: "Enseignement Primaire",
    levels: [
      { id: "5AP", nameAr: "5 ابتدائي", nameFr: "5ème Année Primaire" },
      { id: "4AP", nameAr: "4 ابتدائي", nameFr: "4ème Année Primaire" },
      { id: "3AP", nameAr: "3 ابتدائي", nameFr: "3ème Année Primaire" },
      { id: "2AP", nameAr: "2 ابتدائي", nameFr: "2ème Année Primaire" },
      { id: "1AP", nameAr: "1 ابتدائي", nameFr: "1ère Année Primaire" },
    ],
  },
  {
    id: "languages",
    nameAr: "اللغات الحية والتكوين",
    nameFr: "Langues & Formation",
    levels: [
      { id: "LANG_EN_A1", nameAr: "إنجليزية — مستوى A1/A2", nameFr: "Anglais — A1/A2" },
      { id: "LANG_EN_B1", nameAr: "إنجليزية — مستوى B1/B2", nameFr: "Anglais — B1/B2" },
      { id: "LANG_FR_TC", nameAr: "فرنسية — تحسين المحادثة والكتابة", nameFr: "Français — Perfectionnement" },
      { id: "LANG_DE", nameAr: "لغة ألمانية للطلبة", nameFr: "Allemand Débutant" },
    ],
  },
];

export const ACADEMIC_STREAMS = [
  { id: "SE", nameAr: "علوم تجريبية", nameFr: "Sciences Expérimentales" },
  { id: "M", nameAr: "رياضيات", nameFr: "Mathématiques" },
  { id: "TM", nameAr: "تقني رياضي", nameFr: "Technique Mathématique" },
  { id: "GE", nameAr: "تسيير واقتصاد", nameFr: "Gestion et Économie" },
  { id: "LPH", nameAr: "آداب وفلسفة", nameFr: "Lettres et Philosophie" },
  { id: "LE", nameAr: "لغات أجنبية", nameFr: "Langues Étrangères" },
];
