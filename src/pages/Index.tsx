import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { StudentData, createEmptyStudent } from "@/types/reportCard";
import StudentForm from "@/components/StudentForm";
import ReportCardPreview from "@/components/ReportCardPreview";
import { Printer, Download, Plus, Trash2, ChevronLeft, ChevronRight, Loader2, CheckCircle } from "lucide-react";

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

type DLState = "idle" | "loading" | "done";

export default function Index() {
  const [students, setStudents]   = useState<StudentData[]>(loadStudents);
  const [activeIdx, setActiveIdx] = useState(0);
  const [dlState, setDlState]     = useState<DLState>("idle");
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

  const handlePrint = () => {
    const win = window.open("", "_blank");
    if (!win || !previewRef.current) return;
    const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map(el => el.outerHTML).join("");
    win.document.write(`<!DOCTYPE html><html><head>${styles}<style>
      body{margin:0;padding:0;background:white}
      @page{size:A4;margin:0}
      .print-area{width:210mm;min-height:297mm;padding:8mm 12mm}
    </style></head><body>${previewRef.current.innerHTML}</body></html>`);
    win.document.close();
    win.onload = () => { win.print(); win.close(); };
  };

  const handleDownloadPDF = async () => {
    if (!previewRef.current) return;
    setDlState("loading");
    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);

      const printArea = previewRef.current.querySelector(".print-area") as HTMLElement;
      if (!printArea) throw new Error("Print area not found");

      const canvas = await html2canvas(printArea, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
        windowWidth: printArea.scrollWidth,
        windowHeight: printArea.scrollHeight,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf     = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pdfW    = pdf.internal.pageSize.getWidth();
      const pdfH    = pdf.internal.pageSize.getHeight();

      const imgH = (canvas.height / canvas.width) * pdfW;
      if (imgH <= pdfH) {
        pdf.addImage(imgData, "PNG", 0, 0, pdfW, imgH);
      } else {
        const scale   = pdfH / imgH;
        const scaledW = pdfW * scale;
        pdf.addImage(imgData, "PNG", (pdfW - scaledW) / 2, 0, scaledW, pdfH);
      }

      const name = active.name?.trim().replace(/\s+/g, "_") || "Student";
      const cls  = active.className?.trim().replace(/\s+/g, "_") || "Class";
      pdf.save(`${name}_${cls}.pdf`);

      setDlState("done");
      setTimeout(() => setDlState("idle"), 2500);
    } catch (err) {
      console.error("PDF error:", err);
      setDlState("idle");
      alert("PDF generation failed. Please use Print instead.");
    }
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
          <Button
            size="sm"
            onClick={handleDownloadPDF}
            disabled={dlState === "loading"}
            className={dlState === "done" ? "bg-green-600 hover:bg-green-700" : ""}
          >
            {dlState === "loading" ? (
              <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Generating…</>
            ) : dlState === "done" ? (
              <><CheckCircle className="w-4 h-4 mr-1" /> Downloaded!</>
            ) : (
              <><Download className="w-4 h-4 mr-1" /> Download PDF</>
            )}
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
