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
  onWatchKitchen
}) {
  return (
    <div 
      className={`restaurant-card ${isSelected ? "selected-card" : ""}`}
      onClick={onWatchKitchen}
      style={{
        border: isSelected ? "2px solid #FC8019" : "2px solid transparent",
        transition: "all 0.3s ease",
        cursor: "pointer"
      }}
    >
      <img src={image} alt={name} />

      <div className="restaurant-info">
        <div className="restaurant-top">
          <h3>{name}</h3>
          <span 
            className="score"
            style={{
              background: score >= 80 ? "#e9fff2" : "#fff5f5",
              color: score >= 80 ? "#18a65d" : "#e53e3e"
            }}
          >
            {score}%
          </span>
        </div>

        <div className="rating">
          <Star fill="#FC8019" strokeWidth={0} size={18} />
          <span>{rating}</span>
          <small>({reviews})</small>
        </div>

        <p style={{ color: "#666", fontSize: "14px" }}>{cuisine}</p>

        <div className="meta">
          <span>
            <MapPin size={16} />
            {location}
          </span>
          <span>
            <Clock size={16} />
            {time}
          </span>
        </div>

        <div className="restaurant-bottom">
          <span 
            className="verified"
            style={{
              color: score >= 80 ? "#18a65d" : "#e53e3e"
            }}
          >
            <ShieldCheck size={16} />
            {score >= 80 ? "AI Verified" : "Suspended"}
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
              padding: "12px 18px",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              cursor: "pointer",
              transition: "background 0.3s ease"
            }}
          >
            <Video size={18} />
            {isSelected ? "Active Feed" : "Watch Kitchen"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default RestaurantCard;