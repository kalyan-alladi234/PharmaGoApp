import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { subscribeAllPrescriptions, updatePrescription, deletePrescription } from "../services/prescriptionService";
import { createNotification } from "../services/notificationService";
import "../components/PrescriptionUpload.css";

export default function AdminPrescriptions() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !user.isAdmin) {
      setLoading(false);
      return;
    }
    const unsub = subscribeAllPrescriptions((items) => {
      setPrescriptions(items);
      setLoading(false);
    });
    return () => unsub && unsub();
  }, [user]);

  if (!user || !user.isAdmin) return <p>Access denied. Admins only.</p>;

  if (loading) return <p>Loading prescriptions…</p>;

  const setStatus = async (id, status, note = "") => {
    try {
      const adminAudit = {
        adminId: user.uid,
        adminName: user.displayName || user.email || user.uid,
        action: status,
        at: new Date().toISOString(),
      };
      await updatePrescription(id, { status, adminNote: note, adminAudit });
      addToast(`Prescription ${id} ${status}`);

      // Notify the user who uploaded the prescription
      const pres = prescriptions.find((p) => p.id === id);
      if (pres && pres.uid) {
        await createNotification(pres.uid, {
          title: `Prescription ${status}`,
          body: `Your prescription "${pres.name || "Prescription"}" was ${status}. ${note ? "Note: " + note : ""}`,
          meta: { prescriptionId: id },
        });
      }
    } catch (e) {
      console.error(e);
      addToast("Failed to update prescription");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete prescription permanently?")) return;
    try {
      await deletePrescription(id);
      addToast("Deleted");
    } catch (e) {
      console.error(e);
      addToast("Failed to delete");
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Admin — Prescriptions</h1>

      {prescriptions.length === 0 ? (
        <p>No prescriptions yet.</p>
      ) : (
        <div className="space-y-4">
          {prescriptions.map((p) => (
            <div key={p.id} className="flex justify-between items-start border p-3 rounded">
              <div style={{ maxWidth: 800 }}>
                <div className="flex gap-3 items-center">
                  {p.type && p.type.startsWith("image/") ? (
                    <img src={p.url} alt={p.name} className="preview-img" style={{ width: 80, height: 80 }} />
                  ) : (
                    <div className="pdf-preview" style={{ width: 80, height: 80 }}>PDF</div>
                  )}

                  <div>
                    <div className="font-semibold">{p.name || "Prescription"} <span className="text-sm text-gray-600">by {p.uid}</span></div>
                    <div className="text-sm text-gray-600">Status: <strong>{p.status}</strong></div>
                    {p.createdAt && p.createdAt.toDate && (
                      <div className="text-sm text-gray-500">Uploaded: {p.createdAt.toDate().toLocaleString()}</div>
                    )}
                  </div>
                </div>

                {p.ocrText && (
                  <details className="mt-2"><summary>OCR Text</summary><pre className="profile-json">{p.ocrText}</pre></details>
                )}

                {p.adminNote && <div className="mt-2 text-sm">Admin note: {p.adminNote}</div>}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <button onClick={() => setStatus(p.id, "verified")} className="btn-browse">Verify</button>
                <button onClick={() => {
                  const note = prompt("Reason/note for rejection (optional)") || "";
                  setStatus(p.id, "rejected", note);
                }} className="btn-remove">Reject</button>
                <a href={p.url} target="_blank" rel="noreferrer" className="uploaded-link">Open</a>
                <button onClick={() => handleDelete(p.id)} className="btn-remove">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
