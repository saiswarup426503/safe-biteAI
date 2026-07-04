import React, { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Video,
  VolumeX,
  Volume2,
  RefreshCw
} from "lucide-react";

function LiveKitchen({ restaurant, currentUser, onOrder, hideHeader = false }) {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Stream URL calculation
  const streamUrl = restaurant
    ? restaurant._id.startsWith("osm_")
      ? restaurant.cctvStreamUrl || "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
      : `/api/restaurants/${restaurant._id}/stream.m3u8`
    : null;

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !streamUrl) return;

    setIsLoading(true);
    setHasError(false);
    setIsPlaying(false);

    if (Hls.isSupported()) {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }

      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });
      hlsRef.current = hls;

      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsLoading(false);
        video.play()
          .then(() => setIsPlaying(true))
          .catch(() => {
            // Auto-play prevented, retry muted
            video.muted = true;
            setIsMuted(true);
            video.play()
              .then(() => setIsPlaying(true))
              .catch(err => console.log("Video play error:", err));
          });
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              setHasError(true);
              setIsLoading(false);
              hls.destroy();
              break;
          }
        }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
      video.addEventListener("loadedmetadata", () => {
        setIsLoading(false);
        video.play()
          .then(() => setIsPlaying(true))
          .catch(() => {
            video.muted = true;
            setIsMuted(true);
            video.play().then(() => setIsPlaying(true));
          });
      });

      video.addEventListener("error", () => {
        setHasError(true);
        setIsLoading(false);
      });
    } else {
      setHasError(true);
      setIsLoading(false);
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [streamUrl]);

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleReconnect = () => {
    if (!streamUrl) return;
    setHasError(false);
    setIsLoading(true);
    if (hlsRef.current) {
      hlsRef.current.loadSource(streamUrl);
      hlsRef.current.startLoad();
    } else if (videoRef.current) {
      videoRef.current.load();
    }
  };

  const handleOrderClick = (item = null) => {
    if (!currentUser) {
      onOrder(null); // Direct to auth tab
    } else if (currentUser.role !== "customer") {
      alert("Merchant/Owner accounts cannot place consumer food orders. Please sign in as a Customer.");
    } else {
      onOrder(restaurant, item); // Place the order with item details
    }
  };

  if (!restaurant) {
    return (
      <div className="live-kitchen" style={{ minHeight: "450px", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", color: "#888" }}>
        <Video size={40} style={{ marginBottom: "15px" }} />
        <p>Select a restaurant to watch live feed</p>
      </div>
    );
  }

  // Get dynamic compliance stats from the latest media upload in the timeline
  const timeline = restaurant.mediaUploadTimeline || [];
  const latestUpload = timeline.length > 0 ? timeline[timeline.length - 1] : null;

  const hasCap = latestUpload ? !latestUpload.detectedViolations.includes("Missing Cap") : true;
  const hasGloves = latestUpload ? !latestUpload.detectedViolations.includes("Missing Gloves") : true;
  const hasApron = latestUpload ? !latestUpload.detectedViolations.includes("Missing Apron") : true;
  const isCleanWorkspace = restaurant.safeBiteAIScore >= 75; // Heuristic based on score

  return (
    <div className="live-kitchen" style={{ border: "none", padding: 0, boxShadow: "none", background: "transparent" }}>
      {!hideHeader && (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2>Live Kitchen</h2>
            <span 
              style={{
                fontSize: "12px",
                color: restaurant.isWarningState ? "#e53e3e" : "#18a65d",
                background: restaurant.isWarningState ? "#fff5f5" : "#e9fff2",
                padding: "4px 10px",
                borderRadius: "10px",
                fontWeight: "600",
                display: "flex",
                alignItems: "center",
                gap: "5px"
              }}
            >
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: restaurant.isWarningState ? "#e53e3e" : "#18a65d", display: "inline-block" }}></span>
              {restaurant.isWarningState ? "Pending Check" : "Active Feed"}
            </span>
          </div>
          <p style={{ color: "#777", fontSize: "14px", marginTop: "4px", marginBottom: "15px" }}>{restaurant.name}</p>
        </>
      )}

      {/* Main double column grid */}
      <div className="live-kitchen-grid" style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "30px" }}>
        
        {/* Left Side: Video Feed & Compliance */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div 
            className="video-box" 
            style={{ 
              position: "relative", 
              overflow: "hidden", 
              background: "#151b2c",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              borderRadius: "16px",
              height: "260px",
              margin: 0
            }}
          >
            {hasError ? (
              <div style={{ textAlign: "center", padding: "20px", color: "#a0aec0" }}>
                <AlertTriangle size={36} color="#e53e3e" style={{ marginBottom: "10px" }} />
                <p style={{ fontWeight: "600", color: "white" }}>Feed Connection Failed</p>
                <p style={{ fontSize: "12px", marginTop: "4px", marginBottom: "15px" }}>RTSP stream multiplexer offline</p>
                <button 
                  onClick={handleReconnect}
                  style={{
                    padding: "8px 15px",
                    background: "rgba(252,128,25,0.15)",
                    border: "1px solid #FC8019",
                    color: "#FC8019",
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontWeight: "600",
                    cursor: "pointer"
                  }}
                >
                  Reconnect Stream
                </button>
              </div>
            ) : (
              <>
                <video
                  ref={videoRef}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: isLoading ? "none" : "block"
                  }}
                  playsInline
                  muted={isMuted}
                />

                {isLoading && (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#a0aec0" }}>
                    <RefreshCw size={30} className="spinner-icon" style={{ color: "#FC8019", marginBottom: "10px", animation: "spin 1.5s linear infinite" }} />
                    <span style={{ fontSize: "13px" }}>Connecting to CCTV feed...</span>
                  </div>
                )}

                {!isLoading && (
                  <>
                    <div style={{ position: "absolute", top: "15px", left: "15px", background: "rgba(0,0,0,0.5)", color: "white", padding: "4px 8px", borderRadius: "6px", fontSize: "10px", fontWeight: "600", letterSpacing: "1px" }}>
                      CAM_01_BACK_HOUSE
                    </div>

                    <div style={{ position: "absolute", bottom: "10px", right: "10px", background: "rgba(0,0,0,0.6)", padding: "6px", borderRadius: "8px", display: "flex", gap: "8px" }}>
                      <button 
                        onClick={toggleMute}
                        style={{ background: "none", border: "none", color: "white", cursor: "pointer", display: "flex", alignItems: "center" }}
                      >
                        {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                      </button>
                      <button 
                        onClick={handleReconnect}
                        style={{ background: "none", border: "none", color: "white", cursor: "pointer", display: "flex", alignItems: "center" }}
                      >
                        <RefreshCw size={14} />
                      </button>
                    </div>
                  </>
                )}
              </>
            )}
          </div>

          <div className="hygiene-score" style={{ background: restaurant.safeBiteAIScore >= 80 ? "#f5fff8" : "#fff5f5", display: "flex", gap: "12px", padding: "12px 18px", borderRadius: "14px", alignItems: "center", margin: 0 }}>
            <ShieldCheck size={24} color={restaurant.safeBiteAIScore >= 80 ? "#18a65d" : "#e53e3e"} />
            <div>
              <h3 style={{ color: restaurant.safeBiteAIScore >= 80 ? "#18a65d" : "#e53e3e", margin: 0, fontSize: "18px", fontWeight: "700" }}>
                {restaurant.safeBiteAIScore} / 100
              </h3>
              <span style={{ fontSize: "11px", color: "#666" }}>Overall Hygiene Score</span>
            </div>
          </div>

          <div className="checks" style={{ display: "flex", flexDirection: "column", gap: "12px", background: "#f8f7f4", padding: "16px", borderRadius: "16px", border: "1px solid #eee", margin: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                {hasCap ? <CheckCircle2 color="#18a65d" size={20} /> : <AlertTriangle color="#e53e3e" size={20} />}
                <span style={{ fontSize: "14px", fontWeight: "500" }}>Hairnet / Cap Detection</span>
              </div>
              <span style={{ fontSize: "12px", color: hasCap ? "#18a65d" : "#e53e3e", fontWeight: "600" }}>
                {hasCap ? "Compliant" : "Violation"}
              </span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                {hasGloves ? <CheckCircle2 color="#18a65d" size={20} /> : <AlertTriangle color="#e53e3e" size={20} />}
                <span style={{ fontSize: "14px", fontWeight: "500" }}>Sanitary Gloves Detection</span>
              </div>
              <span style={{ fontSize: "12px", color: hasGloves ? "#18a65d" : "#e53e3e", fontWeight: "600" }}>
                {hasGloves ? "Compliant" : "Violation"}
              </span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                {hasApron ? <CheckCircle2 color="#18a65d" size={20} /> : <AlertTriangle color="#e53e3e" size={20} />}
                <span style={{ fontSize: "14px", fontWeight: "500" }}>Uniform / Apron Detection</span>
              </div>
              <span style={{ fontSize: "12px", color: hasApron ? "#18a65d" : "#e53e3e", fontWeight: "600" }}>
                {hasApron ? "Compliant" : "Violation"}
              </span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                {isCleanWorkspace ? <CheckCircle2 color="#18a65d" size={20} /> : <AlertTriangle color="#e53e3e" size={20} />}
                <span style={{ fontSize: "14px", fontWeight: "500" }}>Workspace Cleanliness</span>
              </div>
              <span style={{ fontSize: "12px", color: isCleanWorkspace ? "#18a65d" : "#e53e3e", fontWeight: "600" }}>
                {isCleanWorkspace ? "Passed" : "Warning"}
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Swiggy / Zomato Menu */}
        <div className="menu-scroller" style={{ maxHeight: "430px", overflowY: "auto", paddingRight: "8px" }}>
          <h4 style={{ margin: "0 0 16px 0", fontSize: "16px", color: "#FC8019", display: "flex", alignItems: "center", gap: "8px", fontWeight: "700" }}>
            <span>🍔 Explore Food Menu</span>
          </h4>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {((restaurant.menu && restaurant.menu.length > 0) ? restaurant.menu : [
              { name: "Classic Margherita Pizza", price: 320, category: "Pizzas", description: "Hand-stretched crust, premium mozzarella, rich marinara sauce, fresh basil." },
              { name: "Special Paneer Biryani", price: 240, category: "Biryani", description: "Fragrant basmati rice layered with soft cottage cheese and spices." },
              { name: "Premium Cheese Burger", price: 180, category: "Fast Food", description: "Juicy grilled veg patty with double cheese slices, lettuce, and secret sauce." },
              { name: "Cheesy Garlic Breadsticks", price: 140, category: "Starters", description: "Freshly baked garlic bread loaded with mozzarella." },
              { name: "Cold Beverage", price: 40, category: "Beverages", description: "Served ice cold." }
            ]).map((item, index) => (
              <div 
                key={index} 
                style={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center", 
                  padding: "14px 16px", 
                  background: "white", 
                  borderRadius: "14px", 
                  border: "1.5px solid #f0f0f0",
                  gap: "15px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.02)"
                }}
              >
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "14px", fontWeight: "600", color: "#2d2d2d" }}>{item.name}</span>
                    <span style={{ fontSize: "10px", color: "#18a65d", background: "#e9fff2", padding: "2px 6px", borderRadius: "8px", fontWeight: "600" }}>{item.category || "Food"}</span>
                  </div>
                  {item.description && (
                    <p style={{ margin: 0, fontSize: "11px", color: "#777", lineHeight: "1.4" }}>{item.description}</p>
                  )}
                  <span style={{ fontSize: "13px", fontWeight: "700", color: "#FC8019" }}>₹{item.price}</span>
                </div>
                
                <button
                  onClick={() => handleOrderClick(item)}
                  style={{
                    background: "#fff",
                    color: "#18a65d",
                    border: "1.5px solid #18a65d",
                    borderRadius: "10px",
                    padding: "8px 18px",
                    fontSize: "12px",
                    fontWeight: "700",
                    cursor: "pointer",
                    boxShadow: "0 2px 8px rgba(24,166,93,0.08)",
                    transition: "all 0.2s ease"
                  }}
                >
                  ADD
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Local styles */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spinner-icon {
          animation: spin 1.5s linear infinite;
        }
        @media (max-width: 800px) {
          .live-kitchen-grid {
            grid-template-columns: 1fr !important;
          }
          .menu-scroller {
            max-height: none !important;
          }
        }
      `}</style>
    </div>
  );
}

export default LiveKitchen;