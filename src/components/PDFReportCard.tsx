/**
 * PDFReportCard — 100% inline styles, no Tailwind.
 * Used only for PDF generation via html2canvas.
 * Renders identically to the preview but with pure CSS
 * so html2canvas captures it perfectly.
 */
import React from "react";
import {
  StudentData, FA_MAX, SA_MAX,
  SCHOOL_NAME, SCHOOL_ADDRESS, SCHOOL_PHONE, SCHOOL_EMAIL,
  getFaTotal, getSaTotal, getGrandTotal,
  getFaGrade, getGrandGrade,
  getOverallObtained, getOverallMax, getOverallPercentage,
  getGrade, getFaMax,
  isSubjectActive,
} from "@/types/reportCard";

interface Props {
  student: StudentData;
  logoSrc: string;
}

const BLUE_DARK  = "#1e4d8c";
const BLUE_MED   = "#2563a8";
const BLUE_LIGHT = "#dbeafe";
const BLUE_PALE  = "#eff6ff";
const BORDER     = "#9ca3af";
const TH_BG      = "#d1e3f8";
const ALT_ROW    = "#f0f5fb";
const GRAY_LABEL = "#6b7280";
const GRAY_VAL   = "#111827";

const cell = (extra: React.CSSProperties = {}): React.CSSProperties => ({
  border: `1px solid ${BORDER}`,
  padding: "5px 4px",
  fontSize: 9,
  verticalAlign: "middle",
  lineHeight: 1.3,
  ...extra,
});

const thCell = (extra: React.CSSProperties = {}): React.CSSProperties => ({
  ...cell(extra),
  background: TH_BG,
  fontWeight: 700,
  textAlign: "center",
});

export default function PDFReportCard({ student, logoSrc }: Props) {
  const attendance = student.totalDays > 0
    ? ((student.presentDays / student.totalDays) * 100).toFixed(1)
    : "—";

  const obtained   = getOverallObtained(student.subjects);
  const max        = getOverallMax(student.subjects);
  const percentage = getOverallPercentage(student.subjects);
  const grade      = max > 0 ? getGrade(percentage) : "—";

  const faActiveCount = student.subjects.filter(s => getFaTotal(s) > 0).length;
  const saActiveCount = student.subjects.filter(s => getSaTotal(s) > 0).length;

  return (
    <div style={{
      width: 794,          // A4 at 96dpi
      minHeight: 1123,
      backgroundColor: "#fff",
      padding: "28px 38px",
      fontFamily: "Arial, Helvetica, sans-serif",
      color: GRAY_VAL,
      position: "relative",
      boxSizing: "border-box",
    }}>

      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 6 }}>
        <img src={logoSrc} alt="logo"
          style={{ width: 60, height: 60, objectFit: "contain", flexShrink: 0 }} />
        <div style={{ flex: 1, textAlign: "center" }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: BLUE_DARK, letterSpacing: 0.5 }}>
            {SCHOOL_NAME}
          </div>
          <div style={{ fontSize: 9, color: GRAY_LABEL, marginTop: 2 }}>{SCHOOL_ADDRESS}</div>
          <div style={{ fontSize: 9, color: GRAY_LABEL }}>
            {[SCHOOL_PHONE, SCHOOL_EMAIL].filter(Boolean).join(" | ")}
          </div>
        </div>
        <div style={{ width: 60 }} />
      </div>

      {/* gradient line */}
      <div style={{
        height: 2, marginBottom: 4,
        background: `linear-gradient(90deg, ${BLUE_MED}, #93c5fd)`,
      }} />

      <div style={{
        textAlign: "center", fontSize: 10, fontWeight: 700,
        letterSpacing: 2, textTransform: "uppercase",
        color: BLUE_MED, marginBottom: 10,
      }}>
        Report Card — {student.session || "2025-2026"}
      </div>

      {/* ── Student Info Grid ── */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 10 }}>
        <tbody>
          {[
            [["Student Name", student.name],   ["Class",         student.className], ["Section",      student.section]],
            [["Roll No.",     student.rollNumber],["Admission No.",student.admissionNumber],["Date of Birth",student.dob]],
            [["Session",      student.session], ["Position",      student.positionInClass],
             ["Attendance",   `${student.presentDays}/${student.totalDays} (${attendance}%)`]],
          ].map((row, ri) => (
            <tr key={ri}>
              {row.map(([label, value], ci) => (
                <td key={ci} style={{
                  border: `1px solid ${BORDER}`, padding: "5px 8px",
                  width: "33.33%", fontSize: 10,
                }}>
                  <span style={{ fontWeight: 700, color: GRAY_LABEL }}>{label}: </span>
                  <span style={{ fontWeight: 500 }}>{value || "—"}</span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* ── FA Section ── */}
      <div style={{ fontSize: 12, fontWeight: 800, color: BLUE_MED,
        textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>
        Formative Assessment (FA)
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 10, tableLayout: "fixed" }}>
        <colgroup>
          <col style={{ width: "18%" }} />
          {[0,1,2,3].map(i => (
            <React.Fragment key={i}>
              <col style={{ width: "8%" }} />
              <col style={{ width: "8%" }} />
            </React.Fragment>
          ))}
          <col style={{ width: "8%" }} />
          <col style={{ width: "6%" }} />
        </colgroup>
        <thead>
          <tr>
            <th rowSpan={2} style={{ ...thCell({ textAlign: "left", padding: "5px 6px" }) }}>Subject</th>
            {["FA1","FA2","FA3","FA4"].map(h => (
              <th key={h} colSpan={2} style={thCell()}>{h}</th>
            ))}
            <th rowSpan={2} style={thCell()}>Total</th>
            <th rowSpan={2} style={thCell()}>Grade</th>
          </tr>
          <tr>
            {[1,2,3,4].map(n => (
              <React.Fragment key={n}>
                <th style={{ ...thCell(), fontSize: 8, color: GRAY_LABEL }}>M.M</th>
                <th style={{ ...thCell(), fontSize: 8, color: GRAY_LABEL }}>M.O</th>
              </React.Fragment>
            ))}
          </tr>
        </thead>
        <tbody>
          {student.subjects.map((s, i) => {
            const active = isSubjectActive(s);
            return (
              <tr key={s.name} style={{ background: i % 2 === 1 ? ALT_ROW : "#fff" }}>
                <td style={{ ...cell({ textAlign: "left", padding: "5px 6px", fontWeight: 600 }) }}>{s.name}</td>
                {(["fa1","fa2","fa3","fa4"] as const).map(f => (
                  <React.Fragment key={f}>
                    <td style={cell({ textAlign: "center", color: GRAY_LABEL })}>{active ? FA_MAX : "—"}</td>
                    <td style={cell({ textAlign: "center" })}>{active ? s[f] : "—"}</td>
                  </React.Fragment>
                ))}
                <td style={cell({ textAlign: "center", fontWeight: 700 })}>{active ? getFaTotal(s) : "—"}</td>
                <td style={cell({ textAlign: "center", fontWeight: 700 })}>{active ? getFaGrade(s) : "—"}</td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr style={{ background: TH_BG }}>
            <td style={{ ...cell({ textAlign: "left", padding: "5px 6px", fontWeight: 700 }) }}>Total</td>
            {[1,2,3,4].map(n => {
              const key = `fa${n}` as keyof typeof student.subjects[0];
              return (
                <React.Fragment key={n}>
                  <td style={cell({ textAlign: "center", fontWeight: 700 })}>{faActiveCount * FA_MAX}</td>
                  <td style={cell({ textAlign: "center", fontWeight: 700 })}>
                    {student.subjects.filter(s => getFaTotal(s) > 0).reduce((sum, s) => sum + (s[key] as number), 0)}
                  </td>
                </React.Fragment>
              );
            })}
            <td style={cell({ textAlign: "center", fontWeight: 700 })}>
              {student.subjects.reduce((sum, s) => sum + getFaTotal(s), 0)}
            </td>
            <td style={cell({ textAlign: "center", fontWeight: 700 })}>
              {faActiveCount > 0
                ? getGrade((student.subjects.reduce((sum, s) => sum + getFaTotal(s), 0) / (faActiveCount * getFaMax())) * 100)
                : "—"}
            </td>
          </tr>
        </tfoot>
      </table>

      {/* ── SA Section ── */}
      <div style={{ fontSize: 12, fontWeight: 800, color: BLUE_MED,
        textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>
        Summative Assessment (SA)
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 10, tableLayout: "fixed" }}>
        <colgroup>
          <col style={{ width: "24%" }} />
          <col style={{ width: "10%" }} />
          <col style={{ width: "10%" }} />
          <col style={{ width: "10%" }} />
          <col style={{ width: "10%" }} />
          <col style={{ width: "12%" }} />
          <col style={{ width: "14%" }} />
          <col style={{ width: "10%" }} />
        </colgroup>
        <thead>
          <tr>
            <th rowSpan={2} style={{ ...thCell({ textAlign: "left", padding: "5px 6px" }) }}>Subject</th>
            {["SA1","SA2"].map(h => (
              <th key={h} colSpan={2} style={thCell()}>{h}</th>
            ))}
            <th rowSpan={2} style={thCell()}>SA Total</th>
            <th rowSpan={2} style={thCell()}>Grand Total</th>
            <th rowSpan={2} style={thCell()}>Grade</th>
          </tr>
          <tr>
            {[1,2].map(n => (
              <React.Fragment key={n}>
                <th style={{ ...thCell(), fontSize: 8, color: GRAY_LABEL }}>M.M</th>
                <th style={{ ...thCell(), fontSize: 8, color: GRAY_LABEL }}>M.O</th>
              </React.Fragment>
            ))}
          </tr>
        </thead>
        <tbody>
          {student.subjects.map((s, i) => {
            const active = isSubjectActive(s);
            return (
              <tr key={s.name} style={{ background: i % 2 === 1 ? ALT_ROW : "#fff" }}>
                <td style={{ ...cell({ textAlign: "left", padding: "5px 6px", fontWeight: 600 }) }}>{s.name}</td>
                {(["sa1","sa2"] as const).map(f => (
                  <React.Fragment key={f}>
                    <td style={cell({ textAlign: "center", color: GRAY_LABEL })}>{active ? SA_MAX : "—"}</td>
                    <td style={cell({ textAlign: "center" })}>{active ? s[f] : "—"}</td>
                  </React.Fragment>
                ))}
                <td style={cell({ textAlign: "center", fontWeight: 700 })}>{active ? getSaTotal(s) : "—"}</td>
                <td style={cell({ textAlign: "center", fontWeight: 700 })}>{active ? getGrandTotal(s) : "—"}</td>
                <td style={cell({ textAlign: "center", fontWeight: 700 })}>{active ? getGrandGrade(s) : "—"}</td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr style={{ background: TH_BG }}>
            <td style={{ ...cell({ textAlign: "left", padding: "5px 6px", fontWeight: 700 }) }}>Total</td>
            {[1,2].map(n => {
              const key = `sa${n}` as keyof typeof student.subjects[0];
              return (
                <React.Fragment key={n}>
                  <td style={cell({ textAlign: "center", fontWeight: 700 })}>{saActiveCount * SA_MAX}</td>
                  <td style={cell({ textAlign: "center", fontWeight: 700 })}>
                    {student.subjects.filter(s => getSaTotal(s) > 0).reduce((sum, s) => sum + (s[key] as number), 0)}
                  </td>
                </React.Fragment>
              );
            })}
            <td style={cell({ textAlign: "center", fontWeight: 700 })}>
              {student.subjects.reduce((sum, s) => sum + getSaTotal(s), 0)}
            </td>
            <td style={cell({ textAlign: "center", fontWeight: 700 })}>{obtained}</td>
            <td style={cell({ textAlign: "center", fontWeight: 700 })}>{grade}</td>
          </tr>
        </tfoot>
      </table>

      {/* ── Summary Boxes ── */}
      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        {[
          ["Total Obtained", `${obtained}`],
          ["Maximum Marks",  `${max}`],
          ["Percentage",     `${percentage.toFixed(1)}%`],
          ["Overall Grade",  grade],
        ].map(([label, value]) => (
          <div key={label} style={{
            flex: 1, border: `1px solid ${BORDER}`, borderRadius: 4,
            padding: "6px 4px", textAlign: "center", background: BLUE_PALE,
          }}>
            <div style={{ fontSize: 8, color: GRAY_LABEL, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: BLUE_MED, marginTop: 2 }}>{value}</div>
          </div>
        ))}
      </div>

      {/* ── Result ── */}
      <div style={{
        border: `1px solid ${BORDER}`, borderRadius: 4, padding: "5px 10px",
        textAlign: "center", background: "#f9fafb", marginBottom: 10,
      }}>
        <span style={{ fontSize: 9, color: GRAY_LABEL, textTransform: "uppercase", letterSpacing: 1, marginRight: 6 }}>Result:</span>
        <span style={{ fontSize: 12, fontWeight: 700 }}>{student.result || "—"}</span>
      </div>

      {/* ── Overall Performance ── */}
      <div style={{ fontSize: 10, fontWeight: 800, color: BLUE_MED,
        textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>
        Overall Performance
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 10 }}>
        <tbody>
          {[
            [["Student Performance", student.performance],               ["Class Participation", student.classParticipation]],
          ].map((row, ri) => (
            <tr key={ri} style={{ background: ri % 2 === 1 ? ALT_ROW : "#fff" }}>
              {row.map(([label, value], ci) => (
                <td key={ci} style={{
                  border: `1px solid ${BORDER}`, padding: "5px 10px",
                  width: "50%", fontSize: 10,
                  display: "table-cell",
                }}>
                  <span style={{ fontWeight: 700, color: GRAY_LABEL }}>{label}: </span>
                  <span style={{ fontWeight: 500 }}>{value || "—"}</span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* ── Remarks ── */}
     

      {/* ── Signatures ── */}
      <div style={{
        position: "absolute", bottom: 32, left: 38, right: 38,
        display: "flex", justifyContent: "space-between",
      }}>
        {["Class Teacher", "Guardian", "Principal"].map(role => (
          <div key={role} style={{ textAlign: "center", width: "28%" }}>
            <div style={{ borderTop: `1.5px solid ${GRAY_VAL}`, marginBottom: 4 }} />
            <div style={{ fontSize: 9, color: GRAY_LABEL, fontWeight: 500 }}>{role}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
