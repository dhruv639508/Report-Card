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
  schoolName: string;
  schoolAddress: string;
  phone: string;
  email: string;
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

export function getFaTotal(s: SubjectMarks) {
  return s.fa1 + s.fa2 + s.fa3 + s.fa4;
}

export function getSaTotal(s: SubjectMarks) {
  return s.sa1 + s.sa2;
}

export function getGrandTotal(s: SubjectMarks) {
  return getFaTotal(s) + getSaTotal(s);
}

export function getFaMax() { return FA_MAX * 4; } // 100
export function getSaMax() { return SA_MAX * 2; } // 100
export function getSubjectMax() { return getFaMax() + getSaMax(); } // 200

export function getFaGrade(s: SubjectMarks): string {
  const max = getFaMax();
  return getGrade((getFaTotal(s) / max) * 100);
}

export function getSaGrade(s: SubjectMarks): string {
  const max = getSaMax();
  return getGrade((getSaTotal(s) / max) * 100);
}

export function getGrandGrade(s: SubjectMarks): string {
  const max = getSubjectMax();
  return getGrade((getGrandTotal(s) / max) * 100);
}

export function getOverallFaObtained(subjects: SubjectMarks[]) {
  return subjects.reduce((sum, s) => sum + getFaTotal(s), 0);
}

export function getOverallSaObtained(subjects: SubjectMarks[]) {
  return subjects.reduce((sum, s) => sum + getSaTotal(s), 0);
}

export function getOverallObtained(subjects: SubjectMarks[]) {
  return subjects.reduce((sum, s) => sum + getGrandTotal(s), 0);
}

export function getOverallMax(subjects: SubjectMarks[]) {
  return subjects.length * getSubjectMax();
}

export function getOverallPercentage(subjects: SubjectMarks[]) {
  const max = getOverallMax(subjects);
  return max > 0 ? (getOverallObtained(subjects) / max) * 100 : 0;
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
    schoolName: "Keerti Global Academy",
    schoolAddress: "Sharifpur, Hapur, Uttar Pradesh - 245101",
    phone: "+91 8630237314",
    email: "keertiglobalacademy24032025@gmail.com",
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
