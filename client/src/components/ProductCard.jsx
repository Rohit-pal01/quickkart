import React from 'react';
import { Plus, Minus } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function ProductCard({ product }) {
  const { getItemQty, addToCart, updateQty } = useCart();
  const currentQty = getItemQty(product._id);
  const isOutOfStock = product.stock <= 0;

  return (
    <div className="product-card">
      <div className="product-img-box">
        <img
          src={product.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80'}
          alt={product.name}
          className="product-img"
          loading="lazy"
        />
        <div className="unit-tag">{product.unit || '1 pc'}</div>
      </div>

      <div className="product-info">
        <h3 className="product-name" title={product.name}>
          {product.name}
        </h3>
        <p className="product-desc" title={product.description}>
          {product.description || product.category}
        </p>

        <div className="product-footer">
          <div className="product-price">₹{product.price}</div>

          {isOutOfStock ? (
            <span style={{ fontSize: '0.8rem', color: '#EF4444', fontWeight: 700 }}>
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
              >
                <Minus size={14} />
              </button>
              <span className="qty-val">{currentQty}</span>
              <button
                className="qty-btn"
                onClick={() => updateQty(product._id, currentQty + 1)}
                disabled={currentQty >= product.stock}
              >
                <Plus size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
