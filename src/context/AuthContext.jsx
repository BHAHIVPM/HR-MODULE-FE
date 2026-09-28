import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import authService from '../features/auth/services/authService';
import { DEV_AUTH_KEY, LOGIN_ID_KEY } from '../api/axiosClient';

const AuthContext = createContext();

// Re-export for backward compatibility
export { DEV_AUTH_KEY };

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);
  const [user, setUser] = useState(null);

  const checkAuth = async () => {
    if (sessionStorage.getItem(DEV_AUTH_KEY) === 'true') {
      setIsAuthenticated(true);
      setChecking(false);
      return;
    }

    try {
      // GET /auth/auth-me validates the CURRENT token (Access_token cookie or
      // Bearer header). 200 + true -> the token exists and is valid, so the
      // login process is skipped and the user lands straight on the dashboard.
      const res = await authService.authMe();
      const body = res?.data ?? {};
      const valid = body.responseOutput === true || body.data === true || body === true;
      if (valid) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        sessionStorage.removeItem(LOGIN_ID_KEY);
      }
    } catch {
      // Missing / expired / tampered token (401) -> require login again.
      setIsAuthenticated(false);
      sessionStorage.removeItem(LOGIN_ID_KEY);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const clearUser = useCallback(() => setUser(null), []);

  const logout = useCallback(async () => {
    sessionStorage.removeItem(DEV_AUTH_KEY);
    sessionStorage.removeItem(LOGIN_ID_KEY);
    setUser(null);
    try {
      await authService.logout();
    } catch {
      // ignore if dev session or backend unavailable
    }
    setIsAuthenticated(false);
  }, []);

  const value = useMemo(
    () => ({ isAuthenticated, setIsAuthenticated, checking, logout, user, setUser, clearUser }),
    [isAuthenticated, checking, user, logout, clearUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
