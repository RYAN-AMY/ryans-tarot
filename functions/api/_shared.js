const DEFAULT_ANTHROPIC_API = "https://api.anthropic.com/v1/messages";

function resolveApiUrl(env) {
  const baseUrl = env.ANTHROPIC_BASE_URL || DEFAULT_ANTHROPIC_API;
  return baseUrl.endsWith("/messages") ? baseUrl : `${baseUrl}/v1/messages`;
}

function getDefaultModel(env) {
  return env.ANTHROPIC_DEFAULT_MODEL
    || env.ANTHROPIC_DEFAULT_HAIKU_MODEL
    || env.ANTHROPIC_MODEL
    || "claude-sonnet-4-6";
}

function useCache(env) {
  return !env.ANTHROPIC_BASE_URL || env.ANTHROPIC_BASE_URL.includes("anthropic.com");
}

export async function handleAnthropicRequest({ request, env, getMaxTokens }) {
  const apiKey = env.ANTHROPIC_AUTH_TOKEN || env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "API key not configured" }), {
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
    model = getDefaultModel(env),
    cardCount = 3,
    isRecommend = false,
  } = body;

  const maxTokens = getMaxTokens
    ? getMaxTokens(isRecommend ? 0 : cardCount)
    : 800;

  const response = await fetch(resolveApiUrl(env), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      system: useCache(env)
        ? [{ type: "text", text: systemPrompt, cache_control: { type: "ephemeral" } }]
        : systemPrompt,
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
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: parsed.delta.text })}\n\n`));
          } else if (parsed.type === "message_stop") {
            controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          }
        } catch { /* skip */ }
      }
    },
    flush(controller) {
      if (buffer.trim()) {
        const dataLine = buffer.split("\n").find((line) => line.startsWith("data: "));
        if (dataLine) {
          try {
            const parsed = JSON.parse(dataLine.slice(6));
            if (parsed.type === "content_block_delta" && parsed.delta?.text) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: parsed.delta.text })}\n\n`));
            }
          } catch { /* skip */ }
        }
      }
      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
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
