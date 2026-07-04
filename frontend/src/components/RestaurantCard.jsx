import React, { useState } from "react";
import { Star, MapPin, Clock, ShieldCheck, Video } from "lucide-react";

function RestaurantCard({
  image,
  name,
  rating,
  reviews,
  cuisine,
  location,
  time,
  score,
  isSelected,
  onWatchKitchen,
  distance
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onClick={onWatchKitchen}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: "white",
        borderRadius: "24px",
        overflow: "hidden",
        boxShadow: isHovered
          ? "0 12px 30px rgba(0, 0, 0, 0.12)"
          : "0 4px 20px rgba(0, 0, 0, 0.05)",
        border: isSelected
          ? "2px solid #FC8019"
          : "2px solid #f0f0f0",
        transform: isHovered ? "translateY(-6px)" : "translateY(0)",
        transition: "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        height: "100%",
        minHeight: "360px"
      }}
    >
      {/* Image Container with Badges */}
      <div style={{ position: "relative", width: "100%", height: "180px", overflow: "hidden", background: "#f7f7f7" }}>
        <img
          src={image}
          alt={name}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: isHovered ? "scale(1.06)" : "scale(1)",
            transition: "transform 0.4s ease"
          }}
        />

        {/* Score Overlay (Top Right) */}
        <div
          style={{
            position: "absolute",
            top: "12px",
            right: "12px",
            background: score >= 80 ? "rgba(24, 166, 93, 0.95)" : "rgba(229, 62, 62, 0.95)",
            color: "white",
            padding: "5px 12px",
            borderRadius: "30px",
            fontSize: "11px",
            fontWeight: "700",
            boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            gap: "4px"
          }}
        >
          <ShieldCheck size={14} />
          <span>{score}% Hygiene</span>
        </div>

        {/* Distance Overlay (Bottom Left) */}
        {distance !== null && distance !== undefined && (
          <div
            style={{
              position: "absolute",
              bottom: "12px",
              left: "12px",
              background: "rgba(11, 15, 25, 0.75)",
              color: "white",
              padding: "4px 10px",
              borderRadius: "30px",
              fontSize: "11px",
              fontWeight: "600",
              backdropFilter: "blur(4px)",
              WebkitBackdropFilter: "blur(4px)",
              display: "flex",
              alignItems: "center",
              gap: "4px"
            }}
          >
            <MapPin size={12} color="#FC8019" />
            <span>{distance} km away</span>
          </div>
        )}
      </div>

      {/* Info Section */}
      <div style={{ padding: "18px", display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "700", color: "#2d2d2d", lineHeight: "1.3" }}>
            {name.split(" (")[0]}
          </h3>
          <p style={{ margin: "4px 0 0 0", fontSize: "11px", color: "#888", fontWeight: "500" }}>
            📍 {location}
          </p>
        </div>

        <p style={{ margin: 0, color: "#666", fontSize: "13px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {cuisine}
        </p>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "2px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
            <Star fill="#FC8019" strokeWidth={0} size={15} />
            <span style={{ fontSize: "13px", fontWeight: "700", color: "#2d2d2d" }}>{rating}</span>
            <span style={{ fontSize: "11px", color: "#888" }}>({reviews})</span>
          </div>

          <span style={{ color: "#ddd", fontSize: "12px" }}>•</span>

          <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "#666" }}>
            <Clock size={14} />
            <span style={{ fontSize: "12px", fontWeight: "600" }}>{time}</span>
          </div>
        </div>

        {/* Card Footer Divider */}
        <div
          style={{
            marginTop: "auto",
            paddingTop: "12px",
            borderTop: "1.5px solid #f3f3f3",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          <span
            style={{
              fontSize: "12px",
              fontWeight: "600",
              color: score >= 80 ? "#18a65d" : "#e53e3e",
              display: "flex",
              alignItems: "center",
              gap: "4px"
            }}
          >
            <ShieldCheck size={15} />
            <span>{score >= 80 ? "AI Verified" : "Suspended"}</span>
          </span>

          <button
            onClick={(e) => {
              // Prevent duplicate event firing
              e.stopPropagation();
              onWatchKitchen();
            }}
            style={{
              background: isSelected ? "#18a65d" : "#FC8019",
              color: "white",
              padding: "6px 12px",
              borderRadius: "10px",
              fontSize: "12px",
              fontWeight: "700",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              transition: "background 0.3s ease"
            }}
          >
            <Video size={14} />
            <span>Watch Live</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default RestaurantCard;