import { handleAnthropicRequest } from "./_shared.js";

export const runtime = "edge";

export async function POST(request) {
  return handleAnthropicRequest(request, {
    getMaxTokens: (cardCount) =>
      cardCount <= 1 ? 800 : cardCount <= 4 ? 1200 : cardCount <= 9 ? 1600 : 2000,
  });
}
