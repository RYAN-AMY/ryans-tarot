import { useState, useEffect } from "react";

function Star({ x, y, size, delay, duration }) {
  return (
    <div
      style={{
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        width: size,
        height: size,
        borderRadius: "50%",
        background: "rgba(255,255,240,0.8)",
        boxShadow: `0 0 ${size * 3}px ${size}px rgba(200,180,255,0.4)`,
        animation: `twinkle ${duration}s ${delay}s ease-in-out infinite`,
      }}
    />
  );
}

export default function EntryScreen({ onEnter }) {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [stars] = useState(() =>
    Array.from({ length: 60 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2.5 + 0.8,
      delay: Math.random() * 4,
      duration: Math.random() * 3 + 2,
    }))
  );

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 300);
    const handleKey = (e) => {
      if (e.key === "Enter") {
        setExiting(true);
        setTimeout(onEnter, 800);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", handleKey);
    };
  }, [onEnter]);

  return (
    <div
      className={`entry-screen ${exiting ? "entry-exit" : ""}`}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "radial-gradient(ellipse at center, #1a1030 0%, #0a0a14 70%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        transition: "opacity 0.8s ease, transform 0.8s ease",
        opacity: exiting ? 0 : 1,
        transform: exiting ? "scale(1.05)" : "scale(1)",
      }}
    >
      {/* Stars */}
      {stars.map((s, i) => (
        <Star key={i} {...s} />
      ))}

      {/* Central glow */}
      <div
        style={{
          position: "absolute",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(120,80,180,0.15) 0%, transparent 70%)",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          opacity: visible ? 1 : 0,
          transition: "opacity 2s ease",
        }}
      />

      {/* Title */}
      <div
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(30px)",
          transition: "opacity 1.5s ease 0.5s, transform 1.5s ease 0.5s",
          textAlign: "center",
          zIndex: 1,
        }}
      >
        <h1
          style={{
            fontFamily: "'Georgia', 'Times New Roman', serif",
            fontSize: "clamp(36px, 6vw, 72px)",
            color: "#e8dcc8",
            fontWeight: 400,
            letterSpacing: "0.15em",
            margin: 0,
            textShadow: "0 0 60px rgba(200,160,100,0.3)",
          }}
        >
          RYAN's Tarot
        </h1>
        <p
          style={{
            fontFamily: "'Georgia', serif",
            fontSize: "clamp(14px, 2vw, 20px)",
            color: "rgba(200,180,160,0.7)",
            marginTop: 16,
            letterSpacing: "0.3em",
            animation: `float 3s ease-in-out infinite`,
          }}
        >
          探索命运之轮
        </p>
      </div>

      {/* Enter prompt */}
      <div
        style={{
          position: "absolute",
          bottom: "12%",
          opacity: visible ? 1 : 0,
          transition: "opacity 1s ease 1.5s",
          zIndex: 1,
        }}
      >
        <p
          style={{
            color: "rgba(200,180,160,0.6)",
            fontSize: 14,
            letterSpacing: "0.2em",
            animation: `pulse 2s ease-in-out infinite`,
          }}
        >
          按下 Enter 开启旅程
        </p>
      </div>

      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.8); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.9; }
        }
      `}</style>
    </div>
  );
}
