import React, { useEffect, useState } from 'react';
import './ErrorModal.css';

/**
 * Reusable Error Pop-up Modal Screen.
 * Can be used by any API, form, or component throughout the application.
 */
function ErrorModal({ isOpen, error, onClose }) {
  const [copied, setCopied] = useState(false);

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

  const handleCopy = async () => {
    const fullText = [
      title ? `Title: ${title}` : null,
      statusCode ? `Status Code: ${statusCode}` : null,
      message ? `Message: ${message}` : null,
      details ? `Details:\n${typeof details === 'object' ? JSON.stringify(details, null, 2) : String(details)}` : null,
    ].filter(Boolean).join('\n\n');

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(fullText);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = fullText;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy error to clipboard:', err);
    }
  };

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
          <div className="error-modal-message">{message}</div>
          {details && (
            <div className="error-modal-details" title="Technical Details">
              {typeof details === 'object' ? JSON.stringify(details, null, 2) : String(details)}
            </div>
          )}
        </div>

        <div className="error-modal-footer">
          <button
            type="button"
            className="error-modal-btn-copy"
            onClick={handleCopy}
            title="Copy error details to clipboard"
          >
            <svg
              style={{ width: 15, height: 15 }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
              />
            </svg>
            {copied ? 'Copied!' : 'Copy Error'}
          </button>
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
