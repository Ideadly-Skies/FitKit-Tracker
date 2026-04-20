import Modal from './Modal';
import Field from './Field';
import { BR, TXM, FONT } from '../constants';

export default function WithdrawModal({ withdrawModal, setWithdrawModal, onSave }) {
  if (!withdrawModal) return null;
  const { patient } = withdrawModal;

  return (
    <Modal title="Withdraw Patient" onClose={() => setWithdrawModal(null)} onSave={onSave} saveLabel="Confirm Withdrawal">
      <div style={{ background: "#FEF6F6", border: "1px solid #F09595", borderRadius: 6, padding: 12, fontSize: 12, color: "#791F1F", lineHeight: 1.6 }}>
        <b>Confirm withdrawal for:</b><br />
        <span style={{ fontSize: 13 }}>{patient.name}</span> <span style={{ color: TXM }}>({patient.ncssRef})</span><br />
        <div style={{ marginTop: 8, fontSize: 11 }}>
          This patient will be moved to <b>Stage 4</b> with result marked <b>Withdrawn</b>. This action should be used when the patient is no longer participating (e.g. declined, deceased, uncontactable).
        </div>
      </div>
      <Field label="Reason (optional)">
        <textarea
          value={withdrawModal.reason || ""}
          onChange={e => setWithdrawModal(m => ({ ...m, reason: e.target.value }))}
          placeholder="e.g. Patient declined; uncontactable after 3 reminders"
          style={{ border: `1px solid ${BR}`, borderRadius: 4, padding: "6px 8px", fontSize: 12, width: "100%", resize: "vertical", minHeight: 60, fontFamily: FONT }}
        />
      </Field>
    </Modal>
  );
}
