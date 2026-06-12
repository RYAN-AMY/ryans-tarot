import { useState, useRef, useEffect, useCallback } from "react";
import { useLang } from "../contexts/LangContext";
import { zh, en } from "../i18n/translations";
import { allCards } from "../data/cards";
import { buildFollowUpPrompt } from "../utils/buildFollowUpPrompt";
import Card from "./Card";

function drawRandomCard(excludeIds) {
  const pool = allCards.filter((c) => !excludeIds.has(c.id));
  const card = pool[Math.floor(Math.random() * pool.length)];
  if (!card) return null;
  return { ...card, isReversed: Math.random() < 0.5 };
}

export default function FollowUpSection({
  question, spread, placements, deckMeta, originalInterpretation,
  followUpHistory, onUpdateHistory,
}) {
  const { lang } = useLang();
  const t = lang === "zh" ? zh : en;
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [supplementalCards, setSupplementalCards] = useState([]);
  const [drawingCard, setDrawingCard] = useState(null);
  const messagesEndRef = useRef(null);
  const abortRef = useRef(null);
  const streamTextRef = useRef("");
  const rafRef = useRef(null);

  const drawnCardIds = new Set(Object.values(placements).map((c) => c?.id).filter(Boolean));

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [followUpHistory, streamingText, supplementalCards]);

  const handleDrawCard = useCallback(() => {
    const excludeIds = new Set([
      ...drawnCardIds,
      ...supplementalCards.map((c) => c.id),
    ]);
    const card = drawRandomCard(excludeIds);
    if (!card) return;
    setDrawingCard(card);
    setTimeout(() => {
      setSupplementalCards((prev) => [...prev, { ...card, drawIndex: prev.length }]);
      setDrawingCard(null);
    }, 600);
  }, [drawnCardIds, supplementalCards]);

  const handleSubmit = async () => {
    const q = input.trim();
    if (!q || isLoading) return;

    const userMsg = {
      role: "user",
      content: q,
      timestamp: new Date().toISOString(),
      supplementalCards: [...supplementalCards],
    };
    const newHistory = [...followUpHistory, userMsg];
    onUpdateHistory(newHistory);
    setInput("");
    setIsLoading(true);
    setStreamingText("");

    const systemPrompt = deckMeta?.interpretationPersona
      || "你是一位经验丰富的塔罗解读师。";
    const userMessage = buildFollowUpPrompt(
      { question, spread, placements, deckMeta, originalInterpretation },
      followUpHistory,
      q,
      supplementalCards,
    );

    const controller = new AbortController();
    abortRef.current = controller;
    streamTextRef.current = "";

    try {
      const res = await fetch("/api/followup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ systemPrompt, userMessage, cardCount: spread.cards }),
        signal: controller.signal,
      });

      if (!res.ok) throw new Error(`API error: ${res.status}`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
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
                streamTextRef.current += parsed.text;
                if (!rafRef.current) {
                  rafRef.current = requestAnimationFrame(() => {
                    setStreamingText(streamTextRef.current);
                    rafRef.current = null;
                  });
                }
              }
            } catch { /* skip */ }
          }
        }
      }

      const finalText = streamTextRef.current;
      const assistantMsg = { role: "assistant", content: finalText, timestamp: new Date().toISOString() };
      onUpdateHistory([...newHistory, assistantMsg]);
    } catch (err) {
      if (err.name !== "AbortError") {
        const errorMsg = { role: "assistant", content: t.followUpError, timestamp: new Date().toISOString() };
        onUpdateHistory([...newHistory, errorMsg]);
      }
    } finally {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      setIsLoading(false);
      setStreamingText("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const accent = deckMeta?.colors?.accent || "#c9a96e";

  return (
    <div className="followup-section">
      <div className="followup-divider">
        <span>{t.followUpDivider}</span>
      </div>

      {/* Supplemental card drawing */}
      <div className="supplement-area">
        <button className="supplement-draw-btn" onClick={handleDrawCard} disabled={isLoading}>
          {t.drawSupplementHint}
        </button>
        <span className="supplement-hint">{t.drawSupplementSub}</span>

        {/* Card being drawn (animation) */}
        {drawingCard && (
          <div className="supplement-drawing">
            <div className="supplement-card-flip">
              <Card
                card={drawingCard}
                deckMeta={deckMeta}
                size="small"
                flipped={false}
                filterClass={deckMeta?.imageFilter ? "filter-deck" : ""}
              />
            </div>
            <p className="supplement-drawing-text">{t.drawingCard}</p>
          </div>
        )}

        {/* Drawn cards */}
        {supplementalCards.length > 0 && (
          <div className="supplement-cards-row">
            {supplementalCards.map((card, i) => (
              <div key={i} className="supplement-card-item">
                <Card
                  card={card}
                  deckMeta={deckMeta}
                  size="small"
                  flipped={true}
                  isReversed={card.isReversed}
                  filterClass={deckMeta?.imageFilter ? "filter-deck" : ""}
                />
                <div className="supplement-card-label">
                  <span className="supplement-card-name">{card.nameZh}</span>
                  {card.isReversed && <span className="supplement-card-reversed">{t.reversedShort}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Conversation thread */}
      {followUpHistory.length > 0 && (
        <div className="followup-thread">
          {followUpHistory.map((msg, i) => (
            <div key={i} className={`followup-msg ${msg.role}`}>
              <div className="followup-msg-role">
                {msg.role === "user" ? t.you : t.tarot}
              </div>
              {/* Show supplemental cards attached to this question */}
              {msg.supplementalCards && msg.supplementalCards.length > 0 && (
                <div className="followup-msg-cards">
                  {msg.supplementalCards.map((card, j) => (
                    <span key={j} className="followup-msg-card-tag">
                      🃏 {card.nameZh}{card.isReversed ? " 逆" : " 正"}
                    </span>
                  ))}
                </div>
              )}
              <div className="followup-msg-content">
                {msg.content.split("\n").map((line, j) => (
                  line.trim() === "" ? <br key={j} /> : <p key={j}>{line}</p>
                ))}
              </div>
            </div>
          ))}

          {isLoading && streamingText && (
            <div className="followup-msg assistant">
              <div className="followup-msg-role">{t.tarot}</div>
              <div className="followup-msg-content streaming">
                {streamingText.split("\n").map((line, j) => (
                  line.trim() === "" ? <br key={j} /> : <p key={j}>{line}</p>
                ))}
                <span className="followup-cursor" />
              </div>
            </div>
          )}

          {isLoading && !streamingText && (
            <div className="followup-msg assistant">
              <div className="followup-msg-role">{t.tarot}</div>
              <div className="followup-msg-content">
                <span className="followup-loading-dots">
                  <span>.</span><span>.</span><span>.</span>
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Input area */}
      <div className="followup-input-area">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={supplementalCards.length > 0
            ? t.followUpPlaceholder1
            : t.followUpPlaceholder2}
          rows={2}
          disabled={isLoading}
        />
        <button
          onClick={handleSubmit}
          disabled={isLoading || !input.trim()}
          className="followup-send-btn"
        >
          {t.send}
        </button>
      </div>

      <style>{`
        .followup-section {
          margin-top: 24px;
          padding: 0 4px;
        }
        .followup-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
        }
        .followup-divider::before,
        .followup-divider::after {
          content: "";
          flex: 1;
          height: 1px;
          background: linear-gradient(to right, transparent, ${accent}30, transparent);
        }
        .followup-divider span {
          font-size: 13px;
          color: ${accent}88;
          letter-spacing: 0.1em;
          white-space: nowrap;
        }

        /* Supplement area */
        .supplement-area {
          text-align: center;
          margin-bottom: 20px;
          padding: 16px;
          background: rgba(200,160,100,0.03);
          border: 1px solid rgba(200,160,100,0.08);
          border-radius: 12px;
        }
        .supplement-draw-btn {
          display: inline-block;
          padding: 10px 28px;
          border: 1px dashed ${accent}50;
          border-radius: 10px;
          background: transparent;
          color: ${accent};
          font-size: 15px;
          cursor: pointer;
          font-family: 'Georgia', serif;
          letter-spacing: 0.08em;
          transition: all 0.3s;
        }
        .supplement-draw-btn:hover:not(:disabled) {
          border-style: solid;
          background: ${accent}10;
          box-shadow: 0 0 20px ${accent}15;
        }
        .supplement-draw-btn:disabled {
          opacity: 0.35;
          cursor: default;
        }
        .supplement-hint {
          display: block;
          margin-top: 8px;
          color: rgba(200,180,160,0.3);
          font-size: 12px;
        }
        .supplement-drawing {
          margin-top: 16px;
          animation: cardAppear 0.6s ease-out;
        }
        .supplement-card-flip {
          display: inline-block;
          animation: flipIn 0.6s ease-out;
        }
        @keyframes cardAppear {
          0% { opacity: 0; transform: translateY(-20px) scale(0.8); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes flipIn {
          0% { transform: rotateY(0deg) scale(0.8); }
          50% { transform: rotateY(90deg) scale(0.9); }
          100% { transform: rotateY(0deg) scale(1); }
        }
        .supplement-drawing-text {
          margin-top: 8px;
          color: ${accent}88;
          font-size: 13px;
          animation: pulse 1s infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        .supplement-cards-row {
          display: flex;
          justify-content: center;
          gap: 16px;
          margin-top: 16px;
          flex-wrap: wrap;
        }
        .supplement-card-item {
          text-align: center;
        }
        .supplement-card-label {
          margin-top: 6px;
        }
        .supplement-card-name {
          display: block;
          font-size: 12px;
          color: #c9a96e;
        }
        .supplement-card-reversed {
          display: inline-block;
          margin-top: 2px;
          padding: 1px 5px;
          border-radius: 3px;
          background: #6b3420;
          color: #e8dcc8;
          font-size: 10px;
        }

        .followup-thread {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 20px;
        }
        .followup-msg {
          max-width: 88%;
        }
        .followup-msg.user {
          align-self: flex-end;
        }
        .followup-msg.assistant {
          align-self: flex-start;
        }
        .followup-msg-role {
          font-size: 11px;
          color: ${accent}88;
          margin-bottom: 4px;
          letter-spacing: 0.08em;
        }
        .followup-msg.user .followup-msg-role {
          text-align: right;
        }
        .followup-msg-cards {
          margin-bottom: 4px;
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }
        .followup-msg.user .followup-msg-cards {
          justify-content: flex-end;
        }
        .followup-msg-card-tag {
          padding: 2px 8px;
          border-radius: 4px;
          background: rgba(200,160,100,0.12);
          border: 1px solid rgba(200,160,100,0.2);
          color: #c9a96e;
          font-size: 11px;
        }
        .followup-msg-content {
          padding: 12px 16px;
          border-radius: 12px;
          font-size: 14px;
          line-height: 1.8;
          color: rgba(220,210,190,0.85);
        }
        .followup-msg.user .followup-msg-content {
          background: ${accent}18;
          border: 1px solid ${accent}25;
          border-bottom-right-radius: 4px;
        }
        .followup-msg.assistant .followup-msg-content {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-bottom-left-radius: 4px;
        }
        .followup-msg-content p {
          margin: 0 0 4px;
        }
        .followup-msg-content.streaming {
          border-color: ${accent}30;
        }
        .followup-cursor {
          display: inline-block;
          width: 6px;
          height: 14px;
          background: ${accent};
          margin-left: 2px;
          animation: blink 0.8s infinite;
          vertical-align: middle;
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .followup-loading-dots span {
          animation: dotBounce 1.2s infinite;
          font-size: 20px;
          color: ${accent}88;
        }
        .followup-loading-dots span:nth-child(2) { animation-delay: 0.2s; }
        .followup-loading-dots span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes dotBounce {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 1; }
        }

        .followup-input-area {
          display: flex;
          gap: 10px;
          align-items: flex-end;
        }
        .followup-input-area textarea {
          flex: 1;
          padding: 12px 14px;
          border-radius: 10px;
          background: rgba(0,0,0,0.25);
          border: 1px solid ${accent}25;
          color: #e8dcc8;
          font-size: 14px;
          font-family: inherit;
          resize: none;
          outline: none;
          line-height: 1.5;
          transition: border-color 0.2s;
        }
        .followup-input-area textarea:focus {
          border-color: ${accent}60;
        }
        .followup-input-area textarea:disabled {
          opacity: 0.5;
        }
        .followup-send-btn {
          padding: 10px 20px;
          border: 1px solid ${accent}50;
          border-radius: 10px;
          background: transparent;
          color: ${accent};
          font-size: 14px;
          cursor: pointer;
          letter-spacing: 0.05em;
          transition: all 0.2s;
          white-space: nowrap;
        }
        .followup-send-btn:hover:not(:disabled) {
          background: ${accent}18;
        }
        .followup-send-btn:disabled {
          opacity: 0.35;
          cursor: default;
        }
      `}</style>
    </div>
  );
}
