import { useState, useEffect, useRef } from "react";
import Card from "./Card";

function buildPrompt(question, spread, placements, deckMeta) {
  const cardsInfo = spread.positions
    .map((pos) => {
      const card = placements[pos.id];
      if (!card) return null;
      const orientation = card.isReversed ? "逆位" : "正位";
      const meaning = card.isReversed ? card.reversedMeaning : card.uprightMeaning;
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

const loadingMessages = [
  "塔罗正在解读你的牌面...",
  "感受牌中能量的流动...",
  "连接你的问题与牌面象征...",
  "解读画面中的隐藏讯息...",
  "编织命运的完整叙事...",
  "倾听古老智慧的指引...",
  "即将揭示属于你的答案...",
];

export default function Interpretation({ question, spread, placements, deckMeta, filterClass }) {
  const [apiResult, setApiResult] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const msgIntervalRef = useRef(null);

  const placedCards = spread.positions.map((pos) => placements[pos.id]).filter(Boolean);
  const reversedCount = placedCards.filter((c) => c.isReversed).length;
  const uprightCount = placedCards.length - reversedCount;
  const majorCount = placedCards.filter((c) => c.arcana === "major").length;

  useEffect(() => {
    let cancelled = false;

    async function fetchInterpretation() {
      setIsLoading(true);
      setError(null);
      setLoadingMsgIdx(0);

      // Cycle loading messages
      msgIntervalRef.current = setInterval(() => {
        setLoadingMsgIdx((prev) => (prev + 1) % loadingMessages.length);
      }, 1800);

      try {
        const systemPrompt = deckMeta?.interpretationPersona
          || "你是一位经验丰富的塔罗解读师，请基于提供的牌面信息进行深度解读。";

        const userMessage = buildPrompt(question, spread, placements, deckMeta);

        const res = await fetch("/api/interpret", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ systemPrompt, userMessage }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `请求失败 (${res.status})`);
        }

        // Read SSE stream
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let fullText = "";
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") continue;
              try {
                const parsed = JSON.parse(data);
                if (parsed.text) {
                  fullText += parsed.text;
                  if (!cancelled) {
                    setApiResult(fullText);
                    setIsLoading(false);
                  }
                }
              } catch {
                // Skip non-JSON
              }
            }
          }
        }
      } catch (err) {
        if (cancelled) return;
        console.error("Interpretation fetch error:", err);
        setError(err.message);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
          clearInterval(msgIntervalRef.current);
        }
      }
    }

    fetchInterpretation();
    return () => {
      cancelled = true;
      if (msgIntervalRef.current) clearInterval(msgIntervalRef.current);
    };
  }, [question, spread, placements, deckMeta]);

  // Split the API result into sections for rendering
  function renderContent() {
    if (isLoading) {
      return (
        <div className="loading-container">
          <div className="loading-spinner">
            <div className="spinner-ring" />
            <div className="spinner-ring-2" />
            <div className="spinner-ring-3" />
          </div>
          <p className="loading-text">{loadingMessages[loadingMsgIdx]}</p>
          <p className="loading-sub">请耐心等待 · 深度解读需要一些时间</p>
          <div className="loading-dots">
            {[0, 1, 2].map((i) => (
              <span key={i} className="loading-dot" style={{ animationDelay: `${i * 0.2}s` }} />
            ))}
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="error-container">
          <p className="error-icon">⚠</p>
          <p className="error-title">解读暂时无法生成</p>
          <p className="error-detail">{error}</p>
          <p className="error-hint">请确保已设置 ANTHROPIC_API_KEY 环境变量，然后重启开发服务器</p>
        </div>
      );
    }

    if (apiResult) {
      // Parse markdown sections — each "###" starts a card section
      return (
        <div className="api-result">
          {apiResult.split("\n").map((line, i) => {
            if (line.startsWith("### ")) {
              return <h3 key={i} className="result-card-title">{line.replace("### ", "")}</h3>;
            }
            if (line.startsWith("## ")) {
              return <h2 key={i} className="result-section-title">{line.replace("## ", "")}</h2>;
            }
            if (line.startsWith("**") && line.includes("**")) {
              return <h4 key={i} className="result-subtitle">{line.replace(/\*\*/g, "")}</h4>;
            }
            if (line.trim() === "") return <br key={i} />;
            return <p key={i} className="result-para">{line}</p>;
          })}
        </div>
      );
    }

    return null;
  }

  return (
    <div className="interpretation-page">
      <h2 className="interp-title">{spread.name} · 深度解读</h2>

      {question && (
        <div className="question-recall">
          <span className="question-label">你的问题</span>
          <span className="question-text">"{question}"</span>
        </div>
      )}

      <div className="interp-overview">
        <p className="interp-desc">{spread.description}</p>
        <p className="interp-style">
          {deckMeta?.name} · {deckMeta?.interpretationStyle}
        </p>
      </div>

      <div className="interp-stats">
        <span>共 {placedCards.length} 张牌</span>
        <span className="stat-divider">|</span>
        <span>大阿卡纳 {majorCount} 张</span>
        <span className="stat-divider">|</span>
        <span>正位 {uprightCount} · 逆位 {reversedCount}</span>
      </div>

      {/* Card visual grid */}
      <div className="interp-visual-grid">
        {spread.positions.map((pos) => {
          const card = placements[pos.id];
          if (!card) return null;
          return (
            <div key={pos.id} className="interp-card-visual-item">
              <Card
                card={card}
                deckMeta={deckMeta}
                size="medium"
                flipped={true}
                isReversed={card.isReversed}
                filterClass={filterClass}
              />
              <div className="interp-visual-label">
                <span className="visual-pos-name">{pos.name}</span>
                <span className="visual-card-name">{card.nameZh}</span>
                {card.isReversed && <span className="visual-reversed">逆位</span>}
              </div>
            </div>
          );
        })}
      </div>

      {/* AI Interpretation content */}
      {renderContent()}

      {/* Closing */}
      {apiResult && (
        <div className="encouragement-closing">
          <p>以上解读由塔罗与 AI 共同完成。牌面是一面镜子，照见的是你内心本已具足的智慧。</p>
          <p>最好的预言，是你自己的行动。</p>
          <p className="closing-bless">✦ 祝福你，前路光明 ✦</p>
        </div>
      )}

      <style>{`
        .interpretation-page {
          max-width: 900px;
          margin: 0 auto;
          padding: 20px 20px 40px;
        }
        .interp-title {
          font-family: 'Georgia', serif;
          font-size: 26px;
          color: #e8dcc8;
          text-align: center;
          margin: 0 0 14px;
          font-weight: 400;
        }
        .question-recall {
          text-align: center;
          margin-bottom: 20px;
        }
        .question-label {
          display: block;
          font-size: 11px;
          color: rgba(200,160,100,0.5);
          letter-spacing: 0.2em;
          text-transform: uppercase;
          margin-bottom: 4px;
        }
        .question-text {
          font-size: 18px;
          color: #c9a96e;
          font-style: italic;
        }
        .interp-overview {
          text-align: center;
          margin-bottom: 20px;
        }
        .interp-desc {
          color: rgba(200,180,160,0.75);
          font-size: 14px;
          margin: 0 0 6px;
        }
        .interp-style {
          color: rgba(200,180,160,0.35);
          font-size: 11px;
          letter-spacing: 0.1em;
          margin: 0;
        }
        .interp-stats {
          text-align: center;
          color: rgba(200,180,160,0.4);
          font-size: 12px;
          margin-bottom: 28px;
        }
        .stat-divider {
          margin: 0 10px;
          opacity: 0.4;
        }

        /* Card visual grid */
        .interp-visual-grid {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 24px;
          margin-bottom: 32px;
        }
        .interp-card-visual-item {
          text-align: center;
        }
        .interp-visual-label {
          margin-top: 10px;
        }
        .visual-pos-name {
          display: block;
          font-size: 13px;
          color: #c9a96e;
          font-weight: 500;
        }
        .visual-card-name {
          display: block;
          font-size: 12px;
          color: rgba(200,180,160,0.6);
        }
        .visual-reversed {
          display: inline-block;
          margin-top: 2px;
          padding: 1px 6px;
          border-radius: 4px;
          background: #6b3420;
          color: #e8dcc8;
          font-size: 10px;
        }

        /* Loading */
        .loading-container {
          text-align: center;
          padding: 56px 20px;
        }
        .loading-spinner {
          position: relative;
          width: 64px;
          height: 64px;
          margin: 0 auto 28px;
        }
        .spinner-ring {
          position: absolute;
          inset: 0;
          border: 2px solid rgba(200,160,100,0.15);
          border-top-color: #c9a96e;
          border-radius: 50%;
          animation: spin 1.4s linear infinite;
        }
        .spinner-ring-2 {
          position: absolute;
          inset: 8px;
          border: 2px solid rgba(180,140,200,0.12);
          border-bottom-color: rgba(180,140,200,0.7);
          border-radius: 50%;
          animation: spin 2s linear infinite reverse;
        }
        .spinner-ring-3 {
          position: absolute;
          inset: 16px;
          border: 2px solid rgba(200,170,100,0.1);
          border-left-color: rgba(200,170,100,0.6);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .loading-text {
          color: #c9a96e;
          font-size: 16px;
          letter-spacing: 0.05em;
          margin: 0 0 6px;
          transition: opacity 0.5s;
        }
        .loading-sub {
          color: rgba(200,180,160,0.3);
          font-size: 13px;
          margin: 0 0 16px;
        }
        .loading-dots {
          display: flex;
          gap: 8px;
          justify-content: center;
        }
        .loading-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: rgba(200,160,100,0.5);
          animation: dotPulse 1.2s ease-in-out infinite;
        }
        @keyframes dotPulse {
          0%, 100% { opacity: 0.2; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.3); }
        }

        /* Error */
        .error-container {
          text-align: center;
          padding: 40px 20px;
          background: rgba(200,100,80,0.05);
          border: 1px solid rgba(200,100,80,0.15);
          border-radius: 14px;
          margin-top: 20px;
        }
        .error-icon {
          font-size: 32px;
          margin: 0 0 12px;
        }
        .error-title {
          color: #d4a080;
          font-size: 18px;
          margin: 0 0 8px;
        }
        .error-detail {
          color: rgba(200,150,130,0.7);
          font-size: 14px;
          margin: 0 0 16px;
          font-family: monospace;
        }
        .error-hint {
          color: rgba(200,180,160,0.4);
          font-size: 13px;
          margin: 0;
        }

        /* API result markdown rendering */
        .api-result {
          padding: 24px 28px;
          background: linear-gradient(135deg, rgba(200,160,100,0.04), rgba(180,140,200,0.03));
          border: 1px solid rgba(200,160,100,0.12);
          border-radius: 14px;
          margin-top: 20px;
        }
        .result-section-title {
          font-family: 'Georgia', serif;
          font-size: 20px;
          color: #c9a96e;
          text-align: center;
          margin: 0 0 16px;
          font-weight: 400;
          letter-spacing: 0.08em;
        }
        .result-card-title {
          font-size: 16px;
          color: #c9a96e;
          margin: 20px 0 8px;
          padding-top: 16px;
          border-top: 1px solid rgba(200,160,100,0.1);
        }
        .result-subtitle {
          font-size: 14px;
          color: rgba(200,180,160,0.8);
          margin: 12px 0 4px;
          font-weight: 600;
        }
        .result-para {
          font-size: 14px;
          color: rgba(220,210,190,0.82);
          line-height: 2;
          margin: 0 0 6px;
        }

        /* Closing */
        .encouragement-closing {
          margin-top: 32px;
          padding: 24px;
          text-align: center;
          border-top: 1px solid rgba(200,160,100,0.1);
        }
        .encouragement-closing p {
          color: rgba(200,180,160,0.55);
          font-size: 14px;
          line-height: 2;
          margin: 0 0 4px;
        }
        .closing-bless {
          margin-top: 8px;
          font-size: 17px;
          color: #c9a96e;
          letter-spacing: 0.1em;
          font-family: 'Georgia', serif;
        }

        @media (max-width: 500px) {
          .interp-visual-grid {
            gap: 16px;
          }
          .api-result {
            padding: 16px 18px;
          }
        }
      `}</style>
    </div>
  );
}
