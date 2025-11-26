import { createContext, useContext, useMemo, useState } from "react";
import { useCart } from "./CartContext";
import { useToast } from "./ToastContext";

const OrderContext = createContext();

const ORDER_STEPS = ["Processing", "Shipped", "Out for Delivery", "Delivered"];

function generateId() {
  return "ORD-" + Math.random().toString(36).slice(2, 8).toUpperCase();
}

export function OrderProvider({ children }) {
  const [orders, setOrders] = useState([]);
  const { cart } = useCart();
  const { addToast } = useToast();

  const createOrder = ({ address, payment }) => {
    if (!cart.length) {
      addToast("Cart is empty.");
      return null;
    }
    const id = generateId();
    const newOrder = {
      id,
      items: cart.map((c) => ({ id: c.id, name: c.name, price: c.price, qty: c.qty })),
      total: cart.reduce((s, i) => s + i.price * i.qty, 0),
      address,
      payment,
      status: "Processing",
      createdAt: new Date().toISOString(),
      timeline: [{ status: "Processing", at: new Date().toISOString() }],
    };
    setOrders((prev) => [newOrder, ...prev]);
    addToast(`Order ${id} placed!`);

    // Simulate live status updates
    ORDER_STEPS.slice(1).forEach((status, idx) => {
      setTimeout(() => {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === id
              ? {
                  ...o,
                  status,
                  timeline: [...o.timeline, { status, at: new Date().toISOString() }],
                }
              : o
          )
        );
        addToast(`Order ${id} ${status}.`);
      }, (idx + 1) * 3000); // 3s apart
    });

    return id;
  };

  const value = useMemo(() => ({ orders, createOrder, ORDER_STEPS }), [orders]);

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
}

export function useOrders() {
  return useContext(OrderContext);
}
