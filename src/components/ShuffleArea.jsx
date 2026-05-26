import { useState, useEffect, useRef } from "react";

export default function ShuffleArea({
  deckMeta,
  spread,
  isShuffling,
  onStartShuffle,
  onStopShuffle,
  question,
}) {
  const [showCards, setShowCards] = useState([]);
  const [shuffleCount, setShuffleCount] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isShuffling) {
      intervalRef.current = setInterval(() => {
        setShowCards(
          Array.from({ length: 7 }, (_, i) => ({
            id: Math.random().toString(36),
            x: 42 + Math.random() * 16,
            y: 38 + Math.random() * 24,
            rot: -15 + Math.random() * 30,
          }))
        );
        setShuffleCount((c) => c + 1);
      }, 130);
    } else {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => clearInterval(intervalRef.current);
  }, [isShuffling]);

  const c = deckMeta?.colors || {};
  const cardBack = `/decks/backs/${deckMeta?.cardBack || "back-rider-waite.png"}`;

  return (
    <div className="shuffle-page" style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
      {/* Question recall */}
      {question && (
        <div style={{
          marginBottom: 20, padding: "12px 20px",
          background: "rgba(200,160,100,0.06)", borderRadius: 10,
          border: `1px solid ${c.accent}20`,
        }}>
          <span style={{ color: "rgba(200,180,160,0.4)", fontSize: 11, letterSpacing: "0.1em" }}>
            你的问题
          </span>
          <p style={{ color: "#c9a96e", fontSize: 16, margin: "4px 0 0", fontStyle: "italic" }}>
            "{question}"
          </p>
        </div>
      )}

      <h2 style={{
        fontFamily: "'Georgia',serif", fontSize: 28, color: "#e8dcc8",
        fontWeight: 400, letterSpacing: "0.1em", margin: "0 0 4px",
      }}>
        洗牌
      </h2>
      <p style={{ color: "rgba(200,180,160,0.5)", fontSize: 14, margin: "0 0 6px" }}>
        {spread?.name} · {spread?.cards} 张牌
      </p>

      {/* Shuffle animation / deck display */}
      <div style={{ position: "relative", width: "100%", height: 420, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {isShuffling ? (
          <>
            {showCards.map((card, i) => (
              <div
                key={card.id}
                style={{
                  position: "absolute",
                  left: `${card.x}%`, top: `${card.y}%`,
                  transform: `translate(-50%, -50%) rotate(${card.rot}deg)`,
                  zIndex: i,
                  transition: "left 0.11s, top 0.11s, transform 0.11s",
                }}
              >
                <img src={cardBack} alt=""
                  style={{ width: 140, height: 239, objectFit: "cover", borderRadius: 8 }}
                  draggable={false} />
              </div>
            ))}
            <p style={{
              position: "absolute", bottom: 20, width: "100%", textAlign: "center",
              color: "rgba(200,180,160,0.4)", fontSize: 13,
            }}>
              正在洗牌 · 包含正逆位随机...
            </p>
          </>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ position: "relative", marginBottom: 16 }}>
              {/* Stacked deck */}
              {[0, 1, 2].map((i) => (
                <img key={i} src={cardBack} alt=""
                  style={{
                    width: 180, height: 308, objectFit: "cover", borderRadius: 10,
                    position: i === 0 ? "relative" : "absolute",
                    top: i * 3, left: i * 2,
                    border: `2px solid ${c.accent}40`,
                  }} draggable={false} />
              ))}
            </div>
            <p style={{ color: "rgba(200,180,160,0.5)", fontSize: 14 }}>
              牌已就绪 · 集中在你的问题上，用心感受
            </p>
          </div>
        )}
      </div>

      {/* Action button */}
      <div style={{ marginTop: 24 }}>
        {isShuffling ? (
          <button className="btn-main" onClick={onStopShuffle}
            style={{ borderColor: c.accent, color: c.accent }}>
            停止洗牌
          </button>
        ) : (
          <button className="btn-main" onClick={onStartShuffle}
            style={{ borderColor: c.accent, color: c.accent }}>
            开始洗牌
          </button>
        )}
      </div>

    </div>
  );
}
