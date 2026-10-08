import axios from 'axios';

// In production (Netlify) the browser talks only to its own origin at /api.
// Netlify's _redirects file proxies /api/* to the Render backend, so cookies
// are first-party. For local dev, set REACT_APP_API_URL=http://localhost:8080
// in .env.development to call the backend directly.
const getDefaultBaseUrl = () => '/api';

const API_BASE_URL = (process.env.REACT_APP_API_URL || getDefaultBaseUrl()).replace(/\/+$/, '');

const axiosClient = axios.create({
  baseURL: `${API_BASE_URL}/`,
  withCredentials: true,
});
export const LOGIN_ID_KEY = 'hr-login-id';
export const DEV_AUTH_KEY = 'hr-dev-auth';

export const getStoredLoginId = () => {
  try {
    return sessionStorage.getItem(LOGIN_ID_KEY) || localStorage.getItem(LOGIN_ID_KEY);
  } catch {
    return null;
  }
};

export const clearStoredAuth = () => {
  try {
    sessionStorage.removeItem(LOGIN_ID_KEY);
    sessionStorage.removeItem(DEV_AUTH_KEY);
    localStorage.removeItem(LOGIN_ID_KEY);
    localStorage.removeItem(DEV_AUTH_KEY);
  } catch { }
};

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve();
  });
  failedQueue = [];
};

const redirectToLogin = () => {
  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
};

// ── Generic API notification events ─────────────────────────────────────────
// Consumed globally by NotificationContext, so EVERY API (current and future)
// gets the error pop-up modal and the auto-dismissing success toast without
// any page-level code. Mirrors the existing 'server-down-error' event pattern.
export const API_ERROR_EVENT = 'hr-api-error';
export const API_SUCCESS_EVENT = 'hr-api-success';

const dispatchApiError = ({ title, message, statusCode, details }) => {
  window.dispatchEvent(
    new CustomEvent(API_ERROR_EVENT, {
      detail: { title, message, statusCode, details },
    })
  );
};

const dispatchApiSuccess = ({ header, message }) => {
  window.dispatchEvent(
    new CustomEvent(API_SUCCESS_EVENT, { detail: { header, message } })
  );
};

/** Formats a real HTTP error (Spring Boot error body etc.) and pops the modal. */
const dispatchHttpError = (err) => {
  if (!err?.response) return;
  const resData = err.response.data;
  const status = err.response.status;
  const hasEnvelopeShape = resData && typeof resData === 'object' && (resData.header || resData.message);

  let title = (hasEnvelopeShape && resData.header) || (resData && resData.error) || `Error ${status}`;
  let message = 'The request failed. Please try again.';
  let details = null;

  if (hasEnvelopeShape) {
    message = resData.message || message;
  } else if (typeof resData === 'string' && resData.trim().length > 0) {
    if (resData.includes('<html') || resData.includes('<!DOCTYPE')) {
      const titleMatch = resData.match(/<title>(.*?)<\/title>/i);
      if (titleMatch && titleMatch[1]) {
        title = titleMatch[1].trim();
      }
      message = `The server returned an HTML error page (${status} ${err.response.statusText || 'Not Found'}).`;
      details = resData;
    } else {
      message = resData;
    }
  } else if (err.message) {
    message = err.message;
  }

  if (resData && typeof resData === 'object' && !hasEnvelopeShape) {
    details = resData;
  }

  dispatchApiError({
    title,
    message,
    statusCode: status,
    details,
  });
};

/** Success toasts only make sense for data-changing calls, never for reads. */
const isMutatingMethod = (config) =>
  ['post', 'put', 'delete', 'patch'].includes(String(config?.method || '').toLowerCase());

// Response interceptor:
// 1. If backend server is down (no response received), trigger global server-down-error popup.
// 2. Universal project envelope check: { header, message, responseOutput, statusCode }
//    is returned by EVERY project API — including errors — with HTTP 200.
//    When envelope statusCode >= 400 the API "returned an error", so the promise
//    is rejected with an axios-shaped error. Every existing
//    `catch (err) { showErrorPopup(err) }` then opens the manual-close error
//    modal using the envelope's header/message/statusCode.
// 3. On ANY 401, first try to refresh the access token via httpOnly cookie.
axiosClient.interceptors.response.use(
  (res) => {
    const data = res?.data;
    if (
      data &&
      typeof data === 'object' &&
      !Array.isArray(data) &&
      Number.isFinite(Number(data.statusCode)) &&
      Number(data.statusCode) >= 400
    ) {
      const envelopeError = new Error(data.message || 'Request failed');
      envelopeError.isProjectEnvelopeError = true;
      envelopeError.config = res.config;
      // Shape it like an axios error response so showErrorPopup(err) reads
      // header/message/statusCode straight out of the envelope.
      envelopeError.response = {
        data,
        status: Number(data.statusCode),
        statusText: data.header || '',
        headers: res.headers,
        config: res.config,
      };
      // Generic pop-up trigger: fires for EVERY API in the app, present and
      // future, even if the calling page forgot a catch block.
      dispatchApiError({
        title: data.header || 'Error',
        message: data.message || 'The request failed. Please try again.',
        statusCode: Number(data.statusCode),
      });
      return Promise.reject(envelopeError);
    }
    // Generic success toast for data-changing calls (POST/PUT/DELETE/PATCH).
    // GET reads stay silent, and auth flows (login/refresh/password) handle
    // their own feedback screens.
    if (isMutatingMethod(res.config) && !String(res.config?.url || '').startsWith('/auth/')) {
      dispatchApiSuccess({
        header: data?.header || 'Success',
        message: data?.message || 'Completed successfully.',
      });
    }
    return res;
  },
  async (err) => {
    // Check if backend server is down / no response received
    if (!err.response) {
      window.dispatchEvent(
        new CustomEvent('server-down-error', {
          detail: {
            message: err.message || 'Unable to connect to the backend server.',
            url: err.config?.url ? `${err.config.baseURL || ''}${err.config.url}` : 'Backend API',
            timestamp: new Date().toLocaleTimeString(),
          },
        })
      );
    }

    // Real HTTP errors (non-envelope / Spring Boot format) also open the
    // generic error pop-up — unless a call opts out via _suppressGenericError,
    // or it is a 401 handled by the token-refresh / redirect flow below.
    if (err.response && !err.config?._suppressGenericError && err.response.status !== 401) {
      dispatchHttpError(err);
    }

    const originalRequest = err.config;

    if (sessionStorage.getItem(DEV_AUTH_KEY) === 'true' || localStorage.getItem(DEV_AUTH_KEY) === 'true') {
      return Promise.reject(err);
    }

    if (originalRequest?._isRefreshRequest) {
      return Promise.reject(err);
    }

    if (err.response?.status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;

      const loginId = getStoredLoginId();
      if (!loginId) {
        redirectToLogin();
        return Promise.reject(err);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => axiosClient(originalRequest));
      }

      isRefreshing = true;

      try {
        await axios.post(
          `${API_BASE_URL}/auth/refresh-token/${encodeURIComponent(loginId)}`,
          {},
          { withCredentials: true }
        );
        processQueue(null);
        return axiosClient(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr);
        clearStoredAuth();
        redirectToLogin();
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(err);
  }
);

export default axiosClient;