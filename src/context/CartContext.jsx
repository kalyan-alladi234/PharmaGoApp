import { createContext, useContext, useState } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  // ✅ Add to cart
  const addToCart = (item) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.id === item.id);

      if (existingItem) {
        // If item already exists, increase quantity
        return prevCart.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, qty: cartItem.qty + 1 }
            : cartItem
        );
      } else {
        // Otherwise add as new item with qty = 1
        return [...prevCart, { ...item, qty: 1 }];
      }
    });
  };

  // ✅ Remove item completely
  const removeFromCart = (id) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  // ✅ Update item quantity manually
  const updateQty = (id, qty) => {
    if (qty <= 0) {
      // remove item if qty becomes 0
      setCart((prevCart) => prevCart.filter((item) => item.id !== id));
    } else {
      setCart((prevCart) =>
        prevCart.map((item) =>
          item.id === id ? { ...item, qty } : item
        )
      );
    }
  };

  // ✅ Attach a prescription id to a cart item
  const attachPrescription = (id, prescriptionId) => {
    setCart((prevCart) =>
      prevCart.map((item) => (item.id === id ? { ...item, prescriptionId } : item))
    );
  };

  // ✅ Detach (remove) prescription from an item
  const detachPrescription = (id) => {
    setCart((prevCart) => prevCart.map((item) => (item.id === id ? { ...item, prescriptionId: null } : item)));
  };

  // ✅ Clear entire cart
  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQty, attachPrescription, detachPrescription, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
