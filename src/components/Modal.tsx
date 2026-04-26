import { ReactNode } from 'react';
import { P, BR } from '../constants';

interface ModalProps {
  title: string;
  children: ReactNode;
  onClose: () => void;
  onSave?: (() => void) | null;
  saveLabel?: string;
}

export default function Modal({ title, children, onClose, onSave, saveLabel = "Save" }: ModalProps) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(45,26,80,.45)", zIndex: 50, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: 20, overflowY: "auto" }}>
      <div style={{ background: "#fff", borderRadius: 10, width: "100%", maxWidth: 560, margin: "auto", border: `1px solid ${BR}` }}>
        <div style={{ background: P, color: "#fff", padding: "13px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", borderRadius: "10px 10px 0 0" }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>{title}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#fff", fontSize: 18, cursor: "pointer", opacity: .8 }}>✕</button>
        </div>
        <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 10 }}>{children}</div>
        <div style={{ padding: "12px 18px", borderTop: `1px solid ${BR}`, display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button onClick={onClose} style={{ background: "#fff", color: P, border: `1px solid ${BR}`, padding: "7px 14px", borderRadius: 4, cursor: "pointer", fontSize: 12, fontWeight: 700 }}>Cancel</button>
          {onSave && <button onClick={onSave} style={{ background: P, color: "#fff", border: "none", padding: "7px 14px", borderRadius: 4, cursor: "pointer", fontSize: 12, fontWeight: 700 }}>{saveLabel}</button>}
        </div>
      </div>
    </div>
  );
}
