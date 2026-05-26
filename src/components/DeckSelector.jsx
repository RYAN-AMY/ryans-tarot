import { decks } from "../data/deckMeta";

export default function DeckSelector({ onSelect, onBack }) {
  return (
    <div className="selector-page">
      <h2 className="selector-title">选择你的牌组</h2>
      <p className="selector-sub">每套牌组有独特的视觉风格与解读视角</p>
      <div className="deck-grid">
        {decks.map((deck) => (
          <div
            key={deck.id}
            className="deck-card"
            onClick={() => onSelect(deck)}
            style={{
              borderColor: deck.colors.accent,
              background: deck.colors.bg,
              color: deck.colors.text,
            }}
          >
            <div className="deck-card-preview">
              <img
                src={`/decks/backs/${deck.cardBack}`}
                alt={deck.name}
                style={{ width: 110, height: 188, objectFit: "cover", borderRadius: 6 }}
              />
            </div>
            <div className="deck-card-info">
              <h3 style={{ color: deck.colors.accent, margin: "0 0 4px", fontSize: 18 }}>
                {deck.name}
              </h3>
              <p style={{ fontSize: 12, opacity: 0.7, margin: 0 }}>{deck.nameEn}</p>
              <p style={{ fontSize: 12, marginTop: 8, lineHeight: 1.5, opacity: 0.85 }}>
                {deck.description}
              </p>
              <div style={{ fontSize: 11, marginTop: 8, opacity: 0.5 }}>
                {deck.era} · {deck.creator}
              </div>
              <div
                style={{
                  marginTop: 8,
                  display: "inline-block",
                  padding: "2px 8px",
                  borderRadius: 4,
                  background: deck.colors.accent,
                  color: deck.colors.bg,
                  fontSize: 11,
                }}
              >
                {deck.interpretationStyle}
              </div>
            </div>
          </div>
        ))}
      </div>
      <style>{`
        .deck-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(420px, 1fr));
          gap: 24px;
          justify-items: center;
        }
        .deck-card {
          display: flex;
          gap: 20px;
          padding: 24px;
          border-radius: 16px;
          border: 1px solid;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
          text-align: left;
          width: 100%;
          max-width: 480px;
        }
        .deck-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 40px rgba(0,0,0,0.3);
        }
        .deck-card-preview {
          flex-shrink: 0;
        }
        .deck-card-info {
          flex: 1;
          min-width: 0;
        }
        @media (max-width: 500px) {
          .deck-grid {
            grid-template-columns: 1fr;
          }
          .deck-card {
            flex-direction: column;
            align-items: center;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
}
