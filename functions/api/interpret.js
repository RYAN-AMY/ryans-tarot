import { handleAnthropicRequest } from "./_shared.js";

export async function onRequestPost(ctx) {
  return handleAnthropicRequest({
    request: ctx.request,
    env: ctx.env,
    getMaxTokens: (cardCount) =>
      cardCount <= 1 ? 1000 : cardCount <= 4 ? 1600 : cardCount <= 9 ? 2000 : 2500,
  });
}
