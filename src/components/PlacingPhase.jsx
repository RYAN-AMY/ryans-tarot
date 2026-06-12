import { useLang } from "../contexts/LangContext";
import { zh, en } from "../i18n/translations";
import SpreadBoard from "./SpreadBoard";
import HandArea from "./HandArea";
import Interpretation from "./Interpretation";

export default function PlacingPhase({
  session, themeColors, selectedCardId, setSelectedCardId,
  prefetchedText, isPrefetching, prefetchError, startPrefetch,
  followUpHistory, onUpdateFollowUpHistory, user,
}) {
  const {
    phase, deck, spread, placements, revealed, drawnCards, question,
    placeCard, removePlacement, revealAll, showInterpretation, PHASES,
  } = session;
  const { lang } = useLang();
  const t = lang === "zh" ? zh : en;
  const filterClass = deck?.imageFilter ? "filter-deck" : "";
  const c = themeColors;

  if (![PHASES.PLACING, PHASES.REVEALED, PHASES.INTERPRETATION].includes(phase)) return null;

  const placedCount = spread ? Object.values(placements).filter(Boolean).length : 0;
  const allPlaced = spread && placedCount === spread.cards;

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
              <button className="btn-main" onClick={() => { revealAll(); startPrefetch(); }}
                style={{ borderColor: c.accent, color: c.accent }}>
                {t.reveal}
              </button>
            ) : (
              <p style={{ color: "rgba(200,180,160,0.45)", fontSize: 14 }}>
                {t.placeCount(placedCount, spread.cards)}
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
                      {card.isReversed ? t.reversed : t.upright}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <button className="btn-main" onClick={showInterpretation}
            style={{ borderColor: c.accent, color: c.accent }}>
            {t.viewReading}
          </button>
        </div>
      )}

      {phase === PHASES.INTERPRETATION && (
        <Interpretation
          question={question}
          spread={spread} placements={placements}
          deckMeta={deck} filterClass={filterClass}
          prefetchedText={prefetchedText}
          isPrefetching={isPrefetching}
          prefetchError={prefetchError}
          onNeedFetch={startPrefetch}
          followUpHistory={followUpHistory}
          onUpdateFollowUpHistory={onUpdateFollowUpHistory}
          user={user}
        />
      )}
    </div>
  );
}
