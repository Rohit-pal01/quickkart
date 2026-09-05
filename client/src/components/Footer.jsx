import React from 'react';
import { Zap, ShieldCheck, Heart } from 'lucide-react';

export default function Footer({ onSelectCategory, onOpenLocation }) {
  return (
    <footer className="site-footer">
      <div className="footer-container">
        {/* Top 4 Columns */}
        <div className="footer-grid">
          {/* Column 1: Brand */}
          <div className="footer-col brand-col">
            <div className="footer-logo">
              <div className="footer-logo-icon">
                <Zap size={17} fill="#10B981" color="#10B981" />
              </div>
              <span className="footer-logo-text">QuickKart</span>
            </div>
            <p className="footer-tagline">
              Your one-stop quick-commerce store for daily groceries, fresh produce, and essentials delivered in 8–10 minutes.
            </p>
            <div className="footer-badge-pill">
              <span className="footer-dot-pulse"></span>
              <span>8-Min Hyperlocal Dark Store Delivery</span>
            </div>
          </div>

          {/* Column 2: Shop / Categories */}
          <div className="footer-col">
            <h4 className="footer-col-title">Shop</h4>
            <ul className="footer-links">
              <li>
                <button type="button" onClick={() => onSelectCategory && onSelectCategory('Dairy & Breakfast')}>
                  Dairy & Breakfast
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onSelectCategory && onSelectCategory('Fruits & Vegetables')}>
                  Fruits & Vegetables
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onSelectCategory && onSelectCategory('Snacks & Munchies')}>
                  Snacks & Munchies
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onSelectCategory && onSelectCategory('Instant Food')}>
                  Instant & Frozen Food
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onSelectCategory && onSelectCategory('Beverages')}>
                  Cold Drinks & Juices
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Support */}
          <div className="footer-col">
            <h4 className="footer-col-title">Support</h4>
            <ul className="footer-links">
              <li>
                <button type="button" onClick={onOpenLocation}>
                  Delivery Cities & Hubs
                </button>
              </li>
              <li>
                <a href="#tracking" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                  Live Order Tracker
                </a>
              </li>
              <li>
                <a href="mailto:support@quickkart.com">
                  Help & Contact Us
                </a>
              </li>
              <li>
                <span className="footer-static-link">Shipping & 8-min ETA</span>
              </li>
              <li>
                <span className="footer-static-link">Zero Delivery Fee FAQ</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Payments & Security */}
          <div className="footer-col">
            <h4 className="footer-col-title">Payments</h4>
            <p className="footer-payment-text">
              Secured by <strong>Juspay ExpressCheckout</strong>. Multi-rail support for UPI, Cards & Net Banking.
            </p>
            <div className="footer-secure-note">
              <ShieldCheck size={16} color="#10B981" />
              <span>256-bit Encrypted Checkout</span>
            </div>
            <p className="footer-host-text">
              Frontend deployed on <strong>Vercel</strong>. Database powered by <strong>MongoDB Atlas</strong>.
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="footer-divider" />

        {/* Social Icons Row */}
        <div className="footer-social-row">
          <a
            href="https://github.com/Rohit-pal01/quickkart"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-social-btn"
            aria-label="GitHub Repository"
            title="GitHub Repository"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
          </a>

          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-social-btn"
            aria-label="LinkedIn"
            title="LinkedIn"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
            </svg>
          </a>

          <a
            href="https://t.me"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-social-btn"
            aria-label="Telegram"
            title="Telegram"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
            </svg>
          </a>

          <a
            href="mailto:rohitpal01@gmail.com"
            className="footer-social-btn"
            aria-label="Email Us"
            title="Contact via Email"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="20" height="16" x="2" y="4" rx="2"/>
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
            </svg>
          </a>
        </div>

        {/* Bottom Copyright Line */}
        <div className="footer-copyright">
          © 2026 QuickKart | Developed by Rohit Pal.
        </div>
      </div>
    </footer>
  );
}
