import { handleAnthropicRequest } from "./_shared.js";

export const runtime = "edge";

export async function POST(request) {
  return handleAnthropicRequest(request, {
    getMaxTokens: (cardCount) =>
      cardCount <= 1 ? 1000 : cardCount <= 4 ? 1600 : cardCount <= 9 ? 2000 : 2500,
  });
}
