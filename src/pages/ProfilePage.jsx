import React from "react";
import { Link } from "react-router-dom";
import "./ProfilePage.css";

function ProfilePage() {
  const raw = localStorage.getItem("user");
  const user = raw ? JSON.parse(raw) : null;

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
        {Object.entries(user).map(([key, val]) => (
          <div className="profile-row" key={key}>
            <div className="profile-key">{key}</div>
            <div className="profile-val">{renderValue(val)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProfilePage;
