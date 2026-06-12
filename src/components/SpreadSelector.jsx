import { useLang } from "../contexts/LangContext";
import { zh, en } from "../i18n/translations";
import { spreads, getRecommendedSpreads } from "../data/spreads";

export default function SpreadSelector({ deckMeta, onSelect, onBack, question, aiRecommendations, isLoadingRec }) {
  const { lang } = useLang();
  const t = lang === "zh" ? zh : en;
  const colors = deckMeta?.colors || {};

  // 本地打分（即时展示）
  const localRecs = getRecommendedSpreads(question);

  // AI 推荐到达后合并：优先用 AI 推荐的顺序，补上本地打分中 AI 没提到的
  let recommended;
  if (aiRecommendations && aiRecommendations.length >= 2) {
    const aiIds = new Set(aiRecommendations.map((r) => r.id));
    const recMap = new Map(aiRecommendations.map((r) => [r.id, r.reason]));
    // AI 推荐的排前面
    const aiSpreads = aiRecommendations
      .map((r) => spreads.find((s) => s.id === r.id))
      .filter(Boolean)
      .map((s) => ({ ...s, aiReason: recMap.get(s.id) }));
    // 本地打分中 AI 没提到的补后面（去重用）
    const extraSpreads = localRecs.filter((s) => !aiIds.has(s.id));
    recommended = [...aiSpreads, ...extraSpreads].slice(0, 6);
  } else {
    recommended = localRecs;
  }

  return (
    <div className="selector-page">
      <h2 className="selector-title">{t.selectSpread}</h2>
      <p className="selector-sub">
        {lang === "en" && deckMeta?.nameEn ? deckMeta.nameEn : deckMeta?.name}
        {question ? ` · ${t.spreadRecommended}` : ` · ${t.spreadSub}`}
      </p>

      {question && (
        <div style={{
          margin: "0 auto 32px", maxWidth: 500, padding: "12px 20px",
          borderRadius: 8, background: `${colors.accent}10`,
          border: `1px solid ${colors.accent}25`,
          color: "rgba(200,180,160,0.7)", fontSize: 14, lineHeight: 1.6,
        }}>
          {t.yourQuestionLabel}: <span style={{ color: "#e8dcc8" }}>"{question}"</span>
          {isLoadingRec && (
            <span style={{ marginLeft: 12, fontSize: 12, color: `${colors.accent}60` }}>
              {t.analyzingQuestion}
            </span>
          )}
          {aiRecommendations && !isLoadingRec && (
            <span style={{ marginLeft: 12, fontSize: 11, color: `${colors.accent}50` }}>
              ✦ {t.aiEnhanced}
            </span>
          )}
        </div>
      )}

      <div className="spread-grid">
        {recommended.map((spread) => (
          <div
            key={spread.id}
            className="spread-card"
            onClick={() => onSelect(spread)}
            style={{ borderColor: spread.aiReason ? `${colors.accent}60` : colors.accent }}
          >
            <div className="spread-preview" style={{ background: colors.bg }}>
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
                      background: spread.aiReason ? `${colors.accent}40` : `${colors.accent}30`,
                      border: `1px solid ${colors.accent}60`,
                    }}
                  />
                ))}
              </div>
            </div>
            <div className="spread-info">
              <h3 style={{ color: colors.accent, margin: "0 0 4px", fontSize: 18 }}>
                {lang === "en" && spread.nameEn ? spread.nameEn : spread.name}
              </h3>
              <span style={{ fontSize: 13, opacity: 0.6 }}>{spread.cards} {t.cards}</span>
              <p style={{ fontSize: 13, marginTop: 8, lineHeight: 1.5, opacity: 0.8 }}>
                {lang === "en" && spread.descriptionEn ? spread.descriptionEn : spread.description}
              </p>
              {spread.aiReason && (
                <div style={{
                  marginTop: 10, padding: "8px 12px",
                  borderRadius: 6,
                  background: `${colors.accent}12`,
                  border: `1px solid ${colors.accent}22`,
                  fontSize: 12, color: colors.accent,
                  lineHeight: 1.5,
                }}>
                  💡 {spread.aiReason}
                </div>
              )}
              <div style={{ marginTop: 10, fontSize: 11, opacity: 0.5 }}>
                {spread.positions.map((p) => p.name).join(" · ")}
              </div>
            </div>
          </div>
        ))}
      </div>

      {recommended.length === 0 && (
        <p style={{ color: "rgba(200,180,160,0.5)", marginTop: 40 }}>
          {t.noSpreadMatch}
        </p>
      )}

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
