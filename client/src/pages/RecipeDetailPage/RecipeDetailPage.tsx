import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import type { Recipe } from "../../shared.types";
import { getRecipe } from "../../utils/recipeService";

export default function RecipeDetailPage() {
  const { id } = useParams();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadRecipe() {
      try {
        if (!id) return;
        const data = await getRecipe(id);
        setRecipe(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load recipe.");
      } finally {
        setIsLoading(false);
      }
    }
    loadRecipe();
  }, [id]);

  if (isLoading) return <p>Loading recipe...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!recipe) return <p>Recipe not found.</p>;

  return (
    <article className="recipe-detail">
      <Link to="/recipes">&larr; Back to recipes</Link>
      <h2>{recipe.title}</h2>

      {recipe.image ? (
        <img src={recipe.image} alt={recipe.title} style={{ maxWidth: "400px" }} />
      ) : null}

      {recipe.description ? <p>{recipe.description}</p> : null}

      <h3>Ingredients</h3>
      {recipe.ingredients.length === 0 ? (
        <p>No ingredients listed.</p>
      ) : (
        <ul>
          {recipe.ingredients.map((ing) => (
            <li key={ing._id ?? ing.name}>
              {ing.quantity} {ing.name}
            </li>
          ))}
        </ul>
      )}

      <h3>Instructions</h3>
      {recipe.instructions.length === 0 ? (
        <p>No instructions listed.</p>
      ) : (
        <ol>
          {recipe.instructions
            .slice()
            .sort((a, b) => a.step - b.step)
            .map((inst) => (
              <li key={inst._id ?? inst.step}>{inst.description}</li>
            ))}
        </ol>
      )}

      {recipe.tags.length > 0 ? (
        <p>
          <strong>Tags:</strong> {recipe.tags.join(", ")}
        </p>
      ) : null}
    </article>
  );
}

