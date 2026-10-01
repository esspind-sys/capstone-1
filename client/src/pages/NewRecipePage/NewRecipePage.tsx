import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import ErrorMessage from "../../components/ErrorMessage/ErrorMessage";
import { createRecipe } from "../../utils/recipeService";

export default function NewRecipePage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [tags, setTags] = useState("");
  const [ingredients, setIngredients] = useState([{ name: "", quantity: "" }]);
  const [instructions, setInstructions] = useState([{ description: "" }]);
  const [error, setError] = useState("");

  const navigate = useNavigate();

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
    try {
      await createRecipe({
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
      });
      navigate("/recipes");
    } catch (err) {
      console.log("Real create error:", err);
      setError(err instanceof Error ? err.message : "Could not create recipe.");
    }
  }

  return (
    <div className="new-recipe-page">
      <h2>New Recipe</h2>
      <form autoComplete="off" onSubmit={handleSubmit}>
        <input
          name="title"
          placeholder="Title"
          value={title}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setTitle(e.target.value)
          }
          required
        />
        <textarea
          name="description"
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          name="image"
          placeholder="Image URL (optional)"
          value={image}
          onChange={(e) => setImage(e.target.value)}
        />

        <h3>Ingredients</h3>
        {ingredients.map((ing, i) => (
          <div key={i}>
            <input
              placeholder="name"
              value={ing.name}
              onChange={(e) => updateIngredient(i, "name", e.target.value)}
            />
            <input
              placeholder="quantity"
              value={ing.quantity}
              onChange={(e) => updateIngredient(i, "quantity", e.target.value)}
            />
            <button type="button" onClick={() => removeIngredient(i)}>
              Remove
            </button>
          </div>
        ))}
        <button type="button" onClick={addIngredient}>
          + Add Ingredient
        </button>

        <h3>Instructions</h3>
        {instructions.map((inst, i) => (
          <div key={i}>
            <span>Step {i + 1}: </span>
            <input
              placeholder="description"
              value={inst.description}
              onChange={(e) => updateInstruction(i, e.target.value)}
            />
            <button type="button" onClick={() => removeInstruction(i)}>
              Remove
            </button>
          </div>
        ))}
        <button type="button" onClick={addInstruction}>
          + Add Step
        </button>

        <h3>Tags</h3>
        <input
          name="tags"
          placeholder="comma, separated, tags"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />

        <div>
          <button type="submit">Create Recipe</button>
        </div>
        {error ? <ErrorMessage message={error} /> : null}
      </form>
    </div>
  );
}