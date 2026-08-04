import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/LoginForm';
import authService from '../services/authService';
import { useAuth } from '../../../context/AuthContext';

function LoginPage() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setIsAuthenticated } = useAuth();

  const handleLogin = async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      await authService.login(credentials); // sets httpOnly cookie automatically
      setIsAuthenticated(true);
      navigate('/dashboard');
    } catch {
      setError('Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return <LoginForm onSubmit={handleLogin} error={error} loading={loading} />;
}

export default LoginPage;