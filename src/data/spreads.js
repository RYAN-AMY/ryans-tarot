/**
 * 塔罗牌阵定义 + 智能推荐。
 *
 * 推荐分两层：
 * 1. 本地打分（即时，无网络请求）——多维分析问题后给每个牌阵打分
 * 2. AI 推荐（后台预取）——语义理解，返回推荐理由
 * 两层结果合并，AI 结果到达后无缝替换。
 */

export const spreads = [
  {
    id: "single",
    name: "单张指引",
    nameEn: "Single Card",
    description: "最适合每日指引或当下面临的具体问题。一张牌直指核心讯息。",
    descriptionEn: "Best for daily guidance or a quick answer. One card speaks directly to the core.",
    cards: 1,
    // 本地打分权重配置
    scoreWeights: {
      complexity: { simple: 25, medium: 5, deep: 0 },
      intents: { quickAnswer: 15, daily: 15 },
      domains: {},
    },
    positions: [
      { id: "center", name: "核心指引", description: "当下的核心讯息与方向", x: 50, y: 50 },
    ],
  },
  {
    id: "three-card",
    name: "三张时光",
    nameEn: "Three-Card Past-Present-Future",
    description: "经典的三张牌阵，揭示过去的影响、现在的状态和未来的走向。",
    descriptionEn: "This classic spread reveals the influence of the past, the state of the present, and the direction of the future.",
    cards: 3,
    scoreWeights: {
      complexity: { simple: 10, medium: 25, deep: 5 },
      intents: { how: 15, future: 20, emotional: 15, daily: 5 },
      domains: { love: 10, career: 15, growth: 15, decision: 10, general: 20 },
    },
    positions: [
      { id: "past", name: "过去", description: "过去的影响与根源", x: 15, y: 50 },
      { id: "present", name: "现在", description: "当前的状态与核心", x: 50, y: 50 },
      { id: "future", name: "未来", description: "未来的走向与可能", x: 85, y: 50 },
    ],
  },
  {
    id: "body-mind-spirit",
    name: "身心灵",
    nameEn: "Body-Mind-Spirit",
    description: "从身体/行动、心理/情绪、灵性/直觉三个层面看问题的整体影响。",
    descriptionEn: "Examines your situation through body (action), mind (emotion), and spirit (intuition).",
    cards: 3,
    scoreWeights: {
      complexity: { simple: 5, medium: 20, deep: 15 },
      intents: { selfGrowth: 30, emotional: 25, why: 15 },
      domains: { growth: 30, health: 20, general: 5 },
    },
    positions: [
      { id: "body", name: "身体·行动", description: "你正在做什么，外在的行动层面", x: 15, y: 50 },
      { id: "mind", name: "心理·情绪", description: "你感受到什么，内心的情感层面", x: 50, y: 50 },
      { id: "spirit", name: "灵性·直觉", description: "深层的直觉与内在智慧", x: 85, y: 50 },
    ],
  },
  {
    id: "crossroads",
    name: "二择一",
    nameEn: "Crossroads",
    description: "面对两个选择时的决策指引，看清每条路径的走向与结果。",
    descriptionEn: "Decision guidance when facing two choices — see where each path leads.",
    cards: 5,
    scoreWeights: {
      complexity: { simple: 0, medium: 15, deep: 25 },
      intents: { decision: 40, comparison: 35, how: 10 },
      domains: { decision: 35, love: 15, career: 20 },
    },
    positions: [
      { id: "center", name: "当前处境", description: "问题的核心与现状", x: 50, y: 50 },
      { id: "pathA", name: "选择A", description: "第一个选项的路径", x: 25, y: 25 },
      { id: "pathB", name: "选择B", description: "第二个选项的路径", x: 75, y: 25 },
      { id: "outcomeA", name: "A的结果", description: "选择A的可能结果", x: 15, y: 10 },
      { id: "outcomeB", name: "B的结果", description: "选择B的可能结果", x: 85, y: 10 },
    ],
  },
  {
    id: "problem-solver",
    name: "问题解决",
    nameEn: "Problem Solver",
    description: "聚焦问题本身，四张牌揭示问题本质、隐藏因素、建议行动和可能结果。",
    descriptionEn: "Four focused cards revealing the core issue, hidden factors, suggested action, and outcome.",
    cards: 4,
    scoreWeights: {
      complexity: { simple: 0, medium: 20, deep: 20 },
      intents: { why: 35, how: 25, decision: 20, emotional: 10 },
      domains: { career: 20, decision: 25, growth: 15, general: 10 },
    },
    positions: [
      { id: "nature", name: "问题本质", description: "这个问题的真正核心是什么", x: 15, y: 50 },
      { id: "hidden", name: "隐藏因素", description: "你没有注意到的影响因素", x: 50, y: 25 },
      { id: "advice", name: "建议行动", description: "塔罗建议你采取的行动", x: 50, y: 75 },
      { id: "outcome", name: "可能结果", description: "按建议行动后的走向", x: 85, y: 50 },
    ],
  },
  {
    id: "career-ladder",
    name: "事业阶梯",
    nameEn: "Career Ladder",
    description: "面向工作与事业的专业牌阵，从现状、阻碍、机遇、建议到发展逐层递进。",
    descriptionEn: "A career-focused spread progressing from current status through obstacles, opportunities, advice, and long-term growth.",
    cards: 5,
    scoreWeights: {
      complexity: { simple: 0, medium: 15, deep: 25 },
      intents: { how: 20, future: 25, why: 10 },
      domains: { career: 40, money: 15 },
    },
    positions: [
      { id: "status", name: "现状", description: "目前工作中的状态与位置", x: 50, y: 15 },
      { id: "obstacle", name: "阻碍", description: "面临的挑战与瓶颈", x: 15, y: 50 },
      { id: "opportunity", name: "机遇", description: "正在靠近的转机与机会", x: 85, y: 50 },
      { id: "advice", name: "建议", description: "塔罗给你的行动指引", x: 50, y: 75 },
      { id: "development", name: "发展", description: "长期的发展趋势", x: 50, y: 85 },
    ],
  },
  {
    id: "love-pyramid",
    name: "爱情金字塔",
    nameEn: "Love Pyramid",
    description: "金字塔形深入感情的四个层面：你的状态、对方状态、关系现状和未来发展。",
    descriptionEn: "Pyramid-shaped spread exploring four layers: your state, their state, relationship dynamics, and future.",
    cards: 4,
    scoreWeights: {
      complexity: { simple: 5, medium: 20, deep: 15 },
      intents: { future: 15, emotional: 20 },
      domains: { love: 40, relationship: 35 },
    },
    positions: [
      { id: "you", name: "你的状态", description: "你在这段感情中的内心状态", x: 30, y: 30 },
      { id: "them", name: "对方状态", description: "对方在这段感情中的状态", x: 70, y: 30 },
      { id: "relationship", name: "关系现状", description: "你们关系的当前状态", x: 50, y: 55 },
      { id: "future", name: "未来发展", description: "这段感情的可能走向", x: 50, y: 85 },
    ],
  },
  {
    id: "relationship",
    name: "关系之镜",
    nameEn: "Relationship Mirror",
    description: "深入探索两人的关系动态，理解彼此的感受、阻碍与未来走向。",
    descriptionEn: "Deep dive into the dynamics between two people — feelings, obstacles, and the path ahead.",
    cards: 7,
    scoreWeights: {
      complexity: { simple: 0, medium: 10, deep: 30 },
      intents: { why: 20, emotional: 25, future: 15 },
      domains: { love: 35, relationship: 40 },
    },
    positions: [
      { id: "you", name: "你", description: "你在这段关系中的状态", x: 15, y: 30 },
      { id: "them", name: "对方", description: "对方在这段关系中的状态", x: 85, y: 30 },
      { id: "relationship", name: "关系现状", description: "两人关系的当前状态", x: 50, y: 50 },
      { id: "yourFeelings", name: "你的感受", description: "你内心深处的真实感受", x: 25, y: 70 },
      { id: "theirFeelings", name: "对方的感受", description: "对方内心深处的真实感受", x: 75, y: 70 },
      { id: "obstacle", name: "阻碍", description: "关系中的障碍与挑战", x: 50, y: 20 },
      { id: "future", name: "未来走向", description: "这段关系的可能发展方向", x: 50, y: 85 },
    ],
  },
  {
    id: "life-compass",
    name: "人生罗盘",
    nameEn: "Life Compass",
    description: "从四个方向探索你的处境：应该放下什么、抓住什么、注意什么、期待什么。",
    descriptionEn: "Explore four directions: what to release, what to seize, what to watch for, and what to expect.",
    cards: 4,
    scoreWeights: {
      complexity: { simple: 5, medium: 20, deep: 15 },
      intents: { selfGrowth: 30, how: 20, emotional: 15 },
      domains: { growth: 35, decision: 15, general: 15 },
    },
    positions: [
      { id: "release", name: "放下", description: "你应该放手的东西", x: 15, y: 50 },
      { id: "seize", name: "抓住", description: "你应该把握的机遇", x: 85, y: 50 },
      { id: "caution", name: "注意", description: "你需要小心的陷阱", x: 50, y: 15 },
      { id: "expect", name: "期待", description: "你可以期待的转机", x: 50, y: 85 },
    ],
  },
  {
    id: "hexagram",
    name: "六芒星",
    nameEn: "Hexagram Spread",
    description: "七张牌的深层分析，揭示问题的前因后果、内外因素与最终结果。",
    descriptionEn: "Deep seven-card analysis revealing the full picture — causes, internal/external factors, and the ultimate outcome.",
    cards: 7,
    scoreWeights: {
      complexity: { simple: 0, medium: 5, deep: 30 },
      intents: { why: 20, future: 25, how: 15 },
      domains: { career: 15, decision: 20, growth: 15, general: 15 },
    },
    positions: [
      { id: "past", name: "过去", description: "问题的根源与背景", x: 15, y: 50 },
      { id: "present", name: "现在", description: "当前的核心状态", x: 50, y: 50 },
      { id: "future", name: "未来", description: "未经干预的自然发展", x: 85, y: 50 },
      { id: "obstacle", name: "阻碍", description: "面临的挑战与障碍", x: 50, y: 25 },
      { id: "environment", name: "环境", description: "周围环境与人际影响", x: 50, y: 75 },
      { id: "hope", name: "希望", description: "内心的期望与恐惧", x: 25, y: 25 },
      { id: "outcome", name: "结果", description: "最终的可能走向", x: 75, y: 25 },
    ],
  },
  {
    id: "celtic-cross",
    name: "凯尔特十字",
    nameEn: "Celtic Cross",
    description: "最经典全面的十张牌大牌阵，深度剖析问题的各个维度，适合重大问题的全面解读。",
    descriptionEn: "The classic 10-card spread for comprehensive analysis. Best for major life questions.",
    cards: 10,
    scoreWeights: {
      complexity: { simple: 0, medium: 0, deep: 35 },
      intents: { why: 15, future: 20, selfGrowth: 20 },
      domains: { career: 15, growth: 20, decision: 20, general: 10 },
    },
    positions: [
      { id: "present", name: "现状", description: "当前的核心状态", x: 50, y: 50 },
      { id: "challenge", name: "阻碍", description: "横在面前的挑战", x: 50, y: 40 },
      { id: "past", name: "根源", description: "遥远的过去，问题的基础", x: 50, y: 65 },
      { id: "recentPast", name: "过去", description: "近期的过去", x: 15, y: 50 },
      { id: "goal", name: "目标", description: "最好的可能结果", x: 50, y: 15 },
      { id: "nearFuture", name: "近未来", description: "即将发生的事情", x: 85, y: 50 },
      { id: "self", name: "自我", description: "你在这个处境中的态度", x: 15, y: 20 },
      { id: "environment", name: "环境", description: "周围环境与人际关系", x: 85, y: 20 },
      { id: "hopes", name: "希望与恐惧", description: "内心的期待与担忧", x: 15, y: 80 },
      { id: "outcome", name: "结果", description: "综合所有因素后的走向", x: 85, y: 80 },
    ],
  },
  {
    id: "moon-phase",
    name: "月相能量",
    nameEn: "Moon Phase",
    description: "跟随月相周期——新月、上弦月、满月、下弦月——理解事情的发展节奏。",
    descriptionEn: "Follow the lunar cycle — new moon, waxing, full moon, waning — to understand the rhythm of events.",
    cards: 4,
    scoreWeights: {
      complexity: { simple: 5, medium: 15, deep: 10 },
      intents: { future: 15, daily: 10, selfGrowth: 20 },
      domains: { growth: 20, general: 10 },
    },
    positions: [
      { id: "newMoon", name: "新月·开端", description: "萌芽的阶段，新的可能性", x: 15, y: 50 },
      { id: "waxing", name: "上弦月·行动", description: "积累能量的阶段", x: 50, y: 15 },
      { id: "fullMoon", name: "满月·显化", description: "结果显现的高潮阶段", x: 85, y: 50 },
      { id: "waning", name: "下弦月·释放", description: "收尾与放手的阶段", x: 50, y: 85 },
    ],
  },
  {
    id: "four-seasons",
    name: "四季轮转",
    nameEn: "Four Seasons",
    description: "对应春夏秋冬四季能量，适合季度运势或人生阶段的全面检视。",
    descriptionEn: "Aligns with the four seasons — ideal for quarterly check-ins or life stage reflection.",
    cards: 4,
    scoreWeights: {
      complexity: { simple: 5, medium: 15, deep: 10 },
      intents: { future: 20, daily: 10, selfGrowth: 15 },
      domains: { career: 10, growth: 20, general: 15 },
    },
    positions: [
      { id: "spring", name: "春·新生", description: "新的开始、萌芽与希望", x: 50, y: 15 },
      { id: "summer", name: "夏·繁盛", description: "成长、行动与热情", x: 85, y: 50 },
      { id: "autumn", name: "秋·收获", description: "成果、反思与感恩", x: 50, y: 85 },
      { id: "winter", name: "冬·沉淀", description: "休养、内省与准备", x: 15, y: 50 },
    ],
  },
  {
    id: "chakra-seven",
    name: "七脉轮",
    nameEn: "Seven Chakras",
    description: "从海底轮到顶轮逐层检视能量状态，适合个人成长与身心健康探索。",
    descriptionEn: "Examine energy from root to crown chakra. Ideal for personal growth and well-being.",
    cards: 7,
    scoreWeights: {
      complexity: { simple: 0, medium: 5, deep: 25 },
      intents: { selfGrowth: 35, emotional: 20, why: 10 },
      domains: { growth: 35, health: 25 },
    },
    positions: [
      { id: "root", name: "海底轮·根基", description: "安全感与生存基础", x: 15, y: 10 },
      { id: "sacral", name: "脐轮·情感", description: "情感创造力", x: 30, y: 25 },
      { id: "solar", name: "太阳轮·力量", description: "个人意志与自信", x: 50, y: 40 },
      { id: "heart", name: "心轮·爱", description: "爱与慈悲", x: 50, y: 60 },
      { id: "throat", name: "喉轮·表达", description: "沟通与真实表达", x: 70, y: 75 },
      { id: "thirdEye", name: "眉心轮·直觉", description: "直觉与洞察力", x: 85, y: 50 },
      { id: "crown", name: "顶轮·觉醒", description: "灵性连接", x: 60, y: 90 },
    ],
  },
  {
    id: "zodiac",
    name: "黄道十二宫",
    nameEn: "Zodiac Houses",
    description: "对应星盘十二宫位，全方位解读人生各个领域，适合年度运势或完整人生探索。",
    descriptionEn: "All 12 astrological houses for a complete life overview. Perfect for annual outlook.",
    cards: 12,
    scoreWeights: {
      complexity: { simple: 0, medium: 0, deep: 35 },
      intents: { future: 25, selfGrowth: 25, daily: 5 },
      domains: { growth: 25, general: 15 },
    },
    positions: [
      { id: "house1", name: "第一宫·自我", description: "个人形象与生命态度", x: 50, y: 8 },
      { id: "house2", name: "第二宫·财富", description: "金钱与价值观", x: 78, y: 14 },
      { id: "house3", name: "第三宫·沟通", description: "学习与交流", x: 92, y: 35 },
      { id: "house4", name: "第四宫·家庭", description: "家庭与内在安全感", x: 92, y: 60 },
      { id: "house5", name: "第五宫·创造", description: "创造力与恋爱", x: 78, y: 82 },
      { id: "house6", name: "第六宫·健康", description: "工作与健康", x: 50, y: 92 },
      { id: "house7", name: "第七宫·伴侣", description: "婚姻与合作关系", x: 22, y: 82 },
      { id: "house8", name: "第八宫·转化", description: "深层心理与蜕变", x: 8, y: 60 },
      { id: "house9", name: "第九宫·信念", description: "哲学与高等教育", x: 8, y: 35 },
      { id: "house10", name: "第十宫·事业", description: "职业与人生目标", x: 50, y: 22 },
      { id: "house11", name: "第十一宫·社群", description: "朋友与社会理想", x: 28, y: 14 },
      { id: "house12", name: "第十二宫·灵性", description: "潜意识与灵性成长", x: 50, y: 72 },
    ],
  },
];

export const getSpread = (id) => spreads.find((s) => s.id === id);

// ═══════════════════════════════════════════════════════
// 多维度问题分析 + 牌阵打分
// ═══════════════════════════════════════════════════════

/**
 * 分析用户问题，提取多维特征。
 */
function analyzeQuestion(q) {
  const text = q.trim();
  const len = text.length;

  // 复杂度
  const complexity = len <= 8 ? "simple" : len <= 25 ? "medium" : "deep";

  // 意图检测
  const intents = {
    decision: /还是|或者|怎么选|要不要|该不该|选哪个|纠结|犹豫|抉择|哪个更|二选一|取舍/.test(text),
    comparison: /比较|对比|vs|还是|哪个/.test(text),
    why: /为什么|为何|原因|根源|怎么回事|为啥/.test(text),
    how: /怎么(办|做|处理|应对|解决)|如何|怎样|方法/.test(text),
    future: /未来|以后|会不会|最终|结果|走向|发展|趋势|前景/.test(text),
    selfGrowth: /自己|成长|改变|迷茫|方向|意义|内心|自我|人生|目标|我是|成为/.test(text),
    emotional: /难过|焦虑|害怕|担心|痛苦|伤心|孤独|累|疲惫|失眠|抑郁|烦|崩溃/.test(text),
    daily: /今天|今日|明天|本周|这个月|运势|运气|最近|当下|现在/.test(text),
    quickAnswer: /是不是|对不对|会不会|能不能|有没有/.test(text),
  };

  // 领域检测（加权关键词）
  const domainKw = {
    love: ["爱", "感情", "恋爱", "分手", "喜欢", "对象", "ta", "男朋友", "女朋友", "表白", "暗恋", "暧昧", "婚姻", "结婚", "离婚", "在一起", "前任", "复合", "桃花", "心动", "追求", "约会"],
    relationship: ["关系", "相处", "沟通", "对方", "彼此", "之间", "两人", "我们", "他对我", "她对我", "冷战", "吵架", "和好"],
    career: ["工作", "事业", "职业", "跳槽", "面试", "老板", "同事", "升职", "辞职", "转行", "职场", "创业", "项目", "公司", "offer", "薪资", "薪水", "前途"],
    money: ["钱", "财务", "投资", "收入", "赚", "亏", "花销", "理财", "股票", "基金", "买房", "存款"],
    health: ["健康", "身体", "病", "恢复", "睡眠", "累", "疲劳", "精力"],
    study: ["学", "考试", "成绩", "毕业", "考研", "论文", "课程", "录取"],
    growth: ["迷茫", "方向", "目标", "自己", "成长", "改变", "人生", "意义", "探索", "提升", "突破", "修行"],
  };

  const domains = {};
  for (const [domain, kws] of Object.entries(domainKw)) {
    let hits = 0;
    for (const kw of kws) {
      if (text.includes(kw)) hits++;
    }
    domains[domain] = hits;
  }

  // 是否涉及他人（需要关系类牌阵）
  const involvesOthers = /对方|ta|他|她|我们|两人|彼此|男朋友|女朋友|老板|同事|父母|朋友|家人/.test(text);

  return { complexity, intents, domains, involvesOthers, len };
}

/**
 * 根据问题分析结果给每个牌阵打分。
 * 返回按分数降序排列的牌阵列表。
 */
export function getRecommendedSpreads(question) {
  if (!question || !question.trim()) {
    return spreads.filter((s) => s.id === "single" || s.id === "three-card" || s.id === "body-mind-spirit");
  }

  const analysis = analyzeQuestion(question);

  const scored = spreads.map((spread) => {
    let score = 0;
    const w = spread.scoreWeights;

    // 复杂度匹配
    score += (w.complexity[analysis.complexity] || 0);

    // 意图匹配
    for (const [intent, active] of Object.entries(analysis.intents)) {
      if (active && w.intents[intent]) {
        score += w.intents[intent];
      }
    }

    // 领域匹配
    for (const [domain, hits] of Object.entries(analysis.domains)) {
      if (hits > 0 && w.domains[domain]) {
        score += w.domains[domain] * Math.min(hits, 2);
      }
    }

    // 涉及他人时，关系类牌阵加分
    if (analysis.involvesOthers) {
      if (spread.id === "love-pyramid" || spread.id === "relationship") score += 15;
      if (spread.id === "crossroads") score += 5;
    }

    // 通用兜底：三张时光对所有问题有基础分
    if (spread.id === "three-card") score += 8;

    return { spread, score };
  });

  scored.sort((a, b) => b.score - a.score);

  // 返回 top 5 + 单张指引（如果不在 top 5 中）
  const top5 = scored.slice(0, 5).map((s) => s.spread);
  const hasSingle = top5.find((s) => s.id === "single");
  if (!hasSingle) {
    const single = spreads.find((s) => s.id === "single");
    top5.push(single);
  }

  return top5;
}

/**
 * 构建 AI 牌阵推荐的 prompt 数据。
 * 仅在预取 AI 推荐时使用。
 */
export function buildRecommendPrompt(question, lang) {
  const catalog = spreads.map((s) =>
    `- id:${s.id} | ${lang === "en" && s.nameEn ? s.nameEn : s.name} | ${s.cards}张 | ${lang === "en" && s.descriptionEn ? s.descriptionEn : s.description}`
  ).join("\n");

  return {
    systemPrompt: `你是塔罗咨询顾问。分析问题后推荐3-4个最合适的牌阵。

原则：
- 简单yes/no问题→1-3张牌阵；人生重大抉择→5张以上深度的牌阵
- 爱情感情→关系类牌阵；工作决策→事业类牌阵；自我成长迷茫→身心灵/罗盘类
- 面对选择→二择一/问题解决；追问原因→问题解决/六芒星
- 推荐从不同角度切入，不要同类型变体
- 必须包含单张指引(single)作为兜底

只输出JSON对象：{"recommendations":[{"id":"牌阵id","reason":"推荐理由（直接对话语气，15字以内）"}]}`,
    userMessage: `问题："${question}"\n\n可选牌阵：\n${catalog}\n\n推荐3-4个最合适的。`,
  };
}
