import React, { useState, useEffect, useRef } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Categories from "./components/Categories";
import RestaurantCard from "./components/RestaurantCard";
import LiveKitchen from "./components/LiveKitchen";
import Footer from "./components/Footer";
import MerchantConsole from "./components/MerchantConsole";
import Analytics from "./components/Analytics";
import Guidelines from "./components/Guidelines";
import Auth from "./components/Auth";
import Orders from "./components/Orders";

const restaurantMetaData = {
  "The Pizza Palace (Indiranagar)": {
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800",
    rating: "4.6",
    reviews: "1.2k+",
    cuisine: "Italian, Pizza",
    location: "Indiranagar",
    time: "30-35 mins",
    lat: 12.9719,
    lng: 77.6412
  },
  "Biryani Zone (BTM Layout)": {
    image: "https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg",
    rating: "4.5",
    reviews: "980+",
    cuisine: "Noodles, North Indian",
    location: "BTM Layout",
    time: "25-30 mins",
    lat: 12.9166,
    lng: 77.6101
  },
  "Sagar Ratna (Jayanagar)": {
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800",
    rating: "4.4",
    reviews: "720+",
    cuisine: "Fast Food, South Indian",
    location: "Jayanagar",
    time: "20-25 mins",
    lat: 12.9308,
    lng: 77.5838
  }
};
const getTabFromHash = () => {
  const hash = window.location.hash;
  if (hash === "#/analytics") return "analytics";
  if (hash === "#/guidelines") return "guidelines";
  if (hash === "#/profile") return "profile";
  if (hash === "#/orders") return "orders";
  if (hash === "#/auth/merchant") return "auth-merchant";
  if (hash === "#/auth/customer" || hash === "#/auth") return "auth-customer";
  return "home";
};

// Haversine formula to calculate distance in km
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(1)); // Distance in km
};

function App() {
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRes, setSelectedRes] = useState(null);
  const [activeTab, setActiveTab] = useState(getTabFromHash); // home, analytics, guidelines, profile, orders, auth
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  // Real-time geolocation states
  const [userCoords, setUserCoords] = useState(() => {
    try {
      const saved = localStorage.getItem("currentUser");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.role === "customer" && parsed.address) {
          const addr = parsed.address.toLowerCase();
          if (addr.includes("indiranagar")) return { lat: 12.9719, lng: 77.6412 };
          if (addr.includes("btm")) return { lat: 12.9166, lng: 77.6101 };
          if (addr.includes("jayanagar")) return { lat: 12.9308, lng: 77.5838 };
        }
      }
    } catch (e) {
      console.error(e);
    }
    return { lat: 12.9719, lng: 77.6412 }; // Default to Indiranagar to show distance badges immediately
  });
  const [isLocating, setIsLocating] = useState(false);
  const [osmRestaurants, setOsmRestaurants] = useState([]);

  // Fetch real-time restaurants in the user's location via backend cached proxy
  const fetchNearbyOSMRestaurants = async (lat, lng) => {
    try {
      const response = await fetch(
        `/api/nearby-restaurants?lat=${lat}&lng=${lng}`
      );
      if (!response.ok) throw new Error("OSM search failed");
      const data = await response.json();

      const parsed = data.map((place, index) => {
        const name = place.name || place.display_name.split(",")[0];

        // Extract exact street details from display_name (drop name if duplicated)
        const addressParts = place.display_name.split(",");
        if (addressParts[0].trim().toLowerCase() === name.toLowerCase()) {
          addressParts.shift();
        }
        const fullStreetAddress = addressParts.slice(0, 3).map(part => part.trim()).join(", ");

        const cuisines = ["Cafe", "Indian", "Pizza & Pasta", "Fast Food", "Bakery & Desserts", "Biryani"];
        const cuisine = cuisines[index % cuisines.length];

        const imageOptions = [
          "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800",
          "https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg",
          "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800",
          "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800"
        ];

        return {
          _id: `osm_${place.place_id || index}`,
          name: name, // Clean name without neighborhood suffix
          cctvStreamUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
          safeBiteAIScore: 85 + (index * 3) % 15,
          mediaUploadTimeline: [
            {
              _id: `osm_t_${index}`,
              uploadedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
              imageStoragePath: "/uploads/seed_kitchen_3.jpg",
              visionVerificationScore: 90 + (index * 2) % 10,
              detectedViolations: [],
              predictions: [
                { label: "apron", confidence: 0.92, bbox: [150, 120, 350, 450] },
                { label: "cap", confidence: 0.88, bbox: [200, 20, 300, 100] }
              ]
            }
          ],
          meta: {
            image: imageOptions[index % imageOptions.length],
            rating: (4.2 + (index * 0.1) % 0.6).toFixed(1),
            reviews: `${20 + index * 40}+`,
            cuisine: cuisine,
            location: fullStreetAddress || "Nearby",
            time: `${15 + index * 5}-${20 + index * 5} mins`,
            lat: parseFloat(place.lat),
            lng: parseFloat(place.lon)
          }
        };
      });
      setOsmRestaurants(parsed);
    } catch (e) {
      console.warn("Could not fetch real-time restaurants from OpenStreetMap:", e);
      setOsmRestaurants([]);
    }
  };

  // Handle fetching real-time restaurants when coordinates update
  useEffect(() => {
    if (userCoords) {
      fetchNearbyOSMRestaurants(userCoords.lat, userCoords.lng);
    } else {
      setOsmRestaurants([]);
    }
  }, [userCoords]);

  // Authenticated user state
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem("currentUser");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Synchronize location coordinates when current user logs in or out
  useEffect(() => {
    if (currentUser && currentUser.role === "customer" && currentUser.address) {
      const addr = currentUser.address.toLowerCase();
      if (addr.includes("indiranagar")) {
        setUserCoords({ lat: 12.9719, lng: 77.6412 });
      } else if (addr.includes("btm")) {
        setUserCoords({ lat: 12.9166, lng: 77.6101 });
      } else if (addr.includes("jayanagar")) {
        setUserCoords({ lat: 12.9308, lng: 77.5838 });
      } else {
        setUserCoords({ lat: 12.9719, lng: 77.6412 });
      }
    } else {
      setUserCoords({ lat: 12.9719, lng: 77.6412 });
    }
  }, [currentUser]);

  // Synchronize state changes to URL hash
  useEffect(() => {
    const currentHash = window.location.hash;
    let targetHash = "#/";
    if (activeTab === "home") targetHash = "#/";
    else if (activeTab === "auth-customer") targetHash = "#/auth/customer";
    else if (activeTab === "auth-merchant") targetHash = "#/auth/merchant";
    else targetHash = `#/${activeTab}`;

    if (currentHash !== targetHash) {
      window.location.hash = targetHash;
    }
  }, [activeTab]);

  // Synchronize hash changes (browser back/forward button) to state
  useEffect(() => {
    const handleHashChange = () => {
      setActiveTab(getTabFromHash());
    };
    window.addEventListener("hashchange", handleHashChange);

    // Set initial hash on mount if empty
    if (!window.location.hash) {
      window.location.hash = "#/";
    }

    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Clear selected restaurant when navigating away from the merchant portal (profile tab)
  const prevTabRef = useRef(activeTab);
  useEffect(() => {
    if (prevTabRef.current === "profile" && activeTab !== "profile") {
      setSelectedRes(null);
    }
    prevTabRef.current = activeTab;
  }, [activeTab]);

  const fetchRestaurants = async () => {
  try {
    const response = await fetch("/api/restaurants");

    if (!response.ok) {
      throw new Error("Failed to load restaurants database");
    }

    const data = await response.json();
    setRestaurants(data);
    setError(null); // Clear any previous errors on success
    setIsLoading(false);
  } catch (e) {
    console.error(e);
    setError(e.message);
    setIsLoading(false);
  }
};

  useEffect(() => {
    fetchRestaurants();
    // Poll updates every 10 seconds to keep warning state / score live
    const interval = setInterval(fetchRestaurants, 10000);
    return () => clearInterval(interval);
  }, []);

  // When restaurant list is loaded, select the first one if merchant
  useEffect(() => {
    if (restaurants.length > 0 && !selectedRes) {
      // If merchant is logged in, select their linked store first
      if (activeTab === "profile" && currentUser && currentUser.role === "merchant" && currentUser.linkedRestaurantId) {
        const linked = restaurants.find(r => r._id === currentUser.linkedRestaurantId);
        if (linked) {
          setSelectedRes(linked);
          return;
        }
      }
    } else if (selectedRes && restaurants.length > 0) {
      // Keep the selected restaurant data updated with new polled scores
      const updated = restaurants.find(r => r._id === selectedRes._id);
      if (updated) {
        setSelectedRes(updated);
      }
    }
  }, [restaurants, selectedRes, currentUser, activeTab]);

  const handleSelectRestaurant = (res) => {
    setSelectedRes(res);
  };

  const handleUploadSuccess = (updatedRes) => {
    // Instantly update the restaurant lists with new details
    setRestaurants(prev => prev.map(r => r._id === updatedRes._id ? updatedRes : r));
    setSelectedRes(updatedRes);
  };

  const handleLogin = (user) => {
    setCurrentUser(user);
    if (user.role === "merchant") {
      const linked = restaurants.find(r => r._id === user.linkedRestaurantId) || restaurants[0];
      if (linked) {
        setSelectedRes(linked);
      }
      setActiveTab("profile");
    } else {
      setActiveTab("home");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    setCurrentUser(null);
    setActiveTab("home");
  };

  const handleOrderPlacement = async (restaurant, selectedItem) => {
    if (!restaurant) {
      setActiveTab("auth-customer");
      return;
    }

    const mealOptions = [
      "1x Classic Margherita Pizza & Soft Drink",
      "1x Special Paneer Biryani & Cold Beverage",
      "1x Premium Double Veg Cheese Burger & Fries",
      "1x Authentic South Indian Thali"
    ];
    const itemText = selectedItem
      ? `1x ${selectedItem.name} (₹${selectedItem.price})`
      : mealOptions[Math.floor(Math.random() * mealOptions.length)];

    const timeStr = restaurant.meta?.time || "25 mins";
    const minutes = parseInt(timeStr.split("-").pop()) || 25;

    const newOrder = {
      id: "ord_" + Date.now() + Math.random().toString(36).substr(2, 4),
      restaurantId: restaurant._id,
      restaurantName: restaurant.name,
      score: restaurant.safeBiteAIScore,
      timestamp: new Date().toISOString(),
      item: itemText,
      deliveryDuration: minutes
    };

    let updatedUser = {
      ...currentUser,
      orderHistory: [newOrder, ...(currentUser.orderHistory || [])]
    };

    if (currentUser && (currentUser.id || currentUser._id)) {
      try {
        const userId = currentUser.id || currentUser._id;
        const response = await fetch(`/api/users/${userId}/order`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: newOrder })
        });
        if (response.ok) {
          const freshUser = await response.json();
          updatedUser = {
            ...freshUser,
            id: freshUser._id || freshUser.id
          };
        }
      } catch (err) {
        console.error("Failed to sync order to database:", err);
      }
    }

    setCurrentUser(updatedUser);
    localStorage.setItem("currentUser", JSON.stringify(updatedUser));

    alert(`🎉 Order placed successfully at ${restaurant.name.split(" (")[0]}!\nItem: ${itemText}\nSafeBite is active and monitoring kitchen safety in real-time.`);
    setActiveTab("orders");
  };

  // Filter and process restaurants based on category, search, and coordinates
  const dbProcessed = restaurants.map(res => {
    const defaultMeta = restaurantMetaData[res.name] || {
      image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800",
      rating: "4.3",
      reviews: "100+",
      cuisine: "Multi-Cuisine",
      location: "Bangalore",
      time: "30-40 mins",
      lat: 12.9756,
      lng: 77.6067
    };

    let meta = { ...defaultMeta };
    
    if (res.location) {
      meta.location = res.location;
      const addr = res.location.toLowerCase();
      // Simple mock geocoding based on address keyword
      if (addr.includes("indiranagar")) {
        meta.lat = 12.9719;
        meta.lng = 77.6412;
      } else if (addr.includes("btm")) {
        meta.lat = 12.9166;
        meta.lng = 77.6101;
      } else if (addr.includes("jayanagar")) {
        meta.lat = 12.9308;
        meta.lng = 77.5838;
      }
    } else if (userCoords) {
      // Mock close-by coordinates relative to the user to place old DB elements near them
      if (res.name.includes("Pizza")) {
        meta.lat = userCoords.lat - 0.006;
        meta.lng = userCoords.lng + 0.008;
      } else if (res.name.includes("Biryani")) {
        meta.lat = userCoords.lat + 0.004;
        meta.lng = userCoords.lng - 0.005;
      } else {
        meta.lat = userCoords.lat + 0.009;
        meta.lng = userCoords.lng + 0.011;
      }
    }

    const distance = userCoords
      ? calculateDistance(userCoords.lat, userCoords.lng, meta.lat, meta.lng)
      : null;

    return {
      ...res,
      meta,
      distance
    };
  });

  const osmProcessed = osmRestaurants.map(res => {
    const distance = userCoords
      ? calculateDistance(userCoords.lat, userCoords.lng, res.meta.lat, res.meta.lng)
      : null;
    return {
      ...res,
      distance
    };
  });

  const allProcessed = [...dbProcessed, ...osmProcessed];

  // Sort by distance if location tracking is active
  if (userCoords) {
    allProcessed.sort((a, b) => a.distance - b.distance);
  }

  const filteredRestaurants = allProcessed.filter(res => {
    // Strictly show only restaurants within 3km of the user when location services are active
    const matchesDistance = !userCoords || (res.distance !== null && res.distance <= 3);

    const matchesSearch = res.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.meta.cuisine.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.meta.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = !selectedCategory ||
      res.meta.cuisine.toLowerCase().includes(selectedCategory.toLowerCase());

    return matchesDistance && matchesSearch && matchesCategory;
  });

  return (
    <div className="app">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onLogout={handleLogout}
        onHomeClick={() => {
          setSelectedRes(null);
          setActiveTab("home");
        }}
      />

      {activeTab === "home" && (
        <main className="container">
          <Hero
            query={searchQuery}
            setQuery={setSearchQuery}
            userCoords={userCoords}
            setUserCoords={setUserCoords}
            isLocating={isLocating}
            setIsLocating={setIsLocating}
          />

          <Categories
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
          />

          <div className="content-grid" style={{ gridTemplateColumns: "1fr" }}>
            <div className="left-panel" style={{ width: "100%", maxWidth: "1100px", margin: "0 auto" }}>
              <div className="section-title">
                <h2>Verified Kitchens Near You</h2>
                <p>Trusted restaurants with AI verified hygiene</p>
              </div>

              {isLoading ? (
                <div style={{ padding: "2rem", textAlign: "center", color: "#666" }}>
                  Loading secure restaurant list...
                </div>
              ) : error ? (
                <div style={{ padding: "2rem", textAlign: "center", color: "red" }}>
                  Error fetching data: {error}
                </div>
              ) : filteredRestaurants.length === 0 ? (
                <div style={{ padding: "2rem", textAlign: "center", color: "#666" }}>
                  No restaurants found matching your criteria.
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(330px, 1fr))", gap: "25px" }}>
                  {filteredRestaurants.map((res) => (
                    <RestaurantCard
                      key={res._id}
                      image={res.meta.image}
                      name={res.name}
                      rating={res.meta.rating}
                      reviews={res.meta.reviews}
                      cuisine={res.meta.cuisine}
                      location={res.meta.location}
                      time={res.meta.time}
                      score={res.safeBiteAIScore}
                      isSelected={selectedRes?._id === res._id}
                      onWatchKitchen={() => handleSelectRestaurant(res)}
                      distance={res.distance}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      )}

      {/* Glassmorphic Overlay Modal for Live Kitchen Feed & Food Menu */}
      {selectedRes && activeTab === "home" && (
        <div
          className="modal-backdrop"
          onClick={() => setSelectedRes(null)} // Close when clicking backdrop
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(11, 15, 25, 0.75)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            zIndex: 1000,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "20px",
          }}
        >
          <div
            className="modal-container"
            onClick={(e) => e.stopPropagation()} // Prevent close on modal content click
            style={{
              background: "white",
              width: "100%",
              maxWidth: "1000px",
              maxHeight: "92vh",
              borderRadius: "28px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.35)",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              position: "relative"
            }}
          >
            {/* Modal Header */}
            <div style={{
              padding: "20px 30px",
              borderBottom: "1.5px solid #eee",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: "#fafafa"
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "18px", color: "#2d2d2d", fontWeight: "700" }}>
                  {selectedRes.name}
                </h3>
                <span style={{ fontSize: "12px", color: "#666" }}>
                  📍 {selectedRes.meta?.location || "Bangalore"} • {selectedRes.meta?.cuisine || "Multi-Cuisine"}
                </span>
              </div>
              <button
                onClick={() => setSelectedRes(null)}
                style={{
                  background: "#eee",
                  border: "none",
                  color: "#333",
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  cursor: "pointer",
                  fontSize: "18px",
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "background 0.2s ease"
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ overflowY: "auto", flex: 1, padding: "30px" }}>
              <LiveKitchen
                restaurant={selectedRes}
                currentUser={currentUser}
                onOrder={handleOrderPlacement}
                hideHeader={true}
              />
            </div>
          </div>
        </div>
      )}

      {/* Animation rule overrides */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(40px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .modal-backdrop {
          animation: fadeIn 0.25s ease-out forwards;
        }
        .modal-container {
          animation: slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      {activeTab === "analytics" && (
        <Analytics restaurants={restaurants} />
      )}

      {activeTab === "guidelines" && (
        <Guidelines />
      )}

      {activeTab === "auth-customer" && (
        <Auth
          role="customer"
          restaurants={restaurants}
          onLogin={handleLogin}
          onCancel={() => setActiveTab("home")}
        />
      )}

      {activeTab === "auth-merchant" && (
        <Auth
          role="merchant"
          restaurants={restaurants}
          onLogin={handleLogin}
          onCancel={() => setActiveTab("home")}
        />
      )}

      {activeTab === "orders" && (
        <Orders
          user={currentUser}
          onWatchKitchen={(restId) => {
            if (restId) {
              const target = restaurants.find(r => r._id === restId);
              if (target) setSelectedRes(target);
            }
            setActiveTab("home");
          }}
        />
      )}

      {activeTab === "profile" && (
        <main className="container" style={{ minHeight: "calc(100vh - 200px)", paddingTop: "40px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
            <div className="section-title">
              <h2>Merchant Verification Console</h2>
              <p>Upload active back-of-house kitchen checks and trigger automated YOLOv8 compliance checks</p>
            </div>

            {restaurants.length > 0 ? (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 3fr", gap: "30px" }}>

                {/* Store selection menu */}
                <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                  <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "5px" }}>Selected Store</h3>
                  {currentUser && currentUser.role === "merchant" ? (
                    // Lock owners to their store, or let them switch if they own multiple. Here, we restrict to their linked store
                    restaurants.filter(r => r._id === currentUser.linkedRestaurantId).map(r => (
                      <button
                        key={r._id}
                        disabled
                        style={{
                          padding: "15px 20px",
                          borderRadius: "14px",
                          textAlign: "left",
                          background: "#FC8019",
                          color: "white",
                          boxShadow: "0 4px 15px rgba(0,0,0,.04)",
                          fontWeight: "600",
                          fontSize: "14px",
                          border: "none",
                          width: "100%"
                        }}
                      >
                        {r.name.split(" (")[0]}
                      </button>
                    ))
                  ) : (
                    restaurants.map(r => (
                      <button
                        key={r._id}
                        onClick={() => setSelectedRes(r)}
                        style={{
                          padding: "15px 20px",
                          borderRadius: "14px",
                          textAlign: "left",
                          background: selectedRes?._id === r._id ? "#FC8019" : "white",
                          color: selectedRes?._id === r._id ? "white" : "#2d2d2d",
                          boxShadow: "0 4px 15px rgba(0,0,0,.04)",
                          fontWeight: "600",
                          fontSize: "14px",
                          transition: ".3s"
                        }}
                      >
                        {r.name.split(" (")[0]}
                      </button>
                    ))
                  )}
                </div>

                {selectedRes && (
                  <MerchantConsole
                    restaurant={selectedRes}
                    onUploadSuccess={handleUploadSuccess}
                  />
                )}
              </div>
            ) : (
              <div style={{ padding: "3rem", textAlign: "center", background: "white", borderRadius: "22px" }}>
                Loading merchant stores...
              </div>
            )}
          </div>
        </main>
      )}

      <Footer />
    </div>
  );
}

export default App;