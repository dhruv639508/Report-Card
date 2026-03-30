// ─── SCHOOL CONSTANTS — sirf yahan change karo ───────────────────────────────
export const SCHOOL_NAME    = "Keerti Global Academy";
export const SCHOOL_ADDRESS = "Sharifpur, Hapur, Uttar Pradesh - 245101";
export const SCHOOL_PHONE   = "+91 8630237314";
export const SCHOOL_EMAIL   = "keertiglobalacademy24032025@gmail.com";
// ─────────────────────────────────────────────────────────────────────────────

export interface SubjectMarks {
  name: string;
  fa1: number;
  fa2: number;
  fa3: number;
  fa4: number;
  sa1: number;
  sa2: number;
}

export interface StudentData {
  id: string;
  name: string;
  className: string;
  section: string;
  rollNumber: string;
  admissionNumber: string;
  dob: string;
  session: string;
  logoUrl: string;
  subjects: SubjectMarks[];
  remarks: string;
  totalDays: number;
  presentDays: number;
  positionInClass: string;
  result: string;
  performance: string;
  behavior: string;
  classParticipation: string;
  discipline: string;
  teacherRemarks: string;
}

export const FA_MAX = 25;
export const SA_MAX = 50;

export const SUBJECT_NAMES = [
  "English",
  "Hindi",
  "Mathematics",
  "EVS/Science",
  "Drawing",
  "Sanskrit",
  "Computer",
  "GK",
];

export const DEFAULT_SUBJECTS: SubjectMarks[] = SUBJECT_NAMES.map(name => ({
  name,
  fa1: 0, fa2: 0, fa3: 0, fa4: 0,
  sa1: 0, sa2: 0,
}));

export function getGrade(percentage: number): string {
  if (percentage >= 90) return "A+";
  if (percentage >= 80) return "A";
  if (percentage >= 70) return "B+";
  if (percentage >= 60) return "B";
  if (percentage >= 50) return "C";
  return "D";
}

export function getFaTotal(s: SubjectMarks)    { return s.fa1 + s.fa2 + s.fa3 + s.fa4; }
export function getSaTotal(s: SubjectMarks)    { return s.sa1 + s.sa2; }
export function getGrandTotal(s: SubjectMarks) { return getFaTotal(s) + getSaTotal(s); }
export function getFaMax()     { return FA_MAX * 4; }   // 100
export function getSaMax()     { return SA_MAX * 2; }   // 100
export function getSubjectMax(){ return getFaMax() + getSaMax(); } // 200

// ─── A subject counts only if ANY mark has been entered ───────────────────────
export function isSubjectActive(s: SubjectMarks): boolean {
  return getGrandTotal(s) > 0;
}
// ─────────────────────────────────────────────────────────────────────────────

export function getFaGrade(s: SubjectMarks): string {
  return getGrade((getFaTotal(s) / getFaMax()) * 100);
}
export function getSaGrade(s: SubjectMarks): string {
  return getGrade((getSaTotal(s) / getSaMax()) * 100);
}
export function getGrandGrade(s: SubjectMarks): string {
  return getGrade((getGrandTotal(s) / getSubjectMax()) * 100);
}

export function getOverallObtained(subjects: SubjectMarks[]) {
  return subjects.reduce((sum, s) => sum + getGrandTotal(s), 0);
}

// ─── Max = only active (filled) subjects ──────────────────────────────────────
export function getOverallMax(subjects: SubjectMarks[]) {
  const active = subjects.filter(isSubjectActive).length;
  return active * getSubjectMax();
}
// ─────────────────────────────────────────────────────────────────────────────

export function getOverallPercentage(subjects: SubjectMarks[]) {
  const max = getOverallMax(subjects);
  return max > 0 ? (getOverallObtained(subjects) / max) * 100 : 0;
}
export function getOverallFaObtained(subjects: SubjectMarks[]) {
  return subjects.reduce((sum, s) => sum + getFaTotal(s), 0);
}
export function getOverallSaObtained(subjects: SubjectMarks[]) {
  return subjects.reduce((sum, s) => sum + getSaTotal(s), 0);
}

// FA active max — only subjects where FA marks were entered
export function getActiveFaMax(subjects: SubjectMarks[]) {
  return subjects.filter(s => getFaTotal(s) > 0).length * getFaMax();
}
// SA active max — only subjects where SA marks were entered
export function getActiveSaMax(subjects: SubjectMarks[]) {
  return subjects.filter(s => getSaTotal(s) > 0).length * getSaMax();
}

export function createEmptyStudent(): StudentData {
  return {
    id: crypto.randomUUID(),
    name: "",
    className: "",
    section: "",
    rollNumber: "",
    admissionNumber: "",
    dob: "",
    session: "2025-2026",
    logoUrl: "",
    subjects: DEFAULT_SUBJECTS.map(s => ({ ...s })),
    remarks: "",
    totalDays: 0,
    presentDays: 0,
    positionInClass: "",
    result: "",
    performance: "Good",
    behavior: "Good",
    classParticipation: "Good",
    discipline: "Good",
    teacherRemarks: "",
  };
}
