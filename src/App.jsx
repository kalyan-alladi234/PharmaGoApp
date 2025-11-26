import "./App.css";
import { Routes, Route } from "react-router-dom";

import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import CatalogPage from "./pages/CatalogPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrdersPage from "./pages/OrdersPage";
import ProfilePage from "./pages/ProfilePage";
import PrescriptionPage from "./pages/PrescriptionPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import Layout from "./components/Layout";

function App() {
  const [user, setUser] = useState(null);
    

  // Load user from localStorage on page load
  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("user"));
    if (savedUser) setUser(savedUser);
  }, []);

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar user={user} setUser={setUser} />
      <main className="flex-grow container mx-auto px-4 py-6">
        <Routes>
          <Route element={<Layout />}></Route>
          <Route path="/" element={<HomePage user={user} setUser={setUser} />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/prescriptions" element={<PrescriptionPage />} />
          <Route path="/login" element={<LoginPage onLogin={setUser} />} />
        <Route path="/signup" element={<SignupPage setUser={setUser} />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
