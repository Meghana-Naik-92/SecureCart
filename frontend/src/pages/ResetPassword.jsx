import { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import api from '../api/axios';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get('token') || '';
  
  const [form, setForm] = useState({ token: tokenFromUrl, newPassword: '', confirmPassword: '' });
  const [msg, setMsg] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg({ text: '', type: '' });

    if (form.newPassword.length < 8) {
      setMsg({ text: 'Password must be at least 8 characters long', type: 'error' });
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setMsg({ text: 'Passwords do not match', type: 'error' });
      return;
    }

    setLoading(true);

    try {
      const res = await api.post('/api/auth/reset-password', {
        token: form.token,
        newPassword: form.newPassword
      });
      setMsg({ text: res.data.message || 'Password has been reset successfully', type: 'success' });
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setMsg({ text: err.response?.data?.message || 'Failed to reset password', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--bg)'
    }}>
      <div className="card" style={{ width: '100%', maxWidth: '420px' }}>
        <h1 style={{ color: 'var(--primary)', marginBottom: '8px', fontSize: '26px' }}>
          Reset Password
        </h1>
        <p style={{ color: 'var(--secondary)', marginBottom: '28px', fontSize: '14px' }}>
          Enter your reset token and new password
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Reset Token</label>
            <input
              type="text"
              placeholder="Enter token from email"
              value={form.token}
              onChange={e => setForm({ ...form, token: e.target.value })}
              required
            />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>New Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={form.newPassword}
              onChange={e => setForm({ ...form, newPassword: e.target.value })}
              required
            />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Confirm New Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={form.confirmPassword}
              onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
              required
            />
          </div>

          {msg.text && (
            <div style={{
              padding: '12px 16px', borderRadius: '6px', marginBottom: '20px',
              backgroundColor: msg.type === 'success' ? '#e8f5e9' : '#fdecea',
              color: msg.type === 'success' ? 'var(--success)' : 'var(--error)',
              fontWeight: '600', fontSize: '14px'
            }}>
              {msg.text}
            </div>
          )}

          <button type="submit" className="btn-primary" style={{ width: '100%', padding: '12px' }} disabled={loading}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: 'var(--secondary)' }}>
          Remember your password?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '600' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

const labelStyle = {
  display: 'block',
  marginBottom: '6px',
  fontSize: '13px',
  fontWeight: '600',
  color: '#444'
};
