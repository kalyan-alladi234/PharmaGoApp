import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../services/firebase";
import { useAuth } from "../context/AuthContext";
import "./LoginPage.css";

export default function LoginPage({ onLogin }) { // receive onLogin prop
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      // Save user to App state and localStorage
      onLogin(userCredential.user);
      localStorage.setItem("user", JSON.stringify(userCredential.user));
      // sync AuthContext so components using useAuth see the user
      try { setUser(userCredential.user); } catch (e) {}

      navigate("/"); // redirect to home/dashboard
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Login</h2>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <form onSubmit={handleLogin}>
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
          <button type="submit">Login</button>
        </form>
        <div className="login-alt">
          <p>Don't have an account?</p>
          <button type="button" className="btn-register" onClick={() => navigate('/signup')}>Register</button>
        </div>
      </div>
    </div>
  );
}
