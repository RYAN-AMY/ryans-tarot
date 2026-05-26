import { spreads } from "../data/spreads";

export default function SpreadSelector({ deckMeta, onSelect, onBack }) {
  const colors = deckMeta?.colors || {};
  return (
    <div className="selector-page">
      <h2 className="selector-title">选择牌阵</h2>
      <p className="selector-sub">{deckMeta?.name} · 牌阵决定了问题的探索深度与视角</p>
      <div className="spread-grid">
        {spreads.map((spread) => (
          <div
            key={spread.id}
            className="spread-card"
            onClick={() => onSelect(spread)}
            style={{ borderColor: colors.accent }}
          >
            <div className="spread-preview" style={{ background: colors.bg }}>
              {/* Mini layout preview */}
              <div style={{
                position: "relative",
                width: 120,
                height: 120,
                margin: "0 auto",
              }}>
                {spread.positions.map((pos) => (
                  <div
                    key={pos.id}
                    style={{
                      position: "absolute",
                      left: `${pos.x}%`,
                      top: `${pos.y}%`,
                      transform: "translate(-50%, -50%)",
                      width: spread.cards > 8 ? 16 : spread.cards > 5 ? 20 : 24,
                      height: spread.cards > 8 ? 22 : spread.cards > 5 ? 28 : 33,
                      borderRadius: 3,
                      background: `${colors.accent}30`,
                      border: `1px solid ${colors.accent}60`,
                    }}
                  />
                ))}
              </div>
            </div>
            <div className="spread-info">
              <h3 style={{ color: colors.accent, margin: "0 0 4px", fontSize: 18 }}>
                {spread.name}
              </h3>
              <span style={{ fontSize: 13, opacity: 0.6 }}>{spread.cards} 张牌</span>
              <p style={{ fontSize: 13, marginTop: 8, lineHeight: 1.5, opacity: 0.8 }}>
                {spread.description}
              </p>
              <div style={{ marginTop: 10, fontSize: 11, opacity: 0.5 }}>
                {spread.positions.map((p) => p.name).join(" · ")}
              </div>
            </div>
          </div>
        ))}
      </div>
      <style>{`
        .spread-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
          justify-items: center;
        }
        .spread-card {
          padding: 20px;
          border-radius: 14px;
          border: 1px solid;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
          width: 100%;
          max-width: 350px;
          text-align: center;
        }
        .spread-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 40px rgba(0,0,0,0.3);
        }
        .spread-preview {
          width: 120px;
          height: 120px;
          border-radius: 8px;
          margin: 0 auto 16px;
          padding: 8px;
          box-sizing: content-box;
        }
        .spread-info {
          color: #e8dcc8;
        }
      `}</style>
    </div>
  );
}
