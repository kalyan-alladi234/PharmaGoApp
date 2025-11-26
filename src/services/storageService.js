import { storage } from "./firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

/**
 * Upload a prescription file to Firebase Storage.
 * @param {File} file
 * @param {string} uid
 * @param {(pct:number)=>void} onProgress
 * @returns {Promise<string>} downloadURL
 */
export function uploadPrescription(file, uid, onProgress = () => {}) {
  return new Promise((resolve, reject) => {
    const safeName = file.name.replace(/\s+/g, "_");
    const path = `prescriptions/${uid}/${Date.now()}_${safeName}`;
    const storageRef = ref(storage, path);
    const task = uploadBytesResumable(storageRef, file);

    task.on(
      "state_changed",
      (snap) => {
        const pct = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
        onProgress(pct);
      },
      (err) => reject(err),
      async () => {
        const url = await getDownloadURL(task.snapshot.ref);
        resolve(url);
      }
    );
  });
}
