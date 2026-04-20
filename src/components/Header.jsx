import { TX, TXL, TXM, BR, P } from '../constants';

export default function Header({ search, setSearch, onOpenArchive, onExportCSV, archivedCount }) {
  const btnOl = { background: "#fff", color: P, border: `1.5px solid ${BR}`, padding: "7px 14px", borderRadius: 4, cursor: "pointer", fontSize: 12, fontWeight: 700 };
  return (
    <header style={{ background: "#fff", borderBottom: `1px solid ${BR}`, padding: "0 20px", display: "flex", alignItems: "stretch", justifyContent: "space-between", flexWrap: "wrap" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img src="/scs-logo.png" alt="Singapore Cancer Society" style={{ height: 40, width: "auto", objectFit: "contain" }} />
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: TX }}>Singapore Cancer Society</div>
            <div style={{ fontSize: 10, color: TXL }}>Minimising Cancer, Maximising Lives</div>
          </div>
        </div>
        <div style={{ width: 1, background: BR, margin: "10px 0" }} />
        <div style={{ paddingLeft: 14 }}>
          <span style={{ fontSize: 12, color: TXM, fontWeight: 600, display: "block" }}>FIT Kit Tracker</span>
          <small style={{ fontSize: 10, color: TXL }}>Faecal Immunochemical Test — Colorectal Cancer Screening</small>
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center", padding: "12px 0" }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search patient name or phone..."
          style={{ border: `1px solid ${BR}`, borderRadius: 4, padding: "6px 10px", fontSize: 12, width: 220, background: "#fff", color: TX }}
        />
        <button style={btnOl} onClick={onOpenArchive}>Archive ({archivedCount})</button>
        <button style={btnOl} onClick={onExportCSV}>Export CSV</button>
      </div>
    </header>
  );
}
