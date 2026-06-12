import { handleAnthropicRequest } from "./_shared.js";

export const runtime = "edge";

export async function POST(request) {
  return handleAnthropicRequest(request, { getMaxTokens: () => 600 });
}
