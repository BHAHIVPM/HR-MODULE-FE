import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import ToastContainer from '../components/common/Toast/ToastContainer';
import ErrorModal from '../components/common/ErrorModal/ErrorModal';
import { API_ERROR_EVENT, API_SUCCESS_EVENT } from '../api/axiosClient';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [errorModal, setErrorModal] = useState({
    isOpen: false,
    error: null,
  });

  // Tracks the signature of the most recent success toast so a page-level
  // showSuccess() call with the same header+message as the generic
  // axios-event toast does not stack a duplicate toast on screen.
  const lastToastKeyRef = useRef(null);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  /** Returns true when an identical toast was shown within the last 2s. */
  const checkDuplicateToast = useCallback((message, type, title) => {
    const key = `${type}::${title || ''}::${message || ''}`;
    if (lastToastKeyRef.current === key) return true;
    lastToastKeyRef.current = key;
    setTimeout(() => {
      if (lastToastKeyRef.current === key) lastToastKeyRef.current = null;
    }, 2000);
    return false;
  }, []);

  /**
   * Show a toast notification.
   * Default duration is 1500ms (1.5 seconds) for success messages as requested.
   */
  const showToast = useCallback((message, type = 'info', title = '', duration = 1500) => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type, title, duration }]);
    return id;
  }, []);

  /**
   * Helper specifically for success messages (1.5 seconds slide-in on top right).
   * De-duplicated against the generic axios success toast so identical
   * messages never stack.
   */
  const showSuccess = useCallback((message, title = 'Success') => {
    if (checkDuplicateToast(message, 'success', title)) return null;
    return showToast(message, 'success', title, 1500);
  }, [showToast, checkDuplicateToast]);


  /**
   * Open the global Error Pop-up Modal.
   * Accepts either:
   * - A string message: showErrorPopup("Invalid input")
   * - An object: showErrorPopup({ title: "Fetch Failed", message: "...", statusCode: 500, details: "..." })
   * - An Axios / Fetch Error object: showErrorPopup(err)
   */
  const showErrorPopup = useCallback((errorInput) => {
    let formattedError = {
      title: 'Action Failed',
      message: 'An unexpected error occurred.',
      statusCode: null,
      details: null,
    };

    if (typeof errorInput === 'string') {
      formattedError.message = errorInput;
    } else if (errorInput && typeof errorInput === 'object') {
      // Check if it's an Axios error with response
      if (errorInput.response) {
        const resData = errorInput.response.data;
        formattedError.statusCode = errorInput.response.status;
        
        if (resData && typeof resData === 'object') {
          // Backend ResponseMessage shape: { header, message, statusCode, responseOutput }
          formattedError.title = resData.header || errorInput.response.statusText || 'Server Error';
          formattedError.message = resData.message || 'The server returned an error.';
          if (resData.responseOutput) {
            formattedError.details = resData.responseOutput;
          }
        } else if (typeof resData === 'string' && resData.trim().length > 0) {
          formattedError.message = resData;
        } else {
          formattedError.message = errorInput.message || 'Request failed with status ' + errorInput.response.status;
        }
      } else if (errorInput.message) {
        // Standard JS error or custom error object
        formattedError.title = errorInput.title || errorInput.header || 'Error';
        formattedError.message = errorInput.message;
        formattedError.statusCode = errorInput.statusCode || null;
        formattedError.details = errorInput.details || null;
      } else if (errorInput.header) {
        // Backend ResponseMessage passed directly
        formattedError.title = errorInput.header;
        formattedError.message = errorInput.message || 'Request was not successful.';
        formattedError.statusCode = errorInput.statusCode || null;
      }
    }

    setErrorModal({
      isOpen: true,
      error: formattedError,
    });
  }, []);

  const closeErrorModal = useCallback(() => {
    setErrorModal((prev) => ({ ...prev, isOpen: false }));
  }, []);

  // ── Generic API notification wiring ────────────────────────────────────────
  // axiosClient dispatches these window events for EVERY API call (present and
  // future), so errors always open the manual-close modal and successful
  // mutations always show the auto-dismissing toast - no page code required.
  useEffect(() => {
    const handleApiError = (event) => {
      const detail = event.detail || {};
      showErrorPopup({
        title: detail.title,
        message: detail.message,
        statusCode: detail.statusCode,
        details: detail.details,
      });
    };
    const handleApiSuccess = (event) => {
      const detail = event.detail || {};
      showSuccess(detail.message, detail.header || 'Success');
    };
    window.addEventListener(API_ERROR_EVENT, handleApiError);
    window.addEventListener(API_SUCCESS_EVENT, handleApiSuccess);
    return () => {
      window.removeEventListener(API_ERROR_EVENT, handleApiError);
      window.removeEventListener(API_SUCCESS_EVENT, handleApiSuccess);
    };
  }, [showErrorPopup, showSuccess]);

  return (
    <NotificationContext.Provider
      value={{
        showSuccess,
        showErrorPopup,
        showToast,
        closeErrorModal,
      }}
    >
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <ErrorModal
        isOpen={errorModal.isOpen}
        error={errorModal.error}
        onClose={closeErrorModal}
      />
    </NotificationContext.Provider>
  );
}

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export default NotificationContext;
