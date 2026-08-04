import { createContext, useContext, useState, useEffect } from 'react';
import authService from '../features/auth/services/authService';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true); // true while verifying on app load

  const checkAuth = async () => {
    try {
      await authService.aboutMe(); // succeeds only if cookie is valid
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
    await authService.logout();
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated, checking, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);