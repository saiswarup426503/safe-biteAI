import React, { useState, useEffect } from 'react';
import SwiggyViewport from './components/SwiggyViewport';
import LiveCCTVStream from './components/LiveCCTVStream';
import ComplianceTimeline from './components/ComplianceTimeline';
import MerchantConsole from './components/MerchantConsole';
import { ShieldCheck, ShieldAlert, Sparkles, AlertTriangle, Eye, HelpCircle, RefreshCw, Store, BarChart3, BookOpen, Sun, Moon } from 'lucide-react';

export default function App() {
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRes, setSelectedRes] = useState(null);
  const [restaurantDetails, setRestaurantDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('viewport'); // viewport, analytics, guidelines
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Load all restaurants on mount
  useEffect(() => {
    fetchRestaurants();
    // Poll updates every 15 seconds to keep scores / warning indicators live
    const interval = setInterval(fetchRestaurants, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchRestaurants = async () => {
    try {
      const response = await fetch('/api/restaurants');
      if (!response.ok) throw new Error('Failed to load restaurant databases');
      const data = await response.json();
      setRestaurants(data);
      setIsLoading(false);
    } catch (e) {
      console.error(e);
      setError(e.message);
      setIsLoading(false);
    }
  };

  // Load restaurant details timeline when a restaurant is selected
  const handleSelectRestaurant = async (res) => {
    setSelectedRes(res);
    setIsLoadingDetails(true);
    try {
      const response = await fetch(`/api/restaurants/${res._id}`);
      if (!response.ok) throw new Error('Failed to fetch timeline details');
      const data = await response.json();
      setRestaurantDetails(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  // Sync state when merchant uploads new camera snapshots
  const handleUploadSuccess = (updatedRes) => {
    // Update main array listing scores
    setRestaurants(prev => prev.map(r => r._id === updatedRes._id ? updatedRes : r));
    
    // Update local detail timeline
    setRestaurantDetails(updatedRes);
  };

  const renderAnalytics = () => {
    const totalScore = restaurants.reduce((sum, r) => sum + r.safeBiteAIScore, 0);
    const avgScore = restaurants.length > 0 ? Math.round(totalScore / restaurants.length) : 100;
    const hygienicCount = restaurants.filter(r => r.safeBiteAIScore >= 80).length;
    const warningCount = restaurants.length - hygienicCount;

    return (
      <div style={{ padding: '2rem', maxWidth: '1400px', width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <BarChart3 color="var(--color-orange)" />
          District Kitchen Safety Analytics
        </h2>
        
        {/* Cards Row (Forced 3 Columns Horizontal) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Compliance Index</span>
            <span style={{ fontSize: '2.5rem', fontWeight: '800', color: avgScore >= 80 ? 'var(--color-green)' : 'var(--color-red)' }}>{avgScore}%</span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Average score of active restaurants</span>
          </div>
          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Hygienic Badge Active</span>
            <span style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--color-green)' }}>{hygienicCount}</span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Score ≥ 80 / No delayed uploads</span>
          </div>
          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Warning State Alerts</span>
            <span style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--color-red)' }}>{warningCount}</span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Pending uploads or violations</span>
          </div>
        </div>

        {/* Main Dashboard Widgets Row (Forced 2 Columns Horizontal) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
          
          {/* Violation Breakdown chart (meter bars) */}
          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <span style={{ fontSize: '1rem', fontWeight: '800', color: '#fff' }}>YOLOv8 Violation Breakdown</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.35rem' }}>
                  <span>Hairnet / Cap Violations</span>
                  <span style={{ color: 'var(--color-orange)' }}>14%</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: '#121826', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: '14%', height: '100%', background: 'var(--color-orange)', borderRadius: '4px' }}></div>
                </div>
              </div>
              
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.35rem' }}>
                  <span>Glove / Hand Sanitation Violations</span>
                  <span style={{ color: 'var(--color-red)' }}>28%</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: '#121826', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: '28%', height: '100%', background: 'var(--color-red)', borderRadius: '4px' }}></div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.35rem' }}>
                  <span>Chef Uniform / Apron Violations</span>
                  <span style={{ color: 'var(--color-amber)' }}>8%</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: '#121826', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: '8%', height: '100%', background: 'var(--color-amber)', borderRadius: '4px' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Leaderboard list */}
          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <span style={{ fontSize: '1rem', fontWeight: '800', color: '#fff' }}>Compliance Leaderboard</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {restaurants.map((r, i) => (
                <div key={r._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: '#151c2f', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--color-orange)' }}>#{i+1}</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#fff' }}>{r.name}</span>
                  </div>
                  <span style={{ fontSize: '0.85rem', fontWeight: '800', color: r.safeBiteAIScore >= 80 ? 'var(--color-green)' : 'var(--color-red)' }}>
                    {r.safeBiteAIScore} / 100
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderGuidelines = () => {
    return (
      <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <BookOpen color="var(--color-orange)" />
          KitchenTrust Media Audit Guidelines
        </h2>

        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ color: 'var(--color-orange)', fontSize: '1.1rem', fontWeight: '700' }}>1. Live CCTV Stream Ingestion</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            All participating dark kitchens must feed a constant RTSP/HLS live feed to the SafeBite API gateway. 
            The camera must cover the entire active preparation table. CCTV cameras must remain online 
            during business hours. Delays or connection drops will trigger automatic gateway re-routing warning status.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ color: 'var(--color-green)', fontSize: '1.1rem', fontWeight: '700' }}>2. 30-Minute Interval Proofs</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            Merchant operators must submit camera snapshots every 30 minutes. The upload acts as audit proof:
            the image is parsed by our automated computer vision module to classify and locate:
          </p>
          <ul style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li>🟢 <strong>Hairnets / Chef Caps</strong>: Must cover all hair to maintain hygiene. (Value: 30% compliance index).</li>
            <li>🟢 <strong>Hygienic Aprons / Chef Coats</strong>: Must cover the torso. (Value: 40% compliance index).</li>
            <li>🟢 <strong>Sanitary Gloves</strong>: Must cover hands when handling active orders. (Value: 30% compliance index).</li>
          </ul>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ color: 'var(--color-red)', fontSize: '1.1rem', fontWeight: '700' }}>3. Dynamic Penalty Rules</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            Failing to upload a snapshot within 30 minutes results in dynamic score degradation. 
            For every 10 minutes past the deadline, <strong>5 rating points</strong> are subtracted from the restaurant's 
            overall SafeBite AI Score. If the score drops below 80, the merchant's "Hygienic Badge" is suspended, 
            which will alert consumers on the Swiggy checkout app.
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="app-container">
      {/* Header bar */}
      <header className="main-header">
        <div className="header-content">
          <div className="logo-container">
            <div style={{ background: 'var(--color-orange)', padding: '0.4rem', borderRadius: '8px', display: 'flex', alignItems: 'center' }}>
              <ShieldCheck size={24} color="#fff" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span className="logo-text">SafeBite AI</span>
                <span className="logo-badge">KitchenTrust v3.0</span>
              </div>
              <p className="logo-tagline">Surveillance & Media Verification Framework</p>
            </div>
          </div>

          {/* Navigation Menu */}
          <div className="header-nav-menu">
            <button 
              className={`nav-tab-item ${activeTab === 'viewport' ? 'active' : ''}`}
              onClick={() => setActiveTab('viewport')}
            >
              <Store size={16} />
              <span>Swiggy Viewport</span>
            </button>
            <button 
              className={`nav-tab-item ${activeTab === 'analytics' ? 'active' : ''}`}
              onClick={() => setActiveTab('analytics')}
            >
              <BarChart3 size={16} />
              <span>Safety Analytics</span>
            </button>
            <button 
              className={`nav-tab-item ${activeTab === 'guidelines' ? 'active' : ''}`}
              onClick={() => setActiveTab('guidelines')}
            >
              <BookOpen size={16} />
              <span>Audit Guidelines</span>
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', fontSize: '0.85rem' }}>
            <span style={{ color: 'var(--color-green)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <span className="live-pulse-dot" style={{ display: 'inline-block' }}></span>
              FastAPI YOLOv8 active
            </span>

            {/* Theme Toggle Button */}
            <button 
              onClick={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
              className="theme-toggle-btn"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              style={{ border: 'none' }}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Header Banner */}
      <div style={{ maxWidth: '1400px', width: '100%', margin: '1.5rem auto 0 auto', padding: '0 2rem' }}>
        <div className="kitchen-trust-hero">
          <div className="hero-text">
            <h1 className="hero-title">On-Demand Consumer CCTV Stream + Interval Media Auditing</h1>
            <p className="hero-description">
              Destroying the opacity of dark kitchens. Consumers inspect active back-of-house cameras 
              during checkout. Restaurant operators upload mandatory 30-minute photo proof for 
              automated computer vision checks.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '1rem', zIndex: 1 }}>
            <div style={{ background: '#17223b', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: '0.65rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)' }}>CCTV Portals</span>
              <span style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--color-orange)' }}>Active</span>
            </div>
            <div style={{ background: '#17223b', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: '0.65rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Audit Schedule</span>
              <span style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--color-green)' }}>30 Mins</span>
            </div>
          </div>
          <div className="hero-glow-blob"></div>
        </div>
      </div>

      {/* Main dashboard viewport */}
      {activeTab === 'viewport' ? (
        <main className="swiggy-viewport">
          
          {/* Left pane: Swiggy Restaurants list */}
          {isLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
              <RefreshCw size={36} className="spinner-icon" style={{ color: 'var(--color-orange)' }} />
            </div>
          ) : error ? (
            <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-red)' }}>
              <AlertTriangle size={36} style={{ marginBottom: '0.5rem' }} />
              <p style={{ fontWeight: '700' }}>Error connecting to server gateway</p>
              <p style={{ fontSize: '0.8rem', marginTop: '0.2rem' }}>Ensure Node Express server is running: {error}</p>
            </div>
          ) : (
            <SwiggyViewport
              restaurants={restaurants}
              selectedId={selectedRes?._id}
              onSelectRestaurant={handleSelectRestaurant}
            />
          )}

          {/* Right pane: Inspection Drawer details */}
          <div className="audit-details-panel">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Eye size={20} style={{ color: 'var(--color-orange)' }} />
              <h2 className="panel-header-title">Live Kitchen Inspector</h2>
            </div>

            {!selectedRes ? (
              <div className="glass-panel panel-card-container empty-state-card" style={{ flex: 1, justifyContent: 'center', minHeight: '300px' }}>
                <div style={{ background: 'rgba(252,128,25,0.06)', padding: '1rem', borderRadius: '50%', marginBottom: '0.5rem' }}>
                  <Sparkles size={36} style={{ color: 'var(--color-orange)' }} />
                </div>
                <p style={{ color: '#fff', fontWeight: '700', fontSize: '0.95rem' }}>Select a restaurant card to begin</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: '280px', margin: '0 auto', lineHeight: '1.5' }}>
                  Inspect live food prep streams and view chronological computer vision compliance scans.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Restaurant Headline */}
                <div className="glass-panel" style={{ padding: '1rem 1.25rem', borderLeft: '4px solid var(--color-orange)' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#fff' }}>{selectedRes.name}</h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                    Hygienic Rating Score: <strong style={{ color: selectedRes.safeBiteAIScore >= 80 ? 'var(--color-green)' : 'var(--color-red)' }}>{selectedRes.safeBiteAIScore}/100</strong>
                  </p>
                </div>

                {/* Video Stream Module */}
                <div className="glass-panel panel-card-container">
                  <span className="section-title" style={{ fontSize: '0.95rem', marginBottom: '0.5rem' }}>
                    Live CCTV Access
                  </span>
                  <LiveCCTVStream
                    streamUrl={`/api/restaurants/${selectedRes._id}/stream.m3u8`}
                    restaurantName={selectedRes.name}
                  />
                </div>

                {/* Chronological Media Ingest Timeline Module */}
                {isLoadingDetails ? (
                  <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem' }}>
                    <RefreshCw size={24} className="spinner-icon" style={{ color: 'var(--color-orange)' }} />
                  </div>
                ) : (
                  restaurantDetails && (
                    <>
                      <div className="glass-panel panel-card-container">
                        <ComplianceTimeline 
                          timeline={restaurantDetails.mediaUploadTimeline} 
                        />
                      </div>

                      {/* Merchant Console Upload Portal Module */}
                      <MerchantConsole
                        restaurant={restaurantDetails}
                        onUploadSuccess={handleUploadSuccess}
                      />
                    </>
                  )
                )}
              </div>
            )}
          </div>
        </main>
      ) : activeTab === 'analytics' ? (
        renderAnalytics()
      ) : (
        renderGuidelines()
      )}
    </div>
  );
}
