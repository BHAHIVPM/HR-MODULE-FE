import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/LoginForm';
import authService from '../services/authService';
import { useAuth, DEV_AUTH_KEY } from '../../../context/AuthContext';
import AppHeader from '../../../components/AppHeader/AppHeader';

const DEV_USERNAME = '100112345678';
const DEV_PASSWORD = 'admin';

function LoginPage() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exiting, setExiting] = useState(false);
  const navigate = useNavigate();
  const { setIsAuthenticated } = useAuth();

  const goToDashboard = () => {
    setExiting(true);
    setTimeout(() => {
      navigate('/dashboard', { state: { fromLogin: true } });
    }, 280);
  };

  const handleLogin = async (credentials) => {
    setLoading(true);
    setError(null);

    const loginId = credentials.loginId || credentials.username;
    const password = credentials.password;

    if ((loginId === DEV_USERNAME || loginId === 'admin') && password === DEV_PASSWORD) {
      sessionStorage.setItem(DEV_AUTH_KEY, 'true');
      setIsAuthenticated(true);
      goToDashboard();
      return;
    }

    try {
      await authService.login(loginId, password);
      setIsAuthenticated(true);
      goToDashboard();
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid 12-digit Login ID or password';
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <div className={exiting ? 'login-page login-page-exiting' : 'login-page'}>
      <AppHeader subtitle="Sign in" />
      <LoginForm onSubmit={handleLogin} error={error} loading={loading || exiting} />
    </div>
  );
}

export default LoginPage;

