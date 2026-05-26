import Card from "./Card";

export default function HandArea({ drawnCards, placements, deckMeta, selectedCardId, onSelectCard }) {
  const placedIds = new Set(Object.values(placements).map((c) => c?.id).filter(Boolean));
  const unplaced = drawnCards.filter((c) => !placedIds.has(c.id));

  return (
    <div className="hand-area">
      <h4 className="hand-title">
        {unplaced.length > 0
          ? `手牌 — 点击选中卡片，再点击牌阵位置放置 (剩余 ${unplaced.length} 张)`
          : "所有牌已放置完毕 ✓"}
      </h4>
      <div className="hand-cards">
        {unplaced.map((card) => (
          <div
            key={card.id}
            className={`hand-card-wrapper ${selectedCardId === card.id ? "selected" : ""}`}
            onClick={() => onSelectCard?.(card.id)}
          >
            <Card
              card={card}
              deckMeta={deckMeta}
              size="small"
              flipped={false}
            />
          </div>
        ))}
        {drawnCards.length === 0 && (
          <p style={{ color: "rgba(200,180,160,0.35)", fontSize: 13 }}>
            尚未选牌
          </p>
        )}
      </div>
      <style>{`
        .hand-area {
          margin-top: 20px;
          padding: 16px;
          border-radius: 12px;
          background: rgba(0,0,0,0.25);
          border: 1px solid rgba(200,160,100,0.12);
        }
        .hand-title {
          font-family: 'Georgia', serif;
          font-size: 14px;
          color: rgba(200,180,160,0.55);
          margin: 0 0 12px;
          text-align: center;
          font-weight: 400;
          letter-spacing: 0.04em;
        }
        .hand-cards {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          justify-content: center;
          min-height: 160px;
          align-items: center;
        }
        .hand-card-wrapper {
          transition: transform 0.15s;
          cursor: grab;
        }
        .hand-card-wrapper:active {
          cursor: grabbing;
          transform: scale(1.05);
        }
        .hand-card-wrapper.selected {
          transform: scale(1.08);
          filter: brightness(1.3);
          box-shadow: 0 0 20px rgba(200,160,100,0.5);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
