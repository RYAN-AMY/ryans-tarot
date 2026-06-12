import { handleAnthropicRequest } from "./_shared.js";

export async function onRequestPost(ctx) {
  return handleAnthropicRequest({
    request: ctx.request,
    env: ctx.env,
    getMaxTokens: (cardCount) =>
      cardCount <= 1 ? 1200 : cardCount <= 4 ? 2000 : cardCount <= 9 ? 2800 : 3500,
  });
}
