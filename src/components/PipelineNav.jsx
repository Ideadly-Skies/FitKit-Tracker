import { STAGES } from '../data';
import { P, BR, LAV, LAV2, TX, TXL } from '../constants';

export default function PipelineNav({ activeStage, onStageClick, stageCount }) {
  return (
    <div style={{ background: "#fff", padding: "14px 20px 10px", borderBottom: `1px solid ${BR}` }}>
      <div style={{ display: "flex", alignItems: "stretch", gap: 6, overflowX: "auto" }}>
        {STAGES.map((s, idx) => {
          const active = activeStage === s.id;
          const count = stageCount(s.id);
          return (
            <div key={s.id} style={{ display: "flex", alignItems: "stretch", flex: 1, minWidth: 200, gap: 6 }}>
              <div
                onClick={() => onStageClick(s.id)}
                style={{
                  flex: 1, display: "flex", alignItems: "center", gap: 14, padding: "14px 16px",
                  cursor: "pointer", borderRadius: 10,
                  background: active ? s.light : LAV2,
                  border: active ? `1px solid ${s.color}` : `1px solid ${BR}`,
                  transition: "background .15s, border-color .15s",
                  position: "relative", overflow: "hidden",
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = LAV; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = LAV2; }}
              >
                <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, background: s.color }} />
                <div style={{ flex: 1, minWidth: 0, paddingLeft: 4 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: active ? s.color : TX, lineHeight: 1.25, letterSpacing: .1 }}>
                    {s.label}
                  </div>
                </div>
                <div style={{
                  flexShrink: 0, minWidth: 44, height: 44, padding: "0 10px", borderRadius: 22,
                  background: active ? s.color : `${s.color}22`,
                  color: active ? "#fff" : s.color,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 20, fontWeight: 800, lineHeight: 1,
                  boxShadow: active ? "0 2px 8px rgba(0,0,0,.15)" : "none",
                  transition: "background .15s",
                }}>
                  {count}
                </div>
              </div>
              {idx < STAGES.length - 1 && (
                <div style={{ display: "flex", alignItems: "center", color: TXL, fontSize: 20, fontWeight: 300, userSelect: "none" }}>›</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
