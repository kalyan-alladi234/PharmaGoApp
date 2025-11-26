import { useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { uploadPrescription } from "../services/storageService";
import { useToast } from "../context/ToastContext";
import "./PrescriptionUpload.css";

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
  const [downloadURLs, setDownloadURLs] = useState([]);
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
    if (!user) return setError("Please login to upload prescriptions.");
    if (files.length === 0) return setError("Pick files first.");
    const uploadedURLs = [];

    for (let f of files) {
      setProgressMap(prev => ({ ...prev, [f.name]: 0 }));
      try {
        const url = await uploadPrescription(f, user.uid, (p) =>
          setProgressMap(prev => ({ ...prev, [f.name]: p }))
        );
        uploadedURLs.push(url);
        addToast(`Uploaded ${f.name} successfully`);
      } catch (e) {
        setError(e.message || `Failed to upload ${f.name}`);
      }
    }
    setDownloadURLs([...downloadURLs, ...uploadedURLs]);
    onUploaded?.(uploadedURLs);
    setFiles([]);
  };

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
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${progressMap[f.name] || 0}%` }} />
                </div>
              </div>
            </div>
          ))}
          <button onClick={onUpload} className="btn-upload-all">Upload All</button>
        </div>
      )}

      {downloadURLs.length > 0 && (
        <div className="uploaded-files">
          <p className="uploaded-label">Uploaded Files:</p>
          {downloadURLs.map((url, idx) => (
            <a key={idx} href={url} target="_blank" rel="noreferrer" className="uploaded-link">
              {url}
            </a>
          ))}
        </div>
      )}

      {error && <p className="error-text">{error}</p>}
    </div>
  );
}
