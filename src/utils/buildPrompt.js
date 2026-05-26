export function buildPrompt(question, spread, placements, deckMeta) {
  const isCompact = spread.cards >= 3;

  const cardsInfo = spread.positions
    .map((pos) => {
      const card = placements[pos.id];
      if (!card) return null;
      const orientation = card.isReversed ? "逆位" : "正位";
      const meaning = isCompact
        ? (card.keywords || []).join("、")
        : card.isReversed ? card.reversedMeaning : card.uprightMeaning;
      return `${pos.name}（${pos.description}）：${card.nameZh}(${card.nameEn}) ${orientation} — ${meaning}`;
    })
    .filter(Boolean)
    .join("\n");

  const questionLine = question
    ? `问题："${question}"。请紧扣此问题解读。`
    : "";

  return `牌阵：${spread.name}（${spread.description}）
牌组：${deckMeta.name}
${questionLine}
各位置牌面：
${cardsInfo}

请不要逐张解释牌意，而是将所有牌面的元素融汇成一个完整的解读。用"你"直接对求问者说话，语言温暖有画面感，避免术语堆砌。将各位置的牌意串联成有叙事感的整体结论，约400-500字。`;
}
