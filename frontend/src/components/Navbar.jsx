import { Home, UtensilsCrossed, ShoppingBag, Video, User } from "lucide-react";

function Navbar() {
  return (
    <header className="navbar">

      <div className="logo">

        <div className="logo-icon">
          🛡️
        </div>

        <div>
          <h2>SafeBite AI</h2>
          <p>Trust Every Bite.</p>
        </div>

      </div>

      <nav>

        <a className="active" href="#">
          <Home size={18} />
          Home
        </a>

        <a href="#">
          <UtensilsCrossed size={18} />
          Restaurants
        </a>

        <a href="#">
          <ShoppingBag size={18} />
          Orders
        </a>

        <a href="#">
          <Video size={18} />
          Live Kitchen
        </a>

        <a href="#">
          <User size={18} />
          Profile
        </a>

      </nav>

    </header>
  );
}

export default Navbar;