import { useState } from "react";
import ErrorMessage from "../../components/ErrorMessage/ErrorMessage";
import { streamRecipe } from "../../utils/aiService";
import "./GenerateRecipePage.css";

type HistoryItem = { dish: string; answer: string };

export default function GenerateRecipePage() {
  const [dish, setDish] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState<HistoryItem[]>([]);

  async function handleSubmit() {
    if (!dish.trim() || isLoading) return;

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

    let fullText = "";

    try {
      await streamRecipe(prompt, (text) => {
        fullText += text;
        setResponse((prev) => prev + text);
      });

      // Keep the last 3 prompt/response pairs (most recent first).
      setHistory((prev) => [{ dish, answer: fullText }, ...prev].slice(0, 3));
    } catch (err) {
      console.log("Real AI error:", err);
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="generate-page">
      <header className="generate-page__header">
        <h2>Generate a Recipe</h2>
        <p className="generate-page__subtitle">
          Enter a dish name and let AI write the recipe.
        </p>
      </header>

      <div className="generate-page__controls">
        <input
          className="generate-page__input"
          value={dish}
          onChange={(e) => setDish(e.target.value)}
          placeholder='e.g. "chicken parmesan"'
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit();
          }}
        />
        <button onClick={handleSubmit} disabled={isLoading || !dish.trim()}>
          {isLoading ? "Generating…" : "Generate Recipe"}
        </button>
      </div>

      {isLoading && !response ? (
        <div className="generate-page__thinking">
          <span className="generate-page__spinner" aria-hidden="true" />
          Generating response…
        </div>
      ) : null}

      {error ? <ErrorMessage message={error} /> : null}

      {response ? (
        <div className="generate-page__output" aria-live="polite">
          <pre>{response}</pre>
        </div>
      ) : null}

      {history.length > 0 ? (
        <section className="generate-page__history">
          <h3>Recent Generations</h3>
          {history.map((item, i) => (
            <details key={i} className="history-item">
              <summary className="history-item__summary">{item.dish}</summary>
              <pre className="history-item__answer">{item.answer}</pre>
            </details>
          ))}
        </section>
      ) : null}
    </div>
  );
}