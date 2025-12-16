import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  subscribeUserPrescriptions,
  updatePrescription,
  deletePrescription,
  getUserPrescriptions,
} from "../services/prescriptionService";
import "./PrescriptionUpload.css";

export default function PrescriptionList() {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return setLoading(false);
    const unsub = subscribeUserPrescriptions(user.uid, (items) => {
      setPrescriptions(items);
      setLoading(false);
    });
    return () => unsub && unsub();
  }, [user]);

  if (!user) return <p>Please login to view your prescriptions.</p>;
  if (loading) return <p>Loading your prescriptions…</p>;
  if (prescriptions.length === 0) return <p>No prescriptions uploaded yet.</p>;

  const handleRequestVerification = async (id) => {
    try {
      await updatePrescription(id, { status: "pending" });
    } catch (e) {
      console.error(e);
      alert("Failed to request verification");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this prescription?")) return;
    try {
      await deletePrescription(id);
    } catch (e) {
      console.error(e);
      alert("Failed to delete prescription");
    }
  };

  return (
    <div className="prescription-list">
      <h3>Your Prescriptions</h3>
      <div className="files-container">
        {prescriptions.map((p) => (
          <div className="file-preview" key={p.id}>
            <div className="file-info">
              {p.type && p.type.startsWith("image/") ? (
                <img src={p.url} alt={p.name} className="preview-img" />
              ) : (
                <div className="pdf-preview">PDF</div>
              )}

              <div>
                <p className="file-name">{p.name || "Prescription"}</p>
                <p className="file-size">{p.size ? `${(p.size/1024/1024).toFixed(2)} MB` : ""}</p>
                <p className="file-meta">Status: <strong>{p.status || "uploaded"}</strong></p>
                {p.createdAt && p.createdAt.toDate && (
                  <p className="file-meta">Uploaded: {p.createdAt.toDate().toLocaleString()}</p>
                )}
                {p.ocrText && (
                  <details>
                    <summary>Extracted text</summary>
                    <pre className="profile-json">{p.ocrText}</pre>
                  </details>
                )}
              </div>
            </div>

            <div className="file-actions">
              <a href={p.url} target="_blank" rel="noreferrer" className="uploaded-link">View</a>
              <button onClick={() => handleRequestVerification(p.id)} className="btn-browse">Request verification</button>
              <button onClick={() => handleDelete(p.id)} className="btn-remove">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
