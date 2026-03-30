import { StudentData, SubjectMarks, FA_MAX, SA_MAX, getFaTotal, getSaTotal, getGrandTotal, getFaGrade, getGrandGrade, getOverallObtained, getOverallPercentage, getGrade, getFaMax, isSubjectActive } from "@/types/reportCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Props {
  student: StudentData;
  onChange: (s: StudentData) => void;
}

const RATING_OPTIONS = ["Excellent", "Good", "Satisfactory", "Needs Improvement"];

export default function StudentForm({ student, onChange }: Props) {
  const set = (key: keyof StudentData, value: string | number) =>
    onChange({ ...student, [key]: value });

  const setSubject = (idx: number, field: keyof SubjectMarks, value: number | string) => {
    const subjects = student.subjects.map((s, i) =>
      i === idx ? { ...s, [field]: typeof s[field] === "number" ? Number(value) || 0 : value } : s
    );
    onChange({ ...student, subjects });
  };

  const percentage         = getOverallPercentage(student.subjects);
  const faActiveCount      = student.subjects.filter(s => getFaTotal(s) > 0).length;
  const activeSubjCount    = student.subjects.filter(isSubjectActive).length;

  return (
    <div className="space-y-5">
      {/* Student Details */}
      <Card className="p-5">
        <h3 className="text-base font-bold text-primary mb-3 uppercase tracking-wide">Student Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {([
            ["name",            "Student Name",      "Enter name"],
            ["admissionNumber", "Father Name",     "Enter name"],
            ["section",         "Mother Name",           "Enter name"],
            ["className",       "Class",             "V"],
            ["rollNumber",      "Roll Number",       "01"],
            ["dob",             "Date of Birth",     "", "date"],
            ["session",         "Session",           "2025-2026"],
            ["positionInClass", "Position in Class", "1st"],
            ["result",          "Result",            "Promoted to Class VI"],
          ] as const).map(([key, label, placeholder, type]) => (
            <div key={key}>
              <Label className="text-xs">{label}</Label>
              <Input
                type={type || "text"}
                value={student[key] as string}
                onChange={e => set(key, e.target.value)}
                placeholder={placeholder}
                className="h-9"
              />
            </div>
          ))}
        </div>
      </Card>

      {/* FA Marks */}
      <Card className="p-5">
        <h3 className="text-base font-bold text-primary mb-3 uppercase tracking-wide">Formative Assessment (FA)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-secondary">
                <th rowSpan={2} className="border border-border p-2 text-left font-semibold">Subject</th>
                {["FA1","FA2","FA3","FA4"].map(h => (
                  <th key={h} colSpan={2} className="border border-border p-1.5 text-center font-semibold text-xs">{h}</th>
                ))}
                <th rowSpan={2} className="border border-border p-2 text-center font-semibold w-16">FA Total</th>
                <th rowSpan={2} className="border border-border p-2 text-center font-semibold w-14">Grade</th>
              </tr>
              <tr className="bg-secondary">
                {[1,2,3,4].map(n => (
                  <>
                    <th key={`mm${n}`} className="border border-border p-1 text-center text-[10px] font-medium text-muted-foreground w-12">M.M</th>
                    <th key={`mo${n}`} className="border border-border p-1 text-center text-[10px] font-medium text-muted-foreground w-12">M.O</th>
                  </>
                ))}
              </tr>
            </thead>
            <tbody>
              {student.subjects.map((subj, idx) => (
                <tr key={subj.name} className={idx % 2 === 1 ? "bg-muted/30" : ""}>
                  <td className="border border-border p-2 font-medium">{subj.name}</td>
                  {(["fa1","fa2","fa3","fa4"] as const).map(f => (
                    <>
                      <td key={`${f}mm`} className="border border-border p-1 text-center text-xs text-muted-foreground">{FA_MAX}</td>
                      <td key={`${f}mo`} className="border border-border p-0">
                        <input
                          type="number" min={0} max={FA_MAX}
                          className="w-full px-1 py-1.5 text-center text-sm bg-transparent outline-none focus:bg-accent"
                          value={subj[f] || ""}
                          onChange={e => setSubject(idx, f, Math.min(FA_MAX, Number(e.target.value) || 0))}
                        />
                      </td>
                    </>
                  ))}
                  <td className="border border-border p-2 text-center font-semibold">{getFaTotal(subj)}</td>
                  <td className="border border-border p-2 text-center font-semibold">{getFaGrade(subj)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-secondary font-bold">
                <td className="border border-border p-2">Total</td>
                {[1,2,3,4].map(n => (
                  <>
                    {/* M.M = only active subjects */}
                    <td key={`tmm${n}`} className="border border-border p-1 text-center text-xs">{faActiveCount * FA_MAX}</td>
                    <td key={`tmo${n}`} className="border border-border p-1 text-center text-xs">
                      {student.subjects.filter(s => getFaTotal(s) > 0).reduce((s, x) => s + (x[`fa${n}` as keyof SubjectMarks] as number), 0)}
                    </td>
                  </>
                ))}
                <td className="border border-border p-2 text-center">
                  {student.subjects.reduce((s, x) => s + getFaTotal(x), 0)}
                </td>
                <td className="border border-border p-2 text-center">
                  {faActiveCount > 0
                    ? getGrade((student.subjects.reduce((s, x) => s + getFaTotal(x), 0) / (faActiveCount * getFaMax())) * 100)
                    : "—"}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>

      {/* SA Marks */}
      <Card className="p-5">
        <h3 className="text-base font-bold text-primary mb-3 uppercase tracking-wide">Summative Assessment (SA)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-secondary">
                <th rowSpan={2} className="border border-border p-2 text-left font-semibold">Subject</th>
                {["SA1","SA2"].map(h => (
                  <th key={h} colSpan={2} className="border border-border p-1.5 text-center font-semibold text-xs">{h}</th>
                ))}
                <th rowSpan={2} className="border border-border p-2 text-center font-semibold w-16">SA Total</th>
                <th rowSpan={2} className="border border-border p-2 text-center font-semibold w-20">Grand Total</th>
                <th rowSpan={2} className="border border-border p-2 text-center font-semibold w-14">Grade</th>
              </tr>
              <tr className="bg-secondary">
                {[1,2].map(n => (
                  <>
                    <th key={`smm${n}`} className="border border-border p-1 text-center text-[10px] font-medium text-muted-foreground w-14">M.M</th>
                    <th key={`smo${n}`} className="border border-border p-1 text-center text-[10px] font-medium text-muted-foreground w-14">M.O</th>
                  </>
                ))}
              </tr>
            </thead>
            <tbody>
              {student.subjects.map((subj, idx) => (
                <tr key={subj.name} className={idx % 2 === 1 ? "bg-muted/30" : ""}>
                  <td className="border border-border p-2 font-medium">{subj.name}</td>
                  {(["sa1","sa2"] as const).map(f => (
                    <>
                      <td key={`${f}mm`} className="border border-border p-1 text-center text-xs text-muted-foreground">{SA_MAX}</td>
                      <td key={`${f}mo`} className="border border-border p-0">
                        <input
                          type="number" min={0} max={SA_MAX}
                          className="w-full px-1 py-1.5 text-center text-sm bg-transparent outline-none focus:bg-accent"
                          value={subj[f] || ""}
                          onChange={e => setSubject(idx, f, Math.min(SA_MAX, Number(e.target.value) || 0))}
                        />
                      </td>
                    </>
                  ))}
                  <td className="border border-border p-2 text-center font-semibold">{getSaTotal(subj)}</td>
                  <td className="border border-border p-2 text-center font-semibold">{getGrandTotal(subj)}</td>
                  <td className="border border-border p-2 text-center font-semibold">{getGrandGrade(subj)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-secondary font-bold">
                <td className="border border-border p-2">Total</td>
                {[1,2].map(n => (
                  <>
                    <td key={`stmm${n}`} className="border border-border p-1 text-center text-xs">
                      {student.subjects.filter(isSubjectActive).length * SA_MAX}
                    </td>
                    <td key={`stmo${n}`} className="border border-border p-1 text-center text-xs">
                      {student.subjects.filter(isSubjectActive).reduce((s, x) => s + (x[`sa${n}` as keyof SubjectMarks] as number), 0)}
                    </td>
                  </>
                ))}
                <td className="border border-border p-2 text-center">
                  {student.subjects.reduce((s, x) => s + getSaTotal(x), 0)}
                </td>
                <td className="border border-border p-2 text-center">
                  {getOverallObtained(student.subjects)}
                </td>
                <td className="border border-border p-2 text-center">
                  {activeSubjCount > 0 ? getGrade(percentage) : "—"}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>

      {/* Attendance & Performance */}
      <Card className="p-5">
        <h3 className="text-base font-bold text-primary mb-3 uppercase tracking-wide">Attendance & Overall Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <div>
            <Label className="text-xs">Total Working Days</Label>
            <Input type="number" min={0} value={student.totalDays || ""} onChange={e => set("totalDays", Number(e.target.value) || 0)} className="h-9" />
          </div>
          <div>
            <Label className="text-xs">Days Present</Label>
            <Input type="number" min={0} value={student.presentDays || ""} onChange={e => set("presentDays", Number(e.target.value) || 0)} className="h-9" />
          </div>
          <div>
            <Label className="text-xs">Attendance %</Label>
            <Input readOnly value={student.totalDays > 0 ? ((student.presentDays / student.totalDays) * 100).toFixed(1) + "%" : "—"} className="bg-muted h-9" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          {([
            ["performance",       "Student Performance"],
            ["behavior",          "Behavior"],
            ["classParticipation","Class Participation"],
            ["discipline",        "Discipline"],
          ] as const).map(([key, label]) => (
            <div key={key}>
              <Label className="text-xs">{label}</Label>
              <Select value={student[key]} onValueChange={v => set(key, v)}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {RATING_OPTIONS.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
        <div>
          <Label className="text-xs">Teacher's Remarks</Label>
          <Textarea value={student.teacherRemarks} onChange={e => set("teacherRemarks", e.target.value)} placeholder="Overall assessment comments..." rows={2} />
        </div>
        <div className="mt-3">
          <Label className="text-xs">General Remarks</Label>
          <Textarea value={student.remarks} onChange={e => set("remarks", e.target.value)} placeholder="Additional remarks..." rows={2} />
        </div>
      </Card>
    </div>
  );
}
