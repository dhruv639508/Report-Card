import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { StudentData, createEmptyStudent } from "@/types/reportCard";
import StudentForm from "@/components/StudentForm";
import ReportCardPreview from "@/components/ReportCardPreview";
import { Printer, Download, Plus, Trash2, ChevronLeft, ChevronRight } from "lucide-react";

const STORAGE_KEY = "report-card-students-v3";

function loadStudents(): StudentData[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Validate structure
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].subjects?.[0]?.fa1 !== undefined) {
        return parsed;
      }
    }
  } catch {}
  return [createEmptyStudent()];
}

export default function Index() {
  const [students, setStudents] = useState<StudentData[]>(loadStudents);
  const [activeIdx, setActiveIdx] = useState(0);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
  }, [students]);

  const active = students[activeIdx] || students[0];

  const updateStudent = (updated: StudentData) => {
    setStudents(prev => prev.map((s, i) => (i === activeIdx ? updated : s)));
  };

  const addStudent = () => {
    const newStudent = createEmptyStudent();
    newStudent.schoolName = active.schoolName;
    newStudent.schoolAddress = active.schoolAddress;
    newStudent.phone = active.phone;
    newStudent.email = active.email;
    newStudent.logoUrl = active.logoUrl;
    newStudent.session = active.session;
    setStudents(prev => [...prev, newStudent]);
    setActiveIdx(students.length);
  };

  const removeStudent = () => {
    if (students.length <= 1) return;
    setStudents(prev => prev.filter((_, i) => i !== activeIdx));
    setActiveIdx(Math.max(0, activeIdx - 1));
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow || !previewRef.current) return;
    const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map(el => el.outerHTML).join("");
    printWindow.document.write(`<!DOCTYPE html><html><head>${styles}<style>
      body{margin:0;padding:0;background:white}
      @page{size:A4;margin:0}
      .print-area{width:210mm;min-height:297mm;padding:8mm 12mm}
    </style></head><body>${previewRef.current.innerHTML}</body></html>`);
    printWindow.document.close();
    printWindow.onload = () => { printWindow.print(); printWindow.close(); };
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <header className="no-print sticky top-0 z-50 bg-card border-b border-border px-6 py-3 flex items-center justify-between shadow-sm">
        <h1 className="text-lg font-bold text-primary tracking-tight">📝 Report Card Generator</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={addStudent}>
            <Plus className="w-4 h-4 mr-1" /> Add Student
          </Button>
          <Button variant="outline" size="sm" onClick={removeStudent} disabled={students.length <= 1}>
            <Trash2 className="w-4 h-4 mr-1" /> Remove
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-1" /> Print
          </Button>
          <Button size="sm" onClick={handlePrint}>
            <Download className="w-4 h-4 mr-1" /> Download PDF
          </Button>
        </div>
      </header>

      {/* Student Tabs */}
      {students.length > 1 && (
        <div className="no-print bg-card border-b border-border px-6 py-2 flex items-center gap-2 overflow-x-auto">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setActiveIdx(Math.max(0, activeIdx - 1))} disabled={activeIdx === 0}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          {students.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setActiveIdx(i)}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${i === activeIdx ? "bg-primary text-primary-foreground font-semibold" : "bg-muted text-muted-foreground hover:bg-accent"}`}
            >
              {s.name || `Student ${i + 1}`}
            </button>
          ))}
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setActiveIdx(Math.min(students.length - 1, activeIdx + 1))} disabled={activeIdx === students.length - 1}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Main Content */}
      <div className="no-print max-w-4xl mx-auto px-4 py-5">
        <StudentForm student={active} onChange={updateStudent} />
      </div>

      {/* Preview */}
      <div className="no-print px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-base font-bold text-primary mb-2">📋 Report Card Preview</h2>
        </div>
      </div>
      <div className="flex justify-center pb-8 px-4" ref={previewRef}>
        <div className="shadow-lg border border-border rounded-lg overflow-hidden">
          <ReportCardPreview student={active} />
        </div>
      </div>
    </div>
  );
}
