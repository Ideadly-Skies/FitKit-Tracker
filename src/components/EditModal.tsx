import { Dispatch, SetStateAction } from 'react';
import Modal from './Modal';
import Field from './Field';
import Row from './Row';
import ErrorText from './ErrorText';
import AuditTrail from './AuditTrail';
import { EditModalState, Gender, Result } from '../types';
import { ageFromDob } from '../utils';
import { BR, TXM, FONT } from '../constants';

interface EditModalProps {
  editModal: EditModalState | null;
  setEditModal: Dispatch<SetStateAction<EditModalState | null>>;
  onSave: () => void;
}

export default function EditModal({ editModal, setEditModal, onSave }: EditModalProps) {
  if (!editModal) return null;
  const errs = editModal.errors ?? {};
  const errCount = Object.keys(errs).length;
  const { patient, form } = editModal;

  return (
    <Modal title={`Edit — ${patient.name} (Stage ${patient.stage})`} onClose={() => setEditModal(null)} onSave={onSave}>
      {errCount > 0 && (
        <div style={{ background: "#FEF6F6", border: "1px solid #F09595", borderRadius: 6, padding: "10px 12px", fontSize: 12, color: "#791F1F", lineHeight: 1.5 }}>
          <b>⚠ {errCount} validation error{errCount > 1 ? "s" : ""} — please correct below before saving.</b>
        </div>
      )}

      {patient.stage === 1 && <>
        <p style={{ fontSize: 11, color: TXM, marginBottom: 4 }}>Most fields are editable for Stage 1. <b>Age is auto-computed from Date of Birth.</b></p>
        <Field label="Reference ID" value={patient.ncssRef} readOnly />
        <Row>
          <Field label="Full Name *" value={form.name} onChange={v => setEditModal(m => m ? ({ ...m, form: { ...m.form, name: v } }) : m)} />
          <Field label="Age (auto)" value={String(ageFromDob(form.dob) ?? "")} readOnly />
        </Row>
        <ErrorText msg={errs.name} />
        <Row>
          <Field label="NRIC (masked)" value={form.nric} onChange={v => setEditModal(m => m ? ({ ...m, form: { ...m.form, nric: v } }) : m)} />
          <div style={{ display: "flex", flexDirection: "column", gap: 3, flex: "0 0 60px" }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: TXM }}>Gender</label>
            <select value={form.gender} onChange={e => setEditModal(m => m ? ({ ...m, form: { ...m.form, gender: e.target.value as Gender } }) : m)} style={{ border: `1px solid ${errs.gender ? "#F09595" : BR}`, borderRadius: 4, padding: "6px 8px", fontSize: 12 }}>
              <option value="M">M</option>
              <option value="F">F</option>
            </select>
          </div>
        </Row>
        <ErrorText msg={errs.gender} />
        <Row>
          <Field label="Mobile * (SG, 8 digits, starts 6/8/9)" value={form.mobile} onChange={v => setEditModal(m => m ? ({ ...m, form: { ...m.form, mobile: v.replace(/[^0-9]/g, "").slice(0, 8) } }) : m)} />
          <Field label="Date of Birth" type="date" value={form.dob} onChange={v => setEditModal(m => m ? ({ ...m, form: { ...m.form, dob: v } }) : m)} />
        </Row>
        <ErrorText msg={errs.mobile} />
        <ErrorText msg={errs.dob} />
        <Field label="Residential Address *" value={form.address} onChange={v => setEditModal(m => m ? ({ ...m, form: { ...m.form, address: v } }) : m)} />
        <ErrorText msg={errs.address} />
        <Field label="Postal Code *" value={form.postalCode} onChange={v => setEditModal(m => m ? ({ ...m, form: { ...m.form, postalCode: v } }) : m)} />
        <ErrorText msg={errs.postalCode} />
        <Field label="Source *" value={form.source} onChange={v => setEditModal(m => m ? ({ ...m, form: { ...m.form, source: v } }) : m)} />
        <ErrorText msg={errs.source} />
        <Field label="Notes">
          <textarea value={form.notes} onChange={e => setEditModal(m => m ? ({ ...m, form: { ...m.form, notes: e.target.value } }) : m)} style={{ border: `1px solid ${BR}`, borderRadius: 4, padding: "6px 8px", fontSize: 12, width: "100%", resize: "vertical", minHeight: 60, fontFamily: FONT }} />
        </Field>
      </>}

      {patient.stage === 2 && <>
        <p style={{ fontSize: 11, color: TXM, marginBottom: 4 }}>Only <b>Kit Dispatch Date</b> and <b>Notes</b> are editable at Stage 2.</p>
        <Field label="Reference ID" value={patient.ncssRef} readOnly />
        <Field label="Patient Name" value={patient.name} readOnly />
        <Field label="Kit Dispatch Date *" type="date" value={form.dispatchDate} onChange={v => setEditModal(m => m ? ({ ...m, form: { ...m.form, dispatchDate: v } }) : m)} />
        <ErrorText msg={errs.dispatchDate} />
        <Field label="Notes">
          <textarea value={form.notes} onChange={e => setEditModal(m => m ? ({ ...m, form: { ...m.form, notes: e.target.value } }) : m)} style={{ border: `1px solid ${BR}`, borderRadius: 4, padding: "6px 8px", fontSize: 12, width: "100%", resize: "vertical", minHeight: 60, fontFamily: FONT }} />
        </Field>
      </>}

      {patient.stage === 3 && <>
        <p style={{ fontSize: 11, color: TXM, marginBottom: 4 }}>Only <b>Lab Reference</b>, <b>Lab Received Date</b> and <b>Notes</b> are editable at Stage 3.</p>
        <Field label="Reference ID" value={patient.ncssRef} readOnly />
        <Field label="Patient Name" value={patient.name} readOnly />
        <Row>
          <Field label="Lab Reference *" value={form.labRef} onChange={v => setEditModal(m => m ? ({ ...m, form: { ...m.form, labRef: v } }) : m)} />
          <Field label="Lab Received Date *" type="date" value={form.receivedDate} onChange={v => setEditModal(m => m ? ({ ...m, form: { ...m.form, receivedDate: v } }) : m)} />
        </Row>
        <ErrorText msg={errs.labRef} />
        <ErrorText msg={errs.receivedDate} />
        <Field label="Notes">
          <textarea value={form.notes} onChange={e => setEditModal(m => m ? ({ ...m, form: { ...m.form, notes: e.target.value } }) : m)} style={{ border: `1px solid ${BR}`, borderRadius: 4, padding: "6px 8px", fontSize: 12, width: "100%", resize: "vertical", minHeight: 60, fontFamily: FONT }} />
        </Field>
      </>}

      {patient.stage === 4 && <>
        <p style={{ fontSize: 11, color: TXM, marginBottom: 4 }}>Only <b>Result</b>, <b>Result Date</b> and <b>Notes</b> are editable at Stage 4.</p>
        <Field label="Reference ID" value={patient.ncssRef} readOnly />
        <Field label="Patient Name" value={patient.name} readOnly />
        <Row>
          <div style={{ display: "flex", flexDirection: "column", gap: 3, flex: 1 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: TXM }}>Result *</label>
            <select value={form.result} onChange={e => setEditModal(m => m ? ({ ...m, form: { ...m.form, result: e.target.value as Result } }) : m)} style={{ border: `1px solid ${errs.result ? "#F09595" : BR}`, borderRadius: 4, padding: "6px 8px", fontSize: 12 }}>
              <option value="">-- Select --</option>
              <option>Negative</option>
              <option>Positive</option>
              <option>Inconclusive</option>
              <option>Rejected</option>
              <option>Not Shared</option>
            </select>
          </div>
          <Field label="Result Date *" type="date" value={form.resultDate} onChange={v => setEditModal(m => m ? ({ ...m, form: { ...m.form, resultDate: v } }) : m)} />
        </Row>
        <ErrorText msg={errs.result} />
        <ErrorText msg={errs.resultDate} />
        <Field label="Notes">
          <textarea value={form.notes} onChange={e => setEditModal(m => m ? ({ ...m, form: { ...m.form, notes: e.target.value } }) : m)} style={{ border: `1px solid ${BR}`, borderRadius: 4, padding: "6px 8px", fontSize: 12, width: "100%", resize: "vertical", minHeight: 60, fontFamily: FONT }} />
        </Field>
      </>}

      <AuditTrail patient={patient} />
    </Modal>
  );
}
