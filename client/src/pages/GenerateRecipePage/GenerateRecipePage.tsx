import { useState } from "react";
import ErrorMessage from "../../components/ErrorMessage/ErrorMessage";
import { streamRecipe } from "../../utils/aiService";

export default function GenerateRecipePage() {
  const [dish, setDish] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    setIsLoading(true);
    setResponse("");
    setError("");

    const prompt = `You are a helpful chef. Create one recipe for the dish named below.

Format the recipe exactly like this:
Title: <recipe title>
Description: <1-2 sentence description>

Ingredients:
- <quantity> <ingredient>

Instructions:
1. <step>

Dish name: ${dish}`;

    try {
      await streamRecipe(prompt, (text) => {
        setResponse((prev) => prev + text);
      });
    } catch (err) {
      console.log("Real AI error:", err);
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="generate-recipe-page">
      <h2>Generate a Recipe</h2>
      <p>Enter a dish name and let AI write the recipe.</p>

      <input
        value={dish}
        onChange={(e) => setDish(e.target.value)}
        placeholder='e.g. "chicken parmesan"'
        style={{ width: "100%", maxWidth: "500px" }}
      />

      <div>
        <button onClick={handleSubmit} disabled={isLoading || !dish.trim()}>
          {isLoading ? "Generating..." : "Generate Recipe"}
        </button>
      </div>

      {isLoading && !response ? <p>Generating response...</p> : null}
      {error ? <ErrorMessage message={error} /> : null}

      {response ? (
        <div aria-live="polite">
          <pre style={{ whiteSpace: "pre-wrap" }}>{response}</pre>
        </div>
      ) : null}
    </div>
  );
}