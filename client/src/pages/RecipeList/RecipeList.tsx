import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { Recipe } from "../../shared.types";
import { getAllRecipes } from "../../utils/recipeService";
import "./RecipeList.css";

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function RecipeList() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

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

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return recipes;
    return recipes.filter((r) => {
      const inTitle = r.title.toLowerCase().includes(q);
      const inTags = r.tags.some((t) => t.toLowerCase().includes(q));
      const inIngredients = r.ingredients.some((i) =>
        i.name.toLowerCase().includes(q)
      );
      return inTitle || inTags || inIngredients;
    });
  }, [recipes, search]);

  if (isLoading) {
    return (
      <section className="recipe-list">
        <p className="recipe-list__status">Loading recipes…</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="recipe-list">
        <p className="recipe-list__status recipe-list__status--error">{error}</p>
      </section>
    );
  }

  return (
    <section className="recipe-list">
      <header className="recipe-list__header">
        <h2 className="recipe-list__title">Recipes</h2>
        <input
          type="search"
          className="recipe-list__search"
          placeholder="Search by title, tag, or ingredient…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search recipes"
        />
      </header>

      {recipes.length === 0 ? (
        <div className="recipe-list__empty">
          <p>No recipes yet. Be the first to add one!</p>
          <Link to="/recipes/new" className="recipe-list__empty-cta">
            Create a Recipe
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <p className="recipe-list__status">
          We couldn’t find any recipes matching “{search}”.
        </p>
      ) : (
        <ul className="recipe-grid">
          {filtered.map((recipe) => (
            <li key={recipe._id} className="recipe-card">
              <Link to={`/recipes/${recipe._id}`} className="recipe-card__link">
                {recipe.image ? (
                  <div className="recipe-card__media">
                    <img
                      src={recipe.image}
                      alt={recipe.title}
                      loading="lazy"
                      className="recipe-card__img"
                    />
                  </div>
                ) : (
                  <div className="recipe-card__media recipe-card__media--placeholder">
                    <span>🍽</span>
                  </div>
                )}

                <div className="recipe-card__body">
                  <h3 className="recipe-card__title">{recipe.title}</h3>

                  {recipe.createdAt ? (
                    <span className="recipe-card__date">
                      {formatDate(recipe.createdAt)}
                    </span>
                  ) : null}

                  {recipe.description ? (
                    <p className="recipe-card__desc">{recipe.description}</p>
                  ) : null}

                  {recipe.tags.length > 0 ? (
                    <ul className="recipe-card__tags">
                      {recipe.tags.slice(0, 4).map((tag) => (
                        <li key={tag} className="tag-chip">
                          {tag}
                        </li>
                      ))}
                    </ul>
                  ) : null}

                  <span className="recipe-card__cta">View Recipe →</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default RecipeList;