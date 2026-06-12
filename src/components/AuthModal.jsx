import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useLang } from "../contexts/LangContext";
import { zh, en } from "../i18n/translations";

export default function AuthModal({ onClose }) {
  const { login } = useAuth();
  const { lang } = useLang();
  const t = lang === "zh" ? zh : en;
  const [nickname, setNickname] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    const name = nickname.trim();
    if (!name) return;
    login(name);
    onClose();
  }

  return (
    <div className="auth-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="auth-modal">
        <button className="auth-close" onClick={onClose}>✕</button>

        <h2 className="auth-title">{t.yourName}</h2>
        <p className="auth-sub">{t.nameHint}</p>

        <form onSubmit={handleSubmit}>
          <input
            className="auth-input"
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder={t.nickname}
            maxLength={20}
            autoFocus
          />
          <button className="auth-submit" type="submit" disabled={!nickname.trim()}>
            {t.enter}
          </button>
        </form>

        <button className="auth-skip" type="button" onClick={onClose}>{t.skipLogin}</button>

        <p className="auth-footnote">{t.localOnlyHint}</p>
      </div>

      <style>{`
        .auth-overlay {
          position: fixed; inset: 0; z-index: 200;
          background: rgba(0,0,0,0.6);
          backdrop-filter: blur(6px);
          display: flex; align-items: center; justify-content: center;
          padding: 20px;
        }
        .auth-modal {
          position: relative;
          width: 100%; max-width: 360px;
          background: #1a1a24;
          border: 1px solid rgba(200,160,100,0.15);
          border-radius: 16px;
          padding: 36px 28px 28px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.5);
        }
        .auth-close {
          position: absolute; top: 12px; right: 14px;
          background: none; border: none;
          color: rgba(200,180,160,0.4);
          font-size: 18px; cursor: pointer;
          line-height: 1;
        }
        .auth-close:hover { color: rgba(200,180,160,0.8); }
        .auth-title {
          font-family: 'Georgia', serif;
          font-size: 24px; color: #e8dcc8;
          text-align: center; margin: 0 0 4px;
          font-weight: 400; letter-spacing: 0.08em;
        }
        .auth-sub {
          text-align: center; color: rgba(200,180,160,0.4);
          font-size: 13px; margin: 0 0 24px;
        }
        .auth-input {
          width: 100%; padding: 12px 14px;
          margin-bottom: 16px; border-radius: 8px;
          background: rgba(0,0,0,0.3);
          border: 1px solid rgba(200,160,100,0.2);
          color: #e8dcc8; font-size: 15px;
          outline: none; font-family: inherit;
          box-sizing: border-box; text-align: center;
        }
        .auth-input:focus { border-color: rgba(200,160,100,0.5); }
        .auth-submit {
          width: 100%; padding: 12px;
          border: 1px solid #c9a96e; border-radius: 8px;
          background: transparent; color: #c9a96e;
          font-size: 15px; cursor: pointer;
          font-family: inherit; letter-spacing: 0.05em;
          transition: all 0.2s;
        }
        .auth-submit:hover:not(:disabled) { background: #c9a96e; color: #0a0a14; }
        .auth-submit:disabled { opacity: 0.3; cursor: default; }
        .auth-skip {
          width: 100%; padding: 10px;
          margin-top: 4px;
          background: none; border: none;
          color: rgba(200,180,160,0.35); font-size: 13px;
          cursor: pointer; font-family: inherit;
          transition: color 0.2s;
        }
        .auth-skip:hover { color: rgba(200,180,160,0.7); }
        .auth-footnote {
          text-align: center; margin-top: 20px;
          color: rgba(200,180,160,0.25); font-size: 11px;
        }
      `}</style>
    </div>
  );
}
