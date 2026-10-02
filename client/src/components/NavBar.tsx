import { Link } from "react-router-dom";
import type { User } from "../shared.types";
import "./NavBar.css";

type NavBarProps = {
  user: User | null;
  handleLogout: () => void;
};

function NavBar({ user, handleLogout }: NavBarProps) {
  return (
    <nav className="navbar">
      <div className="navbar__inner">
        <Link to="/" className="navbar__brand">
          Spoonful
        </Link>

        <ul className="navbar__links">
          <li>
            <Link to="/recipes" className="navbar__link">
              Recipes
            </Link>
          </li>
          <li>
            <Link to="/generate" className="navbar__link">
              Generate
            </Link>
          </li>

          {user ? (
            <>
              <li className="navbar__welcome">Welcome, {user.email}</li>
              <li>
                <Link to="/recipes/new" className="navbar__link navbar__cta">
                  New Recipe
                </Link>
              </li>
              <li>
                <Link
                  to="/"
                  onClick={handleLogout}
                  className="navbar__link navbar__link--muted"
                >
                  Logout
                </Link>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/signup" className="navbar__link">
                  Sign Up
                </Link>
              </li>
              <li>
                <Link to="/login" className="navbar__link navbar__cta">
                  Log In
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}

export default NavBar;