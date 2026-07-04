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
  },
  {
    icon: <Sandwich size={26} />,
    title: "Burgers",
  },
  {
    icon: <Soup size={26} />,
    title: "Biryani",
  },
  {
    icon: <Coffee size={26} />,
    title: "Cafe",
  },
  {
    icon: <IceCream size={26} />,
    title: "Desserts",
  },
  {
    icon: <Beef size={26} />,
    title: "BBQ",
  },
];

function Categories() {
  return (
    <section className="categories">

      <div className="section-title">
        <h2>Browse Categories</h2>
        <p>Find your favourite meals</p>
      </div>

      <div className="category-grid">

        {categories.map((item, index) => (

          <div className="category-card" key={index}>

            <div className="category-icon">
              {item.icon}
            </div>

            <span>{item.title}</span>

          </div>

        ))}

      </div>

    </section>
  );
}

export default Categories;