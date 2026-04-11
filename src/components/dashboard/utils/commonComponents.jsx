import React from "react";

export function UserAvatar() {
  return (
    <span className="mini-avatar" aria-hidden="true">
      <svg viewBox="0 0 24 24">
        <circle cx="12" cy="8" r="3.1" />
        <path d="M6.5 18a5.5 5.5 0 0 1 11 0" />
      </svg>
    </span>
  );
}