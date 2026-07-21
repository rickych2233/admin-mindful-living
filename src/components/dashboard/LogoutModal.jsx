import React from "react";

export function LogoutModal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="logout-modal">
        <div className="logout-icon-circle">
           <svg viewBox="0 0 24 24" width="60" height="60" fill="none" stroke="#e10e17" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
             <circle cx="12" cy="12" r="10" />
             <line x1="12" y1="7" x2="12" y2="13" />
             <circle cx="12" cy="17" r="1" fill="#e10e17" stroke="none" />
           </svg>
        </div>
        <h2 className="logout-title">Are you sure you want to logout?</h2>
        <p className="logout-subtitle">
          You will be logged out and returned to login screen. Do you want to proceed?
        </p>
        <div className="logout-actions">
          <button type="button" className="logout-btn-no" onClick={onClose}>No</button>
          <button type="button" className="logout-btn-yes" onClick={onConfirm}>Yes, Logout</button>
        </div>
      </div>
    </div>
  );
}
