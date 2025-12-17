import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./ProfilePage.css";

function ProfilePage() {
  const raw = localStorage.getItem("user");
  const user = raw ? JSON.parse(raw) : null;
  const [showRaw, setShowRaw] = useState(false);

  // Keys that come from Firebase auth internals — hide from profile view
  const HIDE_KEYS = new Set([
    "stsTokenManager",
    "createdAt",
    "lastLoginAt",
    "apiKey",
    "appName",
    "isAnonymous",
  ]);

  const renderValue = (value) => {
    if (value === null || value === undefined) return <em>null</em>;
    if (typeof value === "object")
      return (
        <pre className="profile-json">{JSON.stringify(value, null, 2)}</pre>
      );
    return <span>{String(value)}</span>;
  };

  if (!user) {
    return (
      <div className="profile-page">
        <h1>User Profile</h1>
        <p>
          No user is currently logged in. <Link to="/login">Login</Link>
        </p>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <h1>User Profile</h1>

      <div className="profile-card">
        {Object.entries(user)
          .filter(([k]) => !HIDE_KEYS.has(k))
          .map(([key, val]) => (
            <div className="profile-row" key={key}>
              <div className="profile-key">{key}</div>
              <div className="profile-val">{renderValue(val)}</div>
            </div>
          ))}

        {/* optional raw dump for debugging */}
        <div style={{ marginTop: 12 }}>
          <button className="btn-ghost" onClick={() => setShowRaw((s) => !s)}>{showRaw ? 'Hide raw data' : 'Show raw data'}</button>
          {showRaw && <pre className="profile-json" style={{ marginTop: 8 }}>{JSON.stringify(user, null, 2)}</pre>}
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
