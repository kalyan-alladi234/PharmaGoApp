import React from "react";
import "./Cart.css";

export default function Cart({ cartItems, onRemove, onCheckout }) {
  return (
    <div className="cart-container">
      <div className="cart-card">
        <h2 className="cart-title">🛒 Your Cart</h2>

        {cartItems.length === 0 ? (
          <p className="empty-cart">Your cart is empty!</p>
        ) : (
          <div className="cart-list">
            {cartItems.map((item, index) => (
              <div className="cart-item" key={index}>
                <img src={item.image} alt={item.name} />
                <div className="cart-details">
                  <h3>{item.name}</h3>
                  <p>₹{item.price}</p>
                </div>
                <button
                  className="remove-btn"
                  onClick={() => onRemove(item)}
                >
                  ❌
                </button>
              </div>
            ))}
          </div>
        )}

        {cartItems.length > 0 && (
          <div className="cart-footer">
            <h3>
              Total: ₹
              {cartItems.reduce((acc, item) => acc + item.price, 0)}
            </h3>
            <button className="checkout-btn" onClick={onCheckout}>
              Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
