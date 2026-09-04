import React, { useState } from 'react';
import { X, ShieldCheck, CreditCard, Smartphone, Building, Wallet, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';

export default function JuspayModal({ order, onClose, onPaymentSuccess }) {
  const [selectedMethod, setSelectedMethod] = useState('upi');
  const [upiId, setUpiId] = useState('customer@okhdfcbank');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  if (!order) return null;

  const handleSimulatePayment = async (status) => {
    setProcessing(true);
    setError(null);

    try {
      const res = await api.simulatePayment(order.orderId, status, selectedMethod.toUpperCase());

      if (res.success && status === 'CHARGED') {
        // Trigger celebratory confetti
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });

        setTimeout(() => {
          setProcessing(false);
          onPaymentSuccess(order.orderId);
        }, 1200);
      } else {
        setProcessing(false);
        setError(`Payment ${status === 'CHARGED' ? 'failed' : 'was declined by Juspay sandbox (simulated)'}`);
      }
    } catch (err) {
      setProcessing(false);
      setError(err.message || 'Payment simulation error');
    }
  };

  return (
    <div className="modal-overlay" style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div className="juspay-box" onClick={(e) => e.stopPropagation()}>
        {/* Juspay Header */}
        <div className="juspay-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.3px' }}>
                juspay <span style={{ color: '#10B981' }}>ExpressCheckout</span>
              </span>
              <span className="juspay-badge">Sandbox</span>
            </div>
            <div style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '0.2rem' }}>
              Order ID: {order.orderId}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              padding: '0.2rem'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.25rem' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.85rem',
              background: 'var(--bg-subtle)',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.25rem'
            }}
          >
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Amount Payable</div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)' }}>
                ₹{order.totalAmount}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.78rem', color: '#059669', fontWeight: 700 }}>
                ● Instant 10-min Dispatch
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>QuickKart Dark Store</div>
            </div>
          </div>

          {error && (
            <div
              style={{
                background: '#FEF2F2',
                border: '1px solid #FCA5A5',
                color: '#B91C1C',
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.82rem',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Payment Method Selector */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.65rem', color: 'var(--text-muted)' }}>
              CHOOSE PAYMENT METHOD
            </div>

            {/* UPI Option */}
            <div
              className={`payment-method-card ${selectedMethod === 'upi' ? 'selected' : ''}`}
              onClick={() => setSelectedMethod('upi')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  style={{
                    background: '#EEF2FF',
                    color: '#4F46E5',
                    padding: '0.5rem',
                    borderRadius: 'var(--radius-sm)'
                  }}
                >
                  <Smartphone size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>UPI (Instant Autopay / QR)</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Google Pay, PhonePe, Paytm, CRED
                  </div>
                </div>
              </div>
              <input type="radio" checked={selectedMethod === 'upi'} readOnly />
            </div>

            {/* Card Option */}
            <div
              className={`payment-method-card ${selectedMethod === 'card' ? 'selected' : ''}`}
              onClick={() => setSelectedMethod('card')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  style={{
                    background: '#ECFDF5',
                    color: '#059669',
                    padding: '0.5rem',
                    borderRadius: 'var(--radius-sm)'
                  }}
                >
                  <CreditCard size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Credit / Debit Card</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Visa, MasterCard, RuPay (Sandbox Test Cards)
                  </div>
                </div>
              </div>
              <input type="radio" checked={selectedMethod === 'card'} readOnly />
            </div>

            {/* Net Banking */}
            <div
              className={`payment-method-card ${selectedMethod === 'netbanking' ? 'selected' : ''}`}
              onClick={() => setSelectedMethod('netbanking')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  style={{
                    background: '#FEF3C7',
                    color: '#D97706',
                    padding: '0.5rem',
                    borderRadius: 'var(--radius-sm)'
                  }}
                >
                  <Building size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Net Banking</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    HDFC, ICICI, SBI, Axis Bank
                  </div>
                </div>
              </div>
              <input type="radio" checked={selectedMethod === 'netbanking'} readOnly />
            </div>
          </div>

          {/* Method Specific Fields */}
          {selectedMethod === 'upi' && (
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Enter Virtual Payment Address (VPA / UPI ID)
              </label>
              <input
                type="text"
                className="search-input"
                style={{ paddingLeft: '1rem', borderRadius: 'var(--radius-md)' }}
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="e.g. yourname@okhdfcbank"
              />
            </div>
          )}

          {selectedMethod === 'card' && (
            <div
              style={{
                background: 'var(--bg-subtle)',
                padding: '0.85rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.25rem',
                fontSize: '0.78rem',
                color: 'var(--text-muted)'
              }}
            >
              <div style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.3rem' }}>
                Sandbox Test Card Prefilled:
              </div>
              <div>Card: <code>4111 2222 3333 4444</code> (Visa Test)</div>
              <div>Exp: <code>12/28</code> • CVV: <code>123</code></div>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <button
              className="btn-checkout"
              style={{ justifyContent: 'center', padding: '0.85rem' }}
              disabled={processing}
              onClick={() => handleSimulatePayment('CHARGED')}
            >
              {processing ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Loader2 className="animate-spin" size={18} />
                  <span>Authorizing with Juspay Gateway...</span>
                </div>
              ) : (
                <span>Pay ₹{order.totalAmount} Now (Simulate Success)</span>
              )}
            </button>

            <button
              style={{
                background: 'none',
                border: '1px solid #FCA5A5',
                color: '#DC2626',
                padding: '0.5rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.78rem',
                cursor: 'pointer',
                fontWeight: 600
              }}
              disabled={processing}
              onClick={() => handleSimulatePayment('JUSPAY_DECLINED')}
            >
              Simulate Payment Failure / Decline
            </button>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              fontSize: '0.72rem',
              color: 'var(--text-muted)',
              marginTop: '1rem'
            }}
          >
            <ShieldCheck size={14} color="#10B981" />
            <span>256-Bit Encrypted Payment Session • Juspay Technologies</span>
          </div>
        </div>
      </div>
    </div>
  );
}
