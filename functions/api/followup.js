import { handleAnthropicRequest } from "./_shared.js";

export async function onRequestPost(ctx) {
  return handleAnthropicRequest({
    request: ctx.request,
    env: ctx.env,
    getMaxTokens: () => 600,
  });
}
