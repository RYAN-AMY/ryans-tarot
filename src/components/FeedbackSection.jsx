import { useState } from "react";
import { getFeedbackRecords, saveFeedback, updateLastFeedback } from "../lib/userStore";
import { loadLegacyFeedback } from "../lib/userStore";

export default function FeedbackSection({ deckMeta, spread, placements, question, interpretationText, user }) {
  const [rating, setRating] = useState(null); // "up" | "down" | null
  const [feedbackText, setFeedbackText] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [showTextarea, setShowTextarea] = useState(false);

  function buildRecord(value, fbText = "") {
    return {
      timestamp: new Date().toISOString(),
      deckId: deckMeta?.id,
      deckName: deckMeta?.name,
      spreadId: spread?.id,
      spreadName: spread?.name,
      question: question || "",
      cards: spread?.positions.map((pos) => {
        const card = placements[pos.id];
        if (!card) return null;
        return {
          id: card.id,
          nameZh: card.nameZh,
          nameEn: card.nameEn,
          position: pos.name,
          isReversed: card.isReversed,
        };
      }).filter(Boolean) || [],
      interpretationText: interpretationText || "",
      rating: value,
      feedbackText: fbText,
    };
  }

  function handleRate(value) {
    setRating(value);
    setShowTextarea(value === "down");

    const record = buildRecord(value);
    saveFeedback({ ...record, user_id: user?.id || null });
    setSubmitted(true);
  }

  function handleSubmitFeedback() {
    if (!feedbackText.trim()) return;
    updateLastFeedback(feedbackText.trim());
    setSubmitted(true);
    setShowTextarea(false);
  }

  if (submitted) {
    return (
      <div className="feedback-section">
        <p className="feedback-thanks">感谢你的反馈，这将帮助塔罗更好地指引每一位来访者 ✦</p>
        <style>{`
          .feedback-section { text-align: center; padding: 20px 0 8px; }
          .feedback-thanks { color: rgba(200,180,160,0.6); font-size: 14px; }
        `}</style>
      </div>
    );
  }

  return (
    <div className="feedback-section">
      <p className="feedback-prompt">这次解读对你有帮助吗？</p>
      <div className="feedback-buttons">
        <button
          className={`feedback-btn ${rating === "up" ? "active" : ""}`}
          onClick={() => handleRate("up")}
          title="有帮助"
        >👍 有帮助</button>
        <button
          className={`feedback-btn ${rating === "down" ? "active" : ""}`}
          onClick={() => handleRate("down")}
          title="不太准"
        >👎 不太准</button>
      </div>
      {showTextarea && (
        <div className="feedback-textarea-wrap">
          <textarea
            className="feedback-textarea"
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            placeholder="能告诉我哪里可以更好吗？..."
            rows={2}
          />
          <button className="feedback-submit" onClick={handleSubmitFeedback}>
            提交
          </button>
        </div>
      )}
      <style>{`
        .feedback-section {
          text-align: center;
          padding: 24px 0 8px;
          margin-top: 8px;
          border-top: 1px solid rgba(200,160,100,0.1);
        }
        .feedback-prompt {
          color: rgba(200,180,160,0.5);
          font-size: 13px;
          margin: 0 0 12px;
        }
        .feedback-buttons {
          display: flex;
          gap: 12px;
          justify-content: center;
        }
        .feedback-btn {
          padding: 8px 20px;
          border: 1px solid rgba(200,160,100,0.25);
          border-radius: 8px;
          background: transparent;
          color: rgba(200,180,160,0.6);
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
          font-family: inherit;
        }
        .feedback-btn:hover {
          border-color: rgba(200,160,100,0.5);
          color: rgba(200,180,160,0.9);
        }
        .feedback-btn.active {
          border-color: #c9a96e;
          color: #c9a96e;
          background: rgba(200,160,100,0.08);
        }
        .feedback-textarea-wrap {
          margin-top: 12px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }
        .feedback-textarea {
          width: 100%;
          max-width: 400px;
          padding: 10px 14px;
          border-radius: 8px;
          background: rgba(0,0,0,0.25);
          border: 1px solid rgba(200,160,100,0.2);
          color: #e8dcc8;
          font-size: 13px;
          font-family: inherit;
          resize: vertical;
          outline: none;
          line-height: 1.5;
        }
        .feedback-textarea:focus {
          border-color: rgba(200,160,100,0.4);
        }
        .feedback-submit {
          padding: 6px 24px;
          border: 1px solid #c9a96e;
          border-radius: 6px;
          background: transparent;
          color: #c9a96e;
          font-size: 13px;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.2s;
        }
        .feedback-submit:hover {
          background: #c9a96e;
          color: #0a0a14;
        }
      `}</style>
    </div>
  );
}
