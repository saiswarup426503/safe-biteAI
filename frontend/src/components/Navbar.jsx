import { Home, BookOpen, Video, ShoppingBag, Store, User, LogOut } from "lucide-react";

function Navbar({ activeTab, currentUser, onLogout, onHomeClick }) {
  return (
    <header className="navbar">
      <a href="#/" onClick={onHomeClick} className="logo" style={{ color: "inherit", display: "flex", alignItems: "center", gap: "15px" }}>
        <div className="logo-icon">
          🛡️
        </div>
        <div>
          <h2>SafeBite AI</h2>
          <p>Trust Every Bite.</p>
        </div>
      </a>

      <nav style={{ display: "flex", alignItems: "center", gap: "24px" }}>
        <a 
          className={activeTab === "home" ? "active" : ""} 
          href="#/"
          onClick={onHomeClick}
        >
          <Home size={18} />
          Home
        </a>

        <a 
          className={activeTab === "guidelines" ? "active" : ""} 
          href="#/guidelines"
        >
          <BookOpen size={18} />
          Guidelines
        </a>

        <a 
          className={activeTab === "analytics" ? "active" : ""} 
          href="#/analytics"
        >
          <Video size={18} />
          Analytics
        </a>

        {/* Customer Only Links */}
        {currentUser && currentUser.role === "customer" && (
          <a 
            className={activeTab === "orders" ? "active" : ""} 
            href="#/orders"
          >
            <ShoppingBag size={18} />
            My Orders
          </a>
        )}

        {/* Merchant Only Links */}
        {currentUser && currentUser.role === "merchant" && (
          <a 
            className={activeTab === "profile" ? "active" : ""} 
            href="#/profile"
          >
            <Store size={18} />
            Merchant Portal
          </a>
        )}

        {/* Auth Actions / Avatar */}
        {currentUser ? (
          <div style={{ display: "flex", alignItems: "center", gap: "18px", borderLeft: "1.5px solid #eee", paddingLeft: "18px", marginLeft: "6px" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
              <span style={{ fontSize: "13px", fontWeight: "600", color: "#2d2d2d" }}>
                {currentUser.name}
              </span>
              <span style={{ fontSize: "11px", color: "#FC8019", fontWeight: "500", textTransform: "capitalize" }}>
                {currentUser.role === "merchant" ? "Store Owner" : "Consumer"}
              </span>
            </div>

            <button
              onClick={onLogout}
              title="Sign Out"
              style={{
                background: "#fff5f5",
                color: "#e53e3e",
                padding: "8px 12px",
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "12px",
                fontWeight: "600",
                cursor: "pointer",
                border: "1px solid #fed7d7",
                transition: "all 0.2s ease"
              }}
            >
              <LogOut size={14} />
              Sign Out
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <a 
              className={activeTab === "auth-merchant" ? "active" : ""} 
              href="#/auth/merchant"
            >
              <Store size={18} />
              Partner Login
            </a>
            <a 
              className={activeTab === "auth-customer" ? "active" : ""} 
              href="#/auth/customer"
              style={{
                background: "#FC8019",
                color: "white",
                padding: "10px 18px",
                borderRadius: "12px",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: "0 4px 15px rgba(252,128,25,0.15)",
                fontWeight: "600",
                marginLeft: "10px"
              }}
            >
              <User size={16} />
              Sign In
            </a>
          </div>
        )}
      </nav>
    </header>
  );
}

export default Navbar;