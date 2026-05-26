export const runtime = "edge";

const DEFAULT_ANTHROPIC_API = "https://api.anthropic.com/v1/messages";

export async function POST(request) {
  const apiKey = process.env.ANTHROPIC_AUTH_TOKEN || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "ANTHROPIC_AUTH_TOKEN or ANTHROPIC_API_KEY not set" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const baseUrl = process.env.ANTHROPIC_BASE_URL || DEFAULT_ANTHROPIC_API;
  const apiUrl = baseUrl.endsWith("/messages") ? baseUrl : `${baseUrl}/v1/messages`;
  const defaultModel = process.env.ANTHROPIC_DEFAULT_HAIKU_MODEL || process.env.ANTHROPIC_MODEL || "claude-haiku-4-5-20251001";
  const { systemPrompt, userMessage, model = defaultModel } = body;

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
      stream: true,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error("Anthropic API error:", response.status, errText);
    return new Response(JSON.stringify({ error: `API error: ${response.status}` }), {
      status: response.status,
      headers: { "Content-Type": "application/json" },
    });
  }

  const encoder = new TextEncoder();
  let buffer = "";

  const transform = new TransformStream({
    transform(chunk, controller) {
      buffer += new TextDecoder().decode(chunk);
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6);
          try {
            const parsed = JSON.parse(data);
            if (parsed.type === "content_block_delta" && parsed.delta?.text) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: parsed.delta.text })}\n\n`));
            } else if (parsed.type === "message_stop") {
              controller.enqueue(encoder.encode("data: [DONE]\n\n"));
            }
          } catch {
            // Skip non-JSON
          }
        }
      }
    },
    flush(controller) {
      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
    },
  });

  const stream = response.body.pipeThrough(transform);

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
