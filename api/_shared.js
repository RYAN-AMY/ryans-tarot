export const runtime = "edge";

const DEFAULT_ANTHROPIC_API = "https://api.anthropic.com/v1/messages";

function resolveApiUrl() {
  const baseUrl = process.env.ANTHROPIC_BASE_URL || DEFAULT_ANTHROPIC_API;
  return baseUrl.endsWith("/messages") ? baseUrl : `${baseUrl}/v1/messages`;
}

function getDefaultModel() {
  return process.env.ANTHROPIC_DEFAULT_MODEL
    || process.env.ANTHROPIC_DEFAULT_HAIKU_MODEL
    || process.env.ANTHROPIC_MODEL
    || "claude-sonnet-4-6";
}

function useCache() {
  return !process.env.ANTHROPIC_BASE_URL || process.env.ANTHROPIC_BASE_URL.includes("anthropic.com");
}

function sseChunk(text) {
  return `data: ${JSON.stringify({ text })}\n\n`;
}

const DONE = "data: [DONE]\n\n";

export async function handleAnthropicRequest(request, { getMaxTokens }) {
  const apiKey = process.env.ANTHROPIC_AUTH_TOKEN || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "ANTHROPIC_AUTH_TOKEN or ANTHROPIC_API_KEY not set" }), {
      status: 500, headers: { "Content-Type": "application/json" },
    });
  }

  let body;
  try { body = await request.json(); } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400, headers: { "Content-Type": "application/json" },
    });
  }

  const {
    systemPrompt,
    userMessage,
    model = getDefaultModel(),
    cardCount = 3,
    isRecommend = false,
  } = body;

  const maxTokens = getMaxTokens
    ? getMaxTokens(isRecommend ? 0 : cardCount)
    : 800;

  const systemBlock = useCache()
    ? [{ type: "text", text: systemPrompt, cache_control: { type: "ephemeral" } }]
    : systemPrompt;

  const response = await fetch(resolveApiUrl(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      system: systemBlock,
      messages: [{ role: "user", content: userMessage }],
      stream: true,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error("Anthropic API error:", response.status, errText);
    return new Response(JSON.stringify({ error: `API error: ${response.status}` }), {
      status: response.status, headers: { "Content-Type": "application/json" },
    });
  }

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  let buffer = "";

  const transform = new TransformStream({
    transform(chunk, controller) {
      buffer += decoder.decode(chunk, { stream: true });
      const parts = buffer.split("\n\n");
      buffer = parts.pop() || "";

      for (const part of parts) {
        if (!part.trim()) continue;
        const dataLine = part.split("\n").find((line) => line.startsWith("data: "));
        if (!dataLine) continue;
        const jsonStr = dataLine.slice(6);
        try {
          const parsed = JSON.parse(jsonStr);
          if (parsed.type === "content_block_delta" && parsed.delta?.text) {
            controller.enqueue(encoder.encode(sseChunk(parsed.delta.text)));
          } else if (parsed.type === "message_stop") {
            controller.enqueue(encoder.encode(DONE));
          }
        } catch { /* skip malformed JSON */ }
      }
    },
    flush(controller) {
      if (buffer.trim()) {
        const dataLine = buffer.split("\n").find((line) => line.startsWith("data: "));
        if (dataLine) {
          try {
            const parsed = JSON.parse(dataLine.slice(6));
            if (parsed.type === "content_block_delta" && parsed.delta?.text) {
              controller.enqueue(encoder.encode(sseChunk(parsed.delta.text)));
            }
          } catch { /* skip */ }
        }
      }
      controller.enqueue(encoder.encode(DONE));
    },
  });

  return new Response(response.body.pipeThrough(transform), {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
