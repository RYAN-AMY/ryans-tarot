import { useState, useRef, useCallback, useEffect, lazy, Suspense } from "react";
import { useAuth } from "./contexts/AuthContext";
import { useLang } from "./contexts/LangContext";
import { zh, en } from "./i18n/translations";
import LangToggle from "./components/LangToggle";
import { saveReading } from "./lib/userStore";
import { useTarotSession } from "./hooks/useTarotSession";
import EntryScreen from "./components/EntryScreen";
import DeckSelector from "./components/DeckSelector";
import UserMenu from "./components/UserMenu";
import { buildPrompt } from "./utils/buildPrompt";

const DeckBackground = lazy(() => import("./components/DeckBackground"));
const SpreadSelector = lazy(() => import("./components/SpreadSelector"));
const ShuffleArea = lazy(() => import("./components/ShuffleArea"));
const ArcSpread = lazy(() => import("./components/ArcSpread"));
const PlacingPhase = lazy(() => import("./components/PlacingPhase"));
const ReviewDashboard = lazy(() => import("./components/ReviewDashboard"));
const ReadingHistory = lazy(() => import("./components/ReadingHistory"));

const interpretationCache = new Map();
const MAX_CACHE_SIZE = 50;

function makeCacheKey(deckId, spreadId, placements, question) {
  const cardKeys = Object.keys(placements).sort().map((posId) => {
    const c = placements[posId];
    return `${c.id}_${c.isReversed ? "r" : "u"}`;
  }).join(",");
  return `${deckId}|${spreadId}|${cardKeys}|${question || ""}`;
}

function QuestionInput({ deckMeta, onSubmit }) {
  const [q, setQ] = useState("");
  const { lang } = useLang();
  const t = lang === "zh" ? zh : en;
  const c = deckMeta?.colors || {};
  const deckName = lang === "en" && deckMeta?.nameEn ? deckMeta.nameEn : deckMeta?.name;

  return (
    <div style={{ maxWidth: 600, margin: "40px auto", textAlign: "center", padding: "0 20px" }}>
      <h2 style={{
        fontFamily: "'Georgia', serif", fontSize: 28, color: "#e8dcc8",
        fontWeight: 400, letterSpacing: "0.1em", margin: "0 0 8px",
      }}>
        {t.yourQuestion}
      </h2>
      <p style={{ color: "rgba(200,180,160,0.5)", fontSize: 14, margin: "0 0 20px" }}>
        {deckName} — {t.questionSub}
      </p>
      <textarea
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={t.questionPlaceholder}
        rows={3}
        style={{
          width: "100%", padding: "16px", borderRadius: 10,
          background: "rgba(0,0,0,0.3)",
          border: `1px solid ${c.accent}40`,
          color: "#e8dcc8", fontSize: 16,
          fontFamily: "inherit", resize: "vertical",
          outline: "none", lineHeight: 1.6,
        }}
        autoFocus
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey && q.trim()) {
            e.preventDefault();
            onSubmit(q.trim());
          }
        }}
      />
      <div style={{ marginTop: 24, display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
        <button className="btn-main" onClick={() => onSubmit(q.trim())}
          style={{
            borderColor: q.trim() ? c.accent : `${c.accent}40`,
            color: q.trim() ? c.accent : `${c.accent}60`,
            opacity: q.trim() ? 1 : 0.6,
          }}
          disabled={!q.trim()}>
          {t.checkSpreads}
        </button>
      </div>
    </div>
  );
}

function DrawingPhase({ session }) {
  const {
    phase, deck, spread, shuffledCards, drawnCards,
    selectCardFromArc, deselectCard, PHASES,
  } = session;
  const { lang } = useLang();
  const t = lang === "zh" ? zh : en;

  if (phase !== PHASES.DRAWING) return null;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", paddingTop: 20 }}>
      <h2 style={{
        fontFamily: "'Georgia', serif", fontSize: 24, color: "#e8dcc8",
        textAlign: "center", fontWeight: 400, letterSpacing: "0.1em", margin: "0 0 4px",
      }}>
        {t.drawTitle}
      </h2>
      <p style={{
        textAlign: "center", color: "rgba(200,180,160,0.5)", fontSize: 14, margin: "0 0 20px",
      }}>
        {t.drawText(spread.cards)}
      </p>
      <ArcSpread
        shuffledCards={shuffledCards}
        drawnCards={drawnCards}
        spreadCards={spread.cards}
        deckMeta={deck}
        onSelectCard={selectCardFromArc}
        onDeselectCard={deselectCard}
      />
    </div>
  );
}

export default function App() {
  const session = useTarotSession();
  const { user } = useAuth();
  const { lang } = useLang();
  const t = lang === "zh" ? zh : en;

  function PhaseFallback() {
    return (
      <div style={{
        display: "flex", justifyContent: "center", alignItems: "center",
        minHeight: 300, color: "rgba(200,180,160,0.3)", fontSize: 14,
      }}>
        {t.loading}
      </div>
    );
  }

  const [selectedCardId, setSelectedCardId] = useState(null);
  const [prefetchedText, setPrefetchedText] = useState(null);
  const [isPrefetching, setIsPrefetching] = useState(false);
  const [prefetchError, setPrefetchError] = useState(null);
  const [showReview, setShowReview] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState(null); // AI 牌阵推荐结果
  const [isLoadingRec, setIsLoadingRec] = useState(false);
  const savedReadingRef = useRef(null);
  const prefetchAbortRef = useRef(null);
  const prefetchTextRef = useRef("");
  const prefetchRafRef = useRef(null);
  const recCacheRef = useRef(new Map()); // 问题→AI推荐缓存
  const {
    phase, mode, deck, spread, question,
    followUpHistory, setFollowUpHistory,
    dailyFortune, fullReading,
    selectDeck, submitQuestion, selectSpread,
    startShuffle, stopShuffle,
    goBack, reset, PHASES,
  } = session;

  // 预取 AI 牌阵推荐：提交问题时立即触发，结果缓存
  const prefetchRecommend = useCallback((q) => {
    if (!q?.trim()) return;
    const cacheKey = q.trim();
    if (recCacheRef.current.has(cacheKey)) {
      setAiRecommendations(recCacheRef.current.get(cacheKey));
      return;
    }
    setIsLoadingRec(true);
    setAiRecommendations(null);
    fetch("/api/recommend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: cacheKey }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.recommendations?.length >= 2) {
          recCacheRef.current.set(cacheKey, data.recommendations);
          setAiRecommendations(data.recommendations);
        }
      })
      .catch(() => { /* 静默失败，前端有本地打分兜底 */ })
      .finally(() => setIsLoadingRec(false));
  }, []);

  // 包装 submitQuestion：先提交问题，同时触发 AI 推荐预取
  const handleSubmitQuestion = useCallback((q) => {
    submitQuestion(q);
    prefetchRecommend(q);
  }, [submitQuestion, prefetchRecommend]);

  const startPrefetch = useCallback(() => {
    if (!spread || !deck || isPrefetching) return;

    const cacheKey = makeCacheKey(deck.id, spread.id, session.placements, question);
    const cached = interpretationCache.get(cacheKey);
    if (cached) {
      setPrefetchedText(cached);
      return;
    }

    setIsPrefetching(true);
    setPrefetchError(null);
    setPrefetchedText(null);

    const sharedMethodology = [
      "## 核心方法论",
      "1. 塔罗是镜子而非判决书——你的使命是帮助求问者看见自己，而不是预言命运。永远用'趋势'取代'预言'。",
      "2. 每张牌在牌阵中的位置决定了它的解读权重——同一张牌在'过去'位置和'未来'位置的解读重心完全不同。请严格遵循每张牌附带的'解读位置权重指引'。",
      "3. 逆位不是坏牌——它是能量的内转、延迟或被压抑的表达。请帮助求问者看到逆位在当前处境中的建设性意义。",
      "4. 画面象征符号是通往深层含义的钥匙——引用牌面中的具体意象（人物姿态、自然元素、色彩、动作）来支撑你的解读。",
      "5. 分析牌与牌之间的关系——哪些牌在呼应？哪些在冲突？有没有一条清晰的叙事弧线从第一张牌指向最后一张？",
      "6. 始终将解读与求问者的具体问题建立连接。如果没有具体问题，则连接到最常见的生活场景。",
      "7. 行动建议既要具体可执行，也要温和不强迫——你是智慧的朋友，不是命令的将军。",
    ].join("\n");
    const systemPrompt = (deck.interpretationPersona || "你是一位经验丰富的塔罗解读师。")
      + "\n\n" + sharedMethodology;
    const userMessage = buildPrompt(question, spread, session.placements, deck);

    const controller = new AbortController();
    prefetchAbortRef.current = controller;

    fetch("/api/interpret", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ systemPrompt, userMessage, cardCount: spread.cards }),
      signal: controller.signal,
    }).then(async (res) => {
      if (!res.ok) return;
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      prefetchTextRef.current = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;
            try {
              const parsed = JSON.parse(data);
              if (parsed.text) {
                prefetchTextRef.current += parsed.text;
                if (!prefetchRafRef.current) {
                  prefetchRafRef.current = requestAnimationFrame(() => {
                    setPrefetchedText(prefetchTextRef.current);
                    prefetchRafRef.current = null;
                  });
                }
              }
            } catch { /* skip */ }
          }
        }
      }
      if (prefetchRafRef.current) {
        cancelAnimationFrame(prefetchRafRef.current);
        prefetchRafRef.current = null;
      }
      const finalText = prefetchTextRef.current;
      setPrefetchedText(finalText);
      if (finalText) {
        interpretationCache.set(cacheKey, finalText);
        if (interpretationCache.size > MAX_CACHE_SIZE) {
          const firstKey = interpretationCache.keys().next().value;
          interpretationCache.delete(firstKey);
        }
      }
    }).catch((err) => {
      if (err.name !== "AbortError") {
        console.error("Prefetch error:", err);
        setPrefetchError(err.message || "{t.fetchError}");
      }
    }).finally(() => {
      setIsPrefetching(false);
    });
  }, [spread, deck, question, session.placements, isPrefetching]);

  useEffect(() => {
    if (phase !== PHASES.REVEALED && phase !== PHASES.INTERPRETATION) {
      setPrefetchedText(null);
      setPrefetchError(null);
    }
    if (phase !== PHASES.PLACING && phase !== PHASES.REVEALED) {
      setSelectedCardId(null);
    }
  }, [phase]);

  // Save reading to local store
  useEffect(() => {
    if (!user || !prefetchedText || isPrefetching || phase !== PHASES.INTERPRETATION) return;
    if (!spread || !deck) return;
    const key = `${deck.id}|${spread.id}|${prefetchedText.slice(0, 40)}`;
    if (savedReadingRef.current === key) return;
    savedReadingRef.current = key;

    saveReading({
      user_id: user.id,
      deck_id: deck.id,
      deck_name: deck.name,
      spread_id: spread.id,
      spread_name: spread.name,
      question: question || null,
      cards: spread.positions.map((pos) => {
        const card = session.placements[pos.id];
        if (!card) return null;
        return {
          id: card.id, nameZh: card.nameZh, nameEn: card.nameEn,
          position: pos.name, isReversed: card.isReversed,
        };
      }).filter(Boolean),
      interpretation_text: prefetchedText,
    });
  }, [phase, prefetchedText, isPrefetching, user]);

  const c = deck?.colors || { bg: "#0a0a14", accent: "#c9a96e", text: "#e6e1d8" };
  const filterCSS = deck?.imageFilter
    ? `.filter-deck.card-face-img { filter: ${deck.imageFilter} !important; }` : "";

  return (
    <div style={{
      minHeight: "100vh", color: c.text,
      transition: "color 0.6s ease",
      fontFamily: "'Hiragino Sans GB','PingFang SC','Microsoft YaHei',sans-serif",
      position: "relative",
    }}>
      {filterCSS && <style>{filterCSS}</style>}

      {/* ENTRY */}
      {phase === PHASES.ENTRY && (
        <EntryScreen onDailyFortune={dailyFortune} onFullReading={fullReading} />
      )}

      {/* Animated background */}
      {phase !== PHASES.ENTRY && deck && (
        <Suspense fallback={null}><DeckBackground deckMeta={deck} /></Suspense>
      )}
      {phase !== PHASES.ENTRY && !deck && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
          background: "#0d1117", transition: "background 0.6s ease",
        }}>
          {Array.from({ length: 30 }, (_, i) => (
            <div key={`def-pt-${i}`} style={{
              position: "absolute",
              left: `${3 + (i * 37 + 13) % 94}%`,
              top: `${2 + (i * 23 + 7) % 95}%`,
              width: i % 6 === 0 ? 3.5 : i % 3 === 0 ? 2 : 1.5,
              height: i % 6 === 0 ? 3.5 : i % 3 === 0 ? 2 : 1.5,
              borderRadius: "50%",
              background: i % 3 === 0 ? "#c9a96e" : i % 4 === 0 ? "#4a6fa5" : "#e8dcc8",
              boxShadow: i % 6 === 0 ? "0 0 6px #c9a96e80" : "none",
              animation: `defaultFloat ${3 + i % 5}s ease-in-out ${i * 0.3}s infinite`,
              opacity: 0,
            }} />
          ))}
          {Array.from({ length: 3 }, (_, i) => (
            <div key={`def-orb-${i}`} style={{
              position: "absolute",
              left: `${20 + i * 28}%`,
              top: `${25 + i * 20}%`,
              width: 100 + i * 40,
              height: 100 + i * 40,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${i % 2 === 0 ? "#c9a96e10" : "#4a6fa50c"}, transparent 70%)`,
              animation: `defaultOrb ${12 + i * 6}s ease-in-out ${i * 2}s infinite`,
            }} />
          ))}
          <style>{`
            @keyframes defaultFloat {
              0%, 100% { opacity: 0.1; transform: translateY(0) scale(1); }
              50% { opacity: 0.6; transform: translateY(-16px) scale(1.5); }
            }
            @keyframes defaultOrb {
              0%, 100% { transform: translate(0, 0) scale(1); }
              25% { transform: translate(1.5vw, -2vh) scale(1.1); }
              50% { transform: translate(-1vw, -0.5vh) scale(0.95); }
              75% { transform: translate(-1.5vw, 1.5vh) scale(1.05); }
            }
          `}</style>
        </div>
      )}

      {/* HEADER */}
      {phase !== PHASES.ENTRY && (
        <header style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "10px 20px",
          borderBottom: `1px solid ${c.accent}18`,
          position: "sticky", top: 0, zIndex: 101,
          backdropFilter: "blur(10px)", background: `${c.bg}dd`,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 150 }}>
            {phase !== PHASES.DECK_SELECT && (
              <button onClick={goBack} style={{
                background: "transparent", border: `1px solid ${c.accent}35`,
                color: `${c.accent}aa`, padding: "4px 12px", borderRadius: 5,
                cursor: "pointer", fontSize: 12,
              }}>{t.back}</button>
            )}
            <UserMenu
              accent={c.accent}
              onShowReview={() => { setShowReview(true); setShowHistory(false); }}
              onShowHistory={() => { setShowHistory(true); setShowReview(false); }}
            />
          </div>
          <div style={{ textAlign: "center" }}>
            <span style={{
              fontFamily: "'Georgia',serif", fontSize: 17, color: "#e8dcc8", letterSpacing: "0.08em",
            }}>{t.brand}</span>
            {mode === "fortune" && <span style={{ color: c.accent, fontSize: 12 }}> · {t.fortuneMode}</span>}
            {deck && mode !== "fortune" && <span style={{ color: c.accent, fontSize: 12 }}> · {lang === "en" && deck.nameEn ? deck.nameEn : deck.name}</span>}
            {spread && <span style={{ color: `${c.text}70`, fontSize: 12 }}> · {lang === "en" && spread.nameEn ? spread.nameEn : spread.name}</span>}
          </div>
          <div style={{ width: 90, textAlign: "right", display: "flex", gap: 6, justifyContent: "flex-end", alignItems: "center" }}>
            <LangToggle accent={c.accent} />
            <button onClick={reset} style={{
              background: "transparent", border: `1px solid ${c.accent}25`,
              color: `${c.accent}80`, padding: "4px 12px", borderRadius: 5,
              cursor: "pointer", fontSize: 12,
            }}>{t.restart}</button>
          </div>
        </header>
      )}

      {/* MAIN CONTENT */}
      {showHistory ? (
        <main style={{ padding: "20px 16px 40px", position: "relative", zIndex: 1 }}>
          <Suspense fallback={<PhaseFallback />}>
            <ReadingHistory onClose={() => setShowHistory(false)} />
          </Suspense>
        </main>
      ) : showReview ? (
        <main style={{ padding: "20px 16px 40px", position: "relative", zIndex: 1 }}>
          <Suspense fallback={<PhaseFallback />}>
            <ReviewDashboard onClose={() => setShowReview(false)} user={user} />
          </Suspense>
        </main>
      ) : phase !== PHASES.ENTRY && (
        <main style={{ padding: "20px 16px 40px", position: "relative", zIndex: 1 }}>
          {/* DECK SELECT */}
          {phase === PHASES.DECK_SELECT && <DeckSelector onSelect={selectDeck} />}

          {/* QUESTION (reading path only) */}
          {phase === PHASES.QUESTION && deck && (
            <QuestionInput deckMeta={deck}
              onSubmit={handleSubmitQuestion} />
          )}

          {/* SPREAD SELECT (reading path, after question) */}
          {phase === PHASES.SPREAD_SELECT && deck && (
            <Suspense fallback={<PhaseFallback />}>
              <SpreadSelector deckMeta={deck} onSelect={selectSpread}
                onBack={goBack} question={question}
                aiRecommendations={aiRecommendations}
                isLoadingRec={isLoadingRec} />
            </Suspense>
          )}

          {/* SHUFFLING */}
          {phase === PHASES.SHUFFLING && deck && spread && (
            <Suspense fallback={<PhaseFallback />}>
              <ShuffleArea
                deckMeta={deck} spread={spread}
                isShuffling={session.isShuffling}
                onStartShuffle={startShuffle}
                onStopShuffle={stopShuffle}
                question={question}
              />
            </Suspense>
          )}

          {/* DRAWING */}
          <DrawingPhase session={session} />

          {/* PLACING / REVEALED / INTERPRETATION */}
          <Suspense fallback={<PhaseFallback />}>
            <PlacingPhase session={session} themeColors={c}
              selectedCardId={selectedCardId} setSelectedCardId={setSelectedCardId}
              prefetchedText={prefetchedText} isPrefetching={isPrefetching}
              prefetchError={prefetchError}
              startPrefetch={startPrefetch}
              followUpHistory={followUpHistory}
              onUpdateFollowUpHistory={setFollowUpHistory}
              user={user} />
          </Suspense>

          {/* Disclaimer */}
          <div style={{
            textAlign: "center", padding: "40px 20px 10px",
            color: "rgba(200,180,160,0.25)", fontSize: 11,
            letterSpacing: "0.05em",
          }}>
            {t.disclaimer}
          </div>
        </main>
      )}

      <style>{`
        .btn-main {
          padding: 14px 48px; border: 1px solid; background: transparent;
          font-size: 18px; font-family: 'Georgia',serif; border-radius: 8px;
          cursor: pointer; letter-spacing: 0.12em; transition: all 0.3s;
        }
        .btn-main:hover { background: currentColor; color: #0a0a14 !important; }
        .btn-secondary {
          padding: 12px 32px; border: 1px solid; background: transparent;
          font-size: 15px; font-family: inherit; border-radius: 8px;
          cursor: pointer; letter-spacing: 0.06em; transition: all 0.2s;
        }
        .btn-secondary:hover { background: rgba(255,255,255,0.05); }
        .selector-page {
          max-width: 1000px; margin: 0 auto; padding: 40px 20px; text-align: center;
        }
        .selector-title {
          font-family: 'Georgia', serif; font-size: 32px; color: #e8dcc8;
          margin: 0 0 8px; font-weight: 400; letter-spacing: 0.1em;
        }
        .selector-sub {
          color: rgba(200,180,160,0.6); font-size: 14px; margin: 0 0 40px;
        }
      `}</style>
    </div>
  );
}
