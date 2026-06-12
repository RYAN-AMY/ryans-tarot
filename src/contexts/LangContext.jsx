import { createContext, useContext, useState, useCallback } from "react";

const LangContext = createContext();

export function LangProvider({ children }) {
  const [lang, setLang] = useState("zh");

  const toggleLang = useCallback(() => {
    setLang((prev) => (prev === "zh" ? "en" : "zh"));
  }, []);

  return (
    <LangContext.Provider value={{ lang, toggleLang }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
