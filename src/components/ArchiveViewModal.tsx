import Modal from './Modal';
import ResultBadge from './ResultBadge';
import AuditTrail from './AuditTrail';
import { ArchivedPatient } from '../types';
import { fmtDisplayDate } from '../utils';
import { TXM, TXL, BR, LAV2 } from '../constants';

interface ArchiveViewModalProps {
  patient: ArchivedPatient | null;
  onClose: () => void;
}

function Row2({ children }: { children: React.ReactNode }) {
  return <div style={{ display: "flex", gap: 12 }}>{children}</div>;
}

function Field2({ label, value, wide }: { label: string; value: React.ReactNode; wide?: boolean }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2, flex: wide ? "1 1 100%" : 1, minWidth: 0 }}>
      <span style={{ fontSize: 10, fontWeight: 700, color: TXM, textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</span>
      <span style={{ fontSize: 12, color: "#222", wordBreak: "break-word" }}>{value || <span style={{ color: TXL }}>—</span>}</span>
    </div>
  );
}

function Section({ title }: { title: string }) {
  return (
    <div style={{ fontSize: 10, fontWeight: 700, color: TXM, textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: `1px solid ${BR}`, paddingBottom: 4, marginTop: 4 }}>
      {title}
    </div>
  );
}

export default function ArchiveViewModal({ patient, onClose }: ArchiveViewModalProps) {
  if (!patient) return null;

  return (
    <Modal title={`Archive Record — ${patient.name} (${patient.ncssRef})`} onClose={onClose} onSave={null}>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>

        <div style={{ background: LAV2, border: `1px solid ${BR}`, borderRadius: 6, padding: "8px 12px", display: "flex", alignItems: "center", gap: 10 }}>
          <ResultBadge result={patient.result} />
          <span style={{ fontSize: 11, color: TXM }}>Archived on <b style={{ color: "#333" }}>{fmtDisplayDate(patient.archivedAt)}</b></span>
          {patient.archiveNote && <span style={{ fontSize: 11, color: TXL, fontStyle: "italic" }}>· {patient.archiveNote}</span>}
        </div>

        <Section title="Patient" />
        <Row2>
          <Field2 label="Reference ID" value={patient.ncssRef} />
          <Field2 label="NRIC" value={patient.nric} />
        </Row2>
        <Row2>
          <Field2 label="Full Name" value={patient.name} />
          <Field2 label="Gender" value={patient.gender} />
        </Row2>
        <Row2>
          <Field2 label="Date of Birth" value={fmtDisplayDate(patient.dob)} />
          <Field2 label="Age" value={String(patient.age)} />
        </Row2>
        <Row2>
          <Field2 label="Mobile" value={patient.mobile} />
          <Field2 label="Source" value={patient.source} />
        </Row2>
        <Field2 label="Residential Address" value={`${patient.address}${patient.postalCode ? ` S${patient.postalCode}` : ""}`} wide />

        <Section title="Screening Journey" />
        <Row2>
          <Field2 label="Dispatch Date" value={fmtDisplayDate(patient.dispatchDate)} />
          <Field2 label="Lab Reference" value={patient.labRef} />
        </Row2>
        <Row2>
          <Field2 label="Lab Received Date" value={fmtDisplayDate(patient.receivedDate)} />
          <Field2 label="Result Date" value={fmtDisplayDate(patient.resultDate)} />
        </Row2>
        {patient.notes && <Field2 label="Notes" value={patient.notes} wide />}

        <AuditTrail patient={patient} />
      </div>
    </Modal>
  );
}
