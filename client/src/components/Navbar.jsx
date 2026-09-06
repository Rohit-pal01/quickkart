import React, { useState, useRef, useEffect } from 'react';
import { Zap, ShoppingCart, Search, User, MapPin, Shield, LogOut, ChevronDown, Sun, Moon, Package } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';

export default function Navbar({
  searchTerm,
  setSearchTerm,
  onOpenAuth,
  onOpenLocation,
  activeView,
  setActiveView
}) {
  const { user, isAuthenticated, logout, activeAddress } = useAuth();
  const { itemCount, totalAmount, setIsCartOpen } = useCart();
  const { theme, toggleTheme, isDark } = useTheme();

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    };
    if (isProfileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isProfileMenuOpen]);

  const handleLogout = () => {
    setIsProfileMenuOpen(false);
    logout();
    setActiveView('store');
  };

  return (
    <header className="navbar">
      {/* Top Bar: Brand & Actions (Desktop Single Row / Mobile Tier 1) */}
      <div className="navbar-top-bar">
        {/* Brand Logo */}
        <div
          className="logo"
          style={{ cursor: 'pointer' }}
          onClick={() => setActiveView('store')}
          title="QuickKart Home"
        >
          <div className="logo-badge">
            <Zap size={18} fill="#F7D000" color="#F7D000" />
          </div>
          <span className="logo-brand-text">
            Quick<strong style={{ color: '#0C831F' }}>Kart</strong>
          </span>
        </div>

        {/* Desktop-Only Center Search Bar */}
        {activeView === 'store' && (
          <div className="search-wrapper desktop-only">
            <Search className="search-icon" size={17} />
            <input
              type="text"
              className="search-input"
              placeholder='Search "milk", "chips", "maggi", "amul butter", "curd"...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        )}

        {/* Navigation Actions */}
        <div className="nav-actions">
          {/* Dark / Light Mode Toggle */}
          <button
            className="theme-toggle-btn"
            onClick={toggleTheme}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun size={17} color="#FBBF24" /> : <Moon size={17} color="#64748B" />}
          </button>

          {isAuthenticated && user?.role === 'admin' && (
            <button
              className="btn-auth nav-admin-btn desktop-only"
              style={{
                borderColor: activeView === 'admin' ? '#0C831F' : undefined,
                background: activeView === 'admin' ? 'var(--primary-light)' : 'var(--bg-card)',
                color: activeView === 'admin' ? '#0C831F' : undefined
              }}
              onClick={() => setActiveView(activeView === 'admin' ? 'store' : 'admin')}
            >
              <Shield size={16} color="#0C831F" />
              <span className="nav-admin-label-full">Dark Store Hub</span>
              <span className="nav-admin-label-short">Hub</span>
            </button>
          )}

          {isAuthenticated ? (
            <div className="user-profile-menu-container" ref={profileMenuRef}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <button
                  className="btn-auth btn-profile"
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  style={{
                    background: activeView === 'orders' || isProfileMenuOpen ? 'var(--primary-light)' : 'var(--bg-card)',
                    borderColor: activeView === 'orders' || isProfileMenuOpen ? '#0C831F' : undefined
                  }}
                  aria-label="User Account Menu"
                >
                  <User size={15} />
                  <span className="user-nav-name">{user.name.split(' ')[0]}</span>
                  <ChevronDown
                    size={12}
                    style={{
                      transition: 'transform 0.2s ease',
                      transform: isProfileMenuOpen ? 'rotate(180deg)' : 'rotate(0)'
                    }}
                  />
                </button>
                <button
                  className="btn-auth nav-quick-logout-btn"
                  onClick={handleLogout}
                  title="Logout"
                  style={{ padding: '0.45rem', color: '#EF4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                >
                  <LogOut size={15} color="#EF4444" />
                </button>
              </div>

              {/* Professional User Dropdown Menu */}
              {isProfileMenuOpen && (
                <div className="user-profile-dropdown">
                  <div className="profile-dropdown-header">
                    <div className="profile-avatar-circle">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="profile-user-info">
                      <div className="profile-user-name">{user.name}</div>
                      <div className="profile-user-email">{user.email || user.phone || 'Customer Account'}</div>
                      {user.role === 'admin' && (
                        <span className="profile-admin-badge">Admin</span>
                      )}
                    </div>
                  </div>

                  <div className="profile-dropdown-divider" />

                  <button
                    className={`profile-dropdown-item ${activeView === 'orders' ? 'active' : ''}`}
                    onClick={() => {
                      setActiveView('orders');
                      setIsProfileMenuOpen(false);
                    }}
                  >
                    <Package size={16} color="#0C831F" />
                    <span>My Orders & Tracking</span>
                  </button>

                  <button
                    className="profile-dropdown-item"
                    onClick={() => {
                      onOpenLocation();
                      setIsProfileMenuOpen(false);
                    }}
                  >
                    <MapPin size={16} color="#0284C7" />
                    <span>Delivery Addresses</span>
                  </button>

                  {user.role === 'admin' && (
                    <button
                      className={`profile-dropdown-item ${activeView === 'admin' ? 'active' : ''}`}
                      onClick={() => {
                        setActiveView(activeView === 'admin' ? 'store' : 'admin');
                        setIsProfileMenuOpen(false);
                      }}
                    >
                      <Shield size={16} color="#0C831F" />
                      <span>Dark Store Hub</span>
                    </button>
                  )}
                  <div className="profile-dropdown-divider" />

                  <button
                    className="profile-dropdown-item logout"
                    onClick={handleLogout}
                  >
                    <LogOut size={16} color="#EF4444" />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button className="btn-auth" onClick={onOpenAuth}>
              <User size={15} />
              <span>Login</span>
            </button>
          )}

          {/* Cart Button */}
          <button
            className="cart-btn"
            onClick={() => setIsCartOpen(true)}
            aria-label="View Shopping Cart"
            title="View Shopping Cart"
          >
            <div className="cart-icon-wrapper">
              <ShoppingCart size={17} />
              {itemCount > 0 && <span className="cart-badge-dot">{itemCount}</span>}
            </div>
            <span className="cart-label-desktop">
              {itemCount > 0 ? `${itemCount} items • ₹${totalAmount}` : 'Cart'}
            </span>
            <span className="cart-label-mobile">
              {itemCount > 0 ? `₹${totalAmount}` : 'Cart'}
            </span>
          </button>
        </div>
      </div>

      {/* Search Bar (Row 2 on Mobile) */}
      {activeView === 'store' && (
        <div className="search-wrapper mobile-only-search">
          <Search className="search-icon" size={16} />
          <input
            type="text"
            className="search-input"
            placeholder='Search "milk", "chips", "maggi", "amul butter", "curd"...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      )}
    </header>
  );
}

