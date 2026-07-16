import React, { useState } from "react";
import { User, Lock, Mail, MapPin, Store, ShieldAlert } from "lucide-react";

export default function Auth({ role = "customer", restaurants, onLogin, onCancel }) {
  const [mode, setMode] = useState("login"); // login, register
  
  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [address, setAddress] = useState(""); // customer delivery address
  const [restaurantName, setRestaurantName] = useState("");
  const [restaurantAddress, setRestaurantAddress] = useState("");
  
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password || (mode === "register" && !name)) {
      setError("Please fill out all required fields.");
      return;
    }

    if (role === "merchant" && mode === "register" && !restaurantName) {
      setError("Please provide your restaurant name.");
      return;
    }

    const payload = {
      name,
      email,
      password,
      role,
      address,
      restaurantName,
      restaurantAddress
    };

    try {
      const endpoint = mode === "register" ? "/api/auth/register" : "/api/auth/login";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      // Map standard frontend attributes
      const userObj = {
        ...data,
        id: data._id || data.id // Ensure both id fields are present
      };

      // Save to localStorage
      localStorage.setItem("currentUser", JSON.stringify(userObj));
      onLogin(userObj);
    } catch (err) {
      setError(err.message || "An error occurred during authentication.");
    }
  };

  return (
    <main className="container" style={{ padding: "60px 0", minHeight: "calc(100vh - 200px)", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <div 
        className="live-kitchen" 
        style={{ 
          position: "static", 
          maxWidth: "480px", 
          width: "100%", 
          padding: "35px",
          boxShadow: "0 15px 45px rgba(0,0,0,.08)"
        }}
      >


        {/* Header Title */}
        <div style={{ textAlign: "center", marginBottom: "25px" }}>
          <h2 style={{ fontSize: "24px", fontWeight: "700", color: "#2d2d2d" }}>
            {mode === "login" ? "Welcome Back" : "Create Account"}
          </h2>
          <p style={{ fontSize: "14px", color: "#777", marginTop: "4px" }}>
            {role === "customer" 
              ? "Access live-monitored kitchens & place orders" 
              : "Manage audits and view YOLO compliance scores"}
          </p>
        </div>

        {error && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#fff5f5", color: "#e53e3e", padding: "12px 15px", borderRadius: "12px", fontSize: "13px", fontWeight: "500", marginBottom: "20px" }}>
            <ShieldAlert size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          
          {mode === "register" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "12px", fontWeight: "600", color: "#555" }}>Full Name</label>
              <div className="search" style={{ margin: 0, padding: "12px 16px", borderRadius: "12px", background: "#fdfcfa", border: "1.5px solid #eee" }}>
                <User size={16} color="#888" />
                <input 
                  type="text" 
                  placeholder="John Doe" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  style={{ fontSize: "14px", marginLeft: "10px" }}
                />
              </div>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "12px", fontWeight: "600", color: "#555" }}>Email Address</label>
            <div className="search" style={{ margin: 0, padding: "12px 16px", borderRadius: "12px", background: "#fdfcfa", border: "1.5px solid #eee" }}>
              <Mail size={16} color="#888" />
              <input 
                type="email" 
                placeholder="you@example.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                style={{ fontSize: "14px", marginLeft: "10px" }}
              />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "12px", fontWeight: "600", color: "#555" }}>Password</label>
            <div className="search" style={{ margin: 0, padding: "12px 16px", borderRadius: "12px", background: "#fdfcfa", border: "1.5px solid #eee" }}>
              <Lock size={16} color="#888" />
              <input 
                type="password" 
                placeholder="••••••••" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                style={{ fontSize: "14px", marginLeft: "10px" }}
              />
            </div>
          </div>

          {/* Customer Extra Field */}
          {role === "customer" && mode === "register" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "12px", fontWeight: "600", color: "#555" }}>Delivery Address</label>
              <div className="search" style={{ margin: 0, padding: "12px 16px", borderRadius: "12px", background: "#fdfcfa", border: "1.5px solid #eee" }}>
                <MapPin size={16} color="#888" />
                <input 
                  type="text" 
                  placeholder="Flat, Building, Street Name" 
                  value={address} 
                  onChange={(e) => setAddress(e.target.value)}
                  style={{ fontSize: "14px", marginLeft: "10px" }}
                />
              </div>
            </div>
          )}

          {/* Merchant Extra Field */}
          {role === "merchant" && mode === "register" && (
            <>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "12px", fontWeight: "600", color: "#555" }}>Restaurant Name</label>
                <div className="search" style={{ margin: 0, padding: "12px 16px", borderRadius: "12px", background: "#fdfcfa", border: "1.5px solid #eee" }}>
                  <Store size={16} color="#888" />
                  <input
                    type="text"
                    placeholder="e.g. Spice Symphony"
                    value={restaurantName}
                    onChange={(e) => setRestaurantName(e.target.value)}
                    style={{
                      border: "none",
                      outline: "none",
                      background: "transparent",
                      width: "100%",
                      fontSize: "14px",
                      marginLeft: "10px",
                      color: "#2d2d2d"
                    }}
                  />
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "12px", fontWeight: "600", color: "#555" }}>Restaurant Address</label>
                <div className="search" style={{ margin: 0, padding: "12px 16px", borderRadius: "12px", background: "#fdfcfa", border: "1.5px solid #eee" }}>
                  <MapPin size={16} color="#888" />
                  <input
                    type="text"
                    placeholder="e.g. Indiranagar, Bangalore"
                    value={restaurantAddress}
                    onChange={(e) => setRestaurantAddress(e.target.value)}
                    style={{
                      border: "none",
                      outline: "none",
                      background: "transparent",
                      width: "100%",
                      fontSize: "14px",
                      marginLeft: "10px",
                      color: "#2d2d2d"
                    }}
                  />
                </div>
              </div>
            </>
          )}

          <button 
            type="submit" 
            className="order-btn" 
            style={{ 
              marginTop: "10px", 
              boxShadow: "0 6px 20px rgba(252,128,25,0.2)",
              cursor: "pointer"
            }}
          >
            {mode === "login" ? "Sign In" : "Sign Up"}
          </button>

          <button 
            type="button" 
            onClick={onCancel}
            style={{ 
              background: "transparent",
              color: "#666",
              padding: "10px",
              borderRadius: "12px",
              fontSize: "13px",
              fontWeight: "500",
              cursor: "pointer",
              transition: "color 0.2s"
            }}
          >
            Cancel and Return Home
          </button>
        </form>

        {/* Footer switch view */}
        <div style={{ textAlign: "center", marginTop: "20px", fontSize: "14px", color: "#666" }}>
          {mode === "login" ? (
            <>
              Don't have an account?{" "}
              <span 
                onClick={() => { setMode("register"); setError(""); }} 
                style={{ color: "#FC8019", fontWeight: "600", cursor: "pointer" }}
              >
                Sign Up
              </span>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <span 
                onClick={() => { setMode("login"); setError(""); }} 
                style={{ color: "#FC8019", fontWeight: "600", cursor: "pointer" }}
              >
                Sign In
              </span>
            </>
          )}
        </div>

        {/* Separate gateway links for real website experience */}
        <div style={{ textAlign: "center", marginTop: "18px", paddingTop: "18px", borderTop: "1.5px dashed #eee", fontSize: "13px", color: "#777" }}>
          {role === "customer" ? (
            <>
              Are you a restaurant partner?{" "}
              <a 
                href="#/auth/merchant" 
                style={{ color: "#FC8019", fontWeight: "600", textDecoration: "underline" }}
              >
                Merchant Portal Login
              </a>
            </>
          ) : (
            <>
              Looking for the customer site?{" "}
              <a 
                href="#/auth/customer" 
                style={{ color: "#FC8019", fontWeight: "600", textDecoration: "underline" }}
              >
                Go to Customer Login
              </a>
            </>
          )}
        </div>

      </div>
    </main>
  );
}
