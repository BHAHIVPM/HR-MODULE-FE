import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/LoginForm';
import authService from '../services/authService';
import { useAuth, DEV_AUTH_KEY } from '../../../context/AuthContext';
import AppHeader from '../../../components/AppHeader/AppHeader';

const DEV_USERNAME = 'admin';
const DEV_PASSWORD = '123456789';

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

    if (credentials.username === DEV_USERNAME && credentials.password === DEV_PASSWORD) {
      sessionStorage.setItem(DEV_AUTH_KEY, 'true');
      setIsAuthenticated(true);
      goToDashboard();
      return;
    }

    try {
      await authService.login(credentials);
      setIsAuthenticated(true);
      goToDashboard();
    } catch {
      setError('Invalid username or password');
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
