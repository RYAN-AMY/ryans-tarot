import { useState, useCallback } from "react";
import { allCards } from "../data/cards";
import { shuffleDeck } from "../utils/shuffle";

const PHASES = {
  ENTRY: "entry",
  DECK_SELECT: "deck_select",
  SPREAD_SELECT: "spread_select",
  QUESTION: "question",
  SHUFFLING: "shuffling",
  DRAWING: "drawing",
  PLACING: "placing",
  REVEALED: "revealed",
  INTERPRETATION: "interpretation",
};

export function useTarotSession() {
  const [phase, setPhase] = useState(PHASES.ENTRY);
  const [deck, setDeck] = useState(null);
  const [spread, setSpread] = useState(null);
  const [question, setQuestion] = useState("");
  const [shuffledCards, setShuffledCards] = useState([]);
  const [drawnCards, setDrawnCards] = useState([]);
  const [placements, setPlacements] = useState({});
  const [revealed, setRevealed] = useState({});
  const [isShuffling, setIsShuffling] = useState(false);

  const enterApp = useCallback(() => {
    setPhase(PHASES.DECK_SELECT);
  }, []);

  const selectDeck = useCallback((deckMeta) => {
    setDeck(deckMeta);
    setPhase(PHASES.SPREAD_SELECT);
  }, []);

  const selectSpread = useCallback((spreadDef) => {
    setSpread(spreadDef);
    setPhase(PHASES.QUESTION);
  }, []);

  const submitQuestion = useCallback((q) => {
    setQuestion(q);
    setPhase(PHASES.SHUFFLING);
  }, []);

  const startShuffle = useCallback(() => {
    setIsShuffling(true);
  }, []);

  const stopShuffle = useCallback(() => {
    setIsShuffling(false);
    const shuffled = shuffleDeck(allCards);
    setShuffledCards(shuffled);
    setPhase(PHASES.DRAWING);
  }, []);

  // User taps a card from the arc spread to select it
  const selectCardFromArc = useCallback((cardId) => {
    if (!spread) return;
    // Don't select the same card twice
    if (drawnCards.find((c) => c.id === cardId)) return;
    const card = shuffledCards.find((c) => c.id === cardId);
    if (!card) return;

    const newDrawn = [...drawnCards, card];
    setDrawnCards(newDrawn);
    if (newDrawn.length >= spread.cards) {
      if (spread.cards === 1) {
        // Single card: auto-place, reveal, skip straight to interpretation
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

  // Remove a card from drawn cards (deselect from arc)
  const deselectCard = useCallback((cardId) => {
    setDrawnCards((prev) => prev.filter((c) => c.id !== cardId));
  }, []);

  const placeCard = useCallback((cardId, positionId) => {
    setPlacements((prev) => {
      const next = { ...prev };
      // Remove this card from any other position
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

  const reset = useCallback(() => {
    setPhase(PHASES.DECK_SELECT);
    setDeck(null);
    setSpread(null);
    setQuestion("");
    setShuffledCards([]);
    setDrawnCards([]);
    setPlacements({});
    setRevealed({});
    setIsShuffling(false);
  }, []);

  const goBack = useCallback(() => {
    if (phase === PHASES.SPREAD_SELECT) {
      setDeck(null);
      setPhase(PHASES.DECK_SELECT);
    } else if (phase === PHASES.QUESTION) {
      setSpread(null);
      setPhase(PHASES.SPREAD_SELECT);
    } else if (phase === PHASES.SHUFFLING) {
      setQuestion("");
      setPhase(PHASES.QUESTION);
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
      if (spread?.cards === 1) {
        setDrawnCards([]);
        setPlacements({});
        setPhase(PHASES.DRAWING);
      } else {
        setPhase(PHASES.PLACING);
      }
    }
  }, [phase]);

  return {
    phase, deck, spread, question,
    shuffledCards, drawnCards, placements, revealed,
    isShuffling, allPlaced,
    enterApp, selectDeck, selectSpread, submitQuestion,
    startShuffle, stopShuffle,
    selectCardFromArc, deselectCard,
    placeCard, removePlacement,
    revealAll, showInterpretation,
    reset, goBack, PHASES,
  };
}
