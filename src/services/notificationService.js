import { db } from "./firebase";
import { collection, addDoc, query, where, orderBy, onSnapshot, getDocs, serverTimestamp, updateDoc, doc, deleteDoc } from "firebase/firestore";

const NOTIFICATIONS_COLLECTION = "notifications";

export async function createNotification(uid, payload) {
  const docRef = await addDoc(collection(db, NOTIFICATIONS_COLLECTION), {
    uid,
    title: payload.title || "Notification",
    body: payload.body || "",
    read: false,
    createdAt: serverTimestamp(),
    meta: payload.meta || {},
  });
  return { id: docRef.id };
}

export function subscribeUserNotifications(uid, onUpdate) {
  const q = query(collection(db, NOTIFICATIONS_COLLECTION), where("uid", "==", uid), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    onUpdate(items);
  });
}

export async function getUserNotifications(uid) {
  const q = query(collection(db, NOTIFICATIONS_COLLECTION), where("uid", "==", uid), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function markNotificationRead(id) {
  const ref = doc(db, NOTIFICATIONS_COLLECTION, id);
  await updateDoc(ref, { read: true, readAt: serverTimestamp() });
}

export async function deleteNotification(id) {
  const ref = doc(db, NOTIFICATIONS_COLLECTION, id);
  await deleteDoc(ref);
}
