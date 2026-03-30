import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { StudentData, createEmptyStudent } from "@/types/reportCard";
import StudentForm from "@/components/StudentForm";
import ReportCardPreview from "@/components/ReportCardPreview";
import { Printer, Download, Plus, Trash2, ChevronLeft, ChevronRight } from "lucide-react";

const STORAGE_KEY = "report-card-students-v6";

function loadStudents(): StudentData[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].subjects?.[0]?.fa1 !== undefined) {
        return parsed;
      }
    }
  } catch {}
  return [createEmptyStudent()];
}

// Opens a print window — used for both Print and Save as PDF
function openPrintWindow(html: string, title: string) {
  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>${title}</title>
  <style>
    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    body { margin: 0; padding: 0; background: white; }
    @page { size: A4; margin: 0; }
    .print-area { width: 210mm; min-height: 297mm; padding: 8mm 12mm; }
    .no-print { display: none !important; }
  </style>
</head>
<body>
  ${html}
  <script>
    window.onload = function() {
      window.focus();
      window.print();
    };
  </script>
</body>
</html>`);
  win.document.close();
}

export default function Index() {
  const [students, setStudents]   = useState<StudentData[]>(loadStudents);
  const [activeIdx, setActiveIdx] = useState(0);
  const previewRef                = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
  }, [students]);

  const active = students[activeIdx] || students[0];

  const updateStudent = (updated: StudentData) =>
    setStudents(prev => prev.map((s, i) => (i === activeIdx ? updated : s)));

  const addStudent = () => {
    const s = createEmptyStudent();
    s.session = active.session;
    setStudents(prev => [...prev, s]);
    setActiveIdx(students.length);
  };

  const removeStudent = () => {
    if (students.length <= 1) return;
    setStudents(prev => prev.filter((_, i) => i !== activeIdx));
    setActiveIdx(Math.max(0, activeIdx - 1));
  };

  const getPreviewHTML = () => {
    if (!previewRef.current) return "";
    // Inline all styles from the page so the new window renders correctly
    const styleSheets = Array.from(document.styleSheets)
      .map(sheet => {
        try {
          return Array.from(sheet.cssRules).map(r => r.cssText).join("\n");
        } catch { return ""; }
      }).join("\n");
    return `<style>${styleSheets}</style>${previewRef.current.innerHTML}`;
  };

  const handlePrint = () => {
    const name = active.name?.trim() || "Report Card";
    openPrintWindow(getPreviewHTML(), name);
  };

  const handleDownloadPDF = () => {
    const name = active.name?.trim().replace(/\s+/g, "_") || "Student";
    const cls  = active.className?.trim().replace(/\s+/g, "_") || "Class";
    openPrintWindow(getPreviewHTML(), `${name}_${cls}`);
  };

  return (
    <div className="min-h-screen bg-background">

      {/* ── Top Bar ── */}
      <header className="no-print sticky top-0 z-50 bg-card border-b border-border px-6 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <img src="/school-logo.png" alt="Logo" className="w-8 h-8 object-contain" />
          <h1 className="text-lg font-bold text-primary tracking-tight">Keerti Global Academy</h1>
        </div>
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
          <Button size="sm" onClick={handleDownloadPDF}>
            <Download className="w-4 h-4 mr-1" /> Save as PDF
          </Button>
        </div>
      </header>

      {/* ── Student Tabs ── */}
      {students.length > 1 && (
        <div className="no-print bg-card border-b border-border px-6 py-2 flex items-center gap-2 overflow-x-auto">
          <Button variant="ghost" size="icon" className="h-7 w-7"
            onClick={() => setActiveIdx(Math.max(0, activeIdx - 1))} disabled={activeIdx === 0}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          {students.map((s, i) => (
            <button key={s.id} onClick={() => setActiveIdx(i)}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                i === activeIdx
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "bg-muted text-muted-foreground hover:bg-accent"
              }`}>
              {s.name || `Student ${i + 1}`}
            </button>
          ))}
          <Button variant="ghost" size="icon" className="h-7 w-7"
            onClick={() => setActiveIdx(Math.min(students.length - 1, activeIdx + 1))}
            disabled={activeIdx === students.length - 1}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* ── Form ── */}
      <div className="no-print max-w-4xl mx-auto px-4 py-5">
        <StudentForm student={active} onChange={updateStudent} />
      </div>

      {/* ── Preview Label ── */}
      <div className="no-print px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-base font-bold text-primary mb-2">📋 Report Card Preview</h2>
        </div>
      </div>

      {/* ── Preview ── */}
      <div className="flex justify-center pb-8 px-4" ref={previewRef}>
        <div className="shadow-lg border border-border rounded-lg overflow-hidden">
          <ReportCardPreview student={active} />
        </div>
      </div>

    </div>
  );
}
