import { useState, useEffect } from "react";
import { getFeedbackRecords, loadLegacyFeedback } from "../lib/userStore";
import { filterByRange, weeklyTrend, deckPerformance, categoryHeatmap, generateInsights } from "../utils/analytics";

function exportJSON(records) {
  const blob = new Blob([JSON.stringify(records, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `tarot-feedback-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

const QUESTION_CATEGORIES = [
  { key: "爱情", label: "爱情/感情", terms: ["爱情", "感情", "恋爱", "分手", "对象", "喜欢", "ta", "他", "她", "关系"] },
  { key: "工作", label: "工作/事业", terms: ["工作", "事业", "职业", "跳槽", "创业", "面试", "老板", "同事", "升职"] },
  { key: "财富", label: "财富/金钱", terms: ["钱", "财富", "收入", "投资", "理财", "负债", "花销"] },
  { key: "决策", label: "决策/选择", terms: ["选择", "决定", "怎么选", "哪个", "A还是B", "要不要", "该不该"] },
  { key: "成长", label: "成长/自我", terms: ["迷茫", "方向", "目标", "自己", "成长", "改变", "人生", "意义"] },
  { key: "家庭", label: "家庭", terms: ["家", "父母", "孩子", "婚姻", "结婚", "离婚"] },
  { key: "健康", label: "健康", terms: ["健康", "身体", "病", "恢复", "精力"] },
];

function categorizeQuestion(question) {
  if (!question) return "未分类";
  const match = QUESTION_CATEGORIES.find((cat) =>
    cat.terms.some((t) => question.includes(t))
  );
  return match ? match.key : "未分类";
}

function keywordFreq(texts, topN = 8) {
  const stopwords = new Set(["我", "的", "是", "了", "在", "不", "和", "有", "这", "那", "他", "她", "它", "你", "吧", "吗", "呢", "啊", "么", "就", "也", "都", "会", "要", "能", "去", "还", "没", "看", "想", "说", "做", "但", "对", "可以", "因为", "所以", "如果"]);
  const freq = {};
  for (const text of texts) {
    if (!text) continue;
    for (const char of text) {
      if (stopwords.has(char)) continue;
      freq[char] = (freq[char] || 0) + 1;
    }
    for (const word of text.match(/[一-鿿]{2}/g) || []) {
      if (stopwords.has(word)) continue;
      freq[word] = (freq[word] || 0) + 1;
    }
  }
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN);
}

function TrendLineChart({ data }) {
  if (!data.length) return null;
  const W = 380, H = 160, pad = { top: 16, right: 16, bottom: 28, left: 36 };
  const pw = W - pad.left - pad.right;
  const ph = H - pad.top - pad.bottom;
  const rates = data.map((d) => d.rate);
  const minR = Math.max(0, Math.min(...rates) - 15);
  const maxR = Math.min(100, Math.max(...rates) + 5);
  const x = (i) => pad.left + (i / Math.max(data.length - 1, 1)) * pw;
  const y = (r) => pad.top + ph - ((r - minR) / (maxR - minR || 1)) * ph;

  const points = data.map((d, i) => `${x(i)},${y(d.rate)}`).join(" ");
  const areaPoints = `${x(0)},${H - pad.bottom} ${points} ${x(data.length - 1)},${H - pad.bottom}`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: W }}>
      {/* Grid lines */}
      {[minR, (minR + maxR) / 2, maxR].map((v) => (
        <g key={v}>
          <line x1={pad.left} y1={y(v)} x2={W - pad.right} y2={y(v)}
            stroke="rgba(200,160,100,0.08)" strokeWidth="0.5" />
          <text x={pad.left - 4} y={y(v) + 4} textAnchor="end"
            fill="rgba(200,160,100,0.3)" fontSize="9">{Math.round(v)}%</text>
        </g>
      ))}
      {/* Area fill */}
      <polygon points={areaPoints} fill="rgba(200,160,100,0.04)" />
      {/* Line */}
      <polyline points={points} fill="none" stroke="#c9a96e" strokeWidth="1.5" />
      {/* Data points */}
      {data.map((d, i) => (
        <circle key={i} cx={x(i)} cy={y(d.rate)} r="2.5" fill="#c9a96e" />
      ))}
      {/* X labels */}
      {data.map((d, i) => (
        <text key={i} x={x(i)} y={H - 6} textAnchor="middle"
          fill="rgba(200,160,100,0.3)" fontSize="8">{d.week}</text>
      ))}
    </svg>
  );
}

function DeckBarChart({ data }) {
  if (!data.length) return null;
  const itemH = 28, gap = 6, padLeft = 70, padRight = 60;
  const W = 380, H = data.length * (itemH + gap) + 16;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: W }}>
      {data.map((d, i) => {
        const barW = Math.max(4, (d.rate / 100) * (W - padLeft - padRight));
        const bwColor = d.rate >= 80 ? "#c9a96e" : d.rate >= 60 ? "#c9a03e" : "#d4786c";
        const yPos = 8 + i * (itemH + gap);
        return (
          <g key={d.name}>
            <text x={padLeft - 6} y={yPos + itemH / 2 + 4} textAnchor="end"
              fill="rgba(220,210,190,0.7)" fontSize="11">{d.name}</text>
            <rect x={padLeft} y={yPos} width={barW} height={itemH} rx="3"
              fill={bwColor} opacity="0.6" />
            <rect x={padLeft} y={yPos} width={barW} height={itemH} rx="3"
              fill="none" stroke={bwColor} strokeWidth="0.5" opacity="0.3" />
            <text x={padLeft + barW + 6} y={yPos + itemH / 2 + 4}
              fill="rgba(200,180,160,0.5)" fontSize="10">
              {d.rate}% ({d.total})
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function CategoryHeatmapGrid({ records }) {
  const { weeks, categories, data } = categoryHeatmap(records);
  if (!weeks.length) return null;

  const maxVal = Math.max(1, ...weeks.map((w) => {
    const weekData = data[w] || {};
    return Math.max(...categories.map((c) => weekData[c] || 0));
  }));

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: `60px repeat(${weeks.length}, 1fr)`, gap: 3 }}>
        <div />
        {weeks.map((w) => (
          <div key={w} style={{ textAlign: "center", fontSize: 9, color: "rgba(200,180,160,0.35)" }}>{w}</div>
        ))}
        {categories.map((cat) => (
          <>
            <div key={cat} style={{ fontSize: 10, color: "rgba(200,180,160,0.5)", display: "flex", alignItems: "center" }}>
              {cat}
            </div>
            {weeks.map((w) => {
              const val = (data[w] && data[w][cat]) || 0;
              const opacity = val === 0 ? 0.02 : 0.12 + (val / maxVal) * 0.7;
              return (
                <div key={`${w}-${cat}`} style={{
                  aspectRatio: "1",
                  background: `rgba(200,160,100,${opacity})`,
                  borderRadius: 3,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 9, color: val > 0 ? "rgba(200,160,100,0.8)" : "transparent",
                }}>
                  {val > 0 ? val : ""}
                </div>
              );
            })}
          </>
        ))}
      </div>
    </div>
  );
}

export default function ReviewDashboard({ onClose, user }) {
  const [records, setRecords] = useState([]);
  const [range, setRange] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const newRecords = getFeedbackRecords();
    const legacy = loadLegacyFeedback();
    const legacyTimestamps = new Set(newRecords.map((r) => r.timestamp));
    const merged = [...newRecords, ...legacy.filter((r) => !legacyTimestamps.has(r.timestamp))];
    merged.sort((a, b) => new Date(b.timestamp || b.createdAt) - new Date(a.timestamp || a.createdAt));
    setRecords(merged);
    setLoading(false);
  }, [user]);

  const filtered = filterByRange(records, range);

  const totalReadings = filtered.length;
  const upCount = filtered.filter((r) => r.rating === "up").length;
  const downCount = filtered.filter((r) => r.rating === "down").length;
  const satisfactionRate = totalReadings > 0 ? Math.round((upCount / totalReadings) * 100) : 0;

  const lowRated = filtered.filter((r) => r.rating === "down");
  const withFeedback = lowRated.filter((r) => r.feedbackText);

  const trendData = weeklyTrend(filtered);
  const deckData = deckPerformance(filtered);
  const insights = generateInsights(filtered);

  const catStats = {};
  filtered.forEach((r) => {
    const cat = categorizeQuestion(r.question);
    if (!catStats[cat]) catStats[cat] = { total: 0, up: 0 };
    catStats[cat].total++;
    if (r.rating === "up") catStats[cat].up++;
  });

  const lowRatedQuestions = lowRated.map((r) => r.question).filter(Boolean);
  const allFeedbackText = withFeedback.map((r) => r.feedbackText);
  const questionKeywords = keywordFreq(lowRatedQuestions);
  const feedbackKeywords = keywordFreq(allFeedbackText);
  const labelMap = Object.fromEntries(QUESTION_CATEGORIES.map((c) => [c.key, c.label]));

  const rangeOptions = [
    { key: "all", label: "全部" },
    { key: "week", label: "本周" },
    { key: "month", label: "本月" },
    { key: "3months", label: "3个月" },
  ];

  return (
    <div className="review-dashboard">
      <div className="review-header">
        <h2>{user ? "数据中心" : "解读反馈面板"}</h2>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {totalReadings > 0 && (
            <div className="range-filter">
              {rangeOptions.map((opt) => (
                <button key={opt.key}
                  className={`range-btn ${range === opt.key ? "active" : ""}`}
                  onClick={() => setRange(opt.key)}>
                  {opt.label}
                </button>
              ))}
            </div>
          )}
          {onClose && (
            <button className="review-close" onClick={onClose}>← 返回</button>
          )}
        </div>
      </div>

      {loading && (
        <div className="review-empty"><p>加载中...</p></div>
      )}

      {!loading && totalReadings === 0 && (
        <div className="review-empty">
          <p>暂无反馈数据</p>
          <p className="review-hint">完成解读后，用户可通过反馈按钮提交评价。登录后数据将跨设备同步。</p>
        </div>
      )}

      {!loading && totalReadings > 0 && (
        <>
          {/* Summary stats */}
          <div className="review-stats">
            <div className="stat-card">
              <div className="stat-num">{totalReadings}</div>
              <div className="stat-label">总解读数</div>
            </div>
            <div className="stat-card">
              <div className="stat-num">{satisfactionRate}%</div>
              <div className="stat-label">满意度</div>
            </div>
            <div className="stat-card">
              <div className="stat-num">{downCount}</div>
              <div className="stat-label">需要改进</div>
            </div>
            <div className="stat-card">
              <div className="stat-num">{withFeedback.length}</div>
              <div className="stat-label">有文字反馈</div>
            </div>
          </div>

          {/* Insights */}
          {insights.length > 0 && (
            <div className="review-section">
              <h3>系统洞察</h3>
              <div className="insights-list">
                {insights.map((ins, i) => (
                  <div key={i} className="insight-item">✦ {ins}</div>
                ))}
              </div>
            </div>
          )}

          {/* Satisfaction trend */}
          {trendData.length >= 2 && (
            <div className="review-section">
              <h3>满意度趋势</h3>
              <TrendLineChart data={trendData} />
            </div>
          )}

          {/* Deck performance */}
          {deckData.length > 0 && (
            <div className="review-section">
              <h3>牌组表现</h3>
              <DeckBarChart data={deckData} />
            </div>
          )}

          {/* Category heatmap */}
          {filtered.length >= 3 && (
            <div className="review-section">
              <h3>问题类型分布</h3>
              <CategoryHeatmapGrid records={filtered} />
            </div>
          )}

          {/* Low-rated readings */}
          {lowRated.length > 0 && (
            <div className="review-section">
              <h3>低评分解读 ({lowRated.length} 条)</h3>
              <div className="low-rated-list">
                {lowRated.slice(0, 20).map((r, i) => (
                  <div key={i} className="low-rated-item">
                    <div className="lr-meta">
                      {r.deckName} · {r.spreadName} · {(r.timestamp || r.created_at || "").slice(0, 10)}
                    </div>
                    {r.question && <div className="lr-question">Q: {r.question}</div>}
                    <div className="lr-interp">
                      {(r.interpretationText || "").slice(0, 150)}{(r.interpretationText || "").length > 150 ? "..." : ""}
                    </div>
                    {r.feedbackText && (
                      <div className="lr-feedback">反馈: {r.feedbackText}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Category performance table (keep as backup) */}
          {Object.keys(catStats).length > 0 && (
            <div className="review-section">
              <h3>问题类型满意度</h3>
              <div className="review-table">
                {Object.entries(catStats)
                  .sort((a, b) => b[1].total - a[1].total)
                  .map(([cat, stats]) => {
                    const rate = stats.total > 0 ? Math.round((stats.up / stats.total) * 100) : 0;
                    return (
                      <div key={cat} className="review-row">
                        <span className="review-row-name">{labelMap[cat] || cat}</span>
                        <span className="review-row-count">{stats.total} 次</span>
                        <span className={`review-row-rate ${rate < 70 ? "low" : ""}`}>{rate}%</span>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Keyword analysis */}
          {questionKeywords.length > 0 && (
            <div className="review-section">
              <h3>低分问题高频词</h3>
              <div className="keyword-tags">
                {questionKeywords.map(([word, count]) => (
                  <span key={word} className="keyword-tag" style={{ opacity: 0.4 + count / questionKeywords[0][1] * 0.6 }}>
                    {word} ({count})
                  </span>
                ))}
              </div>
            </div>
          )}

          {feedbackKeywords.length > 0 && (
            <div className="review-section">
              <h3>用户反馈高频词</h3>
              <div className="keyword-tags">
                {feedbackKeywords.map(([word, count]) => (
                  <span key={word} className="keyword-tag" style={{ opacity: 0.4 + count / feedbackKeywords[0][1] * 0.6 }}>
                    {word} ({count})
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Export */}
      {totalReadings > 0 && (
        <div className="review-export">
          <button className="export-btn" onClick={() => exportJSON(records)}>
            导出反馈数据 (JSON)
          </button>
          <p className="export-hint">
            导出后用 python scripts/analyze-feedback.py 做深度分析
          </p>
        </div>
      )}

      <style>{`
        .review-dashboard {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          color: #e6e1d8;
        }
        .review-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 28px;
          flex-wrap: wrap;
          gap: 12px;
        }
        .review-header h2 {
          font-family: 'Georgia', serif;
          font-size: 24px;
          color: #e8dcc8;
          margin: 0;
          font-weight: 400;
        }
        .range-filter {
          display: flex;
          gap: 4px;
          background: rgba(200,160,100,0.04);
          border: 1px solid rgba(200,160,100,0.1);
          border-radius: 6px;
          padding: 2px;
        }
        .range-btn {
          padding: 4px 10px;
          border: none;
          border-radius: 4px;
          background: transparent;
          color: rgba(200,180,160,0.5);
          font-size: 12px;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.15s;
        }
        .range-btn.active {
          background: rgba(200,160,100,0.12);
          color: #c9a96e;
        }
        .range-btn:hover:not(.active) {
          color: rgba(200,180,160,0.8);
        }
        .review-close {
          padding: 6px 16px;
          border: 1px solid rgba(200,160,100,0.3);
          border-radius: 6px;
          background: transparent;
          color: rgba(200,160,100,0.7);
          font-size: 13px;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.2s;
        }
        .review-close:hover {
          border-color: #c9a96e;
          color: #c9a96e;
        }

        .review-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-bottom: 32px;
        }
        .stat-card {
          text-align: center;
          padding: 20px 12px;
          background: rgba(200,160,100,0.04);
          border: 1px solid rgba(200,160,100,0.12);
          border-radius: 12px;
        }
        .stat-num {
          font-size: 28px;
          font-family: 'Georgia', serif;
          color: #c9a96e;
        }
        .stat-label {
          font-size: 12px;
          color: rgba(200,180,160,0.5);
          margin-top: 4px;
        }

        .review-empty {
          text-align: center;
          padding: 60px 20px;
          color: rgba(200,180,160,0.4);
        }
        .review-empty p { margin: 0 0 8px; font-size: 15px; }
        .review-hint { font-size: 13px; opacity: 0.6; }

        .review-section {
          margin-bottom: 28px;
        }
        .review-section h3 {
          font-family: 'Georgia', serif;
          font-size: 17px;
          color: #c9a96e;
          margin: 0 0 14px;
          font-weight: 400;
        }

        .insights-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .insight-item {
          padding: 10px 14px;
          background: rgba(200,160,100,0.04);
          border: 1px solid rgba(200,160,100,0.1);
          border-radius: 8px;
          font-size: 13px;
          color: rgba(220,210,190,0.75);
          line-height: 1.6;
        }

        .review-table {
          background: rgba(200,160,100,0.03);
          border: 1px solid rgba(200,160,100,0.1);
          border-radius: 10px;
          overflow: hidden;
        }
        .review-row {
          display: flex;
          align-items: center;
          padding: 10px 16px;
          border-bottom: 1px solid rgba(200,160,100,0.06);
        }
        .review-row:last-child { border-bottom: none; }
        .review-row-name { flex: 1; font-size: 14px; color: #e8dcc8; }
        .review-row-count { font-size: 12px; color: rgba(200,180,160,0.5); margin-right: 16px; }
        .review-row-rate {
          font-size: 14px; font-family: 'Georgia', serif;
          color: #c9a96e; min-width: 40px; text-align: right;
        }
        .review-row-rate.low { color: #d4786c; }

        .low-rated-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .low-rated-item {
          padding: 12px 16px;
          background: rgba(200,100,80,0.04);
          border: 1px solid rgba(200,100,80,0.12);
          border-radius: 10px;
        }
        .lr-meta { font-size: 11px; color: rgba(200,180,160,0.4); margin-bottom: 4px; }
        .lr-question { font-size: 14px; color: #e8dcc8; margin-bottom: 4px; }
        .lr-interp { font-size: 12px; color: rgba(200,180,160,0.55); line-height: 1.6; margin-bottom: 4px; }
        .lr-feedback { font-size: 12px; color: #d4a080; font-style: italic; }

        .keyword-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .keyword-tag {
          padding: 4px 12px;
          border-radius: 20px;
          background: rgba(200,160,100,0.08);
          border: 1px solid rgba(200,160,100,0.15);
          color: #c9a96e;
          font-size: 12px;
        }

        .review-export {
          margin-top: 32px;
          text-align: center;
          padding: 24px;
          border-top: 1px solid rgba(200,160,100,0.1);
        }
        .export-btn {
          padding: 12px 32px;
          border: 1px solid #c9a96e;
          border-radius: 8px;
          background: transparent;
          color: #c9a96e;
          font-size: 15px;
          cursor: pointer;
          font-family: 'Georgia', serif;
          letter-spacing: 0.06em;
          transition: all 0.2s;
        }
        .export-btn:hover { background: #c9a96e; color: #0a0a14; }
        .export-hint { color: rgba(200,180,160,0.3); font-size: 12px; margin-top: 8px; }

        @media (max-width: 500px) {
          .review-stats { grid-template-columns: repeat(2, 1fr); }
          .range-filter { font-size: 11px; }
        }
      `}</style>
    </div>
  );
}
