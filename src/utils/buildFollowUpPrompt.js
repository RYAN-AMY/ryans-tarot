export function buildFollowUpPrompt(originalContext, conversationHistory, newQuestion, supplementalCards = []) {
  const { question, spread, placements, deckMeta, originalInterpretation } = originalContext;

  const cardsInfo = spread.positions
    .map((pos) => {
      const card = placements[pos.id];
      if (!card) return null;
      const orientation = card.isReversed ? "逆位" : "正位";
      return `${pos.name}（${pos.description}）：${card.nameZh}(${card.nameEn}) ${orientation}`;
    })
    .filter(Boolean)
    .join("\n");

  const historyText = conversationHistory
    .map((msg) => `${msg.role === "user" ? "求问者追问" : "解读师回答"}：${msg.content}`)
    .join("\n\n");

  const supplementText = supplementalCards.length > 0
    ? `【求问者额外抽取的补充牌】
${supplementalCards.map((c) => {
  const orientation = c.isReversed ? "逆位" : "正位";
  const meaning = c.isReversed ? c.reversedMeaning : c.uprightMeaning;
  return `${c.nameZh}(${c.nameEn}) ${orientation} — ${meaning}`;
}).join("\n")}

`
    : "";

  return `你正在和求问者进行一场持续的塔罗对话。以下是你已经完成的完整解读，请将它作为背景信息。

【原始占卜背景】
牌阵：${spread.name}
牌组：${deckMeta.name}
问题：${question || "（无具体问题）"}
各位置牌面：
${cardsInfo}

【你给出的完整解读】
${originalInterpretation}

${supplementText}${conversationHistory.length > 0 ? `【此前的追问对话】
${historyText}

` : ""}【求问者现在的新追问】
${newQuestion}

请基于以上完整的解读背景，自然地回答这个追问。不要在回答中重复牌阵信息或逐张分析牌面——直接回应追问的问题。保持和原始解读一致的温暖语气，像在延续一场中途被打断的对话。如果追问涉及到牌面中某个具体的点，可以自然地回溯到该牌来展开说明。${supplementalCards.length > 0 ? "注意：求问者额外抽取了补充牌，如果追问涉及这些牌，请自然地将其融入回答中。" : ""}回答约200-300字。`;
}
