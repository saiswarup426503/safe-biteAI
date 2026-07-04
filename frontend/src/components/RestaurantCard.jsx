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
}) {
  return (
    <div className="restaurant-card">

      <img src={image} alt={name} />

      <div className="restaurant-info">

        <div className="restaurant-top">

          <h3>{name}</h3>

          <span className="score">
            {score}%
          </span>

        </div>

        <div className="rating">

          <Star fill="#FC8019" strokeWidth={0} size={18} />

          <span>{rating}</span>

          <small>({reviews})</small>

        </div>

        <p>{cuisine}</p>

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

          <span className="verified">

            <ShieldCheck size={16} />

            AI Verified

          </span>

          <button>

            <Video size={18} />

            Watch Kitchen

          </button>

        </div>

      </div>

    </div>
  );
}

export default RestaurantCard;