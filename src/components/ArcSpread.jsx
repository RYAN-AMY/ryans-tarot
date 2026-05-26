import { useState, useRef, useCallback } from "react";

export default function ArcSpread({
  shuffledCards,
  drawnCards,
  spreadCards,
  deckMeta,
  onSelectCard,
  onDeselectCard,
}) {
  const [offset, setOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const lastX = useRef(0);
  const totalCards = shuffledCards.length;
  const cardBack = `/decks/backs/${deckMeta?.cardBack || "back-rider-waite.png"}`;

  const arcRadius = 380;
  const visibleWindow = 165;
  const cardWidth = 100;
  const cardHeight = 171;

  const handlePointerDown = useCallback((e) => {
    setDragging(true);
    lastX.current = e.clientX;
  }, []);

  const handlePointerMove = useCallback((e) => {
    if (!dragging) return;
    const dx = e.clientX - lastX.current;
    setOffset((prev) => prev + dx * 0.28);
    lastX.current = e.clientX;
  }, [dragging]);

  const handlePointerUp = useCallback(() => {
    setDragging(false);
  }, []);

  const cards = [];
  for (let i = 0; i < totalCards; i++) {
    let angle = ((i / totalCards) * 360 + offset) % 360;
    if (angle < 0) angle += 360;

    // Distance from bottom center (90° is bottom of circle)
    let distFromCenter = Math.abs(angle - 90);
    if (distFromCenter > 180) distFromCenter = 360 - distFromCenter;

    if (distFromCenter > visibleWindow / 2 + 15) continue;

    // Gradual fade at edges
    const fadeStart = visibleWindow / 2 - 25;
    const opacity = distFromCenter > fadeStart
      ? Math.max(0, 1 - (distFromCenter - fadeStart) / 25)
      : 1;

    const rad = (angle * Math.PI) / 180;
    const x = 50 + (Math.cos(rad) * 48);
    const y = 20 + (Math.sin(rad) * 36);
    const scale = 0.48 + 0.52 * (1 - distFromCenter / (visibleWindow / 2 + 15));
    const zIndex = Math.floor((1 - distFromCenter / (visibleWindow / 2 + 15)) * 100);
    const isSelected = drawnCards.some((c) => c.id === shuffledCards[i].id);

    cards.push({ card: shuffledCards[i], x, y, scale, zIndex, opacity, isSelected });
  }

  return (
    <div
      className="arc-container"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <p className="arc-hint">
        拖动旋转牌弧 · 点击选牌 · 已选 {drawnCards.length}/{spreadCards}
      </p>
      <div className="arc-stage">
        {cards.map(({ card, x, y, scale, zIndex, opacity, isSelected }) => (
          <div
            key={card.id}
            className={`arc-card ${isSelected ? "selected" : ""}`}
            style={{
              left: `${x}%`,
              top: `${y}%`,
              transform: `translate(-50%, -50%) scale(${scale})`,
              zIndex: isSelected ? 1000 : zIndex,
              width: cardWidth,
              height: cardHeight,
              overflow: "hidden",
              borderRadius: 6,
              opacity: isSelected ? 0.55 : opacity,
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (isSelected) {
                onDeselectCard(card.id);
              } else if (drawnCards.length < spreadCards) {
                onSelectCard(card.id);
              }
            }}
          >
            <img
              src={cardBack}
              alt=""
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: 6,
                border: isSelected
                  ? `2px solid ${deckMeta?.colors?.accent || "#c9a96e"}`
                  : "1px solid rgba(255,255,255,0.12)",
                transition: "border 0.2s, opacity 0.2s",
              }}
              draggable={false}
            />
            {isSelected && (
              <div className="arc-selected-mark">
                {drawnCards.findIndex((c) => c.id === card.id) + 1}
              </div>
            )}
          </div>
        ))}
      </div>
      <style>{`
        .arc-container {
          position: relative;
          width: 100%;
          touch-action: none;
          cursor: grab;
          user-select: none;
        }
        .arc-container:active { cursor: grabbing; }
        .arc-hint {
          text-align: center;
          color: rgba(200,180,160,0.6);
          font-size: 14px;
          margin: 0 0 8px;
        }
        .arc-stage {
          position: relative;
          width: 100%;
          height: 480px;
          overflow: hidden;
        }
        .arc-card {
          position: absolute;
          cursor: pointer;
          transition: opacity 0.25s;
        }
        .arc-card:hover {
          filter: brightness(1.2);
        }
        .arc-card.selected {
          filter: brightness(0.65);
        }
        .arc-selected-mark {
          position: absolute;
          top: -6px;
          right: -6px;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #c9a96e;
          color: #0a0a14;
          font-size: 12px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
        }
      `}</style>
    </div>
  );
}
