import { useState, useEffect } from "react";

const STORAGE_KEY = "tarot_feedback_records";

function loadRecords() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

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

export default function ReviewDashboard({ onClose }) {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    setRecords(loadRecords());
  }, []);

  const totalReadings = records.length;
  const upCount = records.filter((r) => r.rating === "up").length;
  const downCount = records.filter((r) => r.rating === "down").length;
  const satisfactionRate = totalReadings > 0 ? Math.round((upCount / totalReadings) * 100) : 0;

  const lowRated = records.filter((r) => r.rating === "down");
  const withFeedback = lowRated.filter((r) => r.feedbackText);

  // Per-deck analysis
  const deckStats = {};
  records.forEach((r) => {
    if (!r.deckName) return;
    if (!deckStats[r.deckName]) deckStats[r.deckName] = { total: 0, up: 0 };
    deckStats[r.deckName].total++;
    if (r.rating === "up") deckStats[r.deckName].up++;
  });

  // Category analysis
  const catStats = {};
  records.forEach((r) => {
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

  return (
    <div className="review-dashboard">
      <div className="review-header">
        <h2>解读反馈面板</h2>
        <button className="review-close" onClick={onClose}>← 返回塔罗</button>
      </div>

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

      {totalReadings === 0 ? (
        <div className="review-empty">
          <p>暂无反馈数据</p>
          <p className="review-hint">完成解读后，用户可通过反馈按钮提交评价。数据存储在浏览器本地。</p>
        </div>
      ) : (
        <>
          {/* Deck performance */}
          <div className="review-section">
            <h3>牌组满意度</h3>
            <div className="review-table">
              {Object.entries(deckStats)
                .sort((a, b) => b[1].total - a[1].total)
                .map(([name, stats]) => {
                  const rate = stats.total > 0 ? Math.round((stats.up / stats.total) * 100) : 0;
                  return (
                    <div key={name} className="review-row">
                      <span className="review-row-name">{name}</span>
                      <span className="review-row-count">{stats.total} 次</span>
                      <span className={`review-row-rate ${rate < 70 ? "low" : ""}`}>{rate}%</span>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Category performance */}
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

          {/* Low-rated readings */}
          {lowRated.length > 0 && (
            <div className="review-section">
              <h3>低评分解读 ({lowRated.length} 条)</h3>
              <div className="low-rated-list">
                {lowRated.slice(0, 20).map((r, i) => (
                  <div key={i} className="low-rated-item">
                    <div className="lr-meta">
                      {r.deckName} · {r.spreadName} · {r.timestamp?.slice(0, 10)}
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

          {/* Keyword analysis */}
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
            导出后用 python scripts/analyze-feedback.py 文件名.json 进行深度分析
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
        }
        .review-header h2 {
          font-family: 'Georgia', serif;
          font-size: 24px;
          color: #e8dcc8;
          margin: 0;
          font-weight: 400;
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
          margin: 0 0 12px;
          font-weight: 400;
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
        }
      `}</style>
    </div>
  );
}
