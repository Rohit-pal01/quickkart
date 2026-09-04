import React, { useState } from 'react';
import { Zap, ShoppingCart, Search, User, MapPin, Shield, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar({
  searchTerm,
  setSearchTerm,
  onOpenAuth,
  onOpenAdmin,
  activeView,
  setActiveView
}) {
  const { user, isAuthenticated, logout, activeAddress } = useAuth();
  const { itemCount, totalAmount, setIsCartOpen } = useCart();
  const [showAddressDropdown, setShowAddressDropdown] = useState(false);

  return (
    <header className="navbar">
      {/* Brand & Delivery Pill */}
      <div className="brand-section">
        <div
          className="logo"
          style={{ cursor: 'pointer' }}
          onClick={() => setActiveView('store')}
        >
          <div className="logo-badge">
            <Zap size={18} fill="white" />
          </div>
          <span>Quick<strong style={{ color: '#10B981' }}>Kart</strong></span>
        </div>

        <div className="delivery-pill">
          <Zap size={14} fill="#F59E0B" color="#F59E0B" />
          <span>10 MINS</span>
        </div>

        <div
          className="address-trigger"
          title={activeAddress ? activeAddress.line1 : 'Select delivery location'}
        >
          <MapPin size={15} color="#10B981" />
          <span>{activeAddress ? activeAddress.line1.slice(0, 20) + '...' : 'Bengaluru Central'}</span>
        </div>
      </div>

      {/* Live Search */}
      {activeView === 'store' && (
        <div className="search-wrapper">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            className="search-input"
            placeholder='Search "milk", "fresh apples", "chips", "maggi"...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      )}

      {/* Navigation & Cart Actions */}
      <div className="nav-actions">
        {isAuthenticated && user?.role === 'admin' && (
          <button
            className="btn-auth"
            style={{
              borderColor: activeView === 'admin' ? '#10B981' : undefined,
              background: activeView === 'admin' ? '#ECFDF5' : 'white'
            }}
            onClick={() => setActiveView(activeView === 'admin' ? 'store' : 'admin')}
          >
            <Shield size={16} color="#10B981" />
            <span>Admin Hub</span>
          </button>
        )}

        {isAuthenticated ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              className="btn-auth"
              onClick={() => setActiveView('orders')}
              style={{
                background: activeView === 'orders' ? '#ECFDF5' : 'white',
                borderColor: activeView === 'orders' ? '#10B981' : undefined
              }}
            >
              <User size={16} />
              <span>{user.name.split(' ')[0]}</span>
            </button>
            <button
              className="btn-auth"
              onClick={logout}
              title="Logout"
              style={{ padding: '0.55rem' }}
            >
              <LogOut size={16} color="#EF4444" />
            </button>
          </div>
        ) : (
          <button className="btn-auth" onClick={onOpenAuth}>
            <User size={16} />
            <span>Login</span>
          </button>
        )}

        {/* View Cart Button */}
        <button className="cart-btn" onClick={() => setIsCartOpen(true)}>
          <ShoppingCart size={18} />
          <span>
            {itemCount > 0 ? `${itemCount} items • ₹${totalAmount}` : 'My Cart'}
          </span>
        </button>
      </div>
    </header>
  );
}
