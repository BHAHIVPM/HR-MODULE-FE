import { createContext, useContext, useState, useEffect } from 'react';
import authService from '../features/auth/services/authService';
import { DEV_AUTH_KEY, LOGIN_ID_KEY } from '../api/axiosClient';

const AuthContext = createContext();

// Re-export for backward compatibility
export { DEV_AUTH_KEY };

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);

  const checkAuth = async () => {
    if (sessionStorage.getItem(DEV_AUTH_KEY) === 'true') {
      setIsAuthenticated(true);
      setChecking(false);
      return;
    }

    const loginId = sessionStorage.getItem(LOGIN_ID_KEY);
    if (!loginId) {
      setIsAuthenticated(false);
      setChecking(false);
      return;
    }

    try {
      // Attempt to refresh the access token (the httpOnly refresh cookie is sent automatically).
      // If it succeeds, the session is still valid.
      await authService.refresh(loginId);
      setIsAuthenticated(true);
    } catch {
      // Refresh failed → session truly expired. Clear stored loginId.
      sessionStorage.removeItem(LOGIN_ID_KEY);
      setIsAuthenticated(false);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const logout = async () => {
    sessionStorage.removeItem(DEV_AUTH_KEY);
    sessionStorage.removeItem(LOGIN_ID_KEY);
    try {
      await authService.logout();
    } catch {
      // ignore if dev session or backend unavailable
    }
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated, checking, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
