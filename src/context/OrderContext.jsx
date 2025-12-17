import { createContext, useContext, useMemo, useState, useEffect, useCallback } from "react";
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
  const [refetchKey, setRefetchKey] = useState(0);

  const createOrder = useCallback(async ({ address, payment }) => {
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
      items: cart.map((c) => ({ id: c.id, name: c.name, price: c.price, qty: c.qty, prescriptionId: c.prescriptionId || null })),
      total: cart.reduce((s, i) => s + (Number(String(i.price).replace(/[^0-9.]/g, "")) || 0) * (i.qty || 1), 0),
      address,
      payment,
      status: "Processing",
      timeline: [{ status: "Processing", at: new Date().toISOString() }],
    };

    console.debug('createOrder payload', { payload, cartLen: cart.length, userId: user?.uid });
    try {
      const id = await createOrderRecord(user.uid, payload);
      addToast(`Order ${id} placed!`);
      // optimistic insert so Orders page shows immediately even if subscription is slow
      setOrders((prev) => {
        const created = { id, ...payload, createdAt: new Date().toISOString() };
        if (!prev) return [created];
        // avoid duplicates
        if (prev.find((o) => o.id === id)) return prev;
        return [created, ...prev];
      });
      return id;
    } catch (e) {
      console.error('createOrder failed', e);
      addToast('Failed to place order. Please try again.');
      throw e;
    }
  }, [cart, user, addToast]);

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
    // ensure we have a valid uid before subscribing
    if (!user.uid) {
      console.warn('Order subscription: user present but missing uid', user);
      addToast('Login incomplete — please logout and login again to load orders.');
      setOrders([]);
      return;
    }

    // mark loading while waiting for snapshot
    setOrders(null);
    let timedOut = false;
    const timeout = setTimeout(() => {
      timedOut = true;
      console.warn('orders subscribe timed out');
      addToast('Unable to load orders. Please check your connection or try again.');
      setOrders([]);
    }, 7000);

    const unsub = subscribeUserOrders(user.uid, (items) => {
      if (timedOut) {
        // ignore late snapshot after timeout
        console.debug('late orders snapshot ignored');
        return;
      }
      clearTimeout(timeout);
      console.debug('orders snapshot', items);
      setOrders(items || []);
    }, (err) => {
      clearTimeout(timeout);
      console.error('orders subscribe failed', err);
      addToast('Unable to load orders (permission or network issue).');
      setOrders([]);
    });

    return () => {
      clearTimeout(timeout);
      unsub && unsub();
    };
  }, [user, refetchKey]);

  const refreshOrders = () => setRefetchKey((k) => k + 1);

  const value = useMemo(() => ({ orders, createOrder, updateOrder, cancelOrder, ORDER_STEPS, refreshOrders }), [orders, createOrder, updateOrder, cancelOrder, refreshOrders]);

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
}

export function useOrders() {
  return useContext(OrderContext);
}
