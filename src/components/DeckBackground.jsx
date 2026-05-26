import { useMemo, useState, useEffect } from "react";

/* Floating particle — deck-agnostic, always active */
function Particles({ accent, accent2, count = 30 }) {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    setParticles(
      Array.from({ length: count }, (_, i) => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        duration: 6 + Math.random() * 14,
        delay: Math.random() * 8,
        driftX: (Math.random() - 0.5) * 60,
        driftY: -20 - Math.random() * 60,
        opacity: 0.15 + Math.random() * 0.35,
        color: i % 3 === 0 ? accent : i % 3 === 1 ? accent2 : "#e8dcc8",
      }))
    );
  }, [count, accent, accent2]);

  return (
    <>
      {particles.map((p, i) => (
        <div key={`fp-${i}`} style={{
          position: "absolute",
          left: `${p.x}%`, top: `${p.y}%`,
          width: p.size, height: p.size,
          borderRadius: "50%",
          background: p.color,
          boxShadow: p.size > 2 ? `0 0 ${p.size * 4}px ${p.color}80` : "none",
          animation: `particleFloat ${p.duration}s ${p.delay}s ease-in-out infinite`,
          opacity: 0,
          "--op": p.opacity,
          "--dx": `${p.driftX}px`,
          "--dy": `${p.driftY}px`,
        }} />
      ))}
      <style>{`
        @keyframes particleFloat {
          0%   { opacity: 0; transform: translate(0, 0); }
          20%  { opacity: var(--op, 0.3); }
          80%  { opacity: var(--op, 0.3); }
          100% { opacity: 0; transform: translate(var(--dx, 20px), var(--dy, -60px)); }
        }
      `}</style>
    </>
  );
}

/* Slow drifting orbs — ambient depth */
function AmbientOrbs({ accent, accent2 }) {
  const [orbs, setOrbs] = useState([]);
  useEffect(() => {
    setOrbs(
      Array.from({ length: 5 }, (_, i) => ({
        x: 20 + Math.random() * 60,
        y: 20 + Math.random() * 60,
        size: 80 + Math.random() * 160,
        duration: 12 + Math.random() * 18,
        delay: i * 3.5,
        color: i % 2 === 0 ? accent : accent2,
      }))
    );
  }, [accent, accent2]);

  return (
    <>
      {orbs.map((o, i) => (
        <div key={`orb-${i}`} style={{
          position: "absolute",
          left: `${o.x}%`, top: `${o.y}%`,
          width: o.size, height: o.size,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${o.color}14, transparent 70%)`,
          animation: `orbFloat ${o.duration}s ${o.delay}s ease-in-out infinite`,
          opacity: 0.5,
        }} />
      ))}
      <style>{`
        @keyframes orbFloat {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25%  { transform: translate(2vw, -3vh) scale(1.15); }
          50%  { transform: translate(-1vw, -1vh) scale(0.9); }
          75%  { transform: translate(-2vw, 2vh) scale(1.08); }
        }
      `}</style>
    </>
  );
}

/**
 * Renders deck-specific animated background patterns.
 * Each deck gets a unique visual atmosphere via CSS + JS animations.
 */
export default function DeckBackground({ deckMeta }) {
  const deckId = deckMeta?.id || "rider-waite";
  const c = deckMeta?.colors || {};

  const styleTag = useMemo(() => {
    const accent = c.accent || "#c9a96e";
    const accent2 = c.accent2 || "#4a6fa5";

    const patterns = {
      "rider-waite": `
        @keyframes rwsStarFloat {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.25; }
          50% { transform: translateY(-22px) scale(1.4); opacity: 0.75; }
        }
        @keyframes rwsTwinkleFast {
          0%, 100% { opacity: 0.15; transform: scale(0.8); }
          50% { opacity: 0.8; transform: scale(1.5); }
        }
        @keyframes rwsLinePulse {
          0%, 100% { opacity: 0.04; }
          50% { opacity: 0.18; }
        }
        @keyframes rwsNebulaDrift {
          0% { transform: translate(0, 0); }
          100% { transform: translate(var(--nx), var(--ny)); }
        }
      `,
      marseille: `
        @keyframes marseilleGeomRotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes marseilleLineFade {
          0%, 100% { opacity: 0.03; }
          50% { opacity: 0.15; }
        }
        @keyframes marseilleCrossPulse {
          0%, 100% { transform: scale(1); opacity: 0.06; }
          50% { transform: scale(1.18); opacity: 0.2; }
        }
        @keyframes marseilleFloatUp {
          0% { transform: translateY(0); opacity: 0.06; }
          100% { transform: translateY(-40px); opacity: 0.01; }
        }
      `,
      thoth: `
        @keyframes thothGeomFloat {
          0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.15; }
          33% { transform: translateY(-28px) rotate(4deg); opacity: 0.55; }
          66% { transform: translateY(-10px) rotate(-4deg); opacity: 0.3; }
        }
        @keyframes thothParticleDrift {
          0% { transform: translate(0, 0); opacity: 0; }
          20% { opacity: 0.6; }
          80% { opacity: 0.6; }
          100% { transform: translate(var(--tx), var(--ty)); opacity: 0; }
        }
        @keyframes thothTreePulse {
          0%, 100% { opacity: 0.06; transform: scale(1); }
          50% { opacity: 0.18; transform: scale(1.06); }
        }
        @keyframes thothOrbitSpin {
          0% { transform: rotate(0deg) translateX(60px) rotate(0deg); }
          100% { transform: rotate(360deg) translateX(60px) rotate(-360deg); }
        }
      `,
      "modern-witch": `
        @keyframes mwGlowFloat {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.25; }
          50% { transform: translateY(-18px) scale(1.6); opacity: 0.75; }
        }
        @keyframes mwMoonPhase {
          0% { box-shadow: inset 6px -3px 0 0 currentColor; }
          25% { box-shadow: inset 3px -6px 0 0 currentColor; }
          50% { box-shadow: inset 0px 0px 0 0 currentColor; }
          75% { box-shadow: inset -3px -6px 0 0 currentColor; }
          100% { box-shadow: inset -6px -3px 0 0 currentColor; }
        }
        @keyframes mwShootingStar {
          0% { transform: translate(0, 0); opacity: 0; }
          5% { opacity: 0.8; }
          15% { opacity: 0; transform: translate(-120px, 80px); }
          100% { opacity: 0; transform: translate(-120px, 80px); }
        }
      `,
      "wild-unknown": `
        @keyframes wuLineFlow {
          0% { transform: translateX(-12%) scaleY(1); }
          50% { transform: translateX(0%) scaleY(1.8); }
          100% { transform: translateX(12%) scaleY(1); }
        }
        @keyframes wuEyeBlink {
          0%, 95%, 100% { transform: scaleY(1); opacity: 0.1; }
          97% { transform: scaleY(0.05); opacity: 0.03; }
        }
        @keyframes wuDriftSlow {
          0% { transform: translate(0, 0); }
          100% { transform: translate(var(--dx), var(--dy)); }
        }
        @keyframes wuLineDash {
          0% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: 100; }
        }
      `,
      "light-seers": `
        @keyframes lsRayPulse {
          0%, 100% { opacity: 0.03; transform: scaleY(1); }
          50% { opacity: 0.12; transform: scaleY(1.2); }
        }
        @keyframes lsSparkleFloat {
          0%, 100% { transform: translateY(0) scale(0.7); opacity: 0; }
          30% { opacity: 0.8; }
          70% { opacity: 0.8; }
          100% { transform: translateY(-60px) scale(1.6); opacity: 0; }
        }
        @keyframes lsAuraPulse {
          0%, 100% { opacity: 0.05; transform: scale(0.9); }
          50% { opacity: 0.15; transform: scale(1.08); }
        }
        @keyframes lsRaySweep {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `,
    };

    return patterns[deckId] || patterns["rider-waite"];
  }, [deckId, c]);

  const renderBackground = () => {
    const accent = c.accent || "#c9a96e";
    const accent2 = c.accent2 || "#4a6fa5";

    switch (deckId) {
      case "rider-waite":
        return (
          <>
            {/* Nebula blobs */}
            {Array.from({ length: 6 }, (_, i) => (
              <div key={`neb-${i}`} style={{
                position: "absolute",
                left: `${10 + i * 16}%`,
                top: `${5 + (i * 27) % 90}%`,
                width: 140 + i * 30,
                height: 100 + i * 20,
                borderRadius: "50%",
                background: `radial-gradient(ellipse, ${accent}08, ${accent2}04, transparent)`,
                filter: "blur(20px)",
                "--nx": `${(i % 2 === 0 ? 30 : -30)}px`,
                "--ny": `${(i % 3 - 1) * 20}px`,
                animation: `rwsNebulaDrift ${12 + i * 4}s ease-in-out infinite alternate`,
              }} />
            ))}
            {/* More stars */}
            {Array.from({ length: 50 }, (_, i) => (
              <div key={`star-${i}`} style={{
                position: "absolute",
                left: `${3 + (i * 37 + 13) % 94}%`,
                top: `${2 + (i * 23 + 7) % 95}%`,
                width: i % 7 === 0 ? 5 : i % 4 === 0 ? 3 : 2,
                height: i % 7 === 0 ? 5 : i % 4 === 0 ? 3 : 2,
                borderRadius: "50%",
                background: i % 3 === 0 ? accent : i % 5 === 0 ? accent2 : "#e8dcc8",
                boxShadow: i % 7 === 0 ? `0 0 8px ${accent}` : i % 5 === 0 ? `0 0 4px ${accent2}80` : "none",
                animation: i % 3 === 0
                  ? `rwsStarFloat ${3 + i % 5}s ease-in-out ${i * 0.3}s infinite`
                  : `rwsTwinkleFast ${1.5 + i % 3}s ease-in-out ${i * 0.2}s infinite`,
              }} />
            ))}
            {/* Enhanced constellation network */}
            <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.15 }}>
              {[
                "M6%,12% L20%,32%", "M20%,32% L16%,58%", "M16%,58% L35%,48%",
                "M65%,8% L80%,30%", "M80%,30% L73%,52%", "M73%,52% L87%,67%",
                "M38%,78% L58%,58%", "M58%,58% L62%,82%", "M87%,18% L94%,38%",
                "M10%,70% L25%,62%", "M25%,62% L32%,80%",
                "M70%,75% L82%,60%", "M82%,60% L90%,72%",
              ].map((d, i) => (
                <line key={i} x1="0" y1="0" x2="0" y2="0" stroke={i % 3 === 0 ? accent : accent2}
                  strokeWidth={i % 4 === 0 ? "0.8" : "0.4"} strokeDasharray={i % 3 === 0 ? "4,6" : "2,8"}
                  style={{ animation: `rwsLinePulse ${3 + i % 4}s ease-in-out ${i * 0.5}s infinite` }}
                  {...(() => {
                    const [p1, p2] = d.split(" L");
                    const [x1, y1] = p1.slice(1).split(",").map(s => parseFloat(s));
                    const [x2, y2] = p2.split(",").map(s => parseFloat(s));
                    return { x1: `${x1}%`, y1: `${y1}%`, x2: `${x2}%`, y2: `${y2}%` };
                  })()}
                />
              ))}
              {/* Constellation dots */}
              {Array.from({ length: 20 }, (_, i) => (
                <circle key={`cdot-${i}`}
                  cx={`${5 + (i * 47) % 92}%`}
                  cy={`${3 + (i * 41) % 94}%`}
                  r={i % 4 === 0 ? 2.5 : 1}
                  fill={i % 3 === 0 ? accent : accent2}
                  opacity={0.5 + (i % 3) * 0.2}
                  style={{ animation: `rwsTwinkleFast ${2 + i % 3}s ease-in-out ${i * 0.4}s infinite` }}
                />
              ))}
            </svg>
          </>
        );

      case "marseille":
        return (
          <>
            {/* Fine grid */}
            <div style={{
              position: "absolute", inset: 0,
              backgroundImage: `
                linear-gradient(${accent}06 1px, transparent 1px),
                linear-gradient(90deg, ${accent}06 1px, transparent 1px)
              `,
              backgroundSize: "56px 56px",
            }} />
            {/* Rotating geometric rings — more elaborate */}
            {[0, 1, 2, 3].map((i) => (
              <div key={`ring-${i}`} style={{
                position: "absolute",
                left: `${20 + i * 20}%`,
                top: `${15 + i * 22}%`,
                width: 140 + i * 50,
                height: 140 + i * 50,
                borderRadius: "50%",
                border: `${i === 0 ? 3 : 1.5}px solid ${i % 2 === 0 ? accent : accent2}15`,
                animation: `marseilleGeomRotate ${25 + i * 18}s linear ${i % 2 === 0 ? "infinite" : "infinite reverse"}`,
              }} />
            ))}
            {/* Cross patterns — more and animated */}
            {Array.from({ length: 10 }, (_, i) => (
              <div key={`cross-${i}`} style={{
                position: "absolute",
                left: `${8 + (i * 30) % 85}%`,
                top: `${6 + (i * 40) % 88}%`,
                width: 20, height: 20,
                animation: `marseilleCrossPulse ${3 + i % 4}s ease-in-out ${i * 0.8}s infinite`,
              }}>
                <div style={{
                  position: "absolute", left: 9, top: 0, width: 2, height: 20,
                  background: i % 2 === 0 ? accent : accent2, opacity: 0.18,
                }} />
                <div style={{
                  position: "absolute", left: 0, top: 9, width: 20, height: 2,
                  background: i % 2 === 0 ? accent2 : accent, opacity: 0.18,
                }} />
              </div>
            ))}
            {/* Rising geometric shapes */}
            {Array.from({ length: 8 }, (_, i) => (
              <div key={`geomrise-${i}`} style={{
                position: "absolute",
                left: `${8 + i * 12}%`,
                bottom: "-20px",
                width: 12,
                height: 12,
                background: i % 3 === 0 ? `${accent}14` : i % 3 === 1 ? `${accent2}12` : "transparent",
                clipPath: i % 3 === 0 ? "polygon(50% 0%, 0% 100%, 100% 100%)" : "circle(50% at 50% 50%)",
                animation: `marseilleFloatUp ${8 + i * 2}s linear ${i * 1.5}s infinite`,
              }} />
            ))}
          </>
        );

      case "thoth":
        return (
          <>
            {/* Tree of Life glow — larger and pulsing */}
            <div style={{
              position: "absolute", left: "50%", top: "12%",
              width: 320, height: 420,
              transform: "translateX(-50%)",
              background: `radial-gradient(ellipse at center, ${accent}12 0%, ${accent2}06 40%, transparent 70%)`,
              animation: "thothTreePulse 6s ease-in-out infinite",
            }} />
            {/* Floating geometric shapes — more varied */}
            {Array.from({ length: 20 }, (_, i) => {
              const shapes = [
                "polygon(50% 0%, 0% 100%, 100% 100%)",
                "polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)",
                "circle(50% at 50% 50%)",
                "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)",
              ];
              return (
                <div key={`geom-${i}`} style={{
                  position: "absolute",
                  left: `${4 + (i * 49) % 93}%`,
                  top: `${2 + (i * 57) % 95}%`,
                  width: 16 + (i % 4) * 10,
                  height: 16 + (i % 4) * 10,
                  background: i % 3 === 0 ? `${accent}16` : i % 3 === 1 ? `${accent2}14` : `${accent}0a`,
                  clipPath: shapes[i % 4],
                  animation: `thothGeomFloat ${4 + i % 5}s ease-in-out ${i * 0.6}s infinite`,
                }} />
              );
            })}
            {/* Drifting particles */}
            {Array.from({ length: 25 }, (_, i) => (
              <div key={`particle-${i}`} style={{
                position: "absolute",
                left: `${8 + i * 4}%`,
                top: `${5 + i * 4}%`,
                width: i % 5 === 0 ? 3 : 1.5,
                height: i % 5 === 0 ? 3 : 1.5,
                borderRadius: "50%",
                background: i % 3 === 0 ? accent : accent2,
                boxShadow: i % 5 === 0 ? `0 0 6px ${accent}` : "none",
                "--tx": `${(i % 5 - 2) * 50}px`,
                "--ty": `${-25 - i * 6}px`,
                animation: `thothParticleDrift ${4 + i % 4}s ease-in-out ${i * 0.5}s infinite`,
              }} />
            ))}
            {/* Orbiting elements */}
            {Array.from({ length: 3 }, (_, i) => (
              <div key={`orbit-${i}`} style={{
                position: "absolute",
                left: `${30 + i * 20}%`,
                top: `${25 + i * 20}%`,
              }}>
                <div style={{
                  width: 6, height: 6,
                  borderRadius: "50%",
                  background: accent,
                  animation: `thothOrbitSpin ${6 + i * 2}s linear infinite`,
                }} />
              </div>
            ))}
          </>
        );

      case "modern-witch":
        return (
          <>
            {/* Warm glowing orbs */}
            {Array.from({ length: 18 }, (_, i) => (
              <div key={`glow-${i}`} style={{
                position: "absolute",
                left: `${4 + (i * 29 + 11) % 93}%`,
                top: `${2 + (i * 37 + 5) % 95}%`,
                width: i % 4 === 0 ? 18 : i % 3 === 0 ? 12 : 8,
                height: i % 4 === 0 ? 18 : i % 3 === 0 ? 12 : 8,
                borderRadius: "50%",
                background: `radial-gradient(circle, ${accent}55, transparent)`,
                boxShadow: i % 4 === 0 ? `0 0 16px ${accent}40` : "none",
                animation: `mwGlowFloat ${3 + i % 5}s ease-in-out ${i * 0.4}s infinite`,
              }} />
            ))}
            {/* Moon phases — more detailed */}
            {Array.from({ length: 7 }, (_, i) => (
              <div key={`moon-${i}`} style={{
                position: "absolute",
                left: `${10 + i * 13.5}%`,
                top: `${72 + (i % 3) * 10}%`,
                width: 22, height: 22,
                borderRadius: "50%",
                border: `2px solid ${accent}25`,
                color: `${accent}30`,
                animation: `mwMoonPhase ${5 + i}s ease-in-out infinite`,
              }} />
            ))}
            {/* Shooting stars */}
            {Array.from({ length: 4 }, (_, i) => (
              <div key={`shoot-${i}`} style={{
                position: "absolute",
                left: `${70 + i * 8}%`,
                top: `${10 + i * 18}%`,
                width: 40, height: 2,
                background: `linear-gradient(90deg, transparent, ${accent}60, ${accent}cc, transparent)`,
                borderRadius: 1,
                animation: `mwShootingStar ${5 + i * 3}s ${i * 2.5}s ease-in infinite`,
                opacity: 0,
              }} />
            ))}
            {/* Warm light gradient overlay */}
            <div style={{
              position: "absolute", left: "50%", top: "0%",
              width: "70%", height: "100%",
              transform: "translateX(-50%)",
              background: `linear-gradient(180deg, ${accent}08 0%, transparent 50%, ${accent2}04 100%)`,
            }} />
          </>
        );

      case "wild-unknown":
        return (
          <>
            {/* Flowing organic lines — denser */}
            {Array.from({ length: 15 }, (_, i) => (
              <div key={`flow-${i}`} style={{
                position: "absolute",
                left: `${2 + i * 6.5}%`,
                top: `${5 + (i * 31) % 88}%`,
                width: `${50 + (i % 5) * 30}px`,
                height: i % 3 === 0 ? "2px" : "1px",
                background: `linear-gradient(90deg, transparent, ${accent}18, transparent)`,
                transform: `rotate(${-12 + i * 14}deg)`,
                animation: `wuLineFlow ${5 + i % 4}s ease-in-out ${i * 0.5}s infinite`,
              }} />
            ))}
            {/* Eye-like shapes — more organic */}
            {[0, 1, 2].map((i) => (
              <div key={`eye-${i}`} style={{
                position: "absolute",
                left: `${22 + i * 28}%`,
                top: `${15 + i * 28}%`,
                width: 42, height: 22,
                borderRadius: "50%",
                border: `1.5px solid ${accent}0d`,
                animation: `wuEyeBlink ${6 + i}s ease-in-out ${i * 2}s infinite`,
              }}>
                <div style={{
                  position: "absolute", left: "50%", top: "50%",
                  transform: "translate(-50%, -50%)",
                  width: 10, height: 10, borderRadius: "50%",
                  background: `${accent}16`,
                }} />
              </div>
            ))}
            {/* Slow drifting shapes */}
            {Array.from({ length: 14 }, (_, i) => (
              <div key={`drift-${i}`} style={{
                position: "absolute",
                left: `${4 + i * 7}%`,
                top: `${10 + (i * 26) % 82}%`,
                width: i % 4 === 0 ? 4 : 2.5,
                height: i % 4 === 0 ? 4 : 2.5,
                borderRadius: "50%",
                background: accent,
                opacity: 0.08,
                "--dx": `${(i % 3 - 1) * 20}px`,
                "--dy": `${(i % 2) * 25}px`,
                animation: `wuDriftSlow ${7 + i % 5}s ease-in-out infinite alternate`,
              }} />
            ))}
            {/* Animated dashed border */}
            <svg style={{
              position: "absolute", inset: 0, width: "100%", height: "100%",
              opacity: 0.06,
            }}>
              <rect x="70" y="70" width="860" height="860"
                rx="30" ry="30" fill="none" stroke={accent} strokeWidth="1"
                strokeDasharray="8,12"
                style={{ animation: "wuLineDash 20s linear infinite" }}
                transform="scale(0.15)"
              />
            </svg>
          </>
        );

      case "light-seers":
        return (
          <>
            {/* Light rays from top — wider */}
            {Array.from({ length: 12 }, (_, i) => (
              <div key={`ray-${i}`} style={{
                position: "absolute",
                left: `${3 + i * 8.5}%`,
                top: 0,
                width: "3%",
                height: `${55 + i * 4}%`,
                background: `linear-gradient(180deg, ${accent}16, ${accent2}06, transparent)`,
                transformOrigin: "top center",
                transform: `rotate(${-5 + i}deg)`,
                animation: `lsRayPulse ${3 + i % 4}s ease-in-out ${i * 0.4}s infinite`,
              }} />
            ))}
            {/* Sweeping light bar */}
            <div style={{
              position: "absolute",
              left: "50%", top: "50%",
              width: 2, height: "45%",
              background: `linear-gradient(180deg, transparent, ${accent}10, ${accent2}08, transparent)`,
              transformOrigin: "center bottom",
              animation: "lsRaySweep 25s linear infinite",
            }} />
            {/* Floating sparkles */}
            {Array.from({ length: 35 }, (_, i) => (
              <div key={`spark-${i}`} style={{
                position: "absolute",
                left: `${2 + (i * 41) % 96}%`,
                top: `${92 - (i * 17) % 88}%`,
                width: i % 6 === 0 ? 5 : i % 4 === 0 ? 3 : 2,
                height: i % 6 === 0 ? 5 : i % 4 === 0 ? 3 : 2,
                borderRadius: "50%",
                background: i % 3 === 0 ? accent : i % 3 === 1 ? accent2 : "#faf0ff",
                boxShadow: i % 6 === 0 ? `0 0 10px ${accent}` : i % 4 === 0 ? `0 0 6px ${accent2}` : "none",
                animation: `lsSparkleFloat ${2.5 + i % 5}s ease-in-out ${i * 0.35}s infinite`,
              }} />
            ))}
            {/* Central aura */}
            <div style={{
              position: "absolute", left: "50%", top: "35%",
              width: 360, height: 360,
              transform: "translate(-50%, -50%)",
              borderRadius: "50%",
              background: `radial-gradient(circle, ${accent}0e 0%, ${accent2}08 35%, transparent 70%)`,
              animation: "lsAuraPulse 7s ease-in-out infinite",
            }} />
            {/* Prism sparkles */}
            {Array.from({ length: 10 }, (_, i) => (
              <div key={`prism-${i}`} style={{
                position: "absolute",
                left: `${60 + (i * 4) % 35}%`,
                top: `${10 + (i * 8) % 80}%`,
                width: 30, height: 30,
                background: `conic-gradient(from ${i * 36}deg, ${accent}15, ${accent2}10, transparent 60%)`,
                borderRadius: "50%",
                filter: "blur(8px)",
                animation: `lsAuraPulse ${5 + i % 3}s ease-in-out ${i * 0.7}s infinite`,
              }} />
            ))}
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="deck-bg" style={{
      position: "fixed", inset: 0, zIndex: 0,
      pointerEvents: "none", overflow: "hidden",
      background: c.bg || "#0d1117",
      transition: "background 0.8s ease",
    }}>
      {/* Ambient floating orbs — deck agnostic */}
      <AmbientOrbs accent={c.accent || "#c9a96e"} accent2={c.accent2 || "#4a6fa5"} />
      {/* Small floating particles — deck agnostic */}
      <Particles accent={c.accent || "#c9a96e"} accent2={c.accent2 || "#4a6fa5"} count={25} />
      {/* Deck-specific elements */}
      {renderBackground()}
      <style>{styleTag}</style>
    </div>
  );
}
