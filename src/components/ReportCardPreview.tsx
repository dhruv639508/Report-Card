import React from "react";
import {
  StudentData, FA_MAX, SA_MAX,
  SCHOOL_NAME, SCHOOL_ADDRESS, SCHOOL_PHONE, SCHOOL_EMAIL,
  getFaTotal, getSaTotal, getGrandTotal,
  getFaGrade, getGrandGrade,
  getOverallObtained, getOverallMax, getOverallPercentage,
  getGrade, getFaMax, getSaMax,
  isSubjectActive,
} from "@/types/reportCard";
import schoolLogo from "@/assets/school-logo.png";

interface Props { student: StudentData; }

export default function ReportCardPreview({ student }: Props) {
  const attendance = student.totalDays > 0
    ? ((student.presentDays / student.totalDays) * 100).toFixed(1)
    : "—";

  const obtained   = getOverallObtained(student.subjects);
  const max        = getOverallMax(student.subjects);       // only active subjects
  const percentage = getOverallPercentage(student.subjects);
  const grade      = max > 0 ? getGrade(percentage) : "—";
  const logoSrc    = student.logoUrl || schoolLogo;

  // Active subject counts for tfoot M.M
  const faActiveCount = student.subjects.filter(s => getFaTotal(s) > 0).length;
  const saActiveCount = student.subjects.filter(s => getSaTotal(s) > 0).length;

  const thStyle = { background: "hsl(210, 45%, 93%)" };
  const altRow  = { background: "hsl(210, 20%, 97%)" };

  return (
    <div
      className="print-area bg-white mx-auto text-gray-900 relative"
      style={{ width: "210mm", minHeight: "297mm", padding: "8mm 12mm", fontFamily: "'Segoe UI', Roboto, sans-serif" }}
    >
      {/* ── Header ── */}
      <div className="flex items-center gap-4 mb-2">
        <img src={logoSrc} alt="School Logo" className="w-16 h-16 object-contain flex-shrink-0" />
        <div className="flex-1 text-center">
          <h1 className="text-2xl font-bold tracking-wide" style={{ color: "hsl(210, 65%, 35%)" }}>
            {SCHOOL_NAME}
          </h1>
          <p className="text-[10px] text-gray-500 mt-0.5">{SCHOOL_ADDRESS}</p>
          <p className="text-[10px] text-gray-500">{[SCHOOL_PHONE, SCHOOL_EMAIL].filter(Boolean).join(" | ")}</p>
        </div>
        <div className="w-16" />
      </div>
      <div className="h-[2px] mb-1" style={{ background: "linear-gradient(90deg, hsl(210,65%,45%), hsl(210,45%,75%))" }} />
      <p className="text-center text-xs font-bold tracking-[0.2em] uppercase mb-2" style={{ color: "hsl(210, 65%, 40%)" }}>
        Report Card — {student.session || "2025-2026"}
      </p>

      {/* ── Student Info ── */}
      <div className="border border-gray-300 rounded mb-2">
        <div className="grid grid-cols-3 text-[11px]">
          {[
            ["Student Name",  student.name],
            ["Father Name", student.admissionNumber],
            ["Mother Name",       student.section],
            ["Roll No.",      student.rollNumber],
            ["Class",         student.className],
            ["Date of Birth", student.dob],
            ["Session",       student.session],
            ["Position",      student.positionInClass],
            ["Attendance",    `${student.presentDays}/${student.totalDays} (${attendance}%)`],
          ].map(([label, value], i) => (
            <div key={i} className={`px-3 py-1 flex gap-1 ${i < 6 ? "border-b border-gray-200" : ""} ${i % 3 !== 2 ? "border-r border-gray-200" : ""}`}>
              <span className="font-semibold text-gray-500">{label}:</span>
              <span className="font-medium text-gray-900">{value || "—"}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── FA Table ── */}
      <div className="mb-2">
        <p className="text-[13px] font-bold uppercase tracking-wider mb-0.5 px-1" style={{ color: "hsl(210, 65%, 40%)" }}>
          Formative Assessment (FA)
        </p>
        <table className="w-full text-[10px] border-collapse">
          <thead>
            <tr>
              <th rowSpan={2} className="border border-gray-300 px-1.5 py-1 text-left font-bold" style={thStyle}>Subject</th>
              {["FA1","FA2","FA3","FA4"].map(h => (
                <th key={h} colSpan={2} className="border border-gray-300 px-1 py-0.5 text-center font-bold" style={thStyle}>{h}</th>
              ))}
              <th rowSpan={2} className="border border-gray-300 px-1 py-1 text-center font-bold w-12" style={thStyle}>Total</th>
              <th rowSpan={2} className="border border-gray-300 px-1 py-1 text-center font-bold w-10" style={thStyle}>Grade</th>
            </tr>
            <tr>
              {[1,2,3,4].map(n => (
                <React.Fragment key={n}>
                  <th className="border border-gray-300 px-0.5 py-0.5 text-center text-[8px] text-gray-500 font-medium" style={thStyle}>M.M</th>
                  <th className="border border-gray-300 px-0.5 py-0.5 text-center text-[8px] text-gray-500 font-medium" style={thStyle}>M.O</th>
                </React.Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {student.subjects.map((s, i) => {
              const active = isSubjectActive(s);
              return (
                <tr key={s.name} style={i % 2 === 1 ? altRow : {}}>
                  <td className="border border-gray-300 px-1.5 py-2 font-medium">{s.name}</td>
                  {(["fa1","fa2","fa3","fa4"] as const).map(f => (
                    <React.Fragment key={f}>
                      {/* Show M.M only if subject is active */}
                      <td className="border border-gray-300 px-0.5 py-2 text-center text-gray-400">
                        {active ? FA_MAX : "—"}
                      </td>
                      <td className="border border-gray-300 px-0.5 py-2 text-center">
                        {active ? s[f] : "—"}
                      </td>
                    </React.Fragment>
                  ))}
                  <td className="border border-gray-300 px-1 py-2 text-center font-semibold">
                    {active ? getFaTotal(s) : "—"}
                  </td>
                  <td className="border border-gray-300 px-1 py-2 text-center font-semibold">
                    {active ? getFaGrade(s) : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr style={thStyle}>
              <td className="border border-gray-300 px-1.5 py-1 font-bold">Total</td>
              {[1,2,3,4].map(n => {
                const key = `fa${n}` as keyof typeof student.subjects[0];
                return (
                  <React.Fragment key={n}>
                    {/* M.M total = only active subjects */}
                    <td className="border border-gray-300 px-0.5 py-0.5 text-center font-bold text-[9px]">
                      {faActiveCount * FA_MAX}
                    </td>
                    <td className="border border-gray-300 px-0.5 py-0.5 text-center font-bold text-[9px]">
                      {student.subjects.filter(s => getFaTotal(s) > 0).reduce((sum, s) => sum + (s[key] as number), 0)}
                    </td>
                  </React.Fragment>
                );
              })}
              <td className="border border-gray-300 px-1 py-0.5 text-center font-bold">
                {student.subjects.reduce((sum, s) => sum + getFaTotal(s), 0)}
              </td>
              <td className="border border-gray-300 px-1 py-0.5 text-center font-bold">
                {faActiveCount > 0
                  ? getGrade((student.subjects.reduce((sum, s) => sum + getFaTotal(s), 0) / (faActiveCount * getFaMax())) * 100)
                  : "—"}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* ── SA Table ── */}
      <div className="mb-2">
        <p className="text-[13px] font-bold uppercase tracking-wider mb-0.5 px-1" style={{ color: "hsl(210, 65%, 40%)" }}>
          Summative Assessment (SA)
        </p>
        <table className="w-full text-[10px] border-collapse">
          <thead>
            <tr>
              <th rowSpan={2} className="border border-gray-300 px-1.5 py-1 text-left font-bold" style={thStyle}>Subject</th>
              {["SA1","SA2"].map(h => (
                <th key={h} colSpan={2} className="border border-gray-300 px-1 py-0.5 text-center font-bold" style={thStyle}>{h}</th>
              ))}
              <th rowSpan={2} className="border border-gray-300 px-1 py-1 text-center font-bold w-12" style={thStyle}>SA Total</th>
              <th rowSpan={2} className="border border-gray-300 px-1 py-1 text-center font-bold w-16" style={thStyle}>Grand Total</th>
              <th rowSpan={2} className="border border-gray-300 px-1 py-1 text-center font-bold w-10" style={thStyle}>Grade</th>
            </tr>
            <tr>
              {[1,2].map(n => (
                <React.Fragment key={n}>
                  <th className="border border-gray-300 px-0.5 py-0.5 text-center text-[8px] text-gray-500 font-medium" style={thStyle}>M.M</th>
                  <th className="border border-gray-300 px-0.5 py-0.5 text-center text-[8px] text-gray-500 font-medium" style={thStyle}>M.O</th>
                </React.Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {student.subjects.map((s, i) => {
              const active = isSubjectActive(s);
              return (
                <tr key={s.name} style={i % 2 === 1 ? altRow : {}}>
                  <td className="border border-gray-300 px-1.5 py-2 font-medium">{s.name}</td>
                  {(["sa1","sa2"] as const).map(f => (
                    <React.Fragment key={f}>
                      <td className="border border-gray-300 px-0.5 py-2 text-center text-gray-400">
                        {active ? SA_MAX : "—"}
                      </td>
                      <td className="border border-gray-300 px-0.5 py-2 text-center">
                        {active ? s[f] : "—"}
                      </td>
                    </React.Fragment>
                  ))}
                  <td className="border border-gray-300 px-1 py-2 text-center font-semibold">
                    {active ? getSaTotal(s) : "—"}
                  </td>
                  <td className="border border-gray-300 px-1 py-2 text-center font-semibold">
                    {active ? getGrandTotal(s) : "—"}
                  </td>
                  <td className="border border-gray-300 px-1 py-2 text-center font-semibold">
                    {active ? getGrandGrade(s) : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr style={thStyle}>
              <td className="border border-gray-300 px-1.5 py-1 font-bold">Total</td>
              {[1,2].map(n => {
                const key = `sa${n}` as keyof typeof student.subjects[0];
                return (
                  <React.Fragment key={n}>
                    <td className="border border-gray-300 px-0.5 py-0.5 text-center font-bold text-[9px]">
                      {saActiveCount * SA_MAX}
                    </td>
                    <td className="border border-gray-300 px-0.5 py-0.5 text-center font-bold text-[9px]">
                      {student.subjects.filter(s => getSaTotal(s) > 0).reduce((sum, s) => sum + (s[key] as number), 0)}
                    </td>
                  </React.Fragment>
                );
              })}
              <td className="border border-gray-300 px-1 py-0.5 text-center font-bold">
                {student.subjects.reduce((sum, s) => sum + getSaTotal(s), 0)}
              </td>
              <td className="border border-gray-300 px-1 py-0.5 text-center font-bold">{obtained}</td>
              <td className="border border-gray-300 px-1 py-0.5 text-center font-bold">{grade}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* ── Summary boxes ── */}
      <div className="grid grid-cols-4 gap-2 mb-2">
        {[
          ["Total Obtained", `${obtained}`],
          ["Maximum Marks", `${max}`],
          ["Percentage",    `${percentage.toFixed(1)}%`],
          ["Overall Grade", grade],
        ].map(([label, value]) => (
          <div key={label} className="border border-gray-300 rounded px-2 py-1 text-center" style={{ background: "hsl(210, 45%, 95%)" }}>
            <p className="text-[8px] text-gray-500 uppercase tracking-wide">{label}</p>
            <p className="text-sm font-bold" style={{ color: "hsl(210, 65%, 40%)" }}>{value}</p>
          </div>
        ))}
      </div>

      {/* ── Overall Performance ── */}
      <div className="mb-2">
        <p className="text-[10px] font-bold uppercase tracking-wider mb-0.5 px-1" style={{ color: "hsl(210, 65%, 40%)" }}>
          Overall Performance
        </p>
        <div className="border border-gray-300 rounded">
          <div className="grid grid-cols-2 text-[11px]">
            {[
              ["Student Performance", student.performance],
              ["Class Participation", student.classParticipation],
            ].map(([label, value], i) => (
              <div key={i} className={`px-3 py-1 flex justify-between ${i < 4 ? "border-b border-gray-200" : ""} ${i % 2 === 0 ? "border-r border-gray-200" : ""}`}>
                <span className="font-semibold text-gray-500">{label}:</span>
                <span className="font-medium text-gray-900">{value || "—"}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

       {/* ── Remarks ── */}
      {(student.teacherRemarks || student.remarks) && (
        <div className="border border-gray-300 rounded px-3 py-1 mb-2">
          {student.teacherRemarks && (
            <div className="mb-0.5">
              <p className="text-[9px] text-gray-500 uppercase tracking-wide">Teacher's Remarks</p>
              <p className="text-[11px] text-gray-800">{student.teacherRemarks}</p>
            </div>
          )}
          {student.remarks && (
            <div>
              <p className="text-[9px] text-gray-500 uppercase tracking-wide">Remarks</p>
              <p className="text-[11px] text-gray-800">{student.remarks}</p>
            </div>
          )}
        </div>
      )} 

      {/* ── Signatures ── */}
      <div className="grid grid-cols-3 gap-8 absolute bottom-8 left-12 right-12">
        {["Class Teacher", "Guardian", "Principal"].map(role => (
          <div key={role} className="text-center">
            <div className="border-t border-gray-900 w-28 mx-auto mb-1" />
            <p className="text-[10px] font-medium text-gray-500">{role}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
