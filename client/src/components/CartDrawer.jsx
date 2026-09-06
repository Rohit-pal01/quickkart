import React from 'react';
import { X, Trash2, Plus, Minus, ArrowRight, ShieldCheck, Clock, MapPin, Bike, CheckCircle2, Zap } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function CartDrawer({ onProceedToPayment, onOpenAuth }) {
  const {
    items,
    updateQty,
    clearCart,
    subtotal,
    deliveryFee,
    handlingFee,
    totalAmount,
    isCartOpen,
    setIsCartOpen
  } = useCart();
  const { isAuthenticated, activeAddress } = useAuth();

  if (!isCartOpen) return null;

  const handleCheckout = () => {
    if (!isAuthenticated) {
      onOpenAuth();
      return;
    }
    onProceedToPayment();
  };

  return (
    <div className="modal-overlay" onClick={() => setIsCartOpen(false)}>
      <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className="drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800 }}>My Cart</h2>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              ({items.length} {items.length === 1 ? 'item' : 'items'})
            </span>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.3rem' }}
          >
            <X size={20} color="var(--text-muted)" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="drawer-body">
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <div
                style={{
                  width: '70px',
                  height: '70px',
                  background: 'var(--bg-subtle)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem auto'
                }}
              >
                🛒
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                Your cart is empty
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                Add your favorite groceries and daily essentials in seconds!
              </p>
              <button
                className="btn-add"
                style={{ padding: '0.6rem 1.5rem', background: '#10B981', color: 'white' }}
                onClick={() => setIsCartOpen(false)}
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <>
              {/* Dynamic Free Delivery Progress Tracker */}
              <div
                style={{
                  background: subtotal >= 199 ? 'var(--primary-light)' : 'rgba(81, 226, 245, 0.12)',
                  border: subtotal >= 199 ? '1px solid var(--border-focus)' : '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.75rem 0.9rem',
                  marginBottom: '0.85rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    {subtotal >= 199 ? (
                      <CheckCircle2 size={16} color="var(--border-focus)" />
                    ) : (
                      <Bike size={16} color="var(--border-focus)" />
                    )}
                    <span style={{ fontSize: '0.82rem', fontWeight: 800, color: subtotal >= 199 ? 'var(--border-focus)' : 'var(--text-main)' }}>
                      {subtotal >= 199
                        ? 'FREE Delivery Unlocked!'
                        : `Add items worth ₹${199 - subtotal} more for FREE Delivery`}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: subtotal >= 199 ? 'var(--border-focus)' : 'var(--text-muted)' }}>
                    {subtotal >= 199 ? 'Saved ₹25' : `₹${subtotal} / ₹199`}
                  </span>
                </div>
                <div style={{ width: '100%', height: '6px', background: '#E2E8F0', borderRadius: '999px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${Math.min(100, Math.round((subtotal / 199) * 100))}%`,
                      height: '100%',
                      background: subtotal >= 199
                        ? 'linear-gradient(90deg, #10B981, #059669)'
                        : 'linear-gradient(90deg, var(--bright-blue), var(--blue-green))',
                      borderRadius: '999px',
                      transition: 'width 0.3s ease'
                    }}
                  />
                </div>
              </div>

              {/* Delivery ETA banner */}
              <div
                style={{
                  background: '#ECFDF5',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  marginBottom: '1rem'
                }}
              >
                <Clock size={18} color="#059669" />
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#065F46' }}>
                    Delivery in 10-15 minutes
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#047857' }}>
                    Shipment will be dispatched from your nearest dark store
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div>
                {items.map(({ product, qty }) => (
                  <div key={product._id} className="cart-item-row">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="cart-item-img"
                    />
                    <div className="cart-item-details">
                      <div
                        style={{
                          fontSize: '0.88rem',
                          fontWeight: 700,
                          lineHeight: 1.3,
                          marginBottom: '0.2rem'
                        }}
                      >
                        {product.name}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {product.unit} • ₹{product.price}
                      </div>
                    </div>

                    <div className="qty-counter">
                      <button
                        className="qty-btn"
                        onClick={() => updateQty(product._id, qty - 1)}
                      >
                        <Minus size={13} />
                      </button>
                      <span className="qty-val">{qty}</span>
                      <button
                        className="qty-btn"
                        onClick={() => updateQty(product._id, qty + 1)}
                        disabled={qty >= product.stock}
                      >
                        <Plus size={13} />
                      </button>
                    </div>

                    <div
                      style={{
                        minWidth: '55px',
                        textAlign: 'right',
                        fontWeight: 800,
                        fontSize: '0.92rem'
                      }}
                    >
                      ₹{product.price * qty}
                    </div>
                  </div>
                ))}
              </div>

              {/* Delivery Address Pill */}
              <div
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.85rem',
                  marginTop: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}
              >
                <MapPin size={20} color="#10B981" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Delivering to {activeAddress ? activeAddress.label : 'Default Location'}
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                    {activeAddress ? activeAddress.line1 : 'Sector 62, Indiranagar, Bengaluru'}
                  </div>
                </div>
              </div>

              {/* Bill Details */}
              <div className="bill-card">
                <div
                  style={{
                    fontSize: '0.88rem',
                    fontWeight: 800,
                    marginBottom: '0.85rem',
                    color: 'var(--text-main)'
                  }}
                >
                  Bill Details
                </div>
                <div className="bill-row">
                  <span>Items Total</span>
                  <span>₹{subtotal}</span>
                </div>
                <div className="bill-row">
                  <span>Delivery Partner Fee</span>
                  <span>
                    {deliveryFee === 0 ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                        <span style={{ textDecoration: 'line-through', color: 'var(--text-subtle)', fontSize: '0.8rem' }}>₹25</span>
                        <strong style={{ color: '#059669', fontWeight: 800 }}>FREE</strong>
                      </span>
                    ) : (
                      `₹${deliveryFee}`
                    )}
                  </span>
                </div>
                <div className="bill-row">
                  <span>Handling Charges</span>
                  <span>₹{handlingFee}</span>
                </div>
                {subtotal < 199 ? (
                  <div
                    style={{
                      fontSize: '0.74rem',
                      color: '#065F46',
                      background: 'rgba(157, 249, 239, 0.22)',
                      border: '1px solid var(--blue-green)',
                      padding: '0.4rem 0.65rem',
                      borderRadius: 'var(--radius-sm)',
                      marginBottom: '0.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem'
                    }}
                  >
                    <Zap size={12} fill="#065F46" color="#065F46" />
                    <span>
                      Add items worth <strong>₹{199 - subtotal}</strong> more to unlock <strong>FREE DELIVERY</strong>!
                    </span>
                  </div>
                ) : (
                  <div
                    style={{
                      fontSize: '0.74rem',
                      color: '#065F46',
                      background: '#ECFDF5',
                      border: '1px solid #A7F3D0',
                      padding: '0.4rem 0.65rem',
                      borderRadius: 'var(--radius-sm)',
                      marginBottom: '0.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem'
                    }}
                  >
                    <CheckCircle2 size={13} color="#059669" />
                    <span>
                      <strong>Yay! You saved ₹25</strong> on delivery partner fee!
                    </span>
                  </div>
                )}
                <div className="bill-row total">
                  <span>To Pay</span>
                  <span>₹{totalAmount}</span>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                  marginTop: '1rem',
                  justifyContent: 'center'
                }}
              >
                <ShieldCheck size={16} color="#10B981" />
                <span>Secured by Juspay ExpressCheckout • PCI-DSS Compliant</span>
              </div>
            </>
          )}
        </div>

        {/* Drawer Footer with Checkout Button */}
        {items.length > 0 && (
          <div className="drawer-footer">
            <button className="btn-checkout" onClick={handleCheckout}>
              <div>
                <div style={{ fontSize: '0.78rem', opacity: 0.9 }}>TOTAL</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>₹{totalAmount}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>{isAuthenticated ? 'PROCEED TO PAY' : 'LOGIN TO ORDER'}</span>
                <ArrowRight size={18} />
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
