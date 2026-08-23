import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg({ text: '', type: '' });
    setLoading(true);

    try {
      const res = await api.post('/api/auth/forgot-password', { email });
      setMsg({ text: res.data.message || 'If this email is registered, a reset token has been sent.', type: 'success' });
      setEmail('');
    } catch (err) {
      setMsg({ text: err.response?.data?.message || 'Failed to request password reset', type: 'error' });
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
          Forgot Password
        </h1>
        <p style={{ color: 'var(--secondary)', marginBottom: '28px', fontSize: '14px' }}>
          Enter your email to receive a password reset token
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
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
            {loading ? 'Sending...' : 'Send Reset Token'}
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
