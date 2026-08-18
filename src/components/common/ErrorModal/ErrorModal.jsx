import React, { useEffect } from 'react';
import './ErrorModal.css';

/**
 * Reusable Error Pop-up Modal Screen.
 * Can be used by any API, form, or component throughout the application.
 */
function ErrorModal({ isOpen, error, onClose }) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !error) return null;

  const {
    title = 'An Error Occurred',
    message = 'Something went wrong while processing your request. Please try again.',
    statusCode = null,
    details = null,
  } = typeof error === 'string' ? { message: error } : error;

  return (
    <div className="error-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="error-modal-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="error-modal-header">
          <div className="error-icon-wrapper" aria-hidden="true">
            <svg
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div className="error-header-text">
            <h3 className="error-modal-title">{title}</h3>
            {statusCode && (
              <span className="error-status-badge">Status {statusCode}</span>
            )}
          </div>
          <button
            type="button"
            className="error-modal-close-btn"
            onClick={onClose}
            aria-label="Close error modal"
          >
            &times;
          </button>
        </div>

        <div className="error-modal-body">
          <p className="error-modal-message">{message}</p>
          {details && (
            <div className="error-modal-details" title="Technical Details">
              {typeof details === 'object' ? JSON.stringify(details, null, 2) : String(details)}
            </div>
          )}
        </div>

        <div className="error-modal-footer">
          <button
            type="button"
            className="error-modal-btn-dismiss"
            onClick={onClose}
            autoFocus
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}

export default ErrorModal;
