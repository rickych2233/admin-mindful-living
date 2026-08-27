import React, { useState } from "react";
import "./UserProfileModal.css";

export function UserProfileModal({ isOpen, onClose, userProfile }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  if (!isOpen) return null;

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage("New passwords do not match.");
      return;
    }
    // Simulate password change logic here
    setMessage("Password changed successfully!");
    setTimeout(() => {
      setMessage("");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }, 3000);
  };

  return (
    <div className="modal-overlay">
      <div className="user-profile-modal">
        <div className="modal-header">
          <h2>User Profile</h2>
          <button type="button" className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="modal-body">
          <div className="profile-details">
            <div className="profile-avatar-large">
              {userProfile?.avatar ? (
                <img src={userProfile.avatar} alt="Profile" />
              ) : (
                <img src="https://i.pravatar.cc/150?img=11" alt="Profile" />
              )}
            </div>
            <div className="profile-info">
              <h3>{userProfile?.name || "Adrian Halim"}</h3>
              <p>{userProfile?.email || "adrianhalim@email.com"}</p>
            </div>
          </div>

          <hr className="divider" />

          <div className="change-password-section">
            <h3>Change Password</h3>
            <form onSubmit={handleChangePassword}>
              <div className="form-group">
                <label>Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              {message && (
                <p className={`message ${message.includes("success") ? "success" : "error"}`}>
                  {message}
                </p>
              )}
              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
