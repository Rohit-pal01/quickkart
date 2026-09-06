import React, { useState, useEffect } from 'react';
import { Package, Truck, CheckCircle2, Clock, MapPin, RefreshCw, XCircle, ArrowLeft, ShieldCheck, ShoppingBag, User, ChevronDown, History, Search } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function OrderTracking({ orderId, onBackToStore, onOpenAuth }) {
  const { user, isAuthenticated } = useAuth();
  const [order, setOrder] = useState(null);
  const [myOrders, setMyOrders] = useState([]);
  const [activeId, setActiveId] = useState(orderId || null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [isOrderMenuOpen, setIsOrderMenuOpen] = useState(false);
  const [orderSearchTerm, setOrderSearchTerm] = useState('');

  // Clear data when user logs out or account switches
  useEffect(() => {
    if (!isAuthenticated || !user) {
      setOrder(null);
      setMyOrders([]);
      setActiveId(null);
      setLoading(false);
    }
  }, [isAuthenticated, user?._id]);

  // Sync if orderId prop changes from parent
  useEffect(() => {
    if (orderId) {
      setActiveId(orderId);
    }
  }, [orderId]);

  const fetchOrder = async (targetId = null) => {
    if (!user) {
      setOrder(null);
      setMyOrders([]);
      setActiveId(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // 1. Fetch user's orders list
      let userOrders = [];
      const myOrdersRes = await api.getMyOrders();
      if (myOrdersRes.success && Array.isArray(myOrdersRes.orders)) {
        userOrders = myOrdersRes.orders;
        setMyOrders(userOrders);
      }

      // 2. Resolve which order to display (handle string targetId or click event)
      const requestedId = typeof targetId === 'string' ? targetId : activeId;
      const idToFetch = requestedId || (userOrders.length > 0 ? userOrders[0].orderId : null);

      if (idToFetch) {
        setActiveId(idToFetch);
        const res = await api.getOrderById(idToFetch);
        if (res.success && res.order) {
          setOrder(res.order);
        } else if (userOrders.length > 0 && idToFetch !== userOrders[0].orderId) {
          const fallbackRes = await api.getOrderById(userOrders[0].orderId);
          if (fallbackRes.success && fallbackRes.order) {
            setOrder(fallbackRes.order);
            setActiveId(userOrders[0].orderId);
          }
        } else {
          setOrder(null);
        }
      } else {
        setOrder(null);
      }
    } catch (err) {
      console.error('Error fetching order status:', err);
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchOrder(orderId || null);
    }
  }, [orderId, user?._id]);

  // Periodic polling for status transitions
  useEffect(() => {
    if (!activeId || !user) return;
    const interval = setInterval(async () => {
      try {
        const res = await api.getOrderById(activeId);
        if (res.success && res.order) {
          setOrder(res.order);
        }
      } catch (err) {}
    }, 6000);
    return () => clearInterval(interval);
  }, [activeId, user?._id]);

  const handleCancelOrder = async () => {
    if (!order) return;
    if (!window.confirm('Are you sure you want to cancel this order?')) return;

    setCancelling(true);
    try {
      const res = await api.cancelOrder(order._id);
      if (res.success) {
        setOrder(res.order);
      } else {
        alert(res.message || 'Failed to cancel order');
      }
    } catch (err) {
      alert('Error cancelling order');
    } finally {
      setCancelling(false);
    }
  };

  // If user is not logged in, prompt to log in instead of showing old order
  if (!isAuthenticated || !user) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1.5rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', maxWidth: '560px', margin: '2rem auto' }}>
        <ShoppingBag size={48} color="#10B981" style={{ margin: '0 auto 1rem auto' }} />
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Please Log In</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.5rem 0 1.5rem 0' }}>
          Please log in to view your orders and live delivery tracking.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
          <button className="btn-auth" onClick={onBackToStore}>
            Back to Store
          </button>
          {onOpenAuth && (
            <button className="btn-checkout" onClick={onOpenAuth} style={{ padding: '0.6rem 1.25rem' }}>
              Log In
            </button>
          )}
        </div>
      </div>
    );
  }

  if (loading && !order) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 1rem' }}>
        <RefreshCw className="animate-spin" size={32} color="#10B981" style={{ margin: '0 auto 1rem auto' }} />
        <h3>Locating order details...</h3>
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1.5rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', maxWidth: '560px', margin: '2rem auto' }}>
        {myOrders.length === 0 ? (
          <>
            <ShoppingBag size={48} color="#10B981" style={{ margin: '0 auto 1rem auto' }} />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>No Orders Placed Yet</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.5rem 0 1.5rem 0' }}>
              You haven't placed any orders yet. Fresh groceries and essentials will appear here once you order!
            </p>
            <button className="btn-checkout" onClick={onBackToStore} style={{ margin: '0 auto', justifyContent: 'center' }}>
              Browse Store & Shop
            </button>
          </>
        ) : (
          <>
            <XCircle size={44} color="#EF4444" style={{ margin: '0 auto 1rem auto' }} />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Order Not Found</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.5rem 0 1.5rem 0' }}>
              We couldn't locate this specific order details.
            </p>
            <button className="btn-auth" onClick={onBackToStore} style={{ margin: '0 auto' }}>
              Back to Store
            </button>
          </>
        )}
      </div>
    );
  }

  const steps = [
    { key: 'CONFIRMED', label: 'Order Placed', icon: Clock },
    { key: 'PACKED', label: 'Order Packed', icon: Package },
    { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: Truck },
    { key: 'DELIVERED', label: 'Delivered', icon: CheckCircle2 }
  ];

  const statusPriority = {
    'PENDING_PAYMENT': 0,
    'CONFIRMED': 1,
    'PACKED': 2,
    'OUT_FOR_DELIVERY': 3,
    'DELIVERED': 4,
    'CANCELLED': -1
  };

  const currentLevel = statusPriority[order.status] || 0;
  const isCancelled = order.status === 'CANCELLED';

  return (
    <div style={{ maxWidth: '780px', margin: '0 auto', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <button
          onClick={onBackToStore}
          className="btn-auth"
        >
          <ArrowLeft size={16} />
          <span>Continue Shopping</span>
        </button>

        {myOrders.length > 0 && (
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            {myOrders.length} {myOrders.length === 1 ? 'Order' : 'Orders'} on Record
          </span>
        )}
      </div>

      {/* Professional Order History Bar & Dropdown Selector */}
      {myOrders.length > 1 && (
        <div
          style={{
            position: 'relative',
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-light)',
            padding: '0.85rem 1.25rem',
            marginBottom: '1rem',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                background: '#ECFDF5',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <History size={17} />
            </div>
            <div>
              <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Order History ({myOrders.length} Total)
              </div>
              <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.1rem' }}>
                Viewing #{order?.orderId} • ₹{order?.totalAmount}
              </div>
            </div>
          </div>

          {/* Switch Order Dropdown Trigger Button */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setIsOrderMenuOpen(!isOrderMenuOpen)}
              style={{
                background: isOrderMenuOpen ? 'var(--bg-subtle)' : 'var(--bg-card)',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-md)',
                padding: '0.5rem 0.95rem',
                fontSize: '0.82rem',
                fontWeight: 700,
                color: 'var(--text-main)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: isOrderMenuOpen ? 'none' : '0 1px 3px rgba(0,0,0,0.05)'
              }}
            >
              <History size={14} color="#10B981" />
              <span>Switch Order ({myOrders.length})</span>
              <ChevronDown
                size={15}
                style={{
                  transform: isOrderMenuOpen ? 'rotate(180deg)' : 'none',
                  transition: 'transform 0.2s ease',
                  color: 'var(--text-muted)'
                }}
              />
            </button>

            {/* Dropdown Menu Popup */}
            {isOrderMenuOpen && (
              <>
                <div
                  style={{ position: 'fixed', inset: 0, zIndex: 90 }}
                  onClick={() => setIsOrderMenuOpen(false)}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 6px)',
                    right: 0,
                    width: '350px',
                    maxWidth: '90vw',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-light)',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: '0 14px 36px rgba(0,0,0,0.18)',
                    zIndex: 100,
                    overflow: 'hidden',
                    animation: 'fadeIn 0.15s ease'
                  }}
                >
                  <div style={{ padding: '0.75rem', borderBottom: '1px solid var(--border-light)', background: 'var(--bg-subtle)' }}>
                    <div style={{ position: 'relative' }}>
                      <Search size={14} style={{ position: 'absolute', left: '0.65rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input
                        type="text"
                        placeholder="Search by order ID..."
                        value={orderSearchTerm}
                        onChange={(e) => setOrderSearchTerm(e.target.value)}
                        className="search-input"
                        style={{
                          width: '100%',
                          paddingLeft: '2rem',
                          paddingRight: '0.65rem',
                          height: '32px',
                          fontSize: '0.8rem',
                          borderRadius: 'var(--radius-sm)',
                          background: 'var(--bg-card)'
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ maxHeight: '290px', overflowY: 'auto', padding: '0.35rem' }}>
                    {myOrders
                      .filter(o => !orderSearchTerm || o.orderId.toLowerCase().includes(orderSearchTerm.toLowerCase()))
                      .map((o) => {
                        const isSelected = order && order.orderId === o.orderId;
                        const isDelivered = o.status === 'DELIVERED';
                        const isCancelled = o.status === 'CANCELLED';

                        return (
                          <div
                            key={o._id || o.orderId}
                            onClick={() => {
                              setActiveId(o.orderId);
                              setOrder(o);
                              setIsOrderMenuOpen(false);
                            }}
                            style={{
                              padding: '0.65rem 0.8rem',
                              borderRadius: 'var(--radius-md)',
                              background: isSelected ? 'rgba(16, 185, 129, 0.08)' : 'transparent',
                              border: isSelected ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid transparent',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              marginBottom: '0.2rem',
                              transition: 'all 0.12s ease'
                            }}
                            onMouseEnter={(e) => {
                              if (!isSelected) e.currentTarget.style.background = 'var(--bg-subtle)';
                            }}
                            onMouseLeave={(e) => {
                              if (!isSelected) e.currentTarget.style.background = 'transparent';
                            }}
                          >
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <span style={{ fontWeight: 800, fontSize: '0.86rem', color: isSelected ? '#059669' : 'var(--text-main)' }}>
                                  #{o.orderId}
                                </span>
                                <span
                                  style={{
                                    fontSize: '0.68rem',
                                    fontWeight: 700,
                                    padding: '0.12rem 0.45rem',
                                    borderRadius: '9999px',
                                    background: isCancelled ? '#FEE2E2' : isDelivered ? '#ECFDF5' : '#FEF3C7',
                                    color: isCancelled ? '#B91C1C' : isDelivered ? '#047857' : '#B45309'
                                  }}
                                >
                                  {o.status}
                                </span>
                              </div>
                              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                                {o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                }) : 'Recent'} • ₹{o.totalAmount}
                              </div>
                            </div>

                            {isSelected && (
                              <CheckCircle2 size={16} color="#10B981" />
                            )}
                          </div>
                        );
                      })}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Header Card */}
      <div
        style={{
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-light)',
          padding: '1.5rem',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Order #{order.orderId}</h1>
            <span
              style={{
                fontSize: '0.78rem',
                fontWeight: 700,
                padding: '0.2rem 0.6rem',
                borderRadius: 'var(--radius-full)',
                background: isCancelled ? '#FEE2E2' : '#ECFDF5',
                color: isCancelled ? '#B91C1C' : '#047857'
              }}
            >
              {order.status}
            </span>
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Placed on {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • QuickKart Express
          </div>
        </div>

        <button
          onClick={fetchOrder}
          className="btn-auth"
          title="Refresh live status"
          style={{ padding: '0.5rem 0.85rem' }}
        >
          <RefreshCw size={15} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Progress Timeline Card */}
      {!isCancelled ? (
        <div className="timeline-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#065F46' }}>
                ⚡ Arriving in {order.status === 'DELIVERED' ? '0' : order.status === 'OUT_FOR_DELIVERY' ? '4' : '10'} minutes
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Rider dispatched from HSR Layout Dark Store
              </div>
            </div>
            <div
              style={{
                background: '#FEF3C7',
                color: '#B45309',
                padding: '0.35rem 0.8rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.8rem',
                fontWeight: 800
              }}
            >
              SUPERFAST
            </div>
          </div>

          <div className="timeline-steps">
            {steps.map((step, idx) => {
              const stepLevel = idx + 1;
              const isCompleted = currentLevel >= stepLevel;
              const isCurrent = currentLevel === stepLevel;
              const Icon = step.icon;

              return (
                <div
                  key={step.key}
                  className={`step-node ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}
                >
                  <div className="step-icon-circle">
                    <Icon size={20} />
                  </div>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700 }}>{step.label}</span>
                </div>
              );
            })}
          </div>

          {/* Delivery Address Details */}
          <div
            style={{
              background: 'var(--bg-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}
          >
            <MapPin size={22} color="#10B981" />
            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                Delivering to
              </div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700 }}>
                {order.deliveryAddress?.line1}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div
          style={{
            background: '#FEF2F2',
            border: '1px solid #FCA5A5',
            borderRadius: 'var(--radius-lg)',
            padding: '1.5rem',
            marginTop: '1.5rem',
            textAlign: 'center'
          }}
        >
          <XCircle size={36} color="#DC2626" style={{ margin: '0 auto 0.5rem auto' }} />
          <h3 style={{ color: '#991B1B', fontWeight: 800 }}>This order was cancelled</h3>
          <p style={{ fontSize: '0.85rem', color: '#B91C1C', marginTop: '0.25rem' }}>
            Any amount paid via Juspay has been initiated for refund back to your original source.
          </p>
        </div>
      )}

      {/* Items Summary & Payment Breakdown */}
      <div
        style={{
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-light)',
          padding: '1.5rem',
          marginTop: '1.5rem'
        }}
      >
        <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1rem' }}>
          Items in this Order ({order.items?.length || 0})
        </h3>

        <div style={{ marginBottom: '1rem' }}>
          {(order.items || []).map((item, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '0.65rem 0',
                borderBottom: '1px solid var(--border-light)',
                fontSize: '0.88rem'
              }}
            >
              <div>
                <span style={{ fontWeight: 700 }}>{item.qty}x</span> {item.name}
              </div>
              <div style={{ fontWeight: 700 }}>₹{item.price * item.qty}</div>
            </div>
          ))}
        </div>

        {/* Bill calculation */}
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
            <span>Items Subtotal</span>
            <span>₹{order.subtotal}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
            <span>Delivery Partner Fee</span>
            <span>{order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee}`}</span>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '1.05rem',
              fontWeight: 800,
              color: 'var(--text-main)',
              marginTop: '0.5rem',
              paddingTop: '0.5rem',
              borderTop: '1px dashed var(--border-light)'
            }}
          >
            <span>Total Paid</span>
            <span>₹{order.totalAmount}</span>
          </div>
        </div>

        {/* Juspay Payment Badge */}
        <div
          style={{
            marginTop: '1.25rem',
            background: '#ECFDF5',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={18} color="#059669" />
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#065F46' }}>
              Juspay ExpressCheckout Verified
            </span>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#047857' }}>
            {order.paymentId ? `Status: ${order.paymentId.status || 'CHARGED'}` : 'Payment Verified'}
          </span>
        </div>

        {/* Cancellation Option */}
        {!isCancelled && ['PENDING_PAYMENT', 'CONFIRMED', 'PACKED'].includes(order.status) && (
          <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
            <button
              onClick={handleCancelOrder}
              disabled={cancelling}
              style={{
                background: 'none',
                border: '1px solid #FCA5A5',
                color: '#DC2626',
                padding: '0.5rem 1rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {cancelling ? 'Cancelling...' : 'Cancel Order'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
