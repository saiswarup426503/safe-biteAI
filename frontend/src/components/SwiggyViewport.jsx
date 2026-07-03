import React, { useState } from 'react';
import { Search, ShieldCheck, ShieldAlert, Star, Filter, Heart } from 'lucide-react';

export default function SwiggyViewport({ restaurants, selectedId, onSelectRestaurant }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterHygienic, setFilterHygienic] = useState(false);

  // Filter restaurants based on queries and safety badges
  const filteredRestaurants = restaurants.filter(res => {
    const matchesSearch = res.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Safety check: is warning state active if they missed uploads
    const isPass = res.safeBiteAIScore >= 80 && !res.isWarningState;
    const matchesFilter = !filterHygienic || isPass;

    return matchesSearch && matchesFilter;
  });

  // Helper to map restaurant names to some mock food banner backgrounds
  const getMockImg = (name) => {
    if (name.includes('Biryani')) return 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=60';
    if (name.includes('Pizza')) return 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=60';
    return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60'; // सागर रत्न
  };

  return (
    <div className="restaurants-section">
      {/* Search and Filters layout */}
      <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search verified kitchens, dishes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem 1rem 0.75rem 2.5rem',
              borderRadius: '10px',
              border: '1px solid var(--border-light)',
              background: '#0f1422',
              color: '#fff',
              fontSize: '0.85rem',
              outline: 'none',
              transition: 'var(--transition-smooth)'
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--color-orange)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--border-light)'}
          />
        </div>

        <button
          onClick={() => setFilterHygienic(!filterHygienic)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.2rem',
            borderRadius: '10px',
            border: '1px solid',
            borderColor: filterHygienic ? 'var(--color-green)' : 'var(--border-light)',
            background: filterHygienic ? 'rgba(16, 185, 129, 0.08)' : '#0f1422',
            color: filterHygienic ? 'var(--color-green)' : 'var(--text-primary)',
            fontSize: '0.85rem',
            fontWeight: '700',
            cursor: 'pointer',
            transition: 'var(--transition-smooth)'
          }}
        >
          <Filter size={16} />
          <span>Hygienic Badge (Score 80+)</span>
        </button>
      </div>

      {/* Title */}
      <span className="section-title">
        Verified Kitchens Near You
      </span>

      {/* Grid listing */}
      {filteredRestaurants.length === 0 ? (
        <div className="glass-panel empty-state-card">
          <p style={{ fontSize: '0.9rem', fontWeight: '700', color: '#fff' }}>No Verified Kitchens Found</p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Try adjusting your search query or filter tags</p>
        </div>
      ) : (
        <div className="restaurant-grid">
          {filteredRestaurants.map(res => {
            const isSelected = selectedId === res._id;
            const score = res.safeBiteAIScore;
            const isHygienic = score >= 80 && !res.isWarningState;
            
            return (
              <div
                key={res._id}
                onClick={() => onSelectRestaurant(res)}
                className={`restaurant-card ${isSelected ? 'selected' : ''}`}
                style={isSelected ? { borderColor: 'var(--color-orange)', boxShadow: 'var(--shadow-glow-orange)' } : {}}
              >
                <div className="card-image-wrapper">
                  <img
                    src={getMockImg(res.name)}
                    alt={res.name}
                    className="restaurant-card-img"
                  />
                  
                  {/* CCTV Live Indicator overlay */}
                  <div className="live-overlay-badge">
                    <div className="live-pulse-dot"></div>
                    <span>CCTV Online</span>
                  </div>

                  {/* Safety Badge Score */}
                  <div className={`score-badge ${isHygienic ? 'hygienic' : 'warning'}`}>
                    {isHygienic ? (
                      <>
                        <ShieldCheck size={14} />
                        <span>{score}</span>
                      </>
                    ) : (
                      <>
                        <ShieldAlert size={14} />
                        <span>{score} (ALERT)</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="card-details">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                    <h3 className="restaurant-name">{res.name}</h3>
                    <Heart size={16} style={{ color: 'var(--text-muted)', cursor: 'pointer', transition: 'var(--transition-smooth)' }} />
                  </div>
                  
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                    North Indian • Biryani • Chinese
                  </span>

                  <div className="card-meta-line">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#fbbf24', fontWeight: '700' }}>
                      <Star size={14} fill="#fbbf24" stroke="none" />
                      <span>4.3</span>
                    </div>
                    <span>•</span>
                    <span>32 mins</span>
                    <span>•</span>
                    <span>₹250 for two</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
