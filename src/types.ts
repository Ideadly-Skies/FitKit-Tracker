export type Gender = 'M' | 'F';
export type Stage = 1 | 2 | 3 | 4;
export type Result =
  | 'Negative'
  | 'Positive'
  | 'Inconclusive'
  | 'Withdrawn'
  | 'Early Terminated'
  | 'Rejected'
  | 'Not Shared'
  | '';

export interface AuditEntry {
  at: string;
  by: string;
  action: 'edited' | 'advanced' | 'withdrawn';
  fromStage?: Stage;
  toStage?: Stage;
  changed?: string[];
  note?: string;
}

export interface Patient {
  id: number;
  name: string;
  nric: string;
  dob: string;
  age: number;
  gender: Gender;
  mobile: string;
  address: string;
  postalCode: string;
  source: string;
  ncssRef: string;
  stage: Stage;
  dispatchDate: string;
  labRef: string;
  receivedDate: string;
  result: Result;
  resultDate: string;
  notes: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
  history: AuditEntry[];
}

export interface ArchivedPatient extends Patient {
  archivedAt: string;
  archiveNote: string;
}

export interface StageInfo {
  id: Stage;
  label: string;
  sub: string;
  color: string;
  light: string;
}

export interface UploadError {
  type: 'format' | 'ncss' | 'field';
  msg: string;
}

export type PatientSeed = Omit<Patient, 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy' | 'history'>;
export type ArchivedPatientSeed = Omit<ArchivedPatient, 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy' | 'history'>;

export type NewPatient = Omit<Patient, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy' | 'history'> & { id: 0; _patch?: never };

export interface PatchRow {
  _patch: true;
  ncssRef: string;
  stage: Stage;
  dispatchDate?: string;
  labRef?: string;
  receivedDate?: string;
  result?: Result;
  resultDate?: string;
  notes?: string;
}

export type ParsedRow = NewPatient | PatchRow;

export interface UploadState {
  preview: ParsedRow[] | null;
  errors: UploadError[] | null;
  parsedRows: ParsedRow[] | null;
}

export interface EditModalState {
  patient: Patient;
  form: Patient;
  errors: Partial<Record<keyof Patient, string>>;
}

export interface AdvFormState {
  dispatchDate: string;
  labRef: string;
  receivedDate: string;
  result: Result;
  resultDate: string;
  notes: string;
}

export interface AdvModalState {
  patient: Patient;
  toStage: Stage;
  form: AdvFormState;
  errors: Partial<Record<keyof AdvFormState, string>>;
}

export interface WithdrawModalState {
  patient: Patient;
  result: 'Rejected' | 'Not Shared' | '';
  reason: string;
  errors: { result?: string };
}

export interface ArchiveModalState {
  patient: Patient;
  note: string;
}

export interface UploadModalState {
  stageId: Stage;
}

export interface ArchiveView {
  search: string;
  resultFilter: string;
  dateFrom: string;
  dateTo: string;
  page: number;
}
