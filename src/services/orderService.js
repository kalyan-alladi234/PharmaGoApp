import { db } from './firebase';
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';

const ORDERS_COL = 'orders';

export async function createOrderRecord(uid, order) {
  const ref = await addDoc(collection(db, ORDERS_COL), {
    userId: uid,
    ...order,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export function subscribeUserOrders(uid, cb, errCb) {
  const q = query(collection(db, ORDERS_COL), where('userId', '==', uid), orderBy('createdAt', 'desc'));
  const unsub = onSnapshot(q, (snap) => {
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    cb(items);
  }, (err) => {
    console.error('orders subscribe error', err);
    if (typeof errCb === 'function') errCb(err);
  });
  return unsub;
}

export async function updateOrderRecord(id, data) {
  const d = doc(db, ORDERS_COL, id);
  await updateDoc(d, { ...data, updatedAt: serverTimestamp() });
}

export async function cancelOrderRecord(id) {
  await updateOrderRecord(id, { status: 'Cancelled' });
}
