import { P, BR, LAV, LAV2, TX, TXM } from '../constants';

export default function StatsPanel({ patients, archived, activeFilter, onFilterPositive, onClearFilter, onOpenArchive }) {
  const archiveCount = archived.length;
  const activeTotal = patients.length;
  const awaitingResult = patients.filter(p => p.stage < 4).length;
  const positiveResult = patients.filter(p => p.result === "Positive").length;
  const otherResult = patients.filter(p => ["Negative", "Inconclusive", "Withdrawn"].includes(p.result)).length;

  const rollupTiles = [
    { n: archiveCount, l: "Archive", kind: "rollup", onClick: onOpenArchive, clickable: true },
    { n: activeTotal, l: "Active test", kind: "rollup" },
  ];
  const breakdownTiles = [
    { n: awaitingResult, l: "Awaiting result" },
    {
      n: positiveResult, l: "Positive result", accent: "#C0392B",
      onClick: activeFilter === "positive" ? onClearFilter : onFilterPositive,
      clickable: true, active: activeFilter === "positive",
    },
    { n: otherResult, l: "Other result" },
  ];

  const renderTile = (s) => {
    const isActive = s.active;
    const baseBg = s.kind === "rollup" ? LAV : LAV2;
    const baseBorder = s.kind === "rollup" ? BR : `${BR}99`;
    return (
      <div
        key={s.l}
        onClick={s.onClick}
        style={{
          background: isActive ? P : baseBg,
          border: `1px solid ${isActive ? P : baseBorder}`,
          borderRadius: 8, padding: "10px 14px", minWidth: 110, textAlign: "center",
          flex: "1 1 auto", cursor: s.clickable ? "pointer" : "default",
          transition: "background .15s, border-color .15s",
          boxShadow: isActive ? "0 2px 8px rgba(75,45,131,.25)" : "none",
        }}
        onMouseEnter={s.clickable && !isActive ? e => { e.currentTarget.style.background = LAV; } : undefined}
        onMouseLeave={s.clickable && !isActive ? e => { e.currentTarget.style.background = baseBg; } : undefined}
      >
        <div style={{ fontSize: 22, fontWeight: 800, color: isActive ? "#fff" : (s.accent || TX), lineHeight: 1 }}>{s.n}</div>
        <div style={{ fontSize: 10, color: isActive ? "rgba(255,255,255,.8)" : TXM, marginTop: 4, textTransform: "uppercase", letterSpacing: .4, fontWeight: s.kind === "rollup" ? 700 : 500 }}>{s.l}</div>
      </div>
    );
  };

  return (
    <div style={{ padding: "12px 20px 16px", background: "#fff", borderBottom: `1px solid ${BR}` }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "stretch" }}>
        {rollupTiles.map(renderTile)}
        <div style={{ width: 1, background: BR, margin: "4px 4px" }} aria-hidden />
        {breakdownTiles.map(renderTile)}
      </div>
    </div>
  );
}
