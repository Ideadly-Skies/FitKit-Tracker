import { Dispatch, SetStateAction } from 'react';
import ResultBadge from './ResultBadge';
import { Patient, Stage, StageInfo } from '../types';
import { fmtDisplayDate } from '../utils';
import { P, BR, LAV2, TXL, TXM } from '../constants';

interface PatientTableProps {
  filtered: Patient[];
  activeFilter: 'positive' | null;
  setActiveFilter: (v: 'positive' | null) => void;
  stagesToShow: StageInfo[];
  expandedStages: Record<number, boolean>;
  setExpandedStages: Dispatch<SetStateAction<Record<number, boolean>>>;
  daysPending: (p: Patient) => number | null;
  onEditPatient: (p: Patient) => void;
  onAdvancePatient: (p: Patient) => void;
  onWithdrawPatient: (p: Patient) => void;
  onArchivePatient: (p: Patient) => void;
  onUploadCSV: (id: Stage) => void;
}

const actBtn = (extra: React.CSSProperties = {}): React.CSSProperties => ({
  background: "none", border: `0.5px solid ${BR}`, borderRadius: 4, padding: "3px 8px",
  fontSize: 11, cursor: "pointer", color: TXM, ...extra,
});

const tableHeaders = ["Refer ID", "Patient Name", "Phone", "Kit Dispatch Date", "Lab Received Date", "Lab Result Date", "Result", "Notes", "Days Pending", "Actions"];

export default function PatientTable({
  filtered, activeFilter, setActiveFilter,
  stagesToShow, expandedStages, setExpandedStages,
  daysPending, onEditPatient, onAdvancePatient,
  onWithdrawPatient, onArchivePatient, onUploadCSV,
}: PatientTableProps) {
  return (
    <div style={{ padding: "16px 20px" }}>
      {activeFilter === "positive" && (
        <div style={{ background: "#FCEBEB", border: "1px solid #F09595", borderRadius: 8, padding: "10px 14px", marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12 }}>
            <span style={{ background: "#791F1F", color: "#fff", fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 10, letterSpacing: .4, textTransform: "uppercase" }}>Filter</span>
            <span style={{ color: "#791F1F", fontWeight: 700 }}>Positive Result</span>
            <span style={{ color: TXM, fontSize: 11 }}>— sorted by result date, latest first</span>
          </div>
          <span onClick={() => setActiveFilter(null)} style={{ color: "#791F1F", fontSize: 11, fontWeight: 700, cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 2 }}>✕ Clear filter</span>
        </div>
      )}

      <div style={{ background: "#fff", border: `0.5px solid ${BR}`, borderRadius: 8, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
          <colgroup>
            <col style={{ width: 130 }} /><col style={{ width: 170 }} /><col style={{ width: 100 }} />
            <col style={{ width: 115 }} /><col style={{ width: 115 }} /><col style={{ width: 115 }} />
            <col style={{ width: 105 }} /><col /><col style={{ width: 100 }} /><col style={{ width: 110 }} />
          </colgroup>
          <thead>
            <tr style={{ background: LAV2 }}>
              {tableHeaders.map(h => (
                <th key={h} style={{ color: TXM, fontSize: 11, fontWeight: 700, padding: "8px 12px", textAlign: "left", borderBottom: `1px solid ${BR}`, whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {activeFilter === "positive" ? (
              renderPositiveRows(filtered, onArchivePatient, onEditPatient)
            ) : (
              stagesToShow.map(s => renderStageRows(s, filtered, expandedStages, setExpandedStages, daysPending, onEditPatient, onAdvancePatient, onWithdrawPatient, onArchivePatient, onUploadCSV))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function renderPositiveRows(
  filtered: Patient[],
  onArchivePatient: (p: Patient) => void,
  onEditPatient: (p: Patient) => void,
) {
  const pos = filtered.filter(p => p.result === "Positive").sort((a, b) => {
    const da = a.resultDate ?? "", db = b.resultDate ?? "";
    if (da === db) return 0;
    return db.localeCompare(da);
  });
  if (!pos.length) return (
    <tr><td colSpan={10} style={{ textAlign: "center", padding: "40px 20px", color: TXL }}>No positive results.</td></tr>
  );
  return pos.map(p => (
    <tr
      key={p.id}
      onClick={() => onEditPatient(p)}
      style={{ borderBottom: `0.5px solid ${BR}`, cursor: "pointer" }}
      onMouseEnter={e => e.currentTarget.style.background = LAV2}
      onMouseLeave={e => (e.currentTarget.style.background = "")}
    >
      <td style={{ padding: "8px 12px", fontSize: 12 }}>{p.ncssRef || "—"}</td>
      <td style={{ padding: "8px 12px", fontSize: 12 }}>{p.name}</td>
      <td style={{ padding: "8px 12px", fontSize: 12 }}>{p.mobile || "—"}</td>
      <td style={{ padding: "8px 12px", fontSize: 12 }}>{fmtDisplayDate(p.dispatchDate)}</td>
      <td style={{ padding: "8px 12px", fontSize: 12 }}>{fmtDisplayDate(p.receivedDate)}</td>
      <td style={{ padding: "8px 12px", fontSize: 12, fontWeight: 700 }}>{fmtDisplayDate(p.resultDate)}</td>
      <td style={{ padding: "8px 12px" }}><ResultBadge result={p.result} /></td>
      <td style={{ padding: "8px 12px", fontSize: 11, color: TXL, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={p.notes}>{p.notes || "—"}</td>
      <td style={{ padding: "8px 12px", textAlign: "center", color: "#ccc" }}>—</td>
      <td style={{ padding: "8px 12px", whiteSpace: "nowrap" }} onClick={e => e.stopPropagation()}>
        <span onClick={() => onArchivePatient(p)} style={{ color: TXM, fontSize: 11, cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 2 }}>Archive</span>
      </td>
    </tr>
  ));
}

function renderStageRows(
  s: StageInfo,
  filtered: Patient[],
  expandedStages: Record<number, boolean>,
  setExpandedStages: Dispatch<SetStateAction<Record<number, boolean>>>,
  daysPending: (p: Patient) => number | null,
  onEditPatient: (p: Patient) => void,
  onAdvancePatient: (p: Patient) => void,
  onWithdrawPatient: (p: Patient) => void,
  onArchivePatient: (p: Patient) => void,
  onUploadCSV: (id: Stage) => void,
) {
  const all = filtered.filter(p => p.stage === s.id);
  const sorted = [...all].sort((a, b) => {
    const da = daysPending(a), db = daysPending(b);
    if (da === null && db === null) return 0;
    if (da === null) return 1;
    if (db === null) return -1;
    return db - da;
  });
  const expanded = !!expandedStages[s.id];
  const CAP = 10;
  const rows = expanded ? sorted : sorted.slice(0, CAP);
  const hiddenCount = sorted.length - rows.length;

  return [
    <tr key={"hdr" + s.id} style={{ background: s.light }}>
      <td colSpan={10} style={{ padding: "8px 14px", borderBottom: `1px solid ${BR}` }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: s.color }} />
            <span style={{ fontSize: 14, fontWeight: 700, color: s.color }}>Stage {s.id} — {s.label}</span>
            <span style={{ background: s.color + "22", color: s.color, fontSize: 10, padding: "2px 8px", borderRadius: 10, fontWeight: 600 }}>{all.length} patient{all.length !== 1 ? "s" : ""}</span>
            {all.length > CAP && <span style={{ fontSize: 10, color: TXM, fontStyle: "italic" }}>sorted by days pending (most urgent first)</span>}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button style={actBtn({ borderColor: P, color: P, fontWeight: 700 })} onClick={() => onUploadCSV(s.id as Stage)}>↑ Upload CSV</button>
          </div>
        </div>
      </td>
    </tr>,
    ...(rows.length ? rows.map(p => (
      <tr
        key={p.id}
        onClick={() => onEditPatient(p)}
        style={{ borderBottom: `0.5px solid ${BR}`, cursor: "pointer" }}
        onMouseEnter={e => e.currentTarget.style.background = LAV2}
        onMouseLeave={e => (e.currentTarget.style.background = "")}
      >
        <td style={{ padding: "8px 12px", fontSize: 12 }}>{p.ncssRef || "—"}</td>
        <td style={{ padding: "8px 12px", fontSize: 12 }}>{p.name}</td>
        <td style={{ padding: "8px 12px", fontSize: 12 }}>{p.mobile || "—"}</td>
        <td style={{ padding: "8px 12px", fontSize: 12 }}>{s.id >= 2 ? fmtDisplayDate(p.dispatchDate) : <span style={{ color: BR }}>—</span>}</td>
        <td style={{ padding: "8px 12px", fontSize: 12 }}>{s.id >= 3 ? fmtDisplayDate(p.receivedDate) : <span style={{ color: BR }}>—</span>}</td>
        <td style={{ padding: "8px 12px", fontSize: 12 }}>{s.id >= 4 && p.resultDate ? fmtDisplayDate(p.resultDate) : <span style={{ color: BR }}>—</span>}</td>
        <td style={{ padding: "8px 12px" }}>{s.id >= 4 ? <ResultBadge result={p.result} /> : <span style={{ color: BR }}>—</span>}</td>
        <td style={{ padding: "8px 12px", fontSize: 11, color: TXL, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={p.notes}>{p.notes || "—"}</td>
        <td style={{ padding: "8px 12px", textAlign: "center" }}>
          {(() => {
            const d = daysPending(p);
            if (d === null) return <span style={{ color: "#ccc" }}>—</span>;
            const over = d > 30;
            return <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 10, fontSize: 11, fontWeight: over ? 700 : 400, background: over ? "#FCEBEB" : "transparent", color: over ? "#791F1F" : TXL, border: over ? "1px solid #F09595" : "none" }}>{d}d</span>;
          })()}
        </td>
        <td style={{ padding: "8px 12px", whiteSpace: "nowrap" }} onClick={e => e.stopPropagation()}>
          {p.stage < 4 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-start" }}>
              <span onClick={() => onAdvancePatient(p)} style={{ color: P, fontWeight: 700, fontSize: 11, cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 2 }}>Advance →</span>
              <span onClick={() => onWithdrawPatient(p)} style={{ color: "#791F1F", fontSize: 11, cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 2 }}>Early Termination</span>
            </div>
          ) : (
            <span onClick={() => onArchivePatient(p)} style={{ color: TXM, fontSize: 11, cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 2 }}>Archive</span>
          )}
        </td>
      </tr>
    )) : [<tr key={"empty" + s.id}><td colSpan={10} style={{ textAlign: "center", padding: "40px 20px", color: TXL }}>No patients in this stage.</td></tr>]),
    ...(all.length > CAP ? [
      <tr key={"more" + s.id} style={{ background: "#FBFAFD" }}>
        <td colSpan={10} style={{ padding: "10px 14px", textAlign: "center", borderBottom: `1px solid ${BR}` }}>
          {expanded ? (
            <>
              <span style={{ fontSize: 11, color: TXM }}>Showing all {all.length} patients.</span>{" "}
              <span onClick={() => setExpandedStages(es => ({ ...es, [s.id]: false }))} style={{ color: P, fontSize: 11, fontWeight: 700, cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 2, marginLeft: 6 }}>Show top {CAP}</span>
            </>
          ) : (
            <>
              <span style={{ fontSize: 11, color: TXM }}>Showing top {CAP} of {all.length} — {hiddenCount} more</span>{" "}
              <span onClick={() => setExpandedStages(es => ({ ...es, [s.id]: true }))} style={{ color: P, fontSize: 11, fontWeight: 700, cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 2, marginLeft: 6 }}>Show all</span>
            </>
          )}
        </td>
      </tr>
    ] : []),
  ];
}
