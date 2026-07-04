import React, { useState, useEffect } from "react";
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
  },
  "Biryani Zone (BTM Layout)": {
    image: "https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg",
    rating: "4.5",
    reviews: "980+",
    cuisine: "Noodles, North Indian",
    location: "BTM Layout",
    time: "25-30 mins",
  },
  "Sagar Ratna (Jayanagar)": {
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800",
    rating: "4.4",
    reviews: "720+",
    cuisine: "Fast Food, South Indian",
    location: "Jayanagar",
    time: "20-25 mins",
  }
};

function App() {
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRes, setSelectedRes] = useState(null);
  const [activeTab, setActiveTab] = useState("home"); // home, analytics, guidelines, profile, orders, auth
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  // Authenticated user state
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem("currentUser");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const fetchRestaurants = async () => {
    try {
      const response = await fetch("/api/restaurants");
      if (!response.ok) throw new Error("Failed to load restaurants database");
      const data = await response.json();
      setRestaurants(data);
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

  // When restaurant list is loaded, select the first one if none is selected
  useEffect(() => {
    if (restaurants.length > 0 && !selectedRes) {
      // If merchant is logged in, select their linked store first
      if (currentUser && currentUser.role === "merchant" && currentUser.linkedRestaurantId) {
        const linked = restaurants.find(r => r._id === currentUser.linkedRestaurantId);
        if (linked) {
          setSelectedRes(linked);
          return;
        }
      }
      setSelectedRes(restaurants[0]);
    } else if (selectedRes && restaurants.length > 0) {
      // Keep the selected restaurant data updated with new polled scores
      const updated = restaurants.find(r => r._id === selectedRes._id);
      if (updated) {
        setSelectedRes(updated);
      }
    }
  }, [restaurants, selectedRes, currentUser]);

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

  const handleOrderPlacement = (restaurant) => {
    if (!restaurant) {
      setActiveTab("auth");
      return;
    }

    const mealOptions = [
      "1x Classic Margherita Pizza & Soft Drink",
      "1x Special Paneer Biryani & Cold Beverage",
      "1x Premium Double Veg Cheese Burger & Fries",
      "1x Authentic South Indian Thali"
    ];
    const randomMeal = mealOptions[Math.floor(Math.random() * mealOptions.length)];

    const newOrder = {
      id: "ord_" + Date.now() + Math.random().toString(36).substr(2, 4),
      restaurantId: restaurant._id,
      restaurantName: restaurant.name,
      score: restaurant.safeBiteAIScore,
      timestamp: new Date().toISOString(),
      item: randomMeal
    };

    const updatedUser = {
      ...currentUser,
      orderHistory: [newOrder, ...(currentUser.orderHistory || [])]
    };

    setCurrentUser(updatedUser);
    localStorage.setItem("currentUser", JSON.stringify(updatedUser));

    alert(`🎉 Order placed successfully at ${restaurant.name.split(" (")[0]}!\nItem: ${randomMeal}\nSafeBite is active and monitoring kitchen safety in real-time.`);
    setActiveTab("orders");
  };

  // Filter restaurants based on category and search query
  const filteredRestaurants = restaurants.map(res => {
    const meta = restaurantMetaData[res.name] || {
      image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800",
      rating: "4.3",
      reviews: "100+",
      cuisine: "Multi-Cuisine",
      location: "Bangalore",
      time: "30-40 mins",
    };
    return {
      ...res,
      meta
    };
  }).filter(res => {
    const matchesSearch = res.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.meta.cuisine.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.meta.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = !selectedCategory ||
      res.meta.cuisine.toLowerCase().includes(selectedCategory.toLowerCase());

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="app">
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        currentUser={currentUser} 
        onLogout={handleLogout} 
      />

      {activeTab === "home" && (
        <main className="container">
          <Hero query={searchQuery} setQuery={setSearchQuery} />

          <Categories 
            selectedCategory={selectedCategory} 
            setSelectedCategory={setSelectedCategory} 
          />

          <div className="content-grid">
            <div className="left-panel">
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
                filteredRestaurants.map((res) => (
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
                  />
                ))
              )}
            </div>

            <div className="right-panel">
              <LiveKitchen 
                restaurant={selectedRes} 
                currentUser={currentUser} 
                onOrder={handleOrderPlacement} 
              />
            </div>
          </div>
        </main>
      )}

      {activeTab === "analytics" && (
        <Analytics restaurants={restaurants} />
      )}

      {activeTab === "guidelines" && (
        <Guidelines />
      )}

      {activeTab === "auth" && (
        <Auth 
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