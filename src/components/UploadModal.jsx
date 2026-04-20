import Modal from './Modal';
import UploadErrors from './UploadErrors';
import UploadPreview from './UploadPreview';
import { P, BR, LAV2, TXL, FONT } from '../constants';

export default function UploadModal({ uploadModal, setUploadModal, uploadState, setUploadState, onFileUpload, onConfirmUpload, onDownloadTemplate }) {
  if (!uploadModal) return null;
  const { stageId } = uploadModal;
  const btnS = { background: P, color: "#fff", border: "none", padding: "7px 14px", borderRadius: 4, cursor: "pointer", fontSize: 12, fontWeight: 700 };

  return (
    <Modal
      title={`Upload CSV — Stage ${stageId}`}
      onClose={() => { setUploadModal(null); setUploadState({ preview: null, errors: null, parsedRows: null }); }}
      onSave={uploadState.parsedRows ? () => onConfirmUpload(stageId) : null}
      saveLabel={`Import ${uploadState.parsedRows?.length || 0} record${uploadState.parsedRows?.length !== 1 ? "s" : ""}`}
    >
      <div style={{ background: LAV2, border: `1px solid ${BR}`, borderRadius: 6, padding: 14, fontSize: 12, color: "#5a4a7a", lineHeight: 1.8 }}>
        <b style={{ color: P }}>How to use:</b><br />
        1. Download the CSV template below<br />
        2. Fill in patient details (one row per patient)<br />
        3. Save as <b>.csv</b> and upload here
      </div>

      <button style={{ ...btnS, width: "100%", padding: 10 }} onClick={() => onDownloadTemplate(stageId)}>
        ↓ Download CSV Template (Stage {stageId})
      </button>

      <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "4px 0" }}>
        <div style={{ flex: 1, height: 1, background: BR }} />
        <span style={{ fontSize: 11, color: TXL }}>then upload your filled file</span>
        <div style={{ flex: 1, height: 1, background: BR }} />
      </div>

      <div
        onClick={() => document.getElementById("csv-upload-inp").click()}
        onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = P; }}
        onDragLeave={e => e.currentTarget.style.borderColor = BR}
        onDrop={e => { e.preventDefault(); e.currentTarget.style.borderColor = BR; const f = e.dataTransfer.files[0]; if (f) onFileUpload(f, stageId); }}
        style={{ border: `2px dashed ${BR}`, borderRadius: 8, padding: 28, textAlign: "center", cursor: "pointer", background: LAV2 }}
      >
        <div style={{ fontSize: 28, marginBottom: 8 }}>📂</div>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#2D1A50" }}>Click to select or drag & drop</div>
        <div style={{ fontSize: 11, color: TXL, marginTop: 4 }}>.csv files only</div>
        <input
          id="csv-upload-inp"
          type="file"
          accept=".csv"
          style={{ display: "none" }}
          onChange={e => { const f = e.target.files[0]; if (f) onFileUpload(f, stageId); }}
        />
      </div>

      {uploadState.errors && <UploadErrors errors={uploadState.errors} />}
      {uploadState.preview && <UploadPreview rows={uploadState.preview} stageId={stageId} />}
    </Modal>
  );
}
