import { useState, useMemo, useEffect } from "react";
import { INIT_PATIENTS, INIT_ARCHIVED, STAGES, STAGE_CSV_HEADERS, STAGE_CSV_NAMES, HEADER_MAP, STAGE_REQUIRED } from './data';
import { normalise, ageFromDob, isValidSgMobile, today } from './utils';
import { FONT, BG, TX } from './constants';
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

export default function App() {
  const [patients, setPatients] = useState(INIT_PATIENTS);
  const [archived, setArchived] = useState(INIT_ARCHIVED);
  const [nextId, setNextId] = useState(55);
  const [activeStage, setActiveStage] = useState(0);
  const [activeFilter, setActiveFilter] = useState(null);
  const [search, setSearch] = useState("");
  const [editModal, setEditModal] = useState(null);
  const [advModal, setAdvModal] = useState(null);
  const [withdrawModal, setWithdrawModal] = useState(null);
  const [archiveModal, setArchiveModal] = useState(null);
  const [archiveListOpen, setArchiveListOpen] = useState(false);
  const [archiveView, setArchiveView] = useState({ search: "", resultFilter: "", dateFrom: "", dateTo: "", page: 1 });
  const [expandedStages, setExpandedStages] = useState({});
  const [uploadModal, setUploadModal] = useState(null);
  const [uploadState, setUploadState] = useState({ preview: null, errors: null, parsedRows: null });

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

  const stageCount = s => patients.filter(p => p.stage === s).length;
  const stagesToShow = activeStage ? STAGES.filter(s => s.id === activeStage) : STAGES;

  function daysPending(p) {
    if (p.stage === 1) return null;
    if (p.stage === 4) return null;
    const entryDate = p.stage === 2 ? p.dispatchDate : p.stage === 3 ? p.receivedDate : null;
    if (!entryDate) return null;
    const diff = Math.floor((Date.now() - new Date(entryDate).getTime()) / 86400000);
    return isNaN(diff) || diff < 0 ? null : diff;
  }

  function advanceOne(p) {
    setAdvModal({ patient: p, toStage: p.stage + 1, form: { dispatchDate: today(), labRef: "", receivedDate: today(), result: "", resultDate: today(), notes: p.notes || "" } });
  }

  function saveAdvance() {
    const { patient, toStage, form } = advModal;
    if (toStage === 2 && !form.dispatchDate) { alert("Dispatch date required."); return; }
    if (toStage === 3 && !form.labRef) { alert("Lab reference required."); return; }
    if (toStage === 4 && !form.result) { alert("Result required."); return; }
    setPatients(ps => ps.map(p => p.id !== patient.id ? p : {
      ...p,
      ...(toStage === 2 ? { dispatchDate: form.dispatchDate } : toStage === 3 ? { labRef: form.labRef, receivedDate: form.receivedDate } : { result: form.result, resultDate: form.resultDate, labRef: form.labRef || p.labRef }),
      notes: form.notes,
      stage: toStage,
    }));
    setAdvModal(null);
  }

  function saveWithdraw() {
    const { patient, reason } = withdrawModal;
    setPatients(ps => ps.map(p => p.id !== patient.id ? p : {
      ...p, stage: 4, result: "Withdrawn", resultDate: today(),
      notes: reason ? `[Withdrawn] ${reason}${p.notes ? " — " + p.notes : ""}` : (p.notes || "[Withdrawn]"),
    }));
    setWithdrawModal(null);
  }

  function saveArchive() {
    const { patient, note } = archiveModal;
    setPatients(ps => ps.filter(p => p.id !== patient.id));
    setArchived(a => [{ ...patient, archivedAt: today(), archiveNote: note || "" }, ...a]);
    setArchiveModal(null);
  }

  function saveEdit() {
    const { patient, form } = editModal;
    const errors = {};

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
      setEditModal(m => ({ ...m, errors }));
      return;
    }

    setPatients(ps => ps.map(p => {
      if (p.id !== patient.id) return p;
      if (p.stage === 1) {
        const age = ageFromDob(form.dob);
        return { ...p, name: form.name || p.name, age: age === "" ? p.age : age, nric: form.nric, gender: form.gender, dob: form.dob, mobile: form.mobile, address: form.address, notes: form.notes };
      }
      if (p.stage === 2) return { ...p, dispatchDate: form.dispatchDate, notes: form.notes };
      if (p.stage === 3) return { ...p, labRef: form.labRef, receivedDate: form.receivedDate, notes: form.notes };
      if (p.stage === 4) return { ...p, result: form.result, resultDate: form.resultDate, notes: form.notes };
      return p;
    }));
    setEditModal(null);
  }

  function exportCSV() {
    const hdr = ["NCSS Ref", "Patient Name", "Mobile", "Stage", "Dispatch Date", "Lab Ref", "Date Received", "Result", "Result Date", "Notes"];
    const rows = patients.map(p => [p.ncssRef, p.name, p.mobile, p.stage, p.dispatchDate || "", p.labRef || "", p.receivedDate || "", p.result || "", p.resultDate || "", '"' + (p.notes || "").replace(/"/g, '""') + '"']);
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

  function downloadTemplate(stageId) {
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

  function handleFile(file, stageId) {
    if (!file.name.toLowerCase().endsWith(".csv")) {
      setUploadState({ errors: [{ type: "format", msg: "Please upload a .csv file. Download the template, fill it in Excel, then File → Save As → CSV." }], preview: null, parsedRows: null });
      return;
    }
    const reader = new FileReader();
    reader.onload = e => {
      const text = e.target.result;
      const rows = text.split(/\r?\n/).map(r => {
        const cells = []; let cur = "", inQ = false;
        for (const ch of r) {
          if (ch === '"') { inQ = !inQ; }
          else if (ch === "," && !inQ) { cells.push(cur.trim()); cur = ""; }
          else cur += ch;
        }
        cells.push(cur.trim());
        return cells;
      }).filter(r => r.some(c => c.trim() !== ""));

      const reqCols = STAGE_REQUIRED[stageId] || STAGE_REQUIRED[1];
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
      const colIdx = {};
      normHeaders.forEach((nh, i) => { for (const [k, v] of Object.entries(HEADER_MAP)) { if (nh.includes(k) && !colIdx[v]) colIdx[v] = i; } });

      let dataStart = headerIdx + 1;
      if (dataStart < rows.length) { const nr = rows[dataStart].join(" ").toLowerCase(); if (nr.includes("e.g") || nr.includes("yyyy")) dataStart++; }

      const dataRows = rows.slice(dataStart).filter(r => r.some(c => c.trim() !== ""));
      if (!dataRows.length) {
        setUploadState({ errors: [{ type: "format", msg: "No patient data found. Fill in at least one row below the header." }], preview: null, parsedRows: null });
        return;
      }

      const get = (r, field) => colIdx[field] != null ? String(r[colIdx[field]] ?? "").trim() : "";
      const parsed = []; const errors = [];

      dataRows.forEach((r, idx) => {
        const rowNum = dataStart + idx + 1;
        const ncssRef = get(r, "ncssRef");
        if (!ncssRef) { errors.push({ type: "field", msg: `Row ${rowNum}: NCSS Ref required` }); return; }

        if (stageId === 1) {
          const name = get(r, "name"), ageRaw = get(r, "age"), gender = get(r, "gender").toUpperCase(), mobile = get(r, "mobile");
          const errs = [];
          if (!name) errs.push("Full Name required");
          const age = parseInt(ageRaw);
          if (!ageRaw) errs.push("Age required");
          else if (isNaN(age)) errs.push("Age must be a number");
          else if (age < 50 || age > 100) errs.push("Age must be 50–100");
          if (!gender) errs.push("Gender required");
          else if (!["M", "F"].includes(gender)) errs.push("Gender must be M or F");
          if (!mobile) errs.push("Mobile required");
          else if (!/^[689]\d{7}$/.test(mobile.replace(/\s/g, ""))) errs.push("Invalid SG mobile number");
          if (patients.some(p => p.ncssRef === ncssRef)) errs.push(`NCSS Ref "${ncssRef}" already exists in portal`);
          if (parsed.some(p => p.ncssRef === ncssRef)) errs.push(`NCSS Ref "${ncssRef}" duplicated in file`);
          if (errs.length) { errors.push({ type: "field", msg: `Row ${rowNum} (${name || ncssRef}): ${errs.join("; ")}` }); return; }
          parsed.push({ id: 0, name, ncssRef, nric: get(r, "nric"), dob: get(r, "dob"), age, gender, mobile: mobile.replace(/\s/g, ""), address: get(r, "address"), stage: 1, dispatchDate: "", labRef: "", receivedDate: "", result: "", resultDate: "", notes: get(r, "notes") });
        } else {
          const existing = patients.find(p => p.ncssRef === ncssRef);
          const errs = [];
          if (!existing) errs.push(`NCSS Ref "${ncssRef}" not found in portal`);
          else if (existing.stage !== stageId - 1) errs.push(`NCSS Ref "${ncssRef}" is currently in Stage ${existing.stage} — must be in Stage ${stageId - 1} to advance to Stage ${stageId}`);
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
            else if (!["Negative", "Positive", "Inconclusive", "Withdrawn"].includes(result)) errs.push("Result must be Negative, Positive, Inconclusive or Withdrawn");
            if (!resultDate) errs.push("Result Date required");
            if (errs.length) { errors.push({ type: existing ? "field" : "ncss", msg: `Row ${rowNum} (${ncssRef}): ${errs.join("; ")}` }); return; }
            parsed.push({ _patch: true, ncssRef, stage: 4, result, resultDate, notes: get(r, "notes") });
          }
        }
      });

      if (errors.length) { setUploadState({ errors, preview: null, parsedRows: null }); return; }
      setUploadState({ errors: null, preview: parsed, parsedRows: parsed });
    };
    reader.readAsText(file);
  }

  function confirmUpload(stageId) {
    const { parsedRows } = uploadState;
    let nid = nextId;
    setPatients(ps => {
      let updated = [...ps];
      parsedRows.forEach(row => {
        if (row._patch) {
          const i = updated.findIndex(p => p.ncssRef === row.ncssRef);
          if (i >= 0) {
            const prior = updated[i];
            const mergedNotes = row.notes ? (prior.notes ? prior.notes + " | " + row.notes : row.notes) : prior.notes;
            updated[i] = { ...prior, ...row, notes: mergedNotes };
          }
        } else {
          updated = [...updated, { ...row, id: nid++ }];
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
      <Header
        search={search}
        setSearch={setSearch}
        onOpenArchive={openArchive}
        onExportCSV={exportCSV}
        archivedCount={archived.length}
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
        onWithdrawPatient={p => setWithdrawModal({ patient: p, reason: "" })}
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
