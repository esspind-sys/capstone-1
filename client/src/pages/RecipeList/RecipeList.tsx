import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Recipe } from "../../shared.types";
import { getAllRecipes } from "../../utils/recipeService";

function RecipeList() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadRecipes() {
      try {
        const data = await getAllRecipes();
        setRecipes(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load recipes.");
      } finally {
        setIsLoading(false);
      }
    }
    loadRecipes();
  }, []);

  if (isLoading) return <p>Loading recipes...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (recipes.length === 0) return <p>No recipes yet. Be the first to add one!</p>;

  return (
    <section>
      <h2>Recipes</h2>
      <ul>
        {recipes.map((recipe) => (
          <li key={recipe._id}>
            <Link to={`/recipes/${recipe._id}`}>{recipe.title}</Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default RecipeList;