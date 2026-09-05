import React, { useState } from 'react';
import { X, MapPin, Search, Check, Navigation } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const POPULAR_CITIES = [
  { name: 'Bengaluru', label: 'Indiranagar, Bengaluru' },
  { name: 'Delhi NCR', label: 'Connaught Place, New Delhi' },
  { name: 'Mumbai', label: 'Bandra West, Mumbai' },
  { name: 'Hyderabad', label: 'Hitec City, Hyderabad' },
  { name: 'Pune', label: 'Koregaon Park, Pune' },
  { name: 'Lucknow', label: 'Gomti Nagar, Lucknow' },
  { name: 'Kolkata', label: 'Park Street, Kolkata' },
  { name: 'Chennai', label: 'T. Nagar, Chennai' },
  { name: 'Chandigarh', label: 'Sector 17, Chandigarh' },
  { name: 'Jaipur', label: 'Malviya Nagar, Jaipur' }
];

export default function LocationModal({ isOpen, onClose }) {
  const { activeAddress, setActiveAddress, addAddress, isAuthenticated } = useAuth();
  const [customAddress, setCustomAddress] = useState('');

  if (!isOpen) return null;

  const handleSelectCity = async (cityLabel) => {
    const newAddr = {
      label: cityLabel.split(',')[1]?.trim() || cityLabel,
      line1: cityLabel
    };

    setActiveAddress(newAddr);
    if (isAuthenticated) {
      try {
        await addAddress(newAddr);
      } catch (e) {
        console.warn('Could not persist address to account', e);
      }
    }
    onClose();
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!customAddress.trim()) return;
    handleSelectCity(customAddress.trim());
  };

  return (
    <div
      className="modal-overlay"
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        overflowY: 'auto'
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--bg-card)',
          width: '100%',
          maxWidth: '460px',
          maxHeight: 'min(90vh, 620px)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-xl)',
          border: '1px solid var(--border-light)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          margin: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '1rem 1.25rem',
            borderBottom: '1px solid var(--border-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                background: 'rgba(157, 249, 239, 0.3)',
                color: '#086616',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <MapPin size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Choose Delivery Location</h3>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Select your city to check 8-min dark store delivery
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.2rem' }}
          >
            <X size={20} color="var(--text-muted)" />
          </button>
        </div>

        <div style={{ padding: '1.15rem 1.25rem', overflowY: 'auto', flex: 1 }}>
          {/* Custom Address Input */}
          <form onSubmit={handleCustomSubmit} style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.4rem' }}>
              TYPE YOUR STREET / AREA / CITY:
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  className="search-input"
                  style={{ borderRadius: 'var(--radius-md)', paddingLeft: '2.5rem', width: '100%' }}
                  placeholder="e.g. Hazratganj, Lucknow or Sector 62, Noida"
                  value={customAddress}
                  onChange={(e) => setCustomAddress(e.target.value)}
                />
              </div>
              <button
                type="submit"
                className="btn-add"
                style={{ padding: '0.65rem 1rem', background: '#0C831F', color: 'white' }}
              >
                Set
              </button>
            </div>
          </form>

          {/* Popular Cities */}
          <div>
            <div
              style={{
                fontSize: '0.78rem',
                fontWeight: 800,
                color: 'var(--text-muted)',
                marginBottom: '0.65rem'
              }}
            >
              POPULAR QUICK-COMMERCE CITIES:
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', maxHeight: '240px', overflowY: 'auto' }}>
              {POPULAR_CITIES.map((city) => {
                const isSelected = activeAddress?.line1 === city.label || activeAddress?.line1?.includes(city.name);
                return (
                  <div
                    key={city.name}
                    onClick={() => handleSelectCity(city.label)}
                    style={{
                      padding: '0.65rem 0.85rem',
                      borderRadius: 'var(--radius-md)',
                      border: isSelected ? '1.5px solid #0C831F' : '1px solid var(--border-light)',
                      background: isSelected ? '#E8F5E9' : 'white',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'var(--transition)'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800, color: isSelected ? '#0C831F' : 'var(--text-main)' }}>
                        {city.name}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        8-10 min delivery
                      </div>
                    </div>
                    {isSelected && <Check size={16} color="#0C831F" />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
