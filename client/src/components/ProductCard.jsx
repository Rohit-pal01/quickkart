import React from 'react';
import { Plus, Minus, Zap } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function ProductCard({ product, onOpenDetail }) {
  const { getItemQty, addToCart, updateQty } = useCart();
  const currentQty = getItemQty(product._id);
  const isOutOfStock = product.stock <= 0;

  // Realistic MRP markup for quick-commerce discount badge
  const mrp = Math.round(product.price * 1.18);
  const discountPercent = Math.round(((mrp - product.price) / mrp) * 100);

  const handleCardClick = (e) => {
    // Prevent opening modal if clicking ADD or quantity counter buttons
    if (e.target.closest('.product-footer')) {
      return;
    }
    if (onOpenDetail) {
      onOpenDetail(product);
    }
  };

  return (
    <div
      className="product-card"
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      aria-label={`View details for ${product.name}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick(e);
        }
      }}
    >
      <div className="product-img-box">
        {/* ⚡ 8 MINS Badge (Blinkit style) */}
        <div className="eta-tag-pill">
          <Zap size={11} fill="#0C831F" color="#0C831F" />
          <span>8 MINS</span>
        </div>

        <img
          src={
            product.imageUrl ||
            'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80'
          }
          alt={product.name}
          className="product-img"
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80';
          }}
        />
      </div>

      <div className="product-info">
        <div className="unit-tag">{product.unit || '1 unit'}</div>

        <h3 className="product-name" title={product.name}>
          {product.name}
        </h3>

        {product.description && (
          <p className="product-card-desc" title={product.description}>
            {product.description}
          </p>
        )}

        <div className="product-footer">
          <div className="price-container">
            <div className="product-price">₹{product.price}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <span className="mrp-strikethrough">₹{mrp}</span>
              {discountPercent > 0 && (
                <span className="discount-badge">
                  {discountPercent}% OFF
                </span>
              )}
            </div>
          </div>

          {isOutOfStock ? (
            <span style={{ fontSize: '0.75rem', color: '#EF4444', fontWeight: 800 }}>
              Out of stock
            </span>
          ) : currentQty === 0 ? (
            <button className="btn-add" onClick={() => addToCart(product)}>
              ADD
            </button>
          ) : (
            <div className="qty-counter">
              <button
                className="qty-btn"
                onClick={() => updateQty(product._id, currentQty - 1)}
                aria-label="Decrease quantity"
              >
                <Minus size={13} />
              </button>
              <span className="qty-val">{currentQty}</span>
              <button
                className="qty-btn"
                onClick={() => updateQty(product._id, currentQty + 1)}
                disabled={currentQty >= product.stock}
                aria-label="Increase quantity"
              >
                <Plus size={13} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
