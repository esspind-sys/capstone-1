import { Link } from "react-router-dom";
import "./HomePage.css";

export default function HomePage() {
  return (
    <section className="home">
      <div className="home__inner">
        <h1 className="home__title">Spoonful</h1>
        <p className="home__tagline">
          Discover, create, and share recipes — with a little help from AI.
        </p>

        <div className="home__actions">
          <Link to="/recipes" className="home__cta home__cta--primary">
            Explore Recipes
          </Link>
          <Link to="/login" className="home__cta home__cta--secondary">
            Log In
          </Link>
        </div>

        <p className="home__hint">
          Just curious? <Link to="/generate">Generate a recipe with AI →</Link>
        </p>
      </div>
    </section>
  );
}