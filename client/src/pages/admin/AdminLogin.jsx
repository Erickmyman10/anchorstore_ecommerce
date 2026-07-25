import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import adminApi from '../../services/adminApi';
import logo from '../../Images/Logo/anchorstore_logo.svg';

const BRAND = '#FF6B35';
const BRAND_DARK = '#F04D1A';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '', adminCode: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await adminApi.login(form);
      localStorage.setItem('adminToken', data.token);
      navigate('/admin');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f5f5f5',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Nunito', 'ui-sans-serif', system-ui, sans-serif",
      padding: '24px 16px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: 440,
        background: '#ffffff',
        borderRadius: 16,
        boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
        padding: '48px 40px 40px',
      }}>

        {/* Logo + store name */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <img
            src={logo}
            alt="AnchorStore"
            style={{ height: 56, width: 'auto', marginBottom: 12, display: 'inline-block' }}
          />
          <div style={{ color: '#1a1a1a', fontSize: 20, fontWeight: 800, letterSpacing: '-0.3px' }}>
            AnchorStore
          </div>
          <div style={{
            color: BRAND,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '2px',
            marginTop: 4,
            textTransform: 'uppercase',
          }}>
            Admin Portal
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div style={{
            background: '#ef4444',
            borderRadius: 8,
            padding: '12px 16px',
            marginBottom: 24,
            color: '#ffffff',
            fontSize: 14,
            fontWeight: 500,
            lineHeight: 1.5,
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          {/* Username */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', color: '#374151', fontSize: 14, fontWeight: 600, marginBottom: 6 }}>
              Username
            </label>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="Enter your username"
              required
              style={{
                width: '100%',
                padding: '11px 14px',
                background: '#ffffff',
                border: '1.5px solid #e5e7eb',
                borderRadius: 8,
                color: '#1a1a1a',
                fontSize: 15,
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.15s',
                fontFamily: 'inherit',
              }}
              onFocus={e => e.target.style.borderColor = BRAND}
              onBlur={e => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', color: '#374151', fontSize: 14, fontWeight: 600, marginBottom: 6 }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
                style={{
                  width: '100%',
                  padding: '11px 44px 11px 14px',
                  background: '#ffffff',
                  border: '1.5px solid #e5e7eb',
                  borderRadius: 8,
                  color: '#1a1a1a',
                  fontSize: 15,
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.15s',
                  fontFamily: 'inherit',
                }}
                onFocus={e => e.target.style.borderColor = BRAND}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#9ca3af',
                  padding: 4,
                  lineHeight: 1,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {showPassword ? (
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Admin Authorization Code */}
          <div style={{ marginBottom: 32 }}>
            <label style={{ display: 'block', color: '#374151', fontSize: 14, fontWeight: 600, marginBottom: 6 }}>
              Admin Authorization Code
            </label>
            <input
              type="password"
              name="adminCode"
              value={form.adminCode}
              onChange={handleChange}
              placeholder="Enter your secret admin code"
              required
              style={{
                width: '100%',
                padding: '11px 14px',
                background: '#ffffff',
                border: '1.5px solid #e5e7eb',
                borderRadius: 8,
                color: '#1a1a1a',
                fontSize: 15,
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.15s',
                fontFamily: 'inherit',
              }}
              onFocus={e => e.target.style.borderColor = BRAND}
              onBlur={e => e.target.style.borderColor = '#e5e7eb'}
            />
            <p style={{ color: '#9ca3af', fontSize: 12, marginTop: 6, lineHeight: 1.4 }}>
              Contact the store owner for the authorization code
            </p>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '13px',
              background: loading ? BRAND_DARK : BRAND,
              color: '#ffffff',
              border: 'none',
              borderRadius: 8,
              fontSize: 15,
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              transition: 'background 0.15s',
              fontFamily: 'inherit',
              letterSpacing: '0.2px',
              boxShadow: loading ? 'none' : '0 4px 20px rgba(255,107,53,0.30)',
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = BRAND_DARK; }}
            onMouseLeave={e => { if (!loading) e.currentTarget.style.background = BRAND; }}
          >
            {loading && (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                style={{ animation: 'spin 0.8s linear infinite' }}
              >
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
              </svg>
            )}
            {loading ? 'Signing in...' : 'Login to Admin Panel'}
          </button>
        </form>

        {/* Back to store */}
        <div style={{ textAlign: 'center', marginTop: 28 }}>
          <Link
            to="/"
            style={{
              color: '#9ca3af',
              fontSize: 13,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              fontWeight: 500,
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = BRAND}
            onMouseLeave={e => e.currentTarget.style.color = '#9ca3af'}
          >
            ← Back to Store
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        input::placeholder { color: #c4c4c4; }
      `}</style>
    </div>
  );
};

export default AdminLogin;
