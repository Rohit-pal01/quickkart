import React from 'react';
import { Zap, ShoppingCart, Search, User, MapPin, Shield, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar({
  searchTerm,
  setSearchTerm,
  onOpenAuth,
  activeView,
  setActiveView
}) {
  const { user, isAuthenticated, logout, activeAddress } = useAuth();
  const { itemCount, totalAmount, setIsCartOpen } = useCart();

  return (
    <header className="navbar">
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

        {/* Blinkit/Zepto Delivery ETA pill */}
        <div className="delivery-eta-badge">
          <div className="eta-time">
            <Zap size={12} fill="#0C831F" color="#0C831F" />
            <span>8 MINS</span>
          </div>
          <div
            className="address-line"
            title={activeAddress ? activeAddress.line1 : 'Bengaluru Central'}
          >
            {activeAddress ? activeAddress.line1 : 'Bengaluru Central'}
          </div>
        </div>
      </div>

      {/* Instant Search Bar */}
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

      {/* Navigation Actions */}
      <div className="nav-actions">
        {isAuthenticated && user?.role === 'admin' && (
          <button
            className="btn-auth"
            style={{
              borderColor: activeView === 'admin' ? '#0C831F' : undefined,
              background: activeView === 'admin' ? '#E8F5E9' : 'white',
              color: activeView === 'admin' ? '#0C831F' : undefined
            }}
            onClick={() => setActiveView(activeView === 'admin' ? 'store' : 'admin')}
          >
            <Shield size={16} color="#0C831F" />
            <span>Dark Store Hub</span>
          </button>
        )}

        {isAuthenticated ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <button
              className="btn-auth"
              onClick={() => setActiveView('orders')}
              style={{
                background: activeView === 'orders' ? '#E8F5E9' : 'white',
                borderColor: activeView === 'orders' ? '#0C831F' : undefined
              }}
            >
              <User size={15} />
              <span>{user.name.split(' ')[0]}</span>
            </button>
            <button
              className="btn-auth"
              onClick={logout}
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

        {/* Desktop Cart Button */}
        <button className="cart-btn-desktop" onClick={() => setIsCartOpen(true)}>
          <ShoppingCart size={18} />
          <span>
            {itemCount > 0 ? `${itemCount} items • ₹${totalAmount}` : 'My Cart'}
          </span>
        </button>
      </div>
    </header>
  );
}
