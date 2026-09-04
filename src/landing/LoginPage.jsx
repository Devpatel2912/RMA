import React, { useState } from 'react';
import axios from 'axios';
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Spinner from '../components/Spinner';
import '../login.css'; // Re-use the existing login CSS
import logoUrl from '../assets/logo.png';

const getLoginErrorMessage = (err) => {
  const serverError = err.response?.data?.error || '';

  if (
    err.response?.status === 503 ||
    /prisma|database server|can't reach database|connect etimedout|enotfound|econnrefused/i.test(serverError)
  ) {
    return 'Database connection failed. Please check the backend DATABASE_URL and try again.';
  }

  return serverError || 'Login failed. Please check your credentials.';
};

export default function LoginPage({ setIsLoggedIn, setUserRole }) {
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);
    const email = e.target.email.value.trim();
    const password = e.target.password.value;

    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005/api';
      const res = await axios.post(`${baseUrl}/auth/login`, { email, password });

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('userRole', res.data.user.role);
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;

      setUserRole(res.data.user.role);
      setIsLoggedIn(true);

      // Redirect to the dashboard
      navigate('/admin-panel');
    } catch (err) {
      setLoginError(getLoginErrorMessage(err));
      console.error(err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-background-pattern"></div>
      <div className="login-box" style={{ position: 'relative', zIndex: 10 }}>


        <div className="login-header" style={{ marginTop: '20px' }}>
          <div className="login-logo">
            <img src={logoUrl} alt="Logo" style={{ width: '36px', height: '36px', objectFit: 'contain' }} />
          </div>
          <div className="login-title-group">
            <h1 className="login-title">Admin Portal</h1>
            <p className="login-subtitle">Sign in to your Avxperts Flow account</p>
          </div>
        </div>

        <form className="login-form" onSubmit={handleLogin}>
          {loginError && (
            <div className="login-error">
              {loginError}
            </div>
          )}
          <div className="login-input-group">
            <label>Email Address</label>
            <input type="email" name="email" className="login-input" placeholder="admin@example.com" required />
          </div>

          <div className="login-input-group">
            <label>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                className="login-input"
                placeholder="••••••••"
                required
                style={{ paddingRight: '44px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          <button type="submit" className="login-btn" disabled={isLoggingIn} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
            {isLoggingIn ? <Spinner size="sm" variant="white" /> : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '12px', color: '#334155', marginTop: '-8px' }}>
          AV XPERTS Flow · Powered by Avxperts
        </p>
      </div>
    </div>
  );
}
