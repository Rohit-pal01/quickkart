import React from 'react';
import { Zap, ShoppingCart, Search, User, MapPin, Shield, LogOut, ChevronDown, Sun, Moon } from 'lucide-react';
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
  const handleLogout = () => {
    logout();
    setActiveView('store');
  };

  return (
    <header className="navbar">
      {/* Top Bar: Brand & Actions */}
      <div className="navbar-top-bar">
        {/* Brand & Location Indicator */}
        <div className="brand-section">
          <div
            className="logo"
            style={{ cursor: 'pointer' }}
            onClick={() => setActiveView('store')}
          >
            <div className="logo-badge">
              <Zap size={18} fill="#F7D000" color="#F7D000" />
            </div>
            <span>
              Quick<strong style={{ color: '#0C831F' }}>Kart</strong>
            </span>
          </div>

          {/* Blinkit/Zepto Delivery ETA pill with Clickable Location Modal */}
          <div
            className="delivery-eta-badge"
            onClick={onOpenLocation}
            style={{ cursor: 'pointer', transition: 'var(--transition)' }}
            title="Click to change your delivery city or address"
          >
            <div className="eta-time">
              <Zap size={12} fill="#0C831F" color="#0C831F" />
              <span>8 MINS</span>
            </div>
            <div
              className="address-line"
              style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}
            >
              <span>{activeAddress ? activeAddress.line1 : 'Select City'}</span>
              <ChevronDown size={13} color="var(--text-muted)" />
            </div>
          </div>
        </div>

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
              className="btn-auth"
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <button
                className="btn-auth"
                onClick={() => setActiveView('orders')}
                style={{
                  background: activeView === 'orders' ? 'var(--primary-light)' : 'var(--bg-card)',
                  borderColor: activeView === 'orders' ? '#0C831F' : undefined
                }}
              >
                <User size={15} />
                <span>{user.name.split(' ')[0]}</span>
              </button>
              <button
                className="btn-auth"
                onClick={handleLogout}
                title="Logout"
                style={{ padding: '0.55rem' }}
              >
                <LogOut size={15} color="#EF4444" />
              </button>
            </div>
          ) : (
            <button className="btn-auth" onClick={onOpenAuth}>
              <User size={15} />
              <span>Login</span>
            </button>
          )}

          {/* Cart Button (Visible on Desktop & Mobile) */}
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
              {itemCount > 0 ? `${itemCount} items • ₹${totalAmount}` : 'My Cart'}
            </span>
            <span className="cart-label-mobile">
              {itemCount > 0 ? `₹${totalAmount}` : 'My Cart'}
            </span>
          </button>
        </div>
      </div>

      {/* Instant Search Bar (Row 2 on Mobile/Tablet) */}
      {activeView === 'store' && (
        <div className="search-wrapper">
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
    </header>
  );
}

