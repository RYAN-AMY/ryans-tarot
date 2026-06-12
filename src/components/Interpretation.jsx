import { useState, useEffect, useRef } from "react";
import { useLang } from "../contexts/LangContext";
import { zh, en } from "../i18n/translations";
import Card from "./Card";
import FeedbackSection from "./FeedbackSection";
import FollowUpSection from "./FollowUpSection";

function renderText(text) {
  return text.split("\n").map((line, i) => {
    if (line.match(/^###\s/)) {
      return <h4 key={i} className="r-subtitle">{line.replace(/^###\s/, "")}</h4>;
    }
    if (line.match(/^##\s/)) {
      return <h3 key={i} className="r-card-title">{line.replace(/^##\s/, "")}</h3>;
    }
    if (line.match(/^\*\*.*\*\*$/)) {
      return <p key={i} className="r-bold">{line.replace(/\*\*/g, "")}</p>;
    }
    if (line.trim() === "---") {
      return <hr key={i} className="r-divider" />;
    }
    if (line.trim() === "") return <br key={i} />;
    return <p key={i} className="r-para">{line}</p>;
  });
}

export default function Interpretation({ question, spread, placements, deckMeta, filterClass, prefetchedText, isPrefetching, prefetchError, onNeedFetch, followUpHistory, onUpdateFollowUpHistory, user }) {
  const { lang } = useLang();
  const t = lang === "zh" ? zh : en;
  const loadingMessages = t.loadingMessages;
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const msgIntervalRef = useRef(null);
  const hasRequested = useRef(false);

  useEffect(() => {
    if (prefetchedText || isPrefetching || hasRequested.current) return;
    hasRequested.current = true;
    onNeedFetch?.();
  }, [prefetchedText, isPrefetching, onNeedFetch]);

  useEffect(() => {
    if (!isPrefetching) { clearInterval(msgIntervalRef.current); return; }
    msgIntervalRef.current = setInterval(() => {
      setLoadingMsgIdx((prev) => (prev + 1) % loadingMessages.length);
    }, 1800);
    return () => clearInterval(msgIntervalRef.current);
  }, [isPrefetching]);

  function renderContent() {
    if (prefetchedText) {
      return (
        <div className={`api-result${isPrefetching ? " streaming" : ""}`}>
          {isPrefetching && (
            <div className="streaming-indicator">
              <span className="streaming-dot" />
              {t.generating}
            </div>
          )}
          {renderText(prefetchedText)}
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
    <div className="interp-page">
      <h2 className="interp-title">{t.interpTitle(spread.name)}</h2>

      {question && (
        <div className="question-recall">
          <span className="question-label">{t.yourQuestion}</span>
          <span className="question-text">"{question}"</span>
        </div>
      )}

      <div className="interp-overview">
        <p className="interp-desc">{spread.description}</p>
        <p className="interp-style">{deckMeta?.name} · {deckMeta?.interpretationStyle}</p>
      </div>

      <div className="interp-visual-grid">
        {spread.positions.map((pos) => {
          const card = placements[pos.id];
          if (!card) return null;
          return (
            <div key={pos.id} className="interp-card-item">
              <Card card={card} deckMeta={deckMeta} size="medium" flipped={true} isReversed={card.isReversed} filterClass={filterClass} />
              <div className="interp-visual-label">
                <span className="visual-pos-name">{pos.name}</span>
                <span className="visual-card-name">{card.nameZh}</span>
                {card.isReversed && <span className="visual-reversed">{t.reversedShort}</span>}
              </div>
            </div>
          );
        })}
      </div>

      {renderContent()}

      {prefetchedText && (
        <div className="encouragement-closing">
          <p>{t.closing1}</p>
          <p>{t.closing2}</p>
          <p className="closing-bless">{t.closingBless}</p>
        </div>
      )}

      {prefetchedText && !isPrefetching && (
        <FollowUpSection
          question={question} spread={spread} placements={placements} deckMeta={deckMeta}
          originalInterpretation={prefetchedText}
          followUpHistory={followUpHistory || []}
          onUpdateHistory={onUpdateFollowUpHistory || (() => {})}
        />
      )}

      {prefetchedText && (
        <FeedbackSection
          deckMeta={deckMeta} spread={spread} placements={placements}
          question={question} interpretationText={prefetchedText} user={user}
        />
      )}

      <style>{`
        .interp-page { max-width: 900px; margin: 0 auto; padding: 20px 20px 40px; }
        .interp-title { font-family: 'Georgia', serif; font-size: 26px; color: #e8dcc8; text-align: center; margin: 0 0 14px; font-weight: 400; }
        .question-recall { text-align: center; margin-bottom: 20px; }
        .question-label { display: block; font-size: 11px; color: rgba(200,160,100,0.5); letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: 4px; }
        .question-text { font-size: 18px; color: #c9a96e; font-style: italic; }
        .interp-overview { text-align: center; margin-bottom: 20px; }
        .interp-desc { color: rgba(200,180,160,0.75); font-size: 14px; margin: 0 0 6px; }
        .interp-style { color: rgba(200,180,160,0.35); font-size: 11px; letter-spacing: 0.1em; margin: 0; }

        .interp-visual-grid { display: flex; flex-wrap: wrap; justify-content: center; gap: 24px; margin-bottom: 28px; }
        .interp-card-item { text-align: center; }
        .interp-visual-label { margin-top: 10px; }
        .visual-pos-name { display: block; font-size: 13px; color: #c9a96e; font-weight: 500; }
        .visual-card-name { display: block; font-size: 12px; color: rgba(200,180,160,0.6); }
        .visual-reversed { display: inline-block; margin-top: 2px; padding: 1px 6px; border-radius: 4px; background: #6b3420; color: #e8dcc8; font-size: 10px; }

        .loading-container { text-align: center; padding: 56px 20px; }
        .loading-spinner { position: relative; width: 64px; height: 64px; margin: 0 auto 28px; }
        .spinner-ring { position: absolute; inset: 0; border: 2px solid rgba(200,160,100,0.15); border-top-color: #c9a96e; border-radius: 50%; animation: spin 1.4s linear infinite; }
        .spinner-ring-2 { position: absolute; inset: 8px; border: 2px solid rgba(180,140,200,0.12); border-bottom-color: rgba(180,140,200,0.7); border-radius: 50%; animation: spin 2s linear infinite reverse; }
        .spinner-ring-3 { position: absolute; inset: 16px; border: 2px solid rgba(200,170,100,0.1); border-left-color: rgba(200,170,100,0.6); border-radius: 50%; animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .loading-text { color: #c9a96e; font-size: 16px; letter-spacing: 0.05em; margin: 0 0 6px; }
        .loading-sub { color: rgba(200,180,160,0.3); font-size: 13px; margin: 0 0 16px; }
        .loading-dots { display: flex; gap: 8px; justify-content: center; }
        .loading-dot { width: 6px; height: 6px; border-radius: 50%; background: rgba(200,160,100,0.5); animation: dotPulse 1.2s ease-in-out infinite; }
        @keyframes dotPulse { 0%, 100% { opacity: 0.2; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.3); } }

        .error-container { text-align: center; padding: 40px 20px; background: rgba(200,100,80,0.05); border: 1px solid rgba(200,100,80,0.15); border-radius: 14px; margin-top: 20px; }
        .error-icon { font-size: 32px; margin: 0 0 12px; }
        .error-title { color: #d4a080; font-size: 18px; margin: 0 0 8px; }
        .error-detail { color: rgba(200,150,130,0.7); font-size: 14px; margin: 0 0 16px; font-family: monospace; }
        .error-hint { color: rgba(200,180,160,0.4); font-size: 13px; margin: 0; }

        .api-result { padding: 24px 28px; background: linear-gradient(135deg, rgba(200,160,100,0.04), rgba(180,140,200,0.03)); border: 1px solid rgba(200,160,100,0.12); border-radius: 14px; margin-top: 20px; }
        .api-result.streaming { border-color: rgba(200,160,100,0.25); box-shadow: 0 0 20px rgba(200,160,100,0.05); }
        .streaming-indicator { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; padding-bottom: 10px; border-bottom: 1px solid rgba(200,160,100,0.08); color: rgba(200,160,100,0.45); font-size: 12px; }
        .streaming-dot { width: 6px; height: 6px; border-radius: 50%; background: #c9a96e; animation: streamPulse 0.8s ease-in-out infinite; }
        @keyframes streamPulse { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }

        .r-para { font-size: 15px; color: rgba(220,210,190,0.85); line-height: 2; margin: 0 0 8px; }
        .r-card-title { font-size: 16px; color: #c9a96e; margin: 20px 0 6px; padding-top: 16px; border-top: 1px solid rgba(200,160,100,0.1); }
        .r-subtitle { font-size: 14px; color: rgba(200,180,160,0.85); margin: 14px 0 4px; font-weight: 600; }
        .r-bold { font-size: 14px; color: rgba(210,190,170,0.9); font-weight: 500; margin: 8px 0 4px; }
        .r-divider { border: none; border-top: 1px solid rgba(200,160,100,0.08); margin: 12px 0; }

        .encouragement-closing { margin-top: 32px; padding: 24px; text-align: center; border-top: 1px solid rgba(200,160,100,0.1); }
        .encouragement-closing p { color: rgba(200,180,160,0.55); font-size: 14px; line-height: 2; margin: 0 0 4px; }
        .closing-bless { margin-top: 8px; font-size: 17px; color: #c9a96e; letter-spacing: 0.1em; font-family: 'Georgia', serif; }

        @media (max-width: 500px) {
          .interp-visual-grid { gap: 16px; }
          .api-result { padding: 16px 18px; }
        }
      `}</style>
    </div>
  );
}
