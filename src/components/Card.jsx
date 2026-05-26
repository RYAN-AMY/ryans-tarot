export default function Card({
  card,
  deckMeta,
  size = "medium",
  flipped = false,
  isReversed = false,
  onClick,
  onDragStart,
  filterClass = "",
}) {
  const sizes = {
    small: { width: 110, height: 188, fontSize: 11, nameSize: 13 },
    medium: { width: 155, height: 265, fontSize: 13, nameSize: 17 },
    large: { width: 200, height: 342, fontSize: 15, nameSize: 20 },
  };
  const s = sizes[size];

  const imagePath = deckMeta?.imageSource === "marseille"
    ? `/decks/marseille/${card.imageMarseille}`
    : `/decks/rider-waite/${card.imageRiderWaite}`;

  const cardBackPath = `/decks/backs/${deckMeta?.cardBack || "back-rider-waite.png"}`;

  const handleDragStart = (e) => {
    e.dataTransfer.setData("text/plain", card.id);
    e.dataTransfer.effectAllowed = "move";
    const ghost = document.createElement("img");
    ghost.src = cardBackPath;
    ghost.style.width = s.width + "px";
    ghost.style.height = s.height + "px";
    ghost.style.borderRadius = "10px";
    ghost.style.objectFit = "cover";
    document.body.appendChild(ghost);
    e.dataTransfer.setDragImage(ghost, s.width / 2, s.height / 2);
    setTimeout(() => document.body.removeChild(ghost), 0);
    if (onDragStart) onDragStart(card.id);
  };

  const borderColor = deckMeta?.colors?.cardBorder || "#c9a96e";

  return (
    <div
      className={`tarot-card ${deckMeta?.cssClass || ""} ${flipped ? "flipped" : ""}`}
      onClick={onClick}
      draggable={!flipped}
      onDragStart={handleDragStart}
      style={{
        width: s.width,
        height: s.height,
        cursor: onClick ? "pointer" : flipped ? "default" : "grab",
        flexShrink: 0,
        borderRadius: 10,
        overflow: "hidden",
        boxShadow: "0 4px 20px rgba(0,0,0,0.4), 0 1px 4px rgba(0,0,0,0.2)",
      }}
    >
      {/* Flip container — overflow hidden clips border bleed at edge-on angles */}
      <div
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          transition: "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
          transformStyle: "preserve-3d",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0)",
        }}
      >
        {/* Card Back */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            border: `2px solid ${borderColor}`,
            borderRadius: 10,
          }}
        >
          <img
            src={cardBackPath}
            alt="card back"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
            draggable={false}
          />
        </div>

        {/* Card Front */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            border: `2px solid ${isReversed ? "#c47a4a" : borderColor}`,
            borderRadius: 10,
            overflow: "hidden",
            background: isReversed ? "#faf5f0" : "#f8f6f2",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <img
            src={imagePath}
            alt={card.nameZh}
            className={`card-face-img ${filterClass}`}
            style={{
              width: "100%",
              height: "70%",
              objectFit: "cover",
              transform: isReversed ? "rotate(180deg)" : "none",
            }}
            draggable={false}
          />
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "4px 8px",
              background: isReversed ? "#faf5f0" : "#f8f6f2",
              color: isReversed ? "#8b4513" : "#2c2418",
              transform: isReversed ? "rotate(180deg)" : "none",
              borderTop: isReversed ? "1px solid rgba(180,100,60,0.3)" : "none",
            }}
          >
            <span style={{ fontSize: s.nameSize, fontWeight: 600, letterSpacing: 1 }}>
              {card.nameZh}
            </span>
            <span style={{ fontSize: s.fontSize - 1, color: isReversed ? "#a07050" : "#8b7355", marginTop: 1 }}>
              {card.nameEn}
            </span>
            {isReversed && (
              <span style={{
                fontSize: s.fontSize - 2, color: "#c47a4a", marginTop: 2,
                letterSpacing: 1, fontWeight: 500,
              }}>
                逆位 ↑
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
