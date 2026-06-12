/**
 * 构建塔罗解读 prompt——极简版。
 * 核心原则：少废话，直击要害。不要堆砌，不要鸡汤。
 */

const ELEMENT_ZH = { wands: "火·权杖", cups: "水·圣杯", swords: "风·宝剑", pentacles: "土·星币" };

const ARCANA_NOTE = {
  allMajor: "全大牌→灵魂层面的重大转折，非日常琐事。",
  mostlyMajor: "大牌过半→深层人生转变。",
  balanced: "大小牌均衡→有方向也有具体情境。",
  mostlyMinor: "小牌为主→聚焦日常具体课题。",
  allMinor: "全小牌→务实的日常探索。",
};

function arcanaNote(major, total) {
  if (major === total) return ARCANA_NOTE.allMajor;
  if (major >= total * 0.5) return ARCANA_NOTE.mostlyMajor;
  if (major >= 2) return ARCANA_NOTE.balanced;
  if (major >= 1) return ARCANA_NOTE.mostlyMinor;
  return ARCANA_NOTE.allMinor;
}

function reversedNote(up, rev) {
  if (rev === 0) return "全正位→能量向外，聚焦外部事件。";
  if (rev === up + rev) return "全逆位→深度内在功课，能量在内部酝酿。";
  if (rev >= (up + rev) * 0.5) return "逆位较多→内在转化是主旋律。";
  return "";
}

function posGuide(id, name) {
  const s = (id + name).toLowerCase();
  if (/past|过去|根源/.test(s)) return "【过去/根源】重在：这件事留下了什么印记？求问者获得了什么经验？";
  if (/present|现在|现状|当前|核心|center/.test(s)) return "【现在/核心】重在：当前能量的核心状态。求问者最需要关注什么？";
  if (/future|未来|走向|发展|结果|outcome/.test(s)) return "【未来/结果】重在：按当前轨迹的自然趋势。不是预言，是可影响的方向。";
  if (/阻碍|obstacle|challenge|挑战/.test(s)) return "【阻碍】重在：障碍往往不是外部敌人，是内在的恐惧或盲点。温和指出。";
  if (/建议|advice|指引|行动/.test(s)) return "【建议/行动】重在：具体、可执行的行动方向。不要空话。";
  if (/环境|environment|周围/.test(s)) return "【环境】重在：外部因素在支持还是阻碍？求问者可能忽略了什么资源？";
  if (/希望|hope|恐惧|fear/.test(s)) return "【希望与恐惧】重在：期待和担忧往往一体两面。哪些期待是真的？哪些恐惧是多余的？";
  if (/自我|self|你/.test(s)) return "【自我】重在：求问者在这个处境中的真实状态——可能和ta以为的不一样。";
  return "结合该位置的含义，将牌义映射到求问者的人生领域。";
}

export function buildPrompt(question, spread, placements, deckMeta) {
  const placed = spread.positions.map((p) => placements[p.id]).filter(Boolean);
  const majorCount = placed.filter((c) => c.arcana === "major").length;
  const upCount = placed.filter((c) => !c.isReversed).length;
  const revCount = placed.length - upCount;

  const suits = {};
  placed.forEach((c) => { if (c.suit) suits[c.suit] = (suits[c.suit] || 0) + 1; });
  const topSuit = Object.entries(suits).sort((a, b) => b[1] - a[1])[0];

  const nums = {};
  placed.forEach((c) => { if (c.number !== undefined) nums[c.number] = (nums[c.number] || 0) + 1; });
  const repeatNums = Object.entries(nums).filter(([, c]) => c >= 2).map(([n, c]) => `数字${n}×${c}`);

  const cardsBlock = spread.positions.map((pos, i) => {
    const card = placements[pos.id];
    if (!card) return null;
    const ori = card.isReversed ? "逆位" : "正位";
    const meaning = (card.isReversed ? card.reversedMeaning : card.uprightMeaning) || "";
    const syms = (card.symbols || []).map((s) => `${s.symbol}:${s.meaning}`).join("；");
    const arcanaLabel = card.arcana === "major" ? "大牌" : `小牌·${ELEMENT_ZH[card.suit] || ""}`;
    return `## ${pos.name}（${pos.description}）
${card.nameZh} / ${card.nameEn} / ${arcanaLabel} / ${ori}${card.number !== undefined ? ` / 数字${card.number}` : ""}
画面：${card.imagery || "无"}
符号：${syms || "无"}
牌义：${meaning}
位置指引：${posGuide(pos.id, pos.name)}`;
  }).filter(Boolean).join("\n\n");

  const qLine = question ? `\n问题："${question}"。紧扣此问题解读，不要偏离。` : "";

  return `你是塔罗解读师。以下是一次占卜的完整信息。请给出直接、有洞察力的解读。

# 牌阵
${spread.name}（${spread.description}）| ${deckMeta.name} | ${placed.length}张牌
大牌${majorCount}张/小牌${placed.length - majorCount}张 | 正位${upCount}/逆位${revCount}
${topSuit ? `主导花色：${ELEMENT_ZH[topSuit[0]]}×${topSuit[1]}` : ""}
${repeatNums.length > 0 ? `重复数字：${repeatNums.join(" ")}` : ""}
${arcanaNote(majorCount, placed.length)}
${revCount > 0 ? reversedNote(upCount, revCount) : ""}
${qLine}

# 牌面数据

${cardsBlock}

---

# 解读要求

**总字数**：500-800字。每个字都要有用，不要废话也不要不给够信息。

**结构**（三段自然过渡，不用标题）：

第一段（3-4句）——能量速写。这组牌在说什么？求问者面对的核心局面是什么？从宏观牌面（大牌/小牌比例、花色主导、正逆位分布）给出一个整体判断。不要铺垫，第一句就进入正题。

第二段——挑关键的牌展开讲。不需要每张牌都说，重点讲2-4张和问题最直接相关的牌。每张牌说清楚三点：这张牌在这个位置意味着什么，画面中哪些细节支撑这个判断，对求问者的具体处境意味着什么。逆位说出它的建设性意义。牌与牌之间如果有呼应或冲突，自然带出来——没有就别硬扯。

第三段——给求问者最直接的建议。不要"保持积极心态"这类正确的废话。基于牌面信息，说出ta现在最需要做的1-2件事。具体到ta今天就能开始做的事情。

**禁止**：
- 禁止说"这张牌代表了…"——直接解释，不要声明你在解释
- 禁止鸡汤式结尾（"相信自己""宇宙会指引你"之类）
- 禁止超过500字
- 禁止逐张牌依次分析——只讲重点
- 禁止术语堆砌——如果必须用术语，后面立刻用一句话解释

**语气**：像一个看事情很准的朋友。直接，但不冷漠。不用"你"，但也不要太正式。`;
}
