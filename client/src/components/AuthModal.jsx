import React, { useState } from 'react';
import { X, User, Mail, Phone, Lock, Sparkles, AlertCircle, UserPlus, LogIn, ArrowRight, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal({ isOpen, onClose }) {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        if (!email.trim() || !password.trim()) {
          setError('Please enter both email and password');
          setLoading(false);
          return;
        }
        const res = await login(email.trim(), password);
        if (res.success) {
          onClose();
        } else {
          setError(res.message || 'Invalid email or password');
        }
      } else {
        if (!name.trim()) {
          setError('Please enter your full name');
          setLoading(false);
          return;
        }
        if (!address.trim()) {
          setError('Please enter your delivery address');
          setLoading(false);
          return;
        }
        const res = await register({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          password,
          address: address.trim()
        });
        if (res.success) {
          onClose();
        } else {
          setError(res.message);
        }
      }
    } catch (err) {
      setError(err.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role) => {
    setError(null);
    setLoading(true);
    const demoEmail = role === 'admin' ? 'admin@quickkart.com' : 'customer@quickkart.com';
    const demoPass = role === 'admin' ? 'admin123' : 'customer123';

    try {
      const res = await login(demoEmail, demoPass);
      if (res.success) {
        onClose();
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError(err.message || 'Demo login error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal-center-backdrop"
      onClick={onClose}
    >
      <div
        className="modal-center-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                background: isLogin ? '#E8F5E9' : '#EEF2FF',
                color: isLogin ? '#0C831F' : '#4F46E5',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {isLogin ? <LogIn size={18} /> : <UserPlus size={18} />}
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>
              {isLogin ? 'Sign In to Your Account' : 'Create New Account'}
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem', display: 'flex', alignItems: 'center' }}
            aria-label="Close modal"
          >
            <X size={20} color="var(--text-muted)" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="modal-card-tabs">
          <button
            type="button"
            onClick={() => {
              setIsLogin(true);
              setError(null);
            }}
            style={{
              padding: '0.75rem',
              border: 'none',
              background: isLogin ? 'var(--bg-card)' : 'transparent',
              fontWeight: 800,
              fontSize: '0.88rem',
              color: isLogin ? '#0C831F' : 'var(--text-muted)',
              cursor: 'pointer',
              borderBottom: isLogin ? '2.5px solid #0C831F' : 'none',
              transition: 'var(--transition)'
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsLogin(false);
              setError(null);
            }}
            style={{
              padding: '0.75rem',
              border: 'none',
              background: !isLogin ? 'var(--bg-card)' : 'transparent',
              fontWeight: 800,
              fontSize: '0.88rem',
              color: !isLogin ? '#0C831F' : 'var(--text-muted)',
              cursor: 'pointer',
              borderBottom: !isLogin ? '2.5px solid #0C831F' : 'none',
              transition: 'var(--transition)'
            }}
          >
            Create Account (Sign Up)
          </button>
        </div>

        <div className="modal-card-scroll-body">
          {error && (
            <div
              style={{
                background: '#FEF2F2',
                border: '1px solid #FCA5A5',
                color: '#B91C1C',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.82rem',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          {/* User Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            {!isLogin && (
              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, marginBottom: '0.18rem' }}>
                  YOUR FULL NAME
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={15} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    required
                    className="search-input"
                    style={{ borderRadius: 'var(--radius-md)', padding: '0.52rem 0.85rem 0.52rem 2.4rem', fontSize: '0.86rem' }}
                    placeholder="Enter your name (e.g. Rohit Pal)"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, marginBottom: '0.18rem' }}>
                YOUR EMAIL ADDRESS
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  required
                  className="search-input"
                  style={{ borderRadius: 'var(--radius-md)', padding: '0.52rem 0.85rem 0.52rem 2.4rem', fontSize: '0.86rem' }}
                  placeholder="Enter the email you registered with"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {!isLogin && (
              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, marginBottom: '0.18rem' }}>
                  MOBILE NUMBER
                </label>
                <div style={{ position: 'relative' }}>
                  <Phone size={15} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="tel"
                    required
                    className="search-input"
                    style={{ borderRadius: 'var(--radius-md)', padding: '0.52rem 0.85rem 0.52rem 2.4rem', fontSize: '0.86rem' }}
                    placeholder="10-digit phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>
            )}

            {!isLogin && (
              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, marginBottom: '0.18rem' }}>
                  DELIVERY ADDRESS (FLAT, STREET, AREA, CITY)
                </label>
                <div style={{ position: 'relative' }}>
                  <MapPin size={15} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    required
                    className="search-input"
                    style={{ borderRadius: 'var(--radius-md)', padding: '0.52rem 0.85rem 0.52rem 2.4rem', fontSize: '0.86rem' }}
                    placeholder="e.g. Flat 302, Green Glen Layout, Bengaluru"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, marginBottom: '0.18rem' }}>
                YOUR PASSWORD
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="password"
                  required
                  className="search-input"
                  style={{ borderRadius: 'var(--radius-md)', padding: '0.52rem 0.85rem 0.52rem 2.4rem', fontSize: '0.86rem' }}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn-checkout"
              style={{ justifyContent: 'center', marginTop: '0.35rem', padding: '0.62rem', background: '#0C831F' }}
              disabled={loading}
            >
              <span>
                {loading
                  ? 'Please wait...'
                  : isLogin
                  ? 'Sign In with My Details'
                  : 'Create My Account'}
              </span>
            </button>
          </form>

          {/* Toggle link */}
          <div style={{ textAlign: 'center', marginTop: '0.55rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {isLogin ? "Don't have an account yet? " : "Already have an account? "}
            <span
              style={{ color: '#0C831F', fontWeight: 800, cursor: 'pointer', textDecoration: 'underline' }}
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
              }}
            >
              {isLogin ? 'Sign Up here' : 'Sign In here'}
            </span>
          </div>

          {/* Clearly Separated Demo Test Persona section (At bottom, labeled clearly) */}
          <div style={{ marginTop: '0.85rem', paddingTop: '0.65rem', borderTop: '1px dashed var(--border-light)' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem',
                fontSize: '0.7rem',
                fontWeight: 800,
                color: 'var(--text-muted)',
                marginBottom: '0.45rem'
              }}
            >
              <Sparkles size={12} color="#D97706" />
              <span>OR TEST WITH PRE-CONFIGURED DEMO ACCOUNTS:</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.45rem' }}>
              <button
                type="button"
                className="btn-auth"
                style={{ fontSize: '0.72rem', justifyContent: 'center', padding: '0.38rem', flexDirection: 'column', gap: '0.08rem' }}
                onClick={() => handleDemoLogin('customer')}
                disabled={loading}
              >
                <span style={{ fontWeight: 800 }}>Demo: Rahul</span>
                <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>customer@quickkart.com</span>
              </button>
              <button
                type="button"
                className="btn-auth"
                style={{
                  fontSize: '0.72rem',
                  justifyContent: 'center',
                  padding: '0.38rem',
                  flexDirection: 'column',
                  gap: '0.08rem',
                  borderColor: '#0C831F',
                  color: '#0C831F',
                  background: 'var(--primary-light)'
                }}
                onClick={() => handleDemoLogin('admin')}
                disabled={loading}
              >
                <span style={{ fontWeight: 800 }}>Demo: Admin</span>
                <span style={{ fontSize: '0.62rem', color: '#0C831F' }}>admin@quickkart.com</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
