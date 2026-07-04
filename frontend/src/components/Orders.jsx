import React from "react";
import { ShoppingBag, Calendar, ShieldCheck, Play, ArrowRight } from "lucide-react";

export default function Orders({ user, onWatchKitchen }) {
  // Pull order logs from local storage or fallback to empty array
  const orderHistory = user?.orderHistory || [];

  return (
    <main className="container" style={{ padding: "40px 0", minHeight: "calc(100vh - 200px)" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "25px" }}>
        
        {/* Title */}
        <div className="section-title" style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: 0 }}>
          <div style={{ background: "#FC8019", padding: "8px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
            <ShoppingBag size={24} />
          </div>
          <div>
            <h2 style={{ margin: 0 }}>Your Safety Monitored Orders</h2>
            <p style={{ margin: 0 }}>Chronological history of purchases audited by SafeBite AI</p>
          </div>
        </div>

        {orderHistory.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {orderHistory.map((order) => {
              const orderDate = new Date(order.timestamp).toLocaleString();
              return (
                <div 
                  key={order.id} 
                  className="restaurant-card"
                  style={{ 
                    flexDirection: "row", 
                    padding: "24px", 
                    alignItems: "center", 
                    justifyContent: "space-between",
                    gap: "20px",
                    margin: 0
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <h3 style={{ fontSize: "18px", margin: 0 }}>{order.restaurantName.split(" (")[0]}</h3>
                      <span 
                        style={{
                          fontSize: "12px",
                          color: "#18a65d",
                          background: "#e9fff2",
                          padding: "4px 10px",
                          borderRadius: "10px",
                          fontWeight: "600",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px"
                        }}
                      >
                        <ShieldCheck size={14} /> Verified
                      </span>
                    </div>

                    <p style={{ fontSize: "14px", color: "#555", margin: 0 }}>
                      Ordered: <strong>{order.item}</strong>
                    </p>

                    <div style={{ display: "flex", gap: "15px", color: "#777", fontSize: "12px", marginTop: "4px" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <Calendar size={14} /> {orderDate}
                      </span>
                      <span>Order ID: #{order.id.slice(-6).toUpperCase()}</span>
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "12px" }}>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontSize: "11px", color: "#888", display: "block" }}>Hygiene Score</span>
                      <strong style={{ fontSize: "20px", color: "#18a65d" }}>{order.score}%</strong>
                    </div>
                    
                    <button
                      onClick={() => onWatchKitchen(order.restaurantId)}
                      style={{
                        padding: "10px 15px",
                        background: "#FC8019",
                        color: "white",
                        borderRadius: "10px",
                        fontWeight: "600",
                        fontSize: "12px",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        cursor: "pointer",
                        boxShadow: "0 4px 15px rgba(252,128,25,0.15)",
                        transition: "all 0.3s ease"
                      }}
                    >
                      <Play size={12} fill="white" /> Watch Prep Live
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ padding: "50px 30px", textAlign: "center", background: "white", borderRadius: "22px", color: "#888", border: "1.5px solid #eee" }}>
            <ShoppingBag size={48} style={{ color: "#ccc", marginBottom: "15px" }} />
            <h3 style={{ fontSize: "18px", color: "#2d2d2d", fontWeight: "600", margin: 0 }}>No orders placed yet</h3>
            <p style={{ fontSize: "14px", color: "#777", marginTop: "6px", marginBottom: "20px" }}>
              Explore verified kitchens near you, check their live cameras, and place an order.
            </p>
            <button
              onClick={() => onWatchKitchen(null)}
              style={{
                padding: "12px 24px",
                background: "#FC8019",
                color: "white",
                borderRadius: "12px",
                fontWeight: "600",
                fontSize: "14px",
                border: "none",
                cursor: "pointer",
                boxShadow: "0 4px 15px rgba(252,128,25,0.15)",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px"
              }}
            >
              Browse Restaurants <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
