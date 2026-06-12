/**
 * 构建五层结构化解读的 user message。
 * 输出给 Claude 的是完整的数据包，让 AI 做专业读牌师的全流程分析。
 */

const ELEMENT_ZH = { wands: "火·权杖", cups: "水·圣杯", swords: "风·宝剑", pentacles: "土·星币" };
const ELEMENT_ENERGY = {
  wands: "行动力与创造力主导——求问者正处于主动出击、开拓新局的阶段",
  cups: "情感与人际关系主导——求问者的核心课题围绕爱、感受和深层连接",
  swords: "思维与沟通主导——求问者正在经历认知上的突破或冲突，需要理性清明",
  pentacles: "物质与安全感主导——求问者的焦点在现实层面，工作、金钱、身体健康是核心",
};

const ARCANA_SIGNIFICANCE = {
  allMajor: "全部为大阿卡纳——这不是日常琐事的占卜，而是灵魂层面的重大转折。求问者正站在人生关键节点上，每张牌都是宇宙的重要讯息。",
  mostlyMajor: "大阿卡纳占多数——当前课题远超日常层面，涉及深层的人生转变和灵性成长。请着重解读这些大牌的象征分量。",
  balanced: "大小阿卡纳均衡——大牌提示人生方向，小牌反映具体情境。这是一次既有深度又接地气的解读。",
  mostlyMinor: "小阿卡纳为主——求问者面对的是具体的日常课题。从实际生活的角度切入，用大牌（如果有的话）作为更高层面的指引。",
  allMinor: "全部为小阿卡纳——这是关于日常生活的务实探索。聚焦于具体情境中的选择、情绪和行动，不必过度上升到灵性层面。",
};

function getArcanaSignificance(majorCount, totalCount) {
  if (majorCount === totalCount) return ARCANA_SIGNIFICANCE.allMajor;
  if (majorCount >= totalCount * 0.5) return ARCANA_SIGNIFICANCE.mostlyMajor;
  if (majorCount >= 2) return ARCANA_SIGNIFICANCE.balanced;
  if (majorCount >= 1) return ARCANA_SIGNIFICANCE.mostlyMinor;
  return ARCANA_SIGNIFICANCE.allMinor;
}

function getUprightReversedGuidance(uprightCount, reversedCount) {
  const total = uprightCount + reversedCount;
  if (reversedCount === 0) return "全部正位——求问者的能量向外流动，课题集中在外部事件和显意识层面。";
  if (reversedCount === total) return "全部逆位——求问者的能量向内收缩，这是一个深度内在工作的时期。逆位不是'不好'，而是能量在内部酝酿、等待被觉察。请聚焦于内在转化而非外部事件。";
  if (reversedCount >= total * 0.5) return "逆位较多——内在功课是本次解读的主旋律。许多能量正在地下运作，表面看似平静或受阻，实则深层转变正在进行。";
  return "正位居多——求问者处于向外行动的阶段。少数逆位提示需要内省的具体领域。";
}

function getPositionGuidance(id, name) {
  const lower = (id + name).toLowerCase();
  if (lower.includes("past") || lower.includes("过去") || lower.includes("根源")) {
    return "【过去/根源位】这张牌揭示已发生的事如何塑造了当前局面。解读时请侧重：这件事留下了什么印记？求问者从中获得了什么经验或模式？30%关注事件本身，40%关注它对现在的影响，30%关注已学到的课题。";
  }
  if (lower.includes("present") || lower.includes("现在") || lower.includes("现状") || lower.includes("当前") || lower.includes("核心") || lower.includes("center")) {
    return "【现在/核心位】这张牌反映了当前能量的核心状态。解读时请侧重：此时此刻正在发生什么？求问者最需要关注的是什么？50%当前能量状态，30%行动焦点，20%需要放下的执念。";
  }
  if (lower.includes("future") || lower.includes("未来") || lower.includes("走向") || lower.includes("发展") || lower.includes("结果") || lower.includes("outcome")) {
    return "【未来/结果位】这张牌揭示了沿当前轨迹的自然走向——不是绝对的预言，而是趋势和可能。解读时请侧重：如果保持现状会如何？有哪些可操作的选择？40%潜在走向，30%可操作的行动建议，30%需要警惕的风险。";
  }
  if (lower.includes("阻碍") || lower.includes("obstacle") || lower.includes("challenge") || lower.includes("挑战") || lower.includes("困难")) {
    return "【阻碍/挑战位】这张牌指出横在前方的障碍。注意：阻碍往往不是外部敌人，而是内在的恐惧、旧模式或盲点。解读时请温和地指出——这不是指责，而是帮助求问者看见自己可能忽略的部分。";
  }
  if (lower.includes("建议") || lower.includes("advice") || lower.includes("指引") || lower.includes("行动")) {
    return "【建议/行动位】这张牌是塔罗给求问者的具体行动指引。解读时请直接、务实——求问者可以做什么？应该以什么样的心态去面对？给出具体的、可执行的方向。";
  }
  if (lower.includes("环境") || lower.includes("environment") || lower.includes("周围")) {
    return "【环境位】这张牌描述了求问者周围的人际环境或外部条件。解读时请注意：哪些外部因素在支持或阻碍？有哪些求问者可能忽略的外部资源？";
  }
  if (lower.includes("希望") || lower.includes("hope") || lower.includes("恐惧") || lower.includes("fear")) {
    return "【希望与恐惧位】这张牌揭示了求问者内心最深层的期待和担忧——它们往往是一体两面的。解读时请帮助求问者区分：哪些期待是真实的指南针，哪些恐惧是多余的枷锁？";
  }
  if (lower.includes("自我") || lower.includes("self") || lower.includes("你")) {
    return "【自我位】这张牌揭示了求问者在这个处境中的真实状态——可能和ta以为的自己不一样。解读时请帮助求问者看到自己的盲点和隐藏的力量。";
  }
  return "【位置解读】请结合该位置的具体含义，将牌义自然地映射到求问者当前的人生领域。";
}

export function buildPrompt(question, spread, placements, deckMeta) {
  const placedCards = spread.positions
    .map((pos) => placements[pos.id])
    .filter(Boolean);

  const majorCount = placedCards.filter((c) => c.arcana === "major").length;
  const uprightCount = placedCards.filter((c) => !c.isReversed).length;
  const reversedCount = placedCards.length - uprightCount;

  // 花色分布
  const suitCount = { wands: 0, cups: 0, swords: 0, pentacles: 0 };
  placedCards.forEach((c) => {
    if (c.suit && suitCount[c.suit] !== undefined) suitCount[c.suit]++;
  });
  const suitEntries = Object.entries(suitCount).filter(([, c]) => c > 0);
  const dominantSuit = suitEntries.sort((a, b) => b[1] - a[1])[0];

  // 重复数字
  const numbers = placedCards
    .filter((c) => c.number !== undefined)
    .map((c) => c.number);
  const numberCounts = {};
  numbers.forEach((n) => { numberCounts[n] = (numberCounts[n] || 0) + 1; });
  const repeatedNumbers = Object.entries(numberCounts)
    .filter(([, c]) => c >= 2)
    .map(([n, c]) => `数字${n}出现${c}次`);

  // ─── 牌阵位置解读权重 ───
  const positionGuidance = spread.positions
    .map((pos) => getPositionGuidance(pos.id, pos.name))
    .join("\n");

  // ─── 每张牌的详细数据 ───
  const cardsDetail = spread.positions.map((pos, i) => {
    const card = placements[pos.id];
    if (!card) return null;
    const orientation = card.isReversed ? "逆位" : "正位";
    const meaning = card.isReversed ? card.reversedMeaning : card.uprightMeaning;
    const symbolsText = (card.symbols || [])
      .map((s) => `${s.symbol}：${s.meaning}`)
      .join("；");
    const themesText = (card.lifeThemes || []).join("、");
    return `### 位置${i + 1}：${pos.name}
- 牌面：${card.nameZh}（${card.nameEn}）${orientation}
- 所属：${card.arcana === "major" ? "大阿卡纳" : `小阿卡纳·${ELEMENT_ZH[card.suit] || card.suit}`}
${card.number !== undefined ? `- 数字：${card.number}` : ""}
- 画面：${card.imagery || "（无画面描述）"}
- 象征符号：${symbolsText || "（无象征数据）"}
- 生活关联：${themesText || "（无关联数据）"}
- 牌义：${meaning}
- 关键词：${(card.keywords || []).join("、")}
- 解读位置权重：${getPositionGuidance(pos.id, pos.name)}`;
  }).filter(Boolean).join("\n\n");

  // ─── 宏观扫描数据 ───
  const macroScan = `## 宏观能量扫描（你需要在解读开头分析）

- 总牌数：${placedCards.length}张
- 大阿卡纳：${majorCount}张 / 小阿卡纳：${placedCards.length - majorCount}张
  → ${getArcanaSignificance(majorCount, placedCards.length)}
- 正位：${uprightCount}张 / 逆位：${reversedCount}张
  → ${getUprightReversedGuidance(uprightCount, reversedCount)}
- 花色分布：${suitEntries.map(([s, c]) => `${ELEMENT_ZH[s]} ${c}张`).join("、")}
  → 主导能量：${dominantSuit ? ELEMENT_ENERGY[dominantSuit[0]] : "无明确主导"}
${repeatedNumbers.length > 0 ? `- ⚠️ 重复数字：${repeatedNumbers.join("、")} → 这个数字的能量正在求问者生命的多领域同步运作，请在解读中特别指出` : ""}`;

  // ─── 问题 ───
  const questionLine = question
    ? `\n## 求问者的问题\n\n"${question}"\n\n请将所有解读紧扣此问题。如果牌面信息与问题看似无关——这正是需要你发挥塔罗智慧的地方：找到它们之间隐藏的连接。`
    : "\n## 求问者未提出具体问题\n\n请做一个开放式的整体能量解读，覆盖求问者可能最需要关注的 2-3 个生活领域。";

  return `你是一位专业的塔罗解读师。以下是本次占卜的完整信息，请按照要求的结构进行深度解读。

# 牌阵信息

- 牌阵：${spread.name}（${spread.description}）
- 牌组：${deckMeta.name}
- 解读风格：${deckMeta.interpretationStyle || "标准经典"}

# 牌阵位置解读权重指引

${positionGuidance}

${macroScan}
${questionLine}

# 每张牌的详细数据

${cardsDetail}

---

# 输出格式要求（严格按此结构）

请按以下五个部分组织你的解读，每个部分用 "## " 标题标记。这是专业塔罗师的标准解读流程：

## 🔮 能量全景

先从宏观角度给出整体印象。分析要点：
- 大牌/小牌的比重意味着什么（以上方宏观扫描数据为参考）
- 主导花色揭示了求问者当前生活的重心在哪里
- 正逆位分布反映了求问者处于怎样的心理状态
- 如果有重复数字，这个数字的象征意义如何贯穿整个牌面
- 用 2-3 句话概括整组牌传递的核心讯息

## 📜 牌面深解

逐张解读每张牌在其位置上的含义。注意：
- 必须结合"解读位置权重指引"中给定的权重来解读——同一张牌在不同位置的解读重心完全不同
- 引用牌面画面中的具体象征符号——它们不是装饰，是通向深层含义的钥匙
- 将牌义与求问者的实际问题建立具体连接（如果没有具体问题，则连接到最常见的生活场景）
- 逆位不是"坏牌"——它是能量的内转、延迟或被压抑的表达。请解释逆位在当下的积极意义
- 每张牌的解读长度应有实质内容，但避免冗长

## 🔗 牌际呼应

分析牌与牌之间的关系——这是专业解读最具洞察力的部分：
- 哪些牌在互相呼应？它们在讲述同一个故事的不同章节吗？
- 哪些牌之间存在张力或对立？这种张力对求问者意味着什么？
- 从第一张牌到最后一张牌，是否存在一条清晰的叙事弧线？如果有——请描述这个从 A 到 B 到 C 的旅程
- 如果某个花色/数字反复出现，这种重复想要强调什么？
- 牌面画面之间的视觉呼应（如果数据中有画面描述）

## 🧭 行动指引

将解读落地为求问者可以实际操作的行动建议。要求：
- 至少给出 3 条具体建议，每条建议必须直接回应牌面中揭示的课题
- 建议要具体、可执行——不是"保持积极心态"这种空话，而是"本周内约那个你一直想谈的人喝杯咖啡"
- 如果有阻碍牌，给出应对阻碍的具体策略
- 如果有建议牌，将其提示转化为具体行动步骤
- 如果有未来/结果牌，说明求问者现在可以做什么来影响那个走向
- 每条建议前用"▸"符号标记

## ✨ 此刻的讯息

用一段温暖有力的话作为结尾。这段讯息应该：
- 不是鸡汤，而是基于牌面真实讯息的提炼
- 让求问者感到被看见、被理解、被支持
- 包含一个可以带走的念头——今天就能用上的那种
- 2-3 句即可，不要过长

---

## 风格要求

- 用"你"直接对话，像一位有智慧的挚友在烛光下交谈
- 生活化的比喻优先于术语堆砌——如果必须用术语，一句话带过解释
- 不用绝对预言（"你将会…"），改用趋势表达（"你可能会感受到…""这段时期或许会带来…"）
- 如果牌面有挑战，温和地指出但始终带着建设性的出口
- 塔罗是镜子不是判决书——帮助求问者看见自己，而不是告诉他们命运是什么
- 中文输出`;
}
