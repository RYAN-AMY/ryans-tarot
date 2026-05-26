import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const DEFAULT_ANTHROPIC_API = "https://api.anthropic.com/v1/messages";

function interpretPlugin() {
  return {
    name: "ryanstarot-interpret",
    configureServer(server) {
      server.middlewares.use("/api/interpret", async (req, res) => {
        if (req.method !== "POST") {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: "Method not allowed" }));
          return;
        }

        const apiKey = process.env.ANTHROPIC_AUTH_TOKEN || process.env.ANTHROPIC_API_KEY;
        if (!apiKey) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: "ANTHROPIC_AUTH_TOKEN or ANTHROPIC_API_KEY not set" }));
          return;
        }

        const baseUrl = process.env.ANTHROPIC_BASE_URL || DEFAULT_ANTHROPIC_API;
        const apiUrl = baseUrl.endsWith("/messages") ? baseUrl : `${baseUrl}/v1/messages`;

        let body = "";
        req.on("data", (chunk) => { body += chunk; });
        req.on("end", async () => {
          try {
            const defaultModel = process.env.ANTHROPIC_DEFAULT_HAIKU_MODEL || process.env.ANTHROPIC_MODEL || "claude-haiku-4-5-20251001";
            const { systemPrompt, userMessage, model = defaultModel, cardCount = 3 } = JSON.parse(body);

            const maxTokens = cardCount <= 1 ? 800 : cardCount <= 4 ? 1200 : cardCount <= 9 ? 1500 : 2000;
            const useCache = !process.env.ANTHROPIC_BASE_URL || process.env.ANTHROPIC_BASE_URL.includes("anthropic.com");

            const response = await fetch(apiUrl, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-api-key": apiKey,
                "anthropic-version": "2023-06-01",
              },
              body: JSON.stringify({
                model,
                max_tokens: maxTokens,
                system: useCache
                  ? [{ type: "text", text: systemPrompt, cache_control: { type: "ephemeral" } }]
                  : systemPrompt,
                messages: [{ role: "user", content: userMessage }],
                stream: true,
              }),
            });

            if (!response.ok) {
              const err = await response.text();
              console.error("Anthropic API error:", response.status, err);
              res.statusCode = response.status;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: `API error: ${response.status}` }));
              return;
            }

            // Stream SSE response to client
            res.setHeader("Content-Type", "text/event-stream");
            res.setHeader("Cache-Control", "no-cache");
            res.setHeader("Connection", "keep-alive");
            res.setHeader("X-Accel-Buffering", "no");

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = "";

            try {
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split("\n");
                buffer = lines.pop() || "";

                for (const line of lines) {
                  if (line.startsWith("data: ")) {
                    const data = line.slice(6);
                    try {
                      const parsed = JSON.parse(data);
                      if (parsed.type === "content_block_delta" && parsed.delta?.text) {
                        res.write(`data: ${JSON.stringify({ text: parsed.delta.text })}\n\n`);
                      } else if (parsed.type === "message_stop") {
                        res.write("data: [DONE]\n\n");
                      }
                    } catch {
                      // Skip non-JSON lines
                    }
                  }
                }
              }
            } finally {
              reader.releaseLock();
              res.end();
            }
          } catch (err) {
            console.error("Interpret error:", err);
            if (!res.headersSent) {
              res.statusCode = 500;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: err.message }));
            } else {
              res.end();
            }
          }
        });
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), interpretPlugin()],
  server: {
    host: "ryanstarot.local",
  },
});
