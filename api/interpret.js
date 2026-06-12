import { handleAnthropicRequest } from "./_shared.js";

export const runtime = "edge";

export async function POST(request) {
  return handleAnthropicRequest(request, {
    getMaxTokens: (cardCount) =>
      cardCount <= 1 ? 1200 : cardCount <= 4 ? 2000 : cardCount <= 9 ? 2800 : 3500,
  });
}
