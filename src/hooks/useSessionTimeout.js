import { useEffect, useRef, useState, useCallback } from 'react';
import authService from '../features/auth/services/authService';
import { useAuth } from '../context/AuthContext';
import { LOGIN_ID_KEY } from '../api/axiosClient';
import { useNavigate } from 'react-router-dom';

const WARNING_AT_MS = 13 * 60 * 1000;  // show popup at 13 min
const LOGOUT_AT_MS = 15 * 60 * 1000;   // force logout at 15 min
const REFRESH_THROTTLE_MS = 60 * 1000; // don't call refresh more than once/min on activity

export function useSessionTimeout() {
  const [showWarning, setShowWarning] = useState(false);
  const warningTimer = useRef(null);
  const logoutTimer = useRef(null);
  const lastRefreshAt = useRef(Date.now());
  const { setIsAuthenticated } = useAuth();
  const navigate = useNavigate();
  const loginId = sessionStorage.getItem(LOGIN_ID_KEY);

  const clearTimers = () => {
    clearTimeout(warningTimer.current);
    clearTimeout(logoutTimer.current);
  };

  const forceLogout = useCallback(() => {
    clearTimers();
    sessionStorage.removeItem(LOGIN_ID_KEY);
    setIsAuthenticated(false);
    navigate('/login');
  }, [navigate, setIsAuthenticated]);

  // (Re)starts the 13-min warning + 15-min logout clock, anchored at "now"
  const resetTimers = useCallback(() => {
    clearTimers();
    setShowWarning(false);
    warningTimer.current = setTimeout(() => setShowWarning(true), WARNING_AT_MS);
    logoutTimer.current = setTimeout(forceLogout, LOGOUT_AT_MS);
  }, [forceLogout]);

  // Called on user activity. Throttled: only refreshes at most once per minute.
  const handleActivity = useCallback(() => {
    const now = Date.now();
    if (now - lastRefreshAt.current < REFRESH_THROTTLE_MS) return;

    lastRefreshAt.current = now;
    if (!loginId) {
      forceLogout();
      return;
    }
    authService
      .refresh(loginId)
      .then(() => resetTimers()) // token renewed → restart 13/15 min clock
      .catch(() => forceLogout()); // refresh failed (e.g. session truly expired)
  }, [resetTimers, forceLogout, loginId]);

  useEffect(() => {
    resetTimers(); // start clock as soon as this hook mounts (i.e. after login)

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);

    return () => {
      clearTimers();
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
    };
  }, [handleActivity, resetTimers]);

  // Called when user clicks "Stay logged in" on the warning popup
  const extendSession = () => {
    if (!loginId) {
      forceLogout();
      return;
    }
    authService.refresh(loginId).then(resetTimers).catch(forceLogout);
  };

  return { showWarning, extendSession, forceLogout };
}