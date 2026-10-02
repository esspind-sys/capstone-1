import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ErrorMessage from "../../components/ErrorMessage/ErrorMessage";
import { createRecipe, getRecipe, updateRecipe } from "../../utils/recipeService";
import "./NewRecipePage.css";

export default function NewRecipePage() {
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [tags, setTags] = useState("");
  const [ingredients, setIngredients] = useState([{ name: "", quantity: "" }]);
  const [instructions, setInstructions] = useState([{ description: "" }]);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // Edit mode: load the existing recipe and prefill the form.
  useEffect(() => {
    if (!id) return;
    async function loadRecipe() {
      try {
        const recipe = await getRecipe(id as string);
        setTitle(recipe.title);
        setDescription(recipe.description ?? "");
        setImage(recipe.image ?? "");
        setTags(recipe.tags.join(", "));
        setIngredients(
          recipe.ingredients.length > 0
            ? recipe.ingredients.map((i) => ({
                name: i.name,
                quantity: i.quantity,
              }))
            : [{ name: "", quantity: "" }],
        );
        setInstructions(
          recipe.instructions.length > 0
            ? recipe.instructions
                .slice()
                .sort((a, b) => a.step - b.step)
                .map((i) => ({ description: i.description }))
            : [{ description: "" }],
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load recipe.");
      }
    }
    loadRecipe();
  }, [id]);

  function updateIngredient(
    index: number,
    field: "name" | "quantity",
    value: string,
  ) {
    const next = [...ingredients];
    next[index] = { ...next[index], [field]: value };
    setIngredients(next);
  }

  function updateInstruction(index: number, value: string) {
    const next = [...instructions];
    next[index] = { description: value };
    setInstructions(next);
  }

  function addIngredient() {
    setIngredients([...ingredients, { name: "", quantity: "" }]);
  }

  function removeIngredient(index: number) {
    setIngredients(ingredients.filter((_, i) => i !== index));
  }

  function addInstruction() {
    setInstructions([...instructions, { description: "" }]);
  }

  function removeInstruction(index: number) {
    setInstructions(instructions.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const payload = {
      title,
      description: description || undefined,
      image: image || undefined,
      ingredients: ingredients.filter((i) => i.name.trim() !== ""),
      instructions: instructions
        .filter((i) => i.description.trim() !== "")
        .map((i, idx) => ({ step: idx + 1, description: i.description })),
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t !== ""),
    };

    try {
      if (isEditMode && id) {
        await updateRecipe(id, payload);
        navigate(`/recipes/${id}`);
      } else {
        await createRecipe(payload);
        navigate("/recipes");
      }
    } catch (err) {
      console.log("Real save error:", err);
      setError(
        err instanceof Error
          ? err.message
          : `Could not ${isEditMode ? "update" : "create"} recipe.`,
      );
    }
  }

  return (
    <div className="new-recipe-page">
      <h2 className="new-recipe__title">
        {isEditMode ? "Edit Recipe" : "New Recipe"}
      </h2>

      <form className="new-recipe__form" autoComplete="off" onSubmit={handleSubmit}>
        <label className="field">
          <span className="field__label">Title</span>
          <input
            name="title"
            placeholder="e.g. Spicy Chickpea Soup"
            value={title}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setTitle(e.target.value)
            }
            required
          />
        </label>

        <label className="field">
          <span className="field__label">Description</span>
          <textarea
            name="description"
            placeholder="A short description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </label>

        <label className="field">
          <span className="field__label">Image URL</span>
          <input
            name="image"
            placeholder="https://… (optional)"
            value={image}
            onChange={(e) => setImage(e.target.value)}
          />
          {image ? (
            <img className="new-recipe__preview" src={image} alt="Preview" />
          ) : null}
        </label>

        <section className="new-recipe__section">
          <h3>Ingredients</h3>
          {ingredients.map((ing, i) => (
            <div key={i} className="row row--ingredient">
              <input
                className="row__name"
                placeholder="Name (e.g. Chickpeas)"
                value={ing.name}
                onChange={(e) => updateIngredient(i, "name", e.target.value)}
              />
              <input
                className="row__qty"
                placeholder="Quantity (e.g. 1 cup)"
                value={ing.quantity}
                onChange={(e) => updateIngredient(i, "quantity", e.target.value)}
              />
              <button
                type="button"
                className="btn-remove"
                onClick={() => removeIngredient(i)}
                aria-label="Remove ingredient"
              >
                Remove
              </button>
            </div>
          ))}
          <button type="button" className="btn-add" onClick={addIngredient}>
            + Add Ingredient
          </button>
        </section>

        <section className="new-recipe__section">
          <h3>Instructions</h3>
          {instructions.map((inst, i) => (
            <div key={i} className="row row--instruction">
              <span className="row__step">Step {i + 1}</span>
              <input
                className="row__desc"
                placeholder="Describe this step"
                value={inst.description}
                onChange={(e) => updateInstruction(i, e.target.value)}
              />
              <button
                type="button"
                className="btn-remove"
                onClick={() => removeInstruction(i)}
                aria-label="Remove step"
              >
                Remove
              </button>
            </div>
          ))}
          <button type="button" className="btn-add" onClick={addInstruction}>
            + Add Step
          </button>
        </section>

        <label className="field">
          <span className="field__label">Tags</span>
          <input
            name="tags"
            placeholder="comma, separated, tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
        </label>

        <div className="new-recipe__actions">
          <button type="submit">
            {isEditMode ? "Save Changes" : "Create Recipe"}
          </button>
        </div>

        {error ? <ErrorMessage message={error} /> : null}
      </form>
    </div>
  );
}