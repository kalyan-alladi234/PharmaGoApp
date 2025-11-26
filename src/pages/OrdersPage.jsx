import OrderTracker from "../components/OrderTracker";
import { useOrders } from "../context/OrderContext";

function OrdersPage() {
  const { orders, ORDER_STEPS } = useOrders();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Your Orders</h1>
      {orders.length === 0 ? (
        <p>No orders yet.</p>
      ) : (
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
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default OrdersPage;
