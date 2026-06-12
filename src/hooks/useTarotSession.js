import { useState, useCallback } from "react";
import { allCards } from "../data/cards";
import { shuffleDeck } from "../utils/shuffle";
import { getSpread } from "../data/spreads";

const PHASES = {
  ENTRY: "entry",
  FORTUNE_SELECT: "fortune_select",
  DECK_SELECT: "deck_select",
  QUESTION: "question",
  SPREAD_SELECT: "spread_select",
  SHUFFLING: "shuffling",
  DRAWING: "drawing",
  PLACING: "placing",
  REVEALED: "revealed",
  INTERPRETATION: "interpretation",
};

export function useTarotSession() {
  const [phase, setPhase] = useState(PHASES.ENTRY);
  const [mode, setMode] = useState(null); // "fortune" | "reading"
  const [deck, setDeck] = useState(null);
  const [spread, setSpread] = useState(null);
  const [question, setQuestion] = useState("");
  const [shuffledCards, setShuffledCards] = useState([]);
  const [drawnCards, setDrawnCards] = useState([]);
  const [placements, setPlacements] = useState({});
  const [revealed, setRevealed] = useState({});
  const [isShuffling, setIsShuffling] = useState(false);
  const [followUpHistory, setFollowUpHistory] = useState([]);

  // ─── 入口：两条路线 ─────────────────────────────────

  const dailyFortune = useCallback(() => {
    setMode("fortune");
    setSpread(getSpread("single"));
    setPhase(PHASES.DECK_SELECT);
  }, []);

  const fullReading = useCallback(() => {
    setMode("reading");
    setPhase(PHASES.DECK_SELECT);
  }, []);

  // ─── 选牌组 ─────────────────────────────────────────

  const selectDeck = useCallback((deckMeta) => {
    setDeck(deckMeta);
    if (mode === "fortune") {
      // 运势路线：选完牌组直接洗牌
      setPhase(PHASES.SHUFFLING);
    } else {
      // 正式路线：进入提问
      setPhase(PHASES.QUESTION);
    }
  }, [mode]);

  // ─── 提问 ───────────────────────────────────────────

  const submitQuestion = useCallback((q) => {
    setQuestion(q);
    setPhase(PHASES.SPREAD_SELECT);
  }, []);

  // ─── 选牌阵 ─────────────────────────────────────────

  const selectSpread = useCallback((spreadDef) => {
    setSpread(spreadDef);
    setPhase(PHASES.SHUFFLING);
  }, []);

  // ─── 洗牌 ───────────────────────────────────────────

  const startShuffle = useCallback(() => {
    setIsShuffling(true);
  }, []);

  const stopShuffle = useCallback(() => {
    setIsShuffling(false);
    const shuffled = shuffleDeck(allCards);
    setShuffledCards(shuffled);
    setFollowUpHistory([]);
    setPhase(PHASES.DRAWING);
  }, []);

  // ─── 抽牌 ───────────────────────────────────────────

  const selectCardFromArc = useCallback((cardId) => {
    if (!spread) return;
    if (drawnCards.find((c) => c.id === cardId)) return;
    const card = shuffledCards.find((c) => c.id === cardId);
    if (!card) return;

    const newDrawn = [...drawnCards, card];
    setDrawnCards(newDrawn);
    if (newDrawn.length >= spread.cards) {
      if (spread.cards === 1) {
        const posId = spread.positions[0].id;
        setPlacements({ [posId]: card });
        const allRevealed = { [posId]: true };
        setRevealed(allRevealed);
        setPhase(PHASES.INTERPRETATION);
      } else {
        setPhase(PHASES.PLACING);
      }
    }
  }, [shuffledCards, drawnCards, spread]);

  const deselectCard = useCallback((cardId) => {
    setDrawnCards((prev) => prev.filter((c) => c.id !== cardId));
  }, []);

  // ─── 放置 ───────────────────────────────────────────

  const placeCard = useCallback((cardId, positionId) => {
    setPlacements((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((key) => {
        if (next[key]?.id === cardId) delete next[key];
      });
      next[positionId] = drawnCards.find((c) => c.id === cardId);
      return next;
    });
  }, [drawnCards]);

  const removePlacement = useCallback((positionId) => {
    setPlacements((prev) => {
      const next = { ...prev };
      delete next[positionId];
      return next;
    });
  }, []);

  const allPlaced = spread && Object.keys(placements).length === spread.cards;

  const revealAll = useCallback(() => {
    if (!spread || !allPlaced) return;
    const allRevealed = {};
    spread.positions.forEach((pos) => {
      allRevealed[pos.id] = true;
    });
    setRevealed(allRevealed);
    setPhase(PHASES.REVEALED);
  }, [spread, allPlaced]);

  const showInterpretation = useCallback(() => {
    setPhase(PHASES.INTERPRETATION);
  }, []);

  // ─── 重置 & 返回 ────────────────────────────────────

  const reset = useCallback(() => {
    setPhase(PHASES.ENTRY);
    setMode(null);
    setDeck(null);
    setSpread(null);
    setQuestion("");
    setShuffledCards([]);
    setDrawnCards([]);
    setPlacements({});
    setRevealed({});
    setIsShuffling(false);
    setFollowUpHistory([]);
  }, []);

  const goBack = useCallback(() => {
    if (phase === PHASES.DECK_SELECT) {
      // 回到入口
      setMode(null);
      setDeck(null);
      setSpread(null);
      setPhase(PHASES.ENTRY);
    } else if (phase === PHASES.QUESTION) {
      setDeck(null);
      setPhase(PHASES.DECK_SELECT);
    } else if (phase === PHASES.SPREAD_SELECT) {
      setQuestion("");
      setPhase(PHASES.QUESTION);
    } else if (phase === PHASES.SHUFFLING) {
      if (mode === "fortune") {
        setDeck(null);
        setPhase(PHASES.DECK_SELECT);
      } else {
        setSpread(null);
        setPhase(PHASES.SPREAD_SELECT);
      }
    } else if (phase === PHASES.DRAWING) {
      setShuffledCards([]);
      setDrawnCards([]);
      setPhase(PHASES.SHUFFLING);
    } else if (phase === PHASES.PLACING) {
      setShuffledCards([]);
      setDrawnCards([]);
      setPlacements({});
      setPhase(PHASES.SHUFFLING);
    } else if (phase === PHASES.REVEALED || phase === PHASES.INTERPRETATION) {
      setRevealed({});
      setFollowUpHistory([]);
      if (spread?.cards === 1) {
        setDrawnCards([]);
        setPlacements({});
        setPhase(PHASES.DRAWING);
      } else {
        setPhase(PHASES.PLACING);
      }
    }
  }, [phase, mode, spread]);

  return {
    phase, mode, deck, spread, question,
    shuffledCards, drawnCards, placements, revealed,
    isShuffling, allPlaced,
    followUpHistory, setFollowUpHistory,
    dailyFortune, fullReading,
    selectDeck, submitQuestion, selectSpread,
    startShuffle, stopShuffle,
    selectCardFromArc, deselectCard,
    placeCard, removePlacement,
    revealAll, showInterpretation,
    reset, goBack, PHASES,
  };
}
