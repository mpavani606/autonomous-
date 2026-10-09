import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const LoginPage = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const { data } = await api.post('/auth/login', form);
      login(data.user, data.token);
      navigate(data.user.role === 'admin' ? '/admin/dashboard' : '/dashboard');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to log in. Check the server connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card glass-card">
        <span className="eyebrow">Welcome back</span>
        <h2>Sign in to your agent workbench</h2>
        <form onSubmit={handleSubmit} className="auth-form">
          <input
            required
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="Email"
          />
          <input
            required
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="Password"
          />
          <button type="submit" className="gradient-button" disabled={isSubmitting}>
            {isSubmitting ? 'Logging in...' : 'Login'}
          </button>
          {error && <p className="form-error" role="alert">{error}</p>}
        </form>
        <small>
          <>New here? <Link to="/register">Create account</Link></>
        </small>
      </div>
    </div>
  );
};

export default LoginPage;
