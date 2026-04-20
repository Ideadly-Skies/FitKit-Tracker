import { BR, LAV2, TXM } from '../constants';

export default function UploadPreview({ rows, stageId }) {
  const cfg = {
    1: { cols: ["ncssRef", "name", "age", "gender", "mobile"], labels: ["NCSS Ref", "Name", "Age", "Sex", "Mobile"] },
    2: { cols: ["ncssRef", "dispatchDate", "notes"], labels: ["NCSS Ref", "Dispatch Date", "Notes"] },
    3: { cols: ["ncssRef", "receivedDate", "notes"], labels: ["NCSS Ref", "Date Received", "Notes"] },
    4: { cols: ["ncssRef", "result", "resultDate", "notes"], labels: ["NCSS Ref", "Result", "Result Date", "Notes"] },
  };
  const { cols, labels } = cfg[stageId] || cfg[1];
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
            {rows.map((p, i) => (
              <tr key={i} style={{ borderTop: `0.5px solid ${BR}` }}>
                {cols.map(c => <td key={c} style={{ padding: "5px 8px" }}>{p[c] || "—"}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
