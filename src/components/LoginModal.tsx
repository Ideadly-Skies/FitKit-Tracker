import { useState } from 'react';
import { P, BR, TX, TXM } from '../constants';

interface LoginModalProps {
  onLogin: (name: string) => void;
}

export default function LoginModal({ onLogin }: LoginModalProps) {
  const [name, setName] = useState("");

  function handleSubmit() {
    const trimmed = name.trim();
    if (!trimmed) return;
    onLogin(trimmed);
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(45,26,80,.7)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "#fff", borderRadius: 10, width: "100%", maxWidth: 400, border: `1px solid ${BR}` }}>
        <div style={{ background: P, color: "#fff", padding: "13px 18px", borderRadius: "10px 10px 0 0" }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>Start Session</h2>
        </div>
        <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 12 }}>
          <p style={{ fontSize: 12, color: TXM, margin: 0, lineHeight: 1.6 }}>
            Enter your name to begin. It will be recorded in the audit trail for all changes made during this session.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: TXM }}>Your Name *</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
              placeholder="e.g. James Kow"
              autoFocus
              style={{ border: `1px solid ${BR}`, borderRadius: 4, padding: "7px 10px", fontSize: 13, color: TX, outline: "none" }}
            />
          </div>
        </div>
        <div style={{ padding: "12px 18px", borderTop: `1px solid ${BR}`, display: "flex", justifyContent: "flex-end" }}>
          <button
            onClick={handleSubmit}
            disabled={!name.trim()}
            style={{ background: name.trim() ? P : "#bbb", color: "#fff", border: "none", padding: "7px 18px", borderRadius: 4, cursor: name.trim() ? "pointer" : "not-allowed", fontSize: 12, fontWeight: 700 }}
          >
            Start Session
          </button>
        </div>
      </div>
    </div>
  );
}
