import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children }) {
  const { isAuthenticated, checking } = useAuth();
  if (checking) return <p>Loading...</p>; // waiting on /about-me response
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return children;
}

export default ProtectedRoute;