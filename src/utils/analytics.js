export function filterByRange(records, range) {
  if (!records.length || range === "all") return records;
  const now = new Date();
  let cutoff;
  if (range === "week") {
    cutoff = new Date(now);
    cutoff.setDate(now.getDate() - 7);
  } else if (range === "month") {
    cutoff = new Date(now);
    cutoff.setMonth(now.getMonth() - 1);
  } else if (range === "3months") {
    cutoff = new Date(now);
    cutoff.setMonth(now.getMonth() - 3);
  }
  return records.filter((r) => new Date(r.timestamp) >= cutoff);
}

export function weeklyTrend(records) {
  const weeks = {};
  records.forEach((r) => {
    const d = new Date(r.timestamp);
    const monday = new Date(d);
    monday.setDate(d.getDate() - d.getDay() + 1);
    const key = monday.toISOString().slice(0, 10);
    if (!weeks[key]) weeks[key] = { total: 0, up: 0 };
    weeks[key].total++;
    if (r.rating === "up") weeks[key].up++;
  });
  return Object.entries(weeks)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-8)
    .map(([week, s]) => ({
      week: week.slice(5),
      total: s.total,
      rate: s.total > 0 ? Math.round((s.up / s.total) * 100) : 0,
    }));
}

export function deckPerformance(records) {
  const decks = {};
  records.forEach((r) => {
    const name = r.deckName || "未知";
    if (!decks[name]) decks[name] = { total: 0, up: 0 };
    decks[name].total++;
    if (r.rating === "up") decks[name].up++;
  });
  return Object.entries(decks)
    .map(([name, s]) => ({
      name,
      total: s.total,
      rate: s.total > 0 ? Math.round((s.up / s.total) * 100) : 0,
    }))
    .sort((a, b) => b.total - a.total);
}

export function categoryHeatmap(records) {
  const categories = ["爱情", "工作", "财富", "决策", "成长", "家庭", "健康"];
  const weeks = {};
  records.forEach((r) => {
    const d = new Date(r.timestamp);
    const monday = new Date(d);
    monday.setDate(d.getDate() - d.getDay() + 1);
    const weekKey = monday.toISOString().slice(0, 10);
    const cat = categorizeQuick(r.question);
    if (!weeks[weekKey]) weeks[weekKey] = {};
    if (!weeks[weekKey][cat]) weeks[weekKey][cat] = 0;
    weeks[weekKey][cat]++;
  });

  const sortedWeeks = Object.keys(weeks).sort().slice(-6);
  return { weeks: sortedWeeks.map((w) => w.slice(5)), categories, data: weeks };
}

function categorizeQuick(question) {
  if (!question) return "未分类";
  const map = {
    "爱情": ["爱情", "感情", "恋爱", "分手", "对象", "喜欢", "ta", "关系"],
    "工作": ["工作", "事业", "职业", "跳槽", "创业", "面试", "老板", "同事", "升职"],
    "财富": ["钱", "财富", "收入", "投资", "理财"],
    "决策": ["选择", "决定", "怎么选", "哪个", "要不要", "该不该"],
    "成长": ["迷茫", "方向", "目标", "自己", "成长", "改变", "人生", "意义"],
    "家庭": ["家", "父母", "孩子", "婚姻", "结婚", "离婚"],
    "健康": ["健康", "身体", "病", "恢复", "精力"],
  };
  for (const [cat, terms] of Object.entries(map)) {
    if (terms.some((t) => question.includes(t))) return cat;
  }
  return "未分类";
}

export function generateInsights(records) {
  if (records.length < 5) return [];

  const insights = [];
  const decks = deckPerformance(records);
  const lowDeck = decks.find((d) => d.rate < 70 && d.total >= 3);
  if (lowDeck) {
    insights.push(`${lowDeck.name}牌组的满意度偏低（${lowDeck.rate}%），建议检查该牌组的 persona 提示词是否需要优化。`);
  }

  const trends = weeklyTrend(records);
  if (trends.length >= 2) {
    const latest = trends[trends.length - 1];
    const prev = trends[trends.length - 2];
    if (latest.rate < prev.rate - 15) {
      insights.push(`最近一周满意度从 ${prev.rate}% 降至 ${latest.rate}%，值得关注是否有共性问题。`);
    }
    if (latest.rate > prev.rate + 10) {
      insights.push(`最近一周满意度从 ${prev.rate}% 升至 ${latest.rate}%，近期的优化可能已生效。`);
    }
  }

  const downCount = records.filter((r) => r.rating === "down").length;
  const hasFeedback = records.filter((r) => r.rating === "down" && r.feedbackText).length;
  if (downCount > 0 && hasFeedback === 0) {
    insights.push("低评分解读中有较多未提供文字反馈，建议在低分时主动引导用户写下建议。");
  }

  return insights;
}
