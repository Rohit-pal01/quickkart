import React, { useEffect } from 'react';
import { X, Zap, Plus, Minus, ShieldCheck, ShoppingBag, RotateCcw, CheckCircle2, Award } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function ProductDetailModal({ product, isOpen, onClose }) {
  const { getItemQty, addToCart, updateQty } = useCart();

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !product) return null;

  const currentQty = getItemQty(product._id);
  const isOutOfStock = product.stock <= 0;
  const hasDiscount = product.mrp && product.mrp > product.price;
  const mrp = hasDiscount ? product.mrp : null;
  const discountPercent = hasDiscount ? Math.round(((mrp - product.price) / mrp) * 100) : 0;
  const savings = hasDiscount ? mrp - product.price : 0;

  return (
    <div className="modal-center-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="pdm-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Close Button */}
        <button
          className="pdm-close-btn"
          onClick={onClose}
          aria-label="Close product details"
        >
          <X size={20} />
        </button>

        <div className="pdm-container">
          {/* LEFT: Image & Badges */}
          <div className="pdm-image-col">
            <div className="pdm-image-card">
              {/* Header Badges: ETA & Discount */}
              <div className="pdm-top-badges">
                <div className="pdm-eta-tag">
                  <Zap size={13} fill="#0C831F" color="#0C831F" />
                  <span>8 MINS DELIVERY</span>
                </div>

                {hasDiscount ? (
                  <div className="pdm-discount-pill">
                    {discountPercent}% OFF
                  </div>
                ) : (
                  <div />
                )}
              </div>

              {/* Product Image Container */}
              <div className="pdm-product-img-wrap">
                <img
                  src={product.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80'}
                  alt={product.name}
                  className="pdm-product-img"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80';
                  }}
                />
              </div>

              {/* Diet Type Indicator Badge */}
              {(() => {
                const isNonVeg = product.dietType === 'Non-Vegetarian';
                const isEgg = product.dietType === 'Contains Egg';
                const badgeColor = isNonVeg ? '#DC2626' : isEgg ? '#D97706' : '#16A34A';
                const badgeBg = isNonVeg ? 'rgba(239, 68, 68, 0.08)' : isEgg ? 'rgba(217, 119, 6, 0.08)' : 'rgba(22, 163, 74, 0.08)';

                return (
                  <div
                    className="pdm-veg-mark"
                    style={{
                      color: badgeColor,
                      background: badgeBg,
                      padding: '0.3rem 0.6rem',
                      borderRadius: 'var(--radius-full)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      marginTop: '0.75rem'
                    }}
                  >
                    <div
                      className="veg-dot-box"
                      style={{ borderColor: badgeColor }}
                    >
                      <div
                        className="veg-green-circle"
                        style={{ background: badgeColor }}
                      />
                    </div>
                    <span style={{ fontWeight: 700, fontSize: '0.8rem' }}>
                      {isNonVeg
                        ? 'Non-Vegetarian'
                        : isEgg
                        ? 'Contains Egg'
                        : product.dietType === 'Vegan'
                        ? '100% Vegan'
                        : '100% Vegetarian'}
                    </span>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* RIGHT: Product Information & Actions */}
          <div className="pdm-info-col">
            {/* Category Breadcrumb */}
            <div className="pdm-category-chip">
              {product.category || 'General'}
            </div>

            <h2 className="pdm-title">{product.name}</h2>
            <div className="pdm-unit-badge">{product.unit || '1 unit'}</div>

            {/* Pricing Details */}
            <div className="pdm-price-section">
              <div className="pdm-price-row">
                <span className="pdm-current-price">₹{product.price}</span>
                {hasDiscount && (
                  <>
                    <span className="pdm-mrp-price">₹{mrp}</span>
                    <span className="pdm-save-tag">SAVE ₹{savings}</span>
                  </>
                )}
              </div>
              <span className="pdm-tax-note">(Inclusive of all taxes)</span>
            </div>

            {/* Add to Cart / Qty Counter */}
            <div className="pdm-action-bar">
              {isOutOfStock ? (
                <button className="pdm-btn-outofstock" disabled>
                  Out of Stock
                </button>
              ) : currentQty === 0 ? (
                <button
                  className="pdm-btn-add"
                  onClick={() => addToCart(product)}
                >
                  <ShoppingBag size={18} />
                  <span>ADD TO CART</span>
                </button>
              ) : (
                <div className="pdm-qty-counter">
                  <button
                    className="pdm-qty-btn"
                    onClick={() => updateQty(product._id, currentQty - 1)}
                    aria-label="Decrease quantity"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="pdm-qty-val">{currentQty}</span>
                  <button
                    className="pdm-qty-btn"
                    onClick={() => updateQty(product._id, currentQty + 1)}
                    disabled={currentQty >= product.stock}
                    aria-label="Increase quantity"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              )}
            </div>

            {/* Value Proposition & Trust Badges */}
            <div className="pdm-trust-grid">
              <div className="pdm-trust-item">
                <Zap size={16} className="pdm-trust-icon" />
                <div>
                  <span className="pdm-trust-head">Superfast Delivery</span>
                  <span className="pdm-trust-sub">In 8-10 mins from dark store</span>
                </div>
              </div>
              <div className="pdm-trust-item">
                <ShieldCheck size={16} className="pdm-trust-icon" />
                <div>
                  <span className="pdm-trust-head">Best Price Assured</span>
                  <span className="pdm-trust-sub">Authentic fresh stock</span>
                </div>
              </div>
              <div className="pdm-trust-item">
                <RotateCcw size={16} className="pdm-trust-icon" />
                <div>
                  <span className="pdm-trust-head">Instant Replacement</span>
                  <span className="pdm-trust-sub">100% satisfaction guarantee</span>
                </div>
              </div>
            </div>

            {/* About Product / Description */}
            <div className="pdm-description-box">
              <h4 className="pdm-section-heading">About the Product</h4>
              <p className="pdm-desc-text">
                {product.description || 'Finest quality ingredients curated for quick daily essentials and delicious snacking enjoyment.'}
              </p>
            </div>

            {/* Key Specifications Table */}
            <div className="pdm-specs-box">
              <h4 className="pdm-section-heading">Key Specifications</h4>
              <div className="pdm-specs-grid">
                <div className="pdm-spec-row">
                  <span className="spec-label">Net Quantity:</span>
                  <span className="spec-val">{product.unit || '1 unit'}</span>
                </div>
                <div className="pdm-spec-row">
                  <span className="spec-label">Category:</span>
                  <span className="spec-val">{product.category || 'General'}</span>
                </div>
                <div className="pdm-spec-row">
                  <span className="spec-label">Diet Type:</span>
                  <span className="spec-val">{product.dietType || '100% Vegetarian'}</span>
                </div>
                <div className="pdm-spec-row">
                  <span className="spec-label">Shelf Life:</span>
                  <span className="spec-val">{product.shelfLife || 'Best before 4 months from packaging'}</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
