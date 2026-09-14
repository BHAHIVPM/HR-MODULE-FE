import React, { useState, useEffect, useCallback } from 'react';
import BrokenGearAnimation from './BrokenGearAnimation';
import axiosClient from '../../../api/axiosClient';
import './ServerDownModal.css';

/**
 * Global Server Down Error Pop-Up Modal Component.
 * Automatically displays when any API call fails due to server down / no response.
 * Features a looping broken gear animation and retry connection utility.
 */
const ServerDownModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [errorDetails, setErrorDetails] = useState(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryStatus, setRetryStatus] = useState(null); // null | 'success' | 'failed'
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  // Listen for global 'server-down-error' event dispatched by axiosClient
  useEffect(() => {
    const handleServerDown = (event) => {
      const details = event.detail || {};
      setErrorDetails({
        message: details.message || 'Unable to connect to the backend server.',
        url: details.url || 'API Server Endpoint',
        timestamp: details.timestamp || new Date().toLocaleTimeString(),
      });
      setIsOpen(true);
      setRetryStatus(null);
    };

    window.addEventListener('server-down-error', handleServerDown);

    return () => {
      window.removeEventListener('server-down-error', handleServerDown);
    };
  }, []);

  // Keyboard escape key to close
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleClose = () => {
    setIsOpen(false);
    setShowTechnicalDetails(false);
    setRetryStatus(null);
  };

  // Ping backend to check if connection is restored
  const handleRetryConnection = useCallback(async () => {
    setIsRetrying(true);
    setRetryStatus(null);

    try {
      // Attempt a lightweight request to the backend root or health check
      await axiosClient.get('/', { timeout: 4000 });
      
      // If we got a response (even 404/200/etc), the server is alive!
      setRetryStatus('success');
      setTimeout(() => {
        setIsRetrying(false);
        handleClose();
      }, 1000);
    } catch (err) {
      setIsRetrying(false);
      if (err.response) {
        // Response received! Server is back online
        setRetryStatus('success');
        setTimeout(() => {
          handleClose();
        }, 1000);
      } else {
        // Still no response (server down)
        setRetryStatus('failed');
      }
    }
  }, []);

  if (!isOpen) return null;

  return (
    <div
      className="server-down-overlay"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="server-down-title"
    >
      <div
        className="server-down-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Badges */}
        <div className="server-down-header">
          <span className="server-status-pill">
            <span className="pill-dot"></span>
            Server Offline
          </span>
          <button
            type="button"
            className="server-down-close-btn"
            onClick={handleClose}
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>

        {/* Hero Section with Looping Broken Gear Animation */}
        <div className="server-down-hero">
          <BrokenGearAnimation />
          <h2 id="server-down-title" className="server-down-title">
            Server Connection Lost
          </h2>
          <p className="server-down-subtitle">
            We couldn't get a response from the backend server. The server might be down, undergoing maintenance, or your network connection was interrupted.
          </p>
        </div>

        {/* Retry status alerts */}
        {retryStatus === 'failed' && (
          <div className="server-retry-alert alert-error">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span>Server is still unreachable. Please check if your backend is running.</span>
          </div>
        )}

        {retryStatus === 'success' && (
          <div className="server-retry-alert alert-success">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Connection restored! Closing dialog...</span>
          </div>
        )}

        {/* Technical Info Toggle */}
        <div className="server-down-details-toggle">
          <button
            type="button"
            className="details-toggle-btn"
            onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
          >
            {showTechnicalDetails ? 'Hide Details' : 'Show Technical Info'}
            <svg
              className={`chevron-icon ${showTechnicalDetails ? 'rotate' : ''}`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>

          {showTechnicalDetails && errorDetails && (
            <div className="server-details-box">
              <div className="detail-item">
                <span className="detail-label">Status:</span>
                <span className="detail-val text-red">ERR_CONNECTION_REFUSED / NO_RESPONSE</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Failed Target:</span>
                <span className="detail-val">{errorDetails.url}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Timestamp:</span>
                <span className="detail-val">{errorDetails.timestamp}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Message:</span>
                <span className="detail-val">{errorDetails.message}</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Action Buttons */}
        <div className="server-down-actions">
          <button
            type="button"
            className="btn-retry-connection"
            onClick={handleRetryConnection}
            disabled={isRetrying}
          >
            {isRetrying ? (
              <>
                <span className="spinner-icon"></span>
                Checking Connection...
              </>
            ) : (
              <>
                <svg viewBox="0 0 20 20" fill="currentColor" className="btn-icon">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
                Retry Connection
              </>
            )}
          </button>

          <button
            type="button"
            className="btn-dismiss-server-down"
            onClick={handleClose}
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServerDownModal;
