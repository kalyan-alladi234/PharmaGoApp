import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../services/firebase"; // adjust path if needed
import "./Navbar.css";

function Navbar({ user, setUser }) {
  const navigate = useNavigate();

  // Logout function
  const handleLogout = async () => {
    try {
      // Sign out from Firebase
      await signOut(auth);

      // Clear user state and localStorage
      setUser(null);
      localStorage.removeItem("user");

      navigate("/"); // Redirect to home/dashboard
    } catch (err) {
      console.error("Logout failed:", err.message);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="logo">
          Pharma<span className="highlight">Go</span>
        </Link>

        {/* Navigation Links */}
        <ul className="nav-links">
          <li><Link to="/catalog">Catalog</Link></li>
          <li><Link to="/prescriptions">Prescriptions</Link></li>
          <li><Link to="/cart">Cart</Link></li>

          {/* Conditional Rendering Based on Login */}
          {user ? (
            <>
              <li className="welcome-text">Hi, {user.displayName || user.email}</li>
              <li>
                <button onClick={handleLogout} className="logout-btn">
                  Logout
                </button>
              </li>
            </>
          ) : (
            <li>
              <Link to="/login" className="login-btn">Login</Link>
            </li>
          )}

          <li>
            <Link to="/checkout" className="checkout-btn">Go to Checkout</Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
