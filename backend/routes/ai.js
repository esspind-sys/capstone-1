const express = require("express");
const router = express.Router();

router.post("/", async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "prompt is required" });

  const url = `${process.env.GEMINI_API_URL}?alt=sse&key=${process.env.GEMINI_API_KEY}`;

  try {
    const upstream = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    });

    if (!upstream.ok) {
      const text = await upstream.text();
      return res.status(upstream.status).send(text);
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");

    const reader = upstream.body.getReader();
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(decoder.decode(value, { stream: true }));
    }
    res.end();
  } catch (err) {
    console.error("AI proxy error:", err);
    res.status(500).json({ error: "AI request failed" });
  }
});

module.exports = router;