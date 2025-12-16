import { createContext, useContext, useMemo, useState, useEffect } from "react";
import { useCart } from "./CartContext";
import { useToast } from "./ToastContext";
import { useAuth } from "./AuthContext";
import { createOrderRecord, subscribeUserOrders, updateOrderRecord, cancelOrderRecord } from "../services/orderService";

const OrderContext = createContext();

const ORDER_STEPS = ["Processing", "Shipped", "Out for Delivery", "Delivered"];

function generateId() {
  return "ORD-" + Math.random().toString(36).slice(2, 8).toUpperCase();
}

export function OrderProvider({ children }) {
  const [orders, setOrders] = useState([]);
  const { cart } = useCart();
  const { addToast } = useToast();
  const { user } = useAuth();

  const createOrder = ({ address, payment }) => {
    if (!cart.length) {
      addToast("Cart is empty.");
      return null;
    }
    if (!user) {
      addToast("Please login to place an order.");
      return null;
    }

    // Build order payload
    const payload = {
      // include attached prescription id (if any) with each item
      items: cart.map((c) => ({ id: c.id, name: c.name, price: c.price, qty: c.qty, prescriptionId: c.prescriptionId || null })),
      total: cart.reduce((s, i) => s + (Number(String(i.price).replace(/[^0-9.]/g, "")) || 0) * (i.qty || 1), 0),
      address,
      payment,
      status: "Processing",
      timeline: [{ status: "Processing", at: new Date().toISOString() }],
    };

    return createOrderRecord(user.uid, payload).then((id) => {
      addToast(`Order ${id} placed!`);
      return id;
    });
  };

  const updateOrder = async (id, data) => {
    await updateOrderRecord(id, data);
    addToast(`Order ${id} updated.`);
  };

  const cancelOrder = async (id) => {
    await cancelOrderRecord(id);
    addToast(`Order ${id} cancelled.`);
  };

  // Subscribe to user's orders from Firestore
  useEffect(() => {
    if (!user) {
      setOrders([]);
      return;
    }
    // mark loading while waiting for snapshot
    setOrders(null);
    const unsub = subscribeUserOrders(user.uid, (items) => {
      console.debug('orders snapshot', items);
      setOrders(items || []);
    }, (err) => {
      console.error('orders subscribe failed', err);
      // treat as empty to avoid leaving UI in perpetual loading state
      setOrders([]);
    });
    return () => unsub && unsub();
  }, [user]);

  const value = useMemo(() => ({ orders, createOrder, updateOrder, cancelOrder, ORDER_STEPS }), [orders]);

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
}

export function useOrders() {
  return useContext(OrderContext);
}
