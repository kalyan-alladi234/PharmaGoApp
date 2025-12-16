import { db } from "./firebase";
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  getDocs,
  serverTimestamp,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";

const PRESCRIPTIONS_COLLECTION = "prescriptions";

export async function createPrescriptionRecord(uid, meta) {
  const payload = {
    uid,
    ...meta,
    status: meta.status || "uploaded",
    createdAt: serverTimestamp(),
  };
  const ref = await addDoc(collection(db, PRESCRIPTIONS_COLLECTION), payload);
  return { id: ref.id, ...payload };
}

export function subscribeUserPrescriptions(uid, onUpdate) {
  const q = query(
    collection(db, PRESCRIPTIONS_COLLECTION),
    where("uid", "==", uid),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    onUpdate(items);
  });
}

export function subscribeAllPrescriptions(onUpdate) {
  const q = query(collection(db, PRESCRIPTIONS_COLLECTION), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    onUpdate(items);
  });
}

export async function getAllPrescriptions() {
  const q = query(collection(db, PRESCRIPTIONS_COLLECTION), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getUserPrescriptions(uid) {
  const q = query(
    collection(db, PRESCRIPTIONS_COLLECTION),
    where("uid", "==", uid),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function updatePrescription(id, updates) {
  const ref = doc(db, PRESCRIPTIONS_COLLECTION, id);
  await updateDoc(ref, { ...updates, updatedAt: serverTimestamp() });
}

export async function deletePrescription(id) {
  const ref = doc(db, PRESCRIPTIONS_COLLECTION, id);
  await deleteDoc(ref);
}
