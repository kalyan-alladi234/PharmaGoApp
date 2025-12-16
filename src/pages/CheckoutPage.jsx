import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useOrders } from "../context/OrderContext";
import { useAuth } from "../context/AuthContext";
import { getUserPrescriptions } from "../services/prescriptionService";
import "./CheckoutPage.css";

export default function CheckoutPage() {
  const { cart, clearCart } = useCart();
  const { createOrder } = useOrders();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [prescriptionsMap, setPrescriptionsMap] = useState({});
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: user?.displayName || "",
    phone: user?.phoneNumber || "",
    address: "",
    email: user?.email || "",
  });
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState({});
  const [card, setCard] = useState({ number: "", name: "", expiry: "", cvv: "" });

  const subtotal = cart.reduce((sum, item) => sum + (Number(String(item.price).replace(/[^0-9.]/g, "")) || 0) * (item.qty || 1), 0);
  const shipping = cart.length > 0 ? 49 : 0;
  const tax = +(subtotal * 0.05).toFixed(2);
  const total = +(subtotal + shipping + tax).toFixed(2);

  useEffect(() => {
    if (!user) return setPrescriptionsMap({});
    let mounted = true;
    getUserPrescriptions(user.uid).then((items) => {
      if (!mounted) return;
      const map = {};
      items.forEach((p) => (map[p.id] = p));
      setPrescriptionsMap(map);
    });
    return () => (mounted = false);
  }, [user]);

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleConfirmPayment = async () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = "Please enter your full name";
    if (!formData.phone || !/^\d{7,15}$/.test(formData.phone)) newErrors.phone = "Enter a valid phone number";
    if (!formData.address) newErrors.address = "Enter your shipping address";
    if (paymentMethod === 'card') {
      if (!card.number || card.number.replace(/\s/g, '').length < 12) newErrors.card = "Enter a valid card number";
      if (!card.cvv || card.cvv.length < 3) newErrors.card = newErrors.card ? newErrors.card : "Enter CVV";
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setProcessing(true);
    try {
      const orderId = await createOrder({ address: formData.address, payment: paymentMethod });
      // small UX delay
      setTimeout(() => {
        setProcessing(false);
        clearCart();
        alert(`✅ Payment Successful via ${paymentMethod.toUpperCase()}! Order: ${orderId}`);
        navigate('/orders');
      }, 700);
    } catch (e) {
      setProcessing(false);
      console.error('createOrder failed', e);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Checkout</h1>
        <p>Your cart is empty. Please add items before checkout.</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Checkout</h1>

      <div className="checkout-grid">
        <div className="checkout-left">
          {cart.map((item) => (
            <div key={item.id} className="checkout-item">
              <div>
                <h3 className="ci-name">{item.name} {item.qty > 1 && <span className="ci-qty">x{item.qty}</span>}</h3>
                <p className="ci-meta">₹{item.price} each</p>
                {item.prescriptionId && prescriptionsMap[item.prescriptionId] && (
                  <p className="ci-meta">Attached: {prescriptionsMap[item.prescriptionId].name} ({prescriptionsMap[item.prescriptionId].status})</p>
                )}
              </div>
              <div className="ci-price">₹{(item.price * item.qty).toFixed(2)}</div>
            </div>
          ))}

          <div className="summary-row"><span>Subtotal</span><strong>₹{subtotal.toFixed(2)}</strong></div>
          <div className="summary-row"><span>Shipping</span><strong>₹{shipping.toFixed(2)}</strong></div>
          <div className="summary-row"><span>Tax (5%)</span><strong>₹{tax.toFixed(2)}</strong></div>
          <div className="summary-row total-row"><span>Total</span><strong>₹{total.toFixed(2)}</strong></div>
          <button onClick={() => setStep(2)} className="btn-primary mt-4">Proceed to Checkout</button>
        </div>

        <div className="checkout-right">
          <h3 className="right-title">Secure Checkout</h3>
          <p className="right-sub">Fast, secure payments. You can use Card, UPI or Cash on Delivery.</p>
          <img src="/assets/secure-payment.png" alt="secure" style={{width: '100%', marginTop: 12}} />
        </div>
      </div>

      {step === 2 && (
        <div className="checkout-form">
          <div className="form-left">
            <h2 className="form-title">Shipping & Contact</h2>
            <label>Full name</label>
            <input type="text" name="name" value={formData.name} onChange={handleInputChange} />
            {errors.name && <div className="field-error">{errors.name}</div>}

            <label>Phone number</label>
            <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} />
            {errors.phone && <div className="field-error">{errors.phone}</div>}

            <label>Address</label>
            <textarea name="address" value={formData.address} onChange={handleInputChange} />
            {errors.address && <div className="field-error">{errors.address}</div>}

            <label>Email (optional)</label>
            <input type="email" name="email" value={formData.email} onChange={handleInputChange} />
          </div>

          <div className="form-right">
            <h3 className="form-title">Payment</h3>

            <div className="payment-methods">
              <label className={`pm ${paymentMethod==='card'?'active':''}`}>
                <input type="radio" name="pm" checked={paymentMethod==='card'} onChange={() => setPaymentMethod('card')} />
                <div>
                  <strong>Card</strong>
                  <div className="pm-desc">Visa / MasterCard / Amex</div>
                </div>
              </label>

              <label className={`pm ${paymentMethod==='upi'?'active':''}`}>
                <input type="radio" name="pm" checked={paymentMethod==='upi'} onChange={() => setPaymentMethod('upi')} />
                <div>
                  <strong>UPI</strong>
                  <div className="pm-desc">Quick UPI transfer</div>
                </div>
              </label>

              <label className={`pm ${paymentMethod==='cod'?'active':''}`}>
                <input type="radio" name="pm" checked={paymentMethod==='cod'} onChange={() => setPaymentMethod('cod')} />
                <div>
                  <strong>Cash on Delivery</strong>
                  <div className="pm-desc">Pay when you receive</div>
                </div>
              </label>
            </div>

                  {paymentMethod === 'card' && (
                    <div className="card-form">
                      <label>Card number</label>
                      <input value={card.number} onChange={(e)=>setCard({...card, number:e.target.value})} placeholder="4242 4242 4242 4242" />
                      <label>Card holder</label>
                      <input value={card.name} onChange={(e)=>setCard({...card, name:e.target.value})} />
                      <div className="row">
                        <div style={{flex:1}}>
                          <label>Expiry</label>
                          <input value={card.expiry} onChange={(e)=>setCard({...card, expiry:e.target.value})} placeholder="MM/YY" />
                        </div>
                        <div style={{width:120}}>
                          <label>CVV</label>
                          <input value={card.cvv} onChange={(e)=>setCard({...card, cvv:e.target.value})} placeholder="123" />
                        </div>
                      </div>
                      {errors.card && <div className="field-error">{errors.card}</div>}
                    </div>
                  )}

                  <div className="order-summary-box">
                    <div className="summary-row"><span>Subtotal</span><strong>₹{subtotal.toFixed(2)}</strong></div>
                    <div className="summary-row"><span>Shipping</span><strong>₹{shipping.toFixed(2)}</strong></div>
                    <div className="summary-row"><span>Tax</span><strong>₹{tax.toFixed(2)}</strong></div>
                    <div className="summary-row total-row"><span>Payable</span><strong>₹{total.toFixed(2)}</strong></div>
                    <button className="btn-primary mt-3" onClick={handleConfirmPayment} disabled={processing}>{processing ? 'Processing...' : `Pay ₹${total.toFixed(2)}`}</button>
                  </div>
            </div>
        </div>
      )}
    </div>
  );
}

// module exports already use `export default function CheckoutPage` at the top
