import Modal from './Modal';
import Field from './Field';
import { P, BR, LAV2, TX, TXL, FONT } from '../constants';

export default function ArchiveModal({ archiveModal, setArchiveModal, onSave }) {
  if (!archiveModal) return null;
  const { patient } = archiveModal;

  return (
    <Modal title="Archive Patient" onClose={() => setArchiveModal(null)} onSave={onSave} saveLabel="Confirm Archive">
      <div style={{ background: LAV2, border: `1px solid ${BR}`, borderRadius: 6, padding: 12, fontSize: 12, color: TXL, lineHeight: 1.6 }}>
        <b style={{ color: P }}>Confirm archive for:</b><br />
        <span style={{ fontSize: 13, color: TX }}>{patient.name}</span> <span style={{ color: TXL }}>({patient.ncssRef})</span><br />
        <div style={{ marginTop: 8, fontSize: 11 }}>
          This completed record will be removed from the active Stage 4 list and moved to the Archive. The result and history are preserved. You can review all archived records via the <b>Archive</b> button in the header.
        </div>
      </div>
      <Field label="Result on file" value={patient.result || "—"} readOnly />
      <Field label="Archive note (optional)">
        <textarea
          value={archiveModal.note || ""}
          onChange={e => setArchiveModal(m => ({ ...m, note: e.target.value }))}
          placeholder="e.g. Closed — follow-up completed at polyclinic"
          style={{ border: `1px solid ${BR}`, borderRadius: 4, padding: "6px 8px", fontSize: 12, width: "100%", resize: "vertical", minHeight: 60, fontFamily: FONT }}
        />
      </Field>
    </Modal>
  );
}
