import ResultBadge from './ResultBadge';
import { today } from '../utils';
import { P, BR, LAV2, TX, TXL, TXM, FONT } from '../constants';

function exportArchiveCSV(rows) {
  const hdr = ["NCSS Ref", "Patient Name", "Phone", "Result", "Result Date", "Archived On", "Archive Note"];
  const body = rows.map(p => [p.ncssRef, p.name, p.mobile, p.result || "", p.resultDate || "", p.archivedAt || "", '"' + (p.archiveNote || "").replace(/"/g, '""') + '"']);
  const csv = [hdr, ...body].map(r => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.setAttribute("download", `fit_kit_archive_${today()}.csv`);
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(url); document.body.removeChild(a); }, 200);
}

function pagerPages(cur, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set([1, total, cur, cur - 1, cur + 1]);
  const arr = [...pages].filter(n => n >= 1 && n <= total).sort((a, b) => a - b);
  const out = [];
  for (let i = 0; i < arr.length; i++) {
    if (i > 0 && arr[i] - arr[i - 1] > 1) out.push("…");
    out.push(arr[i]);
  }
  return out;
}

export default function ArchiveListModal({ archived, archiveListOpen, setArchiveListOpen, archiveView, setArchiveView }) {
  if (!archiveListOpen) return null;

  const { search: aSearch, resultFilter, dateFrom, dateTo, page } = archiveView;
  const PAGE_SIZE = 25;

  const allSorted = [...archived].sort((a, b) => (b.archivedAt || "").localeCompare(a.archivedAt || ""));

  const searchDigits = aSearch.replace(/[^0-9]/g, "");
  const searchLower = aSearch.trim().toLowerCase();
  const filteredArchive = allSorted.filter(p => {
    if (searchLower) {
      const matchText = p.name.toLowerCase().includes(searchLower) || p.ncssRef.toLowerCase().includes(searchLower);
      const matchPhone = searchDigits && (p.mobile || "").includes(searchDigits);
      if (!matchText && !matchPhone) return false;
    }
    if (resultFilter && p.result !== resultFilter) return false;
    if (dateFrom && (p.archivedAt || "") < dateFrom) return false;
    if (dateTo && (p.archivedAt || "") > dateTo) return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filteredArchive.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const startIdx = (currentPage - 1) * PAGE_SIZE;
  const pageRows = filteredArchive.slice(startIdx, startIdx + PAGE_SIZE);
  const hasActiveFilter = aSearch || resultFilter || dateFrom || dateTo;
  const pagerItems = pagerPages(currentPage, totalPages);

  const inputS = { border: `1px solid ${BR}`, borderRadius: 4, padding: "6px 10px", fontSize: 12, fontFamily: FONT, color: TX, background: "#fff" };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(45,26,80,.45)", zIndex: 50, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: 20, overflowY: "auto" }}>
      <div style={{ background: "#fff", borderRadius: 10, width: "100%", maxWidth: 1100, margin: "auto", border: `1px solid ${BR}` }}>
        <div style={{ background: P, color: "#fff", padding: "13px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", borderRadius: "10px 10px 0 0" }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>
            Archive — {archived.length.toLocaleString()} total record{archived.length !== 1 ? "s" : ""}
            {archived.length > 0 && <span style={{ fontWeight: 400, color: "rgba(255,255,255,.65)", fontSize: 11, marginLeft: 8 }}>sorted by archive date, latest first</span>}
          </h2>
          <button onClick={() => setArchiveListOpen(false)} style={{ background: "none", border: "none", color: "#fff", fontSize: 18, cursor: "pointer", opacity: .8 }}>✕</button>
        </div>

        <div style={{ padding: 18 }}>
          {archived.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 20px", color: TXL, fontSize: 13 }}>
              No archived patients yet.<br />
              <span style={{ fontSize: 11 }}>Archive completed Stage 4 records using the <b>Archive</b> action on any row.</span>
            </div>
          ) : (
            <>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end", marginBottom: 12, padding: 12, background: LAV2, border: `1px solid ${BR}`, borderRadius: 8 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 3, flex: "2 1 240px", minWidth: 200 }}>
                  <label style={{ fontSize: 10, fontWeight: 700, color: TXM, textTransform: "uppercase", letterSpacing: .3 }}>Search</label>
                  <input value={aSearch} onChange={e => setArchiveView(v => ({ ...v, search: e.target.value, page: 1 }))} placeholder="Name, NCSS ref, or phone..." style={inputS} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 3, flex: "1 1 150px", minWidth: 130 }}>
                  <label style={{ fontSize: 10, fontWeight: 700, color: TXM, textTransform: "uppercase", letterSpacing: .3 }}>Result</label>
                  <select value={resultFilter} onChange={e => setArchiveView(v => ({ ...v, resultFilter: e.target.value, page: 1 }))} style={inputS}>
                    <option value="">All results</option>
                    <option>Positive</option>
                    <option>Negative</option>
                    <option>Inconclusive</option>
                    <option>Withdrawn</option>
                  </select>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 3, flex: "1 1 140px", minWidth: 130 }}>
                  <label style={{ fontSize: 10, fontWeight: 700, color: TXM, textTransform: "uppercase", letterSpacing: .3 }}>Archived from</label>
                  <input type="date" value={dateFrom} onChange={e => setArchiveView(v => ({ ...v, dateFrom: e.target.value, page: 1 }))} style={inputS} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 3, flex: "1 1 140px", minWidth: 130 }}>
                  <label style={{ fontSize: 10, fontWeight: 700, color: TXM, textTransform: "uppercase", letterSpacing: .3 }}>Archived to</label>
                  <input type="date" value={dateTo} onChange={e => setArchiveView(v => ({ ...v, dateTo: e.target.value, page: 1 }))} style={inputS} />
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  {hasActiveFilter && (
                    <button onClick={() => setArchiveView({ search: "", resultFilter: "", dateFrom: "", dateTo: "", page: 1 })} style={{ background: "#fff", color: TXM, border: `1px solid ${BR}`, padding: "7px 12px", borderRadius: 4, cursor: "pointer", fontSize: 11, fontWeight: 700, fontFamily: FONT, whiteSpace: "nowrap" }}>Reset</button>
                  )}
                  <button
                    onClick={() => exportArchiveCSV(filteredArchive)}
                    disabled={filteredArchive.length === 0}
                    style={{ background: filteredArchive.length ? P : "#ccc", color: "#fff", border: "none", padding: "7px 12px", borderRadius: 4, cursor: filteredArchive.length ? "pointer" : "not-allowed", fontSize: 11, fontWeight: 700, fontFamily: FONT, whiteSpace: "nowrap" }}
                  >↓ Export CSV</button>
                </div>
              </div>

              <div style={{ fontSize: 11, color: TXM, marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span>
                  {filteredArchive.length === 0 ? (
                    <span style={{ color: "#791F1F" }}>No records match the current filters.</span>
                  ) : (
                    <>
                      Showing <b>{(startIdx + 1).toLocaleString()}–{Math.min(startIdx + PAGE_SIZE, filteredArchive.length).toLocaleString()}</b> of <b>{filteredArchive.length.toLocaleString()}</b>
                      {hasActiveFilter && archived.length !== filteredArchive.length && (
                        <span style={{ color: TXL }}> &nbsp;(filtered from {archived.length.toLocaleString()} total)</span>
                      )}
                    </>
                  )}
                </span>
                <span style={{ color: TXL }}>Page {currentPage} of {totalPages}</span>
              </div>

              <div style={{ border: `1px solid ${BR}`, borderRadius: 6, overflow: "hidden", maxHeight: 480, overflowY: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                  <thead>
                    <tr style={{ background: LAV2, position: "sticky", top: 0, zIndex: 1 }}>
                      {["Refer ID", "Patient Name", "Phone", "Result", "Result Date", "Archived On", "Archive Note"].map(h => (
                        <th key={h} style={{ color: TXM, fontSize: 11, fontWeight: 700, padding: "8px 12px", textAlign: "left", borderBottom: `1px solid ${BR}`, whiteSpace: "nowrap", background: LAV2 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pageRows.length === 0 ? (
                      <tr><td colSpan={7} style={{ textAlign: "center", padding: "40px 20px", color: TXL, fontSize: 12 }}>
                        No records match these filters.<br />
                        <span style={{ fontSize: 11 }}>Try clearing filters or adjusting the date range.</span>
                      </td></tr>
                    ) : pageRows.map(p => (
                      <tr key={p.id} style={{ borderBottom: `0.5px solid ${BR}` }}>
                        <td style={{ padding: "8px 12px" }}>{p.ncssRef}</td>
                        <td style={{ padding: "8px 12px" }}>{p.name}</td>
                        <td style={{ padding: "8px 12px" }}>{p.mobile}</td>
                        <td style={{ padding: "8px 12px" }}><ResultBadge result={p.result} /></td>
                        <td style={{ padding: "8px 12px" }}>{p.resultDate || "—"}</td>
                        <td style={{ padding: "8px 12px", color: TXM }}>{p.archivedAt || "—"}</td>
                        <td style={{ padding: "8px 12px", fontSize: 11, color: TXL, maxWidth: 240, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={p.archiveNote}>{p.archiveNote || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 4, marginTop: 12 }}>
                  <button onClick={() => setArchiveView(v => ({ ...v, page: Math.max(1, currentPage - 1) }))} disabled={currentPage === 1} style={{ background: "#fff", color: currentPage === 1 ? TXL : TXM, border: `1px solid ${BR}`, padding: "6px 10px", borderRadius: 4, cursor: currentPage === 1 ? "not-allowed" : "pointer", fontSize: 11, fontFamily: FONT, fontWeight: 600 }}>‹ Prev</button>
                  {pagerItems.map((it, i) => (
                    it === "…" ? (
                      <span key={"gap" + i} style={{ color: TXL, padding: "0 4px", fontSize: 11 }}>…</span>
                    ) : (
                      <button key={it} onClick={() => setArchiveView(v => ({ ...v, page: it }))} style={{ background: it === currentPage ? P : "#fff", color: it === currentPage ? "#fff" : TXM, border: `1px solid ${it === currentPage ? P : BR}`, padding: "6px 10px", borderRadius: 4, cursor: "pointer", fontSize: 11, fontFamily: FONT, fontWeight: 700, minWidth: 30 }}>{it}</button>
                    )
                  ))}
                  <button onClick={() => setArchiveView(v => ({ ...v, page: Math.min(totalPages, currentPage + 1) }))} disabled={currentPage === totalPages} style={{ background: "#fff", color: currentPage === totalPages ? TXL : TXM, border: `1px solid ${BR}`, padding: "6px 10px", borderRadius: 4, cursor: currentPage === totalPages ? "not-allowed" : "pointer", fontSize: 11, fontFamily: FONT, fontWeight: 600 }}>Next ›</button>
                </div>
              )}
            </>
          )}
        </div>

        <div style={{ padding: "12px 18px", borderTop: `1px solid ${BR}`, display: "flex", justifyContent: "flex-end" }}>
          <button onClick={() => setArchiveListOpen(false)} style={{ background: P, color: "#fff", border: "none", padding: "7px 14px", borderRadius: 4, cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: FONT }}>Close</button>
        </div>
      </div>
    </div>
  );
}
