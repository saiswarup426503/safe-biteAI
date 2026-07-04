import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Categories from "./components/Categories";
import RestaurantCard from "./components/RestaurantCard";
import LiveKitchen from "./components/LiveKitchen";
import Footer from "./components/Footer";

function App() {
  return (
    <div className="app">
      <Navbar />

      <main className="container">

        <Hero />

        <Categories />

        <div className="content-grid">

          <div className="left-panel">

            <div className="section-title">
              <h2>Verified Kitchens Near You</h2>
              <p>Trusted restaurants with AI verified hygiene</p>
            </div>

            <RestaurantCard
              image="https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800"
              name="The Pizza Palace"
              rating="4.6"
              reviews="1.2k+"
              cuisine="Italian, Pizza"
              location="Indiranagar"
              time="30-35 mins"
              score="96"
            />

            <RestaurantCard
              image="https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg"
              name="Noodles Zone"
              rating="4.5"
              reviews="980+"
              cuisine="Noodles, North Indian"
              location="BTM Layout"
              time="25-30 mins"
              score="94"
            />

            <RestaurantCard
              image="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800"
              name="Burger Bistro"
              rating="4.4"
              reviews="720+"
              cuisine="Fast Food"
              location="Koramangala"
              time="20-25 mins"
              score="91"
            />

          </div>

          <div className="right-panel">
            <LiveKitchen />
          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}

export default App;