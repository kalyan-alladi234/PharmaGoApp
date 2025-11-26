import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./styles/globals.css";

import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { OrderProvider } from "./context/OrderContext";
import { ToastProvider } from "./context/ToastContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <OrderProvider>
              <App />
            </OrderProvider>
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  </React.StrictMode>
);
