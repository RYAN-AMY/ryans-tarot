import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getReadings } from "../lib/userStore";

export default function ReadingHistory({ onClose }) {
  const { user } = useAuth();
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    setReadings(getReadings());
    setLoading(false);
  }, [user]);

  if (!user) {
    return (
      <div className="rh-container">
        <h2 className="rh-title">我的解读记录</h2>
        <p className="rh-empty">请先登录以查看你的解读记录</p>
        <style>{rhStyles}</style>
      </div>
    );
  }

  return (
    <div className="rh-container">
      <div className="rh-header">
        <h2 className="rh-title">我的解读记录</h2>
        {onClose && (
          <button className="rh-close" onClick={onClose}>✕</button>
        )}
      </div>

      {loading && readings.length === 0 && (
        <div className="rh-loading">
          {[1, 2, 3].map((i) => <div key={i} className="rh-skeleton" />)}
        </div>
      )}

      {!loading && readings.length === 0 && (
        <p className="rh-empty">还没有进行过塔罗解读，去抽一张牌吧 ✦</p>
      )}

      <div className="rh-list">
        {readings.map((r) => (
          <div key={r.id} className="rh-card" onClick={() => setExpanded(expanded === r.id ? null : r.id)}>
            <div className="rh-card-header">
              <div>
                <span className="rh-card-deck">{r.deck_name}</span>
                <span className="rh-card-spread">{r.spread_name}</span>
              </div>
              <span className="rh-card-date">
                {new Date(r.createdAt).toLocaleDateString("zh-CN")}
              </span>
            </div>
            {r.question && <p className="rh-card-question">"{r.question}"</p>}
            {Array.isArray(r.cards) && (
              <div className="rh-card-cards">
                {r.cards.slice(0, 6).map((c, i) => (
                  <span key={i} className={`rh-card-tag ${c.isReversed ? "reversed" : ""}`}>
                    {c.position}: {c.nameZh}{c.isReversed ? " 逆" : ""}
                  </span>
                ))}
              </div>
            )}
            {!expanded && r.interpretation_text && (
              <p className="rh-card-preview">{r.interpretation_text.slice(0, 120)}...</p>
            )}
            {expanded === r.id && (
              <div className="rh-card-full">
                {r.interpretation_text.split("\n").map((line, j) => (
                  line.trim() === "" ? <br key={j} /> : <p key={j}>{line}</p>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <style>{rhStyles}</style>
    </div>
  );
}

const rhStyles = `
  .rh-container { max-width: 700px; margin: 0 auto; padding: 20px 16px 40px; }
  .rh-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
  .rh-title {
    font-family: 'Georgia', serif; font-size: 24px; color: #e8dcc8;
    margin: 0; font-weight: 400; letter-spacing: 0.08em;
  }
  .rh-close {
    background: none; border: 1px solid rgba(200,180,160,0.2);
    color: rgba(200,180,160,0.5); font-size: 16px;
    width: 32px; height: 32px; border-radius: 50%;
    cursor: pointer; display: flex; align-items: center; justify-content: center;
  }
  .rh-empty { text-align: center; color: rgba(200,180,160,0.4); font-size: 14px; padding: 60px 0; }
  .rh-loading { display: flex; flex-direction: column; gap: 12px; }
  .rh-skeleton {
    height: 80px; border-radius: 10px;
    background: linear-gradient(90deg, rgba(255,255,255,0.02), rgba(255,255,255,0.05), rgba(255,255,255,0.02));
    animation: shimmer 1.5s infinite;
  }
  @keyframes shimmer { 0% { opacity: 0.5; } 50% { opacity: 1; } 100% { opacity: 0.5; } }
  .rh-list { display: flex; flex-direction: column; gap: 12px; }
  .rh-card {
    padding: 16px 20px;
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(200,160,100,0.08);
    border-radius: 12px;
    cursor: pointer;
    transition: border-color 0.2s;
  }
  .rh-card:hover { border-color: rgba(200,160,100,0.2); }
  .rh-card-header {
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 6px;
  }
  .rh-card-deck { color: #c9a96e; font-size: 14px; font-weight: 500; margin-right: 8px; }
  .rh-card-spread { color: rgba(200,180,160,0.4); font-size: 12px; }
  .rh-card-date { color: rgba(200,180,160,0.3); font-size: 12px; }
  .rh-card-question {
    color: rgba(200,180,160,0.6); font-size: 13px;
    font-style: italic; margin: 4px 0 8px;
  }
  .rh-card-cards { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 8px; }
  .rh-card-tag {
    padding: 2px 8px; border-radius: 4px;
    background: rgba(200,160,100,0.08);
    color: rgba(200,180,160,0.6); font-size: 11px;
    border: 1px solid rgba(200,160,100,0.12);
  }
  .rh-card-tag.reversed {
    background: rgba(180,100,60,0.1);
    border-color: rgba(180,100,60,0.2);
    color: #d4a080;
  }
  .rh-card-preview { color: rgba(200,180,160,0.4); font-size: 13px; margin: 6px 0 0; line-height: 1.6; }
  .rh-card-full {
    margin-top: 12px; padding-top: 12px;
    border-top: 1px solid rgba(200,160,100,0.08);
    color: rgba(220,210,190,0.8); font-size: 14px; line-height: 2;
  }
  .rh-card-full p { margin: 0 0 4px; }
`;
