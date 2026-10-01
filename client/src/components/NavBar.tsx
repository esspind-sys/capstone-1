import { Link } from "react-router-dom";
import type { User } from "../shared.types";

type NavBarProps = {
  user: User | null;
  handleLogout: () => void;
};

function NavBar({ user, handleLogout }: NavBarProps) {
  return (
    <nav>
      <ul>
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/recipes">Recipes</Link>
        </li>
        {user ? (
          <>
            <li>
              <Link to="/recipes/new">New Recipe</Link>
            </li>
            <li>Welcome, {user.email}</li>
            <li>
              <Link to="/" onClick={handleLogout}>
                Logout
              </Link>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link to="/signup">Sign Up</Link>
            </li>
            <li>
              <Link to="/login">Log In</Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}

export default NavBar;