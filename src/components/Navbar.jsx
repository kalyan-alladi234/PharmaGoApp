import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../services/firebase";
import { useCart } from "../context/CartContext";
import "./Navbar.css";

function Navbar({ user, setUser, onLogout }) {
  const navigate = useNavigate();
  const { cart } = useCart();

  const totalItems = cart.reduce((sum, item) => sum + (item.qty || 1), 0);

  // Optional: If you want to sign out from Firebase as well
  const handleFirebaseLogout = async () => {
    try {
      await signOut(auth);
      onLogout(); // Calls the logout function from App.jsx
      navigate("/");
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
          <li><Link to="/">Home</Link></li>
          <li><Link to="/catalog">Catalog</Link></li>
          <li><Link to="/prescriptions">Prescriptions</Link></li>
          <li><Link to={user ? "/profile" : "/login"}>Profile</Link></li>
          {user && <li><Link to="/orders">Orders</Link></li>}
          {user && user.isAdmin && (
            <li><Link to="/admin/prescriptions">Admin</Link></li>
          )}
          {user && (
            <li><Link to="/notifications">Notifications</Link></li>
          )}

          {/* Cart with badge */}
          <li className="cart-link">
            <Link to="/cart" className="cart-wrapper">
              Cart
              {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
            </Link>
          </li>

          {/* Conditional Login/Logout */}
          {user ? (
            <>
              <li className="welcome-text">Hi, {user.displayName || user.email}</li>
              <li>
                <button onClick={handleFirebaseLogout} className="logout-btn">
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
