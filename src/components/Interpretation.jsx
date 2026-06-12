import { useState, useEffect, useRef } from "react";
import { useLang } from "../contexts/LangContext";
import { zh, en } from "../i18n/translations";
import Card from "./Card";
import FeedbackSection from "./FeedbackSection";
import FollowUpSection from "./FollowUpSection";

// 结构化区域配置：emoji 标识 → 区块样式
const SECTION_CONFIG = [
  { emoji: "🔮", id: "overview", labelZh: "能量全景", labelEn: "Energy Overview", icon: "🔮", className: "section-overview" },
  { emoji: "📜", id: "cards", labelZh: "牌面深解", labelEn: "Card Deep Dive", icon: "📜", className: "section-cards" },
  { emoji: "🔗", id: "interactions", labelZh: "牌际呼应", labelEn: "Card Interactions", icon: "🔗", className: "section-interactions" },
  { emoji: "🧭", id: "advice", labelZh: "行动指引", labelEn: "Action Guidance", icon: "🧭", className: "section-advice" },
  { emoji: "✨", id: "message", labelZh: "此刻的讯息", labelEn: "Message for Now", icon: "✨", className: "section-message" },
];

function splitSections(text) {
  const sections = [];
  const lines = text.split("\n");
  let currentSection = null;
  let currentContent = [];

  for (const line of lines) {
    const headerMatch = line.match(/^##\s+(🔮|📜|🔗|🧭|✨)\s*(.+)/);
    if (headerMatch) {
      if (currentSection) {
        sections.push({ ...currentSection, content: currentContent.join("\n").trim() });
      }
      const config = SECTION_CONFIG.find((s) => s.emoji === headerMatch[1]);
      currentSection = {
        emoji: headerMatch[1],
        title: headerMatch[2],
        config: config || null,
      };
      currentContent = [line];
    } else if (currentSection) {
      currentContent.push(line);
    } else {
      // 第一个 section 之前的内容
      if (!sections.find((s) => s.emoji === "preamble")) {
        currentContent.push(line);
      }
    }
  }

  if (currentSection) {
    sections.push({ ...currentSection, content: currentContent.join("\n").trim() });
  }

  return sections;
}

function renderMarkdown(text) {
  return text.split("\n").map((line, i) => {
    // 跳过 section 标题（会在区块头部单独渲染）
    if (line.match(/^##\s+(🔮|📜|🔗|🧭|✨)/)) {
      return null;
    }
    // 子标题 ###
    if (line.match(/^###\s/)) {
      return <h4 key={i} className="result-subtitle">{line.replace(/^###\s/, "")}</h4>;
    }
    // 加粗行
    if (line.match(/^\*\*.*\*\*$/)) {
      return <p key={i} className="result-bold">{line.replace(/\*\*/g, "")}</p>;
    }
    // 分隔线
    if (line.trim() === "---") {
      return <hr key={i} className="result-divider" />;
    }
    // 行动建议条目
    if (line.trim().startsWith("▸")) {
      return <div key={i} className="result-action-item">{line.trim()}</div>;
    }
    // 空行
    if (line.trim() === "") {
      return <br key={i} />;
    }
    // 普通段落
    return <p key={i} className="result-para">{line}</p>;
  });
}

export default function Interpretation({ question, spread, placements, deckMeta, filterClass, prefetchedText, isPrefetching, prefetchError, onNeedFetch, followUpHistory, onUpdateFollowUpHistory, user }) {
  const { lang } = useLang();
  const t = lang === "zh" ? zh : en;
  const loadingMessages = t.loadingMessages;
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const msgIntervalRef = useRef(null);
  const hasRequested = useRef(false);

  const placedCards = spread.positions.map((pos) => placements[pos.id]).filter(Boolean);

  useEffect(() => {
    if (prefetchedText || isPrefetching || hasRequested.current) return;
    hasRequested.current = true;
    onNeedFetch?.();
  }, [prefetchedText, isPrefetching, onNeedFetch]);

  useEffect(() => {
    if (!isPrefetching) {
      clearInterval(msgIntervalRef.current);
      return;
    }
    msgIntervalRef.current = setInterval(() => {
      setLoadingMsgIdx((prev) => (prev + 1) % loadingMessages.length);
    }, 1800);
    return () => clearInterval(msgIntervalRef.current);
  }, [isPrefetching]);

  function renderContent() {
    if (prefetchedText) {
      const isStreaming = isPrefetching;
      const sections = splitSections(prefetchedText);

      // 如果有结构化区域，用新渲染；否则兼容旧格式
      if (sections.length >= 2) {
        return (
          <div className={`api-result structured${isStreaming ? " streaming" : ""}`}>
            {isStreaming && (
              <div className="streaming-indicator">
                <span className="streaming-dot" />
                {t.generating}
              </div>
            )}
            {sections.map((section, si) => {
              const cfg = section.config;
              return (
                <div key={si} className={`structured-section ${cfg?.className || ""}`}>
                  <div className="section-header">
                    <span className="section-emoji">{section.emoji}</span>
                    <h3 className="section-title">{section.title}</h3>
                  </div>
                  <div className="section-body">
                    {renderMarkdown(section.content)}
                  </div>
                </div>
              );
            })}
          </div>
        );
      }

      // 兼容旧格式：简单 markdown 渲染
      return (
        <div className={`api-result${isStreaming ? " streaming" : ""}`}>
          {isStreaming && (
            <div className="streaming-indicator">
              <span className="streaming-dot" />
              {t.generating}
            </div>
          )}
          {prefetchedText.split("\n").map((line, i) => {
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

    if (prefetchError) {
      return (
        <div className="error-container">
          <p className="error-icon">⚠</p>
          <p className="error-title">{t.errorTitle}</p>
          <p className="error-detail">{prefetchError}</p>
          <p className="error-hint">{t.errorHint}</p>
        </div>
      );
    }

    if (isPrefetching) {
      return (
        <div className="loading-container">
          <div className="loading-spinner">
            <div className="spinner-ring" />
            <div className="spinner-ring-2" />
            <div className="spinner-ring-3" />
          </div>
          <p className="loading-text">{loadingMessages[loadingMsgIdx]}</p>
          <p className="loading-sub">{t.loadingSub}</p>
          <div className="loading-dots">
            {[0, 1, 2].map((i) => (
              <span key={i} className="loading-dot" style={{ animationDelay: `${i * 0.2}s` }} />
            ))}
          </div>
        </div>
      );
    }

    return null;
  }

  return (
    <div className="interpretation-page">
      <h2 className="interp-title">{t.interpTitle(spread.name)}</h2>

      {question && (
        <div className="question-recall">
          <span className="question-label">{t.yourQuestion}</span>
          <span className="question-text">"{question}"</span>
        </div>
      )}

      <div className="interp-overview">
        <p className="interp-desc">{spread.description}</p>
        <p className="interp-style">
          {deckMeta?.name} · {deckMeta?.interpretationStyle}
        </p>
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
                {card.isReversed && <span className="visual-reversed">{t.reversedShort}</span>}
              </div>
            </div>
          );
        })}
      </div>

      {/* AI Interpretation content */}
      {renderContent()}

      {/* Closing */}
      {prefetchedText && (
        <div className="encouragement-closing">
          <p>{t.closing1}</p>
          <p>{t.closing2}</p>
          <p className="closing-bless">{t.closingBless}</p>
        </div>
      )}

      {prefetchedText && !isPrefetching && (
        <FollowUpSection
          question={question}
          spread={spread}
          placements={placements}
          deckMeta={deckMeta}
          originalInterpretation={prefetchedText}
          followUpHistory={followUpHistory || []}
          onUpdateHistory={onUpdateFollowUpHistory || (() => {})}
        />
      )}

      {prefetchedText && (
        <FeedbackSection
          deckMeta={deckMeta}
          spread={spread}
          placements={placements}
          question={question}
          interpretationText={prefetchedText}
          user={user}
        />
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

        /* Card visual grid */
        .interp-visual-grid {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 24px;
          margin-bottom: 32px;
        }
        .interp-card-visual-item { text-align: center; }
        .interp-visual-label { margin-top: 10px; }
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
        .loading-container { text-align: center; padding: 56px 20px; }
        .loading-spinner { position: relative; width: 64px; height: 64px; margin: 0 auto 28px; }
        .spinner-ring {
          position: absolute; inset: 0;
          border: 2px solid rgba(200,160,100,0.15);
          border-top-color: #c9a96e;
          border-radius: 50%;
          animation: spin 1.4s linear infinite;
        }
        .spinner-ring-2 {
          position: absolute; inset: 8px;
          border: 2px solid rgba(180,140,200,0.12);
          border-bottom-color: rgba(180,140,200,0.7);
          border-radius: 50%;
          animation: spin 2s linear infinite reverse;
        }
        .spinner-ring-3 {
          position: absolute; inset: 16px;
          border: 2px solid rgba(200,170,100,0.1);
          border-left-color: rgba(200,170,100,0.6);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .loading-text {
          color: #c9a96e; font-size: 16px;
          letter-spacing: 0.05em; margin: 0 0 6px;
          transition: opacity 0.5s;
        }
        .loading-sub { color: rgba(200,180,160,0.3); font-size: 13px; margin: 0 0 16px; }
        .loading-dots { display: flex; gap: 8px; justify-content: center; }
        .loading-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: rgba(200,160,100,0.5);
          animation: dotPulse 1.2s ease-in-out infinite;
        }
        @keyframes dotPulse {
          0%, 100% { opacity: 0.2; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.3); }
        }

        /* Error */
        .error-container {
          text-align: center; padding: 40px 20px;
          background: rgba(200,100,80,0.05);
          border: 1px solid rgba(200,100,80,0.15);
          border-radius: 14px; margin-top: 20px;
        }
        .error-icon { font-size: 32px; margin: 0 0 12px; }
        .error-title { color: #d4a080; font-size: 18px; margin: 0 0 8px; }
        .error-detail { color: rgba(200,150,130,0.7); font-size: 14px; margin: 0 0 16px; font-family: monospace; }
        .error-hint { color: rgba(200,180,160,0.4); font-size: 13px; margin: 0; }

        /* API result */
        .api-result {
          padding: 24px 28px;
          background: linear-gradient(135deg, rgba(200,160,100,0.04), rgba(180,140,200,0.03));
          border: 1px solid rgba(200,160,100,0.12);
          border-radius: 14px;
          margin-top: 20px;
        }
        .api-result.streaming {
          border-color: rgba(200,160,100,0.25);
          box-shadow: 0 0 20px rgba(200,160,100,0.05);
        }
        .streaming-indicator {
          display: flex; align-items: center; gap: 8px;
          margin-bottom: 16px; padding-bottom: 12px;
          border-bottom: 1px solid rgba(200,160,100,0.08);
          color: rgba(200,160,100,0.45); font-size: 12px;
        }
        .streaming-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #c9a96e;
          animation: streamPulse 0.8s ease-in-out infinite;
        }
        @keyframes streamPulse {
          0%, 100% { opacity: 0.3; } 50% { opacity: 1; }
        }

        /* Structured sections */
        .structured-section {
          margin-bottom: 28px;
          padding-bottom: 24px;
          border-bottom: 1px solid rgba(200,160,100,0.08);
        }
        .structured-section:last-child {
          margin-bottom: 0;
          padding-bottom: 0;
          border-bottom: none;
        }
        .section-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 14px;
        }
        .section-emoji {
          font-size: 24px;
        }
        .section-title {
          font-family: 'Georgia', serif;
          font-size: 20px;
          color: #c9a96e;
          margin: 0;
          font-weight: 400;
          letter-spacing: 0.06em;
        }

        /* Per-section accent colors */
        .section-overview .section-title { color: #d4c098; }
        .section-cards .section-title { color: #c9a0d0; }
        .section-interactions .section-title { color: #a0c8d0; }
        .section-advice .section-title { color: #c0d0a0; }
        .section-message {
          background: linear-gradient(135deg, rgba(200,160,100,0.08), rgba(200,160,100,0.02));
          border: 1px solid rgba(200,160,100,0.15);
          border-radius: 12px;
          padding: 20px 24px;
          border-bottom: none;
        }
        .section-message .section-title { color: #e8c86e; }

        .section-body {
          padding-left: 34px;
        }

        .result-section-title {
          font-family: 'Georgia', serif;
          font-size: 20px; color: #c9a96e;
          text-align: center; margin: 0 0 16px;
          font-weight: 400; letter-spacing: 0.08em;
        }
        .result-card-title {
          font-size: 16px; color: #c9a96e;
          margin: 20px 0 8px; padding-top: 16px;
          border-top: 1px solid rgba(200,160,100,0.1);
        }
        .result-subtitle {
          font-size: 14px; color: rgba(200,180,160,0.85);
          margin: 14px 0 6px; font-weight: 600;
        }
        .result-bold {
          font-size: 14px; color: rgba(210,190,170,0.9);
          font-weight: 500; margin: 8px 0 4px;
        }
        .result-para {
          font-size: 14px; color: rgba(220,210,190,0.82);
          line-height: 2; margin: 0 0 6px;
        }
        .result-action-item {
          font-size: 14px; color: rgba(210,200,170,0.88);
          line-height: 1.9;
          padding: 6px 0 6px 8px;
          margin: 2px 0;
          border-left: 2px solid rgba(200,160,100,0.2);
        }
        .result-divider {
          border: none;
          border-top: 1px solid rgba(200,160,100,0.08);
          margin: 12px 0;
        }

        /* Encouragement closing */
        .encouragement-closing {
          margin-top: 32px; padding: 24px;
          text-align: center;
          border-top: 1px solid rgba(200,160,100,0.1);
        }
        .encouragement-closing p {
          color: rgba(200,180,160,0.55); font-size: 14px;
          line-height: 2; margin: 0 0 4px;
        }
        .closing-bless {
          margin-top: 8px; font-size: 17px;
          color: #c9a96e; letter-spacing: 0.1em;
          font-family: 'Georgia', serif;
        }

        @media (max-width: 500px) {
          .interp-visual-grid { gap: 16px; }
          .api-result { padding: 16px 18px; }
          .section-body { padding-left: 0; }
          .section-header { gap: 6px; }
          .section-emoji { font-size: 20px; }
          .section-title { font-size: 17px; }
        }
      `}</style>
    </div>
  );
}
