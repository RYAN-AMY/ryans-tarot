import { useLang } from "../contexts/LangContext";
import { zh, en } from "../i18n/translations";

export default function LangToggle({ accent }) {
  const { lang, toggleLang } = useLang();
  const t = lang === "zh" ? zh : en;
  const c = accent || "#c9a96e";

  return (
    <button
      onClick={toggleLang}
      title={lang === "zh" ? t.switchToEn : t.switchToZh}
      style={{
        background: "transparent",
        border: `1px solid ${c}35`,
        color: `${c}aa`,
        padding: "4px 10px",
        borderRadius: 5,
        cursor: "pointer",
        fontSize: 12,
        fontFamily: "inherit",
        letterSpacing: "0.05em",
        transition: "all 0.2s",
        lineHeight: 1,
      }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = c; e.currentTarget.style.color = c; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = `${c}35`; e.currentTarget.style.color = `${c}aa`; }}
    >
      {t.langLabel}
    </button>
  );
}
