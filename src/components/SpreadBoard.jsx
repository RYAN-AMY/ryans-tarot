import { useState, useCallback } from "react";
import Card from "./Card";

export default function SpreadBoard({
  spread, placements, revealed, deckMeta, filterClass,
  onDrop, onRemovePlacement, phase,
  selectedCardId, onSlotClick,
}) {
  const [dragOverPos, setDragOverPos] = useState(null);

  const handleDragOver = useCallback((e, posId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverPos(posId);
  }, []);

  const handleDragLeave = useCallback((e, posId) => {
    // Only reset if leaving this specific slot (not entering a child)
    if (e.currentTarget.contains(e.relatedTarget)) return;
    if (dragOverPos === posId) setDragOverPos(null);
  }, [dragOverPos]);

  const handleDrop = useCallback((e, posId) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverPos(null);
    const cardId = e.dataTransfer.getData("text/plain");
    if (cardId) {
      onDrop(cardId, posId);
    }
  }, [onDrop]);

  const isRevealedPhase = phase === "revealed" || phase === "interpretation";
  const isPlacingPhase = phase === "placing";

  return (
    <div className="spread-board">
      <h3 className="board-title">
        {spread.name} — {isPlacingPhase ? "将手牌拖放至对应位置" : "牌阵全貌"}
      </h3>
      <div className="board-container" style={{
        background: `radial-gradient(ellipse, ${deckMeta?.colors?.accent || "#c9a96e"}0f 0%, transparent 70%)`,
        borderColor: `${deckMeta?.colors?.accent || "#c9a96e"}20`,
      }}>
        {spread.positions.map((pos) => {
          const card = placements[pos.id];
          const isRevealed = revealed[pos.id];
          const isDragOver = dragOverPos === pos.id;

          return (
            <div
              key={pos.id}
              className={`position-slot ${isDragOver ? "drag-over" : ""} ${card ? "filled" : ""} ${selectedCardId && !card ? "click-target" : ""}`}
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                borderColor: deckMeta?.colors?.accent || "#c9a96e",
              }}
              onDragOver={(e) => handleDragOver(e, pos.id)}
              onDragLeave={(e) => handleDragLeave(e, pos.id)}
              onDrop={(e) => handleDrop(e, pos.id)}
              onClick={() => {
                if (selectedCardId && !card && isPlacingPhase) {
                  onSlotClick?.(pos.id);
                }
              }}
            >
              {card ? (
                <div style={{ cursor: "default", position: "relative" }}>
                  <Card
                    card={card}
                    deckMeta={deckMeta}
                    size="small"
                    flipped={isRevealedPhase && !!isRevealed}
                    isReversed={card.isReversed}
                    filterClass={filterClass}
                  />
                  {!isRevealed && (
                    <div style={{
                      position: "absolute", bottom: -18, left: "50%", transform: "translateX(-50%)",
                      fontSize: 9, color: "rgba(200,180,160,0.35)", whiteSpace: "nowrap",
                    }}>
                      未翻牌
                    </div>
                  )}
                  {isPlacingPhase && !isRevealed && (
                    <button
                      className="slot-remove-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemovePlacement(pos.id);
                      }}
                      title="移除"
                    >
                      ×
                    </button>
                  )}
                </div>
              ) : (
                <div className="slot-placeholder">
                  <span className="slot-name">{pos.name}</span>
                  <span className="slot-desc">{pos.description}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <style>{`
        .spread-board {
          margin: 0 auto;
          max-width: 900px;
        }
        .board-title {
          font-family: 'Georgia', serif;
          font-size: 16px;
          color: rgba(200,180,160,0.7);
          text-align: center;
          margin: 0 0 20px;
          font-weight: 400;
          letter-spacing: 0.05em;
        }
        .board-container {
          position: relative;
          width: 100%;
          min-height: 580px;
          border-radius: 16px;
          border: 1px solid rgba(200,160,100,0.12);
          transition: background 0.5s;
        }
        .position-slot {
          position: absolute;
          transform: translate(-50%, -50%);
          min-width: 115px;
          min-height: 195px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border: 1.5px dashed;
          border-radius: 10px;
          transition: all 0.2s;
          padding: 4px;
        }
        .position-slot.filled {
          border-style: solid;
          border-color: rgba(200,160,100,0.5);
        }
        .position-slot.drag-over {
          background: rgba(200,160,100,0.15);
          border-style: solid;
          border-color: rgba(200,160,100,0.8) !important;
          transform: translate(-50%, -50%) scale(1.06);
          box-shadow: 0 0 20px rgba(200,160,100,0.2);
        }
        .position-slot.click-target {
          cursor: pointer;
          border-style: solid;
          border-color: rgba(200,160,100,0.6) !important;
          animation: slotPulse 1.5s ease-in-out infinite;
        }
        @keyframes slotPulse {
          0%, 100% { box-shadow: 0 0 8px rgba(200,160,100,0.15); }
          50% { box-shadow: 0 0 18px rgba(200,160,100,0.35); }
        }
        .slot-placeholder {
          text-align: center;
          padding: 8px;
        }
        .slot-name {
          display: block;
          font-size: 13px;
          color: rgba(200,180,160,0.8);
          font-weight: 500;
        }
        .slot-desc {
          display: block;
          font-size: 10px;
          color: rgba(200,180,160,0.35);
          margin-top: 4px;
          max-width: 80px;
        }
        .slot-remove-btn {
          position: absolute;
          top: -8px;
          right: -8px;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: rgba(180,80,80,0.8);
          color: #fff;
          border: none;
          cursor: pointer;
          font-size: 14px;
          line-height: 18px;
          text-align: center;
          padding: 0;
          z-index: 2;
        }
        .slot-remove-btn:hover {
          background: rgba(200,60,60,0.9);
        }
        @media (min-width: 700px) {
          .board-container { min-height: 650px; }
        }
        @media (max-width: 500px) {
          .position-slot { min-width: 95px; min-height: 155px; }
          .slot-name { font-size: 10px; }
          .slot-desc { font-size: 8px; max-width: 60px; }
        }
      `}</style>
    </div>
  );
}
