import { useState } from "react";
import { useCart } from "../context/CartContext";

function CheckoutPage() {
  const { cart } = useCart();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("");

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleConfirmPayment = () => {
    if (!paymentMethod) {
      alert("⚠️ Please select a payment method");
      return;
    }
    alert(`✅ Payment Successful via ${paymentMethod}!`);
    // You can clear cart here if needed
    // clearCart();
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Checkout</h1>

      {/* STEP 1: Cart Summary */}
      {step === 1 && (
        <>
          {cart.length === 0 ? (
            <p>Your cart is empty. Please add items before checkout.</p>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center border p-3 rounded"
                >
                  <div>
                    <h3 className="font-bold">
                      {item.name} {item.qty > 1 && <span>(x{item.qty})</span>}
                    </h3>
                    <p>₹{item.price} each</p>
                  </div>
                  <p className="font-semibold">₹{item.price * item.qty}</p>
                </div>
              ))}
              <h2 className="text-xl font-semibold">Total: ₹{total}</h2>
              <button
                onClick={() => setStep(2)}
                className="mt-4 w-full bg-green-600 text-white py-2 rounded"
              >
                Place Order
              </button>
            </div>
          )}
        </>
      )}

      {/* STEP 2: Customer Details Form */}
      {step === 2 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Enter Your Details</h2>
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full border p-2 rounded"
          />
          <input
            type="text"
            name="phone"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleInputChange}
            className="w-full border p-2 rounded"
          />
          <textarea
            name="address"
            placeholder="Address"
            value={formData.address}
            onChange={handleInputChange}
            className="w-full border p-2 rounded"
          ></textarea>

          <button
            onClick={() => setStep(3)}
            className="w-full bg-blue-600 text-white py-2 rounded"
          >
            Pay ₹{total}
          </button>
        </div>
      )}

      {/* STEP 3: Payment Options */}
      {step === 3 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Select Payment Method</h2>

          <label className="flex items-center space-x-2 border p-3 rounded cursor-pointer">
            <input
              type="radio"
              name="payment"
              value="UPI"
              checked={paymentMethod === "UPI"}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
            <span>UPI (shop@upi)</span>
          </label>

          <label className="flex items-center space-x-2 border p-3 rounded cursor-pointer">
            <input
              type="radio"
              name="payment"
              value="Paytm"
              checked={paymentMethod === "Paytm"}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
            <span>Paytm (9876543210)</span>
          </label>

          <label className="flex items-center space-x-2 border p-3 rounded cursor-pointer">
            <input
              type="radio"
              name="payment"
              value="PhonePe"
              checked={paymentMethod === "PhonePe"}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
            <span>PhonePe (9876543210)</span>
          </label>

          <button
            onClick={handleConfirmPayment}
            className="w-full bg-purple-600 text-white py-2 rounded"
          >
            Confirm Payment
          </button>
        </div>
      )}
    </div>
  );
}

export default CheckoutPage;
