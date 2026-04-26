import { useState, useMemo, useEffect } from "react";
import { INIT_PATIENTS, INIT_ARCHIVED, STAGES, STAGE_CSV_HEADERS, STAGE_CSV_NAMES, HEADER_MAP, STAGE_REQUIRED } from './data';
import { normalise, ageFromDob, isValidSgMobile, today, nowIso } from './utils';
import { FONT, BG, TX } from './constants';
import {
  Patient, ArchivedPatient, Stage, Gender, Result, AuditEntry,
  EditModalState, AdvModalState, WithdrawModalState, ArchiveModalState,
  ArchiveView, UploadModalState, UploadState, ParsedRow, UploadError,
} from './types';
import Header from './components/Header';
import PipelineNav from './components/PipelineNav';
import StatsPanel from './components/StatsPanel';
import PatientTable from './components/PatientTable';
import EditModal from './components/EditModal';
import AdvanceModal from './components/AdvanceModal';
import WithdrawModal from './components/WithdrawModal';
import ArchiveModal from './components/ArchiveModal';
import ArchiveListModal from './components/ArchiveListModal';
import UploadModal from './components/UploadModal';
import LoginModal from './components/LoginModal';

const SEED_AUDIT = {
  createdAt: "2026-01-01T00:00:00.000Z",
  createdBy: "System",
  updatedAt: "2026-01-01T00:00:00.000Z",
  updatedBy: "System",
};

export default function App() {
  const [currentUser, setCurrentUser] = useState("");
  const [patients, setPatients] = useState<Patient[]>(() =>
    INIT_PATIENTS.map(p => ({ ...p, ...SEED_AUDIT, history: [] }))
  );
  const [archived, setArchived] = useState<ArchivedPatient[]>(() =>
    INIT_ARCHIVED.map(p => ({ ...p, ...SEED_AUDIT, history: [] }))
  );
  const [nextId, setNextId] = useState(55);
  const [activeStage, setActiveStage] = useState<Stage | 0>(0);
  const [activeFilter, setActiveFilter] = useState<'positive' | null>(null);
  const [search, setSearch] = useState("");
  const [editModal, setEditModal] = useState<EditModalState | null>(null);
  const [advModal, setAdvModal] = useState<AdvModalState | null>(null);
  const [withdrawModal, setWithdrawModal] = useState<WithdrawModalState | null>(null);
  const [archiveModal, setArchiveModal] = useState<ArchiveModalState | null>(null);
  const [archiveListOpen, setArchiveListOpen] = useState(false);
  const [archiveView, setArchiveView] = useState<ArchiveView>({ search: "", resultFilter: "", dateFrom: "", dateTo: "", page: 1 });
  const [expandedStages, setExpandedStages] = useState<Record<number, boolean>>({});
  const [uploadModal, setUploadModal] = useState<UploadModalState | null>(null);
  const [uploadState, setUploadState] = useState<UploadState>({ preview: null, errors: null, parsedRows: null });

  useEffect(() => {
    const id = "inter-font-loader";
    if (document.getElementById(id)) return;
    const l = document.createElement("link");
    l.id = id;
    l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap";
    document.head.appendChild(l);
  }, []);

  const filtered = useMemo(() => {
    const t = search.trim().toLowerCase();
    if (!t) return patients;
    const digitsOnly = t.replace(/[^0-9]/g, "");
    return patients.filter(p =>
      p.name.toLowerCase().includes(t) ||
      p.ncssRef.toLowerCase().includes(t) ||
      (digitsOnly && (p.mobile || "").includes(digitsOnly))
    );
  }, [patients, search]);

  const stageCount = (s: Stage) => patients.filter(p => p.stage === s).length;
  const stagesToShow = activeStage ? STAGES.filter(s => s.id === activeStage) : STAGES;

  function daysPending(p: Patient): number | null {
    if (p.stage === 1 || p.stage === 4) return null;
    const entryDate = p.stage === 2 ? p.dispatchDate : p.stage === 3 ? p.receivedDate : null;
    if (!entryDate) return null;
    const diff = Math.floor((Date.now() - new Date(entryDate).getTime()) / 86400000);
    return isNaN(diff) || diff < 0 ? null : diff;
  }

  function advanceOne(p: Patient) {
    setAdvModal({ patient: p, toStage: (p.stage + 1) as Stage, form: { dispatchDate: today(), labRef: "", receivedDate: today(), result: "", resultDate: today(), notes: p.notes || "" }, errors: {} });
  }

  function saveAdvance() {
    if (!advModal) return;
    const { patient, toStage, form } = advModal;
    const errors: AdvModalState['errors'] = {};
    if (toStage === 2 && !form.dispatchDate) errors.dispatchDate = "Dispatch Date is required.";
    if (toStage === 3) {
      if (!form.labRef) errors.labRef = "Lab Reference is required.";
      if (!form.receivedDate) errors.receivedDate = "Date Received is required.";
    }
    if (toStage === 4) {
      if (!form.result) errors.result = "Result is required.";
      if (!form.resultDate) errors.resultDate = "Result Date is required.";
    }
    if (Object.keys(errors).length) { setAdvModal(m => m ? ({ ...m, errors }) : m); return; }
    const ts = nowIso();
    const entry: AuditEntry = { at: ts, by: currentUser, action: 'advanced', fromStage: patient.stage, toStage };
    setPatients(ps => ps.map(p => p.id !== patient.id ? p : {
      ...p,
      ...(toStage === 2
        ? { dispatchDate: form.dispatchDate }
        : toStage === 3
        ? { labRef: form.labRef, receivedDate: form.receivedDate }
        : { result: form.result, resultDate: form.resultDate, labRef: form.labRef || p.labRef }),
      notes: form.notes,
      stage: toStage,
      updatedAt: ts,
      updatedBy: currentUser,
      history: [...p.history, entry],
    }));
    setAdvModal(null);
  }

  function saveWithdraw() {
    if (!withdrawModal) return;
    const { patient, result, reason } = withdrawModal;
    if (!result) { setWithdrawModal(m => m ? ({ ...m, errors: { result: "Please select a final result." } }) : m); return; }
    const ts = nowIso();
    const entry: AuditEntry = { at: ts, by: currentUser, action: 'withdrawn', fromStage: patient.stage, toStage: 4 as Stage, ...(reason ? { note: reason } : {}) };
    setPatients(ps => ps.map(p => p.id !== patient.id ? p : {
      ...p, stage: 4 as Stage, result, resultDate: today(),
      notes: reason ? `[Early Terminated — ${result}] ${reason}${p.notes ? " — " + p.notes : ""}` : (p.notes || `[Early Terminated — ${result}]`),
      updatedAt: ts,
      updatedBy: currentUser,
      history: [...p.history, entry],
    }));
    setWithdrawModal(null);
  }

  function saveArchive() {
    if (!archiveModal) return;
    const { patient, note } = archiveModal;
    const ts = nowIso();
    setPatients(ps => ps.filter(p => p.id !== patient.id));
    setArchived(a => [{ ...patient, archivedAt: today(), archiveNote: note || "", updatedAt: ts, updatedBy: currentUser }, ...a]);
    setArchiveModal(null);
  }

  function saveEdit() {
    if (!editModal) return;
    const { patient, form } = editModal;
    const errors: EditModalState['errors'] = {};

    if (patient.stage === 1) {
      if (!form.name || !form.name.trim()) errors.name = "Full Name is required.";
      if (!form.mobile || !form.mobile.trim()) errors.mobile = "Phone number is required.";
      else if (!isValidSgMobile(form.mobile)) errors.mobile = "Must be 8 digits starting with 6, 8 or 9. No '+' or country code.";
      if (form.dob) {
        const a = ageFromDob(form.dob);
        if (a === "") errors.dob = "Invalid date of birth.";
        else if (a < 50 || a > 100) errors.dob = "Age (from DOB) must be 50–100.";
      }
      if (!form.gender || !["M", "F"].includes(form.gender)) errors.gender = "Gender must be M or F.";
      if (!form.address || !form.address.trim()) errors.address = "Residential Address is required.";
      if (!form.postalCode || !form.postalCode.trim()) errors.postalCode = "Postal Code is required.";
      if (!form.source || !form.source.trim()) errors.source = "Source is required.";
    }
    if (patient.stage === 2) {
      if (!form.dispatchDate) errors.dispatchDate = "Kit Dispatch Date is required.";
    }
    if (patient.stage === 3) {
      if (!form.labRef || !form.labRef.trim()) errors.labRef = "Lab Reference is required.";
      if (!form.receivedDate) errors.receivedDate = "Lab Received Date is required.";
    }
    if (patient.stage === 4) {
      if (!form.result) errors.result = "Result is required.";
      if (!form.resultDate) errors.resultDate = "Result Date is required.";
    }

    if (Object.keys(errors).length) {
      setEditModal(m => m ? ({ ...m, errors }) : m);
      return;
    }

    // Detect changed fields for audit entry
    const changed: string[] = [];
    if (patient.stage === 1) {
      if ((form.name || "") !== (patient.name || "")) changed.push("Full Name");
      if ((form.nric || "") !== (patient.nric || "")) changed.push("NRIC");
      if ((form.dob || "") !== (patient.dob || "")) changed.push("Date of Birth");
      if (form.gender !== patient.gender) changed.push("Gender");
      if ((form.mobile || "") !== (patient.mobile || "")) changed.push("Mobile");
      if ((form.address || "") !== (patient.address || "")) changed.push("Address");
      if ((form.postalCode || "") !== (patient.postalCode || "")) changed.push("Postal Code");
      if ((form.source || "") !== (patient.source || "")) changed.push("Source");
    }
    if (patient.stage === 2 && (form.dispatchDate || "") !== (patient.dispatchDate || "")) changed.push("Dispatch Date");
    if (patient.stage === 3) {
      if ((form.labRef || "") !== (patient.labRef || "")) changed.push("Lab Reference");
      if ((form.receivedDate || "") !== (patient.receivedDate || "")) changed.push("Lab Received Date");
    }
    if (patient.stage === 4) {
      if (form.result !== patient.result) changed.push("Result");
      if ((form.resultDate || "") !== (patient.resultDate || "")) changed.push("Result Date");
    }
    if ((form.notes || "") !== (patient.notes || "")) changed.push("Notes");

    const ts = nowIso();
    const entry: AuditEntry = { at: ts, by: currentUser, action: 'edited', changed };

    setPatients(ps => ps.map(p => {
      if (p.id !== patient.id) return p;
      const newHistory = changed.length > 0 ? [...p.history, entry] : p.history;
      const audit = { updatedAt: ts, updatedBy: currentUser, history: newHistory };
      if (p.stage === 1) {
        const age = ageFromDob(form.dob);
        return { ...p, name: form.name || p.name, age: age === "" ? p.age : age, nric: form.nric, gender: form.gender as Gender, dob: form.dob, mobile: form.mobile, address: form.address, postalCode: form.postalCode, source: form.source, notes: form.notes, ...audit };
      }
      if (p.stage === 2) return { ...p, dispatchDate: form.dispatchDate, notes: form.notes, ...audit };
      if (p.stage === 3) return { ...p, labRef: form.labRef, receivedDate: form.receivedDate, notes: form.notes, ...audit };
      if (p.stage === 4) return { ...p, result: form.result as Result, resultDate: form.resultDate, notes: form.notes, ...audit };
      return p;
    }));
    setEditModal(null);
  }

  function exportCSV() {
    const hdr = ["Reference ID", "Patient Name", "Mobile", "Stage", "Dispatch Date", "Lab Ref", "Date Received", "Result", "Result Date", "Residential Address", "Postal Code", "Source", "Notes"];
    const rows = patients.map(p => [p.ncssRef, p.name, p.mobile, p.stage, p.dispatchDate || "", p.labRef || "", p.receivedDate || "", p.result || "", p.resultDate || "", '"' + (p.address || "").replace(/"/g, '""') + '"', p.postalCode || "", '"' + (p.source || "").replace(/"/g, '""') + '"', '"' + (p.notes || "").replace(/"/g, '""') + '"']);
    const csv = [hdr, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.setAttribute("download", "fit_kit_tracker.csv");
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(url); document.body.removeChild(a); }, 200);
  }

  function openArchive() {
    setArchiveView({ search: "", resultFilter: "", dateFrom: "", dateTo: "", page: 1 });
    setArchiveListOpen(true);
  }

  function downloadTemplate(stageId: Stage) {
    const csv = STAGE_CSV_HEADERS[stageId];
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.setAttribute("download", STAGE_CSV_NAMES[stageId]);
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(url); document.body.removeChild(a); }, 200);
  }

  function handleFile(file: File, stageId: Stage) {
    if (!file.name.toLowerCase().endsWith(".csv")) {
      setUploadState({ errors: [{ type: "format", msg: "Please upload a .csv file. Download the template, fill it in Excel, then File → Save As → CSV." }], preview: null, parsedRows: null });
      return;
    }
    const reader = new FileReader();
    reader.onload = e => {
      const text = e.target!.result as string;
      const rows = text.split(/\r?\n/).map(r => {
        const cells: string[] = []; let cur = "", inQ = false;
        for (const ch of r) {
          if (ch === '"') { inQ = !inQ; }
          else if (ch === "," && !inQ) { cells.push(cur.trim()); cur = ""; }
          else cur += ch;
        }
        cells.push(cur.trim());
        return cells;
      }).filter(r => r.some(c => c.trim() !== ""));

      const reqCols = STAGE_REQUIRED[stageId];
      let headerIdx = -1;
      for (let i = 0; i < Math.min(rows.length, 10); i++) {
        const norm = rows[i].map(normalise);
        if (reqCols.every(req => norm.some(n => n.includes(req)))) { headerIdx = i; break; }
      }
      if (headerIdx < 0) {
        setUploadState({ errors: [{ type: "format", msg: `Wrong template for Stage ${stageId}. Please download the correct Stage ${stageId} template.` }], preview: null, parsedRows: null });
        return;
      }

      const normHeaders = rows[headerIdx].map(normalise);
      const colIdx: Partial<Record<keyof Patient, number>> = {};
      normHeaders.forEach((nh, i) => { for (const [k, v] of Object.entries(HEADER_MAP)) { if (nh.includes(k) && colIdx[v] == null) colIdx[v] = i; } });

      let dataStart = headerIdx + 1;
      if (dataStart < rows.length) { const nr = rows[dataStart].join(" ").toLowerCase(); if (nr.includes("e.g") || nr.includes("yyyy")) dataStart++; }

      const dataRows = rows.slice(dataStart).filter(r => r.some(c => c.trim() !== ""));
      if (!dataRows.length) {
        setUploadState({ errors: [{ type: "format", msg: "No patient data found. Fill in at least one row below the header." }], preview: null, parsedRows: null });
        return;
      }

      const get = (r: string[], field: keyof Patient): string => colIdx[field] != null ? String(r[colIdx[field]!] ?? "").trim() : "";
      const parsed: ParsedRow[] = [];
      const errors: UploadError[] = [];

      dataRows.forEach((r, idx) => {
        const rowNum = dataStart + idx + 1;
        const ncssRef = get(r, "ncssRef");
        if (!ncssRef) { errors.push({ type: "field", msg: `Row ${rowNum}: Reference ID required` }); return; }

        if (stageId === 1) {
          const name = get(r, "name"), ageRaw = get(r, "age"), genderRaw = get(r, "gender").toUpperCase(), mobile = get(r, "mobile");
          const address = get(r, "address"), postalCode = get(r, "postalCode"), source = get(r, "source");
          const errs: string[] = [];
          if (!name) errs.push("Full Name required");
          const age = parseInt(ageRaw, 10);
          if (!ageRaw) errs.push("Age required");
          else if (isNaN(age)) errs.push("Age must be a number");
          else if (age < 50 || age > 100) errs.push("Age must be 50–100");
          if (!genderRaw) errs.push("Gender required");
          else if (!["M", "F"].includes(genderRaw)) errs.push("Gender must be M or F");
          if (!mobile) errs.push("Mobile required");
          else if (!/^[689]\d{7}$/.test(mobile.replace(/\s/g, ""))) errs.push("Invalid SG mobile number");
          if (!address) errs.push("Residential Address required");
          if (!postalCode) errs.push("Postal Code required");
          if (!source) errs.push("Source required");
          if (patients.some(p => p.ncssRef === ncssRef)) errs.push(`Reference ID "${ncssRef}" already exists in portal`);
          if (parsed.some(p => !p._patch && p.ncssRef === ncssRef)) errs.push(`Reference ID "${ncssRef}" duplicated in file`);
          if (errs.length) { errors.push({ type: "field", msg: `Row ${rowNum} (${name || ncssRef}): ${errs.join("; ")}` }); return; }
          parsed.push({ id: 0, name, ncssRef, nric: get(r, "nric"), dob: get(r, "dob"), age, gender: genderRaw as Gender, mobile: mobile.replace(/\s/g, ""), address, postalCode, source, stage: 1, dispatchDate: "", labRef: "", receivedDate: "", result: "" as Result, resultDate: "", notes: get(r, "notes") });
        } else {
          const existing = patients.find(p => p.ncssRef === ncssRef);
          const errs: string[] = [];
          if (!existing) errs.push(`Reference ID "${ncssRef}" not found in portal`);
          else if (existing.stage !== stageId - 1) errs.push(`Reference ID "${ncssRef}" is currently in Stage ${existing.stage} — must be in Stage ${stageId - 1} to advance to Stage ${stageId}`);
          if (stageId === 2) {
            const dispatchDate = get(r, "dispatchDate");
            if (!dispatchDate) errs.push("Dispatch Date required");
            if (errs.length) { errors.push({ type: existing ? "field" : "ncss", msg: `Row ${rowNum} (${ncssRef}): ${errs.join("; ")}` }); return; }
            parsed.push({ _patch: true, ncssRef, stage: 2, dispatchDate, notes: get(r, "notes") });
          } else if (stageId === 3) {
            const labRef = get(r, "labRef"), receivedDate = get(r, "receivedDate");
            if (!labRef) errs.push("Lab Reference required");
            if (!receivedDate) errs.push("Date Kit Received required");
            if (errs.length) { errors.push({ type: existing ? "field" : "ncss", msg: `Row ${rowNum} (${ncssRef}): ${errs.join("; ")}` }); return; }
            parsed.push({ _patch: true, ncssRef, stage: 3, labRef, receivedDate, notes: get(r, "notes") });
          } else if (stageId === 4) {
            const result = get(r, "result"), resultDate = get(r, "resultDate");
            if (!result) errs.push("Result required");
            else if (!["Negative", "Positive", "Inconclusive", "Rejected", "Not Shared"].includes(result)) errs.push("Result must be Negative, Positive, Inconclusive, Rejected or Not Shared");
            if (!resultDate) errs.push("Result Date required");
            if (errs.length) { errors.push({ type: existing ? "field" : "ncss", msg: `Row ${rowNum} (${ncssRef}): ${errs.join("; ")}` }); return; }
            parsed.push({ _patch: true, ncssRef, stage: 4, result: result as Result, resultDate, notes: get(r, "notes") });
          }
        }
      });

      if (errors.length) { setUploadState({ errors, preview: null, parsedRows: null }); return; }
      setUploadState({ errors: null, preview: parsed, parsedRows: parsed });
    };
    reader.readAsText(file);
  }

  function confirmUpload(_stageId: Stage) {
    const { parsedRows } = uploadState;
    if (!parsedRows) return;
    let nid = nextId;
    const ts = nowIso();
    setPatients(ps => {
      let updated = [...ps];
      parsedRows.forEach(row => {
        if (row._patch) {
          const i = updated.findIndex(p => p.ncssRef === row.ncssRef);
          if (i >= 0) {
            const prior = updated[i];
            const mergedNotes = row.notes ? (prior.notes ? prior.notes + " | " + row.notes : row.notes) : prior.notes;
            const { _patch: _ignored, ...patchData } = row;
            const entry: AuditEntry = { at: ts, by: currentUser, action: 'advanced', fromStage: prior.stage, toStage: row.stage };
            updated[i] = { ...prior, ...patchData, notes: mergedNotes, updatedAt: ts, updatedBy: currentUser, history: [...prior.history, entry] } as Patient;
          }
        } else {
          updated = [...updated, { ...row, id: nid++, createdAt: ts, createdBy: currentUser, updatedAt: ts, updatedBy: currentUser, history: [] }] as Patient[];
        }
      });
      return updated;
    });
    setNextId(nid);
    setUploadModal(null);
    setUploadState({ preview: null, errors: null, parsedRows: null });
  }

  return (
    <div style={{ fontFamily: FONT, background: BG, color: TX, fontSize: 13, minHeight: "100vh" }}>
      {!currentUser && <LoginModal onLogin={setCurrentUser} />}

      <Header
        search={search}
        setSearch={setSearch}
        onOpenArchive={openArchive}
        onExportCSV={exportCSV}
        archivedCount={archived.length}
        currentUser={currentUser}
      />

      <PipelineNav
        activeStage={activeStage}
        onStageClick={id => { setActiveStage(activeStage === id ? 0 : id); setActiveFilter(null); }}
        stageCount={stageCount}
      />

      <StatsPanel
        patients={patients}
        archived={archived}
        activeFilter={activeFilter}
        onFilterPositive={() => { setActiveFilter("positive"); setActiveStage(0); }}
        onClearFilter={() => setActiveFilter(null)}
        onOpenArchive={openArchive}
      />

      <PatientTable
        filtered={filtered}
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        stagesToShow={stagesToShow}
        expandedStages={expandedStages}
        setExpandedStages={setExpandedStages}
        daysPending={daysPending}
        onEditPatient={p => setEditModal({ patient: p, form: { ...p }, errors: {} })}
        onAdvancePatient={advanceOne}
        onWithdrawPatient={p => setWithdrawModal({ patient: p, result: "", reason: "", errors: {} })}
        onArchivePatient={p => setArchiveModal({ patient: p, note: "" })}
        onUploadCSV={id => { setUploadModal({ stageId: id }); setUploadState({ preview: null, errors: null, parsedRows: null }); }}
      />

      <EditModal editModal={editModal} setEditModal={setEditModal} onSave={saveEdit} />
      <AdvanceModal advModal={advModal} setAdvModal={setAdvModal} onSave={saveAdvance} />
      <WithdrawModal withdrawModal={withdrawModal} setWithdrawModal={setWithdrawModal} onSave={saveWithdraw} />
      <ArchiveModal archiveModal={archiveModal} setArchiveModal={setArchiveModal} onSave={saveArchive} />
      <ArchiveListModal
        archived={archived}
        archiveListOpen={archiveListOpen}
        setArchiveListOpen={setArchiveListOpen}
        archiveView={archiveView}
        setArchiveView={setArchiveView}
      />
      <UploadModal
        uploadModal={uploadModal}
        setUploadModal={setUploadModal}
        uploadState={uploadState}
        setUploadState={setUploadState}
        onFileUpload={handleFile}
        onConfirmUpload={confirmUpload}
        onDownloadTemplate={downloadTemplate}
      />
    </div>
  );
}
