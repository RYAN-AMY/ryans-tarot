import { buildRecommendPrompt } from "../src/data/spreads.js";

export const runtime = "edge";

const DEFAULT_API = "https://api.anthropic.com/v1/messages";
const DEFAULT_MODEL = "claude-haiku-4-5-20251001";

function resolveApiUrl() {
  const baseUrl = process.env.ANTHROPIC_BASE_URL || DEFAULT_API;
  return baseUrl.endsWith("/messages") ? baseUrl : `${baseUrl}/v1/messages`;
}

/**
 * 牌阵推荐 API——非流式快响。
 * 接收用户问题，30ms 内返回 JSON 推荐结果。
 * 失败时前端直接用本地打分结果，不需要降级逻辑。
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { question, lang = "zh" } = body;

    if (!question?.trim()) {
      return Response.json({ error: "Missing question" }, { status: 400 });
    }

    const { systemPrompt, userMessage } = buildRecommendPrompt(question.trim(), lang);

    const apiKey = process.env.ANTHROPIC_AUTH_TOKEN || process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return Response.json({ error: "API key not configured" }, { status: 500 });
    }

    const model = process.env.ANTHROPIC_DEFAULT_HAIKU_MODEL
      || process.env.ANTHROPIC_MODEL
      || DEFAULT_MODEL;

    const res = await fetch(resolveApiUrl(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: 300,
        system: systemPrompt,
        messages: [{ role: "user", content: userMessage }],
        stream: false,
      }),
    });

    if (!res.ok) {
      console.error("Recommend API error:", res.status);
      return Response.json({ error: `API error: ${res.status}` }, { status: res.status });
    }

    const data = await res.json();
    const text = data.content?.[0]?.text || "";

    // 从 AI 输出中提取 JSON
    const jsonMatch = text.match(/\{[\s\S]*"recommendations"[\s\S]*\}/);
    if (!jsonMatch) {
      return Response.json({ error: "Failed to parse AI response" }, { status: 500 });
    }

    const parsed = JSON.parse(jsonMatch[0]);
    if (!parsed.recommendations || !Array.isArray(parsed.recommendations)) {
      return Response.json({ error: "Invalid recommendations format" }, { status: 500 });
    }

    return Response.json({
      recommendations: parsed.recommendations.filter((r) => r.id && r.reason),
    });
  } catch (err) {
    console.error("Recommend error:", err);
    return Response.json({ error: "Internal error" }, { status: 500 });
  }
}
