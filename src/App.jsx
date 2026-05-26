import { useState } from "react";
import { useTarotSession } from "./hooks/useTarotSession";
import EntryScreen from "./components/EntryScreen";
import DeckBackground from "./components/DeckBackground";
import DeckSelector from "./components/DeckSelector";
import SpreadSelector from "./components/SpreadSelector";
import ShuffleArea from "./components/ShuffleArea";
import ArcSpread from "./components/ArcSpread";
import SpreadBoard from "./components/SpreadBoard";
import HandArea from "./components/HandArea";
import Interpretation from "./components/Interpretation";

function QuestionInput({ deckMeta, spread, onSubmit, onBack }) {
  const [q, setQ] = useState("");
  const c = deckMeta?.colors || {};

  return (
    <div style={{ maxWidth: 600, margin: "40px auto", textAlign: "center", padding: "0 20px" }}>
      <h2 style={{
        fontFamily: "'Georgia', serif", fontSize: 28, color: "#e8dcc8",
        fontWeight: 400, letterSpacing: "0.1em", margin: "0 0 8px",
      }}>
        你的问题
      </h2>
      <p style={{ color: "rgba(200,180,160,0.5)", fontSize: 14, margin: "0 0 20px" }}>
        {deckMeta?.name} · {spread?.name} — 将你心中的疑问告诉塔罗
      </p>
      <textarea
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="例如：我接下来的事业发展方向是什么？这段关系将如何发展？..."
        rows={3}
        style={{
          width: "100%", padding: "16px", borderRadius: 10,
          background: "rgba(0,0,0,0.3)",
          border: `1px solid ${c.accent}40`,
          color: "#e8dcc8", fontSize: 16,
          fontFamily: "inherit", resize: "vertical",
          outline: "none", lineHeight: 1.6,
        }}
        autoFocus
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey && q.trim()) {
            e.preventDefault();
            onSubmit(q.trim());
          }
        }}
      />
      <p style={{ color: "rgba(200,180,160,0.3)", fontSize: 11, marginTop: 8 }}>
        也可以直接点击开始，让塔罗感受你的能量
      </p>
      <div style={{ marginTop: 24, display: "flex", gap: 12, justifyContent: "center" }}>
        <button className="btn-secondary" onClick={onBack}
          style={{ borderColor: `${c.accent}30`, color: `${c.accent}80` }}>
          返回
        </button>
        <button className="btn-main" onClick={() => onSubmit(q.trim())}
          style={{ borderColor: c.accent, color: c.accent }}>
          开始洗牌
        </button>
      </div>
    </div>
  );
}

function DrawingPhase({ session }) {
  const {
    phase, deck, spread, shuffledCards, drawnCards,
    selectCardFromArc, deselectCard, PHASES,
  } = session;

  if (phase !== PHASES.DRAWING) return null;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", paddingTop: 20 }}>
      <h2 style={{
        fontFamily: "'Georgia', serif", fontSize: 24, color: "#e8dcc8",
        textAlign: "center", fontWeight: 400, letterSpacing: "0.1em", margin: "0 0 4px",
      }}>
        选择你的牌
      </h2>
      <p style={{
        textAlign: "center", color: "rgba(200,180,160,0.5)", fontSize: 14, margin: "0 0 20px",
      }}>
        凭直觉从圆弧中选出 {spread.cards} 张牌
      </p>
      <ArcSpread
        shuffledCards={shuffledCards}
        drawnCards={drawnCards}
        spreadCards={spread.cards}
        deckMeta={deck}
        onSelectCard={selectCardFromArc}
        onDeselectCard={deselectCard}
      />
    </div>
  );
}

function PlacingPhase({ session, themeColors, selectedCardId, setSelectedCardId }) {
  const {
    phase, deck, spread, placements, revealed, drawnCards, question,
    placeCard, removePlacement, revealAll, showInterpretation, PHASES,
  } = session;
  const filterClass = deck?.imageFilter ? "filter-deck" : "";
  const c = themeColors;

  if (![PHASES.PLACING, PHASES.REVEALED, PHASES.INTERPRETATION].includes(phase)) return null;

  const allPlaced = spread && Object.keys(placements).filter((k) => placements[k]).length === spread.cards;

  return (
    <div className="placing-page" style={{ maxWidth: 1000, margin: "0 auto" }}>
      <SpreadBoard
        spread={spread} placements={placements} revealed={revealed}
        deckMeta={deck} filterClass={filterClass}
        onDrop={placeCard} onRemovePlacement={removePlacement} phase={phase}
        selectedCardId={selectedCardId}
        onSlotClick={(posId) => {
          if (selectedCardId) {
            placeCard(selectedCardId, posId);
            setSelectedCardId(null);
          }
        }}
      />

      {phase === PHASES.PLACING && (
        <>
          <HandArea
            drawnCards={drawnCards} placements={placements} deckMeta={deck}
            selectedCardId={selectedCardId}
            onSelectCard={(id) => setSelectedCardId(id === selectedCardId ? null : id)}
          />
          <div style={{ textAlign: "center", marginTop: 24 }}>
            {allPlaced ? (
              <button className="btn-main" onClick={revealAll}
                style={{ borderColor: c.accent, color: c.accent }}>
                揭晓命运
              </button>
            ) : (
              <p style={{ color: "rgba(200,180,160,0.45)", fontSize: 14 }}>
                将手牌拖放至牌阵对应位置 · 已放置 {Object.keys(placements).filter((k) => placements[k]).length}/{spread.cards}
              </p>
            )}
          </div>
        </>
      )}

      {phase === PHASES.REVEALED && (
        <div style={{ textAlign: "center", marginTop: 32 }}>
          <div style={{
            display: "flex", justifyContent: "center", gap: 16, flexWrap: "wrap",
            marginBottom: 24,
          }}>
            {spread.positions.map((pos) => {
              const card = placements[pos.id];
              if (!card) return null;
              return (
                <div key={pos.id} style={{ textAlign: "center" }}>
                  <div style={{
                    padding: "6px 12px", borderRadius: 8,
                    background: card.isReversed ? "rgba(180,100,60,0.2)" : "rgba(200,160,100,0.1)",
                    border: `1px solid ${card.isReversed ? "rgba(180,100,60,0.4)" : "rgba(200,160,100,0.3)"}`,
                  }}>
                    <div style={{ fontSize: 12, color: c.accent, opacity: 0.7 }}>{pos.name}</div>
                    <div style={{ fontSize: 14, color: "#e8dcc8", fontWeight: 500 }}>
                      {card.nameZh}
                    </div>
                    <div style={{ fontSize: 11, color: card.isReversed ? "#d4a080" : "rgba(200,180,160,0.5)" }}>
                      {card.isReversed ? "逆位 ↑" : "正位 ↓"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <button className="btn-main" onClick={showInterpretation}
            style={{ borderColor: c.accent, color: c.accent }}>
            查看完整解读
          </button>
        </div>
      )}

      {phase === PHASES.INTERPRETATION && (
        <Interpretation
          question={question}
          spread={spread} placements={placements}
          deckMeta={deck} filterClass={filterClass}
        />
      )}
    </div>
  );
}

export default function App() {
  const session = useTarotSession();
  const [selectedCardId, setSelectedCardId] = useState(null);
  const {
    phase, deck, spread, question,
    enterApp, selectDeck, selectSpread, submitQuestion,
    startShuffle, stopShuffle,
    goBack, reset, PHASES,
  } = session;

  const c = deck?.colors || { bg: "#0a0a14", accent: "#c9a96e", text: "#e6e1d8" };
  const filterCSS = deck?.imageFilter
    ? `.filter-deck.card-face-img { filter: ${deck.imageFilter} !important; }` : "";

  return (
    <div style={{
      minHeight: "100vh", color: c.text,
      transition: "color 0.6s ease",
      fontFamily: "'Hiragino Sans GB','PingFang SC','Microsoft YaHei',sans-serif",
      position: "relative",
    }}>
      {filterCSS && <style>{filterCSS}</style>}

      {/* ====== ENTRY ====== */}
      {phase === PHASES.ENTRY && <EntryScreen onEnter={enterApp} />}

      {/* Deck-specific animated background */}
      {phase !== PHASES.ENTRY && deck && <DeckBackground deckMeta={deck} />}
      {phase !== PHASES.ENTRY && !deck && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
          background: "#0d1117", transition: "background 0.6s ease",
        }}>
          {/* Default ambient particles when no deck selected */}
          {Array.from({ length: 30 }, (_, i) => (
            <div key={`def-pt-${i}`} style={{
              position: "absolute",
              left: `${3 + (i * 37 + 13) % 94}%`,
              top: `${2 + (i * 23 + 7) % 95}%`,
              width: i % 6 === 0 ? 3.5 : i % 3 === 0 ? 2 : 1.5,
              height: i % 6 === 0 ? 3.5 : i % 3 === 0 ? 2 : 1.5,
              borderRadius: "50%",
              background: i % 3 === 0 ? "#c9a96e" : i % 4 === 0 ? "#4a6fa5" : "#e8dcc8",
              boxShadow: i % 6 === 0 ? "0 0 6px #c9a96e80" : "none",
              animation: `defaultFloat ${3 + i % 5}s ease-in-out ${i * 0.3}s infinite`,
              opacity: 0,
            }} />
          ))}
          {/* Slow drifting orbs */}
          {Array.from({ length: 3 }, (_, i) => (
            <div key={`def-orb-${i}`} style={{
              position: "absolute",
              left: `${20 + i * 28}%`,
              top: `${25 + i * 20}%`,
              width: 100 + i * 40,
              height: 100 + i * 40,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${i % 2 === 0 ? "#c9a96e10" : "#4a6fa50c"}, transparent 70%)`,
              animation: `defaultOrb ${12 + i * 6}s ease-in-out ${i * 2}s infinite`,
            }} />
          ))}
          <style>{`
            @keyframes defaultFloat {
              0%, 100% { opacity: 0.1; transform: translateY(0) scale(1); }
              50% { opacity: 0.6; transform: translateY(-16px) scale(1.5); }
            }
            @keyframes defaultOrb {
              0%, 100% { transform: translate(0, 0) scale(1); }
              25% { transform: translate(1.5vw, -2vh) scale(1.1); }
              50% { transform: translate(-1vw, -0.5vh) scale(0.95); }
              75% { transform: translate(-1.5vw, 1.5vh) scale(1.05); }
            }
          `}</style>
        </div>
      )}

      {/* ====== HEADER ====== */}
      {phase !== PHASES.ENTRY && (
        <header style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "10px 20px",
          borderBottom: `1px solid ${c.accent}18`,
          position: "sticky", top: 0, zIndex: 101,
          backdropFilter: "blur(10px)", background: `${c.bg}dd`,
        }}>
          <div style={{ width: 90 }}>
            {phase !== PHASES.DECK_SELECT && (
              <button onClick={goBack} style={{
                background: "transparent", border: `1px solid ${c.accent}35`,
                color: `${c.accent}aa`, padding: "4px 12px", borderRadius: 5,
                cursor: "pointer", fontSize: 12,
              }}>← 返回</button>
            )}
          </div>
          <div style={{ textAlign: "center" }}>
            <span style={{
              fontFamily: "'Georgia',serif", fontSize: 17, color: "#e8dcc8", letterSpacing: "0.08em",
            }}>RYAN's Tarot</span>
            {deck && <span style={{ color: c.accent, fontSize: 12 }}> · {deck.name}</span>}
            {spread && <span style={{ color: `${c.text}70`, fontSize: 12 }}> · {spread.name}</span>}
          </div>
          <div style={{ width: 90, textAlign: "right" }}>
            <button onClick={reset} style={{
              background: "transparent", border: `1px solid ${c.accent}25`,
              color: `${c.accent}80`, padding: "4px 12px", borderRadius: 5,
              cursor: "pointer", fontSize: 12,
            }}>重新开始</button>
          </div>
        </header>
      )}

      {/* ====== MAIN CONTENT ====== */}
      {phase !== PHASES.ENTRY && (
        <main style={{ padding: "20px 16px 40px", position: "relative", zIndex: 1 }}>
          {/* DECK SELECT */}
          {phase === PHASES.DECK_SELECT && <DeckSelector onSelect={selectDeck} />}

          {/* SPREAD SELECT */}
          {phase === PHASES.SPREAD_SELECT && deck && (
            <SpreadSelector deckMeta={deck} onSelect={selectSpread} onBack={goBack} />
          )}

          {/* QUESTION INPUT */}
          {phase === PHASES.QUESTION && deck && spread && (
            <QuestionInput deckMeta={deck} spread={spread}
              onSubmit={submitQuestion} onBack={goBack} />
          )}

          {/* SHUFFLING */}
          {phase === PHASES.SHUFFLING && deck && spread && (
            <ShuffleArea
              deckMeta={deck} spread={spread}
              isShuffling={session.isShuffling}
              onStartShuffle={startShuffle}
              onStopShuffle={stopShuffle}
              question={question}
            />
          )}

          {/* DRAWING (Arc spread) */}
          <DrawingPhase session={session} />

          {/* PLACING / REVEALED / INTERPRETATION */}
          <PlacingPhase session={session} themeColors={c}
            selectedCardId={selectedCardId} setSelectedCardId={setSelectedCardId} />
        </main>
      )}

      <style>{`
        .btn-main {
          padding: 14px 48px; border: 1px solid; background: transparent;
          font-size: 18px; font-family: 'Georgia',serif; border-radius: 8px;
          cursor: pointer; letter-spacing: 0.12em; transition: all 0.3s;
        }
        .btn-main:hover { background: currentColor; color: #0a0a14 !important; }
        .btn-secondary {
          padding: 12px 32px; border: 1px solid; background: transparent;
          font-size: 15px; font-family: inherit; border-radius: 8px;
          cursor: pointer; letter-spacing: 0.06em; transition: all 0.2s;
        }
        .btn-secondary:hover { background: rgba(255,255,255,0.05); }
        .selector-page {
          max-width: 1000px; margin: 0 auto; padding: 40px 20px; text-align: center;
        }
        .selector-title {
          font-family: 'Georgia', serif; font-size: 32px; color: #e8dcc8;
          margin: 0 0 8px; font-weight: 400; letter-spacing: 0.1em;
        }
        .selector-sub {
          color: rgba(200,180,160,0.6); font-size: 14px; margin: 0 0 40px;
        }
      `}</style>
    </div>
  );
}
