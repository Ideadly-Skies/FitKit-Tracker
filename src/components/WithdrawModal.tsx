import { Dispatch, SetStateAction } from 'react';
import Modal from './Modal';
import Field from './Field';
import ErrorText from './ErrorText';
import { WithdrawModalState } from '../types';
import { BR, TXM, FONT } from '../constants';

interface WithdrawModalProps {
  withdrawModal: WithdrawModalState | null;
  setWithdrawModal: Dispatch<SetStateAction<WithdrawModalState | null>>;
  onSave: () => void;
}

export default function WithdrawModal({ withdrawModal, setWithdrawModal, onSave }: WithdrawModalProps) {
  if (!withdrawModal) return null;
  const { patient, errors } = withdrawModal;

  return (
    <Modal title="Early Termination" onClose={() => setWithdrawModal(null)} onSave={onSave} saveLabel="Confirm Early Termination">
      <div style={{ background: "#FEF6F6", border: "1px solid #F09595", borderRadius: 6, padding: 12, fontSize: 12, color: "#791F1F", lineHeight: 1.6 }}>
        <b>Confirm early termination for:</b><br />
        <span style={{ fontSize: 13 }}>{patient.name}</span> <span style={{ color: TXM }}>({patient.ncssRef})</span><br />
        <div style={{ marginTop: 8, fontSize: 11 }}>
          This patient will be moved to <b>Stage 4</b>. Please select the final result and provide a reason.
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <label style={{ fontSize: 11, fontWeight: 700, color: TXM }}>Final Result *</label>
        <select
          value={withdrawModal.result}
          onChange={e => setWithdrawModal(m => m ? ({ ...m, result: e.target.value as 'Rejected' | 'Not Shared' | '' }) : m)}
          style={{ border: `1px solid ${errors.result ? "#F09595" : BR}`, borderRadius: 4, padding: "6px 8px", fontSize: 12 }}
        >
          <option value="">-- Select --</option>
          <option>Rejected</option>
          <option>Not Shared</option>
        </select>
        <ErrorText msg={errors.result} />
      </div>
      <Field label="Reason (optional)">
        <textarea
          value={withdrawModal.reason}
          onChange={e => setWithdrawModal(m => m ? ({ ...m, reason: e.target.value }) : m)}
          placeholder="e.g. Patient declined; uncontactable after 3 reminders"
          style={{ border: `1px solid ${BR}`, borderRadius: 4, padding: "6px 8px", fontSize: 12, width: "100%", resize: "vertical", minHeight: 60, fontFamily: FONT }}
        />
      </Field>
    </Modal>
  );
}
