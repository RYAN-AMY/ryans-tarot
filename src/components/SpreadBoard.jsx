import { useState, useCallback } from "react";
import Card from "./Card";

function PositionSlot({ pos, card, isRevealed, isDragOver, isPlacingPhase, isRevealedPhase, selectedCardId, deckMeta, filterClass, accent, onDragOver, onDragLeave, onDrop, onSlotClick, onRemovePlacement }) {
  return (
    <div
      className={`position-slot ${isDragOver ? "drag-over" : ""} ${card ? "filled" : ""} ${selectedCardId && !card ? "click-target" : ""}`}
      style={{ borderColor: accent }}
      onDragOver={(e) => onDragOver(e, pos.id)}
      onDragLeave={(e) => onDragLeave(e, pos.id)}
      onDrop={(e) => onDrop(e, pos.id)}
      onClick={() => {
        if (selectedCardId && !card && isPlacingPhase) onSlotClick?.(pos.id);
      }}
    >
      {card ? (
        <div className="slot-card-wrap">
          <Card
            card={card}
            deckMeta={deckMeta}
            size="small"
            flipped={isRevealedPhase && !!isRevealed}
            isReversed={card.isReversed}
            filterClass={filterClass}
          />
          {!isRevealed && <div className="slot-unflipped">未翻牌</div>}
          {isPlacingPhase && !isRevealed && (
            <button className="slot-remove-btn" onClick={(e) => { e.stopPropagation(); onRemovePlacement(pos.id); }} title="移除">×</button>
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
}

export default function SpreadBoard({
  spread, placements, revealed, deckMeta, filterClass,
  onDrop, onRemovePlacement, phase,
  selectedCardId, onSlotClick,
}) {
  const [dragOverPos, setDragOverPos] = useState(null);
  const accent = deckMeta?.colors?.accent || "#c9a96e";

  const handleDragOver = useCallback((e, posId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverPos(posId);
  }, []);

  const handleDragLeave = useCallback((e, posId) => {
    if (e.currentTarget.contains(e.relatedTarget)) return;
    if (dragOverPos === posId) setDragOverPos(null);
  }, [dragOverPos]);

  const handleDrop = useCallback((e, posId) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverPos(null);
    const cardId = e.dataTransfer.getData("text/plain");
    if (cardId) onDrop(cardId, posId);
  }, [onDrop]);

  const isRevealedPhase = phase === "revealed" || phase === "interpretation";
  const isPlacingPhase = phase === "placing";

  const slotProps = { isPlacingPhase, isRevealedPhase, selectedCardId, deckMeta, filterClass, accent, onDragOver: handleDragOver, onDragLeave: handleDragLeave, onDrop: handleDrop, onSlotClick, onRemovePlacement };

  return (
    <div className="spread-board">
      <h3 className="board-title">
        {spread.name} — {isPlacingPhase ? "点击手牌再点击位置放置" : "牌阵全貌"}
      </h3>

      <div className={`board-container board-${spread.id}`} style={{
        background: `radial-gradient(ellipse, ${accent}0f 0%, transparent 70%)`,
        borderColor: `${accent}20`,
      }}>
        {/* --- Three-card: horizontal timeline --- */}
        {spread.id === "three-card" && (
          <div className="layout-threecard">
            {spread.positions.map((pos) => (
              <div key={pos.id} className="threecard-slot">
                <PositionSlot pos={pos} card={placements[pos.id]} isRevealed={revealed[pos.id]} isDragOver={dragOverPos === pos.id} {...slotProps} />
              </div>
            ))}
          </div>
        )}

        {/* --- Crossroads: diamond choice --- */}
        {spread.id === "crossroads" && (
          <div className="layout-crossroads">
            <div className="crossroads-center">
              <PositionSlot pos={spread.positions[0]} card={placements[spread.positions[0].id]} isRevealed={revealed[spread.positions[0].id]} isDragOver={dragOverPos === spread.positions[0].id} {...slotProps} />
            </div>
            <div className="crossroads-paths">
              <div className="crossroads-path">
                <PositionSlot pos={spread.positions[1]} card={placements[spread.positions[1].id]} isRevealed={revealed[spread.positions[1].id]} isDragOver={dragOverPos === spread.positions[1].id} {...slotProps} />
                <PositionSlot pos={spread.positions[3]} card={placements[spread.positions[3].id]} isRevealed={revealed[spread.positions[3].id]} isDragOver={dragOverPos === spread.positions[3].id} {...slotProps} />
              </div>
              <div className="crossroads-path">
                <PositionSlot pos={spread.positions[2]} card={placements[spread.positions[2].id]} isRevealed={revealed[spread.positions[2].id]} isDragOver={dragOverPos === spread.positions[2].id} {...slotProps} />
                <PositionSlot pos={spread.positions[4]} card={placements[spread.positions[4].id]} isRevealed={revealed[spread.positions[4].id]} isDragOver={dragOverPos === spread.positions[4].id} {...slotProps} />
              </div>
            </div>
          </div>
        )}

        {/* --- Four seasons: compass diamond --- */}
        {spread.id === "four-seasons" && (
          <div className="layout-seasons">
            <div className="seasons-top"><PositionSlot pos={spread.positions[0]} card={placements[spread.positions[0].id]} isRevealed={revealed[spread.positions[0].id]} isDragOver={dragOverPos === spread.positions[0].id} {...slotProps} /></div>
            <div className="seasons-mid">
              <div className="seasons-left"><PositionSlot pos={spread.positions[3]} card={placements[spread.positions[3].id]} isRevealed={revealed[spread.positions[3].id]} isDragOver={dragOverPos === spread.positions[3].id} {...slotProps} /></div>
              <div className="seasons-center" />
              <div className="seasons-right"><PositionSlot pos={spread.positions[1]} card={placements[spread.positions[1].id]} isRevealed={revealed[spread.positions[1].id]} isDragOver={dragOverPos === spread.positions[1].id} {...slotProps} /></div>
            </div>
            <div className="seasons-bottom"><PositionSlot pos={spread.positions[2]} card={placements[spread.positions[2].id]} isRevealed={revealed[spread.positions[2].id]} isDragOver={dragOverPos === spread.positions[2].id} {...slotProps} /></div>
          </div>
        )}

        {/* --- Hexagram: star --- */}
        {spread.id === "hexagram" && (
          <div className="layout-hexagram">
            <div className="hexa-top"><PositionSlot pos={spread.positions[5]} card={placements[spread.positions[5].id]} isRevealed={revealed[spread.positions[5].id]} isDragOver={dragOverPos === spread.positions[5].id} {...slotProps} /></div>
            <div className="hexa-row">
              <div className="hexa-mid"><PositionSlot pos={spread.positions[3]} card={placements[spread.positions[3].id]} isRevealed={revealed[spread.positions[3].id]} isDragOver={dragOverPos === spread.positions[3].id} {...slotProps} /></div>
              <div className="hexa-mid"><PositionSlot pos={spread.positions[6]} card={placements[spread.positions[6].id]} isRevealed={revealed[spread.positions[6].id]} isDragOver={dragOverPos === spread.positions[6].id} {...slotProps} /></div>
            </div>
            <div className="hexa-center-row">
              <PositionSlot pos={spread.positions[0]} card={placements[spread.positions[0].id]} isRevealed={revealed[spread.positions[0].id]} isDragOver={dragOverPos === spread.positions[0].id} {...slotProps} />
              <PositionSlot pos={spread.positions[1]} card={placements[spread.positions[1].id]} isRevealed={revealed[spread.positions[1].id]} isDragOver={dragOverPos === spread.positions[1].id} {...slotProps} />
              <PositionSlot pos={spread.positions[2]} card={placements[spread.positions[2].id]} isRevealed={revealed[spread.positions[2].id]} isDragOver={dragOverPos === spread.positions[2].id} {...slotProps} />
            </div>
            <div className="hexa-bottom"><PositionSlot pos={spread.positions[4]} card={placements[spread.positions[4].id]} isRevealed={revealed[spread.positions[4].id]} isDragOver={dragOverPos === spread.positions[4].id} {...slotProps} /></div>
          </div>
        )}

        {/* --- Relationship: two columns --- */}
        {spread.id === "relationship" && (
          <div className="layout-relationship">
            <div className="rel-top"><PositionSlot pos={spread.positions[5]} card={placements[spread.positions[5].id]} isRevealed={revealed[spread.positions[5].id]} isDragOver={dragOverPos === spread.positions[5].id} {...slotProps} /></div>
            <div className="rel-columns">
              <div className="rel-col">
                <PositionSlot pos={spread.positions[0]} card={placements[spread.positions[0].id]} isRevealed={revealed[spread.positions[0].id]} isDragOver={dragOverPos === spread.positions[0].id} {...slotProps} />
                <PositionSlot pos={spread.positions[3]} card={placements[spread.positions[3].id]} isRevealed={revealed[spread.positions[3].id]} isDragOver={dragOverPos === spread.positions[3].id} {...slotProps} />
              </div>
              <div className="rel-center"><PositionSlot pos={spread.positions[2]} card={placements[spread.positions[2].id]} isRevealed={revealed[spread.positions[2].id]} isDragOver={dragOverPos === spread.positions[2].id} {...slotProps} /></div>
              <div className="rel-col">
                <PositionSlot pos={spread.positions[1]} card={placements[spread.positions[1].id]} isRevealed={revealed[spread.positions[1].id]} isDragOver={dragOverPos === spread.positions[1].id} {...slotProps} />
                <PositionSlot pos={spread.positions[4]} card={placements[spread.positions[4].id]} isRevealed={revealed[spread.positions[4].id]} isDragOver={dragOverPos === spread.positions[4].id} {...slotProps} />
              </div>
            </div>
            <div className="rel-bottom"><PositionSlot pos={spread.positions[6]} card={placements[spread.positions[6].id]} isRevealed={revealed[spread.positions[6].id]} isDragOver={dragOverPos === spread.positions[6].id} {...slotProps} /></div>
          </div>
        )}

        {/* --- Celtic Cross --- */}
        {spread.id === "celtic-cross" && (
          <div className="layout-celtic">
            <div className="celtic-cross-area">
              <div className="celtic-goal"><PositionSlot pos={spread.positions[4]} card={placements[spread.positions[4].id]} isRevealed={revealed[spread.positions[4].id]} isDragOver={dragOverPos === spread.positions[4].id} {...slotProps} /></div>
              <div className="celtic-cross-center">
                <PositionSlot pos={spread.positions[0]} card={placements[spread.positions[0].id]} isRevealed={revealed[spread.positions[0].id]} isDragOver={dragOverPos === spread.positions[0].id} {...slotProps} />
                <PositionSlot pos={spread.positions[1]} card={placements[spread.positions[1].id]} isRevealed={revealed[spread.positions[1].id]} isDragOver={dragOverPos === spread.positions[1].id} {...slotProps} />
              </div>
              <div className="celtic-past"><PositionSlot pos={spread.positions[3]} card={placements[spread.positions[3].id]} isRevealed={revealed[spread.positions[3].id]} isDragOver={dragOverPos === spread.positions[3].id} {...slotProps} /></div>
              <div className="celtic-future"><PositionSlot pos={spread.positions[5]} card={placements[spread.positions[5].id]} isRevealed={revealed[spread.positions[5].id]} isDragOver={dragOverPos === spread.positions[5].id} {...slotProps} /></div>
              <div className="celtic-root"><PositionSlot pos={spread.positions[2]} card={placements[spread.positions[2].id]} isRevealed={revealed[spread.positions[2].id]} isDragOver={dragOverPos === spread.positions[2].id} {...slotProps} /></div>
            </div>
            <div className="celtic-staff">
              <PositionSlot pos={spread.positions[6]} card={placements[spread.positions[6].id]} isRevealed={revealed[spread.positions[6].id]} isDragOver={dragOverPos === spread.positions[6].id} {...slotProps} />
              <PositionSlot pos={spread.positions[7]} card={placements[spread.positions[7].id]} isRevealed={revealed[spread.positions[7].id]} isDragOver={dragOverPos === spread.positions[7].id} {...slotProps} />
              <PositionSlot pos={spread.positions[8]} card={placements[spread.positions[8].id]} isRevealed={revealed[spread.positions[8].id]} isDragOver={dragOverPos === spread.positions[8].id} {...slotProps} />
              <PositionSlot pos={spread.positions[9]} card={placements[spread.positions[9].id]} isRevealed={revealed[spread.positions[9].id]} isDragOver={dragOverPos === spread.positions[9].id} {...slotProps} />
            </div>
          </div>
        )}

        {/* --- Zodiac: elliptical ring --- */}
        {spread.id === "zodiac" && (
          <div className="layout-zodiac">
            {spread.positions.map((pos) => (
              <div key={pos.id} className="zodiac-slot" style={{
                left: `${pos.x}%`, top: `${pos.y}%`,
              }}>
                <PositionSlot pos={pos} card={placements[pos.id]} isRevealed={revealed[pos.id]} isDragOver={dragOverPos === pos.id} {...slotProps} />
              </div>
            ))}
          </div>
        )}

        {/* --- Fallback: generic absolute positioning --- */}
        {!["three-card", "crossroads", "four-seasons", "hexagram", "relationship", "celtic-cross", "zodiac"].includes(spread.id) && (
          <>
            {spread.positions.map((pos) => (
              <div key={pos.id} style={{ position: "absolute", left: `${pos.x}%`, top: `${pos.y}%`, transform: "translate(-50%, -50%)" }}>
                <PositionSlot pos={pos} card={placements[pos.id]} isRevealed={revealed[pos.id]} isDragOver={dragOverPos === pos.id} {...slotProps} />
              </div>
            ))}
          </>
        )}
      </div>

      <style>{`
        .spread-board { margin: 0 auto; max-width: 1000px; width: 100%; }
        .board-title {
          font-family: 'Georgia', serif; font-size: 15px;
          color: rgba(200,180,160,0.7); text-align: center;
          margin: 0 0 14px; font-weight: 400; letter-spacing: 0.04em;
        }
        .board-container {
          position: relative; width: 100%;
          min-height: clamp(420px, 58vh, 640px);
          border-radius: 16px; border: 1px solid rgba(200,160,100,0.12);
          transition: background 0.5s;
          display: flex; align-items: center; justify-content: center;
        }

        /* Position slot shared */
        .position-slot {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          border: 1.5px dashed; border-radius: 10px; transition: all 0.2s;
          padding: 6px; min-width: 110px; min-height: 180px;
        }
        .position-slot.filled { border-style: solid; border-color: rgba(200,160,100,0.5); }
        .position-slot.drag-over {
          background: rgba(200,160,100,0.15); border-style: solid;
          border-color: rgba(200,160,100,0.8) !important;
          transform: scale(1.06); box-shadow: 0 0 20px rgba(200,160,100,0.2);
        }
        .position-slot.click-target {
          cursor: pointer; border-style: solid;
          border-color: rgba(200,160,100,0.6) !important;
          animation: slotPulse 1.5s ease-in-out infinite;
        }
        @keyframes slotPulse {
          0%, 100% { box-shadow: 0 0 8px rgba(200,160,100,0.15); }
          50% { box-shadow: 0 0 18px rgba(200,160,100,0.35); }
        }
        .slot-card-wrap { cursor: default; position: relative; }
        .slot-placeholder { text-align: center; padding: 8px; }
        .slot-name { display: block; font-size: 13px; color: rgba(200,180,160,0.8); font-weight: 500; }
        .slot-desc { display: block; font-size: 10px; color: rgba(200,180,160,0.35); margin-top: 4px; max-width: 90px; }
        .slot-unflipped {
          position: absolute; bottom: -18px; left: 50%; transform: translateX(-50%);
          font-size: 9px; color: rgba(200,180,160,0.35); white-space: nowrap;
        }
        .slot-remove-btn {
          position: absolute; top: -8px; right: -8px; width: 22px; height: 22px;
          border-radius: 50%; background: rgba(180,80,80,0.8); color: #fff;
          border: none; cursor: pointer; font-size: 14px; line-height: 20px;
          text-align: center; padding: 0; z-index: 2;
        }

        /* ---- LAYOUT: Three Card ---- */
        .layout-threecard {
          display: flex; gap: clamp(12px, 4vw, 40px);
          align-items: center; justify-content: center;
          width: 100%; padding: 20px;
        }
        .threecard-slot { flex: 1; max-width: 240px; }

        /* ---- LAYOUT: Crossroads ---- */
        .layout-crossroads {
          display: flex; flex-direction: column; align-items: center;
          gap: clamp(12px, 3vh, 28px); padding: 16px;
        }
        .crossroads-paths { display: flex; gap: clamp(20px, 8vw, 80px); }
        .crossroads-path { display: flex; flex-direction: column; align-items: center; gap: 16px; }

        /* ---- LAYOUT: Four Seasons ---- */
        .layout-seasons {
          display: flex; flex-direction: column; align-items: center;
          gap: 10px; padding: 12px;
        }
        .seasons-mid { display: flex; gap: clamp(20px, 10vw, 100px); align-items: center; }
        .seasons-center { width: 40px; height: 40px; border-radius: 50%;
          background: radial-gradient(circle, rgba(200,160,100,0.08), transparent); }

        /* ---- LAYOUT: Hexagram ---- */
        .layout-hexagram {
          display: flex; flex-direction: column; align-items: center;
          gap: 8px; padding: 10px;
        }
        .hexa-row { display: flex; gap: clamp(30px, 12vw, 120px); }
        .hexa-center-row { display: flex; gap: clamp(8px, 3vw, 28px); }

        /* ---- LAYOUT: Relationship ---- */
        .layout-relationship {
          display: flex; flex-direction: column; align-items: center;
          gap: 10px; padding: 12px; width: 100%;
        }
        .rel-columns {
          display: flex; gap: clamp(8px, 3vw, 24px); align-items: center; width: 100%; justify-content: center;
        }
        .rel-col { display: flex; flex-direction: column; gap: 16px; align-items: center; }

        /* ---- LAYOUT: Celtic Cross ---- */
        .layout-celtic {
          display: flex; gap: clamp(12px, 4vw, 32px);
          align-items: center; justify-content: center; padding: 14px;
        }
        .celtic-cross-area {
          display: grid; grid-template-columns: 1fr 1fr 1fr;
          grid-template-rows: auto auto auto;
          gap: 8px; justify-items: center; align-items: center;
        }
        .celtic-goal { grid-column: 2; grid-row: 1; }
        .celtic-cross-center { grid-column: 2; grid-row: 2; display: flex; gap: 6px; }
        .celtic-past { grid-column: 1; grid-row: 2; }
        .celtic-future { grid-column: 3; grid-row: 2; }
        .celtic-root { grid-column: 2; grid-row: 3; }
        .celtic-staff { display: flex; flex-direction: column; gap: 10px; }

        /* ---- LAYOUT: Zodiac (elliptical) ---- */
        .layout-zodiac {
          position: relative; width: 100%; height: 100%;
          min-height: clamp(480px, 60vh, 640px);
        }
        .zodiac-slot {
          position: absolute; transform: translate(-50%, -50%);
        }

        @media (min-width: 700px) {
          .board-container { min-height: clamp(480px, 62vh, 680px); }
        }
        @media (max-width: 500px) {
          .position-slot { min-width: 90px; min-height: 148px; padding: 4px; }
          .slot-name { font-size: 10px; }
          .slot-desc { font-size: 8px; max-width: 60px; }
          .board-title { font-size: 13px; margin: 0 0 10px; }
          .board-container { min-height: clamp(360px, 50vh, 480px); border-radius: 12px; }
          .layout-celtic { flex-direction: column; gap: 12px; }
          .celtic-staff { flex-direction: row; flex-wrap: wrap; justify-content: center; gap: 8px; }
        }
      `}</style>
    </div>
  );
}
