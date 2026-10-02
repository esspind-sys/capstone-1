import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import "./App.css";
import NavBar from "./components/NavBar";
import HomePage from "./pages/HomePage/HomePage";
import RecipeList from "./pages/RecipeList/RecipeList";
import NewRecipePage from "./pages/NewRecipePage/NewRecipePage";
import RecipeDetailPage from "./pages/RecipeDetailPage/RecipeDetailPage";
import GenerateRecipePage from "./pages/GenerateRecipePage/GenerateRecipePage";
import SignupPage from "./pages/SignupPage/SignupPage";
import LoginPage from "./pages/LoginPage/LoginPage";
import userService from "./utils/userService";
import type { User } from "./shared.types";

function App() {
  const [user, setUser] = useState<User | null>(userService.getUser());

  function handleSignUpOrLogin() {
    setUser(userService.getUser());
  }

  function handleLogout() {
    userService.logout();
    setUser(null);
  }

  return (
    <>
      <NavBar user={user} handleLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/recipes" element={<RecipeList />} />
        <Route path="/recipes/new" element={<NewRecipePage />} />
        <Route path="/recipes/:id/edit" element={<NewRecipePage />} />
        <Route path="/recipes/:id" element={<RecipeDetailPage user={user} />} />
        <Route path="/generate" element={<GenerateRecipePage />} />
        <Route
          path="/signup"
          element={<SignupPage handleSignUpOrLogin={handleSignUpOrLogin} />}
        />
        <Route
          path="/login"
          element={<LoginPage handleSignUpOrLogin={handleSignUpOrLogin} />}
        />
      </Routes>
    </>
  );
}

export default App;