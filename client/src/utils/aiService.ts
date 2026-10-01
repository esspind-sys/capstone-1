const API_URL = `${import.meta.env.VITE_BACKEND_URL}/api/ai`;

// Streams a recipe from the backend (which proxies to Gemini).
// Calls onChunk with each new piece of text as it arrives.
export async function streamRecipe(
  prompt: string,
  onChunk: (text: string) => void,
): Promise<void> {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }

  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.startsWith("data:")) continue;
      const data = line.replace("data:", "").trim();
      if (!data) continue;

      try {
        const parsed = JSON.parse(data);
        const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) onChunk(text);
      } catch {
        // Ignore incomplete chunks (a chunk boundary can split a data: line)
      }
    }
  }
}