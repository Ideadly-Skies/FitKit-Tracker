import { TX, TXM, BR, FONT } from '../constants';

export default function Field({ label, value, onChange, type = "text", readOnly = false, children }) {
  const s = { display: "flex", flexDirection: "column", gap: 3 };
  const ls = { fontSize: 11, fontWeight: 700, color: TXM };
  const is = {
    border: `1px solid ${BR}`, borderRadius: 4, padding: "6px 8px", fontSize: 12,
    color: TX, width: "100%", background: readOnly ? "#f5f3fb" : "#fff",
    cursor: readOnly ? "default" : "text", fontFamily: FONT,
  };
  return (
    <div style={s}>
      <label style={ls}>{label}</label>
      {children || (
        <input
          type={type}
          value={value || ""}
          onChange={readOnly ? undefined : e => onChange(e.target.value)}
          readOnly={readOnly}
          style={is}
        />
      )}
    </div>
  );
}
