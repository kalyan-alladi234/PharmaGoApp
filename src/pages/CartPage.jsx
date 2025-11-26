import { useCart } from "../context/CartContext";

function CartPage() {
  const { cart, removeFromCart, updateQty } = useCart();

  const getNumericPrice = (price) => {
    if (!price) return 0;
    const num = Number(String(price).replace(/[^0-9.]/g, ""));
    return isNaN(num) ? 0 : num;
  };

  // ✅ Debugging line
  console.log("Cart items:", cart);

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
