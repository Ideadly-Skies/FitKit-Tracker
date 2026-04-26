import { Patient, AuditEntry } from '../types';
import { TXM, TXL, BR } from '../constants';

interface AuditTrailProps {
  patient: Patient;
}

const STAGE_SHORT: Record<number, string> = {
  1: "Stage 1 (Packing)",
  2: "Stage 2 (Dispatch)",
  3: "Stage 3 (Lab)",
  4: "Stage 4 (Result)",
};

const ACTION_COLOR: Record<AuditEntry['action'], string> = {
  edited:    "#185FA5",
  advanced:  "#4B2D83",
  withdrawn: "#854F0B",
};

const ACTION_LABEL: Record<AuditEntry['action'], string> = {
  edited:    "Edited",
  advanced:  "Stage advanced",
  withdrawn: "Early terminated",
};

function fmtDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  const h = d.getHours();
  const mins = String(d.getMinutes()).padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = String(h % 12 || 12).padStart(2, "0");
  return `${dd}/${mm}/${yyyy}, ${h12}:${mins} ${ampm}`;
}

function Dot({ color }: { color: string }) {
  return <div style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0, marginTop: 3 }} />;
}

export default function AuditTrail({ patient }: AuditTrailProps) {
  const entries = [...patient.history].reverse();
  const isSeed = patient.createdAt === "2026-01-01T00:00:00.000Z";

  return (
    <div style={{ borderTop: `1px solid ${BR}`, paddingTop: 12, marginTop: 4 }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: TXM, marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>
        Audit Trail
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        {entries.map((e, i) => (
          <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
            <Dot color={ACTION_COLOR[e.action]} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <span style={{ fontSize: 11, color: TXL }}>{fmtDate(e.at)}</span>
              <span style={{ fontSize: 11, color: TXM }}>{" · "}<b style={{ color: "#333" }}>{e.by}</b>{" · "}</span>
              <span style={{ fontSize: 11, color: ACTION_COLOR[e.action], fontWeight: 600 }}>{ACTION_LABEL[e.action]}</span>
              {e.action === 'advanced' && e.fromStage != null && e.toStage != null && (
                <span style={{ fontSize: 11, color: TXM }}> — {STAGE_SHORT[e.fromStage]} → {STAGE_SHORT[e.toStage]}</span>
              )}
              {e.action === 'edited' && e.changed && e.changed.length > 0 && (
                <span style={{ fontSize: 11, color: TXM }}> — {e.changed.join(", ")}</span>
              )}
              {e.note && (
                <div style={{ fontSize: 11, color: TXM, marginTop: 1, fontStyle: "italic" }}>{e.note}</div>
              )}
            </div>
          </div>
        ))}

        {/* Creation row — always last */}
        <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
          <Dot color="#0F6E56" />
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: 11, color: TXL }}>
              {isSeed ? "Before audit tracking began" : fmtDate(patient.createdAt)}
            </span>
            <span style={{ fontSize: 11, color: TXM }}>{" · "}<b style={{ color: "#333" }}>{patient.createdBy}</b>{" · "}</span>
            <span style={{ fontSize: 11, color: "#0F6E56", fontWeight: 600 }}>Record created</span>
          </div>
        </div>
      </div>
    </div>
  );
}
