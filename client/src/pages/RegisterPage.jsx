import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const RegisterPage = () => {
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: searchParams.get('role') === 'admin' ? 'admin' : 'student',
    adminSignupCode: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const payload = { ...form };
      if (payload.role !== 'admin') delete payload.adminSignupCode;
      const { data } = await api.post('/auth/register', payload);
      login(data.user, data.token);
      navigate(data.user.role === 'admin' ? '/admin/dashboard' : '/onboarding');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to create your account. Check the server connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card glass-card">
        <span className="eyebrow">Join the future</span>
        <h2>{form.role === 'admin' ? 'Create an administrator account' : 'Create your autonomous learning agent'}</h2>
        <form onSubmit={handleSubmit} className="auth-form">
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name" />
          <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" />
          <input required minLength={8} type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Password (at least 8 characters)" />
          <label className="auth-field">
            Account role
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value, adminSignupCode: '' })}
            >
              <option value="student">Student</option>
              <option value="admin">Admin</option>
            </select>
          </label>
          {form.role === 'admin' && (
            <>
              <input
                required
                type="password"
                autoComplete="off"
                value={form.adminSignupCode}
                onChange={(e) => setForm({ ...form, adminSignupCode: e.target.value })}
                placeholder="Administrator invite code"
              />
              <small>Admin signup requires an invite code provided by the server administrator.</small>
            </>
          )}
          <button type="submit" className="gradient-button" disabled={isSubmitting}>
            {isSubmitting ? 'Creating account...' : 'Create My Account'}
          </button>
          {error && <p className="form-error" role="alert">{error}</p>}
        </form>
        <small>Already have an account? <Link to="/login">Sign in</Link></small>
      </div>
    </div>
  );
};

export default RegisterPage;
