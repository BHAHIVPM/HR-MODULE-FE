import React, { useState, useEffect } from 'react';
import './Toast.css';

function Toast({ id, type = 'success', title, message, duration = 1500, onClose }) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Start exit animation 250ms before duration ends
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, Math.max(duration - 250, 200));

    // Full dismiss timer
    const dismissTimer = setTimeout(() => {
      onClose(id);
    }, duration);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(dismissTimer);
    };
  }, [id, duration, onClose]);

  const handleManualClose = () => {
    setIsExiting(true);
    setTimeout(() => onClose(id), 200);
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'error':
        return (
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case 'warning':
        return (
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      default:
        return (
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  return (
    <div className={`toast-rectangle toast-${type} ${isExiting ? 'toast-exiting' : ''}`} role="alert">
      <div className="toast-icon">{getIcon()}</div>
      <div className="toast-content">
        {title && <div className="toast-title">{title}</div>}
        <div className="toast-message">{message}</div>
      </div>
      <button type="button" className="toast-close" onClick={handleManualClose} aria-label="Close notification">
        &times;
      </button>
      <div className="toast-progress" style={{ animationDuration: `${duration}ms` }} />
    </div>
  );
}

export default Toast;
