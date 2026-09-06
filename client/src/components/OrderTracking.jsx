import React, { useState, useEffect } from 'react';
import { Package, Truck, CheckCircle2, Clock, MapPin, RefreshCw, XCircle, ArrowLeft, ShieldCheck, ShoppingBag } from 'lucide-react';
import { api } from '../services/api';

export default function OrderTracking({ orderId, onBackToStore }) {
  const [order, setOrder] = useState(null);
  const [myOrders, setMyOrders] = useState([]);
  const [activeId, setActiveId] = useState(orderId || null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  // Sync if orderId prop changes from parent
  useEffect(() => {
    if (orderId) {
      setActiveId(orderId);
    }
  }, [orderId]);

  const loadData = async (targetId) => {
    setLoading(true);
    try {
      // 1. Fetch user's orders list
      let userOrders = [];
      const myOrdersRes = await api.getMyOrders();
      if (myOrdersRes.success && Array.isArray(myOrdersRes.orders)) {
        userOrders = myOrdersRes.orders;
        setMyOrders(userOrders);
      }

      // 2. Resolve which order to display
      const idToFetch = targetId || (userOrders.length > 0 ? userOrders[0].orderId : null);

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

  const fetchOrder = () => {
    if (activeId) {
      loadData(activeId);
    } else {
      loadData(null);
    }
  };

  useEffect(() => {
    loadData(orderId || null);
  }, [orderId]);

  // Periodic polling for status transitions
  useEffect(() => {
    if (!activeId) return;
    const interval = setInterval(async () => {
      try {
        const res = await api.getOrderById(activeId);
        if (res.success && res.order) {
          setOrder(res.order);
        }
      } catch (err) {}
    }, 6000);
    return () => clearInterval(interval);
  }, [activeId]);

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

      {/* My Orders History Switcher */}
      {myOrders.length > 1 && (
        <div
          style={{
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-light)',
            padding: '0.75rem 1.25rem',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem'
          }}
        >
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)' }}>
            Switch Order:
          </span>

          <div style={{ display: 'flex', gap: '0.45rem', overflowX: 'auto', maxWidth: '100%', paddingBottom: '0.2rem' }}>
            {myOrders.map((o) => {
              const isSelected = order && order.orderId === o.orderId;
              return (
                <button
                  key={o._id}
                  onClick={() => {
                    setActiveId(o.orderId);
                    setOrder(o);
                  }}
                  style={{
                    padding: '0.35rem 0.75rem',
                    fontSize: '0.75rem',
                    fontWeight: isSelected ? 800 : 600,
                    borderRadius: 'var(--radius-full)',
                    background: isSelected ? '#10B981' : 'var(--bg-subtle)',
                    color: isSelected ? '#FFFFFF' : 'var(--text-main)',
                    border: isSelected ? '1px solid #059669' : '1px solid var(--border-light)',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'var(--transition)'
                  }}
                >
                  #{o.orderId} • ₹{o.totalAmount}
                </button>
              );
            })}
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
