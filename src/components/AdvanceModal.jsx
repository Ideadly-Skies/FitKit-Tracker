import Modal from './Modal';
import Field from './Field';
import Row from './Row';
import { STAGES } from '../data';
import { BR, TXM, FONT } from '../constants';

export default function AdvanceModal({ advModal, setAdvModal, onSave }) {
  if (!advModal) return null;
  const { patient, toStage, form } = advModal;

  return (
    <Modal title={`Advance to Stage ${toStage} — ${STAGES[toStage - 1].label}`} onClose={() => setAdvModal(null)} onSave={onSave}>
      <p style={{ fontSize: 12, color: TXM, marginBottom: 8 }}>Patient: <b>{patient.name}</b></p>

      {toStage === 2 && (
        <Field label="Dispatch Date *" type="date" value={form.dispatchDate} onChange={v => setAdvModal(m => ({ ...m, form: { ...m.form, dispatchDate: v } }))} />
      )}

      {toStage === 3 && (
        <Row>
          <Field label="Lab Reference *" value={form.labRef} onChange={v => setAdvModal(m => ({ ...m, form: { ...m.form, labRef: v } }))} />
          <Field label="Date Received *" type="date" value={form.receivedDate} onChange={v => setAdvModal(m => ({ ...m, form: { ...m.form, receivedDate: v } }))} />
        </Row>
      )}

      {toStage === 4 && <>
        <Row>
          <div style={{ display: "flex", flexDirection: "column", gap: 3, flex: 1 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: TXM }}>Result *</label>
            <select value={form.result} onChange={e => setAdvModal(m => ({ ...m, form: { ...m.form, result: e.target.value } }))} style={{ border: `1px solid ${BR}`, borderRadius: 4, padding: "6px 8px", fontSize: 12 }}>
              <option value="">-- Select --</option>
              <option>Negative</option>
              <option>Positive</option>
              <option>Inconclusive</option>
              <option>Withdrawn</option>
            </select>
          </div>
          <Field label="Result Date *" type="date" value={form.resultDate} onChange={v => setAdvModal(m => ({ ...m, form: { ...m.form, resultDate: v } }))} />
        </Row>
        <Field label="Lab Reference" value={form.labRef || patient.labRef} onChange={v => setAdvModal(m => ({ ...m, form: { ...m.form, labRef: v } }))} />
      </>}

      <Field label="Notes">
        <textarea value={form.notes || ""} onChange={e => setAdvModal(m => ({ ...m, form: { ...m.form, notes: e.target.value } }))} style={{ border: `1px solid ${BR}`, borderRadius: 4, padding: "6px 8px", fontSize: 12, width: "100%", resize: "vertical", minHeight: 60, fontFamily: FONT }} />
      </Field>
    </Modal>
  );
}
