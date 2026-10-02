const express = require("express");

const router = express.Router();

// Fail well before Cloudflare's ~100s tunnel edge timeout.
const GEMINI_TIMEOUT_MS = 45000;

router.post("/", async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "prompt is required" });

  const url = `${process.env.GEMINI_API_URL}?alt=sse&key=${process.env.GEMINI_API_KEY}`;

  // Abort the upstream call on timeout OR if the client disconnects.
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort("timeout"), GEMINI_TIMEOUT_MS);
res.on("close", () => { if (!res.writableEnded) controller.abort("client-disconnect"); });
  let streaming = false;

  try {
    const upstream = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      signal: controller.signal,
    });

    if (!upstream.ok) {
      const text = await upstream.text();
      clearTimeout(timeout);
      return res.status(upstream.status).send(text);
    }

    // Flush SSE headers before any body so proxies don't buffer the stream.
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();
    streaming = true;

    const reader = upstream.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(decoder.decode(value, { stream: true }));
    }

    clearTimeout(timeout);
    res.end();
  } catch (err) {
    clearTimeout(timeout);
    const aborted = err.name === "AbortError" || controller.signal.aborted;
    console.error("AI proxy error:", aborted ? controller.signal.reason : err);

    // Already streaming: can't change HTTP status, so emit an SSE error event.
    if (streaming) {
      if (!res.writableEnded) {
        res.write(`event: error\ndata: ${JSON.stringify({ error: "AI request timed out" })}\n\n`);
        res.end();
      }
      return;
    }

    if (res.headersSent) return;

    const status = aborted ? 504 : 500;
    const message = aborted ? "AI request timed out" : "AI request failed";
    res.status(status).json({ error: message });
  }
});

module.exports = router;