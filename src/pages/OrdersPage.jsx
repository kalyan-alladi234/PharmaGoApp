import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import OrderTracker from '../components/OrderTracker';
import { useOrders } from '../context/OrderContext';
import { doc, getDoc, getDocs, collection, query, where, orderBy } from 'firebase/firestore';
import { db } from '../services/firebase';
import './OrdersPage.css';

export default function OrdersPage() {
  const { orders, ORDER_STEPS, updateOrder, cancelOrder, refreshOrders } = useOrders();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [presMap, setPresMap] = useState({});
  const [editing, setEditing] = useState(null);
  const [addressDraft, setAddressDraft] = useState('');
  const [fetchResult, setFetchResult] = useState(null);
  const [fetchError, setFetchError] = useState(null);

  // load attached prescription metadata when orders change
  useEffect(() => {
    let mounted = true;
    if (!orders || orders.length === 0) return;
    const ids = new Set();
    orders.forEach((o) => o.items.forEach((it) => it.prescriptionId && ids.add(it.prescriptionId)));
    if (ids.size === 0) return;
    const fetchAll = async () => {
      const map = {};
      for (let id of ids) {
        try {
          const d = await getDoc(doc(db, 'prescriptions', id));
          if (d.exists()) map[id] = d.data();
        } catch (e) {
          console.error('Failed to load prescription', id, e);
        }
      }
      if (mounted) setPresMap(map);
    };
    fetchAll();
    return () => (mounted = false);
  }, [orders]);

  if (!user) return <p>Please login to view your orders.</p>;
  if (!orders) {
    if (user && !user.uid) {
      return (
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-4">Your Orders</h1>
          <p>Unable to load orders — your login looks incomplete.</p>
          <div className="mt-3">
            <button className="btn-primary" onClick={() => { logout(); navigate('/login'); }}>Logout & Login</button>
            <button className="btn-ghost" onClick={() => refreshOrders()}>Retry</button>
          </div>
        </div>
      );
    }
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Your Orders</h1>
        <p>Loading orders…</p>
        <div className="mt-3">
          <button className="btn-ghost" onClick={() => refreshOrders()}>Retry</button>
        </div>
      </div>
    );
  }
  if (orders.length === 0) return <p>You have no orders yet.</p>;

  // Diagnostic: manual fetch to check Firestore directly
  const fetchOrdersNow = async () => {
    setFetchResult(null);
    setFetchError(null);
    try {
      const q = query(collection(db, 'orders'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setFetchResult(items);
    } catch (e) {
      console.error('fetchOrdersNow failed', e);
      setFetchError(String(e));
    }
  };

  const startEdit = (o) => {
    setEditing(o.id);
    setAddressDraft(o.address || '');
  };
  const saveEdit = async (id) => {
    await updateOrder(id, { address: addressDraft });
    setEditing(null);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Your Orders</h1>
      <div className="mb-3">
        <button className="btn-ghost" onClick={fetchOrdersNow}>Fetch Orders Now (debug)</button>
        {fetchError && <div className="text-red-600 mt-2">Error: {fetchError}</div>}
        {fetchResult && (
          <div className="mt-2 text-sm">
            <div className="font-medium">Fetched {fetchResult.length} orders:</div>
            <pre style={{ whiteSpace: 'pre-wrap', marginTop: 6 }}>{JSON.stringify(fetchResult, null, 2)}</pre>
          </div>
        )}
      </div>
      <div className="space-y-6">
        {orders.map((o) => (
          <div key={o.id} className="border rounded p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="font-semibold">{o.id}</h2>
                <p className="text-sm text-gray-600">Placed on {new Date(o.createdAt).toLocaleString()}</p>
              </div>
              <div className="text-sm font-medium">Total: ₹{o.total}</div>
            </div>

            <OrderTracker steps={ORDER_STEPS} current={o.status} />

            <div className="mt-4">
              <h3 className="font-medium mb-2">Items</h3>
              <ul className="list-disc ml-5">
                {o.items.map((it) => (
                  <li key={it.id}>
                    {it.name} × {it.qty} — ₹{it.price * it.qty}
                    {it.prescriptionId && presMap[it.prescriptionId] && (
                      <div className="text-sm">Attached: {presMap[it.prescriptionId].name} — <a className="text-blue-600" href={presMap[it.prescriptionId].url} target="_blank" rel="noreferrer">View</a></div>
                    )}
                  </li>
                ))}
              </ul>

              <div className="mt-4">
                <strong>Address:</strong>
                {editing && editing === o.id ? (
                  <div>
                    <textarea value={addressDraft} onChange={(e) => setAddressDraft(e.target.value)} />
                    <div className="order-actions">
                      <button onClick={() => saveEdit(o.id)} className="btn-primary">Save</button>
                      <button onClick={() => setEditing(null)} className="btn-ghost">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="muted">{o.address}</div>
                    <div className="order-actions">
                      <button onClick={() => startEdit(o)} className="btn-primary">Update Info</button>
                      {o.status !== 'Cancelled' && o.status !== 'Delivered' && (
                        <button onClick={async () => { if (confirm('Cancel this order?')) await cancelOrder(o.id); }} className="btn-danger">Cancel Order</button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
