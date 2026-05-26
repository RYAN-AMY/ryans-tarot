import Card from "./Card";

export default function HandArea({ drawnCards, placements, deckMeta, selectedCardId, onSelectCard }) {
  const placedIds = new Set(Object.values(placements).map((c) => c?.id).filter(Boolean));
  const unplaced = drawnCards.filter((c) => !placedIds.has(c.id));

  if (unplaced.length === 0 && drawnCards.length > 0) {
    return (
      <div className="hand-area hand-done">
        <p className="hand-done-text">所有牌已放置完毕 ✓</p>
      </div>
    );
  }

  return (
    <div className="hand-area">
      <p className="hand-hint">
        {selectedCardId ? "👆 已选中牌，请点击上方牌阵位置放置" : "👆 先点击下方手牌选中，再点击牌阵位置放置"}
      </p>
      <div className="hand-cards">
        {unplaced.map((card) => (
          <div
            key={card.id}
            className={`hand-card-wrapper ${selectedCardId === card.id ? "selected" : ""}`}
            onClick={() => onSelectCard?.(card.id)}
          >
            <Card card={card} deckMeta={deckMeta} size="small" flipped={false} />
            {selectedCardId === card.id && <div className="hand-selected-badge">已选中</div>}
          </div>
        ))}
        {drawnCards.length === 0 && (
          <p style={{ color: "rgba(200,180,160,0.35)", fontSize: 13 }}>尚未选牌</p>
        )}
      </div>
      <style>{`
        .hand-area {
          margin-top: 16px; padding: 14px 12px; border-radius: 12px;
          background: rgba(0,0,0,0.3); border: 1px solid rgba(200,160,100,0.15);
        }
        .hand-done {
          text-align: center; padding: 12px;
        }
        .hand-done-text {
          color: rgba(200,180,160,0.5); font-size: 14px; margin: 0;
          font-family: 'Georgia', serif;
        }
        .hand-hint {
          color: rgba(200,180,160,0.5); font-size: 13px;
          margin: 0 0 10px; text-align: center;
        }
        .hand-cards {
          display: flex; gap: 12px; flex-wrap: wrap;
          justify-content: center; min-height: 50px; align-items: center;
        }
        .hand-card-wrapper {
          position: relative; transition: transform 0.15s; cursor: pointer;
          border-radius: 10px;
        }
        .hand-card-wrapper:active {
          transform: scale(1.05);
        }
        .hand-card-wrapper.selected {
          transform: translateY(-8px) scale(1.06);
          box-shadow: 0 4px 24px rgba(200,160,100,0.5);
          border-radius: 10px;
        }
        .hand-selected-badge {
          position: absolute; bottom: -8px; left: 50%; transform: translateX(-50%);
          background: rgba(200,160,100,0.9); color: #1a1a2e;
          font-size: 10px; padding: 2px 10px; border-radius: 10px;
          font-weight: 600; white-space: nowrap;
        }
        @media (max-width: 500px) {
          .hand-area { padding: 10px 8px; }
          .hand-cards { gap: 8px; }
          .hand-hint { font-size: 11px; }
        }
      `}</style>
    </div>
  );
}
