import React, { useState } from 'react';
import { X, User, Mail, Phone, Lock, Sparkles, AlertCircle, UserPlus, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal({ isOpen, onClose }) {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        const res = await login(email, password);
        if (res.success) {
          onClose();
        } else {
          setError(res.message);
        }
      } else {
        if (!name.trim()) {
          setError('Please enter your full name');
          setLoading(false);
          return;
        }
        const res = await register({ name: name.trim(), email, phone, password });
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
    <div className="modal-overlay" style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div
        style={{
          background: 'white',
          width: '90%',
          maxWidth: '430px',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-xl)',
          overflow: 'hidden',
          border: '1px solid var(--border-light)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem',
            borderBottom: '1px solid var(--border-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                background: isLogin ? '#ECFDF5' : '#EEF2FF',
                color: isLogin ? '#10B981' : '#6366F1',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {isLogin ? <LogIn size={18} /> : <UserPlus size={18} />}
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>
              {isLogin ? 'Sign In to QuickKart' : 'Create New Account'}
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.2rem' }}
          >
            <X size={20} color="var(--text-muted)" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            borderBottom: '1px solid var(--border-light)',
            background: 'var(--bg-subtle)'
          }}
        >
          <button
            type="button"
            onClick={() => {
              setIsLogin(true);
              setError(null);
            }}
            style={{
              padding: '0.75rem',
              border: 'none',
              background: isLogin ? 'white' : 'transparent',
              fontWeight: 800,
              fontSize: '0.88rem',
              color: isLogin ? '#10B981' : 'var(--text-muted)',
              cursor: 'pointer',
              borderBottom: isLogin ? '2px solid #10B981' : 'none',
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
              background: !isLogin ? 'white' : 'transparent',
              fontWeight: 800,
              fontSize: '0.88rem',
              color: !isLogin ? '#10B981' : 'var(--text-muted)',
              cursor: 'pointer',
              borderBottom: !isLogin ? '2px solid #10B981' : 'none',
              transition: 'var(--transition)'
            }}
          >
            Sign Up
          </button>
        </div>

        <div style={{ padding: '1.25rem' }}>
          {/* ONLY show Demo buttons on the Sign In tab */}
          {isLogin && (
            <div
              style={{
                background: '#F8FAFC',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-md)',
                padding: '0.85rem',
                marginBottom: '1.25rem'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#4F46E5',
                  marginBottom: '0.5rem'
                }}
              >
                <Sparkles size={14} />
                <span>QUICK TEST WITH PRE-CONFIGURED DEMO:</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="btn-auth"
                  style={{ fontSize: '0.78rem', justifyContent: 'center', padding: '0.45rem' }}
                  onClick={() => handleDemoLogin('customer')}
                  disabled={loading}
                >
                  Demo Customer
                </button>
                <button
                  type="button"
                  className="btn-auth"
                  style={{
                    fontSize: '0.78rem',
                    justifyContent: 'center',
                    padding: '0.45rem',
                    borderColor: '#10B981',
                    color: '#059669',
                    background: '#ECFDF5'
                  }}
                  onClick={() => handleDemoLogin('admin')}
                  disabled={loading}
                >
                  Demo Admin
                </button>
              </div>
            </div>
          )}

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

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {!isLogin && (
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.3rem' }}>
                  Your Full Name
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    required
                    className="search-input"
                    style={{ borderRadius: 'var(--radius-md)', paddingLeft: '2.5rem' }}
                    placeholder="e.g. Rohit Pal"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.3rem' }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  required
                  className="search-input"
                  style={{ borderRadius: 'var(--radius-md)', paddingLeft: '2.5rem' }}
                  placeholder="yourname@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {!isLogin && (
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.3rem' }}>
                  Phone Number
                </label>
                <div style={{ position: 'relative' }}>
                  <Phone size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="tel"
                    required
                    className="search-input"
                    style={{ borderRadius: 'var(--radius-md)', paddingLeft: '2.5rem' }}
                    placeholder="10-digit mobile number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.3rem' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="password"
                  required
                  className="search-input"
                  style={{ borderRadius: 'var(--radius-md)', paddingLeft: '2.5rem' }}
                  placeholder="Enter a secure password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn-checkout"
              style={{ justifyContent: 'center', marginTop: '0.5rem', padding: '0.75rem' }}
              disabled={loading}
            >
              <span>
                {loading
                  ? 'Please wait...'
                  : isLogin
                  ? 'Sign In'
                  : 'Create My Account'}
              </span>
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <span
              style={{ color: '#10B981', fontWeight: 700, cursor: 'pointer' }}
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
              }}
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
