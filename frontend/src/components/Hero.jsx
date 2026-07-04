import chef from "../assets/chef.png";
import SearchBar from "./SearchBar";

function Hero() {

    return (

        <section className="hero">

            <div className="hero-left">

                <span className="badge">
                    ✔ AI Verified Kitchens
                </span>

                <h1>

                    Eat with Confidence

                </h1>

                <p>

                    Watch live kitchen feeds and AI hygiene scores before placing your order.

                </p>

                <SearchBar />

                <div className="hero-features">

                    <div>

                        <h3>500+</h3>

                        <p>Verified Restaurants</p>

                    </div>

                    <div>

                        <h3>95%</h3>

                        <p>Average Hygiene</p>

                    </div>

                    <div>

                        <h3>24/7</h3>

                        <p>Live Monitoring</p>

                    </div>

                </div>

            </div>

            <div className="hero-right">

                <img src={chef} alt="Chef" />

        

            </div>

        </section>

    );

}

export default Hero;