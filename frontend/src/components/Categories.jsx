import {
  Pizza,
  Sandwich,
  Soup,
  Coffee,
  IceCream,
  Beef,
} from "lucide-react";

const categories = [
  {
    icon: <Pizza size={26} />,
    title: "Pizza",
    searchKey: "Pizza"
  },
  {
    icon: <Sandwich size={26} />,
    title: "Burgers",
    searchKey: "Fast Food"
  },
  {
    icon: <Soup size={26} />,
    title: "Biryani",
    searchKey: "Biryani"
  },
  {
    icon: <Coffee size={26} />,
    title: "Cafe",
    searchKey: "Cafe"
  },
  {
    icon: <IceCream size={26} />,
    title: "Desserts",
    searchKey: "Dessert"
  },
  {
    icon: <Beef size={26} />,
    title: "BBQ",
    searchKey: "BBQ"
  },
];

function Categories({ selectedCategory, setSelectedCategory }) {
  const handleCategoryClick = (searchKey) => {
    if (selectedCategory === searchKey) {
      setSelectedCategory(""); // Clear filter
    } else {
      setSelectedCategory(searchKey);
    }
  };

  return (
    <section className="categories">
      <div className="section-title">
        <h2>Browse Categories</h2>
        <p>Find your favourite meals</p>
      </div>

      <div className="category-grid">
        {categories.map((item, index) => {
          const isSelected = selectedCategory === item.searchKey;
          return (
            <div 
              className={`category-card ${isSelected ? "active" : ""}`} 
              key={index}
              onClick={() => handleCategoryClick(item.searchKey)}
              style={{
                cursor: "pointer",
                background: isSelected ? "#fff3e8" : "white",
                border: isSelected ? "1.5px solid #FC8019" : "1.5px solid transparent",
                transform: isSelected ? "translateY(-5px)" : "none",
                transition: "all 0.3s ease"
              }}
            >
              <div 
                className="category-icon"
                style={{
                  color: isSelected ? "#FC8019" : "#666"
                }}
              >
                {item.icon}
              </div>
              <span style={{ fontWeight: isSelected ? "600" : "400" }}>{item.title}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default Categories;