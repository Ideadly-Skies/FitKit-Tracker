import { TXL } from '../constants';

export default function UploadErrors({ errors }) {
  const ncss = errors.filter(e => e.type === "ncss" || e.msg.includes("not found") || e.msg.includes("Stage"));
  const field = errors.filter(e => !ncss.includes(e));
  return (
    <div style={{ background: "#FEF6F6", border: "1px solid #F09595", borderRadius: 6, padding: "12px 14px", fontSize: 12, color: "#791F1F", lineHeight: 1.6 }}>
      {ncss.length > 0 && <>
        <div style={{ fontWeight: 700, marginBottom: 6 }}>⚠ {ncss.length} NCSS Reference ID{ncss.length > 1 ? "s" : ""} rejected — upload cancelled</div>
        <div style={{ background: "#fff", border: "1px solid #F09595", borderRadius: 6, overflow: "hidden", marginBottom: 8 }}>
          <div style={{ background: "#FCEBEB", padding: "7px 12px", fontSize: 11, fontWeight: 700, borderBottom: "1px solid #F09595" }}>Mismatched NCSS Reference IDs</div>
          <div style={{ padding: "8px 12px" }}>{ncss.map((e, i) => <div key={i}>• {e.msg}</div>)}</div>
        </div>
      </>}
      {field.length > 0 && <>
        <div style={{ fontWeight: 700, color: "#854F0B", marginBottom: 6 }}>{field.length} field validation error{field.length > 1 ? "s" : ""}</div>
        <div style={{ background: "#fff", border: "1px solid #f0c980", borderRadius: 6, overflow: "hidden" }}>
          <div style={{ background: "#FAEEDA", padding: "7px 12px", fontSize: 11, fontWeight: 700, color: "#854F0B", borderBottom: "1px solid #f0c980" }}>Field Errors</div>
          <div style={{ padding: "8px 12px", color: "#854F0B" }}>{field.map((e, i) => <div key={i}>• {e.msg}</div>)}</div>
        </div>
      </>}
      <div style={{ marginTop: 8, fontSize: 11, color: TXL }}>Please correct the errors and upload again. No records were updated.</div>
    </div>
  );
}
