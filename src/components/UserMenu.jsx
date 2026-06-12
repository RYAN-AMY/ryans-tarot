import { useState, useRef, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useLang } from "../contexts/LangContext";
import { zh, en } from "../i18n/translations";
import AuthModal from "./AuthModal";

export default function UserMenu({ accent = "#c9a96e", onShowReview, onShowHistory }) {
  const { user, profile, signOut } = useAuth();
  const { lang } = useLang();
  const t = lang === "zh" ? zh : en;
  const [open, setOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const displayName = profile?.nickname || t.user;

  return (
    <div ref={menuRef} style={{ position: "relative" }}>
      {user ? (
        <button
          onClick={() => setOpen(!open)}
          style={{
            background: "transparent",
            border: `1px solid ${accent}25`,
            color: accent,
            padding: "4px 12px",
            borderRadius: 5,
            cursor: "pointer",
            fontSize: 12,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span style={{
            width: 18, height: 18, borderRadius: "50%",
            background: `${accent}20`, display: "flex",
            alignItems: "center", justifyContent: "center",
            fontSize: 10,
          }}>
            {displayName[0]?.toUpperCase() || "?"}
          </span>
          {displayName}
        </button>
      ) : (
        <button
          onClick={() => setShowAuth(true)}
          style={{
            background: "transparent",
            border: `1px solid ${accent}30`,
            color: `${accent}88`,
            padding: "4px 12px",
            borderRadius: 5,
            cursor: "pointer",
            fontSize: 12,
          }}
        >
          {t.login}
        </button>
      )}

      {open && (
        <div style={{
          position: "absolute", top: "100%", right: 0,
          marginTop: 8, minWidth: 150,
          background: "#1a1a24",
          border: `1px solid ${accent}15`,
          borderRadius: 10,
          boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
          zIndex: 150,
          overflow: "hidden",
        }}>
          <button className="um-item" onClick={() => { setOpen(false); onShowHistory?.(); }}>
            {t.myReadings}
          </button>
          <button className="um-item" onClick={() => { setOpen(false); onShowReview?.(); }}>
            {t.dataCenter}
          </button>
          <div style={{ height: 1, background: `${accent}10`, margin: "4px 0" }} />
          <button className="um-item" onClick={() => { setOpen(false); signOut(); }}>
            {t.logout}
          </button>
          <style>{`
            .um-item {
              display: block; width: 100%; padding: 10px 16px;
              background: none; border: none;
              color: rgba(220,210,190,0.7); font-size: 13px;
              cursor: pointer; text-align: left;
              font-family: inherit; transition: background 0.15s;
            }
            .um-item:hover { background: rgba(255,255,255,0.04); }
          `}</style>
        </div>
      )}

      {showAuth && (
        <AuthModal onClose={() => setShowAuth(false)} />
      )}
    </div>
  );
}
