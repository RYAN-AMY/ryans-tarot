export const zh = {
  // Entry
  entryTitle: "探索命运之轮",
  dailyFortune: "✦ 今日运势",
  dailyFortuneSub: "抽一张牌，看看今天的能量",
  fullReading: "正式占卜",
  fullReadingSub: "提出你的问题，选择适合的牌阵",

  // Header
  brand: "RYAN's Tarot",
  fortuneMode: "今日运势",
  back: "← 返回",
  restart: "重新开始",

  // Auth
  yourName: "你的称呼",
  nameHint: "输入一个名字，记录你的塔罗之旅",
  nickname: "你的昵称",
  enter: "进入",
  skipLogin: "暂不登录",
  localOnlyHint: "数据保存在你的浏览器本地，不会上传到服务器",

  // User menu
  user: "用户",
  login: "登录",
  myReadings: "我的解读",
  dataCenter: "数据中心",
  logout: "退出",

  // Deck selector
  selectDeck: "选择你的牌组",
  selectDeckSub: "每套牌组有独特的视觉风格与解读视角",

  // Question
  yourQuestion: "你的问题",
  questionSub: "将你心中的疑问告诉塔罗",
  questionPlaceholder: "例如：我接下来的事业发展方向是什么？这段关系将如何发展？...",
  tryDailyFortune: "看今日运势",
  checkSpreads: "查看推荐牌阵",

  // Spread
  selectSpread: "选择牌阵",
  spreadSub: "牌阵决定了问题的探索深度与视角",
  spreadRecommended: "根据你的问题推荐以下牌阵",
  yourQuestionLabel: "你的问题",
  cards: "张牌",
  noSpreadMatch: "暂无与问题匹配的牌阵，试试修改问题",
  analyzingQuestion: "正在分析你的问题...",
  aiEnhanced: "AI 精推",

  // Shuffle
  shuffleBtn: "洗牌",
  stopShuffle: "停止洗牌",
  startShuffle: "开始洗牌",
  shuffling: "正在洗牌 · 包含正逆位随机...",
  cardsReady: "牌已就绪 · 集中在你的问题上，用心感受",

  // Drawing
  drawTitle: "选择你的牌",
  drawText: (n) => `凭直觉从圆弧中选出 ${n} 张牌`,
  arcHint: (n, total) => `拖动旋转牌弧 · 点击选牌 · 已选 ${n}/${total}`,

  // Hand area
  allPlacedDone: "所有牌已放置完毕 ✓",
  cardSelected: "👆 已选中牌，请点击上方牌阵位置放置",
  noCardSelected: "👆 先点击下方手牌选中，再点击牌阵位置放置",
  selected: "已选中",

  // Placing
  placeHint: "将手牌拖放至牌阵对应位置",
  placeCount: (n, total) => `将手牌拖放至牌阵对应位置 · 已放置 ${n}/${total}`,
  reveal: "揭晓命运",
  notRevealed: "未翻牌",
  remove: "移除",
  spreadHintPlacing: "点击手牌再点击位置放置",
  spreadHintRevealed: "牌阵全貌",

  // Revealed
  upright: "正位 ↓",
  reversed: "逆位 ↑",
  reversedShort: "逆位",
  viewReading: "查看完整解读",

  // Interpretation
  generating: "正在生成...",
  loadingMessages: [
    "塔罗正在解读你的牌面...",
    "感受牌中能量的流动...",
    "连接你的问题与牌面象征...",
    "解读画面中的隐藏讯息...",
    "编织命运的完整叙事...",
    "倾听古老智慧的指引...",
    "即将揭示属于你的答案...",
  ],
  loadingSub: "请耐心等待 · 深度解读需要一些时间",
  interpTitle: (name) => `${name} · 深度解读`,
  totalCards: (n) => `共 ${n} 张牌`,
  majorArcana: (n) => `大阿卡纳 ${n} 张`,
  uprightReversed: (u, r) => `正位 ${u} · 逆位 ${r}`,
  errorTitle: "解读暂时无法生成",
  errorHint: "请确保已设置 ANTHROPIC_API_KEY 环境变量，然后重启开发服务器",
  closing1: "以上解读由塔罗与 AI 共同完成。牌面是一面镜子，照见的是你内心本已具足的智慧。",
  closing2: "最好的预言，是你自己的行动。",
  closingBless: "✦ 祝福你，前路光明 ✦",
  fetchError: "解读请求失败",

  // Follow-up
  followUpDivider: "继续探索你的牌面",
  drawSupplementHint: "✦ 抽一张牌问问",
  drawSupplementSub: "对解读有疑问？再抽一张牌看看宇宙还想说什么",
  drawingCard: "牌来了...",
  followUpPlaceholder1: "结合补充牌，想了解什么？",
  followUpPlaceholder2: "对这次解读有什么想进一步了解的？",
  send: "发送",
  you: "你",
  tarot: "塔罗",
  supplementLabel: (name, isReversed) => `🃏 ${name}${isReversed ? " 逆" : " 正"}`,
  followUpError: "抱歉，解读暂时无法生成，请稍后再试。",

  // Feedback
  feedbackThanks: "感谢你的反馈，这将帮助塔罗更好地指引每一位来访者 ✦",
  feedbackQuestion: "这次解读对你有帮助吗？",
  helpful: "有帮助",
  notAccurate: "不太准",
  feedbackPlaceholder: "能告诉我哪里可以更好吗？...",
  submit: "提交",

  // Reading history
  historyTitle: "我的解读记录",
  historyLoginHint: "请先登录以查看你的解读记录",
  historyEmpty: "还没有进行过塔罗解读，去抽一张牌吧 ✦",
  historyCard: (pos, name, isReversed) => `${pos}: ${name}${isReversed ? " 逆" : ""}`,

  // Review dashboard
  dashboardTitle: "数据中心",
  dashboardTitleAlt: "解读反馈面板",
  dashboardBack: "← 返回",
  loading: "加载中...",
  noData: "暂无反馈数据",
  noDataHint: "完成解读后，用户可通过反馈按钮提交评价。登录后数据将跨设备同步。",
  totalReadings: "总解读数",
  satisfaction: "满意度",
  needsImprovement: "需要改进",
  hasTextFeedback: "有文字反馈",
  systemInsights: "系统洞察",
  satisfactionTrend: "满意度趋势",
  deckPerformance: "牌组表现",
  categoryHeatmap: "问题类型分布",
  lowRatedReadings: (n) => `低评分解读 (${n} 条)`,
  feedbackRecord: (text) => `反馈: ${text}`,
  categorySatisfaction: "问题类型满意度",
  readingCount: (n) => `${n} 次`,
  lowScoreKeywords: "低分问题高频词",
  feedbackKeywords: "用户反馈高频词",
  exportJSON: "导出反馈数据 (JSON)",
  exportHint: "导出后用 python scripts/analyze-feedback.py 做深度分析",
  all: "全部",
  thisWeek: "本周",
  thisMonth: "本月",
  threeMonths: "3个月",
  catLove: "爱情/感情",
  catWork: "工作/事业",
  catWealth: "财富/金钱",
  catDecision: "决策/选择",
  catGrowth: "成长/自我",
  catFamily: "家庭",
  catHealth: "健康",
  uncategorized: "未分类",

  // Disclaimer
  disclaimer: "仅供娱乐参考 · 请理性看待",

  // Lang toggle
  switchToZh: "切换中文",
  switchToEn: "Switch to English",
  langLabel: "中",
};

export const en = {
  // Entry
  entryTitle: "Discover the Wheel of Fate",
  dailyFortune: "✦ Daily Fortune",
  dailyFortuneSub: "Draw one card for today's energy",
  fullReading: "Full Reading",
  fullReadingSub: "Ask a question, pick a spread that fits",

  // Header
  brand: "RYAN's Tarot",
  fortuneMode: "Daily Fortune",
  back: "← Back",
  restart: "Restart",

  // Auth
  yourName: "Your Name",
  nameHint: "Enter a name to record your tarot journey",
  nickname: "Your nickname",
  enter: "Enter",
  skipLogin: "Skip for now",
  localOnlyHint: "Data is stored locally in your browser, not uploaded to any server",

  // User menu
  user: "User",
  login: "Login",
  myReadings: "My Readings",
  dataCenter: "Dashboard",
  logout: "Logout",

  // Deck selector
  selectDeck: "Choose Your Deck",
  selectDeckSub: "Each deck has a unique visual style and interpretation perspective",

  // Question
  yourQuestion: "Your Question",
  questionSub: "Tell the tarot what's on your mind",
  questionPlaceholder: "e.g. What's coming next in my career? How will this relationship unfold?...",
  tryDailyFortune: "Daily Fortune",
  checkSpreads: "See Recommended Spreads",

  // Spread
  selectSpread: "Choose a Spread",
  spreadSub: "The spread determines the depth of your reading",
  spreadRecommended: "Recommended spreads based on your question",
  yourQuestionLabel: "Your question",
  cards: "cards",
  noSpreadMatch: "No matching spreads found. Try a different question.",
  analyzingQuestion: "Analyzing your question...",
  aiEnhanced: "AI enhanced",

  // Shuffle
  shuffleBtn: "Shuffle",
  stopShuffle: "Stop Shuffle",
  startShuffle: "Start Shuffle",
  shuffling: "Shuffling · Randomizing upright & reversed...",
  cardsReady: "Cards ready · Focus on your question, feel the energy",

  // Drawing
  drawTitle: "Pick Your Cards",
  drawText: (n) => `Trust your intuition, select ${n} cards from the arc`,
  arcHint: (n, total) => `Drag to rotate · Click to pick · ${n}/${total} selected`,

  // Hand area
  allPlacedDone: "All cards placed ✓",
  cardSelected: "👆 Card selected, tap a position above to place it",
  noCardSelected: "👆 Select a card below first, then tap a position",
  selected: "Selected",

  // Placing
  placeHint: "Drag cards to spread positions",
  placeCount: (n, total) => `Drag cards to spread positions · ${n}/${total} placed`,
  reveal: "Reveal",
  notRevealed: "Face down",
  remove: "Remove",
  spreadHintPlacing: "Tap a card then tap a position",
  spreadHintRevealed: "Spread Overview",

  // Revealed
  upright: "Upright ↓",
  reversed: "Reversed ↑",
  reversedShort: "Reversed",
  viewReading: "View Full Reading",

  // Interpretation
  generating: "Generating...",
  loadingMessages: [
    "The tarot is reading your cards...",
    "Feeling the energy flow through the cards...",
    "Connecting your question with the symbols...",
    "Decoding the hidden messages...",
    "Weaving the full narrative...",
    "Listening to ancient wisdom...",
    "Your answer is almost ready...",
  ],
  loadingSub: "Please wait · A deep reading takes time",
  interpTitle: (name) => `${name} · Deep Reading`,
  totalCards: (n) => `${n} cards total`,
  majorArcana: (n) => `${n} Major Arcana`,
  uprightReversed: (u, r) => `${u} Upright · ${r} Reversed`,
  errorTitle: "Reading unavailable",
  errorHint: "Please make sure ANTHROPIC_API_KEY is set, then restart the dev server",
  closing1: "This reading was co-created by tarot and AI. The cards are a mirror, reflecting the wisdom that already lives within you.",
  closing2: "The best prophecy is your own action.",
  closingBless: "✦ May the road rise to meet you ✦",
  fetchError: "Failed to fetch reading",

  // Follow-up
  followUpDivider: "Explore Your Reading Further",
  drawSupplementHint: "✦ Draw a card to ask",
  drawSupplementSub: "Have questions? Draw another card to see what the universe wants to tell you",
  drawingCard: "Drawing...",
  followUpPlaceholder1: "With this new card, what would you like to know?",
  followUpPlaceholder2: "What would you like to explore further?",
  send: "Send",
  you: "You",
  tarot: "Tarot",
  supplementLabel: (name, isReversed) => `🃏 ${name}${isReversed ? " Rev" : " Up"}`,
  followUpError: "Sorry, the reading is temporarily unavailable. Please try again later.",

  // Feedback
  feedbackThanks: "Thank you for your feedback — it helps the tarot guide every visitor better ✦",
  feedbackQuestion: "Was this reading helpful?",
  helpful: "Helpful",
  notAccurate: "Not Accurate",
  feedbackPlaceholder: "Tell me what could be better...",
  submit: "Submit",

  // Reading history
  historyTitle: "My Reading History",
  historyLoginHint: "Please log in to view your reading history",
  historyEmpty: "No readings yet. Go draw your first card ✦",
  historyCard: (pos, name, isReversed) => `${pos}: ${name}${isReversed ? " Rev" : ""}`,

  // Review dashboard
  dashboardTitle: "Dashboard",
  dashboardTitleAlt: "Reading Feedback Panel",
  dashboardBack: "← Back",
  loading: "Loading...",
  noData: "No feedback data yet",
  noDataHint: "After readings, users can submit feedback. Login to sync data across devices.",
  totalReadings: "Total Readings",
  satisfaction: "Satisfaction",
  needsImprovement: "Needs Improvement",
  hasTextFeedback: "With Text Feedback",
  systemInsights: "System Insights",
  satisfactionTrend: "Satisfaction Trend",
  deckPerformance: "Deck Performance",
  categoryHeatmap: "Question Categories",
  lowRatedReadings: (n) => `Low-Rated Readings (${n})`,
  feedbackRecord: (text) => `Feedback: ${text}`,
  categorySatisfaction: "Satisfaction by Category",
  readingCount: (n) => `${n} readings`,
  lowScoreKeywords: "Frequent Words in Low Scores",
  feedbackKeywords: "Frequent Words in Feedback",
  exportJSON: "Export Feedback (JSON)",
  exportHint: "Export then analyze with: python scripts/analyze-feedback.py",
  all: "All",
  thisWeek: "This Week",
  thisMonth: "This Month",
  threeMonths: "3 Months",
  catLove: "Love",
  catWork: "Work",
  catWealth: "Wealth",
  catDecision: "Decisions",
  catGrowth: "Growth",
  catFamily: "Family",
  catHealth: "Health",
  uncategorized: "Uncategorized",

  // Disclaimer
  disclaimer: "For entertainment only · A tool for reflection",

  // Lang toggle
  switchToZh: "切换中文",
  switchToEn: "Switch to English",
  langLabel: "EN",
};
