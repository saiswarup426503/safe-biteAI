import chef from "../assets/chef.png";
import SearchBar from "./SearchBar";
import { RefreshCw } from "lucide-react";

function Hero({ query, setQuery, userCoords, setUserCoords, isLocating, setIsLocating }) {
  const handleLocateMe = () => {
    if (userCoords) {
      // Clear geolocation filter
      setUserCoords(null);
      return;
    }

    setIsLocating(true);
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setIsLocating(false);
      },
      (error) => {
        console.error("Location retrieval error:", error);
        alert("Could not retrieve exact coordinates. Defaulting to mock coordinates to search restaurants.");
        // Mock a location near BTM Layout (near Biryani Zone)
        setUserCoords({
          lat: 12.9200,
          lng: 77.6150
        });
        setIsLocating(false);
      },
      { enableHighAccuracy: false, timeout: 12000, maximumAge: 60000 }
    );
  };

  return (
    <section className="hero">
      <div className="hero-left">
        <span className="badge">
          ✔ AI Verified Kitchens
        </span>

        <h1>Eat with Confidence</h1>

        <p>
          Watch live kitchen feeds and AI hygiene scores before placing your order.
        </p>

        <SearchBar query={query} setQuery={setQuery} />

        {/* Real-time Location Service Button */}
        <div style={{ marginTop: "15px", display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            onClick={handleLocateMe}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 18px",
              borderRadius: "20px",
              background: userCoords ? "#18a65d" : "#fff3e8",
              color: userCoords ? "white" : "#FC8019",
              fontSize: "13px",
              fontWeight: "600",
              cursor: "pointer",
              boxShadow: "0 4px 15px rgba(0,0,0,.03)",
              border: "none",
              transition: "all 0.3s ease"
            }}
          >
            {isLocating ? (
              <>
                <RefreshCw size={14} className="spinner-icon" style={{ animation: "spin 1s linear infinite" }} />
                <span>Locating...</span>
              </>
            ) : userCoords ? (
              <>
                <span>📍 Location Active (Click to Clear)</span>
              </>
            ) : (
              <>
                <span>📍 Find Nearest Kitchens</span>
              </>
            )}
          </button>
        </div>

        <div className="hero-features" style={{ marginTop: "35px" }}>
          <div>
            <h3>500+</h3>
            <p>Verified Restaurants</p>
          </div>

          <div>
            <h3>95%</h3>
            <p>Average Hygiene</p>
          </div>

          <div>
            <h3>24/7</h3>
            <p>Live Monitoring</p>
          </div>
        </div>
      </div>

      <div className="hero-right">
        <img src={chef} alt="Chef" />
      </div>

      {/* Local animation rules */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spinner-icon {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </section>
  );
}

export default Hero;