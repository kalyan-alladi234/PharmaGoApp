import { useCart } from "../context/CartContext";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getUserPrescriptions } from "../services/prescriptionService";

function CartPage() {
  const { cart, removeFromCart, updateQty, attachPrescription, detachPrescription } = useCart();
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);

  const getNumericPrice = (price) => {
    if (!price) return 0;
    const num = Number(String(price).replace(/[^0-9.]/g, ""));
    return isNaN(num) ? 0 : num;
  };

  // ✅ Debugging line
  console.log("Cart items:", cart);

  useEffect(() => {
    let mounted = true;
    if (!user) return setPrescriptions([]);
    getUserPrescriptions(user.uid).then((items) => {
      if (!mounted) return;
      setPrescriptions(items.map((p) => ({ id: p.id, name: p.name || "Prescription", status: p.status })));
    });
    return () => (mounted = false);
  }, [user]);

  const total = cart.reduce(
    (sum, item) => sum + getNumericPrice(item.price) * (item.qty || 1),
    0
  );

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Your Cart</h1>
      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <div className="space-y-4">
          {cart.map((item) => (
            <div
              key={item.id}
              className="flex justify-between items-center border p-3 rounded"
            >
              <div>
                <h3 className="font-bold">{item.name}</h3>
                <p>₹{getNumericPrice(item.price)}</p>
                <div className="mt-2">
                  <label className="text-sm mr-2">Attached Prescription:</label>
                  <select
                    value={item.prescriptionId || ""}
                    onChange={(e) => {
                      const val = e.target.value || null;
                      if (!val) detachPrescription(item.id);
                      else attachPrescription(item.id, val);
                    }}
                    className="border p-1 rounded"
                    disabled={!user}
                  >
                    <option value="">None</option>
                    {prescriptions.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} {p.status ? `(${p.status})` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={item.qty || 1}
                  min="1"
                  className="w-16 border p-1"
                  onChange={(e) => updateQty(item.id, Number(e.target.value))}
                />
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
          <h2 className="text-xl font-semibold">Total: ₹{total}</h2>
        </div>
      )}
    </div>
  );
}

export default CartPage;
