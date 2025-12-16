import React from "react";
import "./NewFooter.css";

const NewFooter = () => {
  return (
    <footer className="new-footer">
      <div className="footer-container">
        <div className="footer-brand">
          <h2>PharmaGo</h2>
          <p>Your trusted online pharmacy</p>
        </div>

        <div className="footer-links">
          <a href="/">Home</a>
          <a href="/catalog">Catalog</a>
          <a href="/cart">Cart</a>
          <a href="/profile">Profile</a>
        </div>

        <div className="footer-copy">
          © {new Date().getFullYear()} PharmaGo. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default NewFooter;
