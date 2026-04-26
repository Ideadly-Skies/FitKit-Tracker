import { ParsedRow, Stage } from '../types';
import { BR, LAV2, TXM } from '../constants';

interface UploadPreviewProps {
  rows: ParsedRow[];
  stageId: Stage;
}

export default function UploadPreview({ rows, stageId }: UploadPreviewProps) {
  const cfg: Record<Stage, { cols: string[]; labels: string[] }> = {
    1: { cols: ["ncssRef", "name", "age", "gender", "mobile", "source"], labels: ["Reference ID", "Name", "Age", "Sex", "Mobile", "Source"] },
    2: { cols: ["ncssRef", "dispatchDate", "notes"], labels: ["Reference ID", "Dispatch Date", "Notes"] },
    3: { cols: ["ncssRef", "receivedDate", "notes"], labels: ["Reference ID", "Date Received", "Notes"] },
    4: { cols: ["ncssRef", "result", "resultDate", "notes"], labels: ["Reference ID", "Result", "Result Date", "Notes"] },
  };
  const { cols, labels } = cfg[stageId];
  return (
    <div>
      <div style={{ fontSize: 12, fontWeight: 700, color: TXM, marginBottom: 6 }}>
        Preview — {rows.length} record{rows.length !== 1 ? "s" : ""} ready to import
      </div>
      <div style={{ maxHeight: 200, overflowY: "auto", border: `1px solid ${BR}`, borderRadius: 6 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
          <thead>
            <tr style={{ background: LAV2 }}>
              {labels.map(l => <th key={l} style={{ padding: "5px 8px", textAlign: "left", color: TXM }}>{l}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map((p, i) => {
              const row = p as Record<string, unknown>;
              return (
                <tr key={i} style={{ borderTop: `0.5px solid ${BR}` }}>
                  {cols.map(c => <td key={c} style={{ padding: "5px 8px" }}>{row[c] != null && row[c] !== "" ? String(row[c]) : "—"}</td>)}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
