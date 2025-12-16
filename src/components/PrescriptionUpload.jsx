import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { uploadPrescription } from "../services/storageService";
import { createPrescriptionRecord, updatePrescription } from "../services/prescriptionService";
import { useToast } from "../context/ToastContext";
import "./PrescriptionUpload.css";
import { Link } from "react-router-dom";

// OCR helper: attempt to run OCR on an image or PDF and store text in the prescription record
async function runOCRForFile(file, recId, addToast) {
  try {
    // Try to load pdfjs first if PDF
    let pageImageBlob = null;
    if (file.type === 'application/pdf') {
      try {
        // dynamic import and set worker src
        const pdfjs = await import('pdfjs-dist/legacy/build/pdf');
        pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.js', import.meta.url).toString();
        const arrayBuffer = await file.arrayBuffer();
        const doc = await pdfjs.getDocument({ data: arrayBuffer }).promise;
        const page = await doc.getPage(1);
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement('canvas');
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        const ctx = canvas.getContext('2d');
        await page.render({ canvasContext: ctx, viewport }).promise;
        pageImageBlob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      } catch (e) {
        console.warn('PDF OCR preparation failed', e);
      }
    }

    // Prepare worker from tesseract
    try {
      const { createWorker } = await import('tesseract.js');
      const worker = await createWorker({ logger: (m) => {} });
      await worker.load();
      await worker.loadLanguage('eng');
      await worker.initialize('eng');

      const source = pageImageBlob || file;
      const { data } = await worker.recognize(source);
      await worker.terminate();

      if (data && data.text) {
        await updatePrescription(recId, { ocrText: data.text });
        addToast(`OCR completed for ${file.name}`);
      }
    } catch (e) {
      console.warn('Tesseract OCR failed', e);
    }
  } catch (err) {
    console.error('runOCRForFile error', err);
  }
}

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
const MAX_SIZE_MB = 5;

function isValidFile(file) {
  const okType = ACCEPTED_TYPES.includes(file.type);
  const okSize = file.size <= MAX_SIZE_MB * 1024 * 1024;
  return okType && okSize;
}

export default function PrescriptionUpload({ onUploaded }) {
  const [dragOver, setDragOver] = useState(false);
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");
  const [progressMap, setProgressMap] = useState({});
  const [lastProgressMap, setLastProgressMap] = useState({});
  const [downloadURLs, setDownloadURLs] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [statusMap, setStatusMap] = useState({}); // pending | uploading | done | failed
  const inputRef = useRef(null);

  const { user } = useAuth();
  const { addToast } = useToast();

  const pickFile = () => inputRef.current?.click();

  const handleFiles = (fileList) => {
    const validFiles = [];
    for (let f of fileList) {
      if (isValidFile(f)) validFiles.push(f);
    }
    if (validFiles.length === 0) {
      setError(`Invalid files. Allowed: JPG/PNG/WEBP/PDF up to ${MAX_SIZE_MB}MB.`);
      return;
    }
    setFiles([...files, ...validFiles]);
    setError("");
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeFile = (fileToRemove) => {
    setFiles(files.filter(f => f !== fileToRemove));
    setProgressMap(prev => {
      const newMap = { ...prev };
      delete newMap[fileToRemove.name];
      return newMap;
    });
  };

  const onUpload = async () => {
    setError("");
    if (!user) {
      setError("Please login to upload prescriptions.");
      return;
    }
    if (files.length === 0) {
      setError("Pick files first.");
      return;
    }

    setUploading(true);
    const uploadedURLs = [];

    const promises = files.map((f) =>
      (async () => {
        setStatusMap((s) => ({ ...s, [f.name]: "uploading" }));
        setProgressMap((prev) => ({ ...prev, [f.name]: 0 }));
        setLastProgressMap((p) => ({ ...p, [f.name]: Date.now() }));
        try {
          const url = await uploadPrescription(f, user.uid, (p) =>
            setProgressMap((prev) => {
              setLastProgressMap((lp) => ({ ...lp, [f.name]: Date.now() }));
              // also log for debugging
              // console.debug(`Progress ${f.name}: ${p}%`);
              return { ...prev, [f.name]: p };
            })
          );

          // Persist metadata in Firestore
          try {
            const rec = await createPrescriptionRecord(user.uid, {
              url,
              name: f.name,
              size: f.size,
              type: f.type,
              status: "uploaded",
            });
            uploadedURLs.push({ url, id: rec.id });
            // Start OCR in background (do not block upload flow)
            runOCRForFile(f, rec.id, addToast).catch((e) => console.warn('Background OCR failed', e));
          } catch (metaErr) {
            uploadedURLs.push({ url });
            console.error("Failed to save prescription metadata:", metaErr);
          }

          setStatusMap((s) => ({ ...s, [f.name]: "done" }));
          addToast(`Uploaded ${f.name} successfully`);
        } catch (e) {
          setStatusMap((s) => ({ ...s, [f.name]: "failed" }));
          addToast(e.message || `Failed to upload ${f.name}`);
          console.error(e);
        }
      })()
    );

    await Promise.all(promises);
    setDownloadURLs((prev) => [...prev, ...uploadedURLs]);
    onUploaded?.(uploadedURLs);
    setFiles([]);
    if (uploadedURLs.length > 0) {
      addToast(`Uploaded ${uploadedURLs.length} file(s) successfully`);
    }
    setUploading(false);
  };

  // Watch for stalled uploads: if a file is "uploading" but its last progress didn't update
  // for STALLED_MS, mark it as 'stalled' (treated like failed) so UI shows retry/remove options.
  const STALLED_MS = 30_000; // 30 seconds
  useEffect(() => {
    if (!uploading) return;
    const id = setInterval(() => {
      const now = Date.now();
      for (const f of files) {
        if (statusMap[f.name] === 'uploading') {
          const last = lastProgressMap[f.name] || 0;
          if (now - last > STALLED_MS) {
            setStatusMap((s) => ({ ...s, [f.name]: 'stalled' }));
            addToast(`Upload seems stalled for ${f.name}. You can Retry or Remove.`);
          }
        }
      }
    }, 5000);
    return () => clearInterval(id);
  }, [uploading, files, statusMap, lastProgressMap, addToast]);

  return (
    <div className="prescription-upload">
      <div
        className={`dropzone ${dragOver ? "drag-over" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={pickFile}
      >
        <p className="drop-text">Drag & drop prescriptions here</p>
        <p className="drop-subtext">JPG, PNG, WEBP, PDF up to {MAX_SIZE_MB}MB</p>
        <button type="button" className="btn-browse">Browse Files</button>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(",")}
          className="hidden"
          multiple
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {!user && (
        <p style={{ color: "#dc2626", marginTop: 12 }}>
          Please <Link to="/login">login</Link> to upload prescriptions.
        </p>
      )}

      {files.length > 0 && (
        <div className="files-container">
          {files.map(f => (
            <div key={f.name} className="file-preview">
              <div className="file-info">
                {f.type.startsWith("image/") ? (
                  <img src={URL.createObjectURL(f)} alt="preview" className="preview-img" />
                ) : (
                  <div className="pdf-preview">PDF</div>
                )}
                <div>
                  <p className="file-name">{f.name}</p>
                  <p className="file-size">{(f.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
              </div>
              <div className="file-actions">
                <button onClick={() => removeFile(f)} className="btn-remove">Remove</button>
                {statusMap[f.name] && (
                  <div style={{ fontSize: 12, marginTop: 6 }}>
                    Status: <strong>{statusMap[f.name]}</strong>
                  </div>
                )}
                {(statusMap[f.name] === "failed" || statusMap[f.name] === "stalled") && (
                  <button
                    onClick={async () => {
                      if (!user) {
                        setError("Please login to upload prescriptions.");
                        return;
                      }
                      // retry single file
                      setStatusMap((s) => ({ ...s, [f.name]: "uploading" }));
                      setProgressMap((prev) => ({ ...prev, [f.name]: 0 }));
                      setLastProgressMap((lp) => ({ ...lp, [f.name]: Date.now() }));
                      try {
                        const url = await uploadPrescription(f, user.uid, (p) =>
                          setProgressMap((prev) => ({ ...prev, [f.name]: p }))
                        );
                        const rec = await createPrescriptionRecord(user.uid, {
                          url,
                          name: f.name,
                          size: f.size,
                          type: f.type,
                          status: "uploaded",
                        });
                        setDownloadURLs((prev) => [...prev, { url, id: rec.id }]);
                        setStatusMap((s) => ({ ...s, [f.name]: "done" }));
                        addToast(`Uploaded ${f.name} successfully`);
                      } catch (e) {
                        setStatusMap((s) => ({ ...s, [f.name]: "failed" }));
                        addToast(e.message || `Failed to upload ${f.name}`);
                      }
                    }}
                    className="btn-browse"
                    style={{ marginTop: 6 }}
                  >
                    Retry
                  </button>
                )}
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${progressMap[f.name] || 0}%` }} />
                </div>
                <div style={{ fontSize: 12, marginTop: 6 }}>{progressMap[f.name] || 0}%</div>
              </div>
            </div>
          ))}
          <button onClick={onUpload} className="btn-upload-all" disabled={uploading || !user}>
            {uploading ? "Uploading..." : user ? "Upload All" : "Login to Upload"}
          </button>
        </div>
      )}

      {downloadURLs.length > 0 && (
        <div className="uploaded-files">
          <p className="uploaded-label">Uploaded Files:</p>
          {downloadURLs.map((u, idx) => {
            const href = typeof u === "string" ? u : u.url || "#";
            return (
              <a key={idx} href={href} target="_blank" rel="noreferrer" className="uploaded-link">
                {href}
              </a>
            );
          })}
        </div>
      )}

      {error && <p className="error-text">{error}</p>}
    </div>
  );
}
