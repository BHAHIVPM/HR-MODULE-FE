import { createContext, useContext, useState, useEffect } from 'react';
import authService from '../features/auth/services/authService';

const AuthContext = createContext();
export const DEV_AUTH_KEY = 'hr-dev-auth';

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);

  const checkAuth = async () => {
    if (sessionStorage.getItem(DEV_AUTH_KEY) === 'true') {
      setIsAuthenticated(true);
      setChecking(false);
      return;
    }

    try {
      await authService.aboutMe();
      setIsAuthenticated(true);
    } catch {
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
