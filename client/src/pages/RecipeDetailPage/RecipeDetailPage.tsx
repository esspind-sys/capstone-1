import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import type { Recipe, User } from "../../shared.types";
import { getRecipe, deleteRecipe } from "../../utils/recipeService";
import "./RecipeDetailPage.css";

type RecipeDetailPageProps = {
  user: User | null;
};

export default function RecipeDetailPage({ user }: RecipeDetailPageProps) {
  const { id } = useParams();
  const navigate = useNavigate();
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

  async function handleDelete() {
    if (!recipe) return;
    const confirmed = window.confirm(
      `Delete “${recipe.title}”? This cannot be undone.`,
    );
    if (!confirmed) return;
    try {
      await deleteRecipe(recipe._id);
      navigate("/recipes");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete recipe.");
    }
  }

  if (isLoading) {
    return (
      <div className="recipe-detail">
        <p className="recipe-detail__status">Loading recipe…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="recipe-detail">
        <p className="recipe-detail__status recipe-detail__status--error">
          {error}
        </p>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="recipe-detail">
        <p className="recipe-detail__status">Recipe not found.</p>
      </div>
    );
  }

  const isOwner = Boolean(user && user._id === recipe.ownerId);

  return (
    <article className="recipe-detail">
      <div className="recipe-detail__topbar">
        <Link to="/recipes" className="recipe-detail__back">
          ← Back to recipes
        </Link>

        {isOwner ? (
          <div className="recipe-detail__owner-actions">
            <Link
              to={`/recipes/${recipe._id}/edit`}
              className="recipe-detail__edit"
            >
              Edit
            </Link>
            <button
              type="button"
              className="recipe-detail__delete"
              onClick={handleDelete}
            >
              Delete
            </button>
          </div>
        ) : null}
      </div>

      <header className="recipe-detail__header">
        <h1 className="recipe-detail__title">{recipe.title}</h1>
        {recipe.tags.length > 0 ? (
          <ul className="recipe-detail__tags">
            {recipe.tags.map((tag) => (
              <li key={tag} className="tag-chip">
                {tag}
              </li>
            ))}
          </ul>
        ) : null}
      </header>

      {recipe.image ? (
        <img
          src={recipe.image}
          alt={recipe.title}
          className="recipe-detail__img"
        />
      ) : null}

      {recipe.description ? (
        <p className="recipe-detail__desc">{recipe.description}</p>
      ) : null}

      <div className="recipe-detail__columns">
        <section className="recipe-detail__panel">
          <h3>Ingredients</h3>
          {recipe.ingredients.length === 0 ? (
            <p className="recipe-detail__muted">No ingredients listed.</p>
          ) : (
            <ul className="recipe-detail__ingredients">
              {recipe.ingredients.map((ing) => (
                <li key={ing._id ?? ing.name}>
                  <span className="recipe-detail__qty">{ing.quantity}</span>{" "}
                  {ing.name}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="recipe-detail__panel">
          <h3>Instructions</h3>
          {recipe.instructions.length === 0 ? (
            <p className="recipe-detail__muted">No instructions listed.</p>
          ) : (
            <ol className="recipe-detail__instructions">
              {recipe.instructions
                .slice()
                .sort((a, b) => a.step - b.step)
                .map((inst) => (
                  <li key={inst._id ?? inst.step}>{inst.description}</li>
                ))}
            </ol>
          )}
        </section>
      </div>
    </article>
  );
}